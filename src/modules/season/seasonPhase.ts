export type SeasonPhase = "upcoming" | "open" | "submission" | "voting" | "judging" | "archived";

export type SeasonWindow = {
  ideaPhaseStart: string;
  buildPhaseStart: string;
  submissionPhaseStart: string;
  votingPhaseStart: string;
  judgingPhaseStart: string;
  judgingPhaseEnd: string;
};

export function calculateSeasonPhase(window: SeasonWindow, now: Date): SeasonPhase {
  const time = now.getTime();
  if (time < Date.parse(window.ideaPhaseStart)) return "upcoming";
  if (time < Date.parse(window.submissionPhaseStart)) return "open";
  if (time < Date.parse(window.votingPhaseStart)) return "submission";
  if (time < Date.parse(window.judgingPhaseStart)) return "voting";
  if (time < Date.parse(window.judgingPhaseEnd)) return "judging";
  return "archived";
}
