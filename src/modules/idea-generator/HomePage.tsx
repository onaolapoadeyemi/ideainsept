import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Sparkles, Trophy, Zap } from "lucide-react";
import { analytics } from "../../shared/services/analytics";
import IdeaGeneratorPage from "./IdeaGeneratorPage";

export default function HomePage() {
  return (
    <div className="grid gap-8">
      <section className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="pt-4 lg:pt-8">
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-[3.65rem]">
            Turn your skills into one launched product this September.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Generate a focused idea, build it with a 30-day sprint, and showcase what you ship.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/generator"
              className="button button-primary"
              onClick={() => analytics.track("landing_cta_clicked", { cta: "generate" })}
            >
              <Sparkles size={18} aria-hidden="true" />
              Generate My September Idea
            </Link>
            <Link
              to="/showcase"
              className="button button-secondary"
              onClick={() => analytics.track("landing_cta_clicked", { cta: "showcase" })}
            >
              <Trophy size={18} aria-hidden="true" />
              Explore the Showcase
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Discover", "AI plus curated fallbacks turn constraints into a focused build."],
              ["Commit", "A 30-day sprint creates daily logs, milestones, and recovery paths."],
              ["Showcase", "Moderated submissions and community choice turn shipping into recognition."],
            ].map(([title, body]) => (
              <div key={title} className="border-l border-amber-400/50 pl-4">
                <h2 className="font-black">{title}</h2>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 pt-2 lg:pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-5">
              <CalendarDays className="text-amber-300" aria-hidden="true" />
              <p className="mt-4 text-3xl font-black">30</p>
              <p className="text-sm text-muted">September sprint days</p>
            </div>
            <div className="panel p-5">
              <Zap className="text-indigo-300" aria-hidden="true" />
              <p className="mt-4 text-3xl font-black">$29</p>
              <p className="text-sm text-muted">Annual Sprint Pass, one-time purchase</p>
            </div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Sprint Snapshot</h2>
              <span className="chip">Day 12</span>
            </div>
            <div className="mt-4 grid grid-cols-10 gap-1.5" aria-label="Example 30 day progress grid">
              {Array.from({ length: 30 }, (_, index) => (
                <span
                  key={index}
                  className={`aspect-square rounded-md border text-center text-xs leading-7 ${
                    index < 11 ? "border-emerald-400/40 bg-emerald-400/16 text-emerald-100" : "border-white/10 bg-white/5 text-muted"
                  }`}
                >
                  {index + 1}
                </span>
              ))}
            </div>
            <Link to="/sprint" className="button button-secondary mt-5 w-full">
              Open My Sprint
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <IdeaGeneratorPage embedded />
    </div>
  );
}
