import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { config, errorResponse, getActiveSeason, json, requireUser } from "./_shared";
import { AppError } from "../../src/shared/errors/AppError";

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    const env = config();
    if (env.PAYMENTS_ENABLED !== "true") throw new AppError("configuration", "Payments are intentionally disabled until the owner completes Stripe setup.", 503);
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_SPRINT_PASS_PRICE_ID) {
      throw new AppError("configuration", "Stripe test credentials are not configured.", 503);
    }
    const [user, season] = await Promise.all([requireUser(event.headers.authorization), getActiveSeason()]);
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: env.STRIPE_SPRINT_PASS_PRICE_ID, quantity: 1 }],
      success_url: `${env.APP_URL}/pricing?checkout=success`,
      cancel_url: `${env.APP_URL}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: { product: "sprint_pass", user_id: user.id, season_id: season.id, season_year: String(season.year), price_id: env.STRIPE_SPRINT_PASS_PRICE_ID },
    });
    if (!session.url) throw new AppError("upstream", "Stripe did not return a checkout URL.", 502);
    return json({ url: session.url }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
