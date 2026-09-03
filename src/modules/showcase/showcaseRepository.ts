import { normalizePublicUrl } from "../../shared/lib/urls";
import { readJson, writeJson } from "../../shared/lib/storage";
import { analytics } from "../../shared/services/analytics";
import { ShowcaseSubmission } from "./types";

const SUBMISSIONS_KEY = "ideainsept.v1.showcaseSubmissions";
const VOTES_KEY = "ideainsept.v1.votes";

const seedSubmissions: ShowcaseSubmission[] = [
  {
    id: "seed-invoiceflow",
    ownerId: "seed",
    seasonYear: 2026,
    projectName: "InvoiceFlow",
    tagline: "Clean invoices and follow-ups for freelancers.",
    pitch: "A September build that turns awkward invoice follow-up into a simple weekly workflow.",
    techStack: ["React", "Stripe", "Postgres"],
    liveUrl: "https://example.com/invoiceflow",
    repositoryUrl: "https://github.com/example/invoiceflow",
    moderationStatus: "approved",
    creatorDisplayName: "Maya",
    creatorPublic: true,
    votes: 128,
    featured: true,
    officialRank: 2,
    submittedAt: "2026-09-29T18:00:00.000Z",
    approvedAt: "2026-09-30T16:00:00.000Z",
  },
  {
    id: "seed-deploymate",
    ownerId: "seed",
    seasonYear: 2026,
    projectName: "DeployMate",
    tagline: "Zero-downtime launch checklists made simple.",
    pitch: "A practical launch readiness board for founders who need fewer production surprises.",
    techStack: ["SvelteKit", "Supabase", "Tailwind"],
    liveUrl: "https://example.com/deploymate",
    repositoryUrl: "https://github.com/example/deploymate",
    moderationStatus: "approved",
    creatorDisplayName: "Jon",
    creatorPublic: true,
    votes: 98,
    featured: false,
    submittedAt: "2026-09-28T18:00:00.000Z",
    approvedAt: "2026-09-30T16:00:00.000Z",
  },
];

export function getSubmissions() {
  return readJson<ShowcaseSubmission[]>(SUBMISSIONS_KEY, seedSubmissions);
}

export function getApprovedSubmissions() {
  return getSubmissions().filter((submission) => submission.moderationStatus === "approved");
}

export function saveDraftSubmission(submission: ShowcaseSubmission) {
  const submissions = getSubmissions().filter((item) => item.id !== submission.id);
  writeJson(SUBMISSIONS_KEY, [submission, ...submissions]);
}

export async function submitProject(input: Omit<ShowcaseSubmission, "id" | "votes" | "featured" | "moderationStatus" | "seasonYear">) {
  analytics.track("showcase_submission_started", { hasRepository: Boolean(input.repositoryUrl) });
  normalizePublicUrl(input.liveUrl);
  if (input.repositoryUrl) normalizePublicUrl(input.repositoryUrl);
  const submission: ShowcaseSubmission = {
    ...input,
    id: crypto.randomUUID(),
    seasonYear: 2026,
    moderationStatus: "pending",
    votes: 0,
    featured: false,
    submittedAt: new Date().toISOString(),
  };
  saveDraftSubmission(submission);
  analytics.track("showcase_submission_completed", { season: 2026 });
  return submission;
}

export function castVote(submissionId: string, voterId: string) {
  const votes = readJson<string[]>(VOTES_KEY, []);
  const voteKey = `${submissionId}:${voterId}`;
  if (votes.includes(voteKey)) throw new Error("You have already voted for this project.");
  const submissions = getSubmissions().map((submission) =>
    submission.id === submissionId ? { ...submission, votes: submission.votes + 1 } : submission,
  );
  writeJson(VOTES_KEY, [...votes, voteKey]);
  writeJson(SUBMISSIONS_KEY, submissions);
  analytics.track("vote_cast", { submissionId });
}

export function moderateSubmission(submissionId: string, status: "approved" | "rejected", note: string) {
  const submissions = getSubmissions().map((submission) =>
    submission.id === submissionId
      ? {
          ...submission,
          moderationStatus: status,
          moderationNote: note,
          approvedAt: status === "approved" ? new Date().toISOString() : undefined,
        }
      : submission,
  );
  writeJson(SUBMISSIONS_KEY, submissions);
}
