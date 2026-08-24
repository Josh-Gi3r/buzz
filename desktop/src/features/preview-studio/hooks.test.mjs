import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
});
const values = new Map();
let rejectWrites = false;
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => {
    if (rejectWrites) throw new DOMException("quota", "QuotaExceededError");
    values.set(key, String(value));
  },
  removeItem: (key) => values.delete(key),
  clear: () => values.clear(),
};

before(() => {
  Object.assign(globalThis, {
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    localStorage: storage,
    window: dom.window,
  });
});

beforeEach(() => {
  rejectWrites = false;
  values.clear();
});

after(() => dom.window.close());

test("generated artifact results are available synchronously after an existing artifact", async () => {
  const { act, cleanup, renderHook } = await import("@testing-library/react");
  const { useArtifactLibrary } = await import("./hooks.ts");
  const { result, unmount } = renderHook(() => useArtifactLibrary());

  try {
    let first;
    let second;
    act(() => {
      first = result.current.addGenerated({
        dataUrl: "data:image/png;base64,Zmlyc3Q=",
        mime: "image/png",
        title: "First",
        model: "test",
      });
      second = result.current.addGenerated({
        dataUrl: "data:image/png;base64,c2Vjb25k",
        mime: "image/png",
        title: "Second",
        model: "test",
      });
    });

    assert.equal(first.persisted, true);
    assert.ok(first.artifactId);
    assert.equal(second.persisted, true);
    assert.ok(second.artifactId);
    assert.notEqual(second.artifactId, first.artifactId);
    assert.equal(result.current.library.artifacts.length, 2);
    assert.equal(result.current.library.artifacts[0].id, second.artifactId);
  } finally {
    unmount();
    cleanup();
  }
});

test("generated video reports a storage quota failure synchronously", async () => {
  const { act, cleanup, renderHook } = await import("@testing-library/react");
  const { useArtifactLibrary } = await import("./hooks.ts");
  const { result, unmount } = renderHook(() => useArtifactLibrary());

  try {
    rejectWrites = true;
    let persisted;
    act(() => {
      persisted = result.current.addGeneratedVid({
        url: "https://example.com/generated.mp4",
        title: "Generated clip",
        model: "test",
      });
    });

    assert.equal(persisted, false);
    assert.equal(result.current.library.artifacts.length, 1);
  } finally {
    unmount();
    cleanup();
  }
});
