import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { errorResponse, json, parseJson, requireUser, supabaseAdmin } from "./_shared";
import { publicUrlSchema } from "../../src/shared/lib/urls";

const schema = z.object({
  sprintId: z.string().uuid(),
  projectName: z.string().min(2).max(90),
  tagline: z.string().min(4).max(150),
  pitch: z.string().min(20).max(1600),
  techStack: z.array(z.string().min(1).max(40)).min(1).max(12),
  liveUrl: publicUrlSchema,
  repositoryUrl: publicUrlSchema.optional(),
  demoVideoUrl: publicUrlSchema.optional(),
  ownsWork: z.literal(true),
  acceptsRules: z.literal(true),
  company: z.string().max(0),
});

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    const user = await requireUser(event.headers.authorization);
    const body = await parseJson(event.body, schema, 5000);
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("showcase_submissions")
      .insert({
        owner_id: user.id,
        sprint_id: body.sprintId,
        season_id: null,
        project_name: body.projectName,
        tagline: body.tagline,
        pitch: body.pitch,
        tech_stack: body.techStack,
        live_url: body.liveUrl,
        repository_url: body.repositoryUrl,
        demo_video_url: body.demoVideoUrl,
        moderation_status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .select("id, moderation_status")
      .single();
    if (error) throw error;
    return json({ submission: data }, 201, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
