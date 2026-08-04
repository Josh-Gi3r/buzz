import { Code2, Monitor, Save, Smartphone, Tablet } from "lucide-react";
import * as React from "react";

import type { WebDocument } from "../lib/webSource";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "834px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "393px", icon: Smartphone },
] as const;

type ViewportId = (typeof VIEWPORTS)[number]["id"];

const SandpackParts = React.lazy(async () => {
  const mod = await import("@codesandbox/sandpack-react");
  return {
    default: ({
      doc,
      showCode,
      width,
      onFilesChange,
    }: {
      doc: WebDocument;
      showCode: boolean;
      width: string;
      onFilesChange: (files: Record<string, string>) => void;
    }) => (
      <mod.SandpackProvider
        template={doc.template}
        files={doc.files}
        theme={mod.defaultDark}
        options={{
          recompileMode: "delayed",
          recompileDelay: 500,
          activeFile: doc.entry,
        }}
      >
        <FileWatcher
          onFilesChange={onFilesChange}
          useSandpack={mod.useSandpack}
        />
        <mod.SandpackLayout>
          {showCode ? (
            <mod.SandpackCodeEditor
              showLineNumbers
              showTabs
              style={{ height: 520 }}
            />
          ) : null}
          <div style={{ width, margin: "0 auto", transition: "width 180ms" }}>
            <mod.SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: 520 }}
            />
          </div>
        </mod.SandpackLayout>
      </mod.SandpackProvider>
    ),
  };
});

/** Lifts Sandpack's in-memory files back out so edits can be saved. */
function FileWatcher({
  onFilesChange,
  useSandpack,
}: {
  onFilesChange: (files: Record<string, string>) => void;
  useSandpack: () => { sandpack: { files: Record<string, { code: string }> } };
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
  onSave,
  className,
}: {
  doc: WebDocument;
  onSave: (next: WebDocument) => void;
  className?: string;
}) {
  const [viewport, setViewport] = React.useState<ViewportId>("desktop");
  const [showCode, setShowCode] = React.useState(false);
  const [draft, setDraft] = React.useState<Record<string, string> | null>(null);

  const width = VIEWPORTS.find((v) => v.id === viewport)?.width ?? "100%";
  const dirty =
    draft !== null && JSON.stringify(draft) !== JSON.stringify(doc.files);

  return (
    <div
      className={cn(
        "preview-studio__lens flex w-full max-w-5xl flex-col gap-3",
        "rounded-3xl border border-white/10 bg-background/50 p-4",
        "shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl",
        className,
      )}
      data-testid="preview-studio-stage"
      data-stage-kind="website"
    >
      <div
        className="overflow-hidden rounded-2xl"
        data-testid="preview-studio-web"
      >
        <React.Suspense
          fallback={
            <div className="flex h-[520px] items-center justify-center text-sm text-muted-foreground">
              Loading preview…
            </div>
          }
        >
          <SandpackParts
            doc={doc}
            showCode={showCode}
            width={width}
            onFilesChange={setDraft}
          />
        </React.Suspense>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {VIEWPORTS.map((v) => (
          <Button
            key={v.id}
            type="button"
            variant={viewport === v.id ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setViewport(v.id)}
            data-testid={`preview-studio-viewport-${v.id}`}
          >
            <v.icon className="h-3.5 w-3.5" />
            {v.label}
          </Button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant={showCode ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setShowCode((v) => !v)}
            data-testid="preview-studio-web-code"
          >
            <Code2 className="h-3.5 w-3.5" />
            {showCode ? "Hide code" : "Edit code"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5"
            disabled={!dirty}
            onClick={() => draft && onSave({ ...doc, files: draft })}
            data-testid="preview-studio-web-save"
          >
            <Save className="h-3.5 w-3.5" />
            Save as new revision
          </Button>
        </div>
      </div>
    </div>
  );
}
