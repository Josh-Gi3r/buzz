# Product system

Buzz is Nostr-first: signed events are the collaboration contract, while HTTP
is reserved for transport needs such as media, generic event bridges, webhooks,
git smart HTTP, health and operator/admin routes.

```text
Desktop / Mobile / Web / CLI / ACP harnesses
                    │
            WebSocket + narrow HTTP
                    │
                buzz-relay
       ┌────────────┼─────────────┐
       │            │             │
   Postgres       Redis       S3 / MinIO
 durable events   live state   media + git objects
 projections      fan-out
```

The request host resolves a community. That tenant context must remain attached
to database rows, cache and rate-limit keys, search, media, git, workflows,
push and audit behavior. A subscription filter matching an event does not by
itself authorize delivery; author-only, recipient, engram, shared-access and
result gates are rechecked by the relay.

## Collaboration event flow

1. A client builds and signs an event.
2. WebSocket and generic HTTP submission converge on relay ingest.
3. The relay validates signature, shape, community scope and kind-specific authorization.
4. Durable events and projections go to Postgres; ephemeral presence and typing use live/Redis paths; blobs go through media storage.
5. Local and Redis fan-out deliver authorized events to subscribers.
6. Clients project those events into channels, threads, projects, workflows and other views.

The authoritative kind registry is `crates/buzz-core/src/kind.rs`. Client
constants mirror it but do not redefine protocol truth.

## Agent execution flow

```text
Channel or DM instruction
        │ signed event
        ▼
     buzz-relay
        │ authorized subscription
        ▼
      buzz-acp ── session / cancel / steer ── ACP agent process
        │                                      │
        │                                      ├─ model provider
        │                                      ├─ MCP tools
        │                                      └─ buzz CLI
        ▼
presence, observer activity and signed agent output
```

Desktop owns agent setup, personas, teams, runtime discovery and deployment
choice. `buzz-acp` owns relay-facing triggering, context, deduplication,
sessions, output and recovery. The ACP process performs model/tool work.

Execution may be local, supplied by an installed remote backend, or use
configured relay-mesh compute. These are distinct lifecycles. Owner attestation,
allowlists and stricter DM checks prevent a broad channel access setting from
silently becoming unrestricted private access.

## Desktop and other clients

The Tauri/React desktop app is the reference breadth client. Native commands are
registered centrally in `desktop/src-tauri/src/lib.rs`; React feature modules
project their relay and native state under `desktop/src/features/`.

Mobile is a Flutter/Riverpod client with a deliberately narrower feature set.
The public web app handles invitations and repository browsing. The admin SPA
is a separate private, read-only operator surface. The `buzz` CLI provides
machine-readable product operations to people, scripts and agents.

## Preview Studio data flow

Preview Studio currently adds no relay protocol or database migration:

```text
Agent-authored URL ─┐
Local import ───────┼─→ local artifact + immutable revisions
Media generation ──┘             │
                                 ├─→ renderer stage
                                 ├─→ local review anchors
                                 └─→ local decision per revision
```

The store lives in renderer `localStorage`. An artifact is the stable logical
item; revisions contain the source manifest; reviews and decisions point to a
revision. Editing deck, web or film source creates a new revision rather than
mutating the reviewed one.

### Render boundaries

- Images and videos use ordinary media components.
- PDFs accept only local PDF data/blob URLs and use an empty iframe sandbox.
- Static website source is assembled locally and framed with scripts allowed but no same-origin access.
- Live URLs use a sandboxed iframe with scripts, forms, modals and same-origin behavior required by ordinary sites. The frame receives no Buzz signing key, general relay token or direct Tauri invoke surface.
- Native media generation can invoke only the allowlisted `higgsfield` and `hyperframes` executables.

The artifact manifest carries a network policy, but live URL allowlist
enforcement is not yet a separate runtime gate. External site framing also
remains subject to the site's CSP and `X-Frame-Options`.

### Local is not the same as offline

The library, reviews and decisions are device-local. Live websites and media
generation can still use the network. Image prompts and credentials interact
with the selected provider; Higgsfield video generation uses the authenticated
local CLI. No collaborative artifact sync exists until the proposed artifact
event kinds are implemented and admitted by the relay.

## Fork boundary

The fork is based on `desktop-v0.5.8`. Substantial additions live under
`desktop/src/features/preview-studio/`, while route, navigation, CSP and native
command registration are thin seams recorded in `FORK_PATCHES.md`. At the
documented commit, Preview Studio changes do not modify `buzz-core`, the relay,
the database crates or migration history.

See [Product capabilities](../product/capabilities.md) for status and the
[evidence index](../reference/evidence-index.md) for canonical files.
