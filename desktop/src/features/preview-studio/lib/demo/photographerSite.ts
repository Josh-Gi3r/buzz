/**
 * Demo website: a wedding photographer's portfolio.
 *
 * Real editorial layout, real copy, real image slots — the kind of site a
 * client would actually be reviewing, and the same brand as the pricing deck
 * and the film in the demo library. Photographs are referenced as
 * `/images/*.jpg` and supplied through the artifact's file map, so dropping in
 * real photography replaces the placeholders without touching the markup.
 */

import { REAL_PHOTOGRAPHS } from "./photographs";

const CSS = `
:root {
  --ivory: #f7f4ee;
  --paper: #fffefb;
  --ink: #17150f;
  --soft: #6a6355;
  --line: #e3ddd1;
  --accent: #9a7f4e;
  --ease: cubic-bezier(.16,.84,.44,1);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--ivory);
  color: var(--ink);
  font-family: ui-sans-serif, -apple-system, "Helvetica Neue", sans-serif;
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, .display, blockquote {
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.015em;
}
img { display: block; width: 100%; height: 100%; object-fit: cover; }
a { color: inherit; }

/* paper grain — keeps large ivory fields from reading as flat screen white */
body::after {
  content: ""; position: fixed; inset: 0; z-index: 60; pointer-events: none;
  opacity: 0.5; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
}

.eyebrow {
  font-size: 11px; letter-spacing: 0.26em; text-transform: uppercase;
  color: var(--soft); margin: 0 0 28px;
}

/* ---------- reveal ---------- */
.reveal { opacity: 0; transform: translateY(26px); transition: opacity 1.1s var(--ease), transform 1.1s var(--ease); }
.reveal.in { opacity: 1; transform: none; }
.reveal.d1 { transition-delay: 90ms; }
.reveal.d2 { transition-delay: 180ms; }
.reveal.d3 { transition-delay: 270ms; }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
  html { scroll-behavior: auto; }
}

/* ---------- nav ---------- */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 26px 52px;
  color: #fff;
  transition: background 600ms var(--ease), color 600ms var(--ease), padding 600ms var(--ease), border-color 600ms var(--ease);
  border-bottom: 1px solid transparent;
}
nav.solid {
  background: rgba(247,244,238,0.92);
  backdrop-filter: blur(14px);
  color: var(--ink);
  padding: 16px 52px;
  border-bottom-color: var(--line);
}
.mark { font-family: "Iowan Old Style", Georgia, serif; font-size: 18px; letter-spacing: 0.3em; text-transform: uppercase; }
.links { display: flex; gap: 36px; }
.links a { text-decoration: none; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.82; position: relative; }
.links a::after {
  content: ""; position: absolute; left: 0; bottom: -6px; height: 1px; width: 0;
  background: currentColor; transition: width 420ms var(--ease);
}
.links a:hover { opacity: 1; }
.links a:hover::after { width: 100%; }

/* ---------- hero ---------- */
.hero { position: relative; height: 100svh; min-height: 560px; overflow: hidden; }
.hero .frame { position: absolute; inset: 0; }
.hero .frame img { transform: scale(1.08); animation: settle 2600ms var(--ease) forwards; }
@keyframes settle { to { transform: scale(1); } }
.hero .wash {
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(23,21,15,0.42) 0%, rgba(23,21,15,0) 34%),
    linear-gradient(0deg, rgba(23,21,15,0.58) 0%, rgba(23,21,15,0) 52%);
}
.hero .caption { position: absolute; left: 52px; bottom: 15vh; color: #fff; max-width: 20ch; }
.hero .caption h1 { font-size: clamp(44px, 6.4vw, 92px); line-height: 0.98; margin: 0 0 18px; }
.hero .caption p { margin: 0; font-size: 12px; letter-spacing: 0.26em; text-transform: uppercase; opacity: 0.9; }
.hero .cue {
  position: absolute; left: 52px; bottom: 44px; color: #fff; opacity: 0.7;
  font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
  display: flex; align-items: center; gap: 12px;
}
.hero .cue span { display: block; width: 46px; height: 1px; background: currentColor; animation: slide 2.6s var(--ease) infinite; transform-origin: left; }
@keyframes slide { 0%,100% { transform: scaleX(0.4); } 50% { transform: scaleX(1); } }

/* ---------- statement ---------- */
.statement { max-width: 720px; margin: 0 auto; padding: 132px 32px 104px; text-align: center; }
.statement p { font-size: clamp(23px, 2.7vw, 33px); line-height: 1.45; margin: 0 0 30px; }
.rule { width: 52px; height: 1px; background: var(--accent); margin: 0 auto; }

/* ---------- portfolio ---------- */
.work { padding: 0 52px 120px; }
.grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
.cell { position: relative; overflow: hidden; background: var(--line); }
.cell img { transition: transform 1.4s var(--ease); }
.cell:hover img { transform: scale(1.05); }
.cell figcaption {
  position: absolute; left: 0; bottom: 0; padding: 14px 18px;
  font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #fff;
  opacity: 0; transform: translateY(8px);
  transition: opacity 520ms var(--ease), transform 520ms var(--ease);
  text-shadow: 0 1px 12px rgba(23,21,15,0.6);
}
.cell:hover figcaption { opacity: 1; transform: none; }
.tall  { grid-column: span 4; aspect-ratio: 4 / 5; }
.wide  { grid-column: span 8; aspect-ratio: 16 / 10; }
.half  { grid-column: span 6; aspect-ratio: 3 / 2; }
.offset { grid-column: span 5; aspect-ratio: 4 / 5; align-self: end; }
.push  { grid-column: span 7; aspect-ratio: 16 / 10; }

/* ---------- the film ---------- */
.film { position: relative; height: 78svh; min-height: 460px; overflow: hidden; }
.film .frame { position: absolute; inset: 0; }
.film .wash { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(23,21,15,0.72) 0%, rgba(23,21,15,0.18) 62%); }
.film .inner {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  justify-content: center; padding: 0 52px; color: #fff; max-width: 46ch;
}
.film h2 { font-size: clamp(28px, 3.2vw, 46px); line-height: 1.1; margin: 0 0 18px; max-width: 15ch; }
.film p { margin: 0 0 26px; color: rgba(255,255,255,0.82); font-size: 15px; }
.film .play {
  display: inline-flex; align-items: center; gap: 14px; align-self: flex-start;
  border: 1px solid rgba(255,255,255,0.65); border-radius: 999px;
  padding: 12px 26px 12px 16px; text-decoration: none;
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  transition: background 420ms var(--ease), color 420ms var(--ease);
}
.film .play:hover { background: #fff; color: var(--ink); }
.film .play i { display: block; width: 0; height: 0; border-style: solid; border-width: 5px 0 5px 9px; border-color: transparent transparent transparent currentColor; }

/* ---------- collections ---------- */
.services { background: var(--paper); border-block: 1px solid var(--line); padding: 116px 52px; }
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 64px; max-width: 1180px; margin: 0 auto; }
.col { border-top: 1px solid var(--line); padding-top: 26px; transition: border-color 500ms var(--ease); }
.col:hover { border-top-color: var(--accent); }
.col h3 { font-size: 25px; margin: 0 0 8px; }
.col .price { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); margin: 0 0 18px; }
.col p { margin: 0; color: var(--soft); font-size: 15px; }

/* ---------- quote ---------- */
.quote { padding: 128px 32px; text-align: center; max-width: 780px; margin: 0 auto; }
.quote blockquote { font-size: clamp(22px, 2.5vw, 30px); line-height: 1.5; margin: 0 0 24px; }
.quote cite { font-style: normal; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--soft); }

/* ---------- contact ---------- */
footer { background: var(--ink); color: #f6f2e9; padding: 108px 52px 64px; }
.foot { display: flex; justify-content: space-between; align-items: flex-end; gap: 48px; max-width: 1180px; margin: 0 auto; flex-wrap: wrap; }
.foot h2 { font-size: clamp(32px, 4.2vw, 58px); margin: 0 0 16px; }
.foot p { margin: 0; color: #a9a08f; font-size: 14px; }
.foot a.book {
  display: inline-block; padding: 15px 34px; border: 1px solid #f6f2e9; color: #f6f2e9;
  text-decoration: none; font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase;
  transition: background 380ms var(--ease), color 380ms var(--ease);
}
.foot a.book:hover { background: #f6f2e9; color: var(--ink); }
.colophon {
  max-width: 1180px; margin: 72px auto 0; padding-top: 26px;
  border-top: 1px solid rgba(246,242,233,0.16);
  display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8d8474;
}

@media (max-width: 900px) {
  nav, nav.solid { padding: 16px 22px; }
  .links { gap: 18px; }
  .links a { font-size: 10px; letter-spacing: 0.16em; }
  .hero .caption, .hero .cue { left: 22px; }
  .work, .services, footer, .film .inner { padding-left: 22px; padding-right: 22px; }
  .grid { grid-template-columns: repeat(6, 1fr); gap: 12px; }
  .tall, .wide, .half, .offset, .push { grid-column: span 6; }
  .cols { grid-template-columns: 1fr; gap: 40px; }
  .statement { padding: 84px 24px 68px; }
}
`;

