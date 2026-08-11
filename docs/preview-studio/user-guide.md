# Preview Studio user guide

Preview Studio is the fork's local proofing room. Its complete production journey is an agent-posted website URL or an imported image, video, or local PDF. Comments, revision metadata, and decisions remain on this device.

## Open an agent's website

1. Have the agent or development process start the site.
2. Ask the recognized agent to post the complete `http://` or `https://` URL in Buzz.
3. Select **Open live preview** beneath the message.
4. Switch among **Desktop**, **Tablet**, and **Mobile** widths.
5. Use **Reload** or **Open in browser** when needed.

The Inspector collapses automatically to leave more width for a desktop page. Reopen it with **Inspector**.

Buzz does not run or host the development server. `localhost` and `127.0.0.1` refer to the computer running Buzz. Some sites block framing through CSP or `X-Frame-Options`.

Opening the same message updates its artifact. A changed URL creates a revision record and preserves feedback relationships, but Buzz does not snapshot the page bytes. The same URL may serve different content later.

## Import and review media

Select **Import** to add an image, video, or PDF. Local PDF framing accepts PDF `data:` or `blob:` sources. Imports no larger than 2.5 MB can persist as data URLs; larger object URLs last for the session only.

Use **Inspector** to add a comment or set **Pending**, **Approve**, or **Request changes**. Current UI paths create ordinary comments, slide anchors, and time anchors. The broader anchor/state taxonomy in the draft schema is not a complete shipped UI.

These actions do not send a Buzz message, notify the agent, or synchronize with teammates. Repeat actionable feedback in the conversation.

## Demonstrated engines

The repository showcase also exercises three genuine renderer engines with deterministic E2E fixtures:

| Engine | Demonstrated behavior | Production boundary |
|---|---|---|
| Static website | Rendered View/Split/Code modes and saved local source revision | No general production create/import path. |
| Reveal-style deck | Navigation, presentation, source editing, saved revision, slide anchor | No general production create/import path. |
| Image-slide deck | Navigation and PDF export | Separate from the editable Reveal deck; fixture ingress. |
| Film/cut | Playback, scene timing/order/visibility edits, time anchor, composition export | Uses fixture media; editing does not rerender the video in Buzz. |

Do not use these fixtures as proof that a user can import an arbitrary deck or film today.

## Generate media

OpenAI and Gemini image calls and a Higgsfield video CLI path are wired into the native app. They depend on external credentials, accounts, network access, model availability, pricing, and the local CLI where applicable. The pinned evidence validates UI state and fail-closed behavior, not a successful paid provider run.

Provider keys entered in Studio use renderer-local storage rather than the operating-system keyring. Prompts and inputs are sent to the selected provider. The explicit placeholder path does not run a model.

The film engine can export composition HTML. Buzz does not launch HyperFrames rendering; run an exported composition manually outside the app if appropriate.

## Storage and clearing

The library uses `buzz.previewStudio.library.v1` in renderer local storage. **Clear library** removes Studio artifacts, revisions, reviews, and decisions from this device store. It does not delete Buzz messages or relay data.

## Not shipped

- relay-backed artifacts or collaborative reviews;
- automatic feedback delivery to agents;
- immutable capture of live website content;
- hosting/lifecycle management for development servers;
- native iOS or Android sessions;
- general production ingestion for the static-site, deck, or film document engines;
- guaranteed persistence for large imports.

The event kinds under `docs/spec/` are proposals, not registered production kinds. See [Preview Studio architecture](../architecture/preview-studio.md) and [Known issues](../evidence/known-issues.md).
