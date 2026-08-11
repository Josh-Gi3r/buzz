# QA evidence

## Evidence authorities

Exact DCO-signed commit `4e2e785d39126e064f67483f4f2ec95e92dd95f6` passed the repository's
complete local `just ci` gate from a clean worktree after the documentation, showcase,
upstream-sync, and fork publishing-guard work was integrated. This file is the
documentation-only evidence update that follows that tested commit. The run remains local
evidence until a pushed GitHub workflow reproduces it.

Earlier exact commit `712fe36a088bf320d663a857bbd4d1b0eba159e4` passed the clean
detached-worktree verification below. A later full-CI rerun used that candidate plus one
mechanical rustfmt correction in `desktop/src-tauri/src/commands/mod.rs`: `pub mod
media_tools;` was moved into alphabetical order. No behavior changed.

## Exact release-candidate full CI at `4e2e785d`

The PM ran this command from the repository root on 2026-08-11:

```bash
. ./bin/activate-hermit && just ci
```

It exited `0`. The worktree was clean before the run and remained clean afterward.

- Workspace and Tauri Rust formatting and clippy passed.
- Desktop checks passed with the same three documented non-fatal warnings.
- Desktop Node tests passed 4,556 tests across 69 suites with zero failures, cancellations,
  skips, or todo entries; duration 131476.287125 ms.
- Desktop production build passed with 4,779 modules.
- Tauri `buzz_lib` passed 2,272 tests with 14 ignored OS-bound tests; CSP passed 8, rodio
  passed 3, terminal library passed 27, and the terminal integration suites passed.
- Web checks and the 2,299-module production build passed.
- Mobile formatting and analysis passed; all 1,261 Flutter tests passed.

The Rust no-infrastructure unit runner and all other commands composed by `just ci` also
passed. The exclusions at the end of this document still apply.

## Clean detached-worktree verification at `712fe36a`

The worktree was clean before verification and `git status --short` was empty at the end.

- `just desktop-install-ci` passed with a frozen lockfile and 654 packages.
- `node scripts/audit-public-docs.mjs` passed: 76 Markdown files, 139 local links.
- `scripts/test-upstream-desktop-sync-contract.sh` passed. This does not make the unmerged
  scheduled workflow live.
- `just desktop-check` passed with the three warnings listed below.
- `just desktop-test` passed 4,556 tests across 69 suites, with zero failed, cancelled,
  skipped, or todo; duration 116755.851375 ms.
- `just desktop-build` passed: 4,779 modules in 2.48 s, with the two Vite warnings below.
- The deterministic mocked showcase passed `2/2` in 15.4 s from `desktop/`; regeneration
  produced zero Git diff and the exact hashes in
  [Screenshot provenance](screenshot-provenance.md).

## Full CI worktree verification

The PM ran:

```bash
. ./bin/activate-hermit && just ci
```

The first run exposed only rustfmt module ordering in
`desktop/src-tauri/src/commands/mod.rs`. After the mechanical alphabetical move described
above, the rerun exited `0`.

### Passed gates

- Workspace `cargo fmt` and `cargo clippy --all-targets` passed.
- Desktop check passed with the same three warnings.
- Tauri formatting and clippy passed; Tauri `cargo check` passed.
- Web check passed.
- Mobile Dart formatting checked 371 files with 0 changed; Flutter analyze reported no
  issues.
- The Rust unit runner completed 8 suites in 143 s:
  - core: 249 passed;
  - auth: 45 passed;
  - voice: 9 passed, 5 fixture/model tests ignored;
  - CLI: 341 passed;
  - database: 94 passed, 154 PostgreSQL tests ignored;
  - conformance: 22 passed across its targets;
  - push: 15 passed, 6 PostgreSQL tests ignored; and
  - Kubernetes: 158 passed across its targets.
- Desktop Node tests passed 4,556 tests across 69 suites, with zero failed, cancelled,
  skipped, or todo, as recorded by the exact focused run.
- Desktop frontend build passed: 4,779 modules, with the two known Vite warnings.
- Native Tauri tests passed:
  - `buzz_lib`: 2,272 passed, 14 ignored;
  - CSP: 8 passed;
  - rodio: 3 passed; and
  - terminal library: 27 passed, with its integration suites also passing.
- Web build passed: 2,299 modules in 507 ms, with one output-chunk warning over 500 kB.
- Mobile Flutter tests passed all 1,261 tests.

## Non-fatal warnings

Desktop check:

- `photographs.ts` is approximately 2.4 MiB and exceeds Biome's file-size limit;
- inherited `terminal.css` contains `!important`; and
- the Studio reduced-motion rule contains `!important`.

Desktop Vite build:

- `ChannelManagementSheet` is both dynamically and statically imported, so the dynamic
  import does not create a separate chunk; and
- one or more output chunks exceed 500 kB after minification.

Web Vite build reported one output chunk over 500 kB.

## Scope and exclusions

The full `just ci` rerun passed, but ignored tests did not execute. This evidence does not
cover the 154 database and 6 push tests requiring PostgreSQL, the 5 voice fixture/model
tests, ignored OS-keychain tests, ignored release-mode performance tests, or other
infrastructure-gated paths.

It also does not verify packaging, signing/notarization, installers, update delivery, a live
deployment, paid/external providers, or desktop E2E beyond the deterministic showcase. No
public tag or pushed clean-clone verification exists yet.
