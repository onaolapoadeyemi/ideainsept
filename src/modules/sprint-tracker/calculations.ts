import { Sprint, SprintDay } from "./types";

export function calculateCompletedDays(days: SprintDay[]) {
  return days.filter((day) => day.status === "completed").length;
}

export function calculateStreak(days: SprintDay[]) {
  let streak = 0;
  for (const day of [...days].reverse()) {
    if (day.status === "completed") streak += 1;
    else if (day.status === "rest") continue;
    else break;
  }
  return streak;
}

export function calculateProgress(sprint: Sprint) {
  const completed = calculateCompletedDays(sprint.days);
  const milestoneProgress = sprint.milestones.length
    ? Math.round((sprint.milestones.filter((milestone) => milestone.completedAt).length / sprint.milestones.length) * 100)
    : 0;
  return {
    completed,
    total: sprint.days.length,
    percent: Math.round((completed / sprint.days.length) * 100),
    streak: calculateStreak(sprint.days),
    milestoneProgress,
  };
}

export function supportiveRecoveryCopy(day: SprintDay) {
  if (day.status !== "missed") return "Keep the next action small enough to start today.";
  return "A missed day is data, not a verdict. Pick the next smallest action and keep the sprint alive.";
}
