import {
  Code2,
  Columns2,
  Eye,
  Monitor,
  RotateCw,
  Save,
  Smartphone,
  Tablet,
} from "lucide-react";
import * as React from "react";

import { bundleStaticSite } from "../lib/webBundle";
import type { WebDocument } from "../lib/webSource";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "834px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "393px", icon: Smartphone },
] as const;

const MODES = [
  { id: "preview", label: "View", icon: Eye },
  { id: "split", label: "Split", icon: Columns2 },
  { id: "code", label: "Code", icon: Code2 },
] as const;

type ViewportId = (typeof VIEWPORTS)[number]["id"];
type ModeId = (typeof MODES)[number]["id"];

const STAGE_HEIGHT = 720;

const SandpackParts = React.lazy(async () => {
  const mod = await import("@codesandbox/sandpack-react");
  return {
    default: (props: {
      doc: WebDocument;
      mode: ModeId;
      width: string;
      onFilesChange: (files: Record<string, string>) => void;
      localPreview?: React.ReactNode;
    }) => {
      const { doc, mode, width, onFilesChange } = props;
      return (
        <mod.SandpackProvider
          template={doc.template}
          files={doc.files}
          theme={mod.defaultDark}
          options={{
            recompileMode: "delayed",
            recompileDelay: 500,
            activeFile: doc.entry,
            visibleFiles: Object.keys(doc.files).filter(
              (path) => !path.startsWith("/images/"),
            ),
          }}
        >
          <FileWatcher
            onFilesChange={onFilesChange}
            useSandpack={mod.useSandpack}
          />
          <mod.SandpackLayout
            style={{
              border: "none",
              background: "transparent",
              borderRadius: 0,
              flexWrap: "nowrap",
              display: "flex",
            }}
          >
            {mode === "code" ? (
              <mod.SandpackFileExplorer
                style={{ height: STAGE_HEIGHT, flexGrow: 0, flexBasis: 180 }}
              />
            ) : null}
            {mode !== "preview" ? (
              <mod.SandpackCodeEditor
                showLineNumbers
                showTabs
                wrapContent
                style={{
                  height: STAGE_HEIGHT,
                  flexGrow: mode === "code" ? 1 : 0,
                  flexBasis: mode === "code" ? "100%" : "46%",
                  minWidth: 0,
                }}
              />
            ) : null}
            {mode !== "code" ? (
              <div
                style={{
                  flexGrow: 1,
                  flexBasis: mode === "split" ? "54%" : "100%",
                  minWidth: 0,
                  background: "#2b2b30",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width,
                    maxWidth: "100%",
                    transition: "width 200ms ease",
                  }}
                >
                  {props.localPreview ?? (
                    <mod.SandpackPreview
                      showOpenInCodeSandbox={false}
                      showRefreshButton={false}
                      showNavigator={false}
                      style={{ height: STAGE_HEIGHT }}
                    />
                  )}
                </div>
              </div>
            ) : null}
          </mod.SandpackLayout>
        </mod.SandpackProvider>
      );
    },
  };
});

/** Lifts Sandpack's in-memory files back out so edits can be saved. */
function FileWatcher({
  onFilesChange,
  useSandpack,
}: {
  onFilesChange: (files: Record<string, string>) => void;
  useSandpack: () => {
    sandpack: { files: Record<string, { code: string }> };
  };
}) {
  const { sandpack } = useSandpack();
  const cb = React.useRef(onFilesChange);
  cb.current = onFilesChange;
  React.useEffect(() => {
    const plain: Record<string, string> = {};
    for (const [path, file] of Object.entries(sandpack.files)) {
      plain[path] = file.code;
    }
    cb.current(plain);
  }, [sandpack.files]);
  return null;
}

export function WebStage({
  doc,
  title,
  onSave,
  className,
}: {
  doc: WebDocument;
  title: string;
  onSave: (next: WebDocument) => void;
  className?: string;
}) {
  const [viewport, setViewport] = React.useState<ViewportId>("desktop");
  const [mode, setMode] = React.useState<ModeId>("preview");
  const [draft, setDraft] = React.useState<Record<string, string> | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  const width = VIEWPORTS.find((v) => v.id === viewport)?.width ?? "100%";

  // A plain HTML/CSS/JS site is assembled and shown locally; only a project
  // that genuinely needs a transpile goes out to the hosted bundler.
  const localHtml = React.useMemo(() => {
    if (doc.template !== "static") return null;
    return bundleStaticSite(draft ?? doc.files, doc.entry);
  }, [doc.template, doc.entry, doc.files, draft]);

  const localPreview = localHtml ? (
    <iframe
      key={reloadKey}
      title={`${title} preview`}
      sandbox="allow-scripts"
      srcDoc={localHtml}
      style={{
        height: STAGE_HEIGHT,
        width: "100%",
        border: 0,
        background: "#fff",
      }}
      data-testid="preview-studio-web-frame"
    />
  ) : null;
  const dirty =
    draft !== null && JSON.stringify(draft) !== JSON.stringify(doc.files);
  const host = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}.local`;

  return (
    <div
      className={cn("flex w-full max-w-6xl flex-col gap-2.5", className)}
      data-testid="preview-studio-stage"
      data-stage-kind="website"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex rounded-lg border border-border/60 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-2xs transition-colors",
                mode === m.id
                  ? "bg-primary/20 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-testid={`preview-studio-mode-${m.id}`}
            >
              <m.icon className="h-3 w-3" />
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-border/60 p-0.5">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setViewport(v.id)}
              disabled={mode === "code"}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-2xs transition-colors disabled:opacity-40",
                viewport === v.id
                  ? "bg-primary/20 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-testid={`preview-studio-viewport-${v.id}`}
            >
              <v.icon className="h-3 w-3" />
              {v.label}
            </button>
          ))}
        </div>

        <Button
          type="button"
          size="sm"
          className="ml-auto h-8 gap-1.5"
          disabled={!dirty}
          onClick={() => draft && onSave({ ...doc, files: draft })}
          data-testid="preview-studio-web-save"
        >
          <Save className="h-3.5 w-3.5" />
          {dirty ? "Save as new revision" : "Saved"}
        </Button>
      </div>

      {/* Browser chrome, so a website reads as a website */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-[#1f1f23] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 border-b border-black/40 px-3 py-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center rounded-md bg-black/40 px-2.5 py-1">
            <span className="truncate font-mono text-[0.65rem] text-white/45">
              {host}
              {doc.entry}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            aria-label="Reload preview"
            data-testid="preview-studio-web-reload"
          >
            <RotateCw className="h-3 w-3" />
          </button>
        </div>

        <div data-testid="preview-studio-web">
          <React.Suspense
            fallback={
              <div
                className="flex items-center justify-center text-sm text-white/40"
                style={{ height: STAGE_HEIGHT }}
              >
                Loading preview…
              </div>
            }
          >
            {localPreview && mode === "preview" ? (
              <div
                style={{
                  background: "#2b2b30",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width,
                    maxWidth: "100%",
                    transition: "width 200ms ease",
                  }}
                >
                  {localPreview}
                </div>
              </div>
            ) : (
              <SandpackParts
                key={reloadKey}
                doc={doc}
                mode={mode}
                width={width}
                onFilesChange={setDraft}
                localPreview={localPreview}
              />
            )}
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
