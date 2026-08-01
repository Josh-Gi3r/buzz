# Preview Studio v0 — Scope

## Product thesis

Deliver a usable artifact workspace inside stock Buzz (feature-flagged, default off) where
you can:

1. Browse a library of artifacts.
2. Import local images and videos.
3. Preview them for real (not placeholders).
4. Leave reviews and approve / request changes on a revision.
5. Keep the stock Buzz experience untouched when the flag is off.

## Explicitly out of scope in v0

- Relay kind registration / multi-user sync.
- iOS/Android emulator sessions.
- Sandboxed static-web / website previews.
- Infinite canvas board.
- Full creative editing tools.
- A global Studio app-shell restyle (Studio is Studio-scoped).
- A separate distribution identity / dual-install packaging.

These are roadmap items, not silent gaps; see the README roadmap and
[../design/architecture.md](../design/architecture.md) for the designs behind them.

## Architecture

```text
localStorage  →  ArtifactLibrary store
       ↓
PreviewStudioScreen
  ├─ Library rail (list + import + delete)
  ├─ PreviewStage (image / video / PDF / fallback)
  ├─ Review panel (comments)
  └─ Decision strip
```

No new relay kinds are registered. The specs in [../spec/](../spec/) stay ready for a future
relay integration.
