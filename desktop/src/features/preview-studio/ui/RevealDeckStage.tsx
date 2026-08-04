import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Presentation,
  Save,
} from "lucide-react";
import * as React from "react";

import type { DeckDocument } from "../lib/deckSource";
import { DECK_CSS } from "./deckTheme";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

export function RevealDeckStage({
  title,
  doc,
  slideIndex,
  onSlideIndexChange,
  onSave,
  className,
}: {
  title: string;
  doc: DeckDocument;
  slideIndex: number;
  onSlideIndexChange: (index: number) => void;
  onSave: (next: DeckDocument) => void;
  className?: string;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [editing, setEditing] = React.useState(false);

  const total = doc.slides.length;
  const current = Math.min(Math.max(slideIndex, 0), Math.max(total - 1, 0));

  // Editability is toggled on the live nodes so the caret and selection
  // survive; re-rendering markup would drop them.
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    for (const node of host.querySelectorAll("h2, .slide-body")) {
      (node as HTMLElement).contentEditable = editing ? "true" : "false";
    }
  }, [editing, current]);

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key === "ArrowRight" && current < total - 1) {
        onSlideIndexChange(current + 1);
      }
      if (event.key === "ArrowLeft" && current > 0) {
        onSlideIndexChange(current - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, total, onSlideIndexChange]);

  /** Open the whole deck as a reveal.js presentation in its own window. */
  function present() {
    const win = window.open("", "_blank", "width=1280,height=760");
    if (!win) return;
    const sections = doc.slides
      .map(
        (s) =>
          `<section><h2>${s.title}</h2><div class="slide-body">${s.html}</div>${s.notes ? `<aside class="notes">${s.notes}</aside>` : ""}</section>`,
      )
      .join("");
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
       <link rel="stylesheet" href="https://unpkg.com/reveal.js@6/dist/reveal.css">
       <style>body{background:#0b0e15;margin:0}${DECK_CSS}</style></head>
       <body><div class="reveal"><div class="slides">${sections}</div></div>
       <script type="module">
         import Reveal from "https://unpkg.com/reveal.js@6/dist/reveal.esm.js";
         new Reveal({ hash: false, controls: true, progress: true }).initialize();
       </script></body></html>`,
    );
    win.document.close();
  }

  function saveEdits() {
    const host = hostRef.current;
    if (!host) return;
    const nextSlide = {
      ...doc.slides[current],
      title: host.querySelector("h2")?.textContent?.trim() ?? "",
      html: host.querySelector(".slide-body")?.innerHTML ?? "",
    };
    const slides = doc.slides.map((s, i) => (i === current ? nextSlide : s));
    onSave({ ...doc, slides });
    setEditing(false);
  }

  return (
    <div
      className={cn(
        "preview-studio__lens flex w-full max-w-5xl flex-col gap-3",
        "rounded-3xl border border-white/10 bg-background/50 p-4",
        "shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl",
        className,
      )}
      data-testid="preview-studio-stage"
      data-stage-kind="deck"
    >
      <style>{DECK_CSS}</style>
      <div
        className="reveal aspect-video w-full overflow-auto rounded-2xl bg-[#0b0e15] px-10 py-8"
        ref={hostRef}
        data-testid="preview-studio-deck"
        data-slide={current}
      >
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: slide markup is fork-authored deck source, not remote content */}
        <div
          key={`${current}-${doc.slides[current]?.title ?? ""}`}
          dangerouslySetInnerHTML={{
            __html: `<h2>${doc.slides[current]?.title ?? ""}</h2><div class="slide-body">${doc.slides[current]?.html ?? ""}</div>`,
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          disabled={current === 0}
          onClick={() => onSlideIndexChange(current - 1)}
          data-testid="preview-studio-slide-prev"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          disabled={current >= total - 1}
          onClick={() => onSlideIndexChange(current + 1)}
          data-testid="preview-studio-slide-next"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="ml-1 text-2xs tabular-nums text-muted-foreground">
          Slide {current + 1} of {total}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {editing ? (
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5"
              onClick={saveEdits}
              data-testid="preview-studio-deck-save"
            >
              <Save className="h-3.5 w-3.5" />
              Save as new revision
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setEditing(true)}
              data-testid="preview-studio-deck-edit"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit text
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={present}
            data-testid="preview-studio-deck-present"
          >
            <Presentation className="h-3.5 w-3.5" />
            Present
          </Button>
        </div>
      </div>
    </div>
  );
}
