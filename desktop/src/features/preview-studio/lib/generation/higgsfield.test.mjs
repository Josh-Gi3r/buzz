import assert from "node:assert/strict";
import { describe, it } from "node:test";

// The Tauri bridge is absent in unit tests; stub it before importing.
globalThis.window = globalThis;

const MODEL_TABLES = {
  seedance_2_0: [
    "PARAM  TYPE  DEFAULT",
    "generate_audio  boolean  true",
    "duration  integer  5",
  ].join("\n"),
  kling3_0: [
    "PARAM  TYPE  DEFAULT",
    "sound  on,off  on",
    "duration  integer  5",
  ].join("\n"),
  veo3_1: ["PARAM  TYPE  DEFAULT", "duration  4,6,8  8"].join("\n"),
  video_upscale: ["PARAM  TYPE  DEFAULT", "scale  integer  2"].join("\n"),
};

globalThis.__TAURI_INTERNALS__ = {
  invoke: async (cmd, payload) => {
    if (cmd === "media_tool_available") return true;
    const args = payload.args ?? [];
    if (args[0] === "model" && args[1] === "get") {
      const table = MODEL_TABLES[args[2]];
      return table
        ? { ok: true, code: 0, stderr: "", stdout: table }
        : {
            ok: false,
            code: 1,
            stderr: `unknown model ${args[2]}`,
            stdout: "",
          };
    }
    return { ok: false, code: 1, stderr: "unexpected call", stdout: "" };
  },
};

const { resolveAudioMode } = await import("./higgsfield.ts");

describe("higgsfield audio policy", () => {
  it("uses the model's own audio flag when it has one", async () => {
    assert.deepEqual(await resolveAudioMode("seedance_2_0"), {
      kind: "flag",
      name: "generate_audio",
      on: "true",
    });
    assert.deepEqual(await resolveAudioMode("kling3_0"), {
      kind: "flag",
      name: "sound",
      on: "on",
    });
  });

  it("accepts models whose audio is always on", async () => {
    assert.deepEqual(await resolveAudioMode("veo3_1"), { kind: "always" });
  });

  it("refuses a model that cannot produce audio in the same pass", async () => {
    await assert.rejects(
      () => resolveAudioMode("video_upscale"),
      /never generated separately and never dubbed/,
    );
  });
});
