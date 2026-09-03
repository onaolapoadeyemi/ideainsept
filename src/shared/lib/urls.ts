import { z } from "zod";

export const publicUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return url.protocol === "https:" || (local && url.protocol === "http:");
  }, "Use https URLs, except localhost during development.");

export function normalizePublicUrl(value: string) {
  return publicUrlSchema.parse(value.trim());
}
