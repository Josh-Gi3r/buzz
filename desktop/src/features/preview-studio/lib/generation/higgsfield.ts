import { invoke } from "@tauri-apps/api/core";

/**
 * Higgsfield video generation, driven through its command-line tool.
 *
 * The tool is already authenticated, so no key is stored here. Every model is
 * checked against its own published parameters before use: a model that cannot
 * produce sound in the same pass as the picture is refused, and for models that
 * can, the audio flag is forced on. Video and audio are never generated
 * separately and never dubbed.
 */

export type VideoModel = {
  jobType: string;
  label: string;
  /** The parameter that turns same-pass audio on, if the model has one. */
  audioParam?: { name: string; on: string };
  /** Models whose audio is always on and have no flag at all. */
  audioAlwaysOn?: boolean;
};

export type ModelParam = {
  name: string;
  type: string;
  default?: string;
};

type ToolResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
};

/**
 * Three different answers, because they need three different sentences:
 * the tool is here, the tool is missing, or this build has no way to reach it.
 * Collapsing the last two into "not installed" tells the user a lie — the CLI
 * is usually installed and it is the browser build that cannot launch it.
 */
export type ToolAvailability = "available" | "missing" | "unreachable";

function hasLocalToolBridge(): boolean {
  return (
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in (window as unknown as Record<string, unknown>)
  );
}

export async function higgsfieldAvailable(): Promise<ToolAvailability> {
  if (!hasLocalToolBridge()) return "unreachable";
  try {
    const ok = await invoke<boolean>("media_tool_available", {
      tool: "higgsfield",
    });
    return ok ? "available" : "missing";
  } catch {
    return "unreachable";
  }
}

async function run(args: string[]): Promise<ToolResult> {
  return invoke<ToolResult>("run_media_tool", { tool: "higgsfield", args });
}

/** Parameters a model accepts, parsed from `model get`. */
export async function modelParams(jobType: string): Promise<ModelParam[]> {
  const result = await run(["model", "get", jobType]);
  if (!result.ok)
    throw new Error(result.stderr.trim() || "model lookup failed");

  return result.stdout
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, type, fallback] = line.split(/\s{2,}/);
      return { name, type, default: fallback };
    })
    .filter((p) => p.name && p.type);
}

/**
 * Decide how a model produces audio. Anything that cannot produce it in the
 * same pass is rejected here, before a job is ever created.
 */
export async function resolveAudioMode(
  jobType: string,
): Promise<{ kind: "flag"; name: string; on: string } | { kind: "always" }> {
  const params = await modelParams(jobType);

  const toggle = params.find(
    (p) => p.name === "generate_audio" || p.name === "sound",
  );
  if (toggle) {
    const on = toggle.type.includes("on,off") ? "on" : "true";
    return { kind: "flag", name: toggle.name, on };
  }

  // Some models (Veo) always carry audio and expose no switch. Treat the
  // absence of any audio-ish parameter as "always on" only for those.
  const ALWAYS_ON = ["veo3", "veo3_1", "veo3_1_lite", "gemini_omni"];
  if (ALWAYS_ON.includes(jobType)) return { kind: "always" };

  throw new Error(
    `${jobType} does not produce synchronised audio in the same pass. ` +
      "Video and audio are never generated separately and never dubbed.",
  );
}

/** What a job will cost, before anything is spent. */
export async function estimateCost(
  jobType: string,
  params: Record<string, string>,
): Promise<string> {
  const args = ["generate", "cost", jobType];
  for (const [key, value] of Object.entries(params)) {
    args.push(`--${key}`, value);
  }
  const result = await run(args);
  if (!result.ok)
    throw new Error(result.stderr.trim() || "cost estimate failed");
  return result.stdout.trim();
}

export async function creditBalance(): Promise<string> {
  const result = await run(["account", "credits"]);
  return result.ok ? result.stdout.trim() : result.stderr.trim();
}

/**
 * Create a video job with audio forced on, and wait for the result URL.
 * Only ever called from an explicit user action — this spends real credits.
 */
export async function generateVideo(options: {
  jobType: string;
  prompt: string;
  duration?: number;
  resolution?: string;
}): Promise<string> {
  const audio = await resolveAudioMode(options.jobType);

  const args = [
    "generate",
    "create",
    options.jobType,
    "--prompt",
    options.prompt,
  ];
  if (options.duration) args.push("--duration", String(options.duration));
  if (options.resolution) args.push("--resolution", options.resolution);
  if (audio.kind === "flag") args.push(`--${audio.name}`, audio.on);
  args.push("--wait", "--json");

  const result = await run(args);
  if (!result.ok) throw new Error(result.stderr.trim() || "generation failed");

  const url = result.stdout.match(/https?:\/\/\S+\.(mp4|mov|webm)/)?.[0];
  if (!url) throw new Error("generation finished but returned no video URL");
  return url;
}
