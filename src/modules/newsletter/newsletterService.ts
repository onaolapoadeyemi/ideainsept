import { z } from "zod";
import { analytics } from "../../shared/services/analytics";

export const newsletterSignupSchema = z.object({
  email: z.string().email().max(254),
  consentSource: z.string().min(2).max(80),
  currentSeasonInterest: z.boolean(),
  company: z.string().max(0),
});

export function recordNewsletterOptIn(input: z.infer<typeof newsletterSignupSchema>) {
  const parsed = newsletterSignupSchema.parse(input);
  analytics.track("newsletter_opt_in", { source: parsed.consentSource, season: parsed.currentSeasonInterest });
  return { email: parsed.email, consentTimestamp: new Date().toISOString(), status: "consented" as const };
}
