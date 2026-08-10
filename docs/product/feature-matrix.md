# Feature truth matrix

This matrix describes fork product code at `d36f39336b05036f90ba20e273746374c25aaf3e`, inherited from `desktop-v0.5.8` at `f3de860574bb3119018b4592353e9761635aeb07`. Documentation and showcase material were assembled separately at `887d6da441684abda30a7284d004f6d4dd52a767`.

Statuses mean:

- **Implemented** — production ingress and source/test evidence exist.
- **Preview/partial** — shipped behind a preview flag or with known incomplete paths.
- **Optional** — implemented but requires separately configured infrastructure.
- **Engine demonstrated** — real code and focused tests exist, but no general production user ingress exists.
- **Wired, unverified** — an external provider/tool integration exists without a recorded successful live-provider run at this baseline.
- **Proposed** — design, schema, fallback, or type only.

## Community and collaboration

| Capability | Surfaces | Status | Boundary and evidence |
|---|---|---|---|
| Communities, tenancy, invitations, joining | Desktop, mobile, relay | Implemented | Community event kinds, operator join/invite routes, onboarding and invite clients. |
| Identity, keyring, profile, status | Desktop, mobile, CLI | Implemented | Identity/keyring crates and profile/status features. |
| Channels, membership, roles, templates | Desktop, mobile, CLI | Implemented | NIP-29-scoped event and client paths; visibility and writes remain authorization-dependent. |
| Messages, threads, replies, edits, reactions, attachments | Desktop, mobile, CLI | Implemented | Signed collaboration events and feature-specific desktop/mobile tests. |
| Pins, bookmarks, scheduled messages, reminders | Primarily desktop and CLI | Implemented | Product hooks, commands, and reminder views exist; client parity is not claimed. |
| Direct messages | Desktop, mobile, CLI | Implemented | Recipient-gated; agent triggering has stricter owner/sibling checks. |
| Presence, typing, channel canvas | Desktop; selected mobile state | Implemented | Live/ephemeral paths use subscriptions and Redis rather than durable storage alone. |
| Inbox, unread state, search, notifications | Desktop; selected mobile equivalents | Implemented | Search service/configuration can be deployment-dependent. |
| Custom emoji | Desktop | Implemented | Community emoji management and rendering paths exist. |
| Local archives and device pairing | Desktop/mobile/tooling | Implemented | Local archive and pairing flows have focused acceptance coverage. |
| Media viewing and anchored review | Desktop | Implemented | Image/video playback and time-related review surfaces exist. |
| Huddles/audio | Desktop/relay | Optional | Real transport requires audio configuration; mock E2E does not prove a configured call. |
| Forum | Desktop/mobile | Preview/partial | Registered as an upstream desktop preview feature. |
| Pulse/social | Desktop/mobile | Preview/partial | Desktop route is preview-labelled; mobile includes Pulse views. |
| Moderation | Relay, desktop, CLI, admin | Optional | Availability and authority depend on operator policy/configuration. |
| Audit log | Relay/operator | Optional | Hash-chained logging is configurable and not a compliance certification. |

## Agents and automation

| Capability | Status | Boundary and evidence |
|---|---|---|
| Managed agents and configuration | Implemented | Desktop definitions, lifecycle, native management, and E2E/native tests. |
| Personas, teams, templates, catalog/sharing | Implemented | Agent/persona feature modules and signed/private state paths. |
| ACP sessions and compatible runtimes | Implemented | `buzz-acp` manages relay context and sessions; an agent process performs model/tool work. |
| Agent memory/engrams, observer and metrics | Implemented/config-dependent | Access-controlled kinds, CLI and desktop surfaces exist; provider/session state may remain external. |
| Local execution | Implemented/config-dependent | Requires a discovered, configured runtime and its credentials. |
| Remote Kubernetes backend | Optional | Requires provider installation and Kubernetes infrastructure. |
| Relay mesh/shared compute | Optional | Requires mesh/model-serving configuration and its ownership services. |
| Workflows, triggers, runs and approvals | Preview/partial | Definitions and approval paths exist; generic executor code retains placeholder/TODO actions. |

