# BUZZ — LIVE PREVIEW STUDIO

BUZZ — LIVE PREVIEW STUDIO keeps an agent's build and the Buzz conversation close together. Its production handoff begins when a recognized agent posts a safe HTTP(S) URL. Buzz creates or updates a device-local website artifact and opens that URL in a sandboxed responsive frame.

## Shipped production journey

1. A configured agent or another reachable development process starts a website server.
2. The recognized agent posts its complete URL in a Buzz message.
3. **Open live preview** appears below the message.
4. BUZZ — LIVE PREVIEW STUDIO frames the page at desktop, tablet, or mobile width.
5. The user can reload, open externally, add local feedback, and record a local decision.

Buzz does not start, discover, host, or keep the development server alive. Hot updates depend on the website's own development tooling. A localhost URL refers to the computer running Buzz.

The revision record preserves URL metadata and feedback relationships. It does not capture immutable page bytes, so “exact revision” must not be used for live content.

## Other production ingress

Users can import images, videos, and local PDFs. Imports no larger than 2.5 MB can persist as data URLs; larger files use session object URLs. Provider generation can also add media when its external credentials, account, network, and tool are available, but successful OpenAI, Gemini, or Higgsfield runs have not been recorded as release evidence for this baseline.

## Demonstrated renderer engines

Static website, deck, and film documents have genuine render/edit code and focused acceptance tests. Their current showcase data comes from `lib/demoCatalog.ts` in E2E mode. Production `loadLibrary()` starts from an empty snapshot and exposes no general create/import path for those document types.

- The editable Reveal-style deck supports source edits, presentation, and saved local revisions.
- A separate image-slide deck renderer supports PDF export. These are not one combined workflow.
- The film editor works with fixture media, exports composition source, and can make the existing video render stale after edits. The desktop does not invoke HyperFrames to rerender it.

These engines are useful implementation foundations, not yet complete production journeys.

## Local review model

Artifacts are logical library items; revisions carry their source metadata. Reviews and decisions point to a revision. The current UI creates ordinary comments, time anchors for film/video contexts, and slide anchors for decks. It does not expose the complete review state and anchor taxonomy declared by the draft types.

All of this state lives in renderer local storage. It is not published to the relay, synchronized with teammates, or delivered automatically to the agent. Important feedback must still be placed in the Buzz conversation.

## Trust boundary

Live pages execute their own scripts and network requests inside an iframe sandbox. They receive no signing key, general relay token, or unrestricted Tauri capability. The manifest's `allowedOrigins` field is descriptive at this baseline rather than an enforced network gate. Sites may refuse embedding through browser security headers.

Provider keys entered through BUZZ — LIVE PREVIEW STUDIO currently use renderer-local storage rather than the operating-system keyring. Generation prompts and inputs leave the device for the chosen provider.

See the [user guide](../preview-studio/user-guide.md), [architecture](../architecture/preview-studio.md), and [known issues](../evidence/known-issues.md).
