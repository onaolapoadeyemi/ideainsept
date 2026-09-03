import { GeneratedIdea } from "../idea-generator/types";
import { supabase } from "../../shared/services/supabase";
import { Season } from "../season/types";
import { Sprint, SprintDay, SprintDayStatus } from "./types";


function isoDateFromDay(year: number, dayNumber: number) {
  return new Date(Date.UTC(year, 8, dayNumber)).toISOString().slice(0, 10);
}

export function buildDefaultDays(year = new Date().getUTCFullYear()): SprintDay[] {
  return Array.from({ length: 30 }, (_, index) => ({
    dayNumber: index + 1, date: isoDateFromDay(year, index + 1), status: "not_started" as SprintDayStatus,
    summary: "", blocker: "", nextAction: index === 0 ? "Define the smallest useful version." : "",
    minutesWorked: undefined, updatedAt: new Date().toISOString(),
  }));
}

export function defaultMilestones(year = new Date().getUTCFullYear()) {
  return ["Validation notes", "Scope lock", "Clickable prototype", "Functional MVP", "Testing pass", "Landing page", "Launch", "Showcase submission"].map((title, index) => ({
    id: crypto.randomUUID(), title, targetDate: isoDateFromDay(year, Math.min(30, 3 + index * 4)), sortOrder: index + 1,
  }));
}

type IdeaRow = { id?: string; title?: string; summary?: string; problem?: string; target_audience?: string; proposed_solution?: string; differentiator?: string; mvp_scope?: string; model_metadata?: { weeklyOutline?: string[]; complexity?: "low" | "medium" | "high"; confidence?: number }; recommended_stack?: string[]; monetization_suggestion?: string; autumn_launch_angle?: string; source?: "ai" | "curated" };
type DayRow = { day_number: number; date: string; status: SprintDayStatus; summary: string; blocker?: string | null; next_action?: string | null; minutes_worked?: number | null; updated_at: string };
type MilestoneRow = { id: string; title: string; target_date: string; completed_at?: string | null; sort_order: number };
type SprintRow = { id: string; owner_id: string; seasons?: { year: number } | null; ideas?: IdeaRow | null; title: string; one_sentence_promise: string; status: Sprint["status"]; visibility: Sprint["visibility"]; start_date: string; target_launch_date: string; primary_sprint: boolean; sprint_days?: DayRow[]; milestones?: MilestoneRow[] };

function mapSprint(row: SprintRow): Sprint {
  const ideaRow = row.ideas || {};
  return {
    id: row.id, ownerId: row.owner_id, seasonYear: row.seasons?.year || new Date(row.start_date).getUTCFullYear(),
    idea: {
      id: ideaRow.id || "saved-idea", title: ideaRow.title || row.title, promise: ideaRow.summary || row.one_sentence_promise,
      painfulProblem: ideaRow.problem || "", targetUser: ideaRow.target_audience || "", solution: ideaRow.proposed_solution || "",
      builderFit: ideaRow.differentiator || "", septemberScope: ideaRow.mvp_scope || "", weeklyOutline: ideaRow.model_metadata?.weeklyOutline || [],
      recommendedStack: ideaRow.recommended_stack || [], monetizationPath: ideaRow.monetization_suggestion || "",
      launchAngle: ideaRow.autumn_launch_angle || "", complexity: ideaRow.model_metadata?.complexity || "medium",
      confidence: ideaRow.model_metadata?.confidence || 78, source: ideaRow.source || "curated",
    },
    title: row.title, promise: row.one_sentence_promise, status: row.status, visibility: row.visibility,
    startDate: row.start_date, targetLaunchDate: row.target_launch_date, primary: row.primary_sprint,
    days: (row.sprint_days || []).map((day) => ({
      dayNumber: day.day_number, date: day.date, status: day.status, summary: day.summary, blocker: day.blocker || "",
      nextAction: day.next_action || "", minutesWorked: day.minutes_worked ?? undefined, updatedAt: day.updated_at,
    })).sort((a: SprintDay, b: SprintDay) => a.dayNumber - b.dayNumber),
    milestones: (row.milestones || []).map((item) => ({
      id: item.id, title: item.title, targetDate: item.target_date, completedAt: item.completed_at || undefined, sortOrder: item.sort_order,
    })).sort((a: {sortOrder:number}, b: {sortOrder:number}) => a.sortOrder - b.sortOrder),
  };
}

const sprintSelect = "*, seasons(year), ideas(*), sprint_days(*), milestones(*)";

export async function createSprintFromIdea(idea: GeneratedIdea, ownerId: string, season: Season, persistedIdeaId?: string): Promise<Sprint> {
  const days = buildDefaultDays(season.year);
  const milestones = defaultMilestones(season.year);
  if (!supabase) throw new Error("Sprint storage is not configured.");
  const { data: sprintRow, error } = await supabase.from("sprints").insert({
    owner_id: ownerId, season_id: season.id, idea_id: persistedIdeaId || null, title: idea.title,
    one_sentence_promise: idea.promise, status: "active", visibility: "private",
    start_date: days[0].date, target_launch_date: days[29].date, primary_sprint: true,
  }).select("id").single();
  if (error) throw error;
  const [dayResult, milestoneResult] = await Promise.all([
    supabase.from("sprint_days").insert(days.map((day) => ({ sprint_id: sprintRow.id, owner_id: ownerId, day_number: day.dayNumber, date: day.date, status: day.status, summary: day.summary, blocker: day.blocker, next_action: day.nextAction }))),
    supabase.from("milestones").insert(milestones.map((item) => ({ sprint_id: sprintRow.id, owner_id: ownerId, title: item.title, target_date: item.targetDate, sort_order: item.sortOrder }))),
  ]);
  if (dayResult.error) throw dayResult.error;
  if (milestoneResult.error) throw milestoneResult.error;
  const created = await getActiveSprint(ownerId, season.id);
  if (!created) throw new Error("The sprint was created but could not be reloaded.");
  return created;
}

export async function getActiveSprint(ownerId?: string, seasonId?: string) {
  if (!supabase) return null;
  if (!ownerId || !seasonId) return null;
  const { data, error } = await supabase.from("sprints").select(sprintSelect).eq("owner_id", ownerId).eq("season_id", seasonId).eq("primary_sprint", true).maybeSingle();
  if (error) throw error;
  return data ? mapSprint(data as SprintRow) : null;
}

export async function updateSprintDay(sprintId: string, dayNumber: number, patch: Partial<SprintDay>) {
  if (!supabase) throw new Error("Sprint storage is not configured.");
  const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) values.status = patch.status;
  if (patch.summary !== undefined) values.summary = patch.summary;
  if (patch.blocker !== undefined) values.blocker = patch.blocker;
  if (patch.nextAction !== undefined) values.next_action = patch.nextAction;
  if (patch.minutesWorked !== undefined) values.minutes_worked = patch.minutesWorked;
  const { error } = await supabase.from("sprint_days").update(values).eq("sprint_id", sprintId).eq("day_number", dayNumber);
  if (error) throw error;
  return null;
}

export async function updateMilestone(sprintId: string, milestoneId: string, completed: boolean) {
  if (!supabase) throw new Error("Sprint storage is not configured.");
  const { error } = await supabase.from("milestones").update({ completed_at: completed ? new Date().toISOString() : null }).eq("sprint_id", sprintId).eq("id", milestoneId);
  if (error) throw error;
  return null;
}
