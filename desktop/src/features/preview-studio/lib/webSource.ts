/**
 * A website artifact is source, not a screenshot.
 *
 * Files live on the revision so the markup and styles stay editable and
 * reviewable. The stage runs them in a sandboxed origin — see
 * docs/design/architecture.md for the isolation rules.
 */

export type WebFiles = Record<string, string>;

export type WebDocument = {
  version: 1;
  /** Sandpack template id: "static" for plain HTML/CSS/JS, "react" for JSX. */
  template: "static" | "react" | "vanilla";
  entry: string;
  files: WebFiles;
};

export function isWebDocument(value: unknown): value is WebDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as WebDocument;
  return (
    doc.version === 1 &&
    typeof doc.entry === "string" &&
    !!doc.files &&
    typeof doc.files === "object"
  );
}

const DEMO_CSS = `:root {
  --ink: #0b0e15;
  --surface: #141927;
  --card: #1b2234;
  --accent: #a78bfa;
  --accent-2: #38bdf8;
  --text: #e9edf6;
  --muted: #8b95a8;
  color-scheme: dark;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--ink);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
}
.brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
nav { display: flex; gap: 28px; align-items: center; }
nav a { color: var(--muted); text-decoration: none; font-size: 14px; }
nav a:hover { color: var(--text); }
.cta {
  background: var(--text); color: var(--ink); border: 0;
  padding: 9px 18px; border-radius: 999px;
  font: inherit; font-size: 14px; font-weight: 700; cursor: pointer;
}
.hero {
  margin: 8px 40px 0;
  padding: 72px 56px;
  border-radius: 24px;
  background:
    radial-gradient(120% 140% at 0% 0%, rgba(167,139,250,0.35), transparent 60%),
    radial-gradient(120% 140% at 100% 100%, rgba(56,189,248,0.22), transparent 55%),
    var(--surface);
}
.hero h1 {
  margin: 0 0 14px;
  font-size: 46px; line-height: 1.08; font-weight: 800; letter-spacing: -0.03em;
  max-width: 15ch;
}
.hero p { margin: 0 0 28px; font-size: 18px; color: var(--muted); max-width: 46ch; }
.row { display: flex; gap: 12px; }
.ghost {
  background: rgba(255,255,255,0.1); color: var(--text); border: 0;
  padding: 9px 18px; border-radius: 999px; font: inherit; font-size: 14px; cursor: pointer;
}
section.features { padding: 56px 40px; }
section.features h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 0 0 20px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.card { background: var(--card); border-radius: 16px; padding: 22px; }
.card .swatch { height: 76px; border-radius: 10px; margin-bottom: 16px; }
.card:nth-child(1) .swatch { background: linear-gradient(135deg, var(--accent), var(--accent-2)); }
.card:nth-child(2) .swatch { background: linear-gradient(135deg, #fbbf24, #f87171); }
.card:nth-child(3) .swatch { background: linear-gradient(135deg, #34d399, var(--accent-2)); }
.card h3 { margin: 0 0 6px; font-size: 16px; }
.card p { margin: 0; font-size: 14px; color: var(--muted); }
footer { padding: 28px 40px 44px; color: var(--muted); font-size: 13px; }

@media (max-width: 720px) {
  header { flex-direction: column; align-items: flex-start; gap: 14px; padding: 18px 20px; }
  nav { gap: 18px; flex-wrap: wrap; }
  .hero { margin: 4px 20px 0; padding: 40px 24px; border-radius: 18px; }
  .hero h1 { font-size: 32px; max-width: 100%; }
  .hero p { font-size: 16px; }
  .row { flex-wrap: wrap; }
  section.features { padding: 36px 20px; }
  footer { padding: 22px 20px 32px; }
}
`;

const DEMO_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Northwind — ship work people can see</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header>
    <div class="brand">Northwind</div>
    <nav>
      <a href="#product">Product</a>
      <a href="#pricing">Pricing</a>
      <a href="#docs">Docs</a>
      <button class="cta" data-preview-id="nav-cta">Get started</button>
    </nav>
  </header>

  <div class="hero">
    <h1>Ship work people can see.</h1>
    <p>Preview, review and approve every artifact in one place — decks, video, screens and sites.</p>
    <div class="row">
      <button class="cta" data-preview-id="hero-primary">Start free</button>
      <button class="ghost" data-preview-id="hero-secondary">Book a demo</button>
    </div>
  </div>

  <section class="features" id="product">
    <h2>Built for review</h2>
    <div class="cards">
      <div class="card">
        <div class="swatch"></div>
        <h3>Every format</h3>
        <p>Sites, decks, video and screens on one stage.</p>
      </div>
      <div class="card">
        <div class="swatch"></div>
        <h3>Anchored feedback</h3>
        <p>Comments stick to the revision they were made on.</p>
      </div>
      <div class="card">
        <div class="swatch"></div>
        <h3>Decisions on record</h3>
        <p>Approved or changes requested, never verbal.</p>
      </div>
    </div>
  </section>

  <footer>© Northwind — sample site for the Preview Studio demo library</footer>
</body>
</html>
`;

export const DEMO_WEBSITE: WebDocument = {
  version: 1,
  template: "static",
  entry: "/index.html",
  files: {
    "/index.html": DEMO_HTML,
    "/styles.css": DEMO_CSS,
  },
};
