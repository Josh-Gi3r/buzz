import { newId } from "./ids";
import type {
  Artifact,
  ArtifactDecision,
  ArtifactManifestV1,
  ArtifactRevision,
  ArtifactReview,
  ArtifactType,
  DecisionStatus,
  ReviewStatus,
} from "./types";
import { DEMO_ARTIFACTS, DEMO_REVISIONS } from "./demoCatalog";

const STORAGE_KEY = "buzz.previewStudio.library.v1";
/** Soft cap so localStorage does not explode (per file, data URL). */
export const MAX_PERSISTED_DATA_URL_BYTES = 2_500_000;

export type ArtifactLibrarySnapshot = {
  version: 1;
  artifacts: Artifact[];
  revisions: ArtifactRevision[];
  reviews: ArtifactReview[];
  decisions: ArtifactDecision[];
};

function emptySnapshot(): ArtifactLibrarySnapshot {
  return {
    version: 1,
    artifacts: [],
    revisions: [],
    reviews: [],
    decisions: [],
  };
}

function seedSnapshot(): ArtifactLibrarySnapshot {
  return {
    version: 1,
    artifacts: structuredClone(DEMO_ARTIFACTS),
    revisions: structuredClone(DEMO_REVISIONS),
    reviews: [],
    decisions: DEMO_ARTIFACTS.filter((a) => a.currentRevisionId).map((a) => ({
      revisionId: a.currentRevisionId as string,
      reviewerPubkey: "local",
      status: "pending" as DecisionStatus,
      updatedAt: Date.now(),
    })),
  };
}

function initialSnapshot(): ArtifactLibrarySnapshot {
  // Keep the visual fixture catalog available to Playwright without shipping
  // it as a user's real BUZZ — LIVE PREVIEW STUDIO library.
  return import.meta.env?.MODE === "e2e" ? seedSnapshot() : emptySnapshot();
}

const LEGACY_DEMO_ARTIFACT_IDS = new Set(
  DEMO_ARTIFACTS.map((artifact) => artifact.id),
);

/** Remove demo rows persisted by older fork builds while preserving every
 * imported, generated, or agent-created artifact. */
function removeLegacyDemoArtifacts(
  snapshot: ArtifactLibrarySnapshot,
): ArtifactLibrarySnapshot {
  const removedRevisionIds = new Set(
    snapshot.revisions
      .filter((revision) => LEGACY_DEMO_ARTIFACT_IDS.has(revision.artifactId))
      .map((revision) => revision.id),
  );
  if (
    !snapshot.artifacts.some((artifact) =>
      LEGACY_DEMO_ARTIFACT_IDS.has(artifact.id),
    ) &&
    removedRevisionIds.size === 0
  ) {
    return snapshot;
  }
  return {
    ...snapshot,
    artifacts: snapshot.artifacts.filter(
      (artifact) => !LEGACY_DEMO_ARTIFACT_IDS.has(artifact.id),
    ),
    revisions: snapshot.revisions.filter(
      (revision) => !LEGACY_DEMO_ARTIFACT_IDS.has(revision.artifactId),
    ),
    reviews: snapshot.reviews.filter(
      (review) => !removedRevisionIds.has(review.revisionId),
    ),
    decisions: snapshot.decisions.filter(
      (decision) => !removedRevisionIds.has(decision.revisionId),
    ),
  };
}

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function backupUnreadablePayload(raw: string | null): void {
  if (!raw) return;
  try {
    localStorage.setItem(`${STORAGE_KEY}.unreadable`, raw);
  } catch {
    // Best effort — quota may already be the reason we are here.
  }
}

/** Object URLs do not survive an app restart; blank them so the stage
 * shows its fallback instead of a broken element. */
function pruneDeadObjectUrls(
  snapshot: ArtifactLibrarySnapshot,
): ArtifactLibrarySnapshot {
  return {
    ...snapshot,
    revisions: snapshot.revisions.map((revision) => {
      const source = revision.manifest.source;
      if (source.kind !== "local" || !source.uri.startsWith("blob:")) {
        return revision;
      }
      return {
        ...revision,
        manifest: {
          ...revision.manifest,
          source: { ...source, uri: "" },
        },
      };
    }),
  };
}

