# Fork and upstream upgrades

The current product baseline inherits official `block/buzz` `desktop-v0.5.8`. Newer upstream `main` is not automatically part of this fork. Upgrades target stable published desktop release tags, not arbitrary movement on `main`.

## Release detector on this branch

This branch adds an upstream-release preparation contract in:

- `.github/workflows/upstream-desktop-sync.yml`;
- `.github/upstream-desktop-baseline`;
- `scripts/latest-upstream-desktop-tag.sh`; and
- `scripts/test-upstream-desktop-sync-contract.sh`.

It is **not yet proven live**: the workflow and support files must first be merged into the repository's default branch, GitHub Actions must be enabled, and the scheduled or manual run must complete successfully.

When active, the workflow is designed to run every Monday at 07:17 UTC and through manual `workflow_dispatch`. A manual run may request a particular stable tag such as `desktop-v0.5.9`; otherwise the resolver reads official Block Buzz tag refs, accepts only `desktop-vMAJOR.MINOR.PATCH`, sorts them by version, and chooses the latest.

The baseline file records both tag and 40-character commit SHA. Before preparing an upgrade, the workflow:

1. validates the current and requested tag formats;
2. resolves the target tag directly from `https://github.com/block/buzz.git` to its immutable SHA;
3. fails if an already recorded tag has moved to a different SHA;
4. refuses a version downgrade; and
5. exits without a branch when the recorded tag and SHA are already current.

## Integration branch and review

For a newer release, the workflow is designed to:

1. create or reset `automation/upstream-<tag>` from `origin/main`;
2. fetch only the requested upstream tag and verify its object matches the resolved SHA;
3. merge it with `--no-ff --no-edit --signoff`;
4. update `.github/upstream-desktop-baseline` only after a successful merge;
5. push the integration branch with `--force-with-lease`; and
6. open a pull request to `main`, or leave the existing open PR in place.

It intentionally contains no auto-merge and does not push directly to `main`. Humans still review the fork patch ledger, Preview Studio behavior, desktop/mobile builds, packaging identity, migrations, and release evidence.

If the upstream tag conflicts, the workflow aborts the merge, does not push an integration result, opens one deduplicated issue titled `Upstream <tag> requires manual integration`, and fails the run. The issue directs maintainers to resolve the release on a temporary branch and submit a reviewed PR.

## Token behavior

The workflow can use an optional fine-grained `UPSTREAM_SYNC_TOKEN` with repository Contents
and Pull requests write access. Give it Issues write access as well if conflict runs must
create the intended issue; job-level `issues: write` does not expand a separately supplied
token. The custom token allows the branch and pull request to trigger ordinary CI according
to repository policy. Without it, the workflow falls back to `GITHUB_TOKEN`; GitHub may
suppress workflows recursively triggered by changes created with that token. A successful
PR creation therefore does not by itself prove that all expected CI ran.

## Upgrade review checklist

1. Confirm the detected tag and immutable SHA against the official upstream remote.
2. Read upstream release notes and compare code from the recorded inherited baseline.
3. Reconcile the thin integration seams in [FORK_PATCHES.md](../../FORK_PATCHES.md).
4. Regenerate route trees and lockfiles only through normal project tools.
5. Confirm there are no accidental core event-kind, relay, database, or migration changes.
6. Run upstream quality gates and fork-specific unit/E2E coverage on the PR.
7. Update product, documentation, upstream, and merge-base hashes independently.
8. Rebuild the patch ledger mechanically from `git diff --name-status`.

The contract test validates the resolver's stable-tag choice and statically checks the workflow's merge, conflict, PR, issue, token, and no-auto-merge safeguards. It does not execute GitHub Actions or prove repository permissions, secrets, branch protection, CI recursion, or a real upstream integration.
