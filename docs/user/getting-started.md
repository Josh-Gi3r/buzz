# Getting started

This guide covers the desktop app in this fork. It assumes a source checkout and
does not replace platform signing or release-distribution instructions.

## Requirements

The repository's supported development path uses Docker and the pinned Hermit
toolchain. From the repository root:

```bash
. ./bin/activate-hermit
cp .env.example .env
just setup
```

Review `.env.example` before connecting to a non-development relay. It contains
the available relay, database, Redis, media and optional service settings.

Start the desktop experience with one of the repository tasks:

```bash
just desktop-dev  # frontend development server
just dev          # Tauri desktop app and development services
```

`just desktop-dev` is useful for ordinary interface work, but native-only
features require the Tauri app. Do not assume a browser-only run can launch
local agent or media-tool processes.

For an isolated Preview Studio development instance, use:

```bash
./scripts/run-studio-sandbox.sh
```

The sandbox has separate development state. Confirm which instance is open
before judging whether a library item, identity or agent configuration is
missing.

## The main workspace

The desktop sidebar provides the broadest Buzz product surface:

- **Inbox/Home** collects activity and context requiring attention.
- **Channels and direct messages** are where people and agents work together.
- **Pulse** provides social and activity views. It is an upstream preview feature.
- **Projects** connects repositories, issues and pull-request work. It is an upstream preview feature.
- **Agents** manages agent identities, personas, teams, runtimes and access policy.
- **Workflows** manages definitions, triggers, runs and approvals. It is experimental; some generic workflow actions remain incomplete.
- **Preview Studio** opens websites, media and documents for local review in this fork.
- **Settings** controls identity, community, appearance, connection and experimental behavior.

Search, threads, reminders, profiles, reactions, file attachments, presence and
huddles appear within those larger workflows rather than as independent top-level
routes.

## Preview Studio's local library

Preview Studio is enabled by default in this fork, although it remains
experimental and can be controlled through the feature system. A fresh
production library is empty.

You can populate it by:

1. Opening a live URL from an agent-authored message.
2. Importing an image, video or PDF.
3. Generating supported media after configuring its provider or local tool.

The library, revisions, comments and decisions use the device's browser storage
under `buzz.previewStudio.library.v1`. They are not published to the relay.
Imports at or below 2.5 MB can persist as data URLs. Larger imports use
session-scoped object URLs and must be imported again after the app restarts.

Use **Clear library** carefully: it removes imported, generated and agent-preview
items from this device store. It does not delete chat messages or relay data.

## Before using real accounts or paid generation

- Provider generation can spend money and sends the prompt to the selected external provider.
- Preview Studio provider keys are stored locally by the renderer, not in the operating-system keychain.
- A live preview is an embedded external page. It receives no Buzz signing key or general relay token, but the remote page still runs its own code and network requests inside the frame's sandbox.
- Some sites refuse embedding through their own browser security headers. Use **Open in browser** when that happens.

Next: [Working with agents](working-with-agents.md) or review the complete
[capability matrix](../product/capabilities.md).
