import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { getSubmissions, moderateSubmission } from "../showcase/showcaseRepository";
import { ShowcaseSubmission } from "../showcase/types";
import { useToast } from "../../shared/components/Toast";

export default function AdminPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [submissions, setSubmissions] = useState<ShowcaseSubmission[]>(() => getSubmissions());

  if (user?.role !== "admin" && user?.role !== "moderator") {
    return (
      <section className="panel p-6">
        <h1 className="text-3xl font-black">Admin</h1>
        <p className="mt-3 text-muted">Moderator access is enforced by server-side roles and RLS in production. Use an email containing admin in demo mode to preview this surface.</p>
      </section>
    );
  }

  function review(id: string, status: "approved" | "rejected") {
    moderateSubmission(id, status, status === "approved" ? "Approved for public showcase." : "Rejected after moderation review.");
    setSubmissions(getSubmissions());
    notify(`Submission ${status}.`);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="panel p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-amber-300" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-black">Moderation Queue</h1>
            <p className="text-muted">Pending submissions are reviewed before public listing.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {submissions.filter((submission) => submission.moderationStatus === "pending").length ? (
            submissions
              .filter((submission) => submission.moderationStatus === "pending")
              .map((submission) => (
                <article key={submission.id} className="rounded-lg border border-white/10 p-4">
                  <h2 className="text-xl font-black">{submission.projectName}</h2>
                  <p className="text-muted">{submission.tagline}</p>
                  <p className="mt-2 text-sm">{submission.pitch}</p>
                  <div className="mt-4 flex gap-3">
                    <button className="button button-primary" onClick={() => review(submission.id, "approved")}>
                      Approve
                    </button>
                    <button className="button button-ghost" onClick={() => review(submission.id, "rejected")}>
                      Reject
                    </button>
                  </div>
                </article>
              ))
          ) : (
            <p className="rounded-lg border border-white/10 p-4 text-muted">No pending submissions.</p>
          )}
        </div>
      </div>
      <aside className="panel p-5">
        <h2 className="text-xl font-black">Owner Metrics</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <Metric label="AI calls" value="demo: local fallback" />
          <Metric label="AI fallbacks" value="available" />
          <Metric label="Cost mode" value="free" />
          <Metric label="Billing capable" value="disabled until env configured" />
          <Metric label="Emergency switches" value="liveAI, fileUploads" />
        </dl>
      </aside>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <dt className="font-black">{label}</dt>
      <dd className="mt-1 text-muted">{value}</dd>
    </div>
  );
}
