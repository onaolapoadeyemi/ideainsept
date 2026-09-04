import { CalendarClock } from "lucide-react";
import { calculateSeasonPhase } from "./seasonPhase";
import { useSeason } from "./SeasonProvider";

export default function SeasonStatusBanner() {
  const { season } = useSeason();
  const phase = calculateSeasonPhase(season, new Date());
  if (phase === "open" || phase === "submission" || phase === "voting" || phase === "judging") return null;

  const message = phase === "upcoming"
    ? `${season.name} registration has not opened yet. Join the newsletter so you receive the opening date and preparation prompts.`
    : `${season.name} has ended. Registration is closed for this season; join the newsletter for winner updates and the next season’s opening date.`;
  return (
    <section className="rounded-xl border border-indigo-300/35 bg-indigo-400/10 p-4" aria-label="Season status">
      <div className="flex gap-3"><CalendarClock className="mt-0.5 shrink-0 text-indigo-200" size={20} aria-hidden="true" /><p className="text-sm leading-6 text-indigo-100">{message}</p></div>
    </section>
  );
}
