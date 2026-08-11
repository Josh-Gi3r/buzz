# Decision record: Stage image and video rendering

**Scope:** the BUZZ — LIVE PREVIEW STUDIO Stage only — no new relay kinds, no Tauri capability changes.
**Principle:** compose Buzz's existing players; do not fork or replace them.

## Existing building blocks

| Piece | Path | Role for Stage |
|-------|------|----------------|
| `SimpleImageLightbox` | `desktop/src/shared/ui/SimpleImageLightbox.tsx` | Fullscreen dialog overlay (Radix). Used for the Stage's click-to-expand image view; **not** the Stage surface itself. |
| Image lightbox (full) | `desktop/src/shared/ui/markdown.tsx` + `markdown/imageLightbox.ts` | Gallery zoom/pan lightbox embedded in Markdown. Heavy, message-scoped. A candidate for multi-image revisions — not the Stage. |
| `ProgressiveImage` | `desktop/src/shared/ui/markdown/ProgressiveImage.tsx` | Thumb-to-full fade with fixed width/height + refs. **Markdown-pipeline coupled.** Not a drop-in Stage viewer without a thinner public API. |
| `VideoPlayer` | `desktop/src/shared/ui/VideoPlayer.tsx` | Full player + review chrome (timecoded comments, reactions, download). Accepts `src`, optional `poster`, `reviewContext`, etc. |
| `MarkdownVideoPlayer` | `desktop/src/shared/ui/markdown/MarkdownVideoPlayer.tsx` | Thin adapter: `rewriteRelayUrl`, poster from imeta, download eligibility. The adapter pattern the Stage follows. |
| Media proxy | `desktop/src/shared/lib/mediaUrl.ts` (`rewriteRelayUrl`, `useMediaProxyPort`) | Required for relay `/media/` URLs in Tauri/WKWebView. |
| Media classify | `desktop/src/shared/ui/markdown/mediaEntry.ts` | `isVideoMedia` / `isRelayDownloadable` — pure helpers if the Stage ever loads mixed blobs. |
| Renderer registry | `desktop/src/features/preview-studio/lib/registry.ts` | Type → capabilities + fallback card metadata. The Stage reads the type from the manifest, not the registry, for its display branch. |

## Architecture

```text
PreviewStudioScreen
  └─ PreviewStage({ manifest, fallback, rendererLabel })
       ├─ image  → resolveDisplayUri → <img>, click → SimpleImageLightbox
       ├─ video  → resolveDisplayUri → <VideoPlayer>
       ├─ pdf    → resolveDisplayUri → embedded frame
       └─ *      → fallback card (title / subtitle / renderer)
```

### Resolve display URI (client-only)

Resolution order:

1. `manifest.renditions` — prefer roles `stream` | `interactive` | `poster` | `thumbnail`
   with a `uri`.
2. `source.kind === "local"` → `source.uri` (if non-empty).
3. `source.kind === "url"` → `source.url`.
4. Otherwise → no media; show the fallback / empty state.

Blob sources (`source.kind === "blob"`, resolved through the media proxy) are out of scope
for the Stage; they belong to the upload/media APIs.

### Image path

A plain `<img>` with `object-contain` inside the Stage lens, with click-to-expand via
`SimpleImageLightbox`. `ProgressiveImage` is not imported until width/height/thumbnail data
is available on the manifest or rendition.

### Video path

The Stage mounts the shared `VideoPlayer` when the artifact type is `video` and a display
URI resolves, passing `src`, optional `poster`, `filename`, and the revision ID as the
review key. `reviewContext` stays unset: the player's channel-scoped review chrome is only
wired when the Stage gains channel/thread context and review publishing is designed (see
[../spec/artifact-review-v1.md](../spec/artifact-review-v1.md)). Relay-hosted media would go
through `rewriteRelayUrl`, mirroring `MarkdownVideoPlayer`; local imports and demo URLs are
used as-is.

## Security

- Untrusted web-app/website content still never executes in the main webview (unchanged).
- The image/video Stage only loads URIs already present on the manifest (local imports, demo
  URLs, or a future allowlisted proxy).
- Signing keys, general relay tokens, and raw Tauri invoke handles are never passed into the
  Stage.
- Downloads for relay media stay on the existing SSRF-gated `download_file` path when/if
  offered.

## Decision summary

| Decision | Choice | Why |
|----------|--------|-----|
| Image renderer | `<img>` | ProgressiveImage needs dimensions/thumbnails not yet on the manifest |
| Lightbox | `SimpleImageLightbox` on click | Inline Stage preview stays primary; the overlay is a single state toggle |
| Video renderer | shared `VideoPlayer` | Compose the existing player; adapter pattern already proven in `MarkdownVideoPlayer` |
| Review chrome on video | deferred | `reviewContext` requires channel/thread context the local Stage does not have |
| Fork players? | **No** | Compose via thin adapters only |
