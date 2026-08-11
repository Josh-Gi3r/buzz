# Known issues

## Preview Studio

- Live URL revisions do not snapshot content.
- Artifacts, reviews, and decisions are device-local.
- Static-site, deck, and film engines have fixture-only ingress.
- Editable Reveal decks and PDF-export image decks are separate workflows.
- Film edits do not trigger an in-app render.
- Image/video providers lack recorded live-success release evidence.
- Provider keys use renderer-local storage.
- Imports above 2.5 MB are session-only.
- The manifest origin policy is not a complete runtime network gate.
- Native mobile sessions and automatic feedback delivery are not implemented.

## Product and release

- Projects, workflows, Pulse, forum, and managed-profile paths retain upstream preview status.
- Generic workflow actions remain incomplete.
- Optional services require deployment-specific verification.
- The fork still needs independent identity/signing/update/branding for public binaries.
- Public `main` is protected: pull requests, three stable required checks, stale-review
  dismissal, conversation resolution, administrator enforcement, and force-push/deletion
  prevention are enabled. The required approval count is zero so the single-owner fork can
  merge its own fully checked pull requests.
- Public source and clean-clone evidence exist, but no independently signed binary or
  immutable release tag exists yet.
- The live upstream detector found `desktop-v0.5.9`. Its integration conflicts with the
  fork, so the workflow aborted without changing `main` and opened issue #3. The fork still
  inherits `desktop-v0.5.8` until that issue is resolved through a reviewed upgrade PR.
- Without an `UPSTREAM_SYNC_TOKEN`, the `GITHUB_TOKEN` fallback may prevent the generated
  branch or pull request from triggering every expected recursive CI workflow.
- A supplied `UPSTREAM_SYNC_TOKEN` also needs Issues write access for the conflict-reporting
  issue path; repository workflow permissions do not add scopes to that separate token.
- The upstream detector prepares a reviewed integration PR when the merge is clean; it
  deliberately does not auto-merge, resolve conflicts, or certify the resulting release.

## Development warnings

The PM-verified `just desktop-check` rerun passes, but reports three non-fatal warnings:

- the approximately 2.4 MiB Preview Studio `photographs.ts` fixture exceeds Biome's file-size
  limit;
- inherited `terminal.css` uses `!important`; and
- the Studio reduced-motion override uses `!important`.

These warnings remain release-quality debt even though the full CI worktree rerun passes.

Full CI also reports the two known desktop Vite warnings and one web output chunk over 500
kB. PostgreSQL-gated, voice fixture/model, OS-keychain, and release-performance ignored
tests remain unexecuted; see [QA evidence](qa-evidence.md).
