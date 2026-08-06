/**
 * A deck is HTML, not pictures.
 *
 * Slides are stored as markup on the revision so their text stays selectable,
 * editable, and exportable. The review stage renders that markup directly and
 * `Present` hands the same markup to reveal.js. See docs/design/architecture.md
 * — flat media is the fallback representation, never the primary one.
 */

import { REAL_PHOTOGRAPHS } from "./demo/photographs";

/** How a slide is laid out. Plain text unless it carries a photograph. */
export type DeckLayout = "text" | "split" | "cover" | "closing";

export type DeckSlide = {
  /** Slide heading, also used as the presentation title. */
  title: string;
  /** Body markup: paragraphs, lists, and simple emphasis. */
  html: string;
  /** Optional speaker notes (reveal presenter mode). */
  notes?: string;
  /** Layout hint for the stage. Defaults to `text`. */
  layout?: DeckLayout;
};

export type DeckDocument = {
  version: 1;
  theme: "studio";
  slides: DeckSlide[];
};

export function isDeckDocument(value: unknown): value is DeckDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as DeckDocument;
  return doc.version === 1 && Array.isArray(doc.slides);
}

/** Plain text of a slide, for search and export bodies. */
export function slideText(slide: DeckSlide): string {
  return slide.html
    .replace(/<li>/g, "\n• ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Deck photography, inlined as a data URI so a slide carries its own image.
 * Falls back to a tonal field when no real photograph has been supplied.
 */
function photo(slot: string, tone: string, label: string): string {
  const real = REAL_PHOTOGRAPHS[`images/${slot}.jpg`];
  if (real) return real;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <rect width="1600" height="900" fill="${tone}"/>
    <text x="800" y="460" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#ffffff" opacity="0.55">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

/**
 * Slide markup references a photograph by slot (`src="deck:cover"`), never by
 * data URI. The stage swaps slots for pixels at render time and swaps them back
 * on save, so a revision stores a couple of kilobytes of markup rather than a
 * megabyte of base64 — an edited deck would otherwise fill the device quota
 * within a few revisions.
 */
const DECK_MEDIA: Record<string, string> = {
  "deck:cover": photo("deck-cover", "#8a7a68", "Lake Como at dusk"),
  "deck:approach": photo("deck-approach", "#6f5f52", "Under the archway"),
  "deck:album": photo("deck-album", "#a8968a", "Album and prints"),
  "deck:closing": photo("deck-closing", "#4c443c", "Walking out"),
};

/** Slot references → real pixels, for rendering. */
export function resolveDeckMedia(html: string): string {
  let out = html;
  for (const [slot, uri] of Object.entries(DECK_MEDIA)) {
    out = out.replaceAll(`src="${slot}"`, `src="${uri}"`);
  }
  return out;
}

/** Pixels → slot references, for storing an edited slide back on a revision. */
export function unresolveDeckMedia(html: string): string {
  let out = html;
  for (const [slot, uri] of Object.entries(DECK_MEDIA)) {
    out = out.replaceAll(`src="${uri}"`, `src="${slot}"`);
  }
  return out;
}

/**
 * The demo deck: the pricing deck that goes with the photographer's site, so
 * one client identity runs across both artifacts in the library.
 */
export const DEMO_DECK: DeckDocument = {
  version: 1,
  theme: "studio",
  slides: [
    {
      title: "Elena Marsh",
      layout: "cover",
      html: `<img class="bleed" src="deck:cover" alt="Couple on the terrace above Lake Como at dusk" />
<p class="lead">Wedding photography</p>
<p class="meta">Collections &amp; pricing · 2027</p>`,
      notes:
        "Say nothing over the cover. Let them look, then move to how you work.",
    },
    {
      title: "How I photograph",
      layout: "split",
      html: `<img class="side" src="deck:approach" alt="Couple under a lantern-lit archway" />
<div class="rule"></div>
<p class="lead">Quietly, and mostly from a distance.</p>
<p>No long shot lists, no posing you through your own wedding — the day as it happens, and the people you love in it.</p>
<ul>
<li>One short walk together at golden hour. That is the only setup.</li>
<li>Family groups done in twenty minutes, from a list you write.</li>
<li>I eat when you eat, so nothing is missed at the speeches.</li>
</ul>`,
      notes: "Three points, then stop. The photographs argue better than I do.",
    },
    {
      title: "Collections",
      layout: "text",
      html: `<div class="cards">
<div class="card"><h3>The Morning</h3><p class="price">From £1,400</p><p>Six hours, preparations through to the first course. One photographer, gallery within three weeks.</p></div>
<div class="card"><h3>The Full Day</h3><p class="price">From £2,600</p><p>Sunrise to the last song. Second shooter, an engagement session beforehand, and a hand-bound album.</p></div>
<div class="card"><h3>Elsewhere</h3><p class="price">On request</p><p>Elopements and weddings further afield. Travel within Europe included; anywhere else, ask me.</p></div>
</div>
<p class="note">Every collection includes the full edited gallery, print rights, and a second set of eyes on the timeline before the day.</p>`,
      notes:
        "Read the middle one first — most couples land there once they hear it.",
    },
    {
      title: "What you take home",
      layout: "split",
      html: `<img class="side" src="deck:album" alt="Hand-bound album open beside a stack of fine-art prints" />
<div class="rule"></div>
<ul>
<li><strong>400–600 photographs</strong>, edited by hand, no filters</li>
<li><strong>Private online gallery</strong> within three weeks, yours to keep</li>
<li><strong>Hand-bound album</strong>, 40 spreads, linen or leather</li>
<li><strong>Fine-art prints</strong> on cotton rag, boxed</li>
<li><strong>Full print rights</strong> — order from anyone you like</li>
</ul>`,
      notes: "Hand them the sample album here if it's an in-person meeting.",
    },
    {
      title: "How booking works",
      layout: "text",
      html: `<div class="steps">
<div class="step"><span>One</span><p>We talk for half an hour, on a call or over coffee.</p></div>
<div class="step"><span>Two</span><p>I hold the date for seven days while you decide.</p></div>
<div class="step"><span>Three</span><p>£600 and a signed agreement confirm it.</p></div>
<div class="step"><span>Four</span><p>Balance six weeks before. Timeline planned together.</p></div>
</div>
<p class="note"><strong>Currently booking 2027.</strong> Three dates left in June and September.</p>`,
      notes: "Say the number plainly and let the pause sit.",
    },
    {
      title: "Tell me about your day.",
      layout: "closing",
      html: `<img class="bleed" src="deck:closing" alt="Couple walking out under string lights" />
<p class="meta">hello@elenamarsh.com · elenamarsh.com</p>`,
      notes: "End on the photograph, not on a slide about me.",
    },
  ],
};
