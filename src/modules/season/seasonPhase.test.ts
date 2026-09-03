import { describe, expect, it } from "vitest";
import { calculateSeasonPhase, SeasonWindow } from "./seasonPhase";

const season: SeasonWindow = {
  ideaPhaseStart: "2026-08-01T05:00:00Z",
  buildPhaseStart: "2026-09-01T05:00:00Z",
  submissionPhaseStart: "2026-09-20T05:00:00Z",
  votingPhaseStart: "2026-10-05T05:00:00Z",
  judgingPhaseStart: "2026-10-13T05:00:00Z",
  judgingPhaseEnd: "2026-10-20T05:00:00Z",
};

describe("calculateSeasonPhase", () => {
  it("calculates phase from configured windows", () => {
    expect(calculateSeasonPhase(season, new Date("2026-07-15T00:00:00Z"))).toBe("upcoming");
    expect(calculateSeasonPhase(season, new Date("2026-09-02T00:00:00Z"))).toBe("open");
    expect(calculateSeasonPhase(season, new Date("2026-10-06T00:00:00Z"))).toBe("voting");
  });
});
