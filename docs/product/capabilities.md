# Product capabilities

This matrix describes fork commit `d36f3933`, based on Buzz Desktop `0.5.8`.
It separates inherited Buzz behavior from fork additions and does not treat a
kind constant, UI placeholder or design document as proof of a shipped feature.

## Collaboration workspace

| Capability | Surface | Status | Notes |
|---|---|---|---|
| Channels, threads, reactions, edits and attachments | Desktop, mobile, CLI | Implemented | Signed Nostr events with community-scoped relay admission and delivery. |
| Direct messages | Desktop, mobile, CLI | Implemented | Recipient-gated; agent prompting in DMs uses stricter ownership checks. |
| Presence, typing and agent activity | Desktop and portions of mobile | Implemented | Ephemeral/live traffic uses Redis and subscriptions rather than durable event storage alone. |
| Inbox, reminders, search and notifications | Desktop; selected mobile equivalents | Implemented | Platform breadth differs; parity is not assumed. |
| Forums | Desktop and mobile | Experimental | Registered as an upstream desktop preview feature. |
| Pulse/social | Desktop and mobile | Experimental | Desktop route is preview-labelled; mobile has Pulse views. |
| Huddles and voice | Desktop/relay | Optional | Requires audio configuration; not a general mobile capability claim. |
| Moderation and audit | Relay, desktop, CLI, admin | Optional | Availability depends on relay configuration and operator policy. |

## Agents and automation

| Capability | Status | Notes |
|---|---|---|
| Managed agents, personas and teams | Implemented | Desktop manages local definitions, private aggregates, sharing and lifecycle. |
| ACP agent sessions and tools | Implemented | `buzz-acp` gates turns and manages sessions; bundled `buzz-agent` or compatible external runtimes do model work. |
| Agent memory/engrams | Implemented | Access-controlled event and CLI paths exist; provider/session state remains external where applicable. |
| Local agent execution | Implemented | Requires a discovered and configured runtime. |
| Remote Kubernetes backend | Optional | Requires an installed provider and Kubernetes environment. Relay-mesh agents are intentionally excluded from this backend. |
| Relay mesh/shared compute | Optional | Requires mesh and model-serving configuration; fenced Redis ownership remains authoritative. |
| Workflows, triggers and approvals | Experimental | Definitions, relay commands, persistence and approval paths exist; the generic workflow executor retains placeholder actions. |

## Projects and repository collaboration

| Capability | Status | Notes |
|---|---|---|
| Projects and repository association | Experimental | Desktop preview feature with signed project/git state. |
| Repository browsing | Implemented/experimental | Desktop project UI and public web repository browser exist; deployment and write support vary. |
| Issues, patches and pull requests | Experimental | Relay kinds, CLI and desktop review surfaces exist. |
| Git smart HTTP | Optional | Served by the relay when git storage and policy are configured. |

## Preview Studio fork additions

| Capability | Status | Notes |
|---|---|---|
| Sidebar route and local library | Implemented | Enabled by default in this fork; production starts empty. |
| Agent message → live website preview | Implemented | Agent-authored HTTP(S) URL creates a persistent local artifact and opens the Studio. |
| Responsive live URL frame | Implemented | Desktop, 834 px tablet and 393 px mobile widths; manual reload and external open. |
| Image, video and PDF import | Implemented | Files at or below 2.5 MB persist as data URLs; larger files are session-only. |
| Image and video viewing | Implemented | Image lightbox and Buzz `VideoPlayer`. |
| Local PDF frame | Implemented | Only local `data:application/pdf` and `blob:` sources are accepted. |
| Editable static website source | Implemented | View/Split/Code modes, responsive widths and save-as-new-revision behavior. |
| Editable HTML decks | Implemented | Slide navigation, selectable text, Reveal presentation and revision saving. |
| Film composition review/editing | Experimental | Composition preview and cut changes exist; edits can make a previous render stale. |
| Local reviews, anchors and decisions | Implemented | Time and slide anchors are used; comments and decisions do not sync. |
| Revision history | Implemented | Source edits create new immutable local revisions and preserve old feedback. |
| Image generation | Experimental | OpenAI and Gemini are wired; external keys, account access and paid API availability are required. |
| Video generation | Experimental/optional | Requires the native desktop bridge and installed Higgsfield CLI; same-pass audio is enforced. |
| React/vanilla website source modes | Partial | Sandpack support exists inside the website renderer, but focused acceptance evidence covers the static-source path; the separate `web_app` registry type remains a fallback. |
| Android/iOS live sessions | Proposed | Types and design exist; renderers are explicitly unimplemented. |
| Relay-backed artifacts and collaborative review | Proposed | Draft specifications exist, but no artifact kinds are registered in `buzz-core`. |

## Client coverage

- **Desktop:** broadest product surface and the only Preview Studio client.
- **Mobile:** activity, channels, forum, home, invites, pairing, profile, Pulse, search and settings; not desktop feature parity.
- **Public web:** invitation flows and repository browsing.
- **Admin web:** private, read-only operational views backed by `/api/admin/v1` when configured.
- **CLI:** stable JSON-oriented collaboration, git, workflow, moderation, agent and memory operations.

For implementation evidence, see the [evidence index](../reference/evidence-index.md).
