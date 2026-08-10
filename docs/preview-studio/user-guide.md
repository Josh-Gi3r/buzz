# Preview Studio user guide

Preview Studio is Buzz's local proofing room for work made by agents or imported
from your computer. You can continue the conversation in Buzz, open the build an
agent shares, test it at desktop/tablet/mobile widths, leave revision-specific
feedback, and approve or request changes without pretending the preview is part
of the privileged Buzz interface.

> Preview Studio is enabled by default in this fork. Its library, comments, and
> decisions stay on this device; they are not synchronized through the relay.

## Open an agent's live build

1. Ask an agent to run the website or web app's development server.
2. Have the agent post its complete `http://` or `https://` URL in a Buzz
   channel—for example, `http://127.0.0.1:5173`.
3. Select **Open live preview** beneath the agent's message.
4. Buzz adds or updates that message's artifact and opens it in Preview Studio.

The live page receives the real iframe viewport, so its CSS media queries react
to the available width. Use **Desktop**, **Tablet**, or **Mobile** above the
stage to test common viewport widths. **Reload** refreshes the iframe; the
external-link button opens the same URL in your browser.

Live previews use the available Studio canvas. The Review Inspector collapses
automatically so a desktop build is not squeezed by the comments column. Select
**Inspector** in the header whenever you want to review the current revision.

If the agent stops its development server, Buzz cannot keep the site alive. Ask
the agent to restart it, then use **Reload**. A `127.0.0.1` or `localhost` URL
always refers to the computer running Buzz.

## Work with the library

The left rail contains artifacts saved on this device. Opening the same agent
message again updates its existing artifact rather than creating duplicates. If
the URL in that message changes, Buzz creates a new revision and keeps earlier
comments attached to the revision they describe.

| Action | How it works |
|---|---|
| Select work | Choose an artifact in the left rail |
| Import media | Select **Import**, then choose an image, video, or PDF |
| Remove work | Hover its library card and select the trash button |
| Inspect history | Open **Inspector**, then select a revision |
| Clear the library | Select **Clear library** and confirm |

The production app starts with an empty library. The wedding website, pricing
deck, film, and image catalog used in repository screenshots are deterministic
test fixtures; they are not inserted into a user's library.

## Preview and edit supported work

| Work | Current Preview Studio experience |
|---|---|
| Live website URL | Interactive sandboxed preview; desktop, tablet, and mobile widths; reload and open externally |
| Static website document | Sandboxed rendered site; View, Split, and Code modes; editable source with a saved revision |
| Deck | Slide navigation, presentation mode, source editing, export, and slide-anchored comments |
| Film document | Rendered film and Cut modes, timeline controls, scene timing/order/visibility edits, export, and time-anchored comments |
| Image | Full stage preview and click-to-expand lightbox |
| Video | Playback using Buzz's shared video player |
| PDF | Inline sandboxed preview for trusted local `data:` or `blob:` sources |

Android builds, iOS builds, generic files, and some declared artifact types have
fallback cards only. A fallback is not an emulator or a working native preview.

## Review a revision

1. Select **Inspector**.
2. Choose the revision you intend to review.
3. Enter a comment and select **Add review**.
4. Use the bottom decision strip to set **Pending**, **Approve**, or
   **Request changes**.

Deck comments record the visible slide. Film comments record the current time.
Ordinary comments remain attached to the exact revision being viewed. Reviews
and decisions are local today; send important feedback to the agent in the Buzz
conversation as well if it needs to act on it.

## Generate media

The **Generate** panel can create image or video artifacts when a supported
provider or installed media tool is available. The panel reports unavailable
tools and missing credentials instead of manufacturing a successful result.
Generated output becomes a normal local artifact with model provenance and a
pending decision.

Provider credentials entered in Preview Studio use the fork's local credential
handling. Do not paste credentials into a channel message, document, screenshot,
or repository file.

## Storage and privacy

- The library uses the desktop webview's local storage key
  `buzz.previewStudio.library.v1`.
- Preview Studio does not currently publish artifacts, reviews, or decisions to
  the Buzz relay.
- Imported files up to approximately 2.5 MB are stored as data URLs and survive
  a restart. Larger files use session object URLs and must be imported again.
- Live and static sites run in sandboxed iframes, separate from the privileged
  Buzz renderer. They do not receive signing keys or unrestricted Tauri IPC.
- A live preview can still make the network requests allowed by the website and
  its origin. Treat an unfamiliar preview URL like an unfamiliar website.

## Current boundaries

Preview Studio does **not** yet provide:

- relay-backed artifact or review synchronization;
- collaborative multi-user review state;
- native iOS or Android simulator streaming;
- a hosted deployment for an agent's local development server;
- guaranteed persistence for large imported files;
- automatic documentation or source-code comprehension by itself.

The proposed relay event model is documented in
[artifact kinds v0](../spec/artifact-kinds-v0.md), but those kinds are not
registered as production behavior.

## Development setup

From the repository root:

```bash
. ./bin/activate-hermit
cp .env.example .env
just setup
just desktop-dev   # desktop frontend
# or
just dev           # relay and desktop app
```

For an isolated development instance with separate app data, keyring entries,
and agent nest:

```bash
./scripts/run-studio-sandbox.sh
./scripts/run-studio-sandbox.sh --fresh
```

See the [artifact manifest](../spec/artifact-manifest-v1.md),
[review model](../spec/artifact-review-v1.md), and
[Preview Studio architecture](../design/architecture.md) for implementation
details.
