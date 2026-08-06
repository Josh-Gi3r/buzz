import * as React from "react";

import type { FallbackPresentation } from "../lib/registry";
import { resolveDisplayUri, resolveSlides } from "../lib/resolveDisplayUri";
import type { ArtifactManifestV1, ArtifactType } from "../lib/types";
import { isDeckDocument } from "../lib/deckSource";
import { isWebDocument } from "../lib/webSource";
import { DeckStage } from "./DeckStage";
import { RevealDeckStage } from "./RevealDeckStage";
import { WebStage } from "./WebStage";
import { artifactTypeIcon } from "./typeIcons";
import { cn } from "@/shared/lib/cn";
import { SimpleImageLightbox } from "@/shared/ui/SimpleImageLightbox";
import { VideoPlayer } from "@/shared/ui/VideoPlayer";

/**
 * PDFs render in an iframe inside the main webview, so only inert local
 * schemes are allowed — never http(s) or arbitrary data: documents.
 */
const SAFE_PDF_URI = /^(?:data:application\/pdf[;,]|blob:)/;

function StageIcon({ type }: { type: ArtifactType }) {
  const Icon = artifactTypeIcon(type);
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
      <Icon className="h-6 w-6 text-primary" />
    </div>
  );
}

function FallbackCard({
  title,
  subtitle,
  type,
  badge,
}: {
  title: string;
  subtitle?: string;
  type: ArtifactType;
  badge?: string;
}) {
  return (
    <>
      <StageIcon type={type} />
      <div className="space-y-1.5 text-center">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="max-w-md text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {badge ? (
        <p className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-2xs text-muted-foreground">
          {badge}
        </p>
      ) : null}
    </>
  );
}

function posterFromManifest(manifest: ArtifactManifestV1): string | undefined {
  return manifest.renditions?.find((r) => r.role === "poster" && r.uri)?.uri;
}

function fallbackBadge(manifest: ArtifactManifestV1, uri?: string): string {
  if (manifest.artifactType === "pdf" && uri) {
    return "Preview blocked: untrusted source";
  }
  if (
    manifest.artifactType === "image" ||
    manifest.artifactType === "video" ||
    manifest.artifactType === "pdf"
  ) {
    return "No display source on this revision";
  }
  return "Preview not available for this file type yet — import an image, video, or PDF";
}

