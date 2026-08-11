/**
 * Self-contained demo artwork, inlined as SVG data URIs.
 *
 * The seeds must look like the thing their title claims — a homepage artifact
 * shows a homepage, not a stock photo — and must render with no network, so a
 * first run works offline.
 */

const INK = "#0b0e15";
const SURFACE = "#141927";
const CARD = "#1b2234";
const ACCENT = "#a78bfa";
const ACCENT_2 = "#38bdf8";
const WARM = "#fbbf24";
const TEXT = "#e9edf6";
const MUTED = "#8b95a8";

function dataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

/** A desktop website homepage inside browser chrome. */
function homepageSvg(): string {
  const cards = [0, 1, 2]
    .map(
      (i) => `
      <g transform="translate(${96 + i * 288}, 620)">
        <rect width="256" height="188" rx="16" fill="${CARD}"/>
        <rect width="256" height="104" rx="16" fill="url(#g${i + 1})" opacity="0.85"/>
        <rect y="88" width="256" height="16" fill="${CARD}"/>
        <rect x="20" y="126" width="150" height="11" rx="5.5" fill="${TEXT}" opacity="0.9"/>
        <rect x="20" y="148" width="200" height="8" rx="4" fill="${MUTED}" opacity="0.6"/>
        <rect x="20" y="162" width="170" height="8" rx="4" fill="${MUTED}" opacity="0.45"/>
      </g>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${ACCENT}"/><stop offset="1" stop-color="${ACCENT_2}"/>
      </linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${WARM}"/><stop offset="1" stop-color="#f87171"/>
      </linearGradient>
      <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="${ACCENT_2}"/>
      </linearGradient>
      <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.35"/>
        <stop offset="1" stop-color="${ACCENT_2}" stop-opacity="0.18"/>
      </linearGradient>
    </defs>

    <rect width="1600" height="1000" fill="${INK}"/>

    <!-- browser chrome -->
    <rect width="1600" height="56" fill="${SURFACE}"/>
    <circle cx="32" cy="28" r="7" fill="#f87171"/>
    <circle cx="56" cy="28" r="7" fill="${WARM}"/>
    <circle cx="80" cy="28" r="7" fill="#34d399"/>
    <rect x="120" y="14" width="520" height="28" rx="14" fill="${INK}"/>
    <text x="140" y="33" font-family="ui-monospace, monospace" font-size="13" fill="${MUTED}">https://northwind.studio</text>

    <!-- site nav -->
    <text x="96" y="120" font-family="system-ui" font-size="24" font-weight="800" fill="${TEXT}">Northwind</text>
    <text x="1090" y="120" font-family="system-ui" font-size="14" fill="${MUTED}">Product</text>
    <text x="1190" y="120" font-family="system-ui" font-size="14" fill="${MUTED}">Pricing</text>
    <text x="1284" y="120" font-family="system-ui" font-size="14" fill="${MUTED}">Docs</text>
    <rect x="1360" y="98" width="144" height="34" rx="17" fill="${TEXT}"/>
    <text x="1392" y="121" font-family="system-ui" font-size="14" font-weight="700" fill="${INK}">Get started</text>

    <!-- hero -->
    <rect x="96" y="176" width="1408" height="380" rx="24" fill="url(#hero)"/>
    <text x="152" y="300" font-family="system-ui" font-size="52" font-weight="800" fill="${TEXT}">Ship work people can see.</text>
    <text x="152" y="350" font-family="system-ui" font-size="20" fill="${MUTED}">Preview, review and approve every artifact in one place.</text>
    <rect x="152" y="392" width="168" height="48" rx="24" fill="${TEXT}"/>
    <text x="188" y="422" font-family="system-ui" font-size="16" font-weight="700" fill="${INK}">Start free</text>
    <rect x="336" y="392" width="150" height="48" rx="24" fill="#ffffff" opacity="0.12"/>
    <text x="370" y="422" font-family="system-ui" font-size="16" font-weight="600" fill="${TEXT}">Book demo</text>

    <!-- feature row -->
    <text x="96" y="592" font-family="system-ui" font-size="18" font-weight="700" fill="${TEXT}">Built for review</text>
    ${cards}

    <!-- footer -->
    <rect x="0" y="900" width="1600" height="100" fill="${SURFACE}"/>
    <text x="96" y="956" font-family="system-ui" font-size="13" fill="${MUTED}">© Northwind — sample content for the BUZZ — LIVE PREVIEW STUDIO demo library</text>
  </svg>`;
}

/** A brand key visual / poster. */
function brandStillSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1a1030"/><stop offset="1" stop-color="#06131f"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${WARM}"/><stop offset="1" stop-color="${ACCENT_2}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)"/>
    <rect width="1200" height="800" fill="url(#glow)"/>
    <circle cx="600" cy="360" r="180" fill="none" stroke="url(#ring)" stroke-width="3" opacity="0.9"/>
    <circle cx="600" cy="360" r="128" fill="none" stroke="${TEXT}" stroke-width="1.5" opacity="0.35"/>
    <circle cx="600" cy="360" r="64" fill="url(#ring)" opacity="0.85"/>
    <text x="600" y="600" text-anchor="middle" font-family="system-ui" font-size="46" font-weight="800" letter-spacing="14" fill="${TEXT}">NORTHWIND</text>
    <text x="600" y="640" text-anchor="middle" font-family="system-ui" font-size="15" letter-spacing="6" fill="${MUTED}">KEY VISUAL — AUTUMN</text>
  </svg>`;
}

/** Poster frame for the demo video. */
function motionPosterSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="v" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${ACCENT}"/><stop offset="1" stop-color="${ACCENT_2}"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="${INK}"/>
    <rect width="1280" height="720" fill="url(#v)" opacity="0.35"/>
    <circle cx="640" cy="340" r="64" fill="#ffffff" opacity="0.92"/>
    <path d="M 620 308 L 676 340 L 620 372 Z" fill="${INK}"/>
    <text x="640" y="470" text-anchor="middle" font-family="system-ui" font-size="30" font-weight="700" fill="${TEXT}">Campaign motion cut</text>
    <text x="640" y="506" text-anchor="middle" font-family="system-ui" font-size="15" fill="${MUTED}">30s · autumn launch</text>
  </svg>`;
}

