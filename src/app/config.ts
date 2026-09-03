import { z } from "zod";

const clientConfigSchema = z.object({
  appUrl: z.string().url().default("http://localhost:5173"),
  supabaseUrl: z.string().url().optional().or(z.literal("")),
  supabasePublishableKey: z.string().optional().or(z.literal("")),
  paymentsEnabled: z.boolean().default(false),
});

// The publishable key is designed to be public. This fallback keeps the linked
// Netlify manual deployment operational if its Vite build environment omits
// public variables; it applies only on the production domain.
const productionBrowserConfig = typeof window !== "undefined" && window.location.hostname.endsWith("ideainsept.com")
  ? {
      supabaseUrl: "https://ggwczylcicmnpoksjzhf.supabase.co",
      supabasePublishableKey: "sb_publishable_xW7g4eCVmkDazbk9MF-ilQ_3AJpVm3p",
    }
  : { supabaseUrl: "", supabasePublishableKey: "" };

export const clientConfig = clientConfigSchema.parse({
  appUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || productionBrowserConfig.supabaseUrl,
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || productionBrowserConfig.supabasePublishableKey,
  paymentsEnabled: import.meta.env.VITE_PAYMENTS_ENABLED === "true",
});

export const hasSupabaseClientConfig = Boolean(
  clientConfig.supabaseUrl && clientConfig.supabasePublishableKey,
);
