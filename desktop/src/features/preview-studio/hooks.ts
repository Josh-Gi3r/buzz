import * as React from "react";

import {
  addGeneratedImage,
  addReview,
  deleteArtifact,
  importLocalFile,
  isImportableType,
  loadLibrary,
  resetLibraryToSeed,
  saveSourceRevision,
  setDecision,
  type ArtifactLibrarySnapshot,
} from "./lib/store";
import type { DecisionStatus } from "./lib/types";

export type ImportFilesResult = {
  snapshot: ArtifactLibrarySnapshot;
  /** False when the library could not be written to device storage. */
  persisted: boolean;
};

export function useArtifactLibrary() {
  const [library, setLibrary] = React.useState<ArtifactLibrarySnapshot>(() =>
    loadLibrary(),
  );

  const importFiles = React.useCallback(
    async (files: FileList | File[]): Promise<ImportFilesResult> => {
      const list = Array.from(files);
      let snap = loadLibrary();
      let persisted = true;
      for (const file of list) {
        if (!isImportableType(file.type)) continue;
        const result = await importLocalFile(snap, file);
        snap = result.snapshot;
        persisted &&= result.persisted;
      }
      setLibrary(snap);
      return { snapshot: snap, persisted };
    },
    [],
  );

  const remove = React.useCallback((artifactId: string) => {
    setLibrary((prev) => deleteArtifact(prev, artifactId));
  }, []);

  const review = React.useCallback(
    (revisionId: string, body: string, timeMs?: number, slide?: number) => {
      setLibrary((prev) =>
        addReview(prev, { revisionId, body, timeMs, slide }),
      );
    },
    [],
  );

  const decide = React.useCallback(
    (revisionId: string, status: DecisionStatus) => {
      setLibrary((prev) => setDecision(prev, revisionId, status));
    },
    [],
  );

  const saveDeck = React.useCallback((revisionId: string, deck: unknown) => {
    setLibrary((prev) => saveSourceRevision(prev, revisionId, { deck }));
  }, []);

  const addGenerated = React.useCallback(
    (input: {
      dataUrl: string;
      mime: string;
      title: string;
      model: string;
    }) => {
      setLibrary((prev) => addGeneratedImage(prev, input));
    },
    [],
  );

  const saveWeb = React.useCallback((revisionId: string, web: unknown) => {
    setLibrary((prev) => saveSourceRevision(prev, revisionId, { web }));
  }, []);

  const reset = React.useCallback(() => {
    setLibrary(resetLibraryToSeed());
  }, []);

  return {
    library,
    importFiles,
    remove,
    review,
    decide,
    saveDeck,
    saveWeb,
    addGenerated,
    reset,
  };
}
