import { GeneratedIdea } from "../idea-generator/types";

export type SprintDayStatus = "not_started" | "completed" | "missed" | "rest";

export type SprintDay = {
  dayNumber: number;
  date: string;
  status: SprintDayStatus;
  summary: string;
  blocker?: string;
  nextAction?: string;
  minutesWorked?: number;
  updatedAt: string;
};

export type Milestone = {
  id: string;
  title: string;
  targetDate: string;
  completedAt?: string;
  sortOrder: number;
};

export type Sprint = {
  id: string;
  ownerId: string;
  seasonYear: number;
  idea: GeneratedIdea;
  title: string;
  promise: string;
  status: "draft" | "active" | "completed" | "paused" | "archived";
  visibility: "private" | "unlisted" | "public";
  startDate: string;
  targetLaunchDate: string;
  primary: boolean;
  days: SprintDay[];
  milestones: Milestone[];
};
