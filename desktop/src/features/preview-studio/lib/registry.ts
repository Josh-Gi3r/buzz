import type { ArtifactManifestV1, ArtifactType } from "./types";

/**
 * Renderer registry — format-specific execution behind a single contract.
 * Renderers must never receive signing keys, unrestricted relay tokens,
 * or Tauri IPC surfaces.
 */

export type ReviewCapability =
  | "point"
  | "region"
  | "time"
  | "frame"
  | "page"
  | "slide"
  | "route"
  | "compare"
  | "approve";

export interface FallbackPresentation {
  title: string;
  subtitle: string;
  canDownload: boolean;
}

export interface ArtifactRendererDescriptor {
  id: string;
  /** False for placeholders that only render a fallback card. */
  implemented: boolean;
  label: string;
  types: ArtifactType[];
  canHandle: (manifest: ArtifactManifestV1) => boolean;
  getReviewCapabilities: (manifest: ArtifactManifestV1) => ReviewCapability[];
  getFallback: (manifest: ArtifactManifestV1) => FallbackPresentation;
}

const registry = new Map<string, ArtifactRendererDescriptor>();

export function registerRenderer(renderer: ArtifactRendererDescriptor): void {
  registry.set(renderer.id, renderer);
}

export function resolveRenderer(
  manifest: ArtifactManifestV1,
): ArtifactRendererDescriptor | undefined {
  for (const renderer of registry.values()) {
    if (renderer.canHandle(manifest)) {
      return renderer;
    }
  }
  return undefined;
}

export function listRenderers(): ArtifactRendererDescriptor[] {
  return [...registry.values()];
}

/** Only the renderers that actually preview something. */
export function listImplementedRenderers(): ArtifactRendererDescriptor[] {
  return [...registry.values()].filter((r) => r.implemented);
}

function baseFallback(manifest: ArtifactManifestV1): FallbackPresentation {
  return {
    title: manifest.title,
    subtitle: `${manifest.artifactType} · revision ${manifest.revisionId.slice(0, 8)}`,
    canDownload: true,
  };
}

/**
 * Renderers the studio can resolve. Several are placeholders that present a
 * fallback card rather than a preview — `implemented` says which, so the UI
 * never counts an unbuilt adapter as a working one.
 */
const BUILTIN_STUBS: Array<{
  implemented?: boolean;
  id: string;
  label: string;
  types: ArtifactType[];
  caps: ReviewCapability[];
}> = [
  {
    id: "image",
    implemented: true,
    label: "Image",
    types: ["image"],
    caps: ["point", "region", "compare", "approve"],
  },
  {
    id: "video",
    implemented: true,
    label: "Video",
    types: ["video"],
    caps: ["time", "frame", "compare", "approve"],
  },
  {
    id: "pdf",
    implemented: true,
    label: "PDF",
    types: ["pdf"],
    caps: ["page", "region", "approve"],
  },
  {
    id: "deck",
    implemented: true,
    label: "Deck",
    types: ["deck"],
    caps: ["slide", "region", "approve"],
  },
  {
    id: "web-url",
    implemented: true,
    label: "Website",
    types: ["website"],
    caps: ["route", "approve"],
  },
  {
    id: "web-app",
    label: "Web app",
    types: ["web_app"],
    caps: ["route", "approve"],
  },
  {
    id: "android",
    label: "Android",
    types: ["android"],
    caps: ["approve"],
  },
  {
    id: "ios",
    label: "iOS",
    types: ["ios"],
    caps: ["approve"],
  },
  {
    id: "motion",
    label: "Motion",
    types: ["motion"],
    caps: ["time", "frame", "approve"],
  },
  {
    id: "slideshow",
    label: "Slideshow",
    types: ["slideshow", "collection"],
    caps: ["approve"],
  },
  {
    id: "generic",
    label: "File",
    types: ["generic_file"],
    caps: ["approve"],
  },
];

export function registerBuiltinRenderers(): void {
  for (const stub of BUILTIN_STUBS) {
    if (registry.has(stub.id)) continue;
    registerRenderer({
      id: stub.id,
      implemented: stub.implemented ?? false,
      label: stub.label,
      types: stub.types,
      canHandle: (manifest) => stub.types.includes(manifest.artifactType),
      getReviewCapabilities: () => stub.caps,
      getFallback: baseFallback,
    });
  }
}

registerBuiltinRenderers();
