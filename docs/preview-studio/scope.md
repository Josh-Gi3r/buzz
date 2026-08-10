# Preview Studio scope

This file originally defined the first local-only Preview Studio milestone. That
milestone has been surpassed. For the current product surface, use the
[capability matrix](../product/capabilities.md) and
[user guide](user-guide.md).

## Current implemented scope

Preview Studio is enabled by default in this fork and provides:

1. A device-local artifact library with imports for images, videos, and PDFs.
2. Agent-authored URL handoff into a live, responsive website preview.
3. Static website, HTML deck, and film-composition preview/editing paths.
4. Revision-specific comments, slide/time anchors, and decisions.
5. Optional image and video generation through configured external tools.

The production library starts empty. Wedding, deck, film, and image examples
used for documentation are deterministic E2E fixtures only.

## Still outside the implemented scope

- Relay kind registration and multi-user review sync.
- Automatic delivery of Preview Studio feedback to an agent conversation.
- iOS or Android emulator/simulator sessions.
- Hosting or lifecycle management for an agent's development server.
- A separate public distribution identity and update channel.

No artifact event kinds are registered in `buzz-core`, and Preview Studio adds
no relay or database migration in the current fork. The proposals under
[`docs/spec`](../spec/) remain designs for a future collaborative protocol.
