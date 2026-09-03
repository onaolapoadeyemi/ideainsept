import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Download, Save } from "lucide-react";
import { Paywall } from "../billing/Paywall";
import { calculateProgress, supportiveRecoveryCopy } from "./calculations";
import { getActiveSprint, updateSprintDay } from "./sprintRepository";
import { Sprint, SprintDayStatus } from "./types";
import { analytics } from "../../shared/services/analytics";
import { useToast } from "../../shared/components/Toast";

export default function SprintTrackerPage() {
  const [sprint, setSprint] = useState<Sprint | null>(() => getActiveSprint());
  const [selectedDay, setSelectedDay] = useState(1);
  const [saveState, setSaveState] = useState("Saved");
  const { notify } = useToast();
  const selected = sprint?.days.find((day) => day.dayNumber === selectedDay);
  const progress = useMemo(() => (sprint ? calculateProgress(sprint) : null), [sprint]);

  useEffect(() => {
    if (!selected) return;
    const id = window.setTimeout(() => setSaveState("Saved"), 500);
    return () => window.clearTimeout(id);
  }, [selected]);

  if (!sprint) {
    return (
      <section className="panel p-6">
        <h1 className="text-3xl font-black">My Sprint</h1>
        <p className="mt-3 text-muted">Commit to an idea first, then your 30-day tracker will appear here.</p>
        <Link to="/generator" className="button button-primary mt-5">
          Generate My September Idea
        </Link>
      </section>
    );
  }

  function patchDay(patch: { status?: SprintDayStatus; summary?: string; blocker?: string; nextAction?: string; minutesWorked?: number }) {
    const updated = updateSprintDay(selectedDay, patch);
    if (!updated) return;
    setSaveState("Saving");
    setSprint(updated);
    if (patch.status === "completed") analytics.track("sprint_day_completed", { day: selectedDay });
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{sprint.title}</h1>
            <p className="mt-2 text-muted">{sprint.promise}</p>
          </div>
          <span className="chip">Day {selectedDay}</span>
        </div>
        {progress && (
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Metric label="Days completed" value={`${progress.completed}/${progress.total}`} />
            <Metric label="Streak" value={`${progress.streak}`} />
            <Metric label="Milestones" value={`${progress.milestoneProgress}%`} />
            <Metric label="Time remaining" value={`${Math.max(0, 30 - selectedDay)} days`} />
          </div>
        )}
        <div className="mt-6 flex items-center gap-2">
          <CalendarDays className="text-amber-300" aria-hidden="true" />
          <h2 className="text-xl font-black">September 1-30</h2>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10" role="grid" aria-label="Sprint day status calendar">
          {sprint.days.map((day) => (
            <button
              key={day.dayNumber}
              role="gridcell"
              aria-selected={day.dayNumber === selectedDay}
              aria-label={`Day ${day.dayNumber}, ${day.status.replace("_", " ")}`}
              className={`aspect-square rounded-md border text-sm font-black ${
                day.dayNumber === selectedDay
                  ? "border-amber-300 bg-amber-500/25"
                  : day.status === "completed"
                    ? "border-emerald-400/45 bg-emerald-400/18 text-emerald-100"
                    : day.status === "missed"
                      ? "border-rose-400/45 bg-rose-400/12 text-rose-100"
                      : day.status === "rest"
                        ? "border-indigo-300/45 bg-indigo-400/15 text-indigo-100"
                        : "border-white/10 bg-white/5 text-muted"
              }`}
              onClick={() => setSelectedDay(day.dayNumber)}
            >
              {day.dayNumber}
            </button>
          ))}
        </div>
      </div>
      <aside className="grid gap-5">
        {selected && (
          <form className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Day {selected.dayNumber} Dev Log</h2>
              <span className="text-sm text-muted" aria-live="polite">
                {saveState}
              </span>
            </div>
            <div className="mt-4 grid gap-4">
              <label>
                <span className="label">Status</span>
                <select className="field" value={selected.status} onChange={(event) => patchDay({ status: event.target.value as SprintDayStatus })}>
                  <option value="not_started">Not started</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                  <option value="rest">Rest</option>
                </select>
              </label>
              <label>
                <span className="label">What I built</span>
                <textarea className="field min-h-24" value={selected.summary} onChange={(event) => patchDay({ summary: event.target.value })} />
              </label>
              <label>
                <span className="label">Blocker</span>
                <input className="field" value={selected.blocker ?? ""} onChange={(event) => patchDay({ blocker: event.target.value })} />
              </label>
              <label>
                <span className="label">Next smallest action</span>
                <input className="field" value={selected.nextAction ?? ""} onChange={(event) => patchDay({ nextAction: event.target.value })} />
              </label>
              <label>
                <span className="label">Minutes worked</span>
                <input className="field" type="number" min={0} value={selected.minutesWorked ?? ""} onChange={(event) => patchDay({ minutesWorked: Number(event.target.value) || undefined })} />
              </label>
            </div>
            <p className="mt-4 text-sm text-muted">{supportiveRecoveryCopy(selected)}</p>
            <button
              className="button button-primary mt-4"
              type="button"
              onClick={() => {
                notify("Daily log saved.");
                setSaveState("Saved");
              }}
            >
              <Save size={18} aria-hidden="true" />
              Save Day
            </button>
          </form>
        )}
        <div className="panel p-5">
          <h2 className="text-xl font-black">Milestones</h2>
          <div className="mt-4 grid gap-3">
            {sprint.milestones.map((milestone) => (
              <label key={milestone.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3">
                <span>
                  <span className="block font-bold">{milestone.title}</span>
                  <span className="text-xs text-muted">{milestone.targetDate}</span>
                </span>
                <input type="checkbox" defaultChecked={Boolean(milestone.completedAt)} aria-label={`Complete ${milestone.title}`} />
              </label>
            ))}
          </div>
        </div>
        <Paywall feature="Export sprint report" benefit="Sprint Pass creates a clean report with milestones, streaks, and private notes for your portfolio or sponsor update." />
        <button className="button button-ghost" onClick={() => notify("Export requires Sprint Pass. Your sprint data stays intact.", "warning")}>
          <Download size={18} aria-hidden="true" />
          Export Report
        </button>
      </aside>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
