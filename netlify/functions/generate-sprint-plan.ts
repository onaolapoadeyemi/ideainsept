import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { errorResponse, json, parseJson, requireUser } from "./_shared";

const requestSchema = z.object({ sprintId: z.string().uuid(), ideaTitle: z.string().min(2).max(120) });

export const handler: Handler = async (event) => {
  const requestId = crypto.randomUUID();
  try {
    await requireUser(event.headers.authorization);
    const body = await parseJson(event.body, requestSchema, 2000);
    const days = Array.from({ length: 30 }, (_, index) => ({
      dayNumber: index + 1,
      focus: index < 7 ? "Validate and lock scope" : index < 18 ? "Build the functional MVP" : index < 25 ? "Test and polish" : "Launch and submit",
      nextAction: `Move ${body.ideaTitle} one concrete step closer to launch.`,
    }));
    return json({ days }, 200, requestId);
  } catch (error) {
    return errorResponse(error, requestId);
  }
};
