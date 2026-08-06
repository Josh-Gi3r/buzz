/**
 * Demo website: a wedding photographer's portfolio.
 *
 * Real editorial layout, real copy, real image slots — the kind of site a
 * client would actually be reviewing. Photographs are referenced as
 * `/images/*.jpg` and supplied through the artifact's file map, so dropping in
 * real photography replaces the placeholders without touching the markup.
 */

import { REAL_PHOTOGRAPHS } from "./photographs";

const CSS = `
:root {
  --ivory: #faf7f2;
  --paper: #ffffff;
  --ink: #1c1917;
  --soft: #6b6560;
  --line: #e7e1d8;
  --accent: #8c7851;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--ivory);
  color: var(--ink);
  font-family: ui-sans-serif, -apple-system, "Helvetica Neue", sans-serif;
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, .display {
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.01em;
}
img { display: block; width: 100%; height: 100%; object-fit: cover; }

/* ---------- nav ---------- */
nav {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 48px;
  background: rgba(250,247,242,0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.mark { font-family: "Iowan Old Style", Georgia, serif; font-size: 19px; letter-spacing: 0.14em; text-transform: uppercase; }
.links { display: flex; gap: 34px; }
.links a { color: var(--soft); text-decoration: none; font-size: 13px; letter-spacing: 0.09em; text-transform: uppercase; }
.links a:hover { color: var(--ink); }

/* ---------- hero ---------- */
.hero { position: relative; height: 78vh; min-height: 460px; overflow: hidden; }
.hero .frame { position: absolute; inset: 0; }
.hero .wash { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(28,25,23,0.10) 0%, rgba(28,25,23,0.42) 100%); }
.hero .caption { position: absolute; left: 48px; bottom: 44px; color: #fff; max-width: 22ch; }
.hero .caption h1 { font-size: clamp(34px, 5vw, 60px); line-height: 1.05; margin: 0 0 10px; }
.hero .caption p { margin: 0; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.85; }

/* ---------- statement ---------- */
.statement { max-width: 660px; margin: 0 auto; padding: 96px 32px 72px; text-align: center; }
.statement p { font-family: "Iowan Old Style", Georgia, serif; font-size: clamp(21px, 2.4vw, 28px); line-height: 1.5; margin: 0 0 22px; }
.rule { width: 44px; height: 1px; background: var(--accent); margin: 0 auto; }

/* ---------- portfolio ---------- */
.work { padding: 24px 48px 88px; }
.eyebrow { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--soft); margin: 0 0 24px; }
.grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
.cell { position: relative; overflow: hidden; background: var(--line); }
.cell::after {
  content: attr(data-place); position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--soft);
}
.cell img { position: relative; z-index: 1; transition: transform 900ms cubic-bezier(.2,.8,.2,1); }
.cell:hover img { transform: scale(1.04); }
.tall { grid-column: span 2; aspect-ratio: 4 / 5; }
.wide { grid-column: span 4; aspect-ratio: 16 / 9; }
.half { grid-column: span 3; aspect-ratio: 3 / 2; }
.full { grid-column: span 6; aspect-ratio: 21 / 9; }

/* ---------- services ---------- */
.services { background: var(--paper); border-block: 1px solid var(--line); padding: 84px 48px; }
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 56px; max-width: 1100px; margin: 0 auto; }
.col h3 { font-size: 21px; margin: 0 0 10px; }
.col .price { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); margin: 0 0 14px; }
.col p { margin: 0; color: var(--soft); font-size: 15px; }

/* ---------- quote ---------- */
.quote { padding: 96px 32px; text-align: center; max-width: 720px; margin: 0 auto; }
.quote blockquote { font-family: "Iowan Old Style", Georgia, serif; font-size: clamp(20px, 2.2vw, 26px); line-height: 1.55; margin: 0 0 18px; }
.quote cite { font-style: normal; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--soft); }

/* ---------- contact ---------- */
footer { background: var(--ink); color: #f5f1ea; padding: 76px 48px 56px; }
.foot { display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; }
.foot h2 { font-size: clamp(28px, 3.4vw, 42px); margin: 0 0 12px; }
.foot p { margin: 0; color: #b9b1a6; font-size: 14px; }
.foot a.book {
  display: inline-block; padding: 13px 30px; border: 1px solid #f5f1ea; color: #f5f1ea;
  text-decoration: none; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
  transition: background 220ms, color 220ms;
}
.foot a.book:hover { background: #f5f1ea; color: var(--ink); }

@media (max-width: 820px) {
  nav { padding: 16px 20px; }
  .links { gap: 18px; }
  .links a { font-size: 11px; }
  .hero { height: 62vh; }
  .hero .caption { left: 20px; bottom: 28px; }
  .work, .services, footer { padding-left: 20px; padding-right: 20px; }
  .grid { grid-template-columns: repeat(2, 1fr); }
  .tall, .wide, .half, .full { grid-column: span 2; }
  .cols { grid-template-columns: 1fr; gap: 34px; }
}
`;

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Elena Marsh — Wedding Photography</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <nav>
    <div class="mark">Elena Marsh</div>
    <div class="links">
      <a href="#work">Work</a>
      <a href="#services">Collections</a>
      <a href="#contact">Enquire</a>
    </div>
  </nav>

  <header class="hero">
    <div class="frame"><img src="images/hero.jpg" alt="Couple at golden hour" /></div>
    <div class="wash"></div>
    <div class="caption">
      <h1>Days worth keeping.</h1>
      <p>Wedding photography · Lake Como &amp; beyond</p>
    </div>
  </header>

  <section class="statement">
    <p>I photograph quietly. No long shot lists, no posing you through your own wedding — just the day as it happens, and the people you love in it.</p>
    <div class="rule"></div>
  </section>

  <section class="work" id="work">
    <p class="eyebrow">Selected work</p>
    <div class="grid">
      <figure class="cell tall" data-place="Morning"><img src="images/gallery-1.jpg" alt="Bride fastening an earring, dress hanging behind" /></figure>
      <figure class="cell wide" data-place="Ceremony"><img src="images/gallery-2.jpg" alt="Ceremony above the lake" /></figure>
      <figure class="cell half" data-place="Details"><img src="images/gallery-3.jpg" alt="Invitation, rings and flowers" /></figure>
      <figure class="cell half" data-place="Reception"><img src="images/gallery-4.jpg" alt="First dance under the lights" /></figure>
      <figure class="cell tall" data-place="Candid"><img src="images/gallery-6.jpg" alt="Guests at golden hour" /></figure>
      <figure class="cell wide" data-place="Dusk"><img src="images/gallery-5.jpg" alt="Walking the terrace at dusk" /></figure>
    </div>
  </section>

  <section class="services" id="services">
    <p class="eyebrow">Collections</p>
    <div class="cols">
      <div class="col">
        <h3>The Morning</h3>
        <p class="price">From £1,400</p>
        <p>Six hours, preparations through to the first course. One photographer, gallery within three weeks.</p>
      </div>
      <div class="col">
        <h3>The Full Day</h3>
        <p class="price">From £2,600</p>
        <p>Sunrise to the last song. Second shooter, an engagement session beforehand, and a hand-bound album.</p>
      </div>
      <div class="col">
        <h3>Elsewhere</h3>
        <p class="price">On request</p>
        <p>Elopements and weddings further afield. Travel within Europe included; anywhere else, ask me.</p>
      </div>
    </div>
  </section>

  <section class="quote">
    <blockquote>“We forgot she was there, which is the whole point. Then the photographs arrived and we cried in the kitchen.”</blockquote>
    <cite>Lauren &amp; Quentin — Villa del Balbianello, June</cite>
  </section>

  <footer id="contact">
    <div class="foot">
      <div>
        <h2>Tell me about your day.</h2>
        <p>Booking 2027 · hello@elenamarsh.com</p>
      </div>
      <a class="book" href="#contact">Check availability</a>
    </div>
  </footer>

