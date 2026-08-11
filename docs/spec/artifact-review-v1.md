# Artifact Review v1 proposal

**Status:** proposed shared review contract; not shipped relay behavior.

Current BUZZ — LIVE PREVIEW STUDIO reviews are device-local. Shipped UI paths create ordinary comments,
slide anchors, and time anchors, with pending, approved, and changes-requested decisions. The
UI does not provide the full universal anchor taxonomy or resolved/reopened lifecycle below.

## Proposed universal anchor

A future anchor may combine a revision ID with time/frame, page/slide, normalized spatial
coordinates, route/viewport, stable selector/element reference, state snapshot, and renderer.
Coordinates should be normalized and page/slide presentation rules must be explicit.

## Proposed lifecycle

- open;
- resolved; and
- reopened.

Decisions remain distinct: pending, approved, and changes requested.

Existing video time comments and project line comments should be adapted at read time rather
than rewriting event history. No adapter is claimed until its source and round-trip tests
exist.