export function loadLibrary(): ArtifactLibrarySnapshot {
  if (!canUseStorage()) return initialSnapshot();
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = initialSnapshot();
      saveLibrary(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as ArtifactLibrarySnapshot;
    if (parsed?.version !== 1 || !Array.isArray(parsed.artifacts)) {
      backupUnreadablePayload(raw);
      const initial = initialSnapshot();
      saveLibrary(initial);
      return initial;
    }
    const loaded = pruneDeadObjectUrls({
      version: 1,
      artifacts: parsed.artifacts ?? [],
      revisions: parsed.revisions ?? [],
      reviews: parsed.reviews ?? [],
      decisions: parsed.decisions ?? [],
    });
    if (import.meta.env?.MODE === "e2e") return loaded;
    const migrated = removeLegacyDemoArtifacts(loaded);
    if (migrated !== loaded) saveLibrary(migrated);
    return migrated;
  } catch {
    backupUnreadablePayload(raw);
    const initial = initialSnapshot();
    saveLibrary(initial);
    return initial;
  }
}

export function saveLibrary(snapshot: ArtifactLibrarySnapshot): boolean {
  if (!canUseStorage()) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    // Quota exceeded — caller decides how to surface session-only state.
    return false;
  }
}

export function resetLibrary(): ArtifactLibrarySnapshot {
  const initial = initialSnapshot();
  saveLibrary(initial);
  return initial;
}

export function getRevision(
  snapshot: ArtifactLibrarySnapshot,
  revisionId: string | null | undefined,
): ArtifactRevision | undefined {
  if (!revisionId) return undefined;
  return snapshot.revisions.find((r) => r.id === revisionId);
}

