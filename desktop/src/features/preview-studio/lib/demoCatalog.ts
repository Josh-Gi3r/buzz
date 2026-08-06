import { REAL_PHOTOGRAPHS } from "./demo/photographs";
import { DEMO_DECK } from "./deckSource";
import { DEMO_FILM } from "./filmSource";
import { DEMO_WEBSITE } from "./webSource";
import type { Artifact, ArtifactManifestV1, ArtifactRevision } from "./types";

/**
 * Seed library for an empty first run. Images are inlined SVG so they render
 * offline and actually depict what their title says.
 */

const SAMPLE_IMAGE_ALT = REAL_PHOTOGRAPHS["images/deck-album.jpg"] ?? "";
const FILM_URI = DEMO_FILM.render?.uri ?? "";
const FILM_POSTER = "/demo/elena-marsh-film-poster.jpg";

function revision(
  artifactId: string,
  revisionId: string,
  title: string,
  artifactType: ArtifactManifestV1["artifactType"],
  extra?: Partial<ArtifactManifestV1>,
): ArtifactRevision {
  const createdAt = Date.now();
  const manifest: ArtifactManifestV1 = {
    schemaVersion: 1,
    artifactId,
    revisionId,
    title,
    artifactType,
    source: {
      kind: "url",
      url: "https://example.invalid/preview-studio-demo",
    },
    capabilities: ["view", "comment", "inspect", "compare", "approve"],
    securityPolicy: {
      network: "allowlist",
      allowedOrigins: [],
      clipboard: "deny",
      downloads: "allow",
    },
    ...extra,
  };
  return { id: revisionId, artifactId, manifest, createdAt };
}

const imageRevB = revision(
  "art-album-still",
  "rev-album-1",
  "Album spread — for the print shop",
  "image",
  {
    source: {
      kind: "url",
      url: SAMPLE_IMAGE_ALT,
    },
    renditions: [
      {
        role: "stream",
        uri: SAMPLE_IMAGE_ALT,
        mime: "image/jpeg",
        width: 1200,
        height: 800,
      },
    ],
  },
);

const videoRev = revision(
  "art-wedding-film",
  "rev-film-1",
  "The film — Lauren & Quentin",
  "video",
  {
    source: {
      kind: "blob",
      sha256: "2".repeat(64),
      mime: "text/html",
      filename: "elena-marsh-film.composition.html",
    },
    film: DEMO_FILM,
    renditions: [
      { role: "stream", uri: FILM_URI, mime: "video/mp4" },
      { role: "poster", uri: FILM_POSTER, mime: "image/jpeg" },
    ],
    securityPolicy: {
      network: "deny",
      allowedOrigins: [],
      clipboard: "deny",
      downloads: "allow",
    },
  },
);

const deckRev = revision(
  "art-pricing-deck",
  "rev-pricing-1",
  "Collections & pricing 2027",
  "deck",
  {
    source: {
      kind: "blob",
      sha256: "0".repeat(64),
      mime: "text/html",
      filename: "collections-2027.deck.html",
    },
    deck: DEMO_DECK,
  },
);

const webRev = revision(
  "art-checkout",
  "rev-checkout-3",
  "Elena Marsh — Photography",
  "website",
  {
    entrypoint: "index.html",
    web: DEMO_WEBSITE,
    source: {
      kind: "blob",
      sha256: "1".repeat(64),
      mime: "application/zip",
      filename: "checkout-build.zip",
    },
    securityPolicy: {
      network: "deny",
      allowedOrigins: [],
      clipboard: "deny",
      downloads: "deny",
    },
  },
);

export const DEMO_REVISIONS: ArtifactRevision[] = [
  imageRevB,
  videoRev,
  deckRev,
  webRev,
];

export const DEMO_ARTIFACTS: Artifact[] = [
  {
    id: "art-checkout",
    title: "Elena Marsh — Photography",
    artifactType: "website",
    currentRevisionId: webRev.id,
    createdAt: Date.now() - 43_200_000,
    updatedAt: Date.now() - 1_800_000,
  },
  {
    id: "art-album-still",
    title: "Album spread — for the print shop",
    artifactType: "image",
    currentRevisionId: imageRevB.id,
    createdAt: Date.now() - 80_000_000,
    updatedAt: Date.now() - 2_000_000,
  },
  {
    id: "art-wedding-film",
    title: "The film — Lauren & Quentin",
    artifactType: "video",
    currentRevisionId: videoRev.id,
    createdAt: Date.now() - 172_800_000,
    updatedAt: Date.now() - 7_200_000,
  },
  {
    id: "art-pricing-deck",
    title: "Collections & pricing 2027",
    artifactType: "deck",
    currentRevisionId: deckRev.id,
    createdAt: Date.now() - 259_200_000,
    updatedAt: Date.now() - 86_400_000,
  },
];
