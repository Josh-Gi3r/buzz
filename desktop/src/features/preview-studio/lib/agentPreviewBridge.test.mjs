import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

import { extractPreviewUrl, upsertAgentPreview } from "./agentPreviewBridge.ts";

const values = new Map();
globalThis.localStorage = {
  clear: () => values.clear(),
  getItem: (key) => values.get(key) ?? null,
  removeItem: (key) => values.delete(key),
  setItem: (key, value) => values.set(key, String(value)),
};

beforeEach(() => values.clear());

describe("agent preview URL handoff", () => {
  test("extracts an HTTP URL from Markdown prose without trailing punctuation", () => {
    assert.equal(
      extractPreviewUrl("Ready: [open it](http://localhost:4173/demo)."),
      "http://localhost:4173/demo",
    );
  });

  test("rejects credentials and non-HTTP links", () => {
    assert.equal(extractPreviewUrl("file:///tmp/site/index.html"), null);
    assert.equal(extractPreviewUrl("https://user:secret@example.com"), null);
  });

  test("persists one artifact per message and reuses it on restart", () => {
    const first = upsertAgentPreview({
      messageId: "message-1",
      author: "Builder",
      authorPubkey: "abc123",
      channelId: "channel-1",
      url: "http://127.0.0.1:3000/",
    });
    const second = upsertAgentPreview({
      messageId: "message-1",
      author: "Builder",
      authorPubkey: "abc123",
      channelId: "channel-1",
      url: "http://127.0.0.1:3000/",
    });

    assert.equal(first.persisted, true);
    assert.equal(second.artifactId, first.artifactId);
    assert.equal(
      second.snapshot.artifacts.filter((item) => item.id === first.artifactId)
        .length,
      1,
    );
    assert.equal(
      second.snapshot.revisions.filter(
        (item) => item.artifactId === first.artifactId,
      ).length,
      1,
    );
    assert.equal(
      second.snapshot.artifacts[0].currentRevisionId,
      first.snapshot.artifacts[0].currentRevisionId,
    );
  });

  test("an edited message URL creates a review-safe revision", () => {
    const first = upsertAgentPreview({
      messageId: "message-2",
      author: "Builder",
      url: "http://localhost:3000/",
    });
    const second = upsertAgentPreview({
      messageId: "message-2",
      author: "Builder",
      url: "http://localhost:3001/",
    });

    assert.equal(second.artifactId, first.artifactId);
    assert.equal(
      second.snapshot.revisions.filter(
        (item) => item.artifactId === first.artifactId,
      ).length,
      2,
    );
    assert.notEqual(
      second.snapshot.artifacts[0].currentRevisionId,
      first.snapshot.artifacts[0].currentRevisionId,
    );
  });
});
