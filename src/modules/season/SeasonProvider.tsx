import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../shared/services/supabase";
import { Season } from "./types";

type SeasonContextValue = { season: Season; loading: boolean; refresh: () => Promise<void> };
const SeasonContext = createContext<SeasonContextValue | null>(null);

function unconfiguredSeason(): Season {
  const year = new Date().getUTCFullYear();
  return {
    id: "unconfigured",
    year,
    name: `IdeaInSept ${year}`,
    timezone: "America/Chicago",
    ideaPhaseStart: `${year}-08-01T05:00:00.000Z`,
    ideaPhaseEnd: `${year}-10-01T04:59:59.000Z`,
    buildPhaseStart: `${year}-09-01T05:00:00.000Z`,
    buildPhaseEnd: `${year}-10-01T04:59:59.000Z`,
    submissionPhaseStart: `${year}-09-20T05:00:00.000Z`,
    submissionPhaseEnd: `${year}-10-05T04:59:59.000Z`,
    votingPhaseStart: `${year}-10-05T05:00:00.000Z`,
    votingPhaseEnd: `${year}-10-12T04:59:59.000Z`,
    judgingPhaseStart: `${year}-10-13T05:00:00.000Z`,
    judgingPhaseEnd: `${year}-10-20T05:00:00.000Z`,
    status: "open",
  };
}

function mapSeason(row: Record<string, unknown>): Season {
  return {
    id: String(row.id), year: Number(row.year), name: String(row.name), timezone: String(row.timezone),
    ideaPhaseStart: String(row.idea_phase_start), ideaPhaseEnd: String(row.idea_phase_end),
    buildPhaseStart: String(row.build_phase_start), buildPhaseEnd: String(row.build_phase_end),
    submissionPhaseStart: String(row.submission_phase_start), submissionPhaseEnd: String(row.submission_phase_end),
    votingPhaseStart: String(row.voting_phase_start), votingPhaseEnd: String(row.voting_phase_end),
    judgingPhaseStart: String(row.judging_phase_start), judgingPhaseEnd: String(row.judging_phase_end),
    status: row.status as Season["status"],
  };
}

export function SeasonProvider({ children }: PropsWithChildren) {
  const [season, setSeason] = useState(unconfiguredSeason);
  const [loading, setLoading] = useState(Boolean(supabase));

  async function refresh() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .in("status", ["open", "submission", "voting", "judging", "upcoming"])
      .order("year", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("Season configuration is unavailable.", error.message);
      setLoading(false);
      return;
    }
    if (data) setSeason(mapSeason(data));
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);
  const value = useMemo(() => ({ season, loading, refresh }), [season, loading]);
  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason() {
  const value = useContext(SeasonContext);
  if (!value) throw new Error("useSeason must be used within SeasonProvider");
  return value;
}
