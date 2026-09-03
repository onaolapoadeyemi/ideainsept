import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { errorResponse, json, parseJson, requireUser, supabaseAdmin } from "./_shared";
import { AppError } from "../../src/shared/errors/AppError";

const schema = z.object({ submissionId: z.string().uuid() });

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    const user = await requireUser(event.headers.authorization);
    const body = await parseJson(event.body, schema, 1000);
    const supabase = supabaseAdmin();
    const { error } = await supabase.from("votes").insert({ submission_id: body.submissionId, voter_id: user.id });
    if (error?.code === "23505") throw new AppError("conflict", "You have already voted for this submission.", 409);
    if (error) throw error;
    return json({ voted: true }, 201, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