export function PreviewStage({
  manifest,
  fallback,
  rendererLabel,
  slideIndex = 0,
  onSlideIndexChange,
  onDeckSave,
  onWebSave,
  className,
}: {
  manifest: ArtifactManifestV1 | undefined;
  fallback: FallbackPresentation | null;
  rendererLabel?: string;
  slideIndex?: number;
  onSlideIndexChange?: (index: number) => void;
  onDeckSave?: (deck: unknown) => void;
  onWebSave?: (web: unknown) => void;
  className?: string;
}) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [mediaError, setMediaError] = React.useState<string | null>(null);

  const revisionId = manifest?.revisionId;
  // Reset the media-error state whenever the revision changes.
  React.useEffect(() => {
    if (revisionId) setMediaError(null);
  }, [revisionId]);

  if (!manifest || !fallback) {
    return (
      <div
        className={cn(
          "preview-studio__lens flex w-full max-w-3xl flex-col items-center justify-center gap-4",
          "rounded-3xl border border-white/10 bg-background/50 px-8 py-14",
          "shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl",
          className,
        )}
        data-testid="preview-studio-stage"
      >
        <StageIcon type="generic_file" />
        <div className="space-y-1.5 text-center">
          <h2 className="text-lg font-semibold tracking-tight">
            Select an artifact
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Import media or pick a library item. Stage center · inspector right.
          </p>
        </div>
      </div>
    );
  }

  const uri = resolveDisplayUri(manifest);
  const subtitle = `${fallback.subtitle}${rendererLabel ? ` · ${rendererLabel}` : ""}`;
  const filename =
    manifest.source.kind === "local" || manifest.source.kind === "blob"
      ? manifest.source.filename
      : undefined;

  if (manifest.artifactType === "image" && uri && !mediaError) {
    return (
      <>
        <div
          className={cn(
            "preview-studio__lens flex w-full max-w-4xl flex-col items-center justify-center gap-3",
            "rounded-3xl border border-white/10 bg-background/50 p-4",
            "shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl",
            className,
          )}
          data-testid="preview-studio-stage"
          data-stage-kind="image"
        >
          <button
            type="button"
            className="group relative w-full cursor-zoom-in border-0 bg-transparent p-0"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Expand ${manifest.title}`}
          >
            <img
              alt={manifest.title}
              className="max-h-[min(70vh,640px)] w-full rounded-2xl object-contain transition-opacity group-hover:opacity-95"
              decoding="async"
              onError={() => setMediaError("Media unavailable")}
              src={uri}
            />
          </button>
          <p className="text-2xs text-muted-foreground">
            {manifest.title} · click to expand
          </p>
        </div>
        <SimpleImageLightbox
          alt={manifest.title}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          src={uri}
        />
      </>
    );
  }

  if (manifest.artifactType === "video" && uri && !mediaError) {
    const poster = posterFromManifest(manifest);
    return (
      <div
        className={cn(
          "preview-studio__lens w-full max-w-4xl",
          "rounded-3xl border border-white/10 bg-background/50 p-3",
          "shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl",
          className,
        )}
        data-testid="preview-studio-stage"
        data-stage-kind="video"
      >
        <VideoPlayer
          src={uri}
          poster={poster}
          filename={filename}
          reviewKey={manifest.revisionId}
        />
        <p className="mt-2 text-center text-2xs text-muted-foreground">
          {manifest.title}
        </p>
      </div>
    );
  }

  if (isWebDocument(manifest.web)) {
    return (
      <WebStage
        doc={manifest.web}
        title={manifest.title}
        onSave={(next) => onWebSave?.(next)}
        className={className}
      />
    );
  }

  if (isDeckDocument(manifest.deck)) {
    return (
      <RevealDeckStage
        title={manifest.title}
        doc={manifest.deck}
        slideIndex={slideIndex}
        onSlideIndexChange={onSlideIndexChange ?? (() => {})}
        onSave={(next) => onDeckSave?.(next)}
        className={className}
      />
    );
  }

  const slides = resolveSlides(manifest);
  if (
    (manifest.artifactType === "deck" ||
      manifest.artifactType === "slideshow") &&
    slides.length > 0
  ) {
    return (
      <DeckStage
        title={manifest.title}
        slides={slides}
        slideIndex={slideIndex}
        onSlideIndexChange={onSlideIndexChange ?? (() => {})}
        className={className}
      />
    );
  }

  if (manifest.artifactType === "pdf" && uri && SAFE_PDF_URI.test(uri)) {
    return (
      <div
        className={cn(
          "preview-studio__lens flex h-[min(70vh,640px)] w-full max-w-4xl flex-col",
          "overflow-hidden rounded-3xl border border-white/10 bg-background/50",
          "shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl",
          className,
        )}
        data-testid="preview-studio-stage"
        data-stage-kind="pdf"
      >
        <iframe
          title={manifest.title}
          src={uri}
          sandbox=""
          referrerPolicy="no-referrer"
          className="h-full w-full flex-1 rounded-3xl bg-background"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "preview-studio__lens flex w-full max-w-3xl flex-col items-center justify-center gap-4",
        "rounded-3xl border border-white/10 bg-background/50 px-8 py-14",
        "shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl",
        className,
      )}
      data-testid="preview-studio-stage"
      data-stage-kind={manifest.artifactType}
    >
      <FallbackCard
        title={fallback.title}
        subtitle={subtitle}
        type={manifest.artifactType}
        badge={mediaError ?? fallbackBadge(manifest, uri)}
      />
    </div>
  );
}
