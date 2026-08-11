# Fork patch ledger

This ledger records the BUZZ — LIVE PREVIEW STUDIO boundary on top of Block Buzz Desktop `v0.5.9` at `ee33722615ca1e7b8efb03e2ed641d99448c8899`. The feature was originally developed against `v0.5.8`; the source delta from `v0.5.8` to `v0.5.9` has since been applied locally without importing upstream GitHub Actions workflows.

The aim is a narrow integration boundary: BUZZ — LIVE PREVIEW STUDIO owns its feature directory and assets; inherited files carry only routing, navigation, native-command, CSP, test, package, or distribution seams.

## Modified upstream paths

| Path | Fork change |
|---|---|
| `.github/CODEOWNERS` | Fork maintainer ownership. |
| `.github/ISSUE_TEMPLATE/config.yml` | Distinguish fork support from upstream support. |
| `README.md` | Explain Buzz, fork status, BUZZ — LIVE PREVIEW STUDIO, and evidence. |
| `SECURITY.md` | Route fork reports and document fork trust boundaries. |
| `Cargo.lock` | Lockfile changes resulting from the fork checkout/tooling. |
| `deny.toml` | Carry official upstream's narrow `RUSTSEC-2026-0243` exception until Mesh-LLM migrates to `nostr-sdk` 0.45 or newer. |
| `pnpm-lock.yaml` | JavaScript dependency lockfile changes. |
| `pnpm-workspace.yaml` | Optional-script and Node type resolution policy. |
| `preview-features.json` | Register `preview-studio`, enabled by default in this fork. |
| `desktop/package.json` | BUZZ — LIVE PREVIEW STUDIO test/development commands and dependencies. |
| `desktop/playwright.config.ts` | Configurable E2E port and BUZZ — LIVE PREVIEW STUDIO projects. |
| `desktop/scripts/check-px-text.mjs` | Allow fixed-canvas guest/demo styles, not application UI text. |
| `desktop/src-tauri/src/commands/mod.rs` | Register the media-tools command module. |
| `desktop/src-tauri/src/lib.rs` | Register the media-tool availability/execution commands. |
| `desktop/src-tauri/tauri.conf.json` | Permit explicit HTTP(S) frames for packaged previews. |
| `desktop/src-tauri/tests/csp.rs` | Assert the packaged frame policy. |
| `desktop/src/app/AppShell.helpers.ts` | Add the BUZZ — LIVE PREVIEW STUDIO shell view. |
| `desktop/src/app/AppShell.tsx` | Connect BUZZ — LIVE PREVIEW STUDIO navigation to the sidebar. |
| `desktop/src/app/navigation/useAppNavigation.ts` | Add the BUZZ — LIVE PREVIEW STUDIO navigation helper. |
| `desktop/src/app/routeTree.gen.ts` | Generated BUZZ — LIVE PREVIEW STUDIO route entry. |
| `desktop/src/app/routes.ts` | Register the BUZZ — LIVE PREVIEW STUDIO route. |
| `desktop/src/features/messages/ui/MessageRow.tsx` | Show the safe agent-URL handoff. |
| `desktop/src/features/sidebar/ui/AppSidebar.tsx` | Pass the BUZZ — LIVE PREVIEW STUDIO selection handler. |
| `desktop/src/features/sidebar/ui/AppSidebarPinnedHeader.tsx` | Show the flag-gated sidebar entry. |
| `desktop/src/main.tsx` | Support the standalone Studio entry used by development/showcase tooling. |
| `desktop/src/shared/styles/globals.css` | Import Studio theme tokens. |
| `desktop/src/shared/ui/ViewLoadingFallback.tsx` | Add the Studio loading-view kind. |
| `desktop/src/features/agents/lib/personaCatalogRelay.test.mjs` | Template-literal lint correction; upstream candidate. |
| `desktop/src/features/onboarding/communityOnboarding.tsx` | Explicit browser timer typing; upstream candidate. |
| `docs/nips/NIP-{AE,AM,AP,ER,RS}.md` | Replace repository-relative references to external Nostr NIPs with canonical upstream URLs so the inherited drafts render correctly in this standalone fork. |

## Added fork-owned paths

These glob groups cover every file added at the product baseline:

