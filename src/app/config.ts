import { z } from "zod";

const clientConfigSchema = z.object({
  appUrl: z.string().url().default("http://localhost:5173"),
  supabaseUrl: z.string().url().optional().or(z.literal("")),
  supabasePublishableKey: z.string().optional().or(z.literal("")),
  paymentsEnabled: z.boolean().default(false),
});

export const clientConfig = clientConfigSchema.parse({
  appUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
  paymentsEnabled: import.meta.env.VITE_PAYMENTS_ENABLED === "true",
});

export const hasSupabaseClientConfig = Boolean(
  clientConfig.supabaseUrl && clientConfig.supabasePublishableKey,
);
