# Artifact Review v1 (draft)

**Status:** draft — implement domain types against this; relay kinds TBD  
**Depends on:** [artifact-manifest-v1.md](./artifact-manifest-v1.md); kind allocation in [artifact-kinds-v0.md](./artifact-kinds-v0.md)  

## Universal anchor

Coordinates are normalized 0–1 where spatial. Always name a `revisionId`.

```ts
interface ReviewAnchorV1 {
  revisionId: string;
  timeMs?: number;
  frame?: number;
  page?: number; // 1-based in UI
  slide?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  route?: string;
  viewport?: string; // e.g. iphone-15-pro
  selector?: string;
  elementRef?: string;
  state?: string; // application state snapshot id
  renderer?: string;
}
```

## Review states

- `open`
- `resolved`
- `reopened`

## Decisions (separate from comments)

- `pending`
- `approved`
- `changes_requested`

## Adapters (existing Buzz)

| Existing | Maps to |
|----------|---------|
| Video timecoded comments | `timeMs` / `frame` |
| Project line comments | future `path` + line (code) — not Preview Studio v0 |
| Image regions | `x,y,width,height` |

Do not rewrite historical event shapes; adapt at read time when bridging.
