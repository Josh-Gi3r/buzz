/**
 * Slide styling for the deck. Plain CSS so slide text stays real text.
 *
 * Type scales with the stage: the slide is a size container and every size is
 * expressed in `cqw`, so the same markup reads correctly in the review pane and
 * in a full-screen presentation without a scaling transform.
 */

/** Paper colour behind the slides — matches the demo site's ivory. */
export const DECK_BG = "#f7f3ec";

export const DECK_CSS = `
.reveal { container-type: inline-size; height: 100%; }
.reveal .slides { text-align: left; }
.reveal section { container-type: inline-size; padding: 0; }

.slide {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  padding: 5.2cqw 5.6cqw;
  font-size: 1.55cqw;
  font-family: ui-sans-serif, -apple-system, "Helvetica Neue", sans-serif;
  color: #1c1917;
  background: ${DECK_BG};
}
.slide h2 {
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  font-weight: 400;
  font-size: 2.9em;
  line-height: 1.06;
  letter-spacing: -0.01em;
  text-transform: none;
  margin: 0 0 1.1em;
  color: #1c1917;
}
.slide p { font-size: 1em; line-height: 1.6; color: #6b6560; margin: 0 0 0.85em; }
.slide p.lead {
  font-family: "Iowan Old Style", Georgia, serif;
  font-size: 1.5em; line-height: 1.45; color: #1c1917;
}
.slide p.meta {
  font-size: 0.8em; letter-spacing: 0.18em; text-transform: uppercase; color: #8c7851;
}
.slide ul { margin: 0.2em 0 0; padding-left: 1.1em; }
.slide li { font-size: 1em; line-height: 1.95; color: #6b6560; }
.slide li strong { color: #1c1917; font-weight: 600; }
.slide .rule { width: 2.6em; height: 1px; background: #8c7851; margin: 0 0 1.4em; }

/* Text-only slides centre their column so the page reads balanced, not top-heavy. */
.slide[data-layout="text"] { justify-content: center; }
.slide[data-layout="text"] h2 { margin-bottom: 1.4em; }

/* ---------- collections ---------- */
.slide .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5em; }
.slide .card { border-top: 1px solid #dcd4c7; padding: 1.3em 0 0; }
.slide .card h3 {
  font-family: "Iowan Old Style", Georgia, serif;
  font-size: 1.4em; font-weight: 400; text-transform: none;
  color: #1c1917; margin: 0 0 0.35em;
}
.slide .card .price {
  font-size: 0.78em; letter-spacing: 0.16em; text-transform: uppercase;
  color: #8c7851; margin: 0 0 0.9em;
}
.slide .card p { font-size: 0.92em; line-height: 1.6; margin: 0; }

/* ---------- booking steps ---------- */
.slide .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.4em; margin-top: 0.4em; }
.slide .step { border-top: 1px solid #dcd4c7; padding: 1.1em 0 0; }
.slide .step span {
  display: block; font-size: 0.78em; letter-spacing: 0.18em;
  text-transform: uppercase; color: #8c7851; margin-bottom: 0.5em;
}
.slide .step p { font-size: 0.92em; line-height: 1.6; margin: 0; }
.slide .note { margin-top: 1.8em; font-size: 0.92em; color: #6b6560; }
.slide .note strong { color: #1c1917; font-weight: 600; }

/* ---------- split: photograph on the right ---------- */
.slide[data-layout="split"] { padding-right: 50%; justify-content: center; }
.slide[data-layout="split"] .side {
  position: absolute; top: 0; right: 0; width: 46%; height: 100%;
  object-fit: cover; display: block;
}

/* ---------- full-bleed photograph ---------- */
.slide[data-layout="cover"], .slide[data-layout="closing"] { padding: 0; color: #fff; }
.slide[data-layout="cover"] .slide-body,
.slide[data-layout="closing"] .slide-body {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  padding: 5.6cqw;
}
.slide[data-layout="cover"] .slide-body { justify-content: flex-start; padding-top: 17cqw; }
.slide[data-layout="closing"] .slide-body { justify-content: flex-end; }
.slide[data-layout="cover"] .bleed, .slide[data-layout="closing"] .bleed {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: 0;
}
.slide[data-layout="cover"] .slide-body::before,
.slide[data-layout="closing"] .slide-body::before {
  content: ""; position: absolute; inset: 0; z-index: 1;
}
.slide[data-layout="cover"] .slide-body::before {
  background: linear-gradient(160deg, rgba(28,25,23,0.52) 0%, rgba(28,25,23,0.12) 52%, rgba(28,25,23,0.30) 100%);
}
.slide[data-layout="closing"] .slide-body::before {
  background: linear-gradient(0deg, rgba(28,25,23,0.72) 0%, rgba(28,25,23,0.15) 62%);
}
.slide[data-layout="cover"] h2, .slide[data-layout="closing"] h2 {
  position: absolute; left: 5.6cqw; z-index: 2; color: #fff; margin: 0;
  font-size: 3.4em; text-shadow: 0 1px 24px rgba(28,25,23,0.35);
}
.slide[data-layout="cover"] h2 { top: 5.6cqw; }
.slide[data-layout="closing"] h2 { bottom: 12.5cqw; }
.slide[data-layout="cover"] p, .slide[data-layout="closing"] p {
  position: relative; z-index: 2; color: rgba(255,255,255,0.92);
}
.slide[data-layout="cover"] p.meta, .slide[data-layout="closing"] p.meta {
  color: rgba(255,255,255,0.78);
}

.slide [contenteditable="true"]:focus {
  outline: 2px solid #8c7851; outline-offset: 6px; border-radius: 4px;
}

@media (max-width: 720px) {
  .slide .cards, .slide .steps { grid-template-columns: 1fr 1fr; }
}
`;
