import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { errorResponse, json, parseJson, requireUser, supabaseAdmin } from "./_shared";

const schema = z.object({ action: z.enum(["export", "delete"]) });

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    const user = await requireUser(event.headers.authorization);
    const body = await parseJson(event.body, schema, 1000);
    const supabase = supabaseAdmin();
    if (body.action === "export") {
      const [profile, ideas, sprints, submissions] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id),
        supabase.from("ideas").select("*").eq("owner_id", user.id),
        supabase.from("sprints").select("*, sprint_days(*), milestones(*)").eq("owner_id", user.id),
        supabase.from("showcase_submissions").select("*").eq("owner_id", user.id),
      ]);
      return json({ export: { profile: profile.data, ideas: ideas.data, sprints: sprints.data, submissions: submissions.data } }, 200, requestId);
    }
    await supabase.from("profiles").update({ deletion_requested_at: new Date().toISOString() }).eq("id", user.id);
    return json({ deletionRequested: true }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
