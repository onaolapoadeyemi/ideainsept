import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { config, errorResponse, json, supabaseAdmin } from "./_shared";
import { AppError } from "../../src/shared/errors/AppError";

function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id || "";
}

async function revokeEntitlementForPayment(paymentReference: string, status: "refunded" | "revoked", occurredAt: string) {
  if (!paymentReference) return;
  const supabase = supabaseAdmin();
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("id, stripe_checkout_session_id")
    .eq("stripe_payment_reference", paymentReference)
    .maybeSingle();
  if (purchaseError) throw purchaseError;
  if (!purchase) return;
  const purchasePatch = status === "refunded"
    ? { status, refunded_at: occurredAt, last_verified_webhook_at: occurredAt }
    : { status, revoked_at: occurredAt, last_verified_webhook_at: occurredAt };
  const { error: updatePurchaseError } = await supabase.from("purchases").update(purchasePatch).eq("id", purchase.id);
  if (updatePurchaseError) throw updatePurchaseError;
  if (!purchase.stripe_checkout_session_id) return;
  const { error: entitlementError } = await supabase
    .from("entitlements")
    .update({ status: "revoked", ends_at: occurredAt })
    .eq("stripe_checkout_session_id", purchase.stripe_checkout_session_id)
    .eq("status", "active");
  if (entitlementError) throw entitlementError;
}

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    const env = config();
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) throw new AppError("configuration", "Stripe webhook credentials are not configured.", 503);
    const signature = event.headers["stripe-signature"];
    if (!signature || !event.body) throw new AppError("validation", "Missing Stripe signature.", 400);
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const stripeEvent = stripe.webhooks.constructEvent(event.body, signature, env.STRIPE_WEBHOOK_SECRET);
    const supabase = supabaseAdmin();
    const eventId = stripeEvent.id;
    const { data: existing } = await supabase.from("webhook_events").select("id").eq("id", eventId).maybeSingle();
    if (existing) return json({ received: true, idempotent: true }, 200, requestId);

    if (stripeEvent.type === "checkout.session.completed" || stripeEvent.type === "checkout.session.async_payment_succeeded") {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.user_id;
      if (!userId || session.metadata?.product !== "sprint_pass") throw new AppError("validation", "Checkout metadata is incomplete.", 400);
      if (session.payment_status === "paid" || stripeEvent.type === "checkout.session.async_payment_succeeded") {
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
        if (!profile) throw new AppError("validation", "Checkout user does not exist.", 400);
        const { error: purchaseError } = await supabase.from("purchases").upsert({
          user_id: userId,
          stripe_customer_id: String(session.customer || ""),
          stripe_checkout_session_id: session.id,
          stripe_payment_reference: stripeId(session.payment_intent),
          season_id: session.metadata?.season_id || null,
          product_price_reference: session.metadata?.price_id || env.STRIPE_SPRINT_PASS_PRICE_ID,
          status: "paid",
          entitlement_starts_at: new Date().toISOString(),
          entitlement_ends_at: `${session.metadata?.season_year}-12-31T23:59:59.000Z`,
          last_verified_webhook_at: new Date().toISOString(),
        }, { onConflict: "stripe_checkout_session_id" });
        if (purchaseError) throw purchaseError;
        const seasonYear = Number(session.metadata?.season_year);
        const { error: entitlementError } = await supabase.from("entitlements").upsert({
          user_id: userId,
          source: "stripe_checkout",
          status: "active",
          season_year: seasonYear,
          starts_at: new Date().toISOString(),
          ends_at: `${seasonYear}-12-31T23:59:59.000Z`,
          stripe_checkout_session_id: session.id,
        }, { onConflict: "stripe_checkout_session_id" });
        if (entitlementError) throw entitlementError;
      }
    }

    if (stripeEvent.type === "charge.refunded") {
      const charge = stripeEvent.data.object as Stripe.Charge;
      if (charge.refunded) await revokeEntitlementForPayment(stripeId(charge.payment_intent), "refunded", new Date().toISOString());
    }

    if (stripeEvent.type === "charge.dispute.created") {
      const dispute = stripeEvent.data.object as Stripe.Dispute;
      await revokeEntitlementForPayment(stripeId(dispute.payment_intent), "revoked", new Date().toISOString());
    }

    await supabase.from("webhook_events").insert({ id: eventId, type: stripeEvent.type, processed_at: new Date().toISOString() });
    return json({ received: true }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
