# Preview Studio — User Guide

Preview Studio is a feature-flagged, local-only artifact preview and review workspace inside
the desktop app. With the flag off, the app behaves exactly like upstream Buzz.

## Run it

From the repository root:

```bash
. ./bin/activate-hermit   # pinned toolchain
cp .env.example .env
just setup                # once
just desktop-dev          # web-only dev server
# or
just dev                  # full Tauri app + relay
```

To run an isolated sandbox instance that never shares state with a production Buzz install
(separate bundle ID, app-data directory, keyring, and `~/.buzz-dev` nest):

```bash
./scripts/run-studio-sandbox.sh            # throwaway mock identity (default)
./scripts/run-studio-sandbox.sh --fresh    # wipe sandbox app data first
```

## Enable Preview Studio

1. Open **Settings**.
2. Find the **Experiments** card.
3. Enable **Preview Studio**.
4. A **Preview Studio** entry (sparkles icon) appears in the sidebar.

The flag is off by default.

## What you can do

| Action | How |
|--------|-----|
| Browse library | Open Preview Studio → left rail |
| Preview image | Select an image artifact · click the image to open the lightbox |
| Preview video | Select a video artifact · plays in the shared video player |
| Preview PDF | Select a PDF artifact · renders inline in a sandboxed frame |
| Import media | **Import** button · image, video, and PDF files |
| Review | Inspector → write a comment → **Add review** |
| Decide | Bottom strip: pending / approved / changes requested |
| Delete | Hover an artifact in the rail → trash |
| Reset demos | **Reset demos** (wipes the local library store) |

## Persistence

- The library is stored in the browser `localStorage` key `buzz.previewStudio.library.v1`.
  Nothing is sent to the relay.
- Imported files under ~2.5 MB are saved as data URLs and survive reload.
- Larger files use session object URLs, which are lost on reload — re-import them.

## Not yet implemented

- Syncing artifacts to the relay or other devices (the event kinds are proposed in
  [../spec/artifact-kinds-v0.md](../spec/artifact-kinds-v0.md) but not registered).
- Multi-user review.
- Sandboxed website / web-app previews.
- Native app (iOS / Android) session previews.
- Deck/PPTX conversion and authoring.
- Studio as a global shell (Studio styling is scoped to the Studio screen).

## Specs

- [../spec/artifact-manifest-v1.md](../spec/artifact-manifest-v1.md)
- [../spec/artifact-review-v1.md](../spec/artifact-review-v1.md)
- [../spec/artifact-kinds-v0.md](../spec/artifact-kinds-v0.md)