## Projects and repositories

| Capability | Status | Boundary and evidence |
|---|---|---|
| Project/repository association | Preview/partial | Upstream desktop preview feature with signed project/git state. |
| Repository and source browsing | Preview/partial | Desktop project UI and narrower public web browser; deployment/write support varies. |
| Issues, patches, pull requests, inline review | Preview/partial | Relay kinds, CLI, desktop UI, and extensive project E2E coverage. |
| Branches, tags, create/delete/merge operations | Preview/partial | Focused desktop acceptance coverage; repository policy still governs writes. |
| Git smart HTTP | Optional | Relay route requires configured git storage and policy. |

## Clients and operator surfaces

| Surface | Status | Scope |
|---|---|---|
| Desktop | Implemented | Broadest Buzz client and only Preview Studio client. |
| Mobile | Implemented, narrower | Activity, channels, forum, home, invites, pairing, profile, Pulse, search, settings. |
| Public web | Implemented, narrow | Home/invitation and repository/blob routes. |
| Admin web | Optional/private | Configured read-only reporting and feedback/operator routes. |
| CLI | Implemented | JSON-oriented agents, messages, channels, canvas, reactions, emoji, DMs, workflows, social/feed, repos/projects, patches/issues/PRs, media, memory, packs, and moderation. |
| Push notifications | Optional | Requires push gateway/provider configuration. |
| Postgres, Redis, S3/MinIO, search | Implemented/deployment-dependent | Durable events/projections, fan-out/live state, objects, and full-text search. |

## Preview Studio fork addition

| Capability | Status | Boundary and evidence |
|---|---|---|
| Sidebar route and local library | Implemented | Enabled by default; a production library starts empty. |
| Agent message to live website | Implemented | Safe HTTP(S) URL handoff has unit and desktop E2E coverage. |
| Desktop/tablet/mobile live frame | Implemented | Dynamic desktop width, 834 px tablet, 393 px mobile, reload, and external open. |
| Image, video, local PDF import | Implemented | Files up to 2.5 MB persist as data URLs; larger object URLs are session-only. |
| Image/video/PDF viewing | Implemented | Local PDF sources are restricted to PDF data/blob URLs. |
| Local comments and decisions | Implemented/partial | Current UI creates ordinary, time, and slide anchors; other declared anchors/states are not complete workflows. |
| URL revision metadata | Implemented/partial | URL changes create revision records; the bytes behind a URL are not snapshotted. |
| Editable static website engine | Engine demonstrated | Real View/Split/Code and revision code; currently seeded by deterministic E2E fixtures. |
| Reveal-style editable deck engine | Engine demonstrated | Source editing/revision/presentation; no general production ingestion. |
| Image-slide deck/PDF export engine | Engine demonstrated | Separate renderer from the editable Reveal deck; no general production ingestion. |
| Film/cut engine | Engine demonstrated | Fixture media plus edit/composition export; desktop does not rerender an edited film. |
| OpenAI/Gemini image generation | Wired, unverified | UI/provider calls exist; no recorded successful live-provider run at this baseline. |
| Higgsfield video generation | Wired, unverified | Native allowlisted CLI path and fail-closed tests; requires external CLI/account. |
| HyperFrames execution | Proposed/manual | Film export can produce composition HTML; the desktop does not launch a render. |
| React/vanilla web-app registry type | Proposed/fallback | Renderer registry does not make this a production creation flow. |
| Android/iOS live sessions | Proposed | Types/fallbacks are not emulator or simulator integrations. |
| Relay-backed artifacts and collaborative reviews | Proposed | Artifact kinds are not registered in `buzz-core` and no relay/database path exists. |
| Automatic review delivery to an agent | Proposed | Local comments/decisions do not post into Buzz. |

Canonical paths and focused tests are indexed in [Source evidence](../reference/evidence-index.md). Current limitations are consolidated in [Maturity and limitations](maturity-and-limitations.md).
