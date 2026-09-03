import { describe, expect, it } from "vitest";
import { generatedIdeaSchema } from "./validation";

describe("generatedIdeaSchema", () => {
  it("accepts structured generated output", () => {
    const parsed = generatedIdeaSchema.parse({
      id: "idea-1",
      title: "LaunchKit",
      promise: "A launch checklist for careful builders.",
      painfulProblem: "Builders miss launch steps when working alone.",
      targetUser: "Indie founders",
      solution: "A guided launch sequence.",
      builderFit: "It fits React and TypeScript experience.",
      septemberScope: "A focused checklist and shareable report.",
      weeklyOutline: ["Validate", "Build", "Polish", "Launch"],
      recommendedStack: ["React", "Supabase"],
      monetizationPath: "Seasonal paid templates.",
      launchAngle: "September is a natural 30-day launch window.",
      complexity: "medium",
      confidence: 82,
      source: "ai",
    });
    expect(parsed.title).toBe("LaunchKit");
  });
});
