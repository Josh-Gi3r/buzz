# Artifact Kinds v0 (proposal)

**Status:** proposal only — **not registered** in `crates/buzz-core/src/kind.rs`  
**Relay integration:** kind constants + ingest scopes land in a future relay PR after this allocation is accepted  
**Depends on:** [artifact-manifest-v1.md](./artifact-manifest-v1.md), [artifact-review-v1.md](./artifact-review-v1.md)  
**Collision audit refs:** fork product `d36f39336b05036f90ba20e273746374c25aaf3e` and official upstream observed at `f8f2ef0440e7a074223ec04dc3b32d817b8b9d9b`. Repeat the audit before registration.

## Goal

Reserve kind numbers for BUZZ — LIVE PREVIEW STUDIO durable and session events without colliding with existing Buzz or NIP kinds, and without registering them in the relay yet.

## Storage-class rules (NIP-01 / NIP-33)

| Need | Range | Why |
|------|-------|-----|
| Parameterized replaceable (current pointer, per-reviewer decision) | `30000–39999` | Replacement key is `(pubkey, kind, d_tag)` |
| Regular immutable (revision, review, optional rendition) | outside replaceable/ephemeral ranges | Append-only; preferred Buzz product range is `4xxxx` |
| Ephemeral session (presence/playback/cursor) | `20000–29999` | Never stored; Redis/live fan-out only |

**Do not** put the current pointer or per-reviewer decision in `4xxxx` — those numbers are regular events and will not replace correctly under NIP-33.

## Historical collision audit

### Occupied Buzz `4xxxx` product blocks

| Block | Use |
|-------|-----|
| `40002–40008`, `40099`, `40100` | Stream messages, canvas |
| `40901–40902` | Relay-only channel/presence sidecars |
| `41001`, `41010–41012` | DMs |
| `42000` | Product feedback |
| `43001–43006` | Agent jobs |
| `44100–44101` | Member add/remove notifications |
| `44200` | Agent turn metric |
| `45001–45003` | Forum |
| `46001–46012`, `46020`, `46030–46031` | Workflow engine |
| `47000–47999` | Reserved comment: user groups (no constants yet) |
| `48001`, `48100–48103`, `48106` | Audit + huddles |
| `49001` | Media upload (internal) |

**Free and contiguous for durable BUZZ — LIVE PREVIEW STUDIO regulars:** `44000–44099` (immediately before notifications `44100`).

### Occupied parameterized-replaceable samples (not exhaustive of NIPs)

`30000`, `30003`, `30023`, `30030`, `30078`, `30174–30178`, `30300`, `30315`, `30350` (`KIND_PUSH_LEASE`), `30617–30618`, `30620–30622`, `39000–39003`, `39005–39006`.

**Free contiguous block used here:** `30800–30809` (after git/project/DM-visibility cluster, well clear of NIP-29 `390xx`).

### Occupied ephemeral samples

`20001–20002`, `22242`, `24134`, `24200`, `24242–24243`, `24810`, `27235`, `28936`.

**Free slot used here:** `24900` (near collab realtime `24810` huddle reaction; not adjacent to auth/pairing noise).

### Conflicts found

**None were found** for the numbers below at the pinned historical refs. This is not a
reservation and may become stale as upstream evolves.

`47000–47999` was considered and **rejected** for first allocation: the file already reserves that band for user groups. `4011x` (near canvas) was considered and deferred so stream/canvas churn does not share a tight band with artifact protocol kinds.

## Proposed allocation

### Summary table

| # | Concept | Kind | Constant (proposed name) | Storage class | Channel scope |
|---|---------|------|--------------------------|---------------|---------------|
| 1 | Artifact definition / current pointer | **30800** | `KIND_ARTIFACT_POINTER` | Parameterized replaceable | Yes (`h` + channel membership) |
| 2 | Artifact revision | **44001** | `KIND_ARTIFACT_REVISION` | Regular immutable | Yes |
| 3 | Artifact review | **44002** | `KIND_ARTIFACT_REVIEW` | Regular immutable | Yes |
| 4 | Artifact decision | **30801** | `KIND_ARTIFACT_DECISION` | Parameterized replaceable | Yes |
| 5 | Preview session state | **24900** | `KIND_PREVIEW_SESSION` | Ephemeral | Yes (session/channel tags) |
| 6 | Rendition result (optional) | **44003** | `KIND_ARTIFACT_RENDITION` | Regular immutable | Yes |

Reserved headroom (not assigned yet, do not reuse casually):

| Kind | Intent |
|------|--------|
| `30802–30809` | Future param-replaceable artifact heads (e.g. collection pointer, per-user pin of an artifact) |
| `44000` | Block sentinel / future durable sibling (keep free until needed) |
| `44004–44019` | Future durable artifact kinds (collection snapshot, compare set, etc.) |
| `24901–24909` | Future ephemeral preview collab (cursor-only split, renderer heartbeat) |

