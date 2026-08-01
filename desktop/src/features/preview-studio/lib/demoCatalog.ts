import type { Artifact, ArtifactManifestV1, ArtifactRevision } from "./types";

/**
 * Stable public sample media (Google sample bucket + picsum).
 * Used as seed when local library is empty / first run.
 */

const SAMPLE_IMAGE = "https://picsum.photos/id/1015/1600/1000";
const SAMPLE_IMAGE_ALT = "https://picsum.photos/id/1016/1200/800";
const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const SAMPLE_VIDEO_POSTER =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg";

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
      allowedOrigins: [
        "https://picsum.photos",
        "https://commondatastorage.googleapis.com",
      ],
      clipboard: "deny",
      downloads: "allow",
    },
    ...extra,
  };
  return { id: revisionId, artifactId, manifest, createdAt };
}

const imageRev = revision(
  "art-homepage",
  "rev-homepage-1",
  "Homepage redesign",
  "image",
  {
    source: {
      kind: "url",
      url: SAMPLE_IMAGE,
    },
    renditions: [
      {
        role: "stream",
        uri: SAMPLE_IMAGE,
        mime: "image/jpeg",
        width: 1600,
        height: 1000,
      },
    ],
  },
);

const imageRevB = revision(
  "art-brand-still",
  "rev-brand-1",
  "Brand still",
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
        mime: "image/jpeg",
      },
    ],
  },
);

const deckRev = revision(
  "art-investor-deck",
  "rev-deck-7",
  "Investor deck",
  "deck",
  {
    source: {
      kind: "blob",
      sha256: "0".repeat(64),
      mime: "application/pdf",
      filename: "investor-v7.pdf",
    },
  },
);

const webRev = revision(
  "art-checkout",
  "rev-checkout-3",
  "Checkout flow",
  "web_app",
  {
    entrypoint: "index.html",
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
  imageRev,
  imageRevB,
  videoRev,
  deckRev,
  webRev,
];

export const DEMO_ARTIFACTS: Artifact[] = [
  {
    id: "art-homepage",
    title: "Homepage redesign",
    artifactType: "image",
    currentRevisionId: imageRev.id,
    createdAt: Date.now() - 86_400_000,
    updatedAt: Date.now() - 3_600_000,
  },
  {
    id: "art-brand-still",
    title: "Brand still",
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
    id: "art-investor-deck",
    title: "Investor deck",
    artifactType: "deck",
    currentRevisionId: deckRev.id,
    createdAt: Date.now() - 259_200_000,
    updatedAt: Date.now() - 86_400_000,
  },
  {
    id: "art-checkout",
    title: "Checkout flow",
    artifactType: "web_app",
    currentRevisionId: webRev.id,
    createdAt: Date.now() - 43_200_000,
    updatedAt: Date.now() - 1_800_000,
  },
];
