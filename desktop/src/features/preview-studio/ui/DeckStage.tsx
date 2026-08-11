import { ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

/** Open a print view containing every slide, one per page. */
function printSlides(title: string, slides: string[]): void {
  const win = window.open("", "_blank", "width=1200,height=800");
  if (!win) return;
  const pages = slides
    .map(
      (uri, i) =>
        `<figure><img src="${uri}" alt="Slide ${i + 1}" /><figcaption>${i + 1} / ${slides.length}</figcaption></figure>`,
    )
    .join("");
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
     <style>
       @page { size: 1600px 900px; margin: 0; }
       html, body { margin: 0; padding: 0; background: #0b0e15; }
       figure { margin: 0; page-break-after: always; break-after: page; position: relative; }
       figure:last-child { page-break-after: auto; break-after: auto; }
       img { display: block; width: 100%; height: auto; }
       figcaption { position: absolute; bottom: 12px; right: 20px; font: 12px system-ui; color: #8b95a8; }
       @media screen { body { padding: 24px; } figure { margin-bottom: 24px; } }
     </style></head><body>${pages}</body></html>`,
  );
  win.document.close();
  win.focus();
  // Give images a beat to decode before the print dialog measures the page.
  win.setTimeout(() => win.print(), 400);
}

export function DeckStage({
  title,
  slides,
  slideIndex,
  onSlideIndexChange,
  className,
}: {
  title: string;
  slides: string[];
  slideIndex: number;
  onSlideIndexChange: (index: number) => void;
  className?: string;
}) {
  const total = slides.length;
  const current = Math.min(Math.max(slideIndex, 0), Math.max(total - 1, 0));

  const go = React.useCallback(
    (delta: number) => {
      if (total === 0) return;
      onSlideIndexChange(Math.min(Math.max(current + delta, 0), total - 1));
    },
    [current, onSlideIndexChange, total],
  );

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (total === 0) return null;

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
      <img
        alt={`${title} — slide ${current + 1}`}
        className="w-full rounded-2xl"
        decoding="async"
        src={slides[current]}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          disabled={current === 0}
          onClick={() => go(-1)}
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
          onClick={() => go(1)}
          data-testid="preview-studio-slide-next"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="mx-1 flex flex-1 items-center gap-1 overflow-x-auto">
          {slides.map((uri, index) => (
            <button
              key={uri.slice(-24)}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === current}
              onClick={() => onSlideIndexChange(index)}
              className={cn(
                "h-1.5 w-6 shrink-0 rounded-full transition-colors",
                index === current
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
              data-testid={`preview-studio-slide-dot-${index}`}
            />
          ))}
        </div>

        <span className="text-2xs tabular-nums text-muted-foreground">
          Slide {current + 1} of {total}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => window.open(slides[current], "_blank")}
          data-testid="preview-studio-slide-open"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Full size
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => printSlides(title, slides)}
          data-testid="preview-studio-deck-export"
        >
          <Download className="h-3.5 w-3.5" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}
