export type AnalyticsEvent =
  | "landing_cta_clicked"
  | "idea_generation_started"
  | "idea_generation_succeeded"
  | "idea_generation_failed"
  | "idea_saved"
  | "sprint_commit_started"
  | "sprint_committed"
  | "signup_started"
  | "signup_completed"
  | "paywall_viewed"
  | "checkout_started"
  | "checkout_completed"
  | "sprint_day_completed"
  | "showcase_submission_started"
  | "showcase_submission_completed"
  | "vote_cast"
  | "newsletter_opt_in";

type SafeProperties = Record<string, string | number | boolean | null>;

export interface AnalyticsAdapter {
  track(event: AnalyticsEvent, properties?: SafeProperties): void;
}

export const analytics: AnalyticsAdapter = {
  track(event, properties = {}) {
    if (import.meta.env.DEV) console.info("analytics", event, properties);
  },
};
