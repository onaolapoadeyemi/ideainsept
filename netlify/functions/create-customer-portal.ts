import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { config, errorResponse, json, requireUser, supabaseAdmin } from "./_shared";
import { AppError } from "../../src/shared/errors/AppError";

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    const user = await requireUser(event.headers.authorization);
    const env = config();
    if (!env.STRIPE_SECRET_KEY) throw new AppError("configuration", "Stripe is not configured.", 503);
    if (env.PAYMENTS_ENABLED !== "true") throw new AppError("configuration", "Payments are intentionally disabled.", 503);
    const { data: purchase } = await supabaseAdmin().from("purchases").select("stripe_customer_id").eq("user_id", user.id).eq("status", "paid").order("last_verified_webhook_at", { ascending: false }).limit(1).maybeSingle();
    const customerId = purchase?.stripe_customer_id;
    if (!customerId) throw new AppError("validation", "No Stripe customer is linked to this account.", 400);
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.APP_URL}/account`,
    });
    return json({ url: portal.url }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
