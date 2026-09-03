import type { Handler } from "@netlify/functions";
import { createHash } from "node:crypto";
import { z } from "zod";
import { assertFreeCostGuard, config, errorResponse, getActiveSeason, json, optionalUser, parseJson, supabaseAdmin } from "./_shared";
import { matchFallbackIdeas } from "../../src/modules/idea-generator/fallbackIdeas";
import { generatedIdeaSchema, ideaRequestSchema } from "../../src/modules/idea-generator/validation";
import { AppError } from "../../src/shared/errors/AppError";

const requestSchema = ideaRequestSchema.extend({ anonymousId: z.string().uuid() });
const geminiResponseSchema = z.object({ candidates: z.array(z.object({ content: z.object({ parts: z.array(z.object({ text: z.string() })) }) })) });

function fallback(body: z.infer<typeof requestSchema>, remaining = 0) {
  return { ideas: matchFallbackIdeas(body, body.guest ? 1 : 3), usage: { liveAiUsed: false, fallbackUsed: true, remaining } };
}

function anonymousKey(event: Parameters<Handler>[0], clientId: string, pepper: string) {
  const ip = event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  return createHash("sha256").update(`${pepper}:${ip}:${clientId}`).digest("hex");
}

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    assertFreeCostGuard();
    if (event.httpMethod !== "POST") throw new AppError("validation", "Use POST.", 405);
    const body = await parseJson(event.body, requestSchema, 6500);
    const env = config();
    if (env.LIVE_AI_ENABLED !== "true" || !env.GEMINI_API_KEY || !env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY || !env.AI_QUOTA_PEPPER) {
      return json(fallback(body, env.AI_FREE_USER_MONTHLY_LIMIT), 200, requestId);
    }

    const [user, season] = await Promise.all([optionalUser(event.headers.authorization), getActiveSeason()]);
    const hardGlobalLimit = env.AI_GLOBAL_MONTHLY_LIMIT;
    const liveGlobalLimit = Math.floor(hardGlobalLimit * env.AI_LIVE_CUTOFF_PERCENT / 100);
    let perActorLimit = body.guest ? 1 : env.AI_FREE_USER_MONTHLY_LIMIT;
    if (user) {
      const { data: paid } = await supabaseAdmin().from("entitlements").select("id").eq("user_id", user.id).eq("season_year", season.year).eq("status", "active").gt("ends_at", new Date().toISOString()).limit(1).maybeSingle();
      if (paid) perActorLimit = 50;
    }
    const actor = user?.id || anonymousKey(event, body.anonymousId, env.AI_QUOTA_PEPPER);
    const { data: quota, error: quotaError } = await supabaseAdmin().rpc("consume_ai_quota", {
      p_user_id: user?.id || null,
      p_anonymous_identifier: user ? null : actor,
      p_season_id: season.id,
      p_operation_type: "idea_generation",
      p_actor_limit: perActorLimit,
      p_global_limit: liveGlobalLimit,
      p_min_interval_seconds: 10,
    }).single();
    if (quotaError) throw quotaError;
    const quotaResult = quota as { allowed: boolean; actor_remaining: number; global_remaining: number; reason: string };
    if (!quotaResult.allowed) return json(fallback(body, Number(quotaResult.actor_remaining || 0)), 200, requestId);

    const count = body.guest ? 1 : 3;
    const prompt = [
      "Return strict JSON only with key ideas.", `Generate ${count} September Sprint product ideas.`,
      "Each idea needs title, promise, painfulProblem, targetUser, solution, builderFit, septemberScope, weeklyOutline array of four strings, recommendedStack, monetizationPath, launchAngle, complexity, confidence, source.",
      `Skills: ${body.skills.slice(0, 500)}`, `Interests: ${(body.interests || "").slice(0, 300)}`,
      `Audience: ${(body.audience || "").slice(0, 300)}`,
      `Hours per week: ${body.hoursPerWeek}. Type: ${body.buildType}. Experience: ${body.experienceLevel}. Constraint: ${body.constraint}.`,
    ].join("\n");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2400, temperature: 0.75 } }),
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) throw new AppError("upstream", "Live AI is temporarily unavailable.", 502);
    const raw = geminiResponseSchema.parse(await response.json());
    const text = raw.candidates[0]?.content.parts[0]?.text;
    const parsed = z.object({ ideas: z.array(generatedIdeaSchema).min(1).max(3) }).parse(JSON.parse(text || "{}"));
    return json({ ideas: parsed.ideas.map((idea) => ({ ...idea, source: "ai" })), usage: { liveAiUsed: true, fallbackUsed: false, remaining: Number(quotaResult.actor_remaining || 0) } }, 200, requestId);
  } catch (error) {
    try {
      const body = requestSchema.parse(JSON.parse(event.body || "{}"));
      return json(fallback(body), 200, requestId);
    } catch {
      return errorResponse(error, requestId);
    }
  }
};
