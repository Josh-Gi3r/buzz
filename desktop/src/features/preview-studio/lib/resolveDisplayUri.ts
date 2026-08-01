import type { ArtifactManifestV1 } from "./types";

/**
 * Prefer an explicit rendition URI, then local/url source.
 * Blob sources need a media-resolve step (not MVP Stage-owned).
 */
export function resolveDisplayUri(
  manifest: ArtifactManifestV1,
): string | undefined {
  const roles = ["stream", "interactive", "poster", "thumbnail"] as const;
  for (const role of roles) {
    const hit = manifest.renditions?.find(
      (r) => r.role === role && r.uri && r.uri.length > 0,
    );
    if (hit?.uri) return hit.uri;
  }

  if (manifest.source.kind === "local" && manifest.source.uri) {
    return manifest.source.uri.length > 0 ? manifest.source.uri : undefined;
  }
  if (manifest.source.kind === "url" && manifest.source.url) {
    return manifest.source.url.length > 0 ? manifest.source.url : undefined;
  }
  return undefined;
}
