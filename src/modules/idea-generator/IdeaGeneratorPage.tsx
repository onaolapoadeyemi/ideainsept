import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitCompare, RefreshCw, Rocket, Save, Sparkles } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { Paywall } from "../billing/Paywall";
import { freeEntitlement } from "../billing/entitlements";
import { GeneratedIdea, IdeaRequest } from "./types";
import { buildIdeaGuidance, generateIdeas, saveIdea } from "./ideaRepository";
import { createSprintFromIdea } from "../sprint-tracker/sprintRepository";
import { analytics } from "../../shared/services/analytics";
import { useToast } from "../../shared/components/Toast";
import { useSeason } from "../season/SeasonProvider";
import { useEntitlement } from "../billing/EntitlementProvider";

const initialRequest: IdeaRequest = {
  skills: "web design, marketing, React",
  interests: "digital products, creator businesses",
  audience: "independent creators and solo founders",
  hoursPerWeek: 8,
  buildType: "saas",
  experienceLevel: "intermediate",
  constraint: "free-tools",
  guest: true,
};

export default function IdeaGeneratorPage({ embedded = false }: { embedded?: boolean }) {
  const [request, setRequest] = useState<IdeaRequest>(initialRequest);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { season } = useSeason();
  const { notify } = useToast();
  const { entitlement } = useEntitlement();
  const navigate = useNavigate();
  const selectedIdea = ideas.find((idea) => idea.id === selectedId) ?? ideas[0];
  const [guidance, setGuidance] = useState<{ refine: string; pivot: string } | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const generated = await generateIdeas({ ...request, guest: !user });
      setIdeas(generated);
      setSelectedId(generated[0]?.id ?? null);
      setGuidance(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Idea generation is temporarily unavailable.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function commit() {
    if (!selectedIdea) return;
    analytics.track("sprint_commit_started", { source: selectedIdea.source });
    if (!user) {
      notify("Sign in to save your idea and commit to a sprint.", "warning");
      navigate("/account");
      return;
    }
    try {
      const ideaId = await saveIdea(selectedIdea, user.id, season.id);
      await createSprintFromIdea(selectedIdea, user.id, season, ideaId);
      analytics.track("sprint_committed", { source: selectedIdea.source });
      notify("Sprint committed. Day one is ready.");
      navigate("/sprint");
    } catch (error) {
      notify(error instanceof Error ? error.message : "The sprint could not be committed.", "error");
    }
  }

  return (
    <section className={embedded ? "grid gap-5 lg:grid-cols-[0.95fr_1.05fr]" : "grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"}>
      <form className="panel p-5" onSubmit={submit}>
        <div className="flex items-center gap-3">
          <Sparkles className="text-amber-300" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-black">AI Idea Generator</h1>
            <p className="text-sm text-muted">Try one curated idea before signing in. Signed-in builders can save and commit their work.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          <label>
            <span className="label">Skills or technologies</span>
            <input className="field" value={request.skills} onChange={(event) => setRequest({ ...request, skills: event.target.value })} />
          </label>
          <label>
            <span className="label">Interests or industries</span>
            <input className="field" value={request.interests} onChange={(event) => setRequest({ ...request, interests: event.target.value })} />
          </label>
          <label>
            <span className="label">Audience or problem area</span>
            <input className="field" value={request.audience} onChange={(event) => setRequest({ ...request, audience: event.target.value })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Hours per week</span>
              <input
                className="field"
                type="number"
                min={2}
                max={40}
                value={request.hoursPerWeek}
                onChange={(event) => setRequest({ ...request, hoursPerWeek: Number(event.target.value) })}
              />
            </label>
            <label>
              <span className="label">Build type</span>
              <select className="field" value={request.buildType} onChange={(event) => setRequest({ ...request, buildType: event.target.value as IdeaRequest["buildType"] })}>
                <option value="saas">SaaS</option>
                <option value="mobile">Mobile</option>
                <option value="content">Content product</option>
                <option value="automation">Automation</option>
                <option value="hardware">Hardware/IoT</option>
                <option value="data">Data tool</option>
                <option value="surprise">Surprise me</option>
              </select>
            </label>
            <label>
              <span className="label">Experience level</span>
              <select className="field" value={request.experienceLevel} onChange={(event) => setRequest({ ...request, experienceLevel: event.target.value as IdeaRequest["experienceLevel"] })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label>
              <span className="label">Constraint</span>
              <select className="field" value={request.constraint} onChange={(event) => setRequest({ ...request, constraint: event.target.value as IdeaRequest["constraint"] })}>
                <option value="free-tools">Free tools only</option>
                <option value="low-budget">Low budget</option>
                <option value="flexible">Flexible</option>
              </select>
            </label>
          </div>
          <button className="button button-primary w-full" disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
            Generate Idea
          </button>
        </div>
      </form>
      <div className="grid gap-4">
        {selectedIdea ? (
          <article className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-amber-300">Your Generated Idea</p>
                <h2 className="mt-1 text-3xl font-black">{selectedIdea.title}</h2>
                <p className="mt-2 text-muted">{selectedIdea.promise}</p>
              </div>
              <span className="chip">{selectedIdea.source === "ai" ? "AI" : "Curated"} · {selectedIdea.confidence}% confidence</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Info title="Painful problem" text={selectedIdea.painfulProblem} />
              <Info title="Specific target user" text={selectedIdea.targetUser} />
              <Info title="Smallest September scope" text={selectedIdea.septemberScope} />
              <Info title="Monetization path" text={selectedIdea.monetizationPath} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedIdea.recommendedStack.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="button button-primary" onClick={() => void commit()}>
                <Rocket size={18} aria-hidden="true" />
                Commit to this Sprint
              </button>
              <button
                className="button button-secondary"
                onClick={() => void saveIdea(selectedIdea, user?.id, season.id)
                  .then(() => notify("Idea saved."))
                  .catch((error) => notify(error instanceof Error ? error.message : "Idea could not be saved.", "error"))}
              >
                <Save size={18} aria-hidden="true" />
                Save Idea
              </button>
              <button className="button button-ghost" onClick={() => notify("Compare mode is showing all generated ideas below.", "info")}>
                <GitCompare size={18} aria-hidden="true" />
                Compare
              </button>
              <button
                className="button button-secondary"
                onClick={() => {
                  if (entitlement.plan !== "sprint_pass") {
                    notify("Sprint Pass unlocks guided refinement and pivots.", "warning");
                    return;
                  }
                  setGuidance(buildIdeaGuidance(selectedIdea));
                }}
              >
                <Sparkles size={18} aria-hidden="true" />
                Refine & Pivot
              </button>
            </div>
            {guidance ? (
              <div className="mt-5 grid gap-3 rounded-lg border border-amber-300/30 bg-amber-400/5 p-4 text-sm">
                <p><span className="font-black text-amber-200">Refine:</span> {guidance.refine}</p>
                <p><span className="font-black text-amber-200">Pivot:</span> {guidance.pivot}</p>
              </div>
            ) : null}
          </article>
        ) : (
          <article className="panel p-5">
            <h2 className="text-2xl font-black">Your September idea will appear here</h2>
            <p className="mt-2 text-muted">The first result is immediate. Signed-in users receive three options per generation while quota remains.</p>
          </article>
        )}
        {ideas.length > 1 && (
          <div className="grid gap-3 md:grid-cols-3">
            {ideas.map((idea) => (
              <button key={idea.id} className={`panel p-4 text-left ${idea.id === selectedId ? "border-amber-400/70" : ""}`} onClick={() => setSelectedId(idea.id)}>
                <span className="text-sm font-black">{idea.title}</span>
                <p className="mt-2 text-xs text-muted">{idea.promise}</p>
              </button>
            ))}
          </div>
        )}
        <Paywall feature="Refine and plan" benefit="Sprint Pass unlocks guided refinement, pivot suggestions, and a structured 30-day execution plan." />
        <p className="text-xs text-muted">Free live-AI allowance: {freeEntitlement.aiGenerationsPerSeason} requests within the configured quota window. Curated ideas remain available when the live limit is reached.</p>
        {!embedded && (
          <Link to="/showcase" className="button button-secondary justify-self-start">
            Explore the Showcase
          </Link>
        )}
      </div>
    </section>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-black">{title}</h3>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </div>
  );
}
