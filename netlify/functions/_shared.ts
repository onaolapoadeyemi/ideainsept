import { HandlerResponse } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { AppError, toSafeError } from "../../src/shared/errors/AppError";

export const serverConfigSchema = z.object({
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SECRET_KEY: z.string().min(10).optional(),
  GEMINI_API_KEY: z.string().min(10).optional(),
  STRIPE_SECRET_KEY: z.string().min(10).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(10).optional(),
  STRIPE_SPRINT_PASS_PRICE_ID: z.string().min(3).optional(),
  APP_URL: z.string().url().default("http://localhost:5173"),
  ADMIN_EMAILS: z.string().default(""),
  COST_MODE: z.enum(["free", "revenue"]).default("free"),
  ALLOW_PAID_INFRA: z.enum(["true", "false"]).default("false"),
  PAYMENTS_ENABLED: z.enum(["true", "false"]).default("false"),
  LIVE_AI_ENABLED: z.enum(["true", "false"]).default("false"),
  AI_FREE_USER_MONTHLY_LIMIT: z.coerce.number().int().min(0).default(3),
  AI_GLOBAL_MONTHLY_LIMIT: z.coerce.number().int().min(0).default(500),
  AI_LIVE_CUTOFF_PERCENT: z.coerce.number().int().min(1).max(100).default(80),
  AI_QUOTA_PEPPER: z.string().min(16).optional(),
});

export function config() {
  return serverConfigSchema.parse(process.env);
}

export function json(body: unknown, statusCode = 200, requestId = crypto.randomUUID()): HandlerResponse {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "x-request-id": requestId,
    },
    body: JSON.stringify({ requestId, ...((body && typeof body === "object") ? body : { data: body }) }),
  };
}

export function errorResponse(error: unknown, requestId = crypto.randomUUID()): HandlerResponse {
  const appError = toSafeError(error);
  return json({ error: { kind: appError.kind, message: appError.message } }, appError.status, requestId);
}

export function assertFreeCostGuard() {
  const env = config();
  if (env.COST_MODE === "free" && env.ALLOW_PAID_INFRA !== "false") {
    throw new AppError("configuration", "Paid infrastructure is blocked while COST_MODE=free.", 503);
  }
  return env;
}

export function supabaseAdmin() {
  const env = config();
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new AppError("configuration", "Supabase server credentials are not configured.", 503);
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
  });
}

export async function parseJson<T>(body: string | null, schema: z.ZodSchema<T>, maxBytes = 10000): Promise<T> {
  if (!body) throw new AppError("validation", "Missing request body.", 400);
  if (new TextEncoder().encode(body).length > maxBytes) throw new AppError("validation", "Request body is too large.", 413);
  return schema.parse(JSON.parse(body));
}

export async function requireUser(authorizationHeader?: string) {
  if (!authorizationHeader?.startsWith("Bearer ")) throw new AppError("authentication", "Authentication is required.", 401);
  const client = supabaseAdmin();
  const token = authorizationHeader.replace("Bearer ", "");
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new AppError("authentication", "Session is invalid or expired.", 401);
  return data.user;
}

export async function optionalUser(authorizationHeader?: string) {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  return requireUser(authorizationHeader);
}

export async function requireModerator(authorizationHeader?: string) {
  const user = await requireUser(authorizationHeader);
  const { data, error } = await supabaseAdmin().from("profiles").select("role").eq("id", user.id).single();
  if (error || !data || !["moderator", "admin"].includes(data.role)) throw new AppError("authorization", "Moderator access is required.", 403);
  return user;
}

export async function getActiveSeason() {
  const { data, error } = await supabaseAdmin().from("seasons").select("*").in("status", ["open", "submission", "voting", "judging", "upcoming"]).order("year", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError("configuration", "No active IdeaInSept season is configured.", 503);
  return data;
}

export function isAdminEmail(email: string | undefined) {
  const emails = config()
    .ADMIN_EMAILS.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && emails.includes(email.toLowerCase()));
}
