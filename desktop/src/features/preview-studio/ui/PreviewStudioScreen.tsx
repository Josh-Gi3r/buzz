import {
  Check,
  CircleDashed,
  Layers3,
  PanelRight,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  Wand2,
} from "lucide-react";
import * as React from "react";

import {
  decisionForRevision,
  getRevision,
  reviewCountForRevision,
  revisionsForArtifact,
  IMPORT_ACCEPT,
  reviewsForRevision,
} from "../lib/store";
import { isFilmDocument } from "../lib/filmSource";
import { listImplementedRenderers, resolveRenderer } from "../lib/registry";
import type { Artifact, DecisionStatus } from "../lib/types";
import { useArtifactLibrary } from "../hooks";
import { GeneratePanel } from "./GeneratePanel";
import { PreviewStage } from "./PreviewStage";
import { RevisionRail } from "./RevisionRail";
import { artifactThumbnail } from "../lib/thumbnails";
import { artifactTypeIcon } from "./typeIcons";
import { cn } from "@/shared/lib/cn";
import { TopChromeInsetHeader } from "@/shared/layout/TopChromeInsetHeader";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

function formatType(type: string): string {
  return type.replaceAll("_", " ");
}

const DECISIONS: Array<{
  status: DecisionStatus;
  label: string;
  icon: typeof Check;
}> = [
  { status: "pending", label: "Pending", icon: CircleDashed },
  { status: "approved", label: "Approve", icon: Check },
  { status: "changes_requested", label: "Request changes", icon: Undo2 },
];

/** The dot beside a title: the decision, readable without reading. */
function decisionDot(status: DecisionStatus | undefined): string {
  if (status === "approved") return "bg-emerald-500";
  if (status === "changes_requested") return "bg-amber-500";
  return "bg-muted-foreground/50";
}

