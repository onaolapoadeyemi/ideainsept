import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { config, errorResponse, json } from "./_shared";
import { AppError } from "../../src/shared/errors/AppError";

export const handler: Handler = async () => {
  const requestId = crypto.randomUUID();
  try {
    const env = config();
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_SPRINT_PASS_PRICE_ID) {
      throw new AppError("configuration", "Stripe test credentials are not configured.", 503);
    }
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: env.STRIPE_SPRINT_PASS_PRICE_ID, quantity: 1 }],
      success_url: `${env.APP_URL}/pricing?checkout=success`,
      cancel_url: `${env.APP_URL}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { product: "sprint_pass", season_year: "2026" },
    });
    if (!session.url) throw new AppError("upstream", "Stripe did not return a checkout URL.", 502);
    return json({ url: session.url }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
