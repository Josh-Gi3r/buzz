# QA evidence

No full exact-commit release qualification is claimed by this documentation pass.

## PM-verified showcase reproduction

The PM ran the deterministic mocked showcase command twice:

```bash
pnpm build:e2e && pnpm exec playwright test preview-studio-showcase --project=smoke
```

- First verification: `2/2` tests passed.
- Second showcase run: `2/2` tests passed.
- Viewport and screenshot output: `1600x1000`.
- All five SHA-256 output hashes were identical between runs.

The exact file hashes and claim boundaries are recorded in [Screenshot provenance](screenshot-provenance.md). This verifies reproducible fixture rendering and the scripted showcase assertions. It does not verify a live agent build, live OpenAI/Gemini/Higgsfield use, HyperFrames rendering, remote-agent infrastructure, huddle transport, deployment, or other external-provider integration.

Earlier focused runs reported 21 Preview Studio Node tests passing. That number remains historical context until accompanied by a final exact-checkout run artifact with command, environment, skips, and output.

## PM-verified desktop check

The PM ran:

```bash
just desktop-check
```

The first run exposed nine pre-existing Preview Studio formatting/lint errors. The PM
mechanically formatted eight files and added one narrowly scoped Biome suppression for
`RevealDeckStage`'s intentional slide-change dependency. The rerun passed.

The passing rerun retained three non-fatal warnings:

- `photographs.ts` is approximately 2.4 MiB and exceeds Biome's configured file-size limit;
- inherited `terminal.css` contains `!important`; and
- the Studio reduced-motion rule contains `!important`.

This establishes a passing `desktop-check` after those local corrections. It is not a full
`just ci` result, runtime acceptance test, external-provider test, or release qualification.

## PM-verified desktop unit tests

On the uncommitted release-candidate worktree, the PM ran:

```bash
. ./bin/activate-hermit && just desktop-test
```

The run passed:

- 4,556 tests;
- 69 suites;
- 0 failed;
- 0 cancelled;
- 0 skipped;
- 0 todo; and
- 104421 ms reported duration.

This is desktop Node unit coverage only. It does not establish a passing full `just ci`,
Rust or native/Tauri coverage, mobile or web coverage, deployment behavior, or successful
external-provider integration. Because the worktree is uncommitted, repeat the command at
the final exact release-candidate commit before treating it as immutable release evidence.

## PM-verified desktop frontend build

On the uncommitted release-candidate worktree, the PM ran:

```bash
. ./bin/activate-hermit && just desktop-build
```

The `tsc && vite build` command passed. Vite transformed 4,779 modules and reported a 2.02 s
build duration.

The build retained two non-fatal Vite warnings:

- `ChannelManagementSheet` is both dynamically and statically imported, so the dynamic
  import does not move it into a separate chunk; and
- one or more output chunks exceed 500 kB after minification.

This establishes the desktop frontend TypeScript/Vite production build only. It does not
verify a Tauri native build, packaged application, signing or notarization, installer,
update channel, or releasable binary. Repeat it at the final exact commit for immutable
evidence.

## Required release record

For each release command, record:

- product and documentation commits;
- operating system/toolchain;
- command exactly as run;
- passed, failed, and skipped totals;
- configured Postgres/Redis/object/external services;
- fixture/mock/live-provider classification; and
- artifact/log location.

Minimum release gates are `just ci`, relevant integration suites, desktop Preview Studio unit/E2E, mobile/web/admin checks where claimed, documentation link/image audit, exact screenshot reproduction, and clean-clone quick start.
