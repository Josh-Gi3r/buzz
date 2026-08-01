import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  __emptySnapshotForTests,
  addReview,
  deleteArtifact,
  importLocalFile,
  isImportableType,
  loadLibrary,
  MAX_PERSISTED_DATA_URL_BYTES,
  setDecision,
} from "./store.ts";

// Minimal File polyfill for node tests
class FakeFile {
  constructor(parts, name, options = {}) {
    this.name = name;
    this.type = options.type || "";
    this.size = parts.reduce(
      (n, p) => n + (typeof p === "string" ? p.length : p.byteLength || 0),
      0,
    );
    this._parts = parts;
  }
}

// FileReader polyfill
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    constructor() {
      this.result = null;
      this.onload = null;
      this.onerror = null;
    }
    readAsDataURL(file) {
      queueMicrotask(() => {
        this.result = `data:${file.type || "application/octet-stream"};base64,ZmFrZQ==`;
        this.onload?.();
      });
    }
  };
}

if (typeof globalThis.localStorage === "undefined") {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}

// Override Node's Blob-only implementation so FakeFile works.
globalThis.URL.createObjectURL = () => "blob:test-object-url";
globalThis.URL.revokeObjectURL = () => {};

const STORAGE_KEY = "buzz.previewStudio.library.v1";

describe("artifact library store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("imports a file, adds review, sets decision, deletes", async () => {
    let snap = __emptySnapshotForTests();
    const file = new FakeFile(["hello"], "hero.png", { type: "image/png" });
    file.size = 10;

    const imported = await importLocalFile(snap, file);
    assert.equal(imported.persisted, true);
    snap = imported.snapshot;
    assert.equal(snap.artifacts.length, 1);
    assert.equal(snap.artifacts[0].artifactType, "image");
    assert.equal(snap.revisions.length, 1);
    const revId = snap.artifacts[0].currentRevisionId;
    assert.ok(revId);

    snap = addReview(snap, { revisionId: revId, body: "looks great" });
    assert.equal(snap.reviews.length, 1);
    assert.equal(snap.reviews[0].body, "looks great");

    snap = setDecision(snap, revId, "approved");
    assert.equal(
      snap.decisions.find((d) => d.revisionId === revId)?.status,
      "approved",
    );

    snap = deleteArtifact(snap, snap.artifacts[0].id);
    assert.equal(snap.artifacts.length, 0);
    assert.equal(snap.revisions.length, 0);
    assert.equal(snap.reviews.length, 0);
  });

  it("seeds demo artifacts on first load", () => {
    const snap = loadLibrary();
    assert.equal(snap.version, 1);
    assert.equal(snap.artifacts.length, 5);
    assert.ok(localStorage.getItem(STORAGE_KEY));
  });

  it("recovers from a corrupt payload and backs it up", () => {
    localStorage.setItem(STORAGE_KEY, "{corrupt");
    const snap = loadLibrary();
    assert.equal(snap.artifacts.length, 5);
    assert.equal(localStorage.getItem(`${STORAGE_KEY}.unreadable`), "{corrupt");
  });

  it("recovers from a version mismatch and backs the payload up", () => {
    const bogus = JSON.stringify({ version: 99, artifacts: "nope" });
    localStorage.setItem(STORAGE_KEY, bogus);
    const snap = loadLibrary();
    assert.equal(snap.artifacts.length, 5);
    assert.equal(localStorage.getItem(`${STORAGE_KEY}.unreadable`), bogus);
  });

  it("marks oversized imports ephemeral with an object URL", async () => {
    const file = new FakeFile([""], "big.mp4", { type: "video/mp4" });
    file.size = MAX_PERSISTED_DATA_URL_BYTES + 1;
    const { snapshot } = await importLocalFile(__emptySnapshotForTests(), file);
    const source = snapshot.revisions[0].manifest.source;
    assert.equal(source.kind, "local");
    assert.equal(source.uri, "blob:test-object-url");
    assert.equal(source.ephemeral, true);
  });

  it("blanks dead object URLs on reload so the stage shows a fallback", async () => {
    const file = new FakeFile([""], "big.mp4", { type: "video/mp4" });
    file.size = MAX_PERSISTED_DATA_URL_BYTES + 1;
    await importLocalFile(loadLibrary(), file);
    const reloaded = loadLibrary();
    const revision = reloaded.revisions.find(
      (r) => r.manifest.source.kind === "local",
    );
    assert.ok(revision);
    assert.equal(revision.manifest.source.uri, "");
  });

  it("maps unknown MIME types to generic_file and rejects them for import", async () => {
    const file = new FakeFile(["x"], "data.bin", {
      type: "application/x-thing",
    });
    file.size = 1;
    const { snapshot } = await importLocalFile(__emptySnapshotForTests(), file);
    assert.equal(snapshot.artifacts[0].artifactType, "generic_file");
    assert.equal(isImportableType("application/x-thing"), false);
    assert.equal(isImportableType("application/pdf"), true);
    assert.equal(isImportableType("image/png"), true);
  });

  it("overwrites rather than appends a reviewer decision", () => {
    let snap = __emptySnapshotForTests();
    snap = setDecision(snap, "rev-1", "approved");
    snap = setDecision(snap, "rev-1", "changes_requested");
    const rows = snap.decisions.filter((d) => d.revisionId === "rev-1");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, "changes_requested");
  });
});
