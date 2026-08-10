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
- No immutable public documentation/release tag or clean-clone release proof exists yet.
- Upstream desktop release detection and PR preparation exist in local candidate
  `5d0b11f864bb142ae5ec94de3c083eebbc99e1dc`, which is not pushed or merged to the public
  default branch. They are not proven scheduled automation until published, enabled, and
  observed in a successful run.
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

These warnings do not turn the scoped desktop check into full release qualification.
