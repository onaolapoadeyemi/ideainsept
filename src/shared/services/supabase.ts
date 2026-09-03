import { createClient } from "@supabase/supabase-js";
import { clientConfig, hasSupabaseClientConfig } from "../../app/config";

export const supabase = hasSupabaseClientConfig
  ? createClient(clientConfig.supabaseUrl!, clientConfig.supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured for this deployment.");
  return supabase;
}
