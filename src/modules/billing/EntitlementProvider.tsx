import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../shared/services/supabase";
import { useAuth } from "../auth/AuthProvider";
import { useSeason } from "../season/SeasonProvider";
import { Entitlement, freeEntitlement, sprintPassEntitlement } from "./entitlements";

type Value = { entitlement: Entitlement; loading: boolean; refresh: () => Promise<void> };
const EntitlementContext = createContext<Value | null>(null);

export function EntitlementProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const { season } = useSeason();
  const [entitlement, setEntitlement] = useState<Entitlement>({ ...freeEntitlement, seasonYear: season.year });
  const [loading, setLoading] = useState(Boolean(supabase && user));

  async function refresh() {
    if (!supabase || !user) {
      setEntitlement({ ...freeEntitlement, seasonYear: season.year });
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("entitlements").select("id").eq("user_id", user.id).eq("season_year", season.year).eq("status", "active").gt("ends_at", new Date().toISOString()).limit(1).maybeSingle();
    if (error) {
      console.warn("Entitlement lookup failed; retaining free access.", error.message);
      setEntitlement({ ...freeEntitlement, seasonYear: season.year });
      setLoading(false);
      return;
    }
    setEntitlement(data ? { ...sprintPassEntitlement, seasonYear: season.year } : { ...freeEntitlement, seasonYear: season.year });
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, [season.year, user?.id]);
  const value = useMemo(() => ({ entitlement, loading, refresh }), [entitlement, loading]);
  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement() {
  const value = useContext(EntitlementContext);
  if (!value) throw new Error("useEntitlement must be used within EntitlementProvider");
  return value;
}