export function PreviewStudioScreen() {
  const {
    library,
    importFiles,
    remove,
    review,
    decide,
    saveDeck,
    saveFilm,
    saveWeb,
    addGenerated,
    addGeneratedVid,
    reset,
  } = useArtifactLibrary();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [inspectorOpen, setInspectorOpen] = React.useState(true);
  const [comment, setComment] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const [sessionOnly, setSessionOnly] = React.useState(false);
  const [slideIndex, setSlideIndex] = React.useState(0);
  const [playheadSeconds, setPlayheadSeconds] = React.useState(0);
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [selectedRevisionId, setSelectedRevisionId] = React.useState<
    string | null
  >(null);

  // Keep selection valid when library changes
  React.useEffect(() => {
    if (selectedId && library.artifacts.some((a) => a.id === selectedId)) {
      return;
    }
    setSelectedId(library.artifacts[0]?.id ?? "");
  }, [library.artifacts, selectedId]);

  React.useEffect(() => {
    setSlideIndex(0);
    setPlayheadSeconds(0);
    setSelectedRevisionId(null);
  }, [selectedId]);

  const selected: Artifact | undefined = library.artifacts.find(
    (a) => a.id === selectedId,
  );
  const revisions = revisionsForArtifact(library, selected?.id);
  const revision = getRevision(
    library,
    selectedRevisionId ?? selected?.currentRevisionId,
  );
  /** True when the rail has walked back to an older revision. */
  const isHistory =
    !!revision && !!selected && revision.id !== selected.currentRevisionId;
  const renderer = revision ? resolveRenderer(revision.manifest) : undefined;
  const caps = revision
    ? (renderer?.getReviewCapabilities(revision.manifest) ?? [])
    : [];
  const fallback = revision
    ? (renderer?.getFallback(revision.manifest) ?? {
        title: revision.manifest.title,
        subtitle: revision.manifest.artifactType,
        canDownload: true,
      })
    : null;
  const reviews = revision ? reviewsForRevision(library, revision.id) : [];
  const decision = revision
    ? decisionForRevision(library, revision.id)
    : undefined;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setImporting(true);
    try {
      const { snapshot, persisted } = await importFiles(files);
      setSessionOnly(!persisted);
      const newest = snapshot.artifacts[0];
      if (newest) setSelectedId(newest.id);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const isPaged =
    revision?.manifest.artifactType === "deck" ||
    revision?.manifest.artifactType === "slideshow";
  /** Film comments pin to the frame you are looking at, like slide comments. */
  const isTimed = isFilmDocument(revision?.manifest.film);

  function submitReview() {
    if (!revision || !comment.trim()) return;
    review(
      revision.id,
      comment,
      isTimed ? Math.round(playheadSeconds * 1000) : undefined,
      isPaged ? slideIndex + 1 : undefined,
    );
    setComment("");
  }

  return (
    <div
      className="preview-studio flex h-full min-h-0 flex-col"
      data-visual-profile="studio"
      data-testid="preview-studio-screen"
    >
      <TopChromeInsetHeader data-tauri-drag-region flush>
        <header className="flex h-11 min-w-0 items-center gap-3 px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight">
                Preview Studio
              </h1>
              <p className="truncate text-2xs text-muted-foreground">
                Artifacts stored on this device
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={IMPORT_ACCEPT}
              multiple
              className="hidden"
              data-testid="preview-studio-file-input"
              onChange={(e) => void handleFiles(e.target.files)}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              data-testid="preview-studio-import"
            >
              <Upload className="h-3.5 w-3.5" />
              {importing ? "Importing…" : "Import"}
            </Button>
            <Button
              type="button"
              variant={generateOpen ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setGenerateOpen((v) => !v)}
              data-testid="preview-studio-open-generate"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Generate
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset library to demo seeds? Your imported artifacts will be removed from this device store.",
                  )
                ) {
                  reset();
                }
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demos
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setInspectorOpen((v) => !v)}
            >
              <PanelRight className="h-3.5 w-3.5" />
              Inspector
            </Button>
          </div>
        </header>
      </TopChromeInsetHeader>

      {sessionOnly ? (
        <p className="border-b border-border/40 bg-amber-500/10 px-5 py-1.5 text-2xs text-amber-600 dark:text-amber-400">
          Device storage is full — the most recent artifact is kept for this
          session only and will be gone after a reload.
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside className="preview-studio__rail flex w-64 shrink-0 flex-col border-r border-border/50 bg-background/40 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
            <div className="flex items-center gap-2 text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              Library
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import media"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-4">
            {library.artifacts.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border/60 px-3 py-8 text-center text-2xs leading-relaxed text-muted-foreground">
                Nothing here yet.
                <br />
                Import an image, video or PDF.
              </li>
            ) : (
              library.artifacts.map((artifact) => {
                const active = artifact.id === selectedId;
                const Icon = artifactTypeIcon(artifact.artifactType);
                const head = getRevision(library, artifact.currentRevisionId);
                const thumbnail = artifactThumbnail(head?.manifest);
                const state = head
                  ? decisionForRevision(library, head.id)?.status
                  : undefined;
                return (
                  <li key={artifact.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => setSelectedId(artifact.id)}
                      className={cn(
                        "preview-studio__card block w-full overflow-hidden rounded-xl text-left",
                        "border transition-all duration-200",
                        active
                          ? "border-primary/60 bg-background/70 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                          : "border-border/40 bg-background/30 hover:border-border hover:bg-background/60",
                      )}
                      data-testid={`preview-studio-artifact-${artifact.id}`}
                    >
                      <span className="relative block aspect-[16/10] overflow-hidden bg-muted/40">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className={cn(
                              "h-full w-full object-cover transition-all duration-500",
                              active
                                ? "scale-[1.02] opacity-100"
                                : "opacity-80 group-hover:scale-[1.02] group-hover:opacity-100",
                            )}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </span>
                        )}
                        <span
                          className={cn(
                            "absolute right-2 top-2 h-1.5 w-1.5 rounded-full ring-2 ring-black/30",
                            decisionDot(state),
                          )}
                          aria-hidden
                        />
                      </span>
                      <span className="flex items-center gap-2 px-2.5 py-2">
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            active ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium leading-tight text-foreground">
                            {artifact.title}
                          </span>
                          <span className="block truncate text-3xs uppercase tracking-[0.14em] text-muted-foreground">
                            {formatType(artifact.artifactType)}
                          </span>
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="absolute right-1.5 top-1.5 rounded-md bg-background/70 p-1 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
                      aria-label={`Delete ${artifact.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(artifact.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-border/40 px-4 py-2.5 text-3xs uppercase tracking-[0.14em] text-muted-foreground">
            {library.artifacts.length} artifacts ·{" "}
            {listImplementedRenderers().length} preview types
          </div>
        </aside>

        <main className="preview-studio__stage relative flex min-w-0 flex-1 flex-col">
          <div className="preview-studio__atmosphere pointer-events-none absolute inset-0 -z-10" />
          {/* Keyed by artifact, not revision: switching work is a cut, but
              editing inside one artifact must not remount the stage — that
              would drop you out of whatever mode you were working in. */}
          <div
            key={selectedId || "empty"}
            className="preview-studio__enter flex min-h-0 flex-1 items-center justify-center overflow-auto p-6"
          >
            <PreviewStage
              manifest={revision?.manifest}
              fallback={fallback}
              rendererLabel={renderer?.label}
              slideIndex={slideIndex}
              onSlideIndexChange={setSlideIndex}
              onDeckSave={(deck) => revision && saveDeck(revision.id, deck)}
              onWebSave={(web) => revision && saveWeb(revision.id, web)}
              onFilmSave={(film) => revision && saveFilm(revision.id, film)}
              onTimeChange={setPlayheadSeconds}
            />
          </div>

          {/* What you are looking at, and the one call to make about it. */}
          <div className="flex flex-wrap items-center gap-3 border-t border-border/40 bg-background/60 px-5 py-3 backdrop-blur-md">
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                decisionDot(decision?.status),
              )}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium leading-tight text-foreground">
                {selected?.title ?? "Nothing selected"}
              </p>
              <p className="truncate text-3xs uppercase tracking-[0.14em] text-muted-foreground">
                {selected ? formatType(selected.artifactType) : "—"}
                {revision ? " · " : ""}
                {revision ? (
                  <code className="font-mono normal-case tracking-normal">
                    {revision.id.slice(0, 18)}
                  </code>
                ) : null}
                {isHistory ? " · viewing history" : ""}
              </p>
            </div>

            <div className="ml-auto flex items-center rounded-lg border border-border/60 bg-background/50 p-0.5">
              {DECISIONS.map(({ status, label, icon: Icon }) => {
                const on = decision?.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={!revision}
                    onClick={() => revision && decide(revision.id, status)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-2xs transition-colors disabled:opacity-40",
                      on
                        ? status === "approved"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : status === "changes_requested"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-muted/60 text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    data-testid={`preview-studio-decision-${status}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {generateOpen ? (
          <GeneratePanel
            onClose={() => setGenerateOpen(false)}
            onGenerated={(image) => {
              const { persisted, artifactId } = addGenerated(image);
              if (!persisted) setSessionOnly(true);
              if (artifactId) setSelectedId(artifactId);
            }}
            onVideoGenerated={(video) => {
              if (!addGeneratedVid(video)) setSessionOnly(true);
            }}
          />
        ) : null}

        {inspectorOpen ? (
          <aside className="preview-studio__inspector flex w-80 shrink-0 flex-col border-l border-border/50 bg-background/55 backdrop-blur-xl">
            <div className="px-4 pb-2 pt-3 text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Review
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
              {selected && revision ? (
                <>
                  <RevisionRail
                    revisions={revisions}
                    currentRevisionId={selected.currentRevisionId}
                    selectedRevisionId={revision.id}
                    decisions={library.decisions}
                    reviewCount={(id) => reviewCountForRevision(library, id)}
                    onSelect={setSelectedRevisionId}
                  />

                  <section className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-xs font-semibold">Comments</h3>
                      <span className="text-3xs uppercase tracking-[0.14em] text-muted-foreground">
                        {reviews.length === 0
                          ? "none yet"
                          : `${reviews.length} on this revision`}
                      </span>
                    </div>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        isPaged
                          ? `Comment on slide ${slideIndex + 1}…`
                          : isTimed
                            ? `Comment at ${playheadSeconds.toFixed(1)}s…`
                            : "Leave a review comment…"
                      }
                      className="min-h-16 resize-none text-sm"
                      data-testid="preview-studio-review-input"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={comment.trim() ? "default" : "secondary"}
                      className="w-full"
                      disabled={!comment.trim()}
                      onClick={submitReview}
                      data-testid="preview-studio-review-submit"
                    >
                      Add review
                    </Button>
                    {reviews.length === 0 ? (
                      <p className="pt-1 text-3xs leading-relaxed text-muted-foreground">
                        {isPaged
                          ? "Comments pin to the slide you are on."
                          : isTimed
                            ? "Comments pin to the frame you are parked on."
                            : "Comments pin to this exact revision."}
                      </p>
                    ) : null}
                    <ul className="space-y-1.5">
                      {reviews.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-lg border border-border/40 bg-background/50 px-2.5 py-2"
                        >
                          <p className="text-2xs leading-relaxed text-foreground">
                            {r.body}
                          </p>
                          <p className="mt-1 text-3xs uppercase tracking-[0.12em] text-muted-foreground">
                            {r.anchor?.slide !== undefined
                              ? `Slide ${r.anchor.slide} · `
                              : ""}
                            {r.anchor?.timeMs !== undefined
                              ? `${(r.anchor.timeMs / 1000).toFixed(1)}s · `
                              : ""}
                            {new Date(r.createdAt).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Everything a reviewer only needs when they go looking. */}
                  <details className="group rounded-lg border border-border/40 bg-background/30">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-2.5 py-2 text-2xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                      Details
                      <span className="text-3xs uppercase tracking-[0.14em] opacity-70 group-open:hidden">
                        {renderer?.label ?? "—"}
                      </span>
                    </summary>
                    <div className="space-y-3 border-t border-border/40 px-2.5 py-2.5">
                      <dl className="space-y-1 text-2xs">
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Type</dt>
                          <dd className="capitalize">
                            {formatType(revision.manifest.artifactType)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Source</dt>
                          <dd className="truncate font-mono">
                            {revision.manifest.source.kind}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Renderer</dt>
                          <dd>{renderer?.label ?? "—"}</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap gap-1">
                        {caps.map((c) => (
                          <span
                            key={c}
                            className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-3xs uppercase tracking-[0.12em]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <p className="text-3xs leading-relaxed text-muted-foreground">
                        Artifacts are stored locally on this device. Web and app
                        previews run in a sandboxed frame, never in the main
                        window.
                      </p>
                    </div>
                  </details>
                </>
              ) : (
                <p className="text-2xs text-muted-foreground">
                  Select an artifact to inspect its revision.
                </p>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
