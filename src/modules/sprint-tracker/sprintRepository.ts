import { GeneratedIdea } from "../idea-generator/types";
import { readJson, writeJson } from "../../shared/lib/storage";
import { Sprint, SprintDay, SprintDayStatus } from "./types";

const ACTIVE_SPRINT_KEY = "ideainsept.v1.activeSprint";

function isoDateFromDay(dayNumber: number) {
  const date = new Date(Date.UTC(2026, 8, dayNumber));
  return date.toISOString().slice(0, 10);
}

export function buildDefaultDays(): SprintDay[] {
  return Array.from({ length: 30 }, (_, index) => ({
    dayNumber: index + 1,
    date: isoDateFromDay(index + 1),
    status: "not_started" as SprintDayStatus,
    summary: "",
    blocker: "",
    nextAction: index === 0 ? "Define the smallest useful version." : "",
    minutesWorked: undefined,
    updatedAt: new Date().toISOString(),
  }));
}

export function defaultMilestones() {
  return [
    "Validation notes",
    "Scope lock",
    "Clickable prototype",
    "Functional MVP",
    "Testing pass",
    "Landing page",
    "Launch",
    "Showcase submission",
  ].map((title, index) => ({
    id: `milestone-${index + 1}`,
    title,
    targetDate: isoDateFromDay(Math.min(30, 3 + index * 4)),
    sortOrder: index + 1,
  }));
}

export function createSprintFromIdea(idea: GeneratedIdea, ownerId: string): Sprint {
  const sprint: Sprint = {
    id: crypto.randomUUID(),
    ownerId,
    seasonYear: 2026,
    idea,
    title: idea.title,
    promise: idea.promise,
    status: "active",
    visibility: "private",
    startDate: "2026-09-01",
    targetLaunchDate: "2026-09-30",
    primary: true,
    days: buildDefaultDays(),
    milestones: defaultMilestones(),
  };
  writeJson(ACTIVE_SPRINT_KEY, sprint);
  return sprint;
}

export function getActiveSprint() {
  return readJson<Sprint | null>(ACTIVE_SPRINT_KEY, null);
}

export function updateSprintDay(dayNumber: number, patch: Partial<SprintDay>) {
  const sprint = getActiveSprint();
  if (!sprint) return null;
  const next = {
    ...sprint,
    days: sprint.days.map((day) => (day.dayNumber === dayNumber ? { ...day, ...patch, updatedAt: new Date().toISOString() } : day)),
  };
  writeJson(ACTIVE_SPRINT_KEY, next);
  return next;
}
