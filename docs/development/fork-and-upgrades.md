# Fork and upstream upgrades

This fork currently includes Block Buzz Desktop `v0.5.9` at
`ee33722615ca1e7b8efb03e2ed641d99448c8899`.

The public repository intentionally contains no GitHub Actions workflows. Upgrades happen
locally, under the maintainer's control, and nothing is pushed automatically.

## Check and apply a stable release

Start from a clean worktree, then run:

```bash
scripts/sync-upstream-desktop-local.sh --fetch
```

To select a particular stable release:

```bash
scripts/sync-upstream-desktop-local.sh --fetch desktop-v0.5.10
```

The updater reads `.github/upstream-desktop-baseline`, resolves stable
`desktop-vMAJOR.MINOR.PATCH` tags, verifies that the fork shares official history with its
recorded release, and opens a normal uncommitted Git merge with the target release. Buzz release
candidate tags may sit on side history, so the updater does not pretend that consecutive
release tags form a linear chain. The fork is rooted in official Buzz history, and future
merge commits retain the upstream commits they integrate.
The updater removes upstream workflow files from the merge, never invokes GitHub Actions,
never pushes, and never opens a pull request or issue.

If upstream and fork code overlap, the command stops with ordinary local conflict markers.
Resolve those files, stage them, run the checks below, then update the baseline line to the
target tag and immutable SHA. Generated lockfiles should be regenerated from the combined
manifests rather than hand-edited.

## Review checklist

1. Read the upstream release notes and compare the release against the recorded baseline.
2. Review the fork-owned seams in [FORK_PATCHES.md](../../FORK_PATCHES.md).
3. Confirm BUZZ — LIVE PREVIEW STUDIO navigation, URL capture, responsive preview, artifact storage, and review state.
4. Run `scripts/test-upstream-desktop-sync-contract.sh`.
5. Run the relevant local desktop, Rust, web, and mobile checks.
6. Review the complete diff before making a local commit or manually pushing it.

The contract test verifies stable-tag resolution, ancestry checks, merge behavior, workflow
exclusion, and the absence of push, GitHub CLI, scheduling, or workflow-dispatch behavior.
It does not claim that an untested future upstream release will merge without human review.

## What downstream forks receive

Publishing an update to this repository makes it available to every clone and fork. GitHub
does not force changes into somebody else's fork: maintainers choose **Sync fork**, merge
this repository's `main`, or pull it locally. That opt-in model is standard Git behavior and
protects downstream work from being overwritten.
