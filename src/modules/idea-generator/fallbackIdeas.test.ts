import { describe, expect, it } from "vitest";
import { matchFallbackIdeas } from "./fallbackIdeas";
import { IdeaRequest } from "./types";

const baseRequest: IdeaRequest = {
  skills: "React TypeScript Postgres",
  interests: "developer tools and API cost safety",
  audience: "indie developers",
  hoursPerWeek: 8,
  buildType: "saas",
  experienceLevel: "intermediate",
  constraint: "free-tools",
  guest: false,
};

describe("matchFallbackIdeas", () => {
  it("returns requested count and favors relevant keywords", () => {
    const ideas = matchFallbackIdeas(baseRequest, 3);
    expect(ideas).toHaveLength(3);
    expect(ideas.map((idea) => idea.title)).toContain("ApiCost Guard");
  });

  it("returns one idea for a guest hook", () => {
    expect(matchFallbackIdeas({ ...baseRequest, guest: true }, 1)).toHaveLength(1);
  });
});
