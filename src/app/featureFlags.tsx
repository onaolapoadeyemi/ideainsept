import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../shared/services/supabase";

export type FeatureFlagKey = "aiGenerator" | "sprintTracker" | "showcase" | "billing" | "newsletter" | "liveAI" | "fileUploads";
export type FeatureFlags = Record<FeatureFlagKey, boolean>;

export const defaultFeatureFlags: FeatureFlags = {
  aiGenerator: true,
  sprintTracker: true,
  showcase: true,
  billing: true,
  newsletter: true,
  liveAI: false,
  fileUploads: false,
};

type FeatureFlagContextValue = { flags: FeatureFlags; loading: boolean; refresh: () => Promise<void> };
const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

export function FeatureFlagProvider({ children }: PropsWithChildren) {
  const [flags, setFlags] = useState(defaultFeatureFlags);
  const [loading, setLoading] = useState(Boolean(supabase));

  async function refresh() {
    if (!supabase) return;
    const { data, error } = await supabase.from("feature_flags").select("key, enabled");
    if (error) {
      console.warn("Feature flags unavailable; using safe defaults.", error.message);
      setLoading(false);
      return;
    }
    setFlags((current) => {
      const next = { ...current };
      for (const item of data || []) {
        if (item.key in next) next[item.key as FeatureFlagKey] = Boolean(item.enabled);
      }
      return next;
    });
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);
  const value = useMemo(() => ({ flags, loading, refresh }), [flags, loading]);
  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

export function useFeatureFlags() {
  const value = useContext(FeatureFlagContext);
  if (!value) throw new Error("useFeatureFlags must be used within FeatureFlagProvider");
  return value;
}

export function isFeatureEnabled(flags: FeatureFlags, key: FeatureFlagKey) {
  return flags[key] === true;
}
