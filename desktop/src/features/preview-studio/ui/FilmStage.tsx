import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Eye,
  EyeOff,
  Film,
  Minus,
  Pause,
  Play,
  Plus,
  Download,
  Scissors,
} from "lucide-react";
import * as React from "react";

import { REAL_PHOTOGRAPHS } from "../lib/demo/photographs";
import {
  buildCompositionHtml,
  cutId,
  type FilmDocument,
  type FilmScene,
  filmDuration,
  isRenderStale,
  timeline,
} from "../lib/filmSource";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

type Mode = "film" | "cut";

const MOTIONS: FilmScene["motion"][] = [
  "push-in",
  "pull-back",
  "drift-left",
  "drift-right",
  "rise",
];

/** Photograph for a scene slot, as a data URI the preview frame can load. */
function scenePhoto(slot: string): string | undefined {
  return REAL_PHOTOGRAPHS[`images/${slot}.jpg`];
}

/** The composition, with `assets/x.jpg` swapped for pixels the frame can read. */
function inlineAssets(html: string): string {
  return html.replace(/src="assets\/([^"]+)\.jpg"/g, (whole, slot: string) => {
    const uri = scenePhoto(slot);
    return uri ? `src="${uri}"` : whole;
  });
}

/**
 * Preview-only chrome. The composition is authored at its true pixel size, so
 * the frame scales it to fit rather than cropping it. This is injected into the
 * preview copy only — the source `buildCompositionHtml()` hands to the renderer
 * stays exactly as it will be rendered.
 */
const FIT_TO_FRAME = `
<style>
  html, body { width: 100%; height: 100%; overflow: hidden; background: #11100e; }
  #root { position: absolute; top: 0; left: 0; transform-origin: top left; }
</style>
<script>
  (function () {
    function fit() {
      const root = document.getElementById("root");
      if (!root) return;
      const w = Number(root.dataset.width) || root.offsetWidth;
      const h = Number(root.dataset.height) || root.offsetHeight;
      const scale = Math.min(window.innerWidth / w, window.innerHeight / h);
      root.style.transform =
        "translate(" + ((window.innerWidth - w * scale) / 2) + "px," +
        ((window.innerHeight - h * scale) / 2) + "px) scale(" + scale + ")";
    }
    window.addEventListener("resize", fit);
    window.addEventListener("load", fit);
    fit();
  })();
</script>
`;

/** Drives the paused HyperFrames timeline from the stage's transport. */
const SEEK_BRIDGE = `
<script>
  window.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.type !== "hf-seek") return;
    const tl = (window.__timelines || {}).main;
    if (!tl) return;
    tl.pause();
    tl.seek(data.time);
  });
  window.addEventListener("load", () => {
    const tl = (window.__timelines || {}).main;
    if (tl) { tl.pause(); tl.seek(0); }
    parent.postMessage({ type: "hf-ready" }, "*");
  });
</script>
`;

