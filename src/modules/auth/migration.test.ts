import { describe, expect, it } from "vitest";
import { migrateGuestDraftOnce } from "./migration";

describe("guest draft migration", () => {
  it("migrates once and reports idempotent repeats", () => {
    const completed = new Set<string>();
    const draft = {
      migrationId: "migration-1",
      idea: {
        id: "idea",
        title: "SprintPulse",
        promise: "Promise",
        painfulProblem: "Problem",
        targetUser: "Target",
        solution: "Solution",
        builderFit: "Fit",
        septemberScope: "Scope",
        weeklyOutline: ["a", "b", "c", "d"],
        recommendedStack: ["React", "Supabase"],
        monetizationPath: "Path",
        launchAngle: "Angle",
        complexity: "low" as const,
        confidence: 80,
        source: "curated" as const,
      },
    };
    expect(migrateGuestDraftOnce(draft, completed).status).toBe("migrated");
    expect(migrateGuestDraftOnce(draft, completed).status).toBe("already_migrated");
  });
});
