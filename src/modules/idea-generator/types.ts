export type BuildType = "saas" | "mobile" | "content" | "automation" | "hardware" | "data" | "surprise";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type BudgetConstraint = "free-tools" | "low-budget" | "flexible";

export type IdeaRequest = {
  skills: string;
  interests?: string;
  audience?: string;
  hoursPerWeek: number;
  buildType: BuildType;
  experienceLevel: ExperienceLevel;
  constraint: BudgetConstraint;
  guest: boolean;
};

export type GeneratedIdea = {
  id: string;
  title: string;
  promise: string;
  painfulProblem: string;
  targetUser: string;
  solution: string;
  builderFit: string;
  septemberScope: string;
  weeklyOutline: string[];
  recommendedStack: string[];
  monetizationPath: string;
  launchAngle: string;
  complexity: "low" | "medium" | "high";
  confidence: number;
  source: "ai" | "curated";
};
