import { AlertTriangle, Calculator, Film, Volume2 } from "lucide-react";
import * as React from "react";

import {
  estimateCost,
  generateVideo,
  higgsfieldAvailable,
  type ToolAvailability,
  resolveAudioMode,
} from "../lib/generation/higgsfield";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

/**
 * Models offered for video. Only those that produce sound in the same pass as
 * the picture belong here — the adapter re-checks each one against its own
 * published parameters before a job is created, so this list cannot smuggle a
 * silent model through.
 */
const OFFERED = [
  { jobType: "seedance_2_0", label: "Seedance 2.0" },
  { jobType: "seedance_2_0_mini", label: "Seedance 2.0 Mini" },
  { jobType: "veo3_1", label: "Google Veo 3.1" },
  { jobType: "kling3_0", label: "Kling 3.0" },
];
// Deliberately absent: veo3 requires a start image this panel does not supply,
// and kling3_0_turbo publishes no audio parameter so the audio check refuses it.

type AudioState = "checking" | "ok" | "refused";

export function VideoGenerateSection({
  onGenerated,
}: {
  onGenerated: (video: { url: string; title: string; model: string }) => void;
}) {
  const [available, setAvailable] = React.useState<ToolAvailability | null>(
    null,
  );
  const [jobType, setJobType] = React.useState(OFFERED[0].jobType);
  const [prompt, setPrompt] = React.useState("");
  const [duration, setDuration] = React.useState(5);
  const [cost, setCost] = React.useState<string | null>(null);
  const [audio, setAudio] = React.useState<AudioState>("checking");
  const [audioDetail, setAudioDetail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void higgsfieldAvailable().then(setAvailable);
  }, []);

  // Confirm from the model's own parameters that audio comes out of the same
  // pass, before offering the button at all.
  React.useEffect(() => {
    let cancelled = false;
    setAudio("checking");
    setAudioDetail("");
    void resolveAudioMode(jobType)
      .then((mode) => {
        if (cancelled) return;
        setAudio("ok");
        setAudioDetail(
          mode.kind === "flag"
            ? `sound forced on via --${mode.name}`
            : "sound always on for this model",
        );
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setAudio("refused");
        setAudioDetail(cause instanceof Error ? cause.message : String(cause));
      });
    return () => {
      cancelled = true;
    };
  }, [jobType]);

  async function checkCost() {
    setError(null);
    try {
      setCost(await estimateCost(jobType, { duration: String(duration) }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const url = await generateVideo({
        jobType,
        prompt: prompt.trim(),
        duration,
      });
      onGenerated({ url, title: prompt.trim().slice(0, 60), model: jobType });
      setPrompt("");
      setCost(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  if (available === "unreachable" || available === "missing") {
    return (
      <section
        className="space-y-1.5 border-t border-border/40 pt-3"
        data-testid="preview-studio-video-unavailable"
      >
        <h3 className="text-xs font-semibold">Video</h3>
        <p className="text-2xs text-muted-foreground">
          {available === "unreachable"
            ? "Video generation drives the Higgsfield CLI on this machine. This build runs in the browser, which cannot launch local tools — open the desktop app to generate."
            : "The Higgsfield CLI was not found in ~/.local/bin, /opt/homebrew/bin or /usr/local/bin."}
        </p>
      </section>
    );
  }

  const ready = audio === "ok" && prompt.trim().length > 0 && !busy;

  return (
    <section
      className="space-y-2 border-t border-border/40 pt-3"
      data-testid="preview-studio-video-section"
    >
      <div className="flex items-center gap-1.5">
        <Film className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold">Video</h3>
      </div>

      <select
        className="w-full rounded-lg border border-border/60 bg-background/70 px-2 py-1.5 text-sm"
        value={jobType}
        onChange={(e) => {
          setJobType(e.target.value);
          setCost(null);
        }}
        data-testid="preview-studio-video-model"
      >
        {OFFERED.map((m) => (
          <option key={m.jobType} value={m.jobType}>
            {m.label}
          </option>
        ))}
      </select>

      <p
        className="flex items-start gap-1.5 text-2xs text-muted-foreground"
        data-testid="preview-studio-audio-state"
      >
        {audio === "refused" ? (
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
        ) : (
          <Volume2 className="mt-0.5 h-3 w-3 shrink-0" />
        )}
        {audio === "checking"
          ? "Checking how this model handles sound…"
          : audioDetail}
      </p>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the shot…"
        className="min-h-20 text-sm"
        data-testid="preview-studio-video-prompt"
      />

      <div className="flex items-center gap-2">
        <label
          className="text-2xs text-muted-foreground"
          htmlFor="video-duration"
        >
          Seconds
        </label>
        <input
          id="video-duration"
          type="number"
          min={2}
          max={12}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-16 rounded-lg border border-border/60 bg-background/70 px-2 py-1 text-2xs"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto h-7 gap-1.5 text-2xs"
          onClick={() => void checkCost()}
          data-testid="preview-studio-video-cost"
        >
          <Calculator className="h-3 w-3" />
          Check cost
        </Button>
      </div>

      {cost ? (
        <p className="rounded-lg border border-border/50 bg-background/60 p-2 text-2xs">
          {cost}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-2xs text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full gap-1.5"
        disabled={!ready}
        onClick={() => void run()}
        data-testid="preview-studio-video-generate"
      >
        <Film className="h-3.5 w-3.5" />
        {busy ? "Generating…" : "Generate video"}
      </Button>

      <p className="text-2xs leading-relaxed text-muted-foreground">
        Picture and sound are produced in the same pass. Audio is never
        generated separately and never dubbed.
      </p>
    </section>
  );
}
