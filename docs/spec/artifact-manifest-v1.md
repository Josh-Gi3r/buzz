# Artifact Manifest v1 proposal

**Status:** proposed relay-neutral contract; not the shipped local runtime schema.

The current implementation is defined by `desktop/src/features/preview-studio/lib/types.ts`
and `store.ts`. It includes local sources, URI/page rendition fields, and embedded web, deck,
and film document data that the original proposal did not model. Unsupported local schema
versions may be quarantined or reset rather than becoming a generic downloadable card. The
renderer registry is not the sole dispatch authority, and `securityPolicy.allowedOrigins` is
not a complete enforced network gate.

Any future protocol revision must first reconcile those differences.

## Proposed principles

- A logical artifact is stable; a revision is immutable.
- A rendition is derived display/delivery output with provenance.
- A session is ephemeral and not durable truth.
- Reviews attach to a revision and optional anchor.
- Tenant/community authority comes from the relay, never the manifest.
- Unsupported versions and renderers fail closed through behavior proven by conformance tests.

## Illustrative source union

```ts
type ProposedArtifactSource =
  | { kind: "blob"; sha256: string; mime: string; filename?: string }
  | { kind: "url"; url: string; capturedAt?: string }
  | { kind: "project_ref"; projectId: string; commit?: string; path?: string };
```

This union is illustrative and intentionally does not claim parity with current local types.

## Proposed manifest

A future v1 may include schema/artifact/revision identifiers, title, artifact type, source,
entrypoint, provenance, renditions, declared capabilities, and a security policy. Exact field
names and compatibility rules must be generated from one accepted schema rather than copied
between prose and TypeScript.

Proposed kind numbers are in [artifact-kinds-v0.md](artifact-kinds-v0.md). They are not
registered. Do not accept arbitrary custom kinds or advertise `preview_artifacts_v1` until
relay admission, storage, delivery, clients, and conformance ship together.
