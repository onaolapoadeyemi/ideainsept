import { z } from "zod";

export const ideaRequestSchema = z.object({
  skills: z.string().trim().min(2).max(500),
  interests: z.string().trim().max(300).optional().or(z.literal("")),
  audience: z.string().trim().max(300).optional().or(z.literal("")),
  hoursPerWeek: z.number().int().min(2).max(40),
  buildType: z.enum(["saas", "mobile", "content", "automation", "hardware", "data", "surprise"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  constraint: z.enum(["free-tools", "low-budget", "flexible"]),
  guest: z.boolean().default(false),
});

export const generatedIdeaSchema = z.object({
  id: z.string().min(4),
  title: z.string().min(3).max(80),
  promise: z.string().min(8).max(180),
  painfulProblem: z.string().min(8).max(320),
  targetUser: z.string().min(4).max(180),
  solution: z.string().min(8).max(320),
  builderFit: z.string().min(8).max(320),
  septemberScope: z.string().min(8).max(320),
  weeklyOutline: z.array(z.string().min(3).max(180)).length(4),
  recommendedStack: z.array(z.string().min(1).max(40)).min(2).max(8),
  monetizationPath: z.string().min(8).max(240),
  launchAngle: z.string().min(8).max(220),
  complexity: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(100),
  source: z.enum(["ai", "curated"]),
});

export const ideaGenerationResponseSchema = z.object({
  ideas: z.array(generatedIdeaSchema).min(1).max(3),
  usage: z.object({
    liveAiUsed: z.boolean(),
    fallbackUsed: z.boolean(),
    remaining: z.number().int().min(0),
  }),
});
