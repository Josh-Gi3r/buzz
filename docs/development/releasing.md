# Releasing

Source publication and independently branded application distribution are separate gates.

## Publish the source repository

Before replacing the public default branch:

1. verify the canonical repository is the public `Josh-Gi3r/buzz` fork of `block/buzz`;
2. enable repository Issues so upstream-sync conflicts can create their deduplicated issue;
3. push the signed candidate to a review branch rather than directly to `main`;
4. open a pull request, require the repository CI checks, and inspect the rendered README;
5. merge only the reviewed candidate, then protect `main` against force pushes and require
   pull requests plus the stable required checks;
6. verify the default-branch README, images, documentation links, and fork disclaimer from
   GitHub's public renderer;
7. run the upstream desktop workflow manually and confirm its no-upgrade path at the recorded
   baseline; and
8. record the pushed commit and workflow URLs in the evidence ledger.

Do not call the weekly updater operational until its default-branch run succeeds. Do not
enable automatic merging: upstream releases remain reviewed integration work.

## Distribute an application binary

This fork does not yet document a verified independently branded public binary release.

Before publishing one:

1. choose and record an exact product commit;
2. give the application an independent bundle identifier, name, icons, signing identity, and update channel;
3. run the exact-commit quality gates on supported platforms;
4. verify README setup from a clean clone;
5. audit Markdown/HTML links, anchors, and images;
6. verify screenshot provenance and redact private data;
7. reconcile `FORK_PATCHES.md` against the inherited upstream baseline;
8. create an immutable tag; and
9. clone and retest that tag.

Upstream's internal release infrastructure and response promises do not automatically apply to this fork. See the repository root `RELEASING.md` for inherited upstream mechanics and treat organization-specific steps accordingly.
