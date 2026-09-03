import { ideaGenerationResponseSchema, ideaRequestSchema } from "./validation";
import { GeneratedIdea, IdeaRequest } from "./types";
import { matchFallbackIdeas } from "./fallbackIdeas";
import { analytics } from "../../shared/services/analytics";
import { readJson, writeJson } from "../../shared/lib/storage";
import { apiFetch } from "../../shared/services/api";
import { supabase } from "../../shared/services/supabase";

const GUEST_GENERATION_KEY = "ideainsept.v2.guestGenerationUsed";
const ANONYMOUS_ID_KEY = "ideainsept.v2.anonymousId";
const SAVED_IDEAS_KEY = "ideainsept.v2.demoSavedIdeas";

function anonymousId() {
  const existing = readJson<string | null>(ANONYMOUS_ID_KEY, null);
  if (existing) return existing;
  const next = crypto.randomUUID();
  writeJson(ANONYMOUS_ID_KEY, next);
  return next;
}

export async function generateIdeas(request: IdeaRequest): Promise<GeneratedIdea[]> {
  const parsed = ideaRequestSchema.parse(request);
  analytics.track("idea_generation_started", { guest: parsed.guest, buildType: parsed.buildType });
  if (parsed.guest && readJson<boolean>(GUEST_GENERATION_KEY, false)) return matchFallbackIdeas(parsed, 1);
  try {
    const response = await apiFetch("/api/generate-idea", {
      method: "POST",
      body: JSON.stringify({ ...parsed, anonymousId: anonymousId() }),
    });
    if (!response.ok) throw new Error("Server generation unavailable");
    const data = ideaGenerationResponseSchema.parse(await response.json());
    if (parsed.guest) writeJson(GUEST_GENERATION_KEY, true);
    analytics.track("idea_generation_succeeded", { source: data.usage.liveAiUsed ? "ai" : "curated" });
    return data.ideas;
  } catch {
    const fallback = matchFallbackIdeas(parsed, parsed.guest ? 1 : 3);
    if (parsed.guest) writeJson(GUEST_GENERATION_KEY, true);
    analytics.track("idea_generation_failed", { fallback: true });
    return fallback;
  }
}

export async function saveIdea(idea: GeneratedIdea, ownerId?: string, seasonId?: string) {
  if (!supabase || !ownerId) {
    const saved = readJson<GeneratedIdea[]>(SAVED_IDEAS_KEY, []);
    if (!saved.some((item) => item.id === idea.id)) writeJson(SAVED_IDEAS_KEY, [idea, ...saved].slice(0, 20));
    analytics.track("idea_saved", { source: idea.source });
    return idea.id;
  }
  if (!seasonId) throw new Error("Select an active season before saving an idea.");
  const { data, error } = await supabase.from("ideas").insert({
    owner_id: ownerId, season_id: seasonId, title: idea.title, summary: idea.promise,
    problem: idea.painfulProblem, target_audience: idea.targetUser, proposed_solution: idea.solution,
    differentiator: idea.builderFit, recommended_stack: idea.recommendedStack, mvp_scope: idea.septemberScope,
    monetization_suggestion: idea.monetizationPath, autumn_launch_angle: idea.launchAngle, source: idea.source,
    model_metadata: { generatedId: idea.id, weeklyOutline: idea.weeklyOutline, confidence: idea.confidence, complexity: idea.complexity },
  }).select("id").single();
  if (error) throw error;
  analytics.track("idea_saved", { source: idea.source });
  return data.id as string;
}

export async function getSavedIdeas(ownerId?: string, seasonId?: string) {
  if (!supabase) return readJson<GeneratedIdea[]>(SAVED_IDEAS_KEY, []);
  if (!ownerId || !seasonId) return [];
  const { data, error } = await supabase.from("ideas").select("*").eq("owner_id", ownerId).eq("season_id", seasonId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id, title: row.title, promise: row.summary, painfulProblem: row.problem, targetUser: row.target_audience,
    solution: row.proposed_solution, builderFit: row.differentiator, septemberScope: row.mvp_scope,
    weeklyOutline: row.model_metadata?.weeklyOutline || [], recommendedStack: row.recommended_stack,
    monetizationPath: row.monetization_suggestion, launchAngle: row.autumn_launch_angle,
    complexity: row.model_metadata?.complexity || "medium", confidence: row.model_metadata?.confidence || 78, source: row.source,
  })) as GeneratedIdea[];
}
