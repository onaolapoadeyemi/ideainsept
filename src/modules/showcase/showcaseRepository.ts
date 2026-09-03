import { normalizePublicUrl } from "../../shared/lib/urls";
import { readJson, writeJson } from "../../shared/lib/storage";
import { analytics } from "../../shared/services/analytics";
import { apiFetch } from "../../shared/services/api";
import { supabase } from "../../shared/services/supabase";
import { Season } from "../season/types";
import { ShowcaseSubmission } from "./types";

const SUBMISSIONS_KEY = "ideainsept.v2.demoShowcaseSubmissions";
const VOTES_KEY = "ideainsept.v2.demoVotes";

const seedSubmissions: ShowcaseSubmission[] = [{
  id: "seed-invoiceflow", ownerId: "seed", seasonYear: new Date().getUTCFullYear(), projectName: "InvoiceFlow",
  tagline: "Clean invoices and follow-ups for freelancers.", pitch: "A September build that turns awkward invoice follow-up into a simple weekly workflow.",
  techStack: ["React", "Stripe", "Postgres"], liveUrl: "https://example.com/invoiceflow", repositoryUrl: "https://github.com/example/invoiceflow",
  moderationStatus: "approved", creatorDisplayName: "Maya", creatorPublic: true, votes: 128, featured: true, officialRank: 2,
}];

type ShowcaseRow = { id: string; owner_id: string; seasons?: { year: number } | null; profiles?: { display_name?: string; public_profile?: boolean } | Array<{ display_name?: string; public_profile?: boolean }> | null; votes?: { count?: number } | Array<{ count?: number }> | null; project_name: string; tagline: string; pitch: string; tech_stack?: string[]; live_url: string; repository_url?: string | null; demo_video_url?: string | null; thumbnail_url?: string | null; moderation_status: ShowcaseSubmission["moderationStatus"]; moderation_note?: string | null; featured?: boolean; official_rank?: number | null; submitted_at?: string | null; approved_at?: string | null };

function mapSubmission(row: ShowcaseRow): ShowcaseSubmission {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const voteAggregate = Array.isArray(row.votes) ? row.votes[0] : row.votes;
  return {
    id: row.id, ownerId: row.owner_id, seasonYear: row.seasons?.year || new Date().getUTCFullYear(),
    projectName: row.project_name, tagline: row.tagline, pitch: row.pitch, techStack: row.tech_stack || [],
    liveUrl: row.live_url, repositoryUrl: row.repository_url || undefined, demoVideoUrl: row.demo_video_url || undefined,
    thumbnailUrl: row.thumbnail_url || undefined, moderationStatus: row.moderation_status, moderationNote: row.moderation_note || undefined,
    creatorDisplayName: profile?.display_name || "Builder", creatorPublic: Boolean(profile?.public_profile),
    votes: Number(voteAggregate?.count || 0), featured: Boolean(row.featured), officialRank: row.official_rank || undefined,
    submittedAt: row.submitted_at || undefined, approvedAt: row.approved_at || undefined,
  };
}

const select = "*, seasons(year), profiles!showcase_submissions_owner_id_fkey(display_name, public_profile), votes(count)";

export async function getSubmissions(includePending = false) {
  if (!supabase) return readJson<ShowcaseSubmission[]>(SUBMISSIONS_KEY, seedSubmissions);
  let query = supabase.from("showcase_submissions").select(select).order("featured", { ascending: false }).order("approved_at", { ascending: false });
  if (!includePending) query = query.eq("moderation_status", "approved");
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row) => mapSubmission(row as unknown as ShowcaseRow));
}

export async function getApprovedSubmissions() {
  return getSubmissions(false);
}

export async function submitProject(input: Omit<ShowcaseSubmission, "id" | "votes" | "featured" | "moderationStatus" | "seasonYear">, season: Season) {
  analytics.track("showcase_submission_started", { hasRepository: Boolean(input.repositoryUrl) });
  normalizePublicUrl(input.liveUrl);
  if (input.repositoryUrl) normalizePublicUrl(input.repositoryUrl);
  if (!supabase) {
    const submission: ShowcaseSubmission = { ...input, id: crypto.randomUUID(), seasonYear: season.year, moderationStatus: "pending", votes: 0, featured: false, submittedAt: new Date().toISOString() };
    writeJson(SUBMISSIONS_KEY, [submission, ...readJson<ShowcaseSubmission[]>(SUBMISSIONS_KEY, seedSubmissions)]);
    return submission;
  }
  const { data: sprint, error: sprintError } = await supabase.from("sprints").select("id").eq("owner_id", input.ownerId).eq("season_id", season.id).eq("primary_sprint", true).maybeSingle();
  if (sprintError) throw sprintError;
  if (!sprint) throw new Error("Commit to a sprint before submitting your finished build.");
  const response = await apiFetch("/api/submit-showcase", { method: "POST", body: JSON.stringify({
    sprintId: sprint.id, seasonId: season.id, projectName: input.projectName, tagline: input.tagline, pitch: input.pitch,
    techStack: input.techStack, liveUrl: input.liveUrl, repositoryUrl: input.repositoryUrl, demoVideoUrl: input.demoVideoUrl,
    ownsWork: true, acceptsRules: true, company: "",
  }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Submission failed.");
  analytics.track("showcase_submission_completed", { season: season.year });
  return body.submission;
}

export async function castVote(submissionId: string, voterId: string) {
  if (!supabase) {
    const votes = readJson<string[]>(VOTES_KEY, []);
    const voteKey = `${submissionId}:${voterId}`;
    if (votes.includes(voteKey)) throw new Error("You have already voted for this project.");
    const submissions = (await getSubmissions()).map((item) => item.id === submissionId ? { ...item, votes: item.votes + 1 } : item);
    writeJson(VOTES_KEY, [...votes, voteKey]);
    writeJson(SUBMISSIONS_KEY, submissions);
    return;
  }
  const response = await apiFetch("/api/cast-vote", { method: "POST", body: JSON.stringify({ submissionId }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Vote failed.");
  analytics.track("vote_cast", { submissionId });
}

export async function moderateSubmission(submissionId: string, status: "approved" | "rejected", note: string) {
  if (!supabase) {
    const submissions = (await getSubmissions(true)).map((item) => item.id === submissionId ? { ...item, moderationStatus: status, moderationNote: note, approvedAt: status === "approved" ? new Date().toISOString() : undefined } : item);
    writeJson(SUBMISSIONS_KEY, submissions);
    return;
  }
  const response = await apiFetch("/api/moderate-showcase", { method: "POST", body: JSON.stringify({ submissionId, status, note }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Moderation failed.");
}
