import { DEMO_BRAND_STILL, DEMO_MOTION_POSTER } from "./demoAssets";
import { DEMO_DECK } from "./deckSource";
import { DEMO_WEBSITE } from "./webSource";
import type { Artifact, ArtifactManifestV1, ArtifactRevision } from "./types";

/**
 * Seed library for an empty first run. Images are inlined SVG so they render
 * offline and actually depict what their title says.
 */

const SAMPLE_IMAGE_ALT = DEMO_BRAND_STILL;
const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const SAMPLE_VIDEO_POSTER = DEMO_MOTION_POSTER;

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
      allowedOrigins: ["https://commondatastorage.googleapis.com"],
      clipboard: "deny",
      downloads: "allow",
    },
    ...extra,
  };
  return { id: revisionId, artifactId, manifest, createdAt };
}

const imageRevB = revision(
  "art-brand-still",
  "rev-brand-1",
  "Brand key visual",
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
        mime: "image/svg+xml",
        width: 1200,
        height: 800,
      },
    ],
  },
);

const videoRev = revision(
  "art-campaign-cut",
  "rev-campaign-1",
  "Campaign motion cut",
  "video",
  {
    source: {
      kind: "url",
      url: SAMPLE_VIDEO,
    },
    renditions: [
      {
        role: "stream",
        uri: SAMPLE_VIDEO,
        mime: "video/mp4",
      },
      {
        role: "poster",
        uri: SAMPLE_VIDEO_POSTER,
        mime: "image/svg+xml",
      },
    ],
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
    id: "art-brand-still",
    title: "Brand key visual",
    artifactType: "image",
    currentRevisionId: imageRevB.id,
    createdAt: Date.now() - 80_000_000,
    updatedAt: Date.now() - 2_000_000,
  },
  {
    id: "art-campaign-cut",
    title: "Campaign motion cut",
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
