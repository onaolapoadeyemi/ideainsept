import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { AppError } from "../../src/shared/errors/AppError";
import { errorResponse, json, parseJson, supabaseAdmin } from "./_shared";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
  consent: z.literal(true),
  consentSource: z.string().trim().min(2).max(80),
  currentSeasonInterest: z.boolean().default(true),
  company: z.string().max(0).default(""),
});

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    if (event.httpMethod !== "POST") throw new AppError("validation", "Use POST.", 405);
    const body = await parseJson(event.body, requestSchema, 2000);
    // Honeypot hits receive a success response without storing a contact record.
    if (body.company) return json({ subscribed: true }, 201, requestId);
    const { error } = await supabaseAdmin().from("newsletter_subscribers").insert({
      email: body.email.toLowerCase(),
      consent_timestamp: new Date().toISOString(),
      consent_source: body.consentSource,
      status: "consented",
      current_season_interest: body.currentSeasonInterest,
    });
    if (error?.code === "23505") return json({ subscribed: true, alreadySubscribed: true }, 200, requestId);
    if (error) throw error;
    return json({ subscribed: true, alreadySubscribed: false }, 201, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
