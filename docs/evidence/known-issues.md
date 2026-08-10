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
- Clean detached-worktree verification exists for local candidate `712fe36a`, but no pushed
  public ref, public clean-clone proof, or immutable documentation/release tag exists yet.
- Full `just ci` passes on the post-`712fe36a` source tree after an ordering-only rustfmt
  fix, integrated with the evidence at `d57783c5`; no pushed CI run exists yet.
- Upstream desktop release detection and PR preparation exist in local candidate
  `712fe36a088bf320d663a857bbd4d1b0eba159e4`. Its static contract passed, but the candidate
  is not pushed or merged to the public default branch. Scheduled automation remains
  unproven until published, enabled, and observed in a successful run.
- Without an `UPSTREAM_SYNC_TOKEN`, the `GITHUB_TOKEN` fallback may prevent the generated
  branch or pull request from triggering every expected recursive CI workflow.
- A supplied `UPSTREAM_SYNC_TOKEN` also needs Issues write access for the conflict-reporting
  issue path; repository workflow permissions do not add scopes to that separate token.
- The upstream detector prepares a reviewed integration PR; it deliberately does not
  auto-merge, resolve conflicts, or certify the resulting release.

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
