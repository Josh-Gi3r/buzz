# Evidence index

This index pins documentation claims to fork commit
`d36f39336b05036f90ba20e273746374c25aaf3e`, based on the published
`desktop-v0.5.8` tag at `f3de860574bb3119018b4592353e9761635aeb07`.
Newer upstream `main` behavior is intentionally outside this documentation
snapshot.

## Product and protocol

| Subject | Canonical source | Focused evidence |
|---|---|---|
| Event kinds and delivery classifications | `crates/buzz-core/src/kind.rs` | `crates/buzz-core/src/**` tests and relay conformance/integration suites |
| Relay admission and fan-out | `crates/buzz-relay/src/handlers/ingest.rs`, `event.rs`, `req.rs`, `subscription.rs` | `crates/buzz-test-client/tests/e2e_relay.rs` |
| HTTP routes | `crates/buzz-relay/src/router.rs` | Router/admin tests under `crates/buzz-relay/src/` |
| Durable schema | `migrations/0001_initial_schema.sql` through `0028_long_reaction_payloads.sql` | Database lint/conformance and relay integration tests |
| CLI product surface | `crates/buzz-cli/src/lib.rs`, `crates/buzz-cli/src/commands/` | `crates/buzz-cli/TESTING.md` and CLI tests |
| Desktop navigation | `desktop/src/app/routes.ts`, `AppShell.helpers.ts` | `desktop/tests/e2e/navigation.spec.ts`, feature-specific E2E specs |
| Mobile coverage | `mobile/lib/features/` | `mobile/test/` |
| Public web coverage | `web/src/features/invite/`, `web/src/features/repos/` | `web` checks and E2E tasks in `Justfile` |
| Admin surface | `admin-web/src/App.tsx`, `admin-web/src/api.ts`, relay `/api/admin/v1` router | `just admin-check` |

## Agents, projects and workflows

| Subject | Canonical source | Focused evidence |
|---|---|---|
| ACP harness and trigger gates | `crates/buzz-acp/src/` | crate tests and live agent E2E where configured |
| Bundled agent runtime | `crates/buzz-agent/src/` | ACP/runtime tests |
| Managed-agent desktop lifecycle | `desktop/src-tauri/src/managed_agents/`, `desktop/src/features/agents/` | `desktop/tests/e2e/agents.spec.ts`, `agent-lifecycle-feedback.spec.ts`, `onboarding-agent-defaults.spec.ts` |
| Personas, teams and access policy | `crates/buzz-persona/`, agent feature modules | `team-snapshot.spec.ts`, `persona-sync.spec.ts`, `agent-access-warning.spec.ts` |
| Projects and git collaboration | `desktop/src/features/projects/`, git/project kinds in `kind.rs`, relay git modules | `project-commit-detail.spec.ts`, `project-issue-comments.spec.ts`, `project-pr-review.spec.ts` |
| Workflows and approvals | `crates/buzz-workflow/`, relay workflow command paths, `desktop/src/features/workflows/` | `desktop/tests/e2e/workflows.spec.ts`; TODO/placeholder paths remain in `crates/buzz-workflow/src/executor.rs` |

## Preview Studio

| Claim | Canonical source | Acceptance evidence |
|---|---|---|
| Feature enabled by default | `preview-features.json` | Default resolution in `desktop/src/shared/features/resolveEnabled.ts` and `useFeatureEnabled.ts` |
| Agent URL extraction and persistent handoff | `desktop/src/features/preview-studio/lib/agentPreviewBridge.ts`, `ui/AgentPreviewHandoff.tsx` | `lib/agentPreviewBridge.test.mjs`, `desktop/tests/e2e/agent-preview-handoff.spec.ts` |
| Empty production library and legacy-demo removal | `lib/store.ts` | `lib/store.test.mjs` |
| Imports, size boundary, reviews and decisions | `lib/store.ts`, `lib/types.ts` | `lib/store.test.mjs` |
| Renderer support classification | `lib/registry.ts` | `lib/registry.test.mjs` |
| Display URI priority | `lib/resolveDisplayUri.ts` | `lib/resolveDisplayUri.test.mjs` |
| Image/video/PDF dispatch | `ui/PreviewStage.tsx` | Store/registry tests plus desktop stage E2E |
| Editable website source | `lib/webSource.ts`, `lib/webBundle.ts`, `ui/WebStage.tsx` | `desktop/tests/e2e/web-verify.spec.ts` |
| Live responsive website | `ui/LiveUrlStage.tsx`, `ui/PreviewStudioScreen.tsx` | `desktop/tests/e2e/agent-preview-handoff.spec.ts` |
| Editable decks and revisions | `lib/deckSource.ts`, `ui/RevealDeckStage.tsx`, `ui/RevisionRail.tsx` | `deck-editable.spec.ts`, `deck-verify.spec.ts`, `revision-rail.spec.ts` |
| Film composition editing | `lib/filmSource.ts`, `ui/FilmStage.tsx` | `film-verify.spec.ts` |
| Image generation | `lib/generation/generateImage.ts`, `providers.ts`, `ui/GeneratePanel.tsx` | `generate-verify.spec.ts` covers model-state UI; live provider calls require external accounts |
| Higgsfield video generation | `lib/generation/higgsfield.ts`, `ui/VideoGenerateSection.tsx`, `desktop/src-tauri/src/commands/media_tools.rs` | `lib/generation/higgsfield.test.mjs`, `video-panel-verify.spec.ts`; successful paid generation requires the external CLI/account |
| CSP/frame policy | `desktop/src-tauri/tauri.conf.json` | `desktop/src-tauri/tests/csp.rs` |
| Fork integration boundary | `FORK_PATCHES.md`, diff from `desktop-v0.5.8` | No fork diff under `crates/buzz-core`, `crates/buzz-relay`, `crates/buzz-db` or `migrations` at this snapshot |

## Validation recorded for this documentation pass

The focused Preview Studio Node suites were run from the Hermit environment:

```text
21 tests passed, 0 failed
```

The run covered agent URL handoff, renderer registration, display URI
resolution, artifact storage/migration/reviews/decisions and Higgsfield audio
policy. The deterministic documentation story in
`desktop/tests/e2e/preview-studio-showcase.spec.ts` was also built and run: one
Playwright smoke test passed, exercising channel-to-preview handoff, live
desktop/mobile rendering, Inspector behavior, deck navigation, and film review.

## Evidence rules for future updates

1. Pin the fork commit and its published upstream desktop baseline.
2. Use source and focused tests before prose or design documents.
3. Label feature-flagged, configuration-dependent and partial paths explicitly.
4. Treat `docs/spec/` artifact kinds as proposed until registered and enforced by `buzz-core` and the relay.
5. Update this index whenever a documented capability changes.
