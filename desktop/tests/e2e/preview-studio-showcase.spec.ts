import { expect, test } from "@playwright/test";

import { PHOTOGRAPHER_SITE_FILES } from "../../src/features/preview-studio/lib/demo/photographerSite";
import { REAL_PHOTOGRAPHS } from "../../src/features/preview-studio/lib/demo/photographs";
import { waitForAnimations } from "../helpers/animations";
import { installMockBridge, TEST_IDENTITIES } from "../helpers/bridge";

/**
 * Captures two deterministic BUZZ — LIVE PREVIEW STUDIO screenshot sets: the original
 * AniStream stage fixtures and the public documentation story that moves from
 * an agent conversation into a live site, responsive review, deck, and film.
 *
 * Regenerate assets with:
 *   pnpm build:e2e && pnpm exec playwright test preview-studio-showcase --project=smoke
 * Copy accepted documentation captures from
 * test-results/documentation-showcase into docs/assets/showcase.
 */

const SHOTS = "test-results/preview-studio-showcase";
const FEATURE_OVERRIDES_KEY = "buzz-feature-overrides-v1";
const LIBRARY_KEY = "buzz.previewStudio.library.v1";
const DOCUMENTATION_SHOTS = "test-results/documentation-showcase";
const WEDDING_PREVIEW_URL = "http://agent-preview.test/wedding";
const WEDDING_THUMBNAIL_URL = "http://agent-preview.test/wedding-thumbnail.jpg";
const DOCUMENTATION_TIME = new Date("2026-08-11T04:00:00Z");

const DOCUMENTATION_MOBILE_CSS = `
.hero .frame img {
  animation: none;
  transform: none;
}
.hero .cue span {
  animation: none;
  transform: scaleX(1);
}
@media (max-width: 600px) {
  nav,
  nav.solid {
    align-items: center;
    padding: 20px 22px;
  }
  nav.solid {
    background: rgba(23, 21, 15, 0.82);
    border-bottom-color: rgba(255, 255, 255, 0.16);
    color: #fff;
  }
  nav::after {
    content: "Menu";
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 999px;
    color: #fff;
    font-size: 9px;
    letter-spacing: 0.2em;
    padding: 7px 10px 7px 12px;
    text-transform: uppercase;
  }
  .mark {
    font-size: 14px;
    letter-spacing: 0.23em;
    white-space: nowrap;
  }
  .links {
    display: none;
  }
  .hero {
    display: grid;
    grid-template-rows: 62svh minmax(38svh, auto);
    height: auto;
    min-height: 100svh;
    background: var(--ink);
  }
  .hero .frame {
    grid-row: 1;
    position: relative;
  }
  .hero .frame img {
    object-position: 72% center;
  }
  .hero .wash {
    background:
      linear-gradient(180deg, rgba(23, 21, 15, 0.4) 0%, transparent 34%),
      linear-gradient(0deg, rgba(23, 21, 15, 0.62) 0%, transparent 26%);
    grid-row: 1;
    position: absolute;
  }
  .hero .caption {
    align-self: center;
    bottom: auto;
    grid-row: 2;
    left: auto;
    max-width: none;
    padding: 32px 22px 58px;
    position: relative;
  }
  .hero .caption h1 {
    font-size: 52px;
    line-height: 0.94;
    margin-bottom: 20px;
    max-width: 7ch;
  }
  .hero .caption p {
    font-size: 10px;
    line-height: 1.8;
    max-width: 24ch;
  }
  .hero .cue {
    bottom: 24px;
    left: 22px;
  }
  .statement {
    padding: 74px 24px 62px;
  }
  .statement p {
    font-size: 24px;
  }
  .work,
  .services,
  footer,
  .film .inner {
    padding-left: 18px;
    padding-right: 18px;
  }
  .grid {
    display: block;
  }
  .cell {
    aspect-ratio: 4 / 5;
    margin-bottom: 12px;
  }
  .film {
    height: 72svh;
  }
  .film .frame img {
    object-position: 58% center;
  }
  .services {
    padding-bottom: 76px;
    padding-top: 76px;
  }
  footer {
    padding-bottom: 42px;
    padding-top: 78px;
  }
}
`;

