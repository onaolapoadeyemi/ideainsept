export type PlanKey = "free" | "sprint_pass";

export type Entitlement = {
  plan: PlanKey;
  seasonYear: number;
  aiGenerationsPerSeason: number;
  activeSprintLimit: number;
  canRefineIdeas: boolean;
  canGenerateSprintPlan: boolean;
  canExportReport: boolean;
  canCreateUnlistedSprint: boolean;
  priorityReview: boolean;
};

export const freeEntitlement: Entitlement = {
  plan: "free",
  seasonYear: 2026,
  aiGenerationsPerSeason: 5,
  activeSprintLimit: 1,
  canRefineIdeas: false,
  canGenerateSprintPlan: false,
  canExportReport: false,
  canCreateUnlistedSprint: false,
  priorityReview: false,
};

export const sprintPassEntitlement: Entitlement = {
  plan: "sprint_pass",
  seasonYear: 2026,
  aiGenerationsPerSeason: 50,
  activeSprintLimit: 3,
  canRefineIdeas: true,
  canGenerateSprintPlan: true,
  canExportReport: true,
  canCreateUnlistedSprint: true,
  priorityReview: true,
};

export function canUseFeature(entitlement: Entitlement, feature: keyof Omit<Entitlement, "plan" | "seasonYear" | "aiGenerationsPerSeason" | "activeSprintLimit">) {
  return entitlement[feature] === true;
}

export function isGenerationAllowed(entitlement: Entitlement, usedThisSeason: number) {
  return usedThisSeason < entitlement.aiGenerationsPerSeason;
}
