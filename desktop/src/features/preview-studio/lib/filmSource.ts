/**
 * A film is a HyperFrames composition, not just an MP4.
 *
 * The revision carries the cut — an ordered list of scenes with their
 * photograph, duration and title — and `buildCompositionHtml()` turns that cut
 * back into the exact HTML HyperFrames renders. Editing the cut therefore edits
 * real source: the MP4 beside it is one render of that source, not the artifact
 * itself.
 *
 * Rendering runs the `hyperframes` CLI on the machine (see lib/generation/
 * hyperframes.ts); the browser build can edit and preview the cut but cannot
 * launch a local binary.
 */

export type FilmScene = {
  /** Stable id, also the composition element id. */
  id: string;
  /** Chapter mark drawn over the photograph. Empty means no mark. */
  title: string;
  /** Photograph slot, resolved against the project's assets. */
  image: string;
  /** Seconds this scene is on screen, cross-dissolve included. */
  duration: number;
  /** Slow move applied to the still so a photograph still breathes. */
  motion: "push-in" | "pull-back" | "drift-left" | "drift-right" | "rise";
  /** Excluded from the cut without being deleted. */
  hidden?: boolean;
};

export type FilmDocument = {
  version: 1;
  width: number;
  height: number;
  fps: number;
  /** Cross-dissolve length between scenes, in seconds. */
  crossfade: number;
  title: string;
  kicker: string;
  endTitle: string;
  endKicker: string;
  scenes: FilmScene[];
  /** The render currently representing this cut, if one exists. */
  render?: {
    uri: string;
    /** Seconds — the duration of that render, which may predate an edit. */
    duration: number;
    renderedAt?: string;
    /** Cut hash the render was produced from; a mismatch means it is stale. */
    cutId?: string;
  };
};

export function isFilmDocument(value: unknown): value is FilmDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as FilmDocument;
  return doc.version === 1 && Array.isArray(doc.scenes);
}

/** Scenes in the cut, with their resolved start times. */
export function timeline(
  doc: FilmDocument,
): Array<FilmScene & { start: number }> {
  const out: Array<FilmScene & { start: number }> = [];
  let cursor = 0;
  for (const scene of doc.scenes) {
    if (scene.hidden) continue;
    out.push({ ...scene, start: cursor });
    cursor += scene.duration - doc.crossfade;
  }
  return out;
}

/** Total length of the cut in seconds. */
export function filmDuration(doc: FilmDocument): number {
  const scenes = timeline(doc);
  if (!scenes.length) return 0;
  const last = scenes[scenes.length - 1];
  return Number((last.start + last.duration).toFixed(2));
}

/**
 * A short stable id for the current cut. The render stores the id it was made
 * from, so the UI can say "this render is behind your edits" instead of quietly
 * showing stale footage.
 */
export function cutId(doc: FilmDocument): string {
  const shape = timeline(doc)
    .map((s) => `${s.id}:${s.image}:${s.duration}:${s.motion}:${s.title}`)
    .join("|");
  let hash = 0;
  for (let i = 0; i < shape.length; i++) {
    hash = (hash * 31 + shape.charCodeAt(i)) | 0;
  }
  return `cut_${(hash >>> 0).toString(36)}`;
}

export function isRenderStale(doc: FilmDocument): boolean {
  if (!doc.render) return true;
  return doc.render.cutId !== cutId(doc);
}

const MOTION: Record<
  FilmScene["motion"],
  { from: Record<string, number>; to: Record<string, number> }
> = {
  "push-in": { from: { scale: 1.0 }, to: { scale: 1.11 } },
  "pull-back": { from: { scale: 1.12 }, to: { scale: 1.0 } },
  "drift-left": {
    from: { scale: 1.06, xPercent: 1.5 },
    to: { scale: 1.06, xPercent: -1.5 },
  },
  "drift-right": {
    from: { scale: 1.06, xPercent: -1.5 },
    to: { scale: 1.06, xPercent: 1.5 },
  },
  rise: {
    from: { scale: 1.08, yPercent: 1.5 },
    to: { scale: 1.02, yPercent: -0.5 },
  },
};

/**
 * The cut, as the HyperFrames composition that renders it. Asset paths stay
 * relative (`assets/<slot>.jpg`) because the CLI renders from a project folder
 * where the photographs sit next to this file.
 */
