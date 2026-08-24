# Security policy

This repository is an independent fork of [block/buzz](https://github.com/block/buzz). Please report vulnerabilities privately and include the affected commit, impact, and reproduction steps.

- For fork-added BUZZ — LIVE PREVIEW STUDIO code, use this repository's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability). Do not open a public issue.
- For unchanged upstream Buzz code, follow upstream's policy and email **buzz@block.xyz**.

Fork-owned security-sensitive paths include `desktop/src/features/preview-studio/`, `desktop/src/shared/theme/studio/`, `desktop/src-tauri/src/commands/media_tools.rs`, and `scripts/run-studio-sandbox.sh`. [FORK_PATCHES.md](FORK_PATCHES.md) records the complete fork boundary at the documented baseline.

## Supported versions

This fork is pre-1.0 and does not currently publish a long-term-support branch or immutable public release tag. Security support is therefore best effort on the repository's current maintained branch. Reports should name the exact commit rather than relying on a version label.

## Buzz trust model

### Authentication

Relay WebSocket clients authenticate using [NIP-42](https://github.com/nostr-protocol/nips/blob/master/42.md) challenge/response. Authenticated HTTP paths use signed Nostr authorization, including NIP-98 where the route requires it. Possession of a signing key establishes identity; it does not by itself authorize every read or write.

### Authorization

Community and channel membership are important gates, but they are not the complete authorization model. Relay paths also enforce kind-specific rules such as author-only, recipient, result, shared-memory, agent owner/allowlist, role, operator, and administrator checks. Delivery is re-authorized after filter matching; a matching subscription alone does not grant access.

Canonical behavior lives in `crates/buzz-core/src/kind.rs` and relay admission, request, and side-effect handlers. Deployments should validate their policy with the repository's conformance and integration suites.

### Audit logging

`buzz-audit` can write a SHA-256 hash-chained, tamper-evident log. It detects accidental corruption or edits that do not recompute the chain; it is not tamper-resistant against an attacker who controls the database. Auditing is configurable through relay settings including `BUZZ_AUDIT_ENABLED`, so operators must confirm it is enabled and retained for their deployment. This project does not claim a compliance certification.

### Desktop secrets

Buzz stores human and managed-agent private keys in the operating-system keyring when available. A restricted owner-only file is the fallback on systems without a usable keyring, and `BUZZ_PRIVATE_KEY` may supply an identity to harnessed agents or CI.

BUZZ — LIVE PREVIEW STUDIO provider credentials are a separate boundary: keys entered in its generation UI currently use renderer-local storage, not the operating-system keyring. Never place provider keys in chat, fixtures, screenshots, or repository files.

### BUZZ — LIVE PREVIEW STUDIO

- Live sites execute in a sandboxed iframe and can still run their own scripts and network requests.
- The frame receives no Buzz signing key or general relay token. The artifact manifest's origin policy is descriptive today, not a separately enforced allowlist.
- Packaged builds permit HTTP(S) frames. Sites may refuse embedding through CSP or `X-Frame-Options`.
- Local PDFs are restricted to `data:application/pdf` and `blob:` sources.
- Native media execution uses an allowlist in `desktop/src-tauri/src/commands/media_tools.rs`; successful provider/tool use still depends on the local installation and account.
- Artifacts, comments, and decisions are stored in renderer local storage and are not relay-synchronized.

Treat an unfamiliar preview URL like an unfamiliar website. Use **Open in browser** if framing fails, but understand that doing so leaves the iframe boundary.

### Input and network safeguards

The codebase contains UUID validation at API boundaries, SSRF checks for workflow webhook targets, response-size limits, bounded workflow condition evaluation, and URL encoding. These controls are path-specific; do not infer that every external integration is safe without tracing its actual call path.

Production deployments should terminate TLS at the relay or an upstream proxy. The relay intentionally supports operation behind load balancers and does not make a blanket TLS guarantee itself.

## Dependency and unsafe-code claims

Many Rust crates deny unsafe code, and CI runs the checks declared in `.github/workflows/` and the repository tasks. The repository does not currently contain a verified blanket `cargo audit` CI step, and it has platform-specific unsafe allowances. Security documentation must not claim otherwise.

## Coordinated disclosure

Give maintainers reasonable time to investigate before disclosure. Do not access data that is not yours, disrupt services, or perform denial-of-service testing. Upstream's response targets and disclosure decisions apply only to reports accepted by upstream; this independent fork does not promise those timelines on Block's behalf.
