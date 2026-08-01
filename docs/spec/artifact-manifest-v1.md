# Artifact Manifest v1 (draft)

**Status:** draft — implement domain types against this; relay kinds TBD  
**Schema version:** 1  

## Principles

- Logical **Artifact** is stable; **Revision** is immutable.
- **Rendition** is derived display/delivery form with provenance to a revision.
- **Session** is ephemeral interactive runtime; not source of truth.
- **Review** attaches to revision + optional anchor.
- **Collection** is ordered references (slideshows, reels, playlists).
- Unknown additive fields ignored; unsupported versions → generic card + download.
- Unsupported renderer never executes.
- Manifest never declares tenant/community — host/relay does.

## Types (logical)

### ArtifactType

`image | video | pdf | deck | website | web_app | android | ios | motion | slideshow | collection | generic_file`

### Source

```ts
type ArtifactSource =
  | { kind: "blob"; sha256: string; mime: string; filename?: string }
  | { kind: "url"; url: string; capturedAt?: string }
  | { kind: "project_ref"; projectId: string; commit?: string; path?: string };
```

### Manifest (revision payload)

```ts
interface ArtifactManifestV1 {
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
    createdBy?: string; // pubkey
    createdAt?: string; // ISO
  };
  renditions?: Array<{
    role: string; // poster | thumbnail | interactive | pdf | page | stream ...
    sha256?: string;
    mime?: string;
    width?: number;
    height?: number;
    runtime?: string; // isolated_web_v1 | appetize_v1 | ...
  }>;
  capabilities?: Array<
    "view" | "interact" | "comment" | "inspect" | "compare" | "approve"
  >;
  securityPolicy?: {
    network: "deny" | "allowlist";
    allowedOrigins?: string[];
    clipboard?: "deny" | "allow";
    downloads?: "deny" | "allow";
  };
}
```

## Relay kinds

Kind numbers for the artifact pointer, revision, review, decision, session, and rendition
events are allocated (collision-audited, not yet registered) in
[artifact-kinds-v0.md](./artifact-kinds-v0.md).

Do **not** accept arbitrary custom kinds. Register explicitly in `buzz-core`.

## Capability advertisement

Custom relay: `preview_artifacts_v1` in NIP-11 / relay info.  
Client on stock upstream relay: hide network publish; local/demo mode only until kinds land.
