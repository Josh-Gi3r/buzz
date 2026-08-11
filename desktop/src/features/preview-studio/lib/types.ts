/**
 * BUZZ — LIVE PREVIEW STUDIO artifact types.
 * Spec: docs/spec/artifact-manifest-v1.md, docs/spec/artifact-review-v1.md
 *
 * v0 is a client-side model; relay-backed event kinds are not yet defined.
 */

export type ArtifactType =
  | "image"
  | "video"
  | "pdf"
  | "deck"
  | "website"
  | "web_app"
  | "android"
  | "ios"
  | "motion"
  | "slideshow"
  | "collection"
  | "generic_file";

export type ArtifactCapability =
  | "view"
  | "interact"
  | "comment"
  | "inspect"
  | "compare"
  | "approve";

export type ArtifactSource =
  | {
      kind: "blob";
      sha256: string;
      mime: string;
      filename?: string;
    }
  | {
      kind: "url";
      url: string;
      capturedAt?: string;
    }
  | {
      kind: "project_ref";
      projectId: string;
      commit?: string;
      path?: string;
    }
  | {
      kind: "local";
      uri: string;
      mime?: string;
      filename?: string;
      /** uri is a session-scoped object URL; invalid after app restart */
      ephemeral?: boolean;
    };

export type RenditionRole =
  | "poster"
  | "thumbnail"
  | "interactive"
  | "pdf"
  | "page"
  | "stream"
  | "waveform"
  | "text"
  | (string & {});

export interface ArtifactRendition {
  role: RenditionRole;
  /** 1-based position for paged renditions (deck slides, PDF pages). */
  page?: number;
  sha256?: string;
  mime?: string;
  width?: number;
  height?: number;
  runtime?: string;
  uri?: string;
}

export interface ArtifactSecurityPolicy {
  network: "deny" | "allowlist";
  allowedOrigins?: string[];
  clipboard?: "deny" | "allow";
  downloads?: "deny" | "allow";
}

export interface ArtifactManifestV1 {
  schemaVersion: 1;
  artifactId: string;
  revisionId: string;
  title: string;
  artifactType: ArtifactType;
  source: ArtifactSource;
  entrypoint?: string;
  provenance?: {
    project?: string;
    commit?: string;
    workflowRun?: string;
    createdBy?: string;
    createdAt?: string;
  };
  renditions?: ArtifactRendition[];
  /** Deck source document (HTML slides). Present on deck artifacts. */
  deck?: unknown;
  /** Website/web-app source files. Present on website and web_app artifacts. */
  web?: unknown;
  /** Film cut (HyperFrames composition + its render). Present on video artifacts. */
  film?: unknown;
  capabilities?: ArtifactCapability[];
  securityPolicy?: ArtifactSecurityPolicy;
}

export interface ReviewAnchorV1 {
  revisionId: string;
  timeMs?: number;
  frame?: number;
  page?: number;
  slide?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  route?: string;
  viewport?: string;
  selector?: string;
  elementRef?: string;
  state?: string;
  renderer?: string;
}

export type ReviewStatus = "open" | "resolved" | "reopened";
export type DecisionStatus = "pending" | "approved" | "changes_requested";

export interface ArtifactReview {
  id: string;
  revisionId: string;
  body: string;
  anchor?: ReviewAnchorV1;
  status: ReviewStatus;
  authorPubkey?: string;
  createdAt: number;
}

export interface ArtifactDecision {
  revisionId: string;
  reviewerPubkey: string;
  status: DecisionStatus;
  updatedAt: number;
}

/** Logical artifact — stable identity across revisions */
export interface Artifact {
  id: string;
  title: string;
  artifactType: ArtifactType;
  channelId?: string;
  currentRevisionId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ArtifactRevision {
  id: string;
  artifactId: string;
  manifest: ArtifactManifestV1;
  createdAt: number;
}
