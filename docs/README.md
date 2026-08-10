# Buzz documentation

This documentation describes the product at fork commit
`d36f39336b05036f90ba20e273746374c25aaf3e`. That build inherits Buzz Desktop
`0.5.8` and adds Preview Studio. It does not describe newer, unreleased upstream
`main` behavior.

Buzz is a collaborative workspace where people and AI agents communicate through
the same signed-event system. The desktop app brings together chat, managed
agents, projects, workflows and other collaboration tools. This fork adds a
device-local workspace for opening, reviewing and revising the things agents
build.

## Start here

- [Getting started](user/getting-started.md) — run Buzz and find the main product surfaces.
- [Working with agents](user/working-with-agents.md) — create, direct and review agent work.
- [Product capabilities](product/capabilities.md) — what is implemented, experimental or proposed.
- [Product system](architecture/product-system.md) — relay, clients, agents, storage and Preview Studio.
- [Evidence index](reference/evidence-index.md) — the source and tests behind important claims.

Existing specialist references remain useful:

- [Preview Studio specifications](spec/) define the local artifact model and proposed relay protocol.
- [Design documents](design/) explain the longer-term product direction.
- [Testing](../TESTING.md) covers repository test environments.
- [Contributing](../CONTRIBUTING.md) covers development conventions.
- [Fork patch ledger](../FORK_PATCHES.md) records every integration seam against upstream Buzz.

## Reading status labels

Documentation uses three labels deliberately:

- **Implemented** — present in source with focused test or integration evidence.
- **Experimental** — usable, but feature-flagged, deployment-dependent or known to have incomplete paths.
- **Proposed** — specification or roadmap only; do not present it as working product behavior.

Preview Studio artifacts, reviews and decisions are currently stored on one
device. Proposed relay event kinds under `docs/spec/` are not registered in the
Buzz protocol and do not provide collaboration or cross-device sync today.
