import { GeneratedIdea } from "../idea-generator/types";

export type GuestDraft = {
  migrationId: string;
  idea: GeneratedIdea;
  committedSprintId?: string;
};

export type MigrationResult =
  | { status: "migrated"; migrationId: string }
  | { status: "already_migrated"; migrationId: string }
  | { status: "failed"; migrationId: string; reason: string };

export function migrateGuestDraftOnce(draft: GuestDraft, completedIds: Set<string>): MigrationResult {
  if (completedIds.has(draft.migrationId)) return { status: "already_migrated", migrationId: draft.migrationId };
  if (!draft.idea.title.trim()) return { status: "failed", migrationId: draft.migrationId, reason: "Draft idea is incomplete." };
  completedIds.add(draft.migrationId);
  return { status: "migrated", migrationId: draft.migrationId };
}
