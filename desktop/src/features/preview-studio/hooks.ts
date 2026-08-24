import * as React from "react";

import {
  addGeneratedImage,
  addGeneratedVideo,
  addReview,
  deleteArtifact,
  importLocalFile,
  isImportableType,
  loadLibrary,
  resetLibrary,
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
  const libraryRef = React.useRef(library);

  const replaceLibrary = React.useCallback(
    (
      update:
        | ArtifactLibrarySnapshot
        | ((previous: ArtifactLibrarySnapshot) => ArtifactLibrarySnapshot),
    ) => {
      const next =
        typeof update === "function" ? update(libraryRef.current) : update;
      libraryRef.current = next;
      setLibrary(next);
      return next;
    },
    [],
  );

  const importFiles = React.useCallback(
    async (files: FileList | File[]): Promise<ImportFilesResult> => {
      const list = Array.from(files);
      let snap = libraryRef.current;
      let persisted = true;
      for (const file of list) {
        if (!isImportableType(file.type)) continue;
        const result = await importLocalFile(snap, file);
        snap = result.snapshot;
        persisted &&= result.persisted;
      }
      replaceLibrary(snap);
      return { snapshot: snap, persisted };
    },
    [replaceLibrary],
  );

  const remove = React.useCallback(
    (artifactId: string) => {
      replaceLibrary((prev) => deleteArtifact(prev, artifactId));
    },
    [replaceLibrary],
  );

  const review = React.useCallback(
    (revisionId: string, body: string, timeMs?: number, slide?: number) => {
      replaceLibrary((prev) =>
        addReview(prev, { revisionId, body, timeMs, slide }),
      );
    },
    [replaceLibrary],
  );

  const decide = React.useCallback(
    (revisionId: string, status: DecisionStatus) => {
      replaceLibrary((prev) => setDecision(prev, revisionId, status));
    },
    [replaceLibrary],
  );

  const saveDeck = React.useCallback(
    (revisionId: string, deck: unknown) => {
      replaceLibrary((prev) => saveSourceRevision(prev, revisionId, { deck }));
    },
    [replaceLibrary],
  );

  const addGenerated = React.useCallback(
    (input: {
      dataUrl: string;
      mime: string;
      title: string;
      model: string;
    }): { persisted: boolean; artifactId?: string } => {
      const result = addGeneratedImage(libraryRef.current, input);
      replaceLibrary(result.snapshot);
      return {
        persisted: result.persisted,
        artifactId: result.snapshot.artifacts[0]?.id,
      };
    },
    [replaceLibrary],
  );

  const addGeneratedVid = React.useCallback(
    (input: { url: string; title: string; model: string }): boolean => {
      const result = addGeneratedVideo(libraryRef.current, input);
      replaceLibrary(result.snapshot);
      return result.persisted;
    },
    [replaceLibrary],
  );

  const saveFilm = React.useCallback(
    (revisionId: string, film: unknown) => {
      replaceLibrary((prev) => saveSourceRevision(prev, revisionId, { film }));
    },
    [replaceLibrary],
  );

  const saveWeb = React.useCallback(
    (revisionId: string, web: unknown) => {
      replaceLibrary((prev) => saveSourceRevision(prev, revisionId, { web }));
    },
    [replaceLibrary],
  );

  const reset = React.useCallback(() => {
    replaceLibrary(resetLibrary());
  }, [replaceLibrary]);

  return {
    library,
    importFiles,
    remove,
    review,
    decide,
    saveDeck,
    saveFilm,
    saveWeb,
    addGenerated,
    addGeneratedVid,
    reset,
  };
}
