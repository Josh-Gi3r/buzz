# Known issues

## BUZZ — LIVE PREVIEW STUDIO

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
- Future upstream releases can overlap fork-owned integration seams. The local updater stops
  for maintainer review when that happens; it never pushes or invokes repository automation.
- The local updater prepares staged source changes when application is clean; it
  deliberately does not auto-merge, resolve conflicts, or certify the resulting release.

## Development warnings

The PM-verified `just desktop-check` rerun passes, but reports three non-fatal warnings:

- the approximately 2.4 MiB BUZZ — LIVE PREVIEW STUDIO `photographs.ts` fixture exceeds Biome's file-size
  limit;
- inherited `terminal.css` uses `!important`; and
- the Studio reduced-motion override uses `!important`.

These warnings remain release-quality debt even though the full CI worktree rerun passes.

Full CI also reports the two known desktop Vite warnings and one web output chunk over 500
kB. PostgreSQL-gated, voice fixture/model, OS-keychain, and release-performance ignored
tests remain unexecuted; see [QA evidence](qa-evidence.md).