type Screen = {
  id: string;
  title: string;
  svg: string;
};

const PALETTE = {
  bg: "#0b0e15",
  surface: "#141927",
  card: "#1b2234",
  accent: "#a78bfa",
  accent2: "#38bdf8",
  warm: "#fbbf24",
  text: "#e9edf6",
  muted: "#8b95a8",
};

function phoneFrame(content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="786" height="1704" viewBox="0 0 393 852">
  <defs>
    <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${PALETTE.accent}"/>
      <stop offset="1" stop-color="${PALETTE.accent2}"/>
    </linearGradient>
    <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${PALETTE.warm}"/>
      <stop offset="1" stop-color="#f87171"/>
    </linearGradient>
    <linearGradient id="cool" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#34d399"/>
      <stop offset="1" stop-color="${PALETTE.accent2}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${PALETTE.bg}" stop-opacity="0"/>
      <stop offset="1" stop-color="${PALETTE.bg}"/>
    </linearGradient>
  </defs>
  <rect width="393" height="852" rx="46" fill="${PALETTE.bg}"/>
  <text x="32" y="36" font-family="system-ui" font-size="12" font-weight="600" fill="${PALETTE.text}">9:41</text>
  <rect x="330" y="26" width="24" height="12" rx="3.5" fill="none" stroke="${PALETTE.muted}" stroke-width="1"/>
  <rect x="332" y="28" width="16" height="8" rx="2" fill="${PALETTE.text}"/>
  ${content}
  <rect x="132" y="836" width="129" height="5" rx="2.5" fill="${PALETTE.text}" opacity="0.85"/>
</svg>`;
}

function homeScreen(): string {
  const cards = [0, 1, 2]
    .map(
      (i) => `
    <g transform="translate(${28 + i * 118}, 556)">
      <rect width="104" height="140" rx="14" fill="${PALETTE.card}"/>
      <rect width="104" height="96" rx="14" fill="url(#${["hero", "warm", "cool"][i]})" opacity="0.8"/>
      <rect y="82" width="104" height="14" fill="${PALETTE.card}"/>
      <text x="10" y="116" font-family="system-ui" font-size="10" font-weight="600" fill="${PALETTE.text}">${["Solar Knights", "Paper Comets", "Mirror Lake"][i]}</text>
      <text x="10" y="129" font-family="system-ui" font-size="8" fill="${PALETTE.muted}">Ep ${[7, 3, 11][i]} · ${[42, 12, 87][i]}% left</text>
      <rect x="10" y="70" width="84" height="3" rx="1.5" fill="#000" opacity="0.35"/>
      <rect x="10" y="70" width="${[49, 74, 11][i]}" height="3" rx="1.5" fill="${PALETTE.text}"/>
    </g>`,
    )
    .join("");
  return `
  <text x="28" y="86" font-family="system-ui" font-size="26" font-weight="800" fill="${PALETTE.text}">AniStream</text>
  <circle cx="349" cy="78" r="16" fill="url(#hero)"/>
  <text x="343" y="83" font-family="system-ui" font-size="12" font-weight="700" fill="#0b0e15">K</text>
  <rect x="28" y="112" width="337" height="380" rx="22" fill="url(#hero)"/>
  <rect x="28" y="332" width="337" height="160" rx="22" fill="url(#fade)" opacity="0.9"/>
  <text x="48" y="424" font-family="system-ui" font-size="11" font-weight="700" letter-spacing="2" fill="${PALETTE.warm}">NEW SEASON</text>
  <text x="48" y="452" font-family="system-ui" font-size="24" font-weight="800" fill="${PALETTE.text}">Solar Knights II</text>
  <rect x="48" y="464" width="96" height="30" rx="15" fill="${PALETTE.text}"/>
  <text x="66" y="484" font-family="system-ui" font-size="12" font-weight="700" fill="#0b0e15">▶ Play</text>
  <rect x="152" y="464" width="76" height="30" rx="15" fill="#ffffff" opacity="0.14"/>
  <text x="166" y="484" font-family="system-ui" font-size="12" font-weight="600" fill="${PALETTE.text}">+ List</text>
  <text x="28" y="540" font-family="system-ui" font-size="15" font-weight="700" fill="${PALETTE.text}">Continue watching</text>
  ${cards}
  <g transform="translate(0, 764)">
    <rect x="0" width="393" height="88" fill="${PALETTE.surface}"/>
    <text x="44" y="34" font-family="system-ui" font-size="16" fill="${PALETTE.accent}">⌂</text>
    <text x="136" y="34" font-family="system-ui" font-size="16" fill="${PALETTE.muted}">▤</text>
    <text x="228" y="34" font-family="system-ui" font-size="16" fill="${PALETTE.muted}">⌕</text>
    <text x="320" y="34" font-family="system-ui" font-size="16" fill="${PALETTE.muted}">☰</text>
  </g>`;
}

function playerScreen(): string {
  const upNext = [0, 1, 2]
    .map(
      (i) => `
    <g transform="translate(28, ${492 + i * 76})">
      <rect width="337" height="64" rx="14" fill="${PALETTE.card}"/>
      <rect x="10" y="10" width="78" height="44" rx="9" fill="url(#${["cool", "warm", "hero"][i]})" opacity="0.75"/>
      <text x="100" y="28" font-family="system-ui" font-size="12" font-weight="600" fill="${PALETTE.text}">Episode ${8 + i} — ${["Undertow", "The Lighthouse", "Static Bloom"][i]}</text>
      <text x="100" y="46" font-family="system-ui" font-size="10" fill="${PALETTE.muted}">${[24, 23, 25][i]} min</text>
    </g>`,
    )
    .join("");
  return `
  <text x="28" y="72" font-family="system-ui" font-size="14" fill="${PALETTE.muted}">‹ Back</text>
  <rect x="0" y="96" width="393" height="222" fill="url(#hero)"/>
  <rect x="0" y="96" width="393" height="222" fill="#000" opacity="0.25"/>
  <circle cx="196" cy="207" r="30" fill="#ffffff" opacity="0.92"/>
  <path d="M 188 192 L 212 207 L 188 222 Z" fill="#0b0e15"/>
  <rect x="24" y="292" width="345" height="4" rx="2" fill="#000" opacity="0.4"/>
  <rect x="24" y="292" width="128" height="4" rx="2" fill="${PALETTE.warm}"/>
  <text x="28" y="356" font-family="system-ui" font-size="19" font-weight="800" fill="${PALETTE.text}">Ep 7 — The Glass Sea</text>
  <text x="28" y="380" font-family="system-ui" font-size="12" fill="${PALETTE.muted}">Solar Knights · S1 · 9:12 / 24:00</text>
  <text x="28" y="424" font-family="system-ui" font-size="12" fill="${PALETTE.text}" opacity="0.85">The fleet crosses the mirror-calm strait while Aya
    <tspan x="28" dy="16">decodes the lighthouse signal.</tspan></text>
  <text x="28" y="474" font-family="system-ui" font-size="15" font-weight="700" fill="${PALETTE.text}">Up next</text>
  ${upNext}`;
}

function libraryScreen(): string {
  const titles = [
    "Solar Knights",
    "Paper Comets",
    "Mirror Lake",
    "Static Bloom",
    "North of Noon",
    "Glasswing",
  ];
  const grads = ["hero", "warm", "cool", "cool", "hero", "warm"];
  const grid = titles
    .map((t, i) => {
      const x = 28 + (i % 2) * 174;
      const y = 132 + Math.floor(i / 2) * 214;
      return `
    <g transform="translate(${x}, ${y})">
      <rect width="163" height="196" rx="16" fill="${PALETTE.card}"/>
      <rect width="163" height="148" rx="16" fill="url(#${grads[i]})" opacity="0.78"/>
      <rect y="132" width="163" height="16" fill="${PALETTE.card}"/>
      <text x="12" y="172" font-family="system-ui" font-size="12" font-weight="700" fill="${PALETTE.text}">${t}</text>
      <text x="12" y="187" font-family="system-ui" font-size="9" fill="${PALETTE.muted}">${12 + i * 3} episodes</text>
    </g>`;
    })
    .join("");
  return `
  <text x="28" y="86" font-family="system-ui" font-size="26" font-weight="800" fill="${PALETTE.text}">Library</text>
  <rect x="28" y="100" width="337" height="1" fill="#ffffff" opacity="0.08"/>
  ${grid}`;
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildLibrary() {
  const now = Date.now();
  const screens: Screen[] = [
    { id: "home", title: "AniStream — Home", svg: phoneFrame(homeScreen()) },
    {
      id: "player",
      title: "AniStream — Player",
      svg: phoneFrame(playerScreen()),
    },
    {
      id: "library",
      title: "AniStream — Library",
      svg: phoneFrame(libraryScreen()),
    },
  ];

  const artifacts = screens.map((screen, i) => ({
    id: `art-anistream-${screen.id}`,
    title: screen.title,
    artifactType: "image",
    currentRevisionId: `rev-anistream-${screen.id}-2`,
    createdAt: now - (i + 2) * 86_400_000,
    updatedAt: now - (i + 1) * 3_600_000,
  }));

  const revisions = screens.map((screen) => ({
    id: `rev-anistream-${screen.id}-2`,
    artifactId: `art-anistream-${screen.id}`,
    createdAt: now - 3_600_000,
    manifest: {
      schemaVersion: 1,
      artifactId: `art-anistream-${screen.id}`,
      revisionId: `rev-anistream-${screen.id}-2`,
      title: screen.title,
      artifactType: "image",
      source: {
        kind: "local",
        uri: svgDataUrl(screen.svg),
        mime: "image/svg+xml",
        filename: `${screen.id}@2x.svg`,
      },
      capabilities: ["view", "comment", "inspect", "approve"],
      securityPolicy: {
        network: "deny",
        clipboard: "deny",
        downloads: "allow",
      },
      provenance: {
        createdBy: "local",
        createdAt: new Date(now - 3_600_000).toISOString(),
      },
    },
  }));

  artifacts.push({
    id: "art-anistream-ios",
    title: "AniStream iOS — build 42",
    artifactType: "ios",
    currentRevisionId: "rev-anistream-ios-42",
    createdAt: now - 5 * 86_400_000,
    updatedAt: now - 2 * 3_600_000,
  });
  revisions.push({
    id: "rev-anistream-ios-42",
    artifactId: "art-anistream-ios",
    createdAt: now - 2 * 3_600_000,
    manifest: {
      schemaVersion: 1,
      artifactId: "art-anistream-ios",
      revisionId: "rev-anistream-ios-42",
      title: "AniStream iOS — build 42",
      artifactType: "ios",
      source: {
        kind: "blob",
        sha256: "e3".repeat(32),
        mime: "application/octet-stream",
        filename: "AniStream-42.ipa",
      },
      capabilities: ["view", "comment", "approve"],
      securityPolicy: { network: "deny", clipboard: "deny", downloads: "deny" },
      provenance: {
        createdBy: "local",
        workflowRun: "ci-build-42",
        createdAt: new Date(now - 2 * 3_600_000).toISOString(),
      },
    },
  } as (typeof revisions)[number]);

  const homeRev = "rev-anistream-home-2";
  const playerRev = "rev-anistream-player-2";
  return {
    version: 1,
    artifacts,
    revisions,
    reviews: [
      {
        id: "revw-1",
        revisionId: homeRev,
        body: "Hero gradient reads great in dark mode. Ship it.",
        status: "open",
        authorPubkey: "local",
        createdAt: now - 2_700_000,
        anchor: { revisionId: homeRev },
      },
      {
        id: "revw-2",
        revisionId: homeRev,
        body: "Progress bars on Continue Watching need 2px more contrast.",
        status: "open",
        authorPubkey: "local",
        createdAt: now - 1_500_000,
        anchor: { revisionId: homeRev, x: 0.12, y: 0.68 },
      },
      {
        id: "revw-3",
        revisionId: playerRev,
        body: "Scrubber thumb is hard to grab on device — bump the hit area.",
        status: "open",
        authorPubkey: "local",
        createdAt: now - 900_000,
        anchor: { revisionId: playerRev, x: 0.06, y: 0.34 },
      },
    ],
    decisions: [
      {
        revisionId: homeRev,
        reviewerPubkey: "local",
        status: "approved",
        updatedAt: now - 600_000,
      },
      {
        revisionId: playerRev,
        reviewerPubkey: "local",
        status: "changes_requested",
        updatedAt: now - 500_000,
      },
      {
        revisionId: "rev-anistream-library-2",
        reviewerPubkey: "local",
        status: "pending",
        updatedAt: now - 400_000,
      },
    ],
  };
}

function liveWeddingSite(): string {
  return PHOTOGRAPHER_SITE_FILES["/index.html"]
    .replace(
      '<link rel="stylesheet" href="styles.css" />',
      `<style>${PHOTOGRAPHER_SITE_FILES["/styles.css"]}${DOCUMENTATION_MOBILE_CSS}</style>`,
    )
    .replace(
      '<script src="motion.js"></script>',
      `<script>${PHOTOGRAPHER_SITE_FILES["/motion.js"]}</script>`,
    );
}

function weddingThumbnail(): Buffer {
  const encoded = REAL_PHOTOGRAPHS["images/hero.jpg"].split(",", 2)[1];
  if (!encoded) throw new Error("Wedding showcase hero photograph is missing");
  return Buffer.from(encoded, "base64");
}

async function attachWeddingThumbnail(page: import("@playwright/test").Page) {
  await page.evaluate(
    ([libraryKey, previewUrl, thumbnailUrl]) => {
      const raw = window.localStorage.getItem(libraryKey);
      if (!raw)
        throw new Error("BUZZ — LIVE PREVIEW STUDIO library was not persisted");
      const library = JSON.parse(raw) as {
        revisions: Array<{
          manifest: {
            source: { kind: string; url?: string };
            web?: { entry: string; files: Record<string, string> };
          };
        }>;
      };
      const revision = library.revisions.find(
        (candidate) =>
          candidate.manifest.source.kind === "url" &&
          candidate.manifest.source.url === previewUrl,
      );
      if (!revision) throw new Error("Agent preview revision was not created");
      revision.manifest.web = {
        entry: "/showcase-thumbnail.html",
        files: {
          "/showcase-thumbnail.html": `<img src="${thumbnailUrl}" alt="" />`,
        },
      };
      window.localStorage.setItem(libraryKey, JSON.stringify(library));
    },
    [LIBRARY_KEY, WEDDING_PREVIEW_URL, WEDDING_THUMBNAIL_URL] as const,
  );
  await page.reload();
}

async function waitForLiveSubscription(
  page: import("@playwright/test").Page,
  channelName: string,
) {
  await expect
    .poll(() =>
      page.evaluate(
        (name) =>
          window.__BUZZ_E2E_HAS_MOCK_LIVE_SUBSCRIPTION__?.({
            channelName: name,
          }) ?? false,
        channelName,
      ),
    )
    .toBe(true);
}

test.describe("preview studio showcase", () => {
  test.use({ viewport: { width: 1440, height: 840 }, deviceScaleFactor: 2 });

  test("captures README assets", async ({ page }) => {
    const library = buildLibrary();
    await page.addInitScript(
      ([overridesKey, libraryKey, lib]) => {
        window.localStorage.setItem(
          overridesKey as string,
          JSON.stringify({ "preview-studio": true }),
        );
        window.localStorage.setItem(libraryKey as string, lib as string);
        // Dark theme shows the Studio material layer as intended.
        window.localStorage.setItem("buzz-theme", "houston");
      },
      [FEATURE_OVERRIDES_KEY, LIBRARY_KEY, JSON.stringify(library)] as const,
    );
    await installMockBridge(page);

    // The static test server has no SPA fallback — enter via the sidebar.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByTestId("open-preview-studio-view").click();
    await expect(page.getByTestId("preview-studio-screen")).toBeVisible({
      timeout: 15_000,
    });

    // 1 — hero: home screen selected, approved, reviews visible
    await page
      .getByTestId("preview-studio-artifact-art-anistream-home")
      .click();
    await expect(page.locator('[data-stage-kind="image"] img')).toBeVisible();
    await waitForAnimations(page);
    await page.screenshot({ path: `${SHOTS}/01-hero.png` });

    // 2 — player screen with changes requested
    await page
      .getByTestId("preview-studio-artifact-art-anistream-player")
      .click();
    await expect(page.locator('[data-stage-kind="image"] img')).toBeVisible();
    await waitForAnimations(page);
    await page.screenshot({ path: `${SHOTS}/02-player-changes.png` });

    // 3 — library grid screen
    await page
      .getByTestId("preview-studio-artifact-art-anistream-library")
      .click();
    await expect(page.locator('[data-stage-kind="image"] img')).toBeVisible();
    await waitForAnimations(page);
    await page.screenshot({ path: `${SHOTS}/03-library.png` });

    // 4 — typed review comment on the player screen
    await page
      .getByTestId("preview-studio-artifact-art-anistream-player")
      .click();
    await page
      .getByTestId("preview-studio-review-input")
      .fill("Retest the scrubber after the hit-area fix on device.");
    await waitForAnimations(page);
    await page.screenshot({ path: `${SHOTS}/04-review.png` });

    // 5 — iOS build artifact fallback card (honest not-yet state)
    await page.getByTestId("preview-studio-artifact-art-anistream-ios").click();
    await expect(page.getByTestId("preview-studio-stage")).toBeVisible();
    await waitForAnimations(page);
    await page.screenshot({ path: `${SHOTS}/05-ios-artifact.png` });
  });
});

test.describe("documentation story", () => {
  test.use({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });

  test("captures chat, live preview, deck, and film review", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.clock.setFixedTime(DOCUMENTATION_TIME);
    await page.route(WEDDING_THUMBNAIL_URL, async (route) => {
      await route.fulfill({
        contentType: "image/jpeg",
        body: weddingThumbnail(),
      });
    });
    await page.route(WEDDING_PREVIEW_URL, async (route) => {
      await route.fulfill({
        contentType: "text/html",
        body: liveWeddingSite(),
      });
    });
    await installMockBridge(page, {
      searchProfiles: [
        {
          pubkey: TEST_IDENTITIES.tyler.pubkey,
          displayName: "Josh",
          isAgent: false,
        },
        {
          pubkey: TEST_IDENTITIES.alice.pubkey,
          displayName: "Fizz",
          isAgent: true,
          about: "Product design and frontend agent",
        },
      ],
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Browse channels" }).click();
    await page
      .getByTestId("browse-channel-design")
      .getByRole("button", { name: "Join" })
      .click();
    await expect(page.getByTestId("chat-title")).toHaveText("design");
    await waitForLiveSubscription(page, "design");
    await page.evaluate(
      ({ fizz, josh, previewUrl }) => {
        const emit = window.__BUZZ_E2E_EMIT_MOCK_MESSAGE__;
        const now = Math.floor(Date.now() / 1_000);
        emit?.({
          channelName: "design",
          content:
            "Fizz, build a quiet editorial wedding-photography site. It should feel cinematic, not like a template—and it must work beautifully on mobile.",
          createdAt: now - 180,
          id: "1".repeat(64),
          pubkey: josh,
        });
        emit?.({
          channelName: "design",
          content:
            "I’m on it. I’m building the visual system, real responsive sections, and a matching collections deck so the whole client journey feels coherent.",
          createdAt: now - 120,
          id: "2".repeat(64),
          pubkey: fizz,
        });
        emit?.({
          channelName: "design",
          content:
            "Keep the photography full-bleed, make the typography restrained, and give me something I can review live inside Buzz.",
          createdAt: now - 60,
          id: "3".repeat(64),
          pubkey: josh,
        });
        emit?.({
          channelName: "design",
          content: `The first complete pass is running now. I connected the portfolio, collections, enquiry flow, and responsive states. Live preview: ${previewUrl}`,
          createdAt: now,
          id: "4".repeat(64),
          pubkey: fizz,
        });
      },
      {
        fizz: TEST_IDENTITIES.alice.pubkey,
        josh: TEST_IDENTITIES.tyler.pubkey,
        previewUrl: WEDDING_PREVIEW_URL,
      },
    );

    const handoff = page.getByTestId("agent-preview-open");
    await expect(handoff).toBeVisible();
    await handoff.scrollIntoViewIfNeeded();
    await page.mouse.move(1_000, 40);
    await waitForAnimations(page);
    await page.screenshot({
      path: `${DOCUMENTATION_SHOTS}/01-agent-build-chat.png`,
    });

    await handoff.click();
    await expect(page).toHaveURL(/\/preview-studio$/);
    await attachWeddingThumbnail(page);
    const selectedAgentPreview = page.locator(
      '[data-testid^="preview-studio-artifact-agent_preview_"]',
    );
    await expect(selectedAgentPreview.locator("img")).toBeVisible();
    await expect(
      page
        .frameLocator('[data-testid="preview-studio-url-frame"]')
        .getByRole("heading", { name: "Days worth keeping." }),
    ).toBeVisible();
    await expect(page.getByTestId("preview-studio-inspector")).toHaveCount(0);
    await waitForAnimations(page);
    await page.screenshot({
      path: `${DOCUMENTATION_SHOTS}/02-live-wedding-desktop.png`,
    });

    await page.getByTestId("preview-studio-url-viewport-mobile").click();
    const weddingFrame = page.frameLocator(
      '[data-testid="preview-studio-url-frame"]',
    );
    await expect
      .poll(() =>
        weddingFrame.locator(".hero").evaluate((hero) => {
          const frame = hero.querySelector<HTMLElement>(".frame");
          const caption = hero.querySelector<HTMLElement>(".caption");
          const links =
            hero.ownerDocument.querySelector<HTMLElement>("nav .links");
          if (!frame || !caption || !links) return null;
          return {
            display: getComputedStyle(hero).display,
            linksDisplay: getComputedStyle(links).display,
            stacked:
              Math.abs(
                frame.getBoundingClientRect().bottom -
                  caption.getBoundingClientRect().top,
              ) <= 1,
          };
        }),
      )
      .toMatchObject({
        display: "grid",
        linksDisplay: "none",
        stacked: true,
      });
    await page.getByTestId("preview-studio-inspector-toggle").click();
    await expect(page.getByTestId("preview-studio-inspector")).toBeVisible();
    await page
      .getByTestId("preview-studio-review-input")
      .fill(
        "The mobile hero is ready. Keep this image crop for the final pass.",
      );
    await page.getByTestId("preview-studio-review-submit").click();
    await expect(page.getByText("The mobile hero is ready.")).toBeVisible();
    await waitForAnimations(page);
    await page.screenshot({
      path: `${DOCUMENTATION_SHOTS}/03-live-wedding-mobile-review.png`,
    });

    await page.getByTestId("preview-studio-artifact-art-pricing-deck").click();
    await expect(page.getByTestId("preview-studio-deck")).toBeVisible();
    await page.getByTestId("preview-studio-slide-next").click();
    await page.getByTestId("preview-studio-slide-next").click();
    await page
      .getByTestId("preview-studio-review-input")
      .fill("Lead with The Full Day collection on this slide.");
    await page.getByTestId("preview-studio-review-submit").click();
    await expect(page.getByText("Slide 3 ·", { exact: false })).toBeVisible();
    await waitForAnimations(page);
    await page.screenshot({
      path: `${DOCUMENTATION_SHOTS}/04-pricing-deck-review.png`,
    });

    await page.getByTestId("preview-studio-artifact-art-wedding-film").click();
    await expect(page.getByTestId("preview-studio-film-video")).toBeVisible();
    await page.getByRole("button", { name: "Cut", exact: true }).click();
    await page.getByTestId("preview-studio-film-scrub").evaluate((element) => {
      const input = element as HTMLInputElement;
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      setValue?.call(input, "4.2");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(
      page.getByTestId("preview-studio-film-timecode"),
    ).toContainText("00:04.2");
    await page
      .getByTestId("preview-studio-review-input")
      .fill("Hold this closing beat for another half-second.");
    await page.getByTestId("preview-studio-review-submit").click();
    await expect(page.getByText("4.2s ·", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Film", exact: true }).click();
    await expect(page.getByTestId("preview-studio-film-video")).toBeVisible();
    await waitForAnimations(page);
    await page.screenshot({
      path: `${DOCUMENTATION_SHOTS}/05-wedding-film-review.png`,
    });
  });
});
