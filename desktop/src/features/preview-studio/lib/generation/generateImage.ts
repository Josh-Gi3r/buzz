import { assertNativeAudio, type ModelOption } from "./providers";

/**
 * Image generation against the provider's own API.
 *
 * The key never reaches a preview frame — generation happens in the trusted
 * renderer and the result is stored as an artifact revision.
 */

export type GeneratedImage = {
  /** data: URL, ready to become a revision source. */
  dataUrl: string;
  mime: string;
};

export class MissingKeyError extends Error {
  constructor(public readonly envVar: string) {
    super(`No API key configured for ${envVar}`);
    this.name = "MissingKeyError";
  }
}

async function generateOpenAI(
  model: ModelOption,
  prompt: string,
  apiKey: string,
  size: string,
): Promise<GeneratedImage> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: model.id, prompt, size, n: 1 }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `${model.label}: ${response.status} ${detail.slice(0, 200)}`,
    );
  }
  const body = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const first = body.data?.[0];
  if (first?.b64_json) {
    return {
      dataUrl: `data:image/png;base64,${first.b64_json}`,
      mime: "image/png",
    };
  }
  if (first?.url) {
    const blob = await (await fetch(first.url)).blob();
    return {
      dataUrl: await blobToDataUrl(blob),
      mime: blob.type || "image/png",
    };
  }
  throw new Error(`${model.label}: response contained no image`);
}

async function generateGemini(
  model: ModelOption,
  prompt: string,
  apiKey: string,
): Promise<GeneratedImage> {
  const isImagen = model.id.startsWith("imagen");
  const url = isImagen
    ? `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:predict?key=${apiKey}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${apiKey}`;

  const body = isImagen
    ? { instances: [{ prompt }], parameters: { sampleCount: 1 } }
    : { contents: [{ parts: [{ text: prompt }] }] };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `${model.label}: ${response.status} ${detail.slice(0, 200)}`,
    );
  }

  const json = (await response.json()) as {
    predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
    candidates?: Array<{
      content?: {
        parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
      };
    }>;
  };

  const prediction = json.predictions?.[0];
  if (prediction?.bytesBase64Encoded) {
    const mime = prediction.mimeType ?? "image/png";
    return {
      dataUrl: `data:${mime};base64,${prediction.bytesBase64Encoded}`,
      mime,
    };
  }
  const inline = json.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData,
  )?.inlineData;
  if (inline?.data) {
    const mime = inline.mimeType ?? "image/png";
    return { dataUrl: `data:${mime};base64,${inline.data}`, mime };
  }
  throw new Error(`${model.label}: response contained no image`);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("expected a data URL"));
    reader.readAsDataURL(blob);
  });
}

export async function generateImage(options: {
  model: ModelOption;
  prompt: string;
  apiKey: string;
  size?: string;
}): Promise<GeneratedImage> {
  const { model, prompt, apiKey, size = "1024x1024" } = options;
  assertNativeAudio(model);
  if (!apiKey) throw new MissingKeyError(model.provider);
  if (model.unavailable)
    throw new Error(`${model.label}: ${model.unavailable}`);

  switch (model.provider) {
    case "openai":
      return generateOpenAI(model, prompt, apiKey, size);
    case "gemini":
      return generateGemini(model, prompt, apiKey);
    default:
      throw new Error(
        `${model.label}: image generation is not wired for this provider`,
      );
  }
}
