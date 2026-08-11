/**
 * Generation providers.
 *
 * Images go straight to OpenAI or Gemini — the model is the user's choice per
 * generation, never hardcoded. Video is Higgsfield only, and only with models
 * that produce their audio in the same pass: video and audio are never
 * generated separately and never dubbed.
 */

export type ProviderId = "openai" | "gemini" | "xai" | "higgsfield";

export type GenerationKind = "image" | "video";

export type ModelOption = {
  id: string;
  label: string;
  provider: ProviderId;
  kind: GenerationKind;
  /** Short note shown under the picker. */
  note: string;
  /** Rough per-generation cost, for the confirmation line. */
  approxCost: string;
  /** Video only: does this model emit synchronised audio in the same pass? */
  nativeAudio?: boolean;
  /** Unavailable models stay visible but disabled, with the reason. */
  unavailable?: string;
};

export const IMAGE_MODELS: ModelOption[] = [
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    provider: "openai",
    kind: "image",
    note: "Strongest at text inside the image and precise instructions.",
    approxCost: "~$0.04–0.19 per image",
  },
  {
    id: "gpt-image-1.5",
    label: "GPT Image 1.5",
    provider: "openai",
    kind: "image",
    note: "Cheaper, still good at typography.",
    approxCost: "~$0.02–0.12 per image",
  },
  {
    id: "gemini-3-pro-image",
    label: "Gemini 3 Pro Image",
    provider: "gemini",
    kind: "image",
    note: "Strong photoreal and reference-driven work.",
    approxCost: "~$0.03–0.14 per image",
  },
  {
    id: "gemini-2.5-flash-image",
    label: "Nano Banana (2.5 Flash Image)",
    provider: "gemini",
    kind: "image",
    note: "Fast edits and character consistency.",
    approxCost: "~$0.02–0.04 per image",
  },
  {
    id: "imagen-4.0-generate-001",
    label: "Imagen 4",
    provider: "gemini",
    kind: "image",
    note: "Google's dedicated image model.",
    approxCost: "~$0.04 per image",
  },
  {
    id: "grok-image",
    label: "Grok Image",
    provider: "xai",
    kind: "image",
    note: "Reserved — xAI exposes no image model on this account yet.",
    approxCost: "—",
    unavailable: "xAI key has no credit and no image endpoint is published",
  },
];

export const VIDEO_MODELS: ModelOption[] = [
  {
    id: "seedance-2.0",
    label: "Seedance 2.0",
    provider: "higgsfield",
    kind: "video",
    note: "Generates picture and sound together in one pass.",
    approxCost: "Higgsfield credits",
    nativeAudio: true,
  },
  {
    id: "kling-3.0",
    label: "Kling 3.0",
    provider: "higgsfield",
    kind: "video",
    note: "Alternative look; use only where it emits its own audio.",
    approxCost: "Higgsfield credits",
    nativeAudio: true,
  },
];

/** Env var each provider's key is read from. */
export const PROVIDER_ENV: Record<ProviderId, string> = {
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
  xai: "XAI_API_KEY",
  higgsfield: "HIGGSFIELD_API_KEY",
};

export function modelById(id: string): ModelOption | undefined {
  return [...IMAGE_MODELS, ...VIDEO_MODELS].find((m) => m.id === id);
}

/**
 * Video and audio must come out of the same generation. Anything that would
 * require a separate audio pass or a dub is refused here rather than later.
 */
export function assertNativeAudio(model: ModelOption): void {
  if (model.kind === "video" && !model.nativeAudio) {
    throw new Error(
      `${model.label} does not produce synchronised audio in the same pass. ` +
        "Video and audio are never generated separately and never dubbed.",
    );
  }
}
