/**
 * A library of photographs should look like one.
 *
 * Every artifact type already carries something showable — a poster, a cover
 * slide, a hero image, the picture itself — so the rail shows the work rather
 * than a row of type icons. Resolution is best-effort and synchronous: a null
 * result just falls back to the type icon.
 */

import { resolveDeckMedia } from "./deckSource";
import type { ArtifactManifestV1 } from "./types";

const FIRST_IMAGE_SRC = /src="((?:data:image|blob:|https?:)[^"]+)"/i;

function firstImageIn(markup: unknown): string | undefined {
  if (typeof markup !== "string") return undefined;
  return FIRST_IMAGE_SRC.exec(markup)?.[1];
}

function renditionUri(
  manifest: ArtifactManifestV1,
  role: string,
): string | undefined {
  return manifest.renditions?.find((r) => r.role === role)?.uri;
}

export function artifactThumbnail(
  manifest: ArtifactManifestV1 | undefined,
): string | undefined {
  if (!manifest) return undefined;

  // A film shows the frame it opens on.
  const poster = renditionUri(manifest, "poster");
  if (poster) return poster;

  // A deck shows its cover slide's photograph.
  const deck = manifest.deck as
    | { slides?: Array<{ html?: string }> }
    | undefined;
  const coverHtml = deck?.slides?.[0]?.html;
  if (typeof coverHtml === "string") {
    const found = firstImageIn(resolveDeckMedia(coverHtml));
    if (found) return found;
  }

  // A website shows its hero.
  const web = manifest.web as
    | { entry?: string; files?: Record<string, string> }
    | undefined;
  if (web?.files) {
    const entry = web.entry ?? "/index.html";
    const found =
      firstImageIn(web.files[entry]) ??
      firstImageIn(Object.values(web.files)[0]);
    if (found) return found;
  }

  // An image is its own thumbnail.
  if (manifest.artifactType === "image") {
    const stream = renditionUri(manifest, "stream");
    if (stream) return stream;
    if (manifest.source.kind === "local") return manifest.source.uri;
    if (manifest.source.kind === "url") return manifest.source.url;
  }

  return undefined;
}
