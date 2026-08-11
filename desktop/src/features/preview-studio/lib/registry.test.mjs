import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  listRenderers,
  registerBuiltinRenderers,
  resolveRenderer,
} from "./registry.ts";

describe("preview-studio renderer registry", () => {
  it("registers builtins and resolves image/video", () => {
    registerBuiltinRenderers();
    assert.equal(listRenderers().length, 11);

    const image = resolveRenderer({
      schemaVersion: 1,
      artifactId: "a",
      revisionId: "r",
      title: "t",
      artifactType: "image",
      source: { kind: "url", url: "https://example.invalid" },
    });
    assert.equal(image?.id, "image");

    const video = resolveRenderer({
      schemaVersion: 1,
      artifactId: "a",
      revisionId: "r",
      title: "t",
      artifactType: "video",
      source: { kind: "url", url: "https://example.invalid" },
    });
    assert.equal(video?.id, "video");
  });
});
