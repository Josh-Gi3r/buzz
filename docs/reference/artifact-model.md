# Artifact model

The implemented BUZZ — LIVE PREVIEW STUDIO model is local TypeScript state, not a relay protocol.

- An artifact is a logical library item.
- A revision stores source/rendition metadata and links feedback to a version record.
- A live URL revision does not snapshot the content served at that URL.
- Reviews currently use ordinary, slide, or time anchors through shipped UI paths.
- Decisions are local pending/approve/request-changes state.
- The store key is `buzz.previewStudio.library.v1`.

Runtime fields in `lib/types.ts` and `lib/store.ts` are authoritative for the local implementation. `docs/spec/artifact-manifest-v1.md`, `artifact-review-v1.md`, and `artifact-kinds-v0.md` are forward-looking proposals and differ from runtime in places. They must not be treated as accepted relay contracts until kinds, admission, storage, delivery, client migration, and conformance tests ship together.
