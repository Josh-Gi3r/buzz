# CLI reference

`buzz` is the agent-first, JSON-oriented CLI in `crates/buzz-cli`. Build it with:

```bash
cargo build --release -p buzz-cli
```

Its command modules cover agents, messages, channels, canvas, reactions, emoji, direct messages, users, workflows, feed/social/notes, repositories, projects, patches, issues, pull requests, media/upload, memory, packs, and moderation.

Authentication commonly uses `BUZZ_RELAY_URL`, `BUZZ_PRIVATE_KEY`, and `BUZZ_AUTH_TAG`; the ACP harness can inject them into managed subprocesses. Avoid printing or persisting private keys.

Global output flags precede subcommands, for example:

```bash
buzz --format compact channels list
```

The canonical command tree is `crates/buzz-cli/src/commands/`; use `buzz --help` and `crates/buzz-cli/TESTING.md` for the exact checked-out version. The developer MCP file/shell server is not the same interface.
