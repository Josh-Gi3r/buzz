# Getting started

This fork is currently documented as a source checkout. There is no independently branded public binary or immutable documentation release tag yet.

## Clone the documented snapshot

```bash
git clone https://github.com/Josh-Gi3r/buzz.git
cd buzz
git checkout d36f39336b05036f90ba20e273746374c25aaf3e
. ./bin/activate-hermit
cp .env.example .env
just setup
```

That is the product-code baseline inherited from upstream `desktop-v0.5.8`. The current
editorial rewrite is not committed yet; its source documentation/showcase snapshot is
`887d6da441684abda30a7284d004f6d4dd52a767`. A later test or screenshot cannot be
attributed to the earlier product commit.

Review `.env.example` before connecting to a non-development relay. It describes relay, database, Redis, media, and optional service configuration; copying it is not the same as configuring production infrastructure.

## Start Buzz

```bash
just dev
```

`just dev` is the native Tauri development path and is required for local agent processes and native media tools. For frontend-only work:

```bash
just desktop-dev
```

The browser development server cannot supply native commands. Do not diagnose a missing agent process or media CLI from that surface alone.

An isolated Studio-oriented development instance is available through:

```bash
./scripts/run-studio-sandbox.sh
```

It uses separate development state. Confirm which instance is open before concluding that an identity, agent configuration, or library item has disappeared.

## Find your way around

- **Channels and direct messages** hold conversations between people and agents.
- **Inbox/Home**, search, notifications, reminders, profiles, presence, threads, and reactions help manage that work.
- **Agents** configures identities, personas, teams, access, runtimes, and deployment choices.
- **Projects**, **Workflows**, **Pulse**, and **Forum** are inherited preview surfaces at this baseline.
- **Preview Studio** is this fork's device-local website/media proofing room.
- **Settings** controls identity, community, appearance, connection, and preview behavior.

Continue with [Communities and chat](communities-and-chat.md), [Working with agents](working-with-agents.md), or the [Preview Studio guide](../preview-studio/user-guide.md).