/** Every revision of an artifact, newest first. */
export function revisionsForArtifact(
  snapshot: ArtifactLibrarySnapshot,
  artifactId: string | undefined,
): ArtifactRevision[] {
  if (!artifactId) return [];
  return snapshot.revisions
    .filter((r) => r.artifactId === artifactId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** How many comments a revision carries, for the rail. */
export function reviewCountForRevision(
  snapshot: ArtifactLibrarySnapshot,
  revisionId: string,
): number {
  return snapshot.reviews.filter((r) => r.revisionId === revisionId).length;
}

export function reviewsForRevision(
  snapshot: ArtifactLibrarySnapshot,
  revisionId: string,
): ArtifactReview[] {
  return snapshot.reviews
    .filter((r) => r.revisionId === revisionId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function decisionForRevision(
  snapshot: ArtifactLibrarySnapshot,
  revisionId: string,
): ArtifactDecision | undefined {
  return snapshot.decisions.find(
    (d) => d.revisionId === revisionId && d.reviewerPubkey === "local",
  );
}

function mimeToType(mime: string): ArtifactType {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "generic_file";
}

/** Keep in sync with IMPORT_ACCEPT — one predicate owns what can be imported. */
export function isImportableType(mime: string): boolean {
  return mimeToType(mime) !== "generic_file";
}

/** For the file-input accept attribute. */
export const IMPORT_ACCEPT = "image/*,video/*,application/pdf";

/** Read a File as a data URL (for persistence under size cap). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("expected data URL string"));
    };
    reader.readAsDataURL(file);
  });
}

export type ImportResult = {
  snapshot: ArtifactLibrarySnapshot;
  /** False when the library could not be written to device storage. */
  persisted: boolean;
};

export async function importLocalFile(
  snapshot: ArtifactLibrarySnapshot,
  file: File,
): Promise<ImportResult> {
  const artifactType = mimeToType(file.type || "application/octet-stream");
  const now = Date.now();
  const artifactId = newId("art");
  const revisionId = newId("rev");

  let uri: string;
  let ephemeral = false;
  if (file.size <= MAX_PERSISTED_DATA_URL_BYTES) {
    uri = await readFileAsDataUrl(file);
  } else {
    uri = URL.createObjectURL(file);
    ephemeral = true;
  }

  const manifest: ArtifactManifestV1 = {
    schemaVersion: 1,
    artifactId,
    revisionId,
    title: file.name.replace(/\.[^.]+$/, "") || file.name,
    artifactType,
    source: {
      kind: "local",
      uri,
      mime: file.type || undefined,
      filename: file.name,
      ephemeral: ephemeral || undefined,
    },
    capabilities: ["view", "comment", "inspect", "approve"],
    securityPolicy: {
      network: "deny",
      clipboard: "deny",
      downloads: "allow",
    },
    provenance: {
      createdBy: "local",
      createdAt: new Date(now).toISOString(),
    },
  };

  const artifact: Artifact = {
    id: artifactId,
    title: manifest.title,
    artifactType,
    currentRevisionId: revisionId,
    createdAt: now,
    updatedAt: now,
  };

  const revision: ArtifactRevision = {
    id: revisionId,
    artifactId,
    manifest,
    createdAt: now,
  };

  const decision: ArtifactDecision = {
    revisionId,
    reviewerPubkey: "local",
    status: "pending",
    updatedAt: now,
  };

  const next: ArtifactLibrarySnapshot = {
    ...snapshot,
    artifacts: [artifact, ...snapshot.artifacts],
    revisions: [revision, ...snapshot.revisions],
    decisions: [decision, ...snapshot.decisions],
  };
  const persisted = saveLibrary(next);
  return { snapshot: next, persisted };
}

/** A generated image becomes a first-class artifact with its own revision. */
export function addGeneratedImage(
  snapshot: ArtifactLibrarySnapshot,
  input: { dataUrl: string; mime: string; title: string; model: string },
): ImportResult {
  const now = Date.now();
  const artifactId = newId("art");
  const revisionId = newId("rev");
  const title = input.title || "Generated image";

  const manifest: ArtifactManifestV1 = {
    schemaVersion: 1,
    artifactId,
    revisionId,
    title,
    artifactType: "image",
    source: { kind: "local", uri: input.dataUrl, mime: input.mime },
    capabilities: ["view", "comment", "inspect", "approve"],
    securityPolicy: { network: "deny", clipboard: "deny", downloads: "allow" },
    provenance: {
      createdBy: input.model,
      createdAt: new Date(now).toISOString(),
    },
  };

  const next: ArtifactLibrarySnapshot = {
    ...snapshot,
    artifacts: [
      {
        id: artifactId,
        title,
        artifactType: "image",
        currentRevisionId: revisionId,
        createdAt: now,
        updatedAt: now,
      },
      ...snapshot.artifacts,
    ],
    revisions: [
      { id: revisionId, artifactId, manifest, createdAt: now },
      ...snapshot.revisions,
    ],
    decisions: [
      {
        revisionId,
        reviewerPubkey: "local",
        status: "pending" as DecisionStatus,
        updatedAt: now,
      },
      ...snapshot.decisions,
    ],
  };
  const persisted = saveLibrary(next);
  return { snapshot: next, persisted };
}

/** A generated video becomes an artifact with its own revision. */
export function addGeneratedVideo(
  snapshot: ArtifactLibrarySnapshot,
  input: { url: string; title: string; model: string },
): ImportResult {
  const now = Date.now();
  const artifactId = newId("art");
  const revisionId = newId("rev");
  const title = input.title || "Generated video";

  const manifest: ArtifactManifestV1 = {
    schemaVersion: 1,
    artifactId,
    revisionId,
    title,
    artifactType: "video",
    source: { kind: "url", url: input.url },
    renditions: [{ role: "stream", uri: input.url, mime: "video/mp4" }],
    capabilities: ["view", "comment", "inspect", "approve"],
    securityPolicy: {
      network: "allowlist",
      clipboard: "deny",
      downloads: "allow",
    },
    provenance: {
      createdBy: input.model,
      createdAt: new Date(now).toISOString(),
    },
  };

  const next: ArtifactLibrarySnapshot = {
    ...snapshot,
    artifacts: [
      {
        id: artifactId,
        title,
        artifactType: "video",
        currentRevisionId: revisionId,
        createdAt: now,
        updatedAt: now,
      },
      ...snapshot.artifacts,
    ],
    revisions: [
      { id: revisionId, artifactId, manifest, createdAt: now },
      ...snapshot.revisions,
    ],
    decisions: [
      {
        revisionId,
        reviewerPubkey: "local",
        status: "pending" as DecisionStatus,
        updatedAt: now,
      },
      ...snapshot.decisions,
    ],
  };
  const persisted = saveLibrary(next);
  return { snapshot: next, persisted };
}

export function deleteArtifact(
  snapshot: ArtifactLibrarySnapshot,
  artifactId: string,
): ArtifactLibrarySnapshot {
  for (const revision of snapshot.revisions) {
    const source = revision.manifest.source;
    if (
      revision.artifactId === artifactId &&
      source.kind === "local" &&
      source.uri.startsWith("blob:")
    ) {
      URL.revokeObjectURL(source.uri);
    }
  }
  const revisionIds = new Set(
    snapshot.revisions
      .filter((r) => r.artifactId === artifactId)
      .map((r) => r.id),
  );
  const next: ArtifactLibrarySnapshot = {
    ...snapshot,
    artifacts: snapshot.artifacts.filter((a) => a.id !== artifactId),
    revisions: snapshot.revisions.filter((r) => r.artifactId !== artifactId),
    reviews: snapshot.reviews.filter((r) => !revisionIds.has(r.revisionId)),
    decisions: snapshot.decisions.filter((d) => !revisionIds.has(d.revisionId)),
  };
  saveLibrary(next);
  return next;
}

export function addReview(
  snapshot: ArtifactLibrarySnapshot,
  input: {
    revisionId: string;
    body: string;
    timeMs?: number;
    slide?: number;
  },
): ArtifactLibrarySnapshot {
  const body = input.body.trim();
  if (!body) return snapshot;

  const review: ArtifactReview = {
    id: newId("revw"),
    revisionId: input.revisionId,
    body,
    status: "open" as ReviewStatus,
    authorPubkey: "local",
    createdAt: Date.now(),
    anchor: {
      revisionId: input.revisionId,
      ...(input.timeMs !== undefined ? { timeMs: input.timeMs } : {}),
      ...(input.slide !== undefined ? { slide: input.slide } : {}),
    },
  };

  const next: ArtifactLibrarySnapshot = {
    ...snapshot,
    reviews: [...snapshot.reviews, review],
  };
  saveLibrary(next);
  return next;
}

/** Source edits never mutate a revision — they create the next one. */
export function saveSourceRevision(
  snapshot: ArtifactLibrarySnapshot,
  revisionId: string,
  patch: Partial<Pick<ArtifactManifestV1, "deck" | "web" | "film">>,
): ArtifactLibrarySnapshot {
  const previous = snapshot.revisions.find((r) => r.id === revisionId);
  if (!previous) return snapshot;

  const now = Date.now();
  const nextRevisionId = newId("rev");
  const revision: ArtifactRevision = {
    id: nextRevisionId,
    artifactId: previous.artifactId,
    createdAt: now,
    manifest: {
      ...previous.manifest,
      revisionId: nextRevisionId,
      ...patch,
      provenance: {
        ...previous.manifest.provenance,
        createdBy: "local",
        createdAt: new Date(now).toISOString(),
      },
    },
  };

  const next: ArtifactLibrarySnapshot = {
    ...snapshot,
    revisions: [revision, ...snapshot.revisions],
    artifacts: snapshot.artifacts.map((a) =>
      a.id === previous.artifactId
        ? { ...a, currentRevisionId: nextRevisionId, updatedAt: now }
        : a,
    ),
    decisions: [
      {
        revisionId: nextRevisionId,
        reviewerPubkey: "local",
        status: "pending" as DecisionStatus,
        updatedAt: now,
      },
      ...snapshot.decisions,
    ],
  };
  saveLibrary(next);
  return next;
}

export function setDecision(
  snapshot: ArtifactLibrarySnapshot,
  revisionId: string,
  status: DecisionStatus,
): ArtifactLibrarySnapshot {
  const updatedAt = Date.now();
  const existing = snapshot.decisions.findIndex(
    (d) => d.revisionId === revisionId && d.reviewerPubkey === "local",
  );
  const decision: ArtifactDecision = {
    revisionId,
    reviewerPubkey: "local",
    status,
    updatedAt,
  };
  const decisions = [...snapshot.decisions];
  if (existing >= 0) decisions[existing] = decision;
  else decisions.push(decision);

  const next: ArtifactLibrarySnapshot = { ...snapshot, decisions };
  saveLibrary(next);
  return next;
}

/** Exposed for tests */
export function __emptySnapshotForTests(): ArtifactLibrarySnapshot {
  return emptySnapshot();
}
