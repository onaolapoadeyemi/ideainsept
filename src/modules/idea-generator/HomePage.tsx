import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Sparkles, Trophy, Zap } from "lucide-react";
import { analytics } from "../../shared/services/analytics";
import IdeaGeneratorPage from "./IdeaGeneratorPage";
import { useSeason } from "../season/SeasonProvider";
import { useFeatureFlags } from "../../app/featureFlags";
import NewsletterSignup from "../newsletter/NewsletterSignup";
import SeasonStatusBanner from "../season/SeasonStatusBanner";

export default function HomePage() {
  const { season } = useSeason();
  const { flags } = useFeatureFlags();
  return (
    <div className="grid gap-8">
      <SeasonStatusBanner />
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
              ["Discover", "AI and curated idea paths turn constraints into a focused build."],
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
              <p className="mt-4 text-3xl font-black">{season.year}</p>
              <p className="text-sm text-muted">Current IdeaInSept season</p>
            </div>
          </div>
          <div className="panel p-5">
            <h2 className="font-black">Your Sprint Workspace</h2>
            <p className="mt-3 text-sm text-muted">After you commit, this is where your real daily logs, milestone progress, and recovery plan live.</p>
            <Link to="/sprint" className="button button-secondary mt-5 w-full">
              Open My Sprint
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      {flags.aiGenerator ? <IdeaGeneratorPage embedded /> : (
        <section className="panel p-6"><h2 className="text-2xl font-black">Idea Generator is temporarily paused</h2><p className="mt-2 text-muted">The Sprint Tracker and Showcase remain available.</p></section>
      )}
      {flags.newsletter ? <NewsletterSignup /> : null}
    </div>
  );
}
