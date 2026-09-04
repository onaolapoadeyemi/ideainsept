import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { assertSeasonPhase, errorResponse, getSeasonForId, json, parseJson, requireSprintPass, requireUser, supabaseAdmin } from "./_shared";
import { publicUrlSchema } from "../../src/shared/lib/urls";

const schema = z.object({
  sprintId: z.string().uuid(),
  seasonId: z.string().uuid(),
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
    const season = await getSeasonForId(body.seasonId);
    assertSeasonPhase(season, "submission");
    const { data: sprint, error: sprintError } = await supabase.from("sprints").select("id, season_id").eq("id", body.sprintId).eq("owner_id", user.id).eq("season_id", body.seasonId).maybeSingle();
    if (sprintError) throw sprintError;
    if (!sprint) throw new Error("The selected sprint does not belong to this user and season.");
    let priorityReview = false;
    try {
      await requireSprintPass(user.id, body.seasonId);
      priorityReview = true;
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("Sprint Pass")) throw error;
    }
    const { data, error } = await supabase
      .from("showcase_submissions")
      .insert({
        owner_id: user.id,
        sprint_id: body.sprintId,
        season_id: body.seasonId,
        project_name: body.projectName,
        tagline: body.tagline,
        pitch: body.pitch,
        tech_stack: body.techStack,
        live_url: body.liveUrl,
        repository_url: body.repositoryUrl,
        demo_video_url: body.demoVideoUrl,
        moderation_status: "pending",
        priority_review: priorityReview,
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
