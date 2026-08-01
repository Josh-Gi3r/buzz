# Preview Studio Architecture

**Upstream baseline:** `block/buzz` commit `c104eecfb38620de2c35c7e20a716f8658b5a6b1`
(an ancestor of the fork's build baseline `19d57b0`)
**Scope:** the architectural foundation for an additive Preview Studio product layer on Buzz,
preserving a working stock Buzz build and the ability to merge upstream changes.

## Status

**Implemented in v0** (shipping today, feature-flagged, local-only):

- Sidebar entry and `/preview-studio` route, gated behind the `preview-studio` feature flag
  (default off).
- Local artifact library persisted in `localStorage` (`buzz.previewStudio.library.v1`);
  nothing is published to the relay.
- Import of image and video files; image stage with lightbox; video stage reusing Buzz's
  `VideoPlayer`; inline PDF preview in an embedded frame.
- Review comments (the review model carries optional video time anchors) and per-revision
  approve/request-changes decisions.
- Renderer registry, demo seed artifacts, and Studio CSS tokens scoped to the Studio screen.

**Design blueprint** (everything else in this document): the relay event kinds, capability
negotiation, storage and processing architecture, sandboxed execution for web and native
formats, the client experience split, and the Studio global shell are designed here but not
implemented. The event kind proposal is collision-audited in
[../spec/artifact-kinds-v0.md](../spec/artifact-kinds-v0.md) and deliberately unregistered.

---

## 1. The decision

Do **not** rewrite Buzz, replace its relay, duplicate the application, or migrate away from
React/Tauri.

Build the custom product as an **additive product layer over Buzz**:

1. Preserve an exact mirror of `block/buzz/main`.
2. Maintain a product branch that regularly merges that mirror.
3. Keep stock Buzz available as an unmodified build/profile.
4. Add the new interface as a second presentation profile, not a second data model.
5. Add Preview Studio as a disabled-by-default feature vertical.
6. Keep the relay as the source of truth.
7. Store source bytes and derived renditions in the existing content-addressed media/object
   layer where possible.
8. Represent artifact identity, revisions, renditions, review anchors and decisions as
   signed events.
9. Run untrusted and executable previews outside Buzz's privileged main renderer.
10. Put format-specific execution into isolated renderer workers behind a registry.

The central product concept is not "more attachment previews." It is:

> **A signed, versioned Artifact workspace with pluggable renderers and review semantics.**

---

## 2. What Buzz is

Buzz is a self-hosted workspace in which people and AI agents are first-class identities. It
is not merely a chat application. The system contains a Rust relay and domain crates; a
React 19 + TypeScript + Vite desktop renderer in Tauri 2; a separate React browser client; a
separate Flutter mobile client; Postgres for durable events and projections; Redis for
pub/sub and presence; S3/MinIO-compatible content-addressed media storage; Nostr signed
events as the protocol and audit backbone; Git hosting and NIP-34 collaboration; YAML/JSON
workflows; and agent runtimes, ACP harnesses, and MCP tools.

### Architectural law

The relay is authoritative. Clients do not become independent state authorities, and renderer
workers must not become a second control plane.

Every durable collaboration action is expressed as a signed event with a numeric `kind`. The
relay authenticates, validates, stores, fans out, indexes, audits and triggers workflows.
Unknown event kinds are rejected, which means Preview Studio's first-class event model
requires a deliberately small relay/core extension.

### Tenant model

The host/domain determines the community before authentication, event ingest, query, media,
Git, search and workflow handling. Preview artifacts and review events must follow the same
tenant and channel boundaries. A manifest must never be trusted to declare its own tenant.

---

## 3. Product model

### 3.1 Artifact

A durable logical item — "Homepage redesign," "Investor deck," "Campaign motion cut." An
Artifact remains stable while its revisions change.

### 3.2 Revision

An immutable source state of an Artifact: a specific uploaded video hash, a static web bundle
produced from a given commit, deck version 7, a live URL snapshot made at a defined time.

### 3.3 Rendition

A derived representation made for display, review or delivery: thumbnail, poster, optimized
video, page image, PDF, stream rendition, screenshot set, sandbox entrypoint, waveform,
extracted text. A rendition always records provenance back to its source revision.

### 3.4 Session

A short-lived interactive runtime: remote browser, static app sandbox, emulator or simulator
session, motion-composition playback environment. A Session is not the source of truth;
durable outcomes become rendition and review events.

### 3.5 Review

A signed comment, annotation, reaction or decision attached to a specific revision and anchor.

### 3.6 Collection

An ordered composition of artifact references — the basis for slideshows, mixed-media
presentations, review playlists, and before/after sequences.

---

## 4. Manifest model

A renderer-neutral manifest, versioned from the first release. Illustrative shape:

```json
{
  "schemaVersion": 1,
  "artifactId": "uuid",
  "revisionId": "uuid-or-content-derived-id",
  "title": "Checkout flow",
  "artifactType": "web_app",
  "source": {
    "kind": "blob",
    "sha256": "...",
    "mime": "application/zip",
    "filename": "checkout-build.zip"
  },
  "entrypoint": "index.html",
  "provenance": {
    "project": "...",
    "commit": "...",
    "workflowRun": "...",
    "createdBy": "pubkey"
  },
  "renditions": [
    { "role": "poster", "sha256": "...", "mime": "image/webp", "width": 1600, "height": 1000 },
    { "role": "interactive", "runtime": "isolated_web_v1" }
  ],
  "capabilities": ["view", "interact", "comment", "inspect", "compare"],
  "securityPolicy": {
    "network": "deny",
    "allowedOrigins": [],
    "clipboard": "deny",
    "downloads": "deny"
  }
}
```

The full schema lives in [../spec/artifact-manifest-v1.md](../spec/artifact-manifest-v1.md)
and uses typed unions rather than making every field optional.

### Compatibility rules

- Unknown additive fields are ignored.
- Unsupported schema versions fall back to a generic artifact card and download.
- Unsupported renderer types never execute.
- Every revision is immutable; the artifact's current revision is a pointer, not mutable bytes.
- Checksums remain authoritative for stored bytes.
- Old Buzz clients continue showing ordinary links/files/messages.

---

## 5. Universal review-anchor model

A single review model supports all formats. Anchor dimensions include time (`timeMs`,
`frame`), position (`page`, `slide`), normalized spatial regions (`x`, `y`, `width`,
`height`), and application context (`route`, `viewport`, `selector`, `state`). See
[../spec/artifact-review-v1.md](../spec/artifact-review-v1.md).

Rules:

- Coordinates are normalized, not pixel-bound.
- Anchors always name a revision.
- Time and frame can coexist.
- Page/slide numbers are one-based in the UI but normalized internally.
- Controlled web apps should expose stable `data-preview-id` identifiers; selector anchors
  retain a coordinate/screenshot fallback.
- Comments can be unresolved, resolved or reopened.
- Approvals/decisions are separate from discussion comments.

Existing video time comments and project line comments become adapters into the same
conceptual model without rewriting their current event history.

---

## 6. Event model

Kind numbers are allocated (but not registered) in
[../spec/artifact-kinds-v0.md](../spec/artifact-kinds-v0.md). The minimum model:

1. **Artifact definition/current pointer** — parameterized-replaceable, channel-scoped.
2. **Artifact revision** — immutable, channel-scoped, referencing the artifact definition and
   source blobs/URLs/provenance.
3. **Artifact review** — immutable, channel-scoped, referencing a revision and optional anchor.
4. **Artifact decision** — replaceable per reviewer/revision for approved, changes-requested
   or pending status.
5. **Preview session state** — ephemeral, for presence, cursor, active route, playback
   position and interactive-session coordination.
6. **Rendition result** — either part of the immutable revision payload when created
   together, or a service-signed result event referencing the revision.

### Required relay touchpoints

Because unknown kinds are rejected, each new durable kind must be added to: the `buzz-core`
kind registry; scope mapping in relay ingest; channel-scope/tag validation; event dispatch
where side effects exist; SDK builders; protocol documentation; conformance and round-trip
tests; and client parsers as each client gains support.

Keep this patch deliberately small. Do not create a generic "accept arbitrary custom kind"
loophole.

### Capability negotiation

A relay with artifact support advertises `preview_artifacts_v1` in its
relay-information/capability response. A client connected to an unmodified upstream relay
hides network-backed Preview Studio publishing rather than attempting unsupported event kinds.

---

## 7. Storage and processing architecture

### Source storage

Use the existing content-addressed media/object layer wherever possible:

- Images and video use their current paths.
- PDF, deck files, archives and data can use the generic download-only file path.
- Static web builds can be uploaded as inert archives, never served inline from the ordinary
  media origin.
- Native build artifacts require a dedicated artifact-ingest policy because executable
  formats are intentionally blocked from standard attachments.

### Derived renditions

Renditions are content-addressed and immutable. They can share S3-compatible infrastructure
but should use a distinct logical prefix and service policy.

### Separate migration domain

Preview Studio projection tables must not be added to the upstream SQL migration sequence:
upstream migration numbers keep advancing, same-number conflicts are likely in a long-lived
fork, and the signed event log is already sufficient as the source of truth. If a projection
becomes necessary, it gets its own schema and migration runner rather than edits to existing
upstream migration files.

---

## 8. Renderer registry

Preview Studio uses a registry contract rather than a central type switch spread across the
UI. Conceptual interface:

```ts
interface ArtifactRenderer {
  id: string;
  canHandle(manifest: ArtifactManifest): boolean;
  prepare(context: RendererContext): Promise<PreparedArtifact>;
  render(props: RendererProps): React.ReactNode;
  getReviewCapabilities(manifest: ArtifactManifest): ReviewCapability[];
  getFallback(manifest: ArtifactManifest): FallbackPresentation;
}
```

Planned adapters: image; video; PDF; deck/slides; website URL; static web application;
Android session; iOS session; motion composition; mixed-media slideshow; generic file
fallback.

A renderer receives capability-scoped data. It never receives the user's signing key,
unrestricted relay token, native filesystem or Tauri command surface.

---

## 9. Execution model by format

### Images

Local rendering in the client, extended with high-resolution tiled loading where necessary,
pan and zoom, fit/fill/actual-size, normalized point and region annotations, side-by-side
and overlay comparison, revision switching, and a metadata inspector.

### Video

Reuse the existing player and native media proxy. Extend with frame stepping, in/out review
ranges, loop region, compare/split view, revision selector, decision state, and optional
waveform and subtitles as renditions.

### PDF and decks

Convert server-side/worker-side into a stable page model: original file retained; PDF
rendition; per-page/slide image renditions; thumbnails; extracted text and notes where
available; slide/page anchors; presenter and slideshow modes.

### Website URLs

Two modes: a **safe embed fast path** for sites that permit embedding and need no privileged
access, and a **remote browser session** as the reliable path for arbitrary sites,
authentication, inspection and responsive viewport testing. Arbitrary websites are never
injected into Buzz's privileged main Tauri webview.

### Static web applications

Source arrives as an inert archive plus manifest; a worker validates archive structure and
expansion limits; content unpacks into a unique, immutable origin with a strict CSP; service
workers are isolated or disabled by policy; network is denied by default and allowlisted
explicitly; no relay credentials, local filesystem or Tauri IPC; an optional preview SDK
communicates through a narrow `postMessage` contract.

### Android applications

Isolated emulator or device worker: install a validated build artifact, stream frames to
Preview Studio, send scoped input events back, reset the environment between sessions, and
persist only requested screenshots, recordings, logs and review evidence.

### iOS applications

Isolated macOS worker with simulator/device capability, using the same session abstraction
as Android. No assumption that an ordinary device IPA can execute directly in Tauri. Session
evidence and derived renditions are stored; simulator state is never authoritative.

### Motion graphics

Two classes: rendered video, handled by the video adapter; and executable compositions,
handled by a sandboxed format adapter that produces deterministic playback and export
renditions.

### Slideshows

Represented as a Collection artifact: ordered artifact/revision references, per-item
duration, transition metadata, soundtrack/reference tracks, presenter mode, autoplay and
manual control, mixing images, videos, deck pages and motion clips.

---

## 10. Security boundary

This is the most important technical rule after upstream compatibility.

### Non-negotiable isolation

Untrusted preview content must have:

- a separate origin and preferably a separate process/session;
- no Tauri IPC;
- no user private key;
- no general relay token;
- no application local storage shared with Buzz;
- no native filesystem;
- network denied by default;
- no arbitrary popups, downloads, clipboard or navigation;
- strict response and decompression limits;
- malware/content scanning where executable artifacts enter;
- time, memory and CPU quotas;
- one-time, artifact-scoped session credentials;
- channel/tenant authorization checked at request time;
- session expiry and complete teardown.

### Reuse Buzz's security patterns

Buzz already contains tenant-bound media authorization, short-lived Blossom read
authorization, native media proxying that only attaches credentials to the relay origin,
origin checks, streaming and range support, SSRF-aware link metadata logic, and fail-closed
permission checks in workflows and agent paths. The preview service should reuse these shared
libraries and policies rather than reimplement them.

### Private artifacts

Deployments should require authenticated media reads for private workspaces. A publicly
cacheable content hash is not itself an access-control decision.

---

## 11. Client experience split

### Desktop: complete studio

Artifact library and collections; large central stage; version/revision rail; inspector;
review comments; timeline/player controls; upload and publish; web/native interactive
sessions; compare mode; approval decisions; project/workflow/agent provenance.

### Browser: review and sharing

Authenticated artifact links; image/video/deck/PDF review; browser and static-web previews
where safe; comments and decisions; no local native execution privileges; remote native
sessions where policy permits.

### Mobile: companion

Touch-first viewing; comments and decisions; image/video/deck/PDF consumption; live-session
observation and limited interaction; push notifications. The mobile client does not duplicate
the full desktop authoring environment.

---

## 12. Studio visual layer

### Principle

Do not turn every rectangle into blurred glass. A credible futuristic interface uses
hierarchy, optical depth, motion and clarity — not indiscriminate transparency.

### Layers

1. **Atmosphere** — animated gradient/grain field, restrained parallax, adaptive accent light.
2. **System chrome glass** — top bar, community rail, navigation rail, command palette,
   transient overlays.
3. **Workspace lens** — central stage with high contrast and minimal distraction.
4. **Inspector material** — denser translucent panels with readable controls and data.
5. **Content surfaces** — mostly opaque or optically solid when text density is high.

### Semantic tokens

Glass tint, glass opacity, blur radius, saturation, border luminosity, material noise, depth
shadow, accent bloom, focus halo, panel elevation, transition velocity, spring response, and
a reduced-transparency fallback.

### Implementation rule

Apply a root profile attribute — `<html data-visual-profile="studio">`. Stock variables and
markup remain available; Studio values and selective shell components activate only under the
profile. In v0, Studio tokens are scoped to the Preview Studio screen.

### Accessibility and performance

Readable contrast over every material; solid fallback for reduced transparency; a
reduced-motion path; no background blur on large scrolling content surfaces; GPU budget and
performance tests; clear keyboard focus; screen-reader labels preserved; no meaning conveyed
only through glow or colour.

---

## 13. Upstream-safe fork model

### Remotes and branches

```text
upstream/main              Block's repository
origin/upstream-main       exact automated mirror, never custom commits
origin/main                fork integration branch
origin/integration/<date>  temporary upstream merge rehearsal
```

### Integration method

- Fetch upstream frequently and fast-forward the exact mirror.
- Create a temporary integration branch, merge `origin/upstream-main` with a real merge
  commit, and run the full Rust, desktop, browser, mobile, protocol and packaging gates.
- Merge the tested integration branch into the fork's main branch.
- Never rewrite published fork history.

Upstream uses squash merges heavily. Repeatedly rebasing a published fork branch or
cherry-picking stacks makes ancestry and conflict resolution worse; a tested merge lane is
the safer long-term operating model.

### Patch budget

Track every modification to an upstream-owned file. Targets: fewer than twelve permanent
protocol/shell integration hotspots; all substantial custom implementation in new
files/directories; no edits to historical upstream migrations; no duplicated copy of an
upstream feature directory; no custom changes mixed into unrelated upstream bug fixes.

### Fork ledger

[FORK_PATCHES.md](../../FORK_PATCHES.md) records, per patched upstream file: why the patch
exists, its owner, the tests protecting it, whether it can be contributed upstream, and the
last conflict and resolution.

### Distribution identities

A publicly distributed build of this fork must have its own product name, application
identifiers, deep-link scheme, data and cache directories, keychain/service names, updater
endpoint and signing keys, icons, and release channels. The code is Apache-2.0, but the
license does not grant Block's trademarks or product branding.

---

## 14. Code seams

### New custom areas

```text
desktop/src/features/preview-studio/
  lib/          # store, types, registry, demo catalog, display-URI resolution
  hooks.ts
  ui/           # PreviewStudioScreen, PreviewStage

desktop/src/shared/theme/studio/

docs/spec/artifact-manifest-v1.md
docs/spec/artifact-review-v1.md
docs/spec/artifact-kinds-v0.md
```

### Small upstream-owned touchpoints

`buzz-core/src/kind.rs` (future); relay ingest scope mapping and channel validation (future);
SDK builder exports (future); the preview feature manifest; desktop sidebar/navigation
registry; release/build profile configuration. The current set is enumerated in
[FORK_PATCHES.md](../../FORK_PATCHES.md).

### Files to avoid broad changes in

The existing `AppShell.tsx`; existing database migrations; the generic message parser and
attachment round-trip logic; agent runtime internals; workflow engine internals; existing
project/Git event semantics; Tauri's main capability set.

---

## 15. Relationship to active upstream work

- **Generic link unfurling.** An open upstream proposal covers Open Graph/oEmbed metadata,
  SSRF protection, ranged fetching, image proxying and caching. This fork does not build a
  competing unfurl system; Preview Studio consumes upstream link cards and adds the deeper
  interactive session/review layer.
- **Structured agent artifacts.** An open upstream proposal defines structured job handoffs
  with typed artifact references. Preview Studio uses that vocabulary where possible and adds
  what it intentionally does not: logical artifact identity, revisions, renditions, renderer
  capabilities, live sessions, universal review anchors, decisions, and collections.
- **Native renderer proposal.** There is an open upstream proposal to migrate the desktop
  renderer to a native SDK. It is not the current architecture and is not the basis of this
  fork: the current application and tests already exist on React/Tauri, Preview Studio needs
  web/document/media rendering, and a renderer migration would multiply risk and merge
  surface.

---

## 16. Non-negotiables

1. No full rewrite.
2. No arbitrary HTML/JS inside the main authenticated Tauri renderer.
3. No user signing key or general relay token in preview content.
4. No new source of truth outside signed events and immutable content hashes.
5. No destructive changes to existing event meanings.
6. No edits to historical upstream migrations.
7. No second copy of the desktop application.
8. No hardcoded format logic scattered through the shell.
9. No weakening of generic-file upload safeguards to make previews convenient.
10. No public distribution under Block's identifiers or branding.
11. No fork-only state that a stock Buzz client cannot safely ignore.
12. No upstream merge accepted without the stock-profile regression build passing.
