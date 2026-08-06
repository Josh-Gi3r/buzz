import { CheckCircle2, Clock, MessageSquare, XCircle } from "lucide-react";

import type {
  ArtifactDecision,
  ArtifactRevision,
  DecisionStatus,
} from "../lib/types";
import { cn } from "@/shared/lib/cn";

/**
 * Every revision of the selected artifact, newest first.
 *
 * Feedback is pinned to the exact revision it was made on, so the history has
 * to be reachable — otherwise editing an artifact looks like it destroys the
 * comments rather than preserving them where they belong.
 */

function decisionIcon(status: DecisionStatus | undefined) {
  if (status === "approved") return CheckCircle2;
  if (status === "changes_requested") return XCircle;
  return Clock;
}

function decisionTone(status: DecisionStatus | undefined): string {
  if (status === "approved") return "text-emerald-500";
  if (status === "changes_requested") return "text-amber-500";
  return "text-muted-foreground";
}

function relativeTime(at: number): string {
  const seconds = Math.round((Date.now() - at) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function RevisionRail({
  revisions,
  currentRevisionId,
  selectedRevisionId,
  decisions,
  reviewCount,
  onSelect,
}: {
  revisions: ArtifactRevision[];
  /** The artifact's live revision — everything above it is history. */
  currentRevisionId: string | null;
  selectedRevisionId: string | undefined;
  decisions: ArtifactDecision[];
  reviewCount: (revisionId: string) => number;
  onSelect: (revisionId: string) => void;
}) {
  if (revisions.length <= 1) return null;

  return (
    <section className="space-y-1.5" data-testid="preview-studio-revision-rail">
      <div className="flex items-baseline justify-between">
        <h3 className="text-xs font-semibold">Revisions</h3>
        <span className="text-2xs text-muted-foreground">
          {revisions.length}
        </span>
      </div>

      <ol className="space-y-1">
        {revisions.map((revision, index) => {
          const status = decisions.find(
            (d) => d.revisionId === revision.id && d.reviewerPubkey === "local",
          )?.status;
          const Icon = decisionIcon(status);
          const comments = reviewCount(revision.id);
          const isCurrent = revision.id === currentRevisionId;
          const isSelected = revision.id === selectedRevisionId;
          const version = revisions.length - index;

          return (
            <li key={revision.id}>
              <button
                type="button"
                onClick={() => onSelect(revision.id)}
                aria-current={isSelected}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                  isSelected
                    ? "bg-primary/15 ring-1 ring-primary/25"
                    : "hover:bg-background/70",
                )}
                data-testid={`preview-studio-revision-${revision.id}`}
              >
                <Icon
                  className={cn("h-3.5 w-3.5 shrink-0", decisionTone(status))}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-2xs font-medium">v{version}</span>
                    {isCurrent ? (
                      <span className="rounded-full bg-primary/20 px-1.5 text-[0.6rem] text-primary">
                        current
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[0.6rem] text-muted-foreground">
                    {relativeTime(revision.createdAt)}
                  </span>
                </span>
                {comments > 0 ? (
                  <span className="flex items-center gap-0.5 text-[0.6rem] text-muted-foreground">
                    <MessageSquare className="h-2.5 w-2.5" />
                    {comments}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      {selectedRevisionId && selectedRevisionId !== currentRevisionId ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[0.6rem] leading-relaxed text-amber-600 dark:text-amber-400">
          Viewing an earlier revision. Its comments and decision are shown
          below; new comments still attach to this revision.
        </p>
      ) : null}
    </section>
  );
}
