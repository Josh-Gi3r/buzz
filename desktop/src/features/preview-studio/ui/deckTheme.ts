/** Slide styling for the reveal.js deck. Plain CSS so slide text stays real text. */
export const DECK_CSS = `
.reveal { font-family: system-ui, -apple-system, sans-serif; color: #e9edf6; }
.reveal .slides { text-align: left; }
.reveal section { padding: 0 4rem; }
.reveal h2 {
  font-size: 2.4rem; font-weight: 800; letter-spacing: -0.02em;
  color: #e9edf6; text-transform: none; margin: 0 0 1.6rem;
}
.reveal p { font-size: 1.15rem; line-height: 1.55; color: #b6c0d4; margin: 0 0 0.9rem; }
.reveal p.lead { font-size: 1.5rem; color: #e9edf6; }
.reveal p.meta { font-size: 1rem; color: #8b95a8; }
.reveal p.huge {
  font-size: 3.4rem; font-weight: 800; margin: 0 0 1rem;
  background: linear-gradient(90deg, #a78bfa, #38bdf8);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.reveal ul { margin: 0; padding-left: 1.3rem; }
.reveal li { font-size: 1.1rem; line-height: 1.9; color: #b6c0d4; }
.reveal .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.reveal .card { background: #1b2234; border-radius: 14px; padding: 1.2rem 1.3rem; }
.reveal .card h3 { font-size: 1.15rem; font-weight: 700; color: #e9edf6; margin: 0 0 0.5rem; text-transform: none; }
.reveal .card p { font-size: 0.98rem; margin: 0; }
.reveal .chart { display: flex; align-items: flex-end; gap: 1.1rem; height: 11rem; margin-bottom: 1rem; }
.reveal .bar {
  position: relative; width: 4.4rem; border-radius: 8px;
  background: linear-gradient(180deg, #a78bfa, rgba(167,139,250,0.35));
}
.reveal .bar.accent { background: linear-gradient(180deg, #38bdf8, rgba(56,189,248,0.4)); }
.reveal .bar span { position: absolute; bottom: -1.6rem; left: 0; width: 100%; text-align: center; font-size: 0.8rem; color: #8b95a8; }
.reveal .stat { font-size: 1.1rem; color: #8b95a8; margin-top: 1.4rem; }
.reveal .stat strong { font-size: 2rem; color: #e9edf6; }
.reveal [contenteditable="true"]:focus { outline: 2px solid #a78bfa; outline-offset: 6px; border-radius: 6px; }
`;
