import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { assertFreeCostGuard, config, errorResponse, json, parseJson } from "./_shared";
import { matchFallbackIdeas } from "../../src/modules/idea-generator/fallbackIdeas";
import { generatedIdeaSchema, ideaRequestSchema } from "../../src/modules/idea-generator/validation";
import { AppError } from "../../src/shared/errors/AppError";

const geminiResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(z.object({ text: z.string() })),
      }),
    }),
  ),
});

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    assertFreeCostGuard();
    if (event.httpMethod !== "POST") throw new AppError("validation", "Use POST.", 405);
    const body = await parseJson(event.body, ideaRequestSchema, 6000);
    const count = body.guest ? 1 : 3;
    const env = config();
    if (env.LIVE_AI_ENABLED !== "true" || !env.GEMINI_API_KEY) {
      return json({ ideas: matchFallbackIdeas(body, count), usage: { liveAiUsed: false, fallbackUsed: true, remaining: env.AI_FREE_USER_MONTHLY_LIMIT } }, 200, requestId);
    }

    const prompt = [
      "Return strict JSON only with key ideas.",
      `Generate ${count} September Sprint product ideas.`,
      "Each idea needs title, promise, painfulProblem, targetUser, solution, builderFit, septemberScope, weeklyOutline array of four strings, recommendedStack, monetizationPath, launchAngle, complexity, confidence, source.",
      `Skills: ${body.skills.slice(0, 500)}`,
      `Interests: ${(body.interests || "").slice(0, 300)}`,
      `Audience: ${(body.audience || "").slice(0, 300)}`,
      `Hours per week: ${body.hoursPerWeek}. Type: ${body.buildType}. Experience: ${body.experienceLevel}. Constraint: ${body.constraint}.`,
    ].join("\n");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2400, temperature: 0.75 },
      }),
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) throw new AppError("upstream", "Live AI is temporarily unavailable.", 502);
    const raw = geminiResponseSchema.parse(await response.json());
    const text = raw.candidates[0]?.content.parts[0]?.text;
    const parsed = z.object({ ideas: z.array(generatedIdeaSchema).min(1).max(3) }).parse(JSON.parse(text || "{}"));
    return json(
      {
        ideas: parsed.ideas.map((idea) => ({ ...idea, source: "ai" })),
        usage: { liveAiUsed: true, fallbackUsed: false, remaining: Math.max(0, env.AI_FREE_USER_MONTHLY_LIMIT - 1) },
      },
      200,
      requestId,
    );
  } catch (error) {
    try {
      const body = ideaRequestSchema.parse(JSON.parse(event.body || "{}"));
      return json({ ideas: matchFallbackIdeas(body, body.guest ? 1 : 3), usage: { liveAiUsed: false, fallbackUsed: true, remaining: 0 } }, 200, requestId);
    } catch {
      return errorResponse(error, requestId);
    }
  }
};