### 1. Artifact pointer — `30800`

- **Class:** NIP-33 parameterized replaceable.
- **Address:** `(pubkey, 30800, d)` where `d` = stable `artifactId`.
- **Semantics:** Authoritative **current revision** pointer for a logical artifact. Content (or tags) names `revisionId` / coordinate of the current `44001` event; does not carry mutable manifest bytes.
- **Channel:** Require `h` (channel id). Ingest later enforces membership + write scope; pointer is community/channel-local, never trusted from a foreign tenant.
- **Why 30k not 40k:** Clients and relays must treat latest `(author, kind, d)` as current; regular `4xxxx` events do not replace.

### 2. Artifact revision — `44001`

- **Class:** Regular immutable (append-only).
- **Payload:** `ArtifactManifestV1` (see manifest spec) or hash + blob pointer equivalent.
- **Tags (sketch):** `h` channel; `d` or custom tags for `artifactId` / `revisionId` for filterability; optional `e`/`a` back-ref to prior revision; optional project/commit provenance tags.
- **Why 44001:** Durable product event in free `4400x` band; not replaceable so history is preserved.

### 3. Artifact review — `44002`

- **Class:** Regular immutable.
- **Payload:** review body + `ReviewAnchorV1` (see review spec); state `open | resolved | reopened` may be initial state only — later transitions can be new events or a future replaceable head (out of v0 scope).
- **Tags (sketch):** `h`; reference to `revisionId` / `44001` event id; optional thread `e` root.

### 4. Artifact decision — `30801`

- **Class:** NIP-33 parameterized replaceable.
- **Address:** `(pubkey=reviewer, 30801, d)` where `d` = `revisionId` (or `artifactId:revisionId` if revision ids are not globally unique).
- **Semantics:** Latest decision for that reviewer on that revision: `pending | approved | changes_requested`.
- **Why separate from review comments:** Decisions are per-reviewer replaceable state; comments are immutable timeline (`44002`).
- **Why not plain replaceable `10xxx`:** Multiple revisions require multiple concurrent heads per author → needs `d` tag (NIP-33).

### 5. Preview session state — `24900`

- **Class:** Ephemeral (`20000–29999`); never stored.
- **Semantics:** Interactive runtime only — presence, playback position, cursors, renderer session id. Not source of truth for artifact bytes or approvals (manifest principles).
- **Why ephemeral range:** Matches presence/typing/huddle-reaction pattern; durable outcomes must be published as `44001` / `44002` / `30801` / `44003`.

### 6. Rendition result (optional) — `44003`

- **Class:** Regular immutable (or later service-signed variant under the same kind if the relay co-signs; v0 assumes client/worker-authored with provenance tags).
- **Semantics:** Derived display/delivery artifact for a revision (`poster`, `thumbnail`, `pdf`, `stream`, …) with `sha256` / mime / runtime / dimensions as in manifest `renditions[]`.
- **Optional in v0:** Clients can embed lightweight rendition metadata inside `44001` content; use `44003` when renditions are produced asynchronously or by a worker after the revision is published.

## Why not a single pure `40xxx` block?

Only regular events can live in free `4400x`. Pointer and decision **must** sit in `30000–39999` to get NIP-33 replace semantics. Session **must** sit in `20000–29999` to stay non-durable. Splitting across ranges is required by the protocol, not a style choice.

## Capability gate (unchanged)

Custom relay advertises `preview_artifacts_v1` (NIP-11 / relay info). Clients on stock upstream hide network publish and stay local/demo until these kinds are registered and scoped in ingest.

## Explicit non-goals (this doc)

- Do **not** add constants to `kind.rs` / `ALL_KINDS` yet.
- Do **not** wire `required_scope_for_kind`, side effects, or DB projections yet.
- Do **not** accept arbitrary custom kinds at ingest; registration remains explicit.

## Registration checklist (future relay PR)

1. Add the six constants + comments + `ALL_KINDS` entries in `kind.rs`.
2. Compile-time asserts: `30800`/`30801` parameterized; `24900` ephemeral; `44001–44003` neither replaceable nor ephemeral.
3. `required_scope_for_kind` + channel/`h` validation.
4. Payload types aligned with manifest/review v1.
5. Capability flag `preview_artifacts_v1`.
6. Tests: no duplicate kinds; replace/ephemeral behaviour; tenant/`h` isolation.

## Changelog

| Date | Note |
|------|------|
| 2026-08-11 | Rechecked proposed ranges against official upstream `f8f2ef04`; no collisions found. |
| 2026-08-11 | Rechecked proposed ranges against official upstream `3f2f3264`; no collisions found. |
| 2026-08-01 | v0 proposal from full `kind.rs` audit; no registry edits. |
