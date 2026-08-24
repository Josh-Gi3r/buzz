import {
  loadLibrary,
  saveLibrary,
  type ArtifactLibrarySnapshot,
} from "./store";
import type {
  Artifact,
  ArtifactDecision,
  ArtifactManifestV1,
  ArtifactRevision,
} from "./types";

const HTTP_URL = /https?:\/\/[^\s<>"'`]+/giu;
const TRAILING_PROSE = /[\])},.!?;:]+$/u;

export type AgentPreviewInput = {
  messageId: string;
  url: string;
  author: string;
  authorPubkey?: string;
  channelId?: string | null;
};

export type AgentPreviewResult = {
  artifactId: string;
  persisted: boolean;
  snapshot: ArtifactLibrarySnapshot;
};

/** Pull safe, frameable URL candidates out of ordinary Markdown prose. */
export function extractPreviewUrl(content: string): string | null {
  for (const match of content.matchAll(HTTP_URL)) {
    const candidate = match[0].replace(TRAILING_PROSE, "");
    try {
      const parsed = new URL(candidate);
      if (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        !parsed.username &&
        !parsed.password
      ) {
        return parsed.href;
      }
    } catch {
      // Keep looking: an earlier prose fragment may only resemble a URL.
    }
  }
  return null;
}

function stableId(prefix: string, value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${prefix}_${(hash >>> 0).toString(36)}`;
}

function previewTitle(author: string, url: string): string {
  const host = new URL(url).host;
  return `${author || "Agent"} · ${host}`;
}

/**
 * Turn an agent's live URL into a durable Studio artifact. The message owns
 * the stable artifact identity; an edited message pointing elsewhere becomes
 * a new revision, so existing reviews remain pinned to what was reviewed.
 */
export function upsertAgentPreview(
  input: AgentPreviewInput,
): AgentPreviewResult {
  const snapshot = loadLibrary();
  const now = Date.now();
  const artifactId = stableId("agent_preview", input.messageId);
  const revisionId = stableId(
    "agent_preview_rev",
    `${input.messageId}:${input.url}`,
  );
  const title = previewTitle(input.author, input.url);
  const existingArtifact = snapshot.artifacts.find(
    (artifact) => artifact.id === artifactId,
  );
  const existingRevision = snapshot.revisions.find(
    (revision) => revision.id === revisionId,
  );

  const manifest: ArtifactManifestV1 = {
    schemaVersion: 1,
    artifactId,
    revisionId,
    title,
    artifactType: "website",
    source: {
      kind: "url",
      url: input.url,
      capturedAt:
        existingRevision?.manifest.source.kind === "url"
          ? existingRevision.manifest.source.capturedAt
          : new Date(now).toISOString(),
    },
    provenance: {
      project: input.channelId
        ? `Buzz channel ${input.channelId}`
        : "Buzz agent message",
      createdBy: input.authorPubkey || input.author,
      createdAt:
        existingRevision?.manifest.provenance?.createdAt ??
        new Date(now).toISOString(),
    },
    capabilities: ["view", "interact", "comment", "inspect", "approve"],
    securityPolicy: {
      network: "allowlist",
      allowedOrigins: [new URL(input.url).origin],
      clipboard: "deny",
      downloads: "deny",
    },
  };

  const artifact: Artifact = {
    id: artifactId,
    title,
    artifactType: "website",
    channelId: input.channelId ?? existingArtifact?.channelId ?? undefined,
    currentRevisionId: revisionId,
    createdAt: existingArtifact?.createdAt ?? now,
    updatedAt: now,
  };
  const revision: ArtifactRevision = existingRevision
    ? { ...existingRevision, manifest }
    : { id: revisionId, artifactId, manifest, createdAt: now };
  const decision: ArtifactDecision = {
    revisionId,
    reviewerPubkey: "local",
    status: "pending",
    updatedAt: now,
  };

  const next: ArtifactLibrarySnapshot = {
    ...snapshot,
    artifacts: [
      artifact,
      ...snapshot.artifacts.filter((item) => item.id !== artifactId),
    ],
    revisions: [
      revision,
      ...snapshot.revisions.filter((item) => item.id !== revisionId),
    ],
    decisions: snapshot.decisions.some(
      (item) =>
        item.revisionId === revisionId && item.reviewerPubkey === "local",
    )
      ? snapshot.decisions
      : [decision, ...snapshot.decisions],
  };

  return { artifactId, persisted: saveLibrary(next), snapshot: next };
}
