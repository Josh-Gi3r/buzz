import { PROVIDER_ENV, type ProviderId } from "./providers";

/**
 * Provider keys for generation.
 *
 * Stored per device, never published to the relay and never handed to a preview
 * frame. Reads prefer a key baked into the build environment so an existing
 * shell setup works without re-entering anything.
 */

const STORAGE_KEY = "buzz.previewStudio.providerKeys.v1";

type KeyMap = Partial<Record<ProviderId, string>>;

function readStored(): KeyMap {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KeyMap) : {};
  } catch {
    return {};
  }
}

/** Keys present in the build environment, if the host provided any. */
function readEnv(provider: ProviderId): string | undefined {
  const name = PROVIDER_ENV[provider];
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  return env?.[`VITE_${name}`];
}

export function getProviderKey(provider: ProviderId): string {
  return readStored()[provider] ?? readEnv(provider) ?? "";
}

export function setProviderKey(provider: ProviderId, key: string): void {
  if (typeof localStorage === "undefined") return;
  const next = readStored();
  const trimmed = key.trim();
  if (trimmed) next[provider] = trimmed;
  else delete next[provider];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Device storage full — the key stays in memory for this session only.
  }
}

export function hasProviderKey(provider: ProviderId): boolean {
  return getProviderKey(provider).length > 0;
}

/** Never render a key in full. */
export function maskKey(key: string): string {
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}
