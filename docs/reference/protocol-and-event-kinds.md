# Protocol and event kinds

Buzz uses signed Nostr events, with NIP-29 community/channel scoping and kind-specific authorization. `crates/buzz-core/src/kind.rs` is the canonical registry.

The registry includes families for identity/social state, communities and moderation, messaging/presence/canvas/DMs, agents/personas/teams/memory, jobs, forums, workflows/approvals, huddles/media/audit, and git/projects. Event classification controls persistence, replacement, scoping, and delivery; a number alone is not a shipped product workflow.

Relay WebSocket handling and generic signed HTTP event/query/count bridges converge on the relay's validation and authorization logic. Transport-specific HTTP remains for media, hooks, git, health, metadata, operator, and admin paths.

The artifact numbers proposed under `docs/spec/` are not present in the production registry at the pinned baseline and must not be emitted as supported Buzz protocol behavior.
