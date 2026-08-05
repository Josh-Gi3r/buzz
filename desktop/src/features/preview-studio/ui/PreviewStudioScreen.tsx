import {
  CheckCircle2,
  Layers3,
  PanelRight,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import * as React from "react";

import {
  decisionForRevision,
  getRevision,
  IMPORT_ACCEPT,
  reviewsForRevision,
} from "../lib/store";
import { listRenderers, resolveRenderer } from "../lib/registry";
import type { Artifact, DecisionStatus } from "../lib/types";
import { useArtifactLibrary } from "../hooks";
import { GeneratePanel } from "./GeneratePanel";
import { PreviewStage } from "./PreviewStage";
import { artifactTypeIcon } from "./typeIcons";
import { cn } from "@/shared/lib/cn";
import { TopChromeInsetHeader } from "@/shared/layout/TopChromeInsetHeader";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

function formatType(type: string): string {
  return type.replaceAll("_", " ");
}

function decisionLabel(status: DecisionStatus | undefined): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "changes_requested":
      return "Changes requested";
    default:
      return "Pending";
  }
}

export function PreviewStudioScreen() {
  const {
    library,
    importFiles,
    remove,
    review,
    decide,
    saveDeck,
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
  const [generateOpen, setGenerateOpen] = React.useState(false);

  // Keep selection valid when library changes
  React.useEffect(() => {
    if (selectedId && library.artifacts.some((a) => a.id === selectedId)) {
      return;
    }
    setSelectedId(library.artifacts[0]?.id ?? "");
  }, [library.artifacts, selectedId]);

  React.useEffect(() => {
    setSlideIndex(0);
  }, [selectedId]);

  const selected: Artifact | undefined = library.artifacts.find(
    (a) => a.id === selectedId,
  );
  const revision = getRevision(library, selected?.currentRevisionId);
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

  function submitReview() {
    if (!revision || !comment.trim()) return;
    review(
      revision.id,
      comment,
      undefined,
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
          Device storage is full — the latest imports are kept for this session
          only.
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside className="preview-studio__rail flex w-60 shrink-0 flex-col border-r border-border/50 bg-background/40 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="flex items-center gap-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
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
          <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
            {library.artifacts.length === 0 ? (
              <li className="px-2 py-6 text-center text-2xs text-muted-foreground">
                No artifacts. Import an image, video, or PDF.
              </li>
            ) : (
              library.artifacts.map((artifact) => {
                const active = artifact.id === selectedId;
                const Icon = artifactTypeIcon(artifact.artifactType);
                return (
                  <li key={artifact.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => setSelectedId(artifact.id)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-xl px-2.5 py-2 pr-8 text-left transition-colors",
                        active
                          ? "bg-primary/15 text-foreground shadow-sm ring-1 ring-primary/25"
                          : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                      )}
                      data-testid={`preview-studio-artifact-${artifact.id}`}
                    >
                      <span className="mt-0.5 shrink-0 opacity-80">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {artifact.title}
                        </span>
                        <span className="block truncate text-2xs capitalize opacity-70">
                          {formatType(artifact.artifactType)}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="absolute right-1.5 top-1.5 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
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
          <div className="border-t border-border/40 px-3 py-2 text-2xs text-muted-foreground">
            {library.artifacts.length} artifacts · {listRenderers().length}{" "}
            renderers
          </div>
        </aside>

        <main className="preview-studio__stage relative flex min-w-0 flex-1 flex-col">
          <div className="preview-studio__atmosphere pointer-events-none absolute inset-0 -z-10" />
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
            <PreviewStage
              manifest={revision?.manifest}
              fallback={fallback}
              rendererLabel={renderer?.label}
              slideIndex={slideIndex}
              onSlideIndexChange={setSlideIndex}
              onDeckSave={(deck) => revision && saveDeck(revision.id, deck)}
              onWebSave={(web) => revision && saveWeb(revision.id, web)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 bg-background/50 px-4 py-2.5 backdrop-blur-md">
            <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              Revision
            </span>
            <code className="max-w-[12rem] truncate rounded-md bg-muted/50 px-2 py-0.5 font-mono text-2xs">
              {revision?.id ?? "—"}
            </code>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <span className="mr-1 flex items-center gap-1 text-2xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {decisionLabel(decision?.status)}
              </span>
              {(
                ["pending", "approved", "changes_requested"] as DecisionStatus[]
              ).map((status) => (
                <Button
                  key={status}
                  type="button"
                  size="sm"
                  variant={decision?.status === status ? "default" : "outline"}
                  className="h-7 text-2xs capitalize"
                  disabled={!revision}
                  onClick={() => revision && decide(revision.id, status)}
                  data-testid={`preview-studio-decision-${status}`}
                >
                  {status.replaceAll("_", " ")}
                </Button>
              ))}
            </div>
          </div>
        </main>

        {generateOpen ? (
          <GeneratePanel
            onClose={() => setGenerateOpen(false)}
            onGenerated={(image) => {
              addGenerated({ ...image, model: "generated" });
            }}
            onVideoGenerated={(video) => addGeneratedVid(video)}
          />
        ) : null}

        {inspectorOpen ? (
          <aside className="preview-studio__inspector flex w-80 shrink-0 flex-col border-l border-border/50 bg-background/55 backdrop-blur-xl">
            <div className="px-3 py-2.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              Inspector
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
              {selected && revision ? (
                <>
                  <section className="space-y-1.5">
                    <h3 className="text-xs font-semibold">Manifest</h3>
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
                  </section>

                  <section className="space-y-1.5">
                    <h3 className="text-xs font-semibold">
                      Review capabilities
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {caps.map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-2xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold">
                      Reviews ({reviews.length})
                    </h3>
                    <ul className="max-h-40 space-y-2 overflow-y-auto">
                      {reviews.length === 0 ? (
                        <li className="text-2xs text-muted-foreground">
                          No comments yet.
                        </li>
                      ) : (
                        reviews.map((r) => (
                          <li
                            key={r.id}
                            className="rounded-lg border border-border/40 bg-background/60 px-2 py-1.5 text-2xs"
                          >
                            <p className="text-foreground">{r.body}</p>
                            <p className="mt-0.5 text-muted-foreground">
                              {r.anchor?.slide !== undefined
                                ? `Slide ${r.anchor.slide} · `
                                : ""}
                              {r.anchor?.timeMs !== undefined
                                ? `${(r.anchor.timeMs / 1000).toFixed(1)}s · `
                                : ""}
                              {new Date(r.createdAt).toLocaleString()}
                            </p>
                          </li>
                        ))
                      )}
                    </ul>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        isPaged
                          ? `Comment on slide ${slideIndex + 1}…`
                          : "Leave a review comment…"
                      }
                      className="min-h-16 text-sm"
                      data-testid="preview-studio-review-input"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={!comment.trim()}
                      onClick={submitReview}
                      data-testid="preview-studio-review-submit"
                    >
                      Add review
                    </Button>
                  </section>

                  <section className="space-y-1.5">
                    <h3 className="text-xs font-semibold">Security</h3>
                    <p className="text-2xs leading-relaxed text-muted-foreground">
                      Artifacts are stored locally on this device. Web and app
                      previews never run in the main window; only local image,
                      video, and PDF files are rendered.
                    </p>
                  </section>
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
