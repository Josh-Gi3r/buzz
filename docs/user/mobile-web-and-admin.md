# Mobile, web, and admin

Buzz does not promise feature parity across clients.

## Mobile

The Flutter client covers activity, channels, forum, home, invitations, device pairing, profile, Pulse, search, and settings. Desktop-only surfaces—including BUZZ — LIVE PREVIEW STUDIO—should not be inferred from shared event kinds or designs.

## Public web

The browser client has a deliberately narrow route set: home, invitation acceptance, repository lists, repository detail, and blob browsing. It is not a browser replacement for the desktop workspace.

## Admin

The admin SPA is a separately configured, private, read-only operational surface backed by relay admin routes. Its availability depends on deployment and operator authorization. Do not expose it publicly merely because the source is present.

BUZZ — LIVE PREVIEW STUDIO currently has no mobile, public-web, or admin implementation.
