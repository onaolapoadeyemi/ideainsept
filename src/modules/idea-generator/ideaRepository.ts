import { ideaGenerationResponseSchema, ideaRequestSchema } from "./validation";
import { GeneratedIdea, IdeaRequest } from "./types";
import { matchFallbackIdeas } from "./fallbackIdeas";
import { analytics } from "../../shared/services/analytics";
import { readJson, writeJson } from "../../shared/lib/storage";

const GUEST_GENERATION_KEY = "ideainsept.v1.guestGenerationUsed";
const SAVED_IDEAS_KEY = "ideainsept.v1.savedIdeas";

export async function generateIdeas(request: IdeaRequest): Promise<GeneratedIdea[]> {
  const parsed = ideaRequestSchema.parse(request);
  analytics.track("idea_generation_started", { guest: parsed.guest, buildType: parsed.buildType });

  if (parsed.guest && readJson<boolean>(GUEST_GENERATION_KEY, false)) {
    const fallback = matchFallbackIdeas(parsed, 1);
    analytics.track("idea_generation_succeeded", { source: "curated", quota: "guest_used" });
    return fallback;
  }

  try {
    const response = await fetch("/api/generate-idea", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed),
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

export function saveIdea(idea: GeneratedIdea) {
  const saved = readJson<GeneratedIdea[]>(SAVED_IDEAS_KEY, []);
  if (!saved.some((item) => item.id === idea.id)) writeJson(SAVED_IDEAS_KEY, [idea, ...saved].slice(0, 20));
  analytics.track("idea_saved", { source: idea.source });
}

export function getSavedIdeas() {
  return readJson<GeneratedIdea[]>(SAVED_IDEAS_KEY, []);
}