</body>
</html>
`;

/**
 * Placeholder photography: warm tonal fields so the layout reads correctly
 * before real images are dropped in. Replaced wholesale by
 * `scripts/studio-images` when a photography folder is supplied.
 */
function placeholder(tone: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${tone}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${tone}" stop-opacity="0.55"/>
    </linearGradient></defs>
    <rect width="1200" height="1500" fill="url(#g)"/>
    <text x="600" y="760" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#ffffff" opacity="0.5">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

/** Photograph slots. Replace a value with a real image URL or data URI. */
export const PHOTOGRAPHS: Record<string, string> = {
  "images/hero.jpg": placeholder("#8a7a68", "Hero"),
  "images/gallery-1.jpg": placeholder("#9a8b7c", "Morning"),
  "images/gallery-2.jpg": placeholder("#7d7f70", "Ceremony"),
  "images/gallery-3.jpg": placeholder("#a8968a", "Details"),
  "images/gallery-4.jpg": placeholder("#6f6b66", "Reception"),
  "images/gallery-5.jpg": placeholder("#8f8377", "Landscape"),
  "images/gallery-6.jpg": placeholder("#9c8f80", "Candid"),
};

/** Inline the photographs so the preview renders them without a file server. */
function withPhotographs(html: string): string {
  let out = html;
  // Real photography, when supplied, replaces the tonal placeholders.
  const all = { ...PHOTOGRAPHS, ...REAL_PHOTOGRAPHS };
  for (const [path, uri] of Object.entries(all)) {
    out = out.replaceAll(`src="${path}"`, `src="${uri}"`);
  }
  return out;
}

export const PHOTOGRAPHER_SITE_FILES: Record<string, string> = {
  "/index.html": withPhotographs(HTML),
  "/styles.css": CSS,
};
