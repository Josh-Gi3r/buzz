# Data, security, and trust

## Signed collaboration state

Buzz clients sign Nostr events. Relay admission and delivery enforce community and kind-specific rules. Durable events and projections use Postgres; live/ephemeral paths can use Redis; media and git objects use configured storage.

Not every product datum is a signed relay event. Desktop private/local state, local archives, keyring material, provider/session data, and BUZZ — LIVE PREVIEW STUDIO local storage are explicit exceptions.

## Keys and credentials

Buzz identity keys use the operating-system keyring where available, with documented fallback behavior. BUZZ — LIVE PREVIEW STUDIO provider keys are different: they currently live in renderer-local storage. Environment-provided keys and external CLIs create additional process and deployment boundaries.

## Authorization

Authentication proves control of a signing key. Authorization additionally considers tenant, membership, kind, author, recipient, role, agent ownership/allowlist, result/shared access, and operator/admin policy. A matching subscription filter is insufficient by itself.

## Audit and compliance

The hash-chained audit log is optional and tamper-evident, not tamper-resistant against full database control. The source does not establish SOX, eDiscovery, or another compliance certification.

## Preview content

A live preview is untrusted site content inside a sandboxed iframe. It can make network requests permitted by its origin and browser policy. Buzz does not snapshot it, scan it into a trusted artifact, or enforce the draft manifest origin list as a complete network policy.

See [SECURITY.md](../../SECURITY.md) for reporting and operational guidance.
