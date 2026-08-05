import { AlertTriangle, KeyRound, Sparkles, X } from "lucide-react";
import * as React from "react";

import {
  generateImage,
  MissingKeyError,
} from "../lib/generation/generateImage";
import {
  getProviderKey,
  maskKey,
  setProviderKey,
} from "../lib/generation/keys";
import { IMAGE_MODELS, PROVIDER_ENV } from "../lib/generation/providers";
import { VideoGenerateSection } from "./VideoGenerateSection";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

export function GeneratePanel({
  onGenerated,
  onVideoGenerated,
  onClose,
}: {
  onGenerated: (image: {
    dataUrl: string;
    mime: string;
    title: string;
  }) => void;
  onVideoGenerated: (video: {
    url: string;
    title: string;
    model: string;
  }) => void;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = React.useState("");
  const [modelId, setModelId] = React.useState(IMAGE_MODELS[0].id);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [keyDraft, setKeyDraft] = React.useState("");
  const [showKeyField, setShowKeyField] = React.useState(false);

  const model = IMAGE_MODELS.find((m) => m.id === modelId) ?? IMAGE_MODELS[0];
  const storedKey = getProviderKey(model.provider);
  const ready = prompt.trim().length > 0 && !model.unavailable && !!storedKey;

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const image = await generateImage({
        model,
        prompt: prompt.trim(),
        apiKey: getProviderKey(model.provider),
      });
      onGenerated({
        dataUrl: image.dataUrl,
        mime: image.mime,
        title: prompt.trim().slice(0, 60),
      });
      setPrompt("");
    } catch (cause) {
      setError(
        cause instanceof MissingKeyError
          ? `Add a ${PROVIDER_ENV[model.provider]} to generate with ${model.label}.`
          : cause instanceof Error
            ? cause.message
            : String(cause),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-l border-border/50 bg-background/55 backdrop-blur-xl"
      data-testid="preview-studio-generate-panel"
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          Generate
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onClose}
          aria-label="Close generate panel"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        <section className="space-y-1.5">
          <h3 className="text-xs font-semibold">Model</h3>
          <select
            className="w-full rounded-lg border border-border/60 bg-background/70 px-2 py-1.5 text-sm"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            data-testid="preview-studio-model-select"
          >
            {IMAGE_MODELS.map((m) => (
              <option key={m.id} value={m.id} disabled={!!m.unavailable}>
                {m.label}
                {m.unavailable ? " — unavailable" : ""}
              </option>
            ))}
          </select>
          <p className="text-2xs text-muted-foreground">{model.note}</p>
          <p className="text-2xs text-muted-foreground">
            Cost: {model.approxCost} · billed to your {model.provider} account
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-semibold">Prompt</h3>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image…"
            className="min-h-24 text-sm"
            data-testid="preview-studio-prompt"
          />
        </section>

        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold">
              {PROVIDER_ENV[model.provider]}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-2xs"
              onClick={() => setShowKeyField((v) => !v)}
            >
              <KeyRound className="h-3 w-3" />
              {storedKey ? "Change" : "Add"}
            </Button>
          </div>
          <p className="text-2xs text-muted-foreground">
            {storedKey
              ? `Stored: ${maskKey(storedKey)}`
              : "Not set on this device."}
          </p>
          {showKeyField ? (
            <div className="flex gap-1.5">
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder="Paste key"
                className="min-w-0 flex-1 rounded-lg border border-border/60 bg-background/70 px-2 py-1 text-2xs"
                data-testid="preview-studio-key-input"
              />
              <Button
                type="button"
                size="sm"
                className="h-7 text-2xs"
                onClick={() => {
                  setProviderKey(model.provider, keyDraft);
                  setKeyDraft("");
                  setShowKeyField(false);
                }}
              >
                Save
              </Button>
            </div>
          ) : null}
        </section>

        {model.unavailable ? (
          <p className="flex gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-2xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            {model.unavailable}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-2xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          className={cn("w-full gap-1.5")}
          disabled={!ready || busy}
          onClick={() => void run()}
          data-testid="preview-studio-generate"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {busy ? "Generating…" : `Generate — ${model.approxCost}`}
        </Button>

        <VideoGenerateSection onGenerated={onVideoGenerated} />
      </div>
    </aside>
  );
}
