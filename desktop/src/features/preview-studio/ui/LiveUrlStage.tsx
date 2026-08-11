import {
  ExternalLink,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import * as React from "react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { cn } from "@/shared/lib/cn";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "834px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "393px", icon: Smartphone },
] as const;

type ViewportId = (typeof VIEWPORTS)[number]["id"];

export function LiveUrlStage({
  className,
  title,
  url,
}: {
  className?: string;
  title: string;
  url: string;
}) {
  const [viewport, setViewport] = React.useState<ViewportId>("desktop");
  const [reloadKey, setReloadKey] = React.useState(0);
  const width = VIEWPORTS.find((item) => item.id === viewport)?.width ?? "100%";
  const isParentOrigin = React.useMemo(() => {
    try {
      return new URL(url).origin === window.location.origin;
    } catch {
      return true;
    }
  }, [url]);

  return (
    <div
      className={cn(
        "flex h-full min-h-[30rem] w-full flex-col gap-2.5",
        className,
      )}
      data-testid="preview-studio-stage"
      data-stage-kind="website-url"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex rounded-lg border border-border/60 p-0.5">
          {VIEWPORTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setViewport(item.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-2xs transition-colors",
                viewport === item.id
                  ? "bg-primary/20 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-testid={`preview-studio-url-viewport-${item.id}`}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>
        <p className="ml-auto text-2xs text-muted-foreground">
          Live URL · reloads as the agent updates its dev server
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-[#1f1f23] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 border-b border-black/40 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <div className="mx-auto flex min-w-0 max-w-2xl flex-1 items-center rounded-md bg-black/40 px-2.5 py-1">
            <span className="truncate font-mono text-2xs text-white/55">
              {url}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            aria-label="Reload live preview"
            data-testid="preview-studio-url-reload"
          >
            <RotateCw className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => void openUrl(url)}
            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            aria-label="Open preview in browser"
          >
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 justify-center bg-[#2b2b30]">
          <div
            className="h-full max-w-full transition-[width] duration-200"
            style={{ width }}
          >
            {isParentOrigin ? (
              <div className="flex h-full min-h-96 items-center justify-center px-8 text-center text-sm text-white/50">
                Buzz cannot safely embed its own app origin as agent content.
              </div>
            ) : (
              <iframe
                key={reloadKey}
                title={`${title} live preview`}
                src={url}
                sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
                referrerPolicy="no-referrer"
                allow="clipboard-read 'none'; clipboard-write 'none'"
                className="h-full min-h-96 w-full border-0 bg-white"
                data-testid="preview-studio-url-frame"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
