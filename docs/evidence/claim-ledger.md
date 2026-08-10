# Claim ledger

| Claim | Classification | Evidence/boundary |
|---|---|---|
| Buzz lets people and signed agents collaborate in shared conversations | Implemented | Core kinds, relay gates, desktop/mobile/CLI, ACP harness. |
| Projects and workflows ship at this baseline | Preview/partial | Preview flags and broad E2E; workflow executor retains incomplete actions. |
| An agent URL can open in Preview Studio | Implemented | URL bridge, message handoff, store, production-path E2E. |
| Preview widths exercise page media queries | Implemented | Real iframe widths in `LiveUrlStage.tsx`. |
| A live URL is an exact immutable revision | Unsupported | Metadata only; no byte/content snapshot. |
| Showcase proves an agent built the wedding site | Unsupported | Scripted deterministic E2E narrative. |
| Users can generally import/create editable sites, decks, and films | Unsupported | Engines are seeded by E2E demo catalog only. |
| Editable deck also exports PDF | Unsupported as one workflow | Editable Reveal and image/PDF-export deck are separate renderers. |
| Film edits rerender in Buzz | Unsupported | Composition export/manual external rendering only. |
| Image/video generation providers are successfully verified | Unverified | Wiring and fail-closed tests exist; no recorded successful live run. |
| Studio reviews synchronize or reach agents | Proposed | Current state is renderer-local. |
| Artifact event kinds are part of Buzz protocol | Proposed | Not registered in `buzz-core`; no relay/migration path. |
| Channel membership is Buzz's only ACL | Unsupported | Multiple kind/route-specific gates exist. |
| Every deployment audit-logs every event | Unsupported | Audit is configurable/optional. |
| Buzz is SOX/eDiscovery certified | Unsupported | No certification evidence. |
| `cargo audit` runs in current CI | Unsupported | No verified workflow step at audit baseline. |
| Every crate denies all unsafe Rust | Unsupported | Platform-specific unsafe allowances exist. |
| The fork automatically installs upstream desktop releases | Unsupported | Branch automation detects stable release tags and prepares a reviewed PR; it never auto-merges. |
| Upstream release detection is currently live | Unverified | Workflow/support files are unmerged branch changes and need an enabled successful default-branch run. |
| The detector protects against moved release tags | Implemented in branch contract | Baseline stores tag+SHA and the workflow fails if the recorded tag resolves to another SHA. |
