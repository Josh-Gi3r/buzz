import path from "node:path";
import { fileURLToPath } from "node:url";
import { runPxTextCheck } from "../../scripts/check-px-text-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Enforces the rem-token text scale app-wide. The rem→px zoom regression
// (PR #891) landed in the message-timeline render path, but arbitrary text
// literals (`text-[…px]`, `text-[…rem]`) had drifted across the whole desktop
// app — so the guard now scans all of `src`. Readable text MUST use a rem-based
// token (the stock `text-base`/`text-sm`/`text-xs` scale, or the `text-2xs` /
// `text-3xs` meta-text tokens) so Cmd +/- zoom scales it and the size stays on
// one consolidated scale. Genuine decorative glyphs are allowlisted below.
const rules = [
  {
    root: "src",
    extensions: new Set([".ts", ".tsx", ".css"]),
  },
];

// Decorative / chrome exceptions: `relativePath:matchedLiteral`. The avatar
// emoji glyphs are fixed display sizes sized to their avatar box (not readable
// message text), so they are exempted from the readable-text px rule. Matching
// the literal keeps these exceptions stable when unrelated edits move lines.
const overrides = new Set([
  // BUZZ — LIVE PREVIEW STUDIO demo artifacts. These strings are the *content* of an
  // artifact under review — a guest website's stylesheet and a video
  // composition authored at a fixed pixel canvas — rendered inside a sandboxed
  // frame or handed to the HyperFrames renderer. They are not app UI, the
  // webview zoom rule does not reach them, and rewriting them in rem would
  // misrepresent what a real site or a 1920x1080 composition looks like.
  ...[
    "font-size: 10px",
    "font-size: 11px",
    "font-size: 12px",
    "font-size: 14px",
    "font-size: 15px",
    "font-size: 16px",
    "font-size: 18px",
    "font-size: 25px",
  ].map((v) => `src/features/preview-studio/lib/demo/photographerSite.ts:${v}`),
  ...[
    "font-size: 22px",
    "font-size: 24px",
    "font-size: 92px",
    "font-size: 118px",
  ].map((v) => `src/features/preview-studio/lib/filmSource.ts:${v}`),

  "src/features/settings/ui/ProfileSettingsCard.tsx:text-[6rem]",
  "src/features/onboarding/ui/AvatarStep.tsx:text-[6rem]",
  "src/features/agents/ui/AgentCreationPreview.tsx:text-[4rem]",
  "src/features/agents/ui/AgentCreationPreview.tsx:text-[6rem]",
]);

await runPxTextCheck({
  projectRoot,
  rules,
  overrides,
  label: "Desktop",
  scriptPath: "desktop/scripts/check-px-text.mjs",
});
