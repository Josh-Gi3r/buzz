# Fork patch ledger

Every modification to an **upstream-owned** file is tracked here, per the
Apache-2.0 §4(b) requirement to state changes and this fork's additive-only
policy: substantial work lives in new files and directories; upstream files
receive only thin integration seams.

**Upstream baseline:** `block/buzz` @ `desktop-v0.5.8`

## Modified upstream files

| Upstream file | Change |
|---------------|--------|
| `README.md` | Replaced with the fork's own README (fork banner, Preview Studio docs) |
| `SECURITY.md` | Fork preamble routing fork-code vulnerabilities to this repo |
| `.github/CODEOWNERS` | Fork maintainer instead of the upstream team |
| `.github/ISSUE_TEMPLATE/config.yml` | Contact link routing upstream bugs to block/buzz |
| `.github/workflows/docker.yml` | `github.repository == 'block/buzz'` guards on publish jobs |
| `.github/workflows/auto-tag-on-release-pr-merge.yml` | Repo guard on auto-tag job |
| `.github/workflows/sprig.yml` | Repo guards on build/publish jobs |
| `.github/workflows/helm-chart.yml` | Repo guards on lint/install/publish jobs |
| `.github/workflows/push-gateway-helm-chart.yml` | Repo guards on validate/publish jobs |
| `preview-features.json` | Registered the `preview-studio` feature gate (default on for this fork) |
| `desktop/src/features/agents/lib/personaCatalogRelay.test.mjs` | Lint fix (template literals); upstream PR candidate |
| `desktop/playwright.config.ts` | E2E preview port reads `BUZZ_E2E_PORT`; register fork Preview Studio smoke coverage |
| `desktop/src/features/onboarding/communityOnboarding.tsx` | Type the browser timer explicitly so ambient Node types cannot redefine it; upstream PR candidate |
| `pnpm-workspace.yaml` | Deny the optional `es5-ext` build script + force a single `@types/node` version |
| `desktop/src-tauri/src/commands/mod.rs` | Register the `media_tools` module |
| `desktop/src-tauri/src/lib.rs` | Register `media_tool_available` / `run_media_tool` commands |
| `desktop/src-tauri/tauri.conf.json` | Permit explicit HTTP(S) Preview Studio frames in packaged builds |
| `desktop/src-tauri/tests/csp.rs` | Pin the packaged-app Preview Studio frame policy |
| `desktop/src/app/routes.ts` | Registered the `/preview-studio` route |
| `desktop/src/app/routeTree.gen.ts` | Regenerated for the `/preview-studio` route |
| `desktop/src/app/AppShell.helpers.ts` | `preview-studio` AppView + shell-route derivation |
| `desktop/src/app/AppShell.tsx` | Wire `goPreviewStudio` into the sidebar (2 lines) |
| `desktop/src/app/navigation/useAppNavigation.ts` | `goPreviewStudio` navigation helper |
| `desktop/src/features/sidebar/ui/AppSidebar.tsx` | Pass the Preview Studio select handler |
| `desktop/src/features/sidebar/ui/AppSidebarPinnedHeader.tsx` | Flag-gated nav button |
| `desktop/src/features/messages/ui/MessageRow.tsx` | Flag-gated handoff from agent preview URLs into Preview Studio |
| `desktop/src/shared/styles/globals.css` | Import the Studio token sheet |
| `desktop/src/shared/ui/ViewLoadingFallback.tsx` | `preview-studio` loading kind |
| `desktop/scripts/check-px-text.mjs` | Allowlist the demo artifacts' own stylesheets (guest content in a sandboxed frame / a fixed-canvas video composition, not app UI) |

## New fork-owned areas (not patches)

- `desktop/src/features/preview-studio/**`
- `desktop/src-tauri/src/commands/media_tools.rs`
- `desktop/src/app/routes/preview-studio.tsx`
- `desktop/src/shared/theme/studio/**`
- `docs/design/**`
- `docs/preview-studio/**`
- `docs/spec/artifact-*.md`
- `scripts/run-studio-sandbox.sh`
- `FORK_PATCHES.md`

## Rules

1. Prefer new files over editing upstream modules.
2. No edits to `migrations/` history.
3. No second copy of an upstream feature directory.
4. After each upstream merge, run the stock desktop checks before accepting.
5. Distributed builds must use their own identifier namespace, never
   Block's `xyz.block.buzz` identifiers or branding.
