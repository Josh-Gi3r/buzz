# System architecture

Buzz is Nostr-first. Signed events are its collaboration contract; narrow HTTP surfaces support media, webhooks, git smart HTTP, health, operator/admin routes, and generic event/query/count bridges.

```text
Desktop / Mobile / Web / CLI / ACP harnesses
                    |
         WebSocket + bounded HTTP
                    |
                buzz-relay
       +------------+-------------+
       |            |             |
   Postgres       Redis       S3 / MinIO
 durable events   fan-out     media and git objects
 projections      live state
```

The request host resolves a community tenant. That context must remain attached to database rows, cache/rate-limit keys, search, media, git, workflows, push, and configured audit behavior.

## Event flow

1. A client builds and signs an event.
2. WebSocket or the generic signed HTTP bridge reaches relay admission.
3. The relay verifies signature, shape, community scope, and kind-specific authority.
4. Durable events/projections go to Postgres; presence and typing use live paths; objects use configured media/git storage.
5. Local and Redis fan-out deliver events only after delivery authorization.
6. Clients project authorized state into conversations, agents, projects, workflows, and other views.

`crates/buzz-core/src/kind.rs` is the canonical event-kind registry. Client constants mirror protocol truth; they do not create it. Membership is not the sole ACL: author, recipient, role, result, memory-sharing, agent-owner/allowlist, operator, and other gates apply by kind and route.

## Client boundaries

The Tauri/React desktop app has the broadest feature set and central native command registration. Flutter mobile supports a narrower collaboration set. Public web focuses on invitations and repository browsing. Admin web is a separately configured private surface. The CLI serves people, scripts, and agents with machine-readable operations.

## Optional infrastructure

Postgres is fundamental to the relay's durable deployment. Redis, S3/MinIO, search, media, git, push, audit, huddle audio, remote agent backends, and mesh compute have configuration-specific requirements. Source presence does not prove a deployment enabled them.

## Fork boundary

BUZZ — LIVE PREVIEW STUDIO is desktop-local at product baseline `d36f3933`. It does not change core event kinds, relay behavior, database crates, or migrations. Its only production connection to Buzz conversation state is the agent-message URL handoff; its artifact/review state is separate renderer local storage.

See [Agent architecture](agents.md), [BUZZ — LIVE PREVIEW STUDIO architecture](preview-studio.md), and [Data, security, and trust](data-security-and-trust.md).
