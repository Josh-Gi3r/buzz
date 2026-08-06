/**
 * A website artifact is source, not a screenshot.
 *
 * Files live on the revision so the markup and styles stay editable and
 * reviewable. The stage runs them in a sandboxed origin — see
 * docs/design/architecture.md for the isolation rules.
 */

import { PHOTOGRAPHER_SITE_FILES } from "./demo/photographerSite";

export type WebFiles = Record<string, string>;

export type WebDocument = {
  version: 1;
  /** Sandpack template id: "static" for plain HTML/CSS/JS, "react" for JSX. */
  template: "static" | "react" | "vanilla";
  entry: string;
  files: WebFiles;
};

export function isWebDocument(value: unknown): value is WebDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as WebDocument;
  return (
    doc.version === 1 &&
    typeof doc.entry === "string" &&
    !!doc.files &&
    typeof doc.files === "object"
  );
}

export const DEMO_WEBSITE: WebDocument = {
  version: 1,
  template: "static",
  entry: "/index.html",
  files: PHOTOGRAPHER_SITE_FILES,
};