export const DEMO_HOMEPAGE_IMAGE = dataUri(homepageSvg());
export const DEMO_BRAND_STILL = dataUri(brandStillSvg());
export const DEMO_MOTION_POSTER = dataUri(motionPosterSvg());

/** Investor-deck slides. Each entry is a full 16:9 slide. */
function slide(
  inner: string,
  footer: string,
  index: number,
  total: number,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <defs>
      <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${ACCENT}"/><stop offset="1" stop-color="${ACCENT_2}"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="${INK}"/>
    <rect width="1600" height="6" fill="url(#acc)"/>
    ${inner}
    <text x="96" y="836" font-family="system-ui" font-size="14" fill="${MUTED}">${footer}</text>
    <text x="1504" y="836" text-anchor="end" font-family="system-ui" font-size="14" fill="${MUTED}">${index} / ${total}</text>
  </svg>`;
}

function bar(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  o = 1,
): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" opacity="${o}"/>`;
}

const TOTAL_SLIDES = 5;

const DECK_SLIDES = [
  slide(
    `<text x="96" y="380" font-family="system-ui" font-size="82" font-weight="800" fill="${TEXT}">Northwind</text>
     <text x="96" y="452" font-family="system-ui" font-size="30" fill="${MUTED}">Preview, review and approve every artifact in one place.</text>
     <rect x="96" y="500" width="220" height="4" fill="url(#acc)"/>
     <text x="96" y="560" font-family="system-ui" font-size="18" fill="${MUTED}">Series A · Autumn 2026</text>`,
    "Northwind — confidential",
    1,
    TOTAL_SLIDES,
  ),
  slide(
    `<text x="96" y="180" font-family="system-ui" font-size="44" font-weight="800" fill="${TEXT}">The problem</text>
     <text x="96" y="290" font-family="system-ui" font-size="26" fill="${TEXT}" opacity="0.9">Feedback on work lives in five places at once.</text>
     <text x="96" y="360" font-family="system-ui" font-size="20" fill="${MUTED}">• Screenshots pasted into chat lose the version they referred to</text>
     <text x="96" y="410" font-family="system-ui" font-size="20" fill="${MUTED}">• Comments drift once the file changes underneath them</text>
     <text x="96" y="460" font-family="system-ui" font-size="20" fill="${MUTED}">• Approvals are verbal, so nobody can prove what was signed off</text>
     <text x="96" y="510" font-family="system-ui" font-size="20" fill="${MUTED}">• Every format needs a different tool</text>`,
    "Northwind — confidential",
    2,
    TOTAL_SLIDES,
  ),
  slide(
    `<text x="96" y="180" font-family="system-ui" font-size="44" font-weight="800" fill="${TEXT}">How it works</text>
     <g transform="translate(96,280)">
       <rect width="420" height="220" rx="18" fill="${CARD}"/>
       <text x="36" y="72" font-family="system-ui" font-size="24" font-weight="700" fill="${TEXT}">1 · Artifact</text>
       <text x="36" y="118" font-family="system-ui" font-size="17" fill="${MUTED}">A stable thing being made —</text>
       <text x="36" y="146" font-family="system-ui" font-size="17" fill="${MUTED}">a deck, a cut, a screen.</text>
     </g>
     <g transform="translate(590,280)">
       <rect width="420" height="220" rx="18" fill="${CARD}"/>
       <text x="36" y="72" font-family="system-ui" font-size="24" font-weight="700" fill="${TEXT}">2 · Revision</text>
       <text x="36" y="118" font-family="system-ui" font-size="17" fill="${MUTED}">Immutable. Feedback can</text>
       <text x="36" y="146" font-family="system-ui" font-size="17" fill="${MUTED}">never drift off its version.</text>
     </g>
     <g transform="translate(1084,280)">
       <rect width="420" height="220" rx="18" fill="${CARD}"/>
       <text x="36" y="72" font-family="system-ui" font-size="24" font-weight="700" fill="${TEXT}">3 · Decision</text>
       <text x="36" y="118" font-family="system-ui" font-size="17" fill="${MUTED}">Approved or changes</text>
       <text x="36" y="146" font-family="system-ui" font-size="17" fill="${MUTED}">requested — on the record.</text>
     </g>`,
    "Northwind — confidential",
    3,
    TOTAL_SLIDES,
  ),
  slide(
    `<text x="96" y="180" font-family="system-ui" font-size="44" font-weight="800" fill="${TEXT}">Traction</text>
     ${bar(96, 640, 150, 90, ACCENT, 0.45)}
     ${bar(300, 590, 150, 140, ACCENT, 0.6)}
     ${bar(504, 500, 150, 230, ACCENT, 0.75)}
     ${bar(708, 400, 150, 330, ACCENT, 0.9)}
     ${bar(912, 280, 150, 450, ACCENT_2)}
     <text x="96" y="762" font-family="system-ui" font-size="15" fill="${MUTED}">Q1</text>
     <text x="300" y="762" font-family="system-ui" font-size="15" fill="${MUTED}">Q2</text>
     <text x="504" y="762" font-family="system-ui" font-size="15" fill="${MUTED}">Q3</text>
     <text x="708" y="762" font-family="system-ui" font-size="15" fill="${MUTED}">Q4</text>
     <text x="912" y="762" font-family="system-ui" font-size="15" fill="${MUTED}">Q1</text>
     <text x="1140" y="330" font-family="system-ui" font-size="56" font-weight="800" fill="${TEXT}">4.2×</text>
     <text x="1140" y="372" font-family="system-ui" font-size="18" fill="${MUTED}">year over year</text>`,
    "Northwind — confidential",
    4,
    TOTAL_SLIDES,
  ),
  slide(
    `<text x="96" y="180" font-family="system-ui" font-size="44" font-weight="800" fill="${TEXT}">The ask</text>
     <text x="96" y="300" font-family="system-ui" font-size="64" font-weight="800" fill="url(#acc)">$6M Series A</text>
     <text x="96" y="380" font-family="system-ui" font-size="22" fill="${MUTED}">18 months of runway · engineering and go-to-market</text>
     <g transform="translate(96,460)">
       <rect width="640" height="180" rx="18" fill="${CARD}"/>
       <text x="36" y="60" font-family="system-ui" font-size="19" fill="${TEXT}">60%  Engineering</text>
       <text x="36" y="106" font-family="system-ui" font-size="19" fill="${TEXT}">25%  Go-to-market</text>
       <text x="36" y="152" font-family="system-ui" font-size="19" fill="${TEXT}">15%  Operations</text>
     </g>`,
    "Northwind — confidential",
    5,
    TOTAL_SLIDES,
  ),
];

export const DEMO_DECK_SLIDES: string[] = DECK_SLIDES.map(dataUri);
