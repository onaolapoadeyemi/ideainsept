import { z } from "zod";
import { analytics } from "../../shared/services/analytics";
import { apiFetch } from "../../shared/services/api";

export const newsletterSignupSchema = z.object({
  email: z.string().email().max(254),
  consentSource: z.string().min(2).max(80),
  currentSeasonInterest: z.boolean(),
  company: z.string().max(0),
});

export async function recordNewsletterOptIn(input: z.infer<typeof newsletterSignupSchema>) {
  const parsed = newsletterSignupSchema.parse(input);
  const response = await apiFetch("/api/subscribe-newsletter", {
    method: "POST",
    body: JSON.stringify({
      email: parsed.email.trim().toLowerCase(),
      consent: true,
      consentSource: parsed.consentSource,
      currentSeasonInterest: parsed.currentSeasonInterest,
      company: parsed.company,
    }),
  });
  const data = (await response.json()) as { error?: { message?: string }; alreadySubscribed?: boolean };
  if (!response.ok) throw new Error(data.error?.message || "We could not save your newsletter signup.");
  analytics.track("newsletter_opt_in", { source: parsed.consentSource, season: parsed.currentSeasonInterest });
  return { email: parsed.email, alreadySubscribed: Boolean(data.alreadySubscribed), status: "consented" as const };
}