export function buildCompositionHtml(doc: FilmDocument): string {
  const scenes = timeline(doc);
  const total = filmDuration(doc);

  const sections = scenes
    .map((scene, index) => {
      const isLast = index === scenes.length - 1;
      const mark = scene.title
        ? `\n          <p class="mark" id="${scene.id}-mark">${escapeHtml(scene.title)}</p>`
        : "";
      const type =
        index === 0
          ? `\n          <div class="type" id="${scene.id}-type">\n            <div class="rule"></div>\n            <h1>${escapeHtml(doc.title)}</h1>\n            <p class="kicker">${escapeHtml(doc.kicker)}</p>\n          </div>`
          : isLast
            ? `\n          <div class="type" id="${scene.id}-type">\n            <div class="rule"></div>\n            <h2>${escapeHtml(doc.endTitle)}</h2>\n            <p class="kicker">${escapeHtml(doc.endKicker)}</p>\n          </div>`
            : "";
      const wash = index === 0 ? "wash-bottom" : "wash-soft";
      return `      <section id="${scene.id}" class="clip${isLast ? " end" : ""}" data-start="${round(scene.start)}" data-duration="${round(scene.duration)}" data-track-index="${(index % 2) + 1}">
        <div class="fade" id="${scene.id}-fade">
          <div class="frame"><img class="ken" id="${scene.id}-img" src="assets/${scene.image}.jpg" alt="${escapeHtml(scene.title || doc.title)}" /></div>
          <div class="${wash}"></div>${mark}${type}
        </div>
      </section>`;
    })
    .join("\n\n");

  const script = scenes
    .map((scene) => {
      const motion = MOTION[scene.motion] ?? MOTION["push-in"];
      const out = round(scene.start + scene.duration - doc.crossfade);
      return `      tl.fromTo("#${scene.id}-fade", { opacity: 0 }, { opacity: 1, duration: ${doc.crossfade}, ease: "power2.out" }, ${round(scene.start)});
      tl.to("#${scene.id}-fade", { opacity: 0, duration: ${doc.crossfade}, ease: "power2.in" }, ${out});
      tl.fromTo("#${scene.id}-img", ${JSON.stringify(motion.from)}, { ...${JSON.stringify(motion.to)}, duration: ${round(scene.duration)}, ease: "none" }, ${round(scene.start)});${
        scene.title
          ? `\n      tl.fromTo("#${scene.id}-mark", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, ${round(scene.start + 0.5)});`
          : ""
      }`;
    })
    .join("\n");

  const first = scenes[0];
  const last = scenes[scenes.length - 1];
  const titles = [
    first
      ? `      tl.fromTo("#${first.id}-type", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, ${round(first.start + 0.9)});
      tl.to("#${first.id}-type", { opacity: 0, duration: 0.5, ease: "power2.in" }, ${round(first.start + first.duration - 0.9)});`
      : "",
    last && last !== first
      ? `      tl.fromTo("#${last.id}-type", { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, ${round(last.start + 1)});`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${doc.width}, height=${doc.height}" />
    <title>${escapeHtml(doc.title)}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${doc.width}px; height: ${doc.height}px; overflow: hidden; background: #11100e; }
      body { font-family: "Inter", sans-serif; }
      #root { position: relative; width: ${doc.width}px; height: ${doc.height}px; overflow: hidden; }
      .bed { position: absolute; inset: 0; background: #11100e; }
      .clip { position: absolute; inset: 0; overflow: hidden; }
      .fade { position: absolute; inset: 0; opacity: 0; }
      .frame { position: absolute; inset: 0; overflow: hidden; }
      .ken { display: block; width: ${doc.width}px; height: ${doc.height}px; object-fit: cover; transform-origin: center center; }
      .wash-bottom { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(17,16,14,0.78) 0%, rgba(17,16,14,0.10) 46%, rgba(17,16,14,0) 70%); }
      .wash-soft { position: absolute; inset: 0; background: linear-gradient(150deg, rgba(17,16,14,0.42) 0%, rgba(17,16,14,0.06) 55%, rgba(17,16,14,0.34) 100%); }
      .type { position: absolute; left: 132px; bottom: 128px; color: #fdfbf7; font-family: "EB Garamond", serif; }
      .type h1 { font-size: 118px; font-weight: 400; line-height: 1.02; letter-spacing: -0.015em; }
      .type h2 { font-size: 92px; font-weight: 400; line-height: 1.06; letter-spacing: -0.015em; }
      .type .kicker { font-family: "Inter", sans-serif; font-size: 24px; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(253,251,247,0.82); margin-top: 26px; }
      .rule { width: 92px; height: 1px; background: rgba(253,251,247,0.72); margin-bottom: 34px; }
      .mark { position: absolute; left: 132px; top: 118px; font-size: 22px; letter-spacing: 0.34em; text-transform: uppercase; color: rgba(253,251,247,0.86); }
      .end .type { left: 50%; bottom: auto; top: 50%; transform: translate(-50%, -50%); text-align: center; }
      .end .rule { margin: 0 auto 34px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${round(total)}" data-width="${doc.width}" data-height="${doc.height}">
      <div class="bed"></div>

${sections}
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

${script}

${titles}

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** The demo cut — the film that ships rendered in `public/demo`. */
export const DEMO_FILM: FilmDocument = {
  version: 1,
  width: 1920,
  height: 1080,
  fps: 30,
  crossfade: 0.7,
  title: "Elena Marsh",
  kicker: "Wedding photography · Lake Como",
  endTitle: "Days worth keeping.",
  endKicker: "elenamarsh.com",
  scenes: [
    {
      id: "scene-opening",
      title: "",
      image: "hero",
      duration: 5.4,
      motion: "pull-back",
    },
    {
      id: "scene-morning",
      title: "The morning",
      image: "gallery-1",
      duration: 4.2,
      motion: "push-in",
    },
    {
      id: "scene-ceremony",
      title: "The ceremony",
      image: "gallery-2",
      duration: 4.2,
      motion: "pull-back",
    },
    {
      id: "scene-details",
      title: "",
      image: "gallery-3",
      duration: 3.6,
      motion: "drift-right",
    },
    {
      id: "scene-evening",
      title: "The evening",
      image: "gallery-4",
      duration: 4.0,
      motion: "pull-back",
    },
    {
      id: "scene-archway",
      title: "",
      image: "deck-approach",
      duration: 3.8,
      motion: "rise",
    },
    {
      id: "scene-closing",
      title: "",
      image: "deck-closing",
      duration: 4.4,
      motion: "pull-back",
    },
  ],
  render: {
    uri: "/demo/elena-marsh-film.mp4",
    duration: 25.4,
    renderedAt: "2026-08-07T06:48:33.000Z",
    cutId: "",
  },
};

// The shipped render was produced from exactly this cut.
DEMO_FILM.render!.cutId = cutId(DEMO_FILM);
