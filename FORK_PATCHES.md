# Fork patch ledger

This ledger classifies the fork delta from Block Buzz `desktop-v0.5.8` at `f3de860574bb3119018b4592353e9761635aeb07` to the fork product baseline `d36f39336b05036f90ba20e273746374c25aaf3e`. Documentation and showcase work assembled from `887d6da441684abda30a7284d004f6d4dd52a767`, integrated at `5d0b11f864bb142ae5ec94de3c083eebbc99e1dc`, and clean-worktree verified at `712fe36a088bf320d663a857bbd4d1b0eba159e4` is not misrepresented as product code at `d36f3933`.

The aim is a narrow integration boundary: Preview Studio owns its feature directory and assets; inherited files carry only routing, navigation, native-command, CSP, test, package, or distribution seams.

## Modified upstream paths

| Path | Fork change |
|---|---|
| `.github/CODEOWNERS` | Fork maintainer ownership. |
| `.github/ISSUE_TEMPLATE/config.yml` | Distinguish fork support from upstream support. |
| `.github/workflows/auto-tag-on-release-pr-merge.yml` | Guard upstream-only release behavior. |
| `.github/workflows/docker.yml` | Guard upstream-only publication. |
| `.github/workflows/helm-chart.yml` | Guard upstream-only chart publication. |
| `.github/workflows/push-gateway-helm-chart.yml` | Guard upstream-only validation/publication. |
| `.github/workflows/sprig.yml` | Guard upstream-only build/publication. |
| `README.md` | Explain Buzz, fork status, Preview Studio, and evidence. |
| `SECURITY.md` | Route fork reports and document fork trust boundaries. |
| `Cargo.lock` | Lockfile changes resulting from the fork checkout/tooling. |
| `pnpm-lock.yaml` | JavaScript dependency lockfile changes. |
| `pnpm-workspace.yaml` | Optional-script and Node type resolution policy. |
| `preview-features.json` | Register `preview-studio`, enabled by default in this fork. |
| `desktop/package.json` | Preview Studio test/development commands and dependencies. |
| `desktop/playwright.config.ts` | Configurable E2E port and Preview Studio projects. |
| `desktop/scripts/check-px-text.mjs` | Allow fixed-canvas guest/demo styles, not application UI text. |
| `desktop/src-tauri/src/commands/mod.rs` | Register the media-tools command module. |
| `desktop/src-tauri/src/lib.rs` | Register the media-tool availability/execution commands. |
| `desktop/src-tauri/tauri.conf.json` | Permit explicit HTTP(S) frames for packaged previews. |
| `desktop/src-tauri/tests/csp.rs` | Assert the packaged frame policy. |
| `desktop/src/app/AppShell.helpers.ts` | Add the Preview Studio shell view. |
| `desktop/src/app/AppShell.tsx` | Connect Preview Studio navigation to the sidebar. |
| `desktop/src/app/navigation/useAppNavigation.ts` | Add the Preview Studio navigation helper. |
| `desktop/src/app/routeTree.gen.ts` | Generated Preview Studio route entry. |
| `desktop/src/app/routes.ts` | Register the Preview Studio route. |
| `desktop/src/features/messages/ui/MessageRow.tsx` | Show the safe agent-URL handoff. |
| `desktop/src/features/sidebar/ui/AppSidebar.tsx` | Pass the Preview Studio selection handler. |
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
| `docs/assets/preview-studio-demo.gif` | Earlier Preview Studio demonstration asset. |
| `docs/assets/preview-studio-hero.png` | Earlier Preview Studio hero asset. |
| `docs/design/**` | Target-design documents; proposed behavior must remain labelled. |
| `docs/preview-studio/**` | Preview Studio user and scope documentation. |
| `docs/spec/artifact-*.md` | Proposed artifact protocol specifications, not registered relay kinds. |
| `examples/studio-demo/**` | Standalone demonstration source. |
| `scripts/run-studio-sandbox.sh` | Isolated local Studio development launcher. |
| `scripts/studio` | Studio development helper. |
| `scripts/studio-images` | Studio image helper. |

The broader open-source documentation tree and showcase screenshots were added or revised after the product baseline. Their authority is recorded in `docs/evidence/baseline.md` and `docs/evidence/screenshot-provenance.md`.

## Post-product-baseline release-candidate changes

The following release-maintenance files were integrated at `5d0b11f8` and verified in the
clean detached worktree at DCO-signed candidate
`712fe36a088bf320d663a857bbd4d1b0eba159e4`. They did **not** exist at product baseline
`d36f3933`. Because the verification candidate is not pushed or merged to the public default
branch, they are not evidence that automation is already live:

| Path | Release-candidate purpose |
|---|---|
| `.github/upstream-desktop-baseline` | Record the inherited stable desktop tag and immutable SHA. |
| `.github/workflows/upstream-desktop-sync.yml` | Weekly/manual stable-release detection and reviewed integration-PR preparation. |
| `scripts/latest-upstream-desktop-tag.sh` | Resolve the highest stable `desktop-vMAJOR.MINOR.PATCH` tag. |
| `scripts/test-upstream-desktop-sync-contract.sh` | Check resolver choice and workflow safety/no-auto-merge contract. |
| `scripts/audit-public-docs.mjs` | Audit public Markdown/HTML links and reject private local paths. |
| `.github/workflows/ci.yml` | Release-candidate modification that invokes the sync contract and public-doc audit. |

These paths need a committed default-branch revision and successful GitHub Actions evidence
before documentation may call the weekly detector operational. See
[`docs/development/fork-and-upgrades.md`](docs/development/fork-and-upgrades.md).

After `712fe36a`, the first full `just ci` run required one formatting-only adjustment to an
already listed integration seam: `pub mod media_tools;` in
`desktop/src-tauri/src/commands/mod.rs` moved into alphabetical order. The subsequent full
CI run exited 0. This changes no runtime behavior and was integrated with the evidence at
DCO-signed commit `d57783c5`.

## Deliberately unchanged product layers

At `d36f3933`, the fork has no Preview Studio delta under:

- `crates/buzz-core/`;
- `crates/buzz-relay/`;
- `crates/buzz-db/`; or
- `migrations/`.

Preview Studio therefore does not add production Nostr kinds, relay admission rules, shared artifact storage, or database migrations.

## Upgrade procedure

1. Fetch the official `upstream` remote and record the exact candidate tag or commit.
2. Compare it with the current inherited baseline, not merely with upstream `main`.
3. Rebuild this ledger from `git diff --name-status <baseline>...<product-commit>`.
4. Reconcile routing, navigation, message handoff, CSP, native-command registration, feature flags, package manifests, and lockfiles.
5. Confirm there are still no accidental core, relay, database, or migration changes.
6. Run the stock upstream quality gates plus Preview Studio unit and E2E suites.
7. Update the product baseline, documentation baseline, evidence, and known limitations separately.

Generic fixes should be proposed upstream when appropriate. Public builds must use their own identifier namespace, icons, signing identity, update channel, and branding rather than Block's distribution identity.
