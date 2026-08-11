# BUZZ — LIVE PREVIEW STUDIO architecture

BUZZ — LIVE PREVIEW STUDIO has a production ingress layer, local state, and several renderer engines. These layers have different maturity.

```text
agent message URL --------+
image/video/PDF import ---+--> local artifact store --> selected renderer
provider/tool output -----+           |
                                      +--> local revision metadata
                                      +--> local reviews and decisions

E2E demo catalog -----------------> static-site / deck / film engines
```

## Production ingress

`agentPreviewBridge.ts` extracts a safe credential-free HTTP(S) URL from a recognized agent message. `AgentPreviewHandoff.tsx` and `MessageRow.tsx` open the route. `store.ts` creates or updates the local artifact.

Outside E2E mode, `loadLibrary()` begins with `emptySnapshot()`. File import accepts image, video, and PDF. Generated image/video output can enter after an external provider/tool succeeds.

## Fixture ingress

`demoCatalog.ts` seeds embedded static-site, deck, and film documents in E2E mode. The associated source parsers and stages are real and tested, but there is no general production create/import path for those documents. Renderer implementation status must not be used as a substitute for ingress status.

## State model

The artifact is the logical library item. Revisions carry source metadata; reviews and decisions point to a revision. URL revision records do not preserve the bytes served by that URL. The current UI produces ordinary, slide, and time anchors, not every anchor declared in draft types.

State is stored under `buzz.previewStudio.library.v1` in renderer local storage. Small imports can be data URLs; larger object URLs are session-only. None of this state is relay-authoritative or multi-user.

## Renderer boundaries

- Images and videos use media components.
- PDFs accept local PDF data/blob sources and use a restrictive frame.
- Static-site fixture source is assembled locally and framed.
- Live URLs use scripts/forms/modals/same-origin sandbox capabilities needed by ordinary sites.
- Editable Reveal decks and image/PDF-export decks are separate engines.
- Film edits export composition source; Buzz does not launch a new render.
- Registry fallback types are not implemented native app sessions.

`PreviewStage.tsx` also dispatches embedded document types before registry fallback, so `registry.ts` is not a universal runtime capability-enforcement boundary.

## Security and external tools

The iframe does not receive a Buzz signing key or general relay token. It can execute its own networked application code. The manifest origin policy is descriptive and is not an independent request allowlist.

Image providers and the Higgsfield CLI are external trust/cost boundaries. Provider keys currently use renderer-local storage. `media_tools.rs` has an executable allowlist; the frontend invokes Higgsfield, while HyperFrames rendering remains a manual external step.

Proposed relay event kinds and shared review behavior are documented separately under `docs/spec/`; they are not production architecture.