function timecode(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${String(m).padStart(2, "0")}:${rest.toFixed(1).padStart(4, "0")}`;
}

export function FilmStage({
  title,
  doc,
  onSave,
  onTimeChange,
  className,
}: {
  title: string;
  doc: FilmDocument;
  onSave: (next: FilmDocument) => void;
  onTimeChange?: (seconds: number) => void;
  className?: string;
}) {
  const [mode, setMode] = React.useState<Mode>("film");
  const [time, setTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  const scenes = React.useMemo(() => timeline(doc), [doc]);
  const cutLength = React.useMemo(() => filmDuration(doc), [doc]);
  const stale = isRenderStale(doc);
  const renderLength = doc.render?.duration ?? cutLength;
  const length = mode === "film" ? renderLength : cutLength;
  const frameStep = 1 / (doc.fps || 30);

  const srcDoc = React.useMemo(
    () =>
      mode === "cut"
        ? inlineAssets(buildCompositionHtml(doc)).replace(
            "</body>",
            `${FIT_TO_FRAME}${SEEK_BRIDGE}</body>`,
          )
        : "",
    [doc, mode],
  );

  // The composition boots paused; nothing is on screen until it is seeked, so
  // wait for its ready handshake before driving it.
  const [frameReady, setFrameReady] = React.useState(false);
  React.useEffect(() => {
    if (mode !== "cut") return;
    setFrameReady(false);
    function onMessage(event: MessageEvent) {
      if ((event.data as { type?: string } | null)?.type === "hf-ready") {
        setFrameReady(true);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mode, srcDoc]);

  // The cut preview is a paused timeline: seeking it is the only playback.
  React.useEffect(() => {
    if (mode !== "cut" || !frameReady) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: "hf-seek", time },
      "*",
    );
  }, [time, mode, frameReady]);

  React.useEffect(() => {
    if (mode !== "cut" || !playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setTime((current) => {
        const next = current + delta;
        if (next >= cutLength) {
          setPlaying(false);
          return cutLength;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, playing, cutLength]);

  React.useEffect(() => {
    onTimeChange?.(time);
  }, [time, onTimeChange]);

  function seek(next: number) {
    const clamped = Math.min(Math.max(next, 0), length);
    setTime(clamped);
    if (mode === "film" && videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  }

  function togglePlay() {
    if (mode === "film" && videoRef.current) {
      if (videoRef.current.paused) {
        void videoRef.current.play();
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
      return;
    }
    setPlaying((p) => !p);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    videoRef.current?.pause();
    setPlaying(false);
    setMode(next);
    // t=0 is the first frame of a fade-in — i.e. black. Land just inside it.
    if (next === "cut" && time < doc.crossfade) setTime(doc.crossfade);
  }

  /** Every edit rewrites the cut, which the caller stores as a new revision. */
  function edit(mutate: (scenes: FilmScene[]) => FilmScene[]) {
    onSave({ ...doc, scenes: mutate([...doc.scenes]) });
  }

  function move(id: string, direction: -1 | 1) {
    edit((list) => {
      const index = list.findIndex((s) => s.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= list.length) return list;
      const [scene] = list.splice(index, 1);
      list.splice(target, 0, scene);
      return list;
    });
  }

  function patchScene(id: string, patch: Partial<FilmScene>) {
    edit((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  /**
   * The cut, as a file HyperFrames renders. Photographs are inlined so the
   * download is self-contained: `hyperframes render` on this one file produces
   * the MP4 with no project folder to assemble.
   */
  function exportComposition() {
    const html = inlineAssets(buildCompositionHtml(doc));
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cutId(doc)}.composition.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeScene =
    scenes.find((s) => time >= s.start && time < s.start + s.duration) ??
    scenes[0];

  return (
    <div
      className={cn(
        "preview-studio__lens flex w-full max-w-5xl flex-col gap-3",
        "rounded-3xl border border-white/10 bg-background/50 p-3",
        "shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl",
        className,
      )}
      data-testid="preview-studio-stage"
      data-stage-kind="film"
    >
      {/* mode: the render, or the cut it came from */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "film" ? "secondary" : "ghost"}
            className="h-7 gap-1.5 px-2.5"
            onClick={() => switchMode("film")}
            data-testid="preview-studio-film-mode-film"
          >
            <Film className="h-3.5 w-3.5" />
            Film
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "cut" ? "secondary" : "ghost"}
            className="h-7 gap-1.5 px-2.5"
            onClick={() => switchMode("cut")}
            data-testid="preview-studio-film-mode-cut"
          >
            <Scissors className="h-3.5 w-3.5" />
            Cut
          </Button>
        </div>
        <span className="text-2xs text-muted-foreground">
          {mode === "film"
            ? `${doc.width}×${doc.height} · ${doc.fps}fps · rendered by HyperFrames`
            : `${scenes.length} scenes · live composition, seek to preview`}
        </span>
        {stale && mode === "film" ? (
          <span
            className="ml-auto rounded-md bg-amber-500/15 px-2 py-1 text-2xs text-amber-300"
            data-testid="preview-studio-film-stale"
          >
            This render is behind the cut — re-render to see your edits
          </span>
        ) : null}
      </div>

      {/* the picture */}
      <div className="overflow-hidden rounded-2xl bg-[#11100e]">
        {mode === "film" ? (
          <video
            ref={videoRef}
            className="aspect-video w-full"
            src={doc.render?.uri}
            poster="/demo/elena-marsh-film-poster.jpg"
            preload="metadata"
            playsInline
            data-testid="preview-studio-film-video"
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <track kind="captions" />
          </video>
        ) : (
          <iframe
            ref={frameRef}
            title={`${title} — cut preview`}
            className="aspect-video w-full border-0"
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            data-testid="preview-studio-film-frame"
          />
        )}
      </div>

      {/* transport */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          data-testid="preview-studio-film-play"
        >
          {playing ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => seek(time - frameStep)}
          aria-label="Previous frame"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => seek(time + frameStep)}
          aria-label="Next frame"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <input
          type="range"
          min={0}
          max={length}
          step={frameStep}
          value={Math.min(time, length)}
          onChange={(event) => seek(Number(event.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
          aria-label="Scrub"
          data-testid="preview-studio-film-scrub"
        />
        <span
          className="w-28 text-right text-2xs tabular-nums text-muted-foreground"
          data-testid="preview-studio-film-timecode"
        >
          {timecode(time)} / {timecode(length)}
        </span>
      </div>

      {/* the cut, as blocks you can read at a glance */}
      <div className="flex gap-1" data-testid="preview-studio-film-timeline">
        {scenes.map((scene) => {
          const photo = scenePhoto(scene.image);
          const active = activeScene?.id === scene.id;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => {
                seek(scene.start + 0.15);
                setSelected(scene.id);
              }}
              style={{ flexGrow: scene.duration }}
              className={cn(
                "group relative h-14 overflow-hidden rounded-md border transition-all",
                active
                  ? "border-foreground/70 ring-1 ring-foreground/40"
                  : "border-white/10 hover:border-white/30",
              )}
              title={`${scene.title || scene.image} · ${scene.duration}s`}
              data-testid={`preview-studio-film-scene-${scene.id}`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-95"
                />
              ) : (
                <span className="block h-full w-full bg-muted" />
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-left text-3xs text-white/90">
                {scene.title || scene.image} · {scene.duration}s
              </span>
            </button>
          );
        })}
      </div>

      {/* editor */}
      {mode === "cut" ? (
        <div className="rounded-xl border border-white/10 bg-background/40 p-2">
          <div className="mb-2 flex items-center gap-2">
            <Clapperboard className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-2xs text-muted-foreground">
              Edit the cut — every change saves a new revision. {cutLength}s ·{" "}
              <code className="text-3xs">{cutId(doc)}</code>
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="ml-auto h-7 gap-1.5 px-2 text-2xs"
              onClick={exportComposition}
              title="Download the HyperFrames composition this cut renders from"
              data-testid="preview-studio-film-export"
            >
              <Download className="h-3.5 w-3.5" />
              Composition
            </Button>
          </div>
          <p className="mb-2 text-3xs text-muted-foreground">
            Rendering runs <code>hyperframes render</code> on this machine; the
            browser build edits and previews the cut, it cannot launch the CLI.
          </p>
          <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {doc.scenes.map((scene, index) => (
              <li
                key={scene.id}
                className={cn(
                  "flex flex-wrap items-center gap-1.5 rounded-lg px-2 py-1.5",
                  selected === scene.id ? "bg-muted/50" : "hover:bg-muted/25",
                  scene.hidden && "opacity-50",
                )}
                data-testid={`preview-studio-film-edit-${scene.id}`}
              >
                <span className="w-5 text-2xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <input
                  value={scene.title}
                  placeholder="no chapter mark"
                  onChange={(event) =>
                    patchScene(scene.id, { title: event.target.value })
                  }
                  className="h-7 w-40 rounded-md border border-white/10 bg-transparent px-2 text-xs outline-none focus:border-white/40"
                  aria-label={`Chapter mark for scene ${index + 1}`}
                />
                <span className="text-2xs text-muted-foreground">
                  {scene.image}
                </span>

                <div className="ml-auto flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() =>
                      patchScene(scene.id, {
                        duration: Math.max(
                          doc.crossfade + 0.5,
                          Number((scene.duration - 0.2).toFixed(2)),
                        ),
                      })
                    }
                    aria-label="Shorten scene"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-12 text-center text-2xs tabular-nums">
                    {scene.duration.toFixed(1)}s
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() =>
                      patchScene(scene.id, {
                        duration: Number((scene.duration + 0.2).toFixed(2)),
                      })
                    }
                    aria-label="Lengthen scene"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-2xs"
                    onClick={() =>
                      patchScene(scene.id, {
                        motion:
                          MOTIONS[
                            (MOTIONS.indexOf(scene.motion) + 1) % MOTIONS.length
                          ],
                      })
                    }
                    title="Cycle the camera move"
                  >
                    {scene.motion}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => move(scene.id, -1)}
                    disabled={index === 0}
                    aria-label="Move earlier"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => move(scene.id, 1)}
                    disabled={index === doc.scenes.length - 1}
                    aria-label="Move later"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() =>
                      patchScene(scene.id, { hidden: !scene.hidden })
                    }
                    aria-label={scene.hidden ? "Include scene" : "Drop scene"}
                  >
                    {scene.hidden ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
