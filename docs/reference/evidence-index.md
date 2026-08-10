# Source evidence index

Product source is audited at fork `d36f39336b05036f90ba20e273746374c25aaf3e` and inherited upstream `desktop-v0.5.8` at `f3de860574bb3119018b4592353e9761635aeb07`. Documentation/showcase source is separately pinned to `887d6da441684abda30a7284d004f6d4dd52a767`; `5d0b11f864bb142ae5ec94de3c083eebbc99e1dc` is the integrated pre-evidence candidate and `712fe36a088bf320d663a857bbd4d1b0eba159e4` is the clean-verification candidate.

## Buzz

| Subject | Canonical source | Focused evidence |
|---|---|---|
| Event kinds/classification | `crates/buzz-core/src/kind.rs` | Core tests and relay conformance/integration suites. |
| Relay admission/delivery | `crates/buzz-relay/src/handlers/ingest.rs`, `event.rs`, `req.rs`, `side_effects.rs` | `crates/buzz-test-client/tests/e2e_relay.rs` and relay tests. |
| HTTP routes | `crates/buzz-relay/src/router.rs` and nested routers | Router/admin/operator tests. |
| Durable schema | `migrations/0001_initial_schema.sql` through `0028_long_reaction_payloads.sql` | DB/relay integration suites. |
| Audit configuration | `crates/buzz-relay/src/config.rs`, `main.rs`, `state.rs` | Config and audit tests; audit state is optional. |
| Desktop routes/features | `desktop/src/app/routes.ts`, `desktop/src/features/` | Navigation and feature-specific E2E. |
| Mobile | `mobile/lib/features/` | `mobile/test/`. |
| Public web | web home/invite/repository routes | Web checks/tasks in `Justfile`. |
| Admin | admin app and relay `/api/admin/v1` routes | `just admin-check` and route tests. |
| CLI | `crates/buzz-cli/src/commands/` | CLI unit/live runbook in `crates/buzz-cli/TESTING.md`. |
| ACP/agents | `crates/buzz-acp/`, `crates/buzz-agent/`, desktop managed-agent code | Crate tests and agent desktop E2E. |
| Projects/git | project features, git/project kinds, relay git modules | Project commit/issue/PR/branch/tag E2E suites. |
| Workflows | `crates/buzz-workflow/`, relay workflow paths, desktop workflows | `workflows.spec.ts`; executor TODO/placeholder paths constrain status. |
| Upstream desktop release preparation | `.github/workflows/upstream-desktop-sync.yml`, `.github/upstream-desktop-baseline`, `scripts/latest-upstream-desktop-tag.sh` | `scripts/test-upstream-desktop-sync-contract.sh` statically checks the branch contract; no live default-branch run is claimed. |
| Full local quality gate | Root `Justfile`, component test/build configuration | Post-`712fe36a` worktree `just ci` exited 0 after an ordering-only rustfmt fix; exact suite counts and ignored boundaries are in QA evidence. |

## Preview Studio

| Claim | Canonical source | Focused evidence and limit |
|---|---|---|
| Default route/library | `preview-features.json`, routes, `lib/store.ts` | Store tests; production starts empty. |
| Agent URL handoff | `lib/agentPreviewBridge.ts`, `ui/AgentPreviewHandoff.tsx`, `MessageRow.tsx` | Unit test and `agent-preview-handoff.spec.ts`; production journey. |
| Responsive live frame | `ui/LiveUrlStage.tsx`, `PreviewStudioScreen.tsx` | Handoff E2E; URL content is not snapshotted. |
| Imports/reviews/decisions | `lib/store.ts`, `lib/types.ts`, Studio UI | Store tests; local-only and partial anchor/state UI. |
| Image/video/PDF dispatch | `ui/PreviewStage.tsx` | Registry/store and stage E2E. |
| Static website engine | `lib/webSource.ts`, `lib/webBundle.ts`, `ui/WebStage.tsx` | `web-verify.spec.ts`; deterministic fixture ingress only. |
| Deck engines | `lib/deckSource.ts`, `RevealDeckStage.tsx`, `DeckStage.tsx` | Deck/revision specs; fixture ingress and distinct edit/export engines. |
| Film engine | `lib/filmSource.ts`, `FilmStage.tsx` | `film-verify.spec.ts`; fixture media and no in-app rerender. |
| Image generation wiring | `lib/generation/generateImage.ts`, `providers.ts`, generation UI | Generation UI tests; no recorded live-provider success. |
| Video generation wiring | `lib/generation/higgsfield.ts`, `media_tools.rs` | Unit/panel fail-closed tests; no recorded paid live success. |
| Frame/CSP policy | `desktop/src-tauri/tauri.conf.json`, frame components | `desktop/src-tauri/tests/csp.rs`; manifest origin list not fully enforced. |
| Fork boundary | `FORK_PATCHES.md`, diff from inherited tag | No product-baseline delta in core, relay, DB, or migrations. |

Test results belong in [QA evidence](../evidence/qa-evidence.md), where exact command, commit, environment, skips, and external dependencies can be audited.
