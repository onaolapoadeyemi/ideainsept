export type SeasonStatus = "upcoming" | "open" | "submission" | "voting" | "judging" | "archived";

export type Season = {
  id: string;
  year: number;
  name: string;
  timezone: string;
  ideaPhaseStart: string;
  ideaPhaseEnd: string;
  buildPhaseStart: string;
  buildPhaseEnd: string;
  submissionPhaseStart: string;
  submissionPhaseEnd: string;
  votingPhaseStart: string;
  votingPhaseEnd: string;
  judgingPhaseStart: string;
  judgingPhaseEnd: string;
  status: SeasonStatus;
};
