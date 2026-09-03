export type FeatureFlagKey =
  | "aiGenerator"
  | "sprintTracker"
  | "showcase"
  | "billing"
  | "newsletter"
  | "liveAI"
  | "fileUploads";

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

export const defaultFeatureFlags: FeatureFlags = {
  aiGenerator: true,
  sprintTracker: true,
  showcase: true,
  billing: true,
  newsletter: true,
  liveAI: true,
  fileUploads: false,
};

export function isFeatureEnabled(flags: FeatureFlags, key: FeatureFlagKey) {
  return flags[key] === true;
}
