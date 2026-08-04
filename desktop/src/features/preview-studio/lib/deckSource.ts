/**
 * A deck is HTML, not pictures.
 *
 * Slides are stored as markup on the revision so their text stays selectable,
 * editable, and exportable. Rendering uses reveal.js; PPTX export uses
 * PptxGenJS. See docs/design/architecture.md — flat media is the fallback
 * representation, never the primary one.
 */

export type DeckSlide = {
  /** Slide heading, also used as the PPTX title placeholder. */
  title: string;
  /** Body markup: paragraphs, lists, and simple emphasis. */
  html: string;
  /** Optional speaker notes (reveal presenter mode + PPTX notes). */
  notes?: string;
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

/** Plain text of a slide, for PPTX bodies and search. */
export function slideText(slide: DeckSlide): string {
  return slide.html
    .replace(/<li>/g, "\n• ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export const DEMO_DECK: DeckDocument = {
  version: 1,
  theme: "studio",
  slides: [
    {
      title: "Northwind",
      html: `<p class="lead">Preview, review and approve every artifact in one place.</p>
<p class="meta">Series A · Autumn 2026</p>`,
      notes:
        "Open with the one-line promise, then move quickly to the problem.",
    },
    {
      title: "The problem",
      html: `<p class="lead">Feedback on work lives in five places at once.</p>
<ul>
<li>Screenshots pasted into chat lose the version they referred to</li>
<li>Comments drift once the file changes underneath them</li>
<li>Approvals are verbal, so nobody can prove what was signed off</li>
<li>Every format needs a different tool</li>
</ul>`,
      notes: "Anchor each bullet to a story the audience has lived through.",
    },
    {
      title: "How it works",
      html: `<div class="cards">
<div class="card"><h3>1 · Artifact</h3><p>A stable thing being made — a deck, a cut, a screen.</p></div>
<div class="card"><h3>2 · Revision</h3><p>Immutable. Feedback can never drift off its version.</p></div>
<div class="card"><h3>3 · Decision</h3><p>Approved or changes requested — on the record.</p></div>
</div>`,
      notes: "Three nouns. If they remember nothing else, they remember these.",
    },
    {
      title: "Traction",
      html: `<div class="chart">
<div class="bar" style="height:20%"><span>Q1</span></div>
<div class="bar" style="height:32%"><span>Q2</span></div>
<div class="bar" style="height:52%"><span>Q3</span></div>
<div class="bar" style="height:74%"><span>Q4</span></div>
<div class="bar accent" style="height:100%"><span>Q1</span></div>
</div>
<p class="stat"><strong>4.2×</strong> year over year</p>`,
      notes: "Lead with the multiple, not the absolute numbers.",
    },
    {
      title: "The ask",
      html: `<p class="huge">$6M Series A</p>
<p class="lead">18 months of runway · engineering and go-to-market</p>
<ul>
<li>60% Engineering</li>
<li>25% Go-to-market</li>
<li>15% Operations</li>
</ul>`,
      notes: "State the number, stop talking, let them respond.",
    },
  ],
};
