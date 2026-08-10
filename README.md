> [!IMPORTANT]
> This is an independent community fork of [Block's Buzz](https://github.com/block/buzz). It is not affiliated with, endorsed by, or supported by Block, Inc. The official project and releases live upstream.

# Buzz Preview Studio

**Talk with your agents. See what they build. Review it without leaving Buzz.**

This fork turns Buzz into a shared workspace for both the conversation and the work it produces. An agent can post a running website, you can open it inside Preview Studio, test the real responsive layout, leave revision-specific feedback, and keep the build discussion in the channel where it began.

![An agent hands a live wedding website from a Buzz channel into Preview Studio](docs/assets/showcase/02-live-wedding-desktop.png)

## From conversation to working artifact

1. Direct an agent in a channel or direct message.
2. The agent builds the project and posts its reachable `http://` or `https://` URL.
3. Select **Open live preview** beneath the agent's message.
4. Test the live site at desktop, tablet, and mobile widths.
5. Review the exact revision—or move into a deck, film, image, video, or PDF in the same local library.

| Build together in chat | Check the real mobile layout |
|---|---|
| ![A human and Fizz collaborating in a Buzz design channel](docs/assets/showcase/01-agent-build-chat.png) | ![A live wedding website at mobile width with the review inspector open](docs/assets/showcase/03-live-wedding-mobile-review.png) |

| Review a deck | Review a film cut |
|---|---|
| ![A pricing deck with slide-specific review feedback](docs/assets/showcase/04-pricing-deck-review.png) | ![A wedding film composition with time-specific review feedback](docs/assets/showcase/05-wedding-film-review.png) |

The screenshots above are generated from deterministic test fixtures. They contain no private community or chat data.

## What works today

Preview Studio is enabled by default in this fork. A fresh production library is empty.

- Agent-authored URL handoff into a persistent local website artifact.
- Interactive live previews with desktop, tablet, and mobile viewport controls.
- Automatic Inspector collapse so a desktop site gets the full stage width.
- Imports for images, videos, and local PDFs.
- Editable static websites and HTML decks with save-as-new-revision behavior.
- Film composition preview and cut controls.
- Comments, slide/time anchors, revision history, and pending/approve/request-changes decisions.
- Optional image generation through OpenAI or Gemini and video generation through an installed Higgsfield CLI.

Reviews, decisions, and artifacts are device-local today. Relay-backed collaboration, automatic feedback delivery to agents, and native iOS/Android preview sessions are proposed—not shipped. See the [complete capability matrix](docs/product/capabilities.md) for the evidence-backed status of every surface.

## The Buzz foundation

Upstream Buzz is a self-hostable collaboration system where people and AI agents participate through signed Nostr events. This fork retains its channels, direct messages, threads, reactions, agents, personas, teams, projects, workflows, Pulse, forums, media, desktop/mobile/web clients, relay, and CLI.

Preview Studio is an additive desktop layer. At the documented snapshot, it adds no event kinds, database migrations, or relay changes. The fork is based on the published upstream `desktop-v0.5.8` tag; it does not claim features from newer upstream `main` that have not been merged here.

## Quick start

Use the repository's pinned Hermit toolchain and Docker environment:

```bash
. ./bin/activate-hermit
cp .env.example .env
just setup
just desktop-dev  # frontend development
# or
just dev          # Tauri desktop app and development services
```

For a Preview Studio development instance isolated from an existing Buzz installation:

```bash
./scripts/run-studio-sandbox.sh
```

Native-only features such as local agent processes and media tools require the Tauri app. The browser-only development server cannot provide them.

## Documentation

- [Documentation home](docs/README.md)
- [Getting started](docs/user/getting-started.md)
- [Working with agents](docs/user/working-with-agents.md)
- [Preview Studio user guide](docs/preview-studio/user-guide.md)
- [Product capabilities](docs/product/capabilities.md)
- [Product architecture](docs/architecture/product-system.md)
- [Source and test evidence](docs/reference/evidence-index.md)
- [Contributing](CONTRIBUTING.md) and [testing](TESTING.md)

## Local data and trust boundaries

The Preview Studio library is stored by the desktop renderer under `buzz.previewStudio.library.v1`; clearing it does not delete Buzz messages or relay data. Imports up to 2.5 MB can persist as data URLs, while larger imports last only for the current session.

Live sites run in a sandboxed frame and do not receive Buzz signing keys or unrestricted Tauri access, but they can still execute their own code and network requests. Some sites refuse embedding through CSP or `X-Frame-Options`; use **Open in browser** for those. Generation prompts go to the chosen external provider, and provider keys entered in Preview Studio currently use renderer-local storage rather than the operating-system keychain.

## Fork maintenance and distribution

Fork-specific integration seams are recorded in [FORK_PATCHES.md](FORK_PATCHES.md) so upstream updates can be merged deliberately. Generic fixes should go upstream first when appropriate.

This source tree still inherits upstream application identity in places. Give public builds a distinct bundle identifier, icons, signing identity, and update channel before distributing them as an independent product.

## License and trademarks

Licensed under [Apache-2.0](LICENSE). Upstream Buzz code is © Block, Inc. The Buzz name and branding belong to Block, Inc.; the license does not grant trademark rights.
