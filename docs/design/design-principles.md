# Design Principles

Interaction and visual-system principles for Preview Studio and the Studio visual profile.
Everything in this document is a **proposed target** unless the
[feature truth matrix](../product/feature-matrix.md) says otherwise. The current local
Studio does not have an artifact board, automatic agent context, shared review publishing,
or relay-backed project memory.

## Interaction model

### The canvas is the working surface; conversation is the context spine

Existing Buzz conversations, memory and channel history are never displaced. The artifact
workspace hangs off the channel/project structure:

```text
Buzz community
└── Channel / DM / Project
    ├── Conversation history
    ├── Agents and durable memory
    ├── Artifact board
    │   ├── Live sessions
    │   ├── Immutable revisions
    │   ├── Design explorations
    │   └── Review threads
    └── Decisions, approvals and handoffs
```

**Proposed:** the artifact board would read current channel/thread context and publish
important decisions, revisions, and handoffs back into Buzz. The shipped local Studio does
not do this.

### Selection is the most important AI input

The user should be able to select a button in a live web preview, a layer in an image, a
video time range, a slide, a PDF region, a device viewport, a set of board objects, or a
review comment cluster — and then issue an instruction scoped to that selection ("make this
more premium," "fix only the mobile layout," "apply the accepted comments"). **Proposed:** a
future AI request would carry selected object identifiers, revision, surrounding context,
design tokens, and permission scope. No automatic selection-to-agent context path ships today.

### AI changes are proposed as operations, not magic replacement

Every meaningful AI change exposes: what it intends to change; which objects or files it will
touch; a preview or diff; the generated branch/revision; a way to accept, reject or partially
apply; provenance (model, agent, prompt/context reference, tool actions); and undo or
branch-back.

### AI progress is visible without becoming noise

A compact agent activity model: planning, reading context, generating, rendering, testing,
waiting for input, blocked, completed. Raw chain-of-thought is not streamed; show
user-relevant progress, evidence, actions and results.

### Layered output wherever the format permits

Preferred output order:

1. Structured component or scene representation.
2. Editable document/deck representation.
3. Source-linked web/application representation.
4. Vector or stateful animation representation.
5. Final rendered media.
6. Flat screenshot only as fallback.

### Memory is explicit and controllable

Three types of memory remain distinct: **conversation memory** (current channel/thread
history), **project memory** (design system, brand, codebase, files, accepted decisions), and
**user preference memory** (personal visual preferences and working style). The user can
inspect, correct, pin and delete memory. AI never silently treats an abandoned experiment as
an approved standard.

## Visual system

### Interpreting glass materials correctly

Translucent "glass" is a functional layer above content — primarily for navigation and
controls — not a texture to put behind every card and paragraph.

Use glass for: global top chrome, the command palette, floating toolbars, inspector headers,
selected-object actions, playback controls, contextual menus, temporary agent controls, and
presence surfaces.

Use more opaque surfaces for: long text, code, dense tables, timelines, settings forms,
comments, and accessibility-critical content.

References:

- [Apple Human Interface Guidelines — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Microsoft Fluent 2 — Materials](https://fluent2.microsoft.design/material)

### Material stack

- **Base layer** — animated mesh or grain gradient; very low-frequency movement; optional
  subtle shader noise; no content-sensitive refraction.
- **Structural layer** — opaque or near-opaque work surfaces; optical borders; inner
  highlights and depth; consistent elevation tokens.
- **Glass layer** — backdrop blur, saturation adjustment, tint, edge highlight; limited
  refraction reserved for flagship controls; performance and accessibility fallbacks.
- **Light layer** — accent bloom, focus halo, presence and agent state, selection energy.
  Avoid constant neon glow.

### Motion grammar

Motion (the animation library Buzz already uses) is the default engine.

Categories:

- **Immediate:** 80–140 ms for press, hover and focus response.
- **Interface:** 160–260 ms for menus, panels, selection and route changes.
- **Spatial:** 300–520 ms for canvas focus, board transitions and artifact expansion.
- **Agent/state:** spring-based, interruptible and progressive.
- **Ambient:** seconds, subtle and low-frequency.

Rules:

- Motion follows spatial causality.
- Every object has a stable identity across transitions.
- Interruptions are graceful.
- No arbitrary stagger on routine lists.
- Reduced-motion mode replaces translation/zoom with opacity and instant state changes.
- Blur animation is expensive: animate opacity and transforms around a stable blur where
  possible.
