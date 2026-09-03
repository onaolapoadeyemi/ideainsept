import { describe, expect, it } from "vitest";
import { calculateProgress, supportiveRecoveryCopy } from "./calculations";
import { buildDefaultDays, defaultMilestones } from "./sprintRepository";
import { Sprint } from "./types";

describe("sprint calculations", () => {
  it("calculates completion and streak", () => {
    const days = buildDefaultDays();
    days[27].status = "completed";
    days[28].status = "rest";
    days[29].status = "completed";
    const sprint: Sprint = {
      id: "sprint",
      ownerId: "user",
      seasonYear: 2026,
      idea: {
        id: "idea",
        title: "Test",
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
        complexity: "low",
        confidence: 70,
        source: "curated",
      },
      title: "Test",
      promise: "Promise",
      status: "active",
      visibility: "private",
      startDate: "2026-09-01",
      targetLaunchDate: "2026-09-30",
      primary: true,
      days,
      milestones: defaultMilestones(),
    };
    expect(calculateProgress(sprint).completed).toBe(2);
    expect(calculateProgress(sprint).streak).toBe(2);
  });

  it("uses supportive missed-day copy", () => {
    const [day] = buildDefaultDays();
    day.status = "missed";
    expect(supportiveRecoveryCopy(day)).toContain("not a verdict");
  });
});
