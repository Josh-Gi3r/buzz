import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveDisplayUri } from "./resolveDisplayUri.ts";

describe("resolveDisplayUri", () => {
  it("prefers stream rendition over source", () => {
    const uri = resolveDisplayUri({
      schemaVersion: 1,
      artifactId: "a",
      revisionId: "r",
      title: "t",
      artifactType: "video",
      source: { kind: "url", url: "https://example.invalid/src.mp4" },
      renditions: [
        { role: "thumbnail", uri: "https://example.invalid/thumb.jpg" },
        { role: "stream", uri: "https://example.invalid/stream.mp4" },
      ],
    });
    assert.equal(uri, "https://example.invalid/stream.mp4");
  });

  it("prefers interactive rendition over poster", () => {
    const uri = resolveDisplayUri({
      schemaVersion: 1,
      artifactId: "a",
      revisionId: "r",
      title: "t",
      artifactType: "web_app",
      source: { kind: "url", url: "https://example.invalid/src" },
      renditions: [
        { role: "poster", uri: "https://example.invalid/poster.jpg" },
        { role: "interactive", uri: "https://example.invalid/app/" },
      ],
    });
    assert.equal(uri, "https://example.invalid/app/");
  });

  it("falls back to local then url", () => {
    assert.equal(
      resolveDisplayUri({
        schemaVersion: 1,
        artifactId: "a",
        revisionId: "r",
        title: "t",
        artifactType: "image",
        source: { kind: "local", uri: "data:image/png;base64,xx" },
      }),
      "data:image/png;base64,xx",
    );
    assert.equal(
      resolveDisplayUri({
        schemaVersion: 1,
        artifactId: "a",
        revisionId: "r",
        title: "t",
        artifactType: "image",
        source: { kind: "url", url: "https://example.invalid/i.png" },
      }),
      "https://example.invalid/i.png",
    );
  });

  it("returns undefined when empty", () => {
    assert.equal(
      resolveDisplayUri({
        schemaVersion: 1,
        artifactId: "a",
        revisionId: "r",
        title: "t",
        artifactType: "image",
        source: { kind: "local", uri: "" },
      }),
      undefined,
    );
  });
});
