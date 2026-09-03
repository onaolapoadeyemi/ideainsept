import { z } from "zod";

const clientConfigSchema = z.object({
  appUrl: z.string().url().default("http://localhost:5173"),
  supabaseUrl: z.string().url().optional().or(z.literal("")),
  supabasePublishableKey: z.string().optional().or(z.literal("")),
});

export const clientConfig = clientConfigSchema.parse({
  appUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
});

export const hasSupabaseClientConfig = Boolean(
  clientConfig.supabaseUrl && clientConfig.supabasePublishableKey,
);
