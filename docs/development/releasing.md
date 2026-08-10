# Releasing

This fork does not yet document a verified independently branded public release.

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