const JS = `
// Reveal on scroll, and a nav that turns solid once the hero is behind you.
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    }
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
);
for (const el of document.querySelectorAll(".reveal")) io.observe(el);

const nav = document.querySelector("nav");
const hero = document.querySelector(".hero");
const navWatcher = new IntersectionObserver(
  ([entry]) => nav.classList.toggle("solid", !entry.isIntersecting),
  { threshold: 0.08 },
);
if (hero) navWatcher.observe(hero);
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
      <a href="#film">Film</a>
      <a href="#services">Collections</a>
      <a href="#contact">Enquire</a>
    </div>
  </nav>

  <header class="hero">
    <div class="frame"><img src="images/hero.jpg" alt="Couple at golden hour above Lake Como" /></div>
    <div class="wash"></div>
    <div class="caption">
      <h1>Days worth keeping.</h1>
      <p>Wedding photography · Lake Como &amp; beyond</p>
    </div>
    <div class="cue"><span></span> Scroll</div>
  </header>

  <section class="statement">
    <p class="reveal">I photograph quietly. No long shot lists, no posing you through your own wedding — just the day as it happens, and the people you love in it.</p>
    <div class="rule reveal d1"></div>
  </section>

  <section class="work" id="work">
    <p class="eyebrow reveal">Selected work</p>
    <div class="grid">
      <figure class="cell tall reveal"><img src="images/gallery-1.jpg" alt="Bride fastening an earring, dress hanging behind" /><figcaption>The morning</figcaption></figure>
      <figure class="cell wide reveal d1"><img src="images/gallery-2.jpg" alt="Ceremony above the lake" /><figcaption>The ceremony</figcaption></figure>
      <figure class="cell half reveal"><img src="images/gallery-3.jpg" alt="Invitation, rings and flowers" /><figcaption>Details</figcaption></figure>
      <figure class="cell half reveal d1"><img src="images/gallery-4.jpg" alt="First dance under the lights" /><figcaption>The first dance</figcaption></figure>
      <figure class="cell offset reveal"><img src="images/gallery-6.jpg" alt="Guests laughing at golden hour" /><figcaption>Somewhere near the toasts</figcaption></figure>
      <figure class="cell push reveal d1"><img src="images/gallery-5.jpg" alt="Walking the terrace at dusk" /><figcaption>Last light</figcaption></figure>
    </div>
  </section>

  <section class="film" id="film">
    <div class="frame"><img src="images/deck-closing.jpg" alt="Couple walking out under string lights" /></div>
    <div class="wash"></div>
    <div class="inner">
      <p class="eyebrow reveal" style="color:rgba(255,255,255,0.7)">Also filmed</p>
      <h2 class="reveal d1">A short film of the day, cut from the photographs.</h2>
      <p class="reveal d2">Twenty-five seconds, no music over the vows. Included with the Full Day collection.</p>
      <a class="play reveal d3" href="#contact"><i></i> Watch the film</a>
    </div>
  </section>

  <section class="services" id="services">
    <p class="eyebrow reveal">Collections</p>
    <div class="cols">
      <div class="col reveal">
        <h3>The Morning</h3>
        <p class="price">From £1,400</p>
        <p>Six hours, preparations through to the first course. One photographer, gallery within three weeks.</p>
      </div>
      <div class="col reveal d1">
        <h3>The Full Day</h3>
        <p class="price">From £2,600</p>
        <p>Sunrise to the last song. Second shooter, an engagement session beforehand, a hand-bound album, and the film.</p>
      </div>
      <div class="col reveal d2">
        <h3>Elsewhere</h3>
        <p class="price">On request</p>
        <p>Elopements and weddings further afield. Travel within Europe included; anywhere else, ask me.</p>
      </div>
    </div>
  </section>

  <section class="quote">
    <blockquote class="reveal">“We forgot she was there, which is the whole point. Then the photographs arrived and we cried in the kitchen.”</blockquote>
    <cite class="reveal d1">Lauren &amp; Quentin — Villa del Balbianello, June</cite>
  </section>

  <footer id="contact">
    <div class="foot">
      <div>
        <h2 class="reveal">Tell me about your day.</h2>
        <p class="reveal d1">Booking 2027 · three dates left in June and September · hello@elenamarsh.com</p>
      </div>
      <a class="book reveal d2" href="#contact">Check availability</a>
    </div>
    <div class="colophon">
      <span>Elena Marsh Photography</span>
      <span>Lake Como · Somerset · anywhere you are</span>
    </div>
  </footer>

  <script src="motion.js"></script>
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
  "images/deck-closing.jpg": placeholder("#4c443c", "Walking out"),
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
  "/motion.js": JS,
};
