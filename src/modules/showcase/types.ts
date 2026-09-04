export type ModerationStatus = "draft" | "pending" | "approved" | "rejected";

export type ShowcaseSubmission = {
  id: string;
  ownerId: string;
  seasonYear: number;
  projectName: string;
  tagline: string;
  pitch: string;
  techStack: string[];
  liveUrl: string;
  repositoryUrl?: string;
  demoVideoUrl?: string;
  thumbnailUrl?: string;
  moderationStatus: ModerationStatus;
  moderationNote?: string;
  creatorDisplayName: string;
  creatorPublic: boolean;
  votes: number;
  featured: boolean;
  officialRank?: number;
  priorityReview?: boolean;
  submittedAt?: string;
  approvedAt?: string;
};
