import { FormEvent, useMemo, useState } from "react";
import { ExternalLink, Search, Send, ThumbsUp } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { castVote, getApprovedSubmissions, submitProject } from "./showcaseRepository";
import { ShowcaseSubmission } from "./types";
import { useToast } from "../../shared/components/Toast";

export default function ShowcasePage() {
  const [query, setQuery] = useState("");
  const [stack, setStack] = useState("");
  const [submissions, setSubmissions] = useState<ShowcaseSubmission[]>(() => getApprovedSubmissions());
  const { user } = useAuth();
  const { notify } = useToast();
  const filtered = useMemo(
    () =>
      submissions.filter((submission) => {
        const text = `${submission.projectName} ${submission.tagline} ${submission.pitch} ${submission.techStack.join(" ")}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (!stack || submission.techStack.some((item) => item.toLowerCase().includes(stack.toLowerCase())));
      }),
    [query, stack, submissions],
  );

  function vote(id: string) {
    if (!user) {
      notify("Sign in before voting so one-person-one-vote can be enforced.", "warning");
      return;
    }
    try {
      castVote(id, user.id);
      setSubmissions(getApprovedSubmissions());
      notify("Vote counted.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Vote failed.", "error");
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Showcase</h1>
            <p className="mt-2 text-muted">Approved projects appear here. Community choice and official judging are displayed separately.</p>
          </div>
          <span className="chip">2026 season</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
          <label>
            <span className="label">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-muted" size={18} aria-hidden="true" />
              <input className="field pl-10" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </label>
          <label>
            <span className="label">Stack filter</span>
            <input className="field" value={stack} onChange={(event) => setStack(event.target.value)} placeholder="React, Supabase" />
          </label>
        </div>
        <div className="mt-5 grid gap-3">
          {filtered.length ? (
            filtered.map((submission) => (
              <article key={submission.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">{submission.projectName}</h2>
                    <p className="text-muted">{submission.tagline}</p>
                    <p className="mt-3 text-sm">{submission.pitch}</p>
                    <p className="mt-3 text-sm text-muted">
                      Creator: {submission.creatorPublic ? submission.creatorDisplayName : "Private builder"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{submission.votes}</p>
                    <p className="text-xs text-muted">Community votes</p>
                    {submission.officialRank ? <p className="mt-2 text-xs text-amber-300">Official rank #{submission.officialRank}</p> : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {submission.techStack.map((item) => (
                    <span className="chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a className="button button-secondary" href={submission.liveUrl} target="_blank" rel="noreferrer">
                    Live demo
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                  {submission.repositoryUrl ? (
                    <a className="button button-ghost" href={submission.repositoryUrl} target="_blank" rel="noreferrer">
                      Repository
                      <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  ) : null}
                  <button className="button button-primary" onClick={() => vote(submission.id)}>
                    <ThumbsUp size={17} aria-hidden="true" />
                    Vote
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-white/10 p-5 text-muted">No approved projects match this filter yet.</div>
          )}
        </div>
      </div>
      <SubmissionForm />
    </section>
  );
}

function SubmissionForm() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({
    projectName: "",
    tagline: "",
    techStack: "",
    liveUrl: "",
    repositoryUrl: "",
    demoVideoUrl: "",
    pitch: "",
    ownsWork: false,
    acceptsRules: false,
    company: "",
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.company) return;
    if (!user) {
      notify("Sign in to submit a project.", "warning");
      return;
    }
    if (!form.ownsWork || !form.acceptsRules) {
      notify("Confirm ownership and showcase rules before submitting.", "warning");
      return;
    }
    try {
      await submitProject({
        ownerId: user.id,
        projectName: form.projectName,
        tagline: form.tagline,
        pitch: form.pitch,
        techStack: form.techStack.split(",").map((item) => item.trim()).filter(Boolean),
        liveUrl: form.liveUrl,
        repositoryUrl: form.repositoryUrl || undefined,
        demoVideoUrl: form.demoVideoUrl || undefined,
        creatorDisplayName: user.displayName,
        creatorPublic: true,
      });
      notify("Submitted for moderation. It will stay out of the public feed until approved.");
      setForm({ projectName: "", tagline: "", techStack: "", liveUrl: "", repositoryUrl: "", demoVideoUrl: "", pitch: "", ownsWork: false, acceptsRules: false, company: "" });
    } catch (error) {
      notify(error instanceof Error ? error.message : "Submission failed.", "error");
    }
  }

  return (
    <form className="panel p-5" onSubmit={submit}>
      <h2 className="text-2xl font-black">Submit Finished Build</h2>
      <p className="mt-2 text-sm text-muted">Submissions enter moderation first. Priority review means faster review, not guaranteed ranking.</p>
      <div className="mt-5 grid gap-4">
        <input className="hidden" tabIndex={-1} autoComplete="off" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} aria-hidden="true" />
        <Field label="Project name" value={form.projectName} onChange={(value) => setForm({ ...form, projectName: value })} required />
        <Field label="Tagline" value={form.tagline} onChange={(value) => setForm({ ...form, tagline: value })} required />
        <Field label="Tech stack" value={form.techStack} onChange={(value) => setForm({ ...form, techStack: value })} placeholder="React, Supabase, Netlify" required />
        <Field label="Live link" value={form.liveUrl} onChange={(value) => setForm({ ...form, liveUrl: value })} required />
        <Field label="Repository link" value={form.repositoryUrl} onChange={(value) => setForm({ ...form, repositoryUrl: value })} />
        <Field label="Demo video link" value={form.demoVideoUrl} onChange={(value) => setForm({ ...form, demoVideoUrl: value })} />
        <label>
          <span className="label">Pitch</span>
          <textarea className="field min-h-28" value={form.pitch} onChange={(event) => setForm({ ...form, pitch: event.target.value })} required />
        </label>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" checked={form.ownsWork} onChange={(event) => setForm({ ...form, ownsWork: event.target.checked })} />
          I own or am authorized to submit this project.
        </label>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" checked={form.acceptsRules} onChange={(event) => setForm({ ...form, acceptsRules: event.target.checked })} />
          I agree to the showcase rules and community guidelines.
        </label>
        <button className="button button-primary" type="submit">
          <Send size={18} aria-hidden="true" />
          Submit for Review
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, required = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}
