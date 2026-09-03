import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { errorResponse, json, parseJson, requireModerator, supabaseAdmin } from "./_shared";

const schema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  note: z.string().min(3).max(500),
});

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    await requireModerator(event.headers.authorization);
    const body = await parseJson(event.body, schema, 1200);
    const { data, error } = await supabaseAdmin().from("showcase_submissions").update({
      moderation_status: body.status,
      moderation_note: body.note,
      approved_at: body.status === "approved" ? new Date().toISOString() : null,
    }).eq("id", body.submissionId).select("id, moderation_status").single();
    if (error) throw error;
    return json({ submission: data }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
