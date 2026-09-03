import type { Handler } from "@netlify/functions";
import { errorResponse, json, requireModerator, supabaseAdmin } from "./_shared";

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    await requireModerator(event.headers.authorization);
    const supabase = supabaseAdmin();
    const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
    const [usage, pending, flags] = await Promise.all([
      supabase.from("ai_usage").select("request_count").gte("created_at", monthStart),
      supabase.from("showcase_submissions").select("id", { count: "exact", head: true }).eq("moderation_status", "pending"),
      supabase.from("feature_flags").select("key, enabled"),
    ]);
    if (usage.error) throw usage.error;
    if (pending.error) throw pending.error;
    if (flags.error) throw flags.error;
    return json({ metrics: {
      aiCallsThisMonth: (usage.data || []).reduce((sum, item) => sum + item.request_count, 0),
      pendingSubmissions: pending.count || 0,
      flags: Object.fromEntries((flags.data || []).map((item) => [item.key, item.enabled])),
    } }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