| Added area | Purpose |
|---|---|
| `FORK_PATCHES.md` | This boundary ledger. |
| `desktop/src/features/preview-studio/**` | Artifact store, URL bridge, renderer engines, local reviews, generation wiring, UI, and focused unit tests. |
| `desktop/src/app/StandaloneStudio.tsx` | Isolated development/showcase shell. |
| `desktop/src/app/routes/preview-studio.tsx` | Route component. |
| `desktop/src/shared/theme/studio/**` | Studio-specific tokens and styling. |
| `desktop/src-tauri/src/commands/media_tools.rs` | Allowlisted native media-tool bridge. |
| `desktop/tests/e2e/agent-preview-handoff.spec.ts` | Production URL-handoff acceptance path. |
| `desktop/tests/e2e/deck-*.spec.ts` | Fixture-backed deck engine acceptance. |
| `desktop/tests/e2e/film-verify.spec.ts` | Fixture-backed film engine acceptance. |
| `desktop/tests/e2e/generate-verify.spec.ts` | Generation UI/configuration acceptance, not live-provider success. |
| `desktop/tests/e2e/preview-studio-showcase.spec.ts` | Deterministic documentation narrative. |
| `desktop/tests/e2e/revision-rail.spec.ts` | Local revision UI acceptance. |
| `desktop/tests/e2e/studio-playground.spec.ts` | Studio development surface. |
| `desktop/tests/e2e/video-panel-verify.spec.ts` | Video generation panel/fail-closed behavior. |
| `desktop/tests/e2e/web-verify.spec.ts` | Fixture-backed static web engine acceptance. |
| `desktop/tests/e2e/what-renders.spec.ts` | Renderer dispatch/fallback acceptance. |
| `desktop/public/demo/**` | Deterministic film media used by E2E fixtures. |
| `demo-assets/**` | Deterministic site, deck, photography, and film source assets. |
| `docs/assets/preview-studio-demo.gif` | Earlier BUZZ — LIVE PREVIEW STUDIO demonstration asset. |
| `docs/assets/preview-studio-hero.png` | Earlier BUZZ — LIVE PREVIEW STUDIO hero asset. |
| `docs/design/**` | Target-design documents; proposed behavior must remain labelled. |
| `docs/preview-studio/**` | BUZZ — LIVE PREVIEW STUDIO user and scope documentation. |
| `docs/spec/artifact-*.md` | Proposed artifact protocol specifications, not registered relay kinds. |
| `examples/studio-demo/**` | Standalone demonstration source. |
| `scripts/run-studio-sandbox.sh` | Isolated local Studio development launcher. |
| `scripts/studio` | Studio development helper. |
| `scripts/studio-images` | Studio image helper. |

The broader open-source documentation tree and showcase screenshots were added or revised after the product baseline. Their authority is recorded in `docs/evidence/baseline.md` and `docs/evidence/screenshot-provenance.md`.

## Local upgrade maintenance

The fork deliberately carries no files under `.github/workflows/`. Stable upstream desktop
releases are integrated locally and reviewed before any manual publication:

| Path | Release-candidate purpose |
|---|---|
| `.github/upstream-desktop-baseline` | Record the inherited stable desktop tag and immutable SHA. |
| `scripts/latest-upstream-desktop-tag.sh` | Resolve the highest stable `desktop-vMAJOR.MINOR.PATCH` tag. |
| `scripts/sync-upstream-desktop-local.sh` | Merge a stable upstream release locally while retaining upstream ancestry and excluding GitHub Actions workflows. |
| `scripts/test-upstream-desktop-sync-contract.sh` | Check stable-tag selection and the local-only/no-push contract. |
| `scripts/audit-public-docs.mjs` | Audit public Markdown/HTML links and reject private local paths. |

## Deliberately unchanged product layers

BUZZ — LIVE PREVIEW STUDIO has no fork-owned production delta under:

- `crates/buzz-core/`;
- `crates/buzz-relay/`;
- `crates/buzz-db/`; or
- `migrations/`.

BUZZ — LIVE PREVIEW STUDIO therefore does not add production Nostr kinds, relay admission rules, shared artifact storage, or database migrations.

## Upgrade procedure

1. Fetch the official `upstream` remote and record the exact candidate tag or commit.
2. Compare it with the current inherited baseline, not merely with upstream `main`.
3. Rebuild this ledger from `git diff --name-status <baseline>...<product-commit>`.
4. Reconcile routing, navigation, message handoff, CSP, native-command registration, feature flags, package manifests, and lockfiles.
5. Confirm there are still no accidental core, relay, database, or migration changes.
6. Run the stock upstream quality gates plus BUZZ — LIVE PREVIEW STUDIO unit and E2E suites.
7. Update the product baseline, documentation baseline, evidence, and known limitations separately.

Generic fixes should be proposed upstream when appropriate. Public builds must use their own identifier namespace, icons, signing identity, update channel, and branding rather than Block's distribution identity.
