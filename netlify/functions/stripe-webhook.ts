import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { config, errorResponse, json, supabaseAdmin } from "./_shared";
import { AppError } from "../../src/shared/errors/AppError";

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

    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.user_id;
      if (userId) {
        await supabase.from("purchases").upsert({
          user_id: userId,
          stripe_customer_id: String(session.customer || ""),
          stripe_checkout_session_id: session.id,
          season_id: session.metadata?.season_id || null,
          product_price_reference: session.metadata?.price_id || env.STRIPE_SPRINT_PASS_PRICE_ID,
          status: "paid",
          last_verified_webhook_at: new Date().toISOString(),
        });
        await supabase.from("entitlements").upsert({
          user_id: userId,
          source: "stripe_checkout",
          status: "active",
          season_year: Number(session.metadata?.season_year || 2026),
          starts_at: new Date().toISOString(),
          ends_at: "2026-12-31T23:59:59.000Z",
          stripe_checkout_session_id: session.id,
        });
      }
    }

    await supabase.from("webhook_events").insert({ id: eventId, type: stripeEvent.type, processed_at: new Date().toISOString() });
    return json({ received: true }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
