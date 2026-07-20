// scripts/gen-onepager.mjs — WS4 build-time one-pager PDF generator (the DMO "money door").
//
// Reads the computed network stats (src/generated/stats.json, produced by gen-stats.mjs)
// and renders a single-page, LocalTour-branded pitch aimed at a city / DMO / visitor bureau
// to dist/partners/localtour-city-onepager.pdf via Playwright.
//
// Runs AFTER `vite build` (the orchestrator wires the build hook), so dist/ already exists —
// but we never assume it: dist/partners is created regardless, and a missing stats file or a
// browser that can't launch degrades gracefully instead of breaking the build.
//
// Self-contained: no external assets in the HTML (font stacks fall back to Georgia in the
// headless Chromium print context) and no npm deps beyond playwright.
import { chromium } from "playwright";
import { readFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATS_PATH = path.join(ROOT, "src", "generated", "stats.json");
const DIST_DIR = path.join(ROOT, "dist");
const OUT_DIR = path.join(DIST_DIR, "partners");
const OUT_PDF = path.join(OUT_DIR, "localtour-city-onepager.pdf");

const rel = (p) => path.relative(ROOT, p);
const num = (n) => Number(n || 0).toLocaleString("en-US");

// Pull only the headline figures we render — tolerate a missing/partial file so the
// PDF still lands (with honest zeros) rather than crashing the deploy build.
function loadStats() {
  if (!existsSync(STATS_PATH)) {
    console.warn(`⚠ gen-onepager: ${rel(STATS_PATH)} not found — run gen-stats first. Rendering with placeholder zeros.`);
    return { cities: 0, businesses: 0, deals: 0, events: 0, nodes: 0 };
  }
  const s = JSON.parse(readFileSync(STATS_PATH, "utf8"));
  return {
    cities: s.cities ?? 0,
    businesses: s.businesses ?? 0,
    deals: s.deals ?? 0,
    events: s.events ?? 0,
    nodes: s.nodes ?? 0,
  };
}

// Single-page Letter document. All CSS inline; cream bg, ink text, red accent, Playfair
// headline — matched to the shipped LocalTour design system (public/company/partners.html).
function buildHtml(s) {
  const stats = [
    { n: num(s.cities), label: "Cities live" },
    { n: num(s.businesses), label: "Curated businesses" },
    { n: num(s.deals), label: "Clippable deals" },
    { n: num(s.events), label: "Local events" },
    { n: num(s.nodes), label: "Concierge nodes" },
  ];

  const pipeline = [
    {
      k: "01",
      t: "Intelligence",
      d: "We ingest the real local knowledge — merchant relationships, neighborhood texture, event calendars, the unwritten “don’t go there on a Tuesday.”",
    },
    {
      k: "02",
      t: "Graph",
      d: "Every venue is reasoned into a curated business graph: category, neighborhood, concierge weight, and why it earned its slot. Curated, never scraped.",
    },
    {
      k: "03",
      t: "Persona",
      d: "A named local concierge sits on top of the graph — a decision engine with a node tree, not a star-rated review aggregator.",
    },
    {
      k: "04",
      t: "Ship",
      d: "Live in production in under a week: city site, concierge, community wall, trip planner, coupon clipper. Config-driven, so it iterates fast.",
    },
  ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  @page { size: Letter; margin: 0; }
  :root {
    --cream: #faf8f4; --cream-2: #f3efe6;
    --ink: #0c1b2a; --ink-soft: #55606b; --ink-dim: #8b8579;
    --accent: #b3131f; --accent-hot: #dc2626; --accent-soft: rgba(179, 19, 31, 0.08);
    --gold: #b8892e;
    --line: rgba(12, 27, 42, 0.12); --line-soft: rgba(12, 27, 42, 0.08);
    --serif: 'Playfair Display', 'Fraunces', Georgia, 'Times New Roman', serif;
    --sans: 'DM Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    --mono: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: var(--cream); }
  body { font-family: var(--sans); color: var(--ink); -webkit-font-smoothing: antialiased; line-height: 1.5; }
  .page {
    position: relative; width: 8.5in; min-height: 11in; margin: 0 auto;
    padding: 0.62in 0.66in 0.5in; background: var(--cream);
    display: flex; flex-direction: column;
  }
  .page::before {
    content: ''; position: absolute; top: -1.4in; right: -1.6in; width: 5in; height: 5in;
    background: radial-gradient(circle, var(--accent-soft) 0%, transparent 62%); pointer-events: none;
  }
  .page > * { position: relative; z-index: 1; }
  .accent { color: var(--accent); }
  em { font-style: italic; color: var(--accent); }

  /* Masthead */
  .mast { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
  .brand { display: flex; align-items: center; gap: 9px; font-family: var(--serif); font-weight: 700; font-size: 19px; letter-spacing: -0.01em; }
  .brand .mark { display: inline-flex; align-items: center; justify-content: center; width: 27px; height: 27px; background: var(--accent); color: #fff; border-radius: 6px; font-family: var(--sans); font-weight: 700; font-size: 11px; letter-spacing: 0.02em; }
  .brand .tour { color: var(--accent); }
  .mast .kicker { font-family: var(--mono); font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-dim); text-align: right; }

  /* Hero */
  .hero { padding: 22px 0 18px; }
  .eyebrow { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); display: inline-flex; align-items: center; gap: 9px; margin-bottom: 14px; }
  .eyebrow::before { content: ''; width: 26px; height: 1px; background: var(--accent); }
  h1 { font-family: var(--serif); font-weight: 500; font-size: 46px; line-height: 0.98; letter-spacing: -0.025em; max-width: 15ch; margin-bottom: 14px; }
  .lede { font-size: 12.5px; line-height: 1.55; color: var(--ink-soft); max-width: 62ch; }
  .lede strong { color: var(--ink); font-weight: 600; }

  /* Section label */
  .sec-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin: 20px 0 14px; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
  .sec-head h2 { font-family: var(--serif); font-weight: 500; font-size: 20px; letter-spacing: -0.01em; }
  .sec-head .meta { font-family: var(--mono); font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-dim); }

  /* Pipeline */
  .pipe { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
  .step { padding: 0 15px; border-left: 1px solid var(--line-soft); }
  .step:first-child { padding-left: 0; border-left: none; }
  .step:last-child { padding-right: 0; }
  .step .sn { font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; color: var(--accent); margin-bottom: 8px; }
  .step h3 { font-family: var(--serif); font-weight: 600; font-size: 16px; letter-spacing: -0.01em; margin-bottom: 7px; }
  .step .arrow { color: var(--ink-dim); font-weight: 400; }
  .step p { font-size: 10.5px; line-height: 1.5; color: var(--ink-soft); }

  /* Stats band */
  .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; background: var(--ink); color: var(--cream); border-radius: 10px; padding: 20px 6px; margin-top: 4px; }
  .stat { text-align: center; padding: 0 8px; border-left: 1px solid rgba(250, 248, 244, 0.12); }
  .stat:first-child { border-left: none; }
  .stat .v { font-family: var(--serif); font-weight: 600; font-size: 32px; line-height: 1; letter-spacing: -0.02em; color: #fff; }
  .stat .l { font-family: var(--mono); font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(250, 248, 244, 0.62); margin-top: 8px; }
  .stats-cap { font-family: var(--mono); font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-dim); text-align: center; margin-top: 9px; }

  /* Economics */
  .econ { margin-top: 20px; padding: 16px 18px; background: var(--cream-2); border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0; }
  .econ .lbl { font-family: var(--mono); font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 7px; }
  .econ p { font-size: 12px; line-height: 1.55; color: var(--ink); }
  .econ p strong { font-weight: 600; }

  /* Footer / contact */
  .foot { margin-top: auto; padding-top: 14px; border-top: 1px solid var(--line); display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
  .foot .contact { font-family: var(--serif); font-size: 15px; font-weight: 500; letter-spacing: -0.005em; }
  .foot .contact .sub { display: block; font-family: var(--mono); font-size: 9.5px; font-weight: 400; letter-spacing: 0.08em; color: var(--ink-soft); margin-top: 5px; }
  .foot .contact a { color: inherit; text-decoration: none; }
  .foot .colophon { font-family: var(--mono); font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-dim); text-align: right; line-height: 1.7; }
</style>
</head>
<body>
  <div class="page">

    <div class="mast">
      <div class="brand"><span class="mark">LT</span><span>Local<span class="tour">Tour</span></span></div>
      <div class="kicker">For Cities &middot; DMOs<br/>Visitor Bureaus &middot; Chambers</div>
    </div>

    <div class="hero">
      <div class="eyebrow">A full city, live in a week</div>
      <h1>Want your <em>city</em> next?</h1>
      <p class="lede">
        LocalTour ships a new city in <strong>days, not months</strong> &mdash; and it isn&rsquo;t a landing page with a map.
        It&rsquo;s a decision engine: a named concierge, a curated business graph, a community wall, a trip planner,
        a coupon clipper, and a config-driven scroll experience. You bring the local intelligence; we ship it into production.
      </p>
    </div>

    <div class="sec-head">
      <h2>How a city gets built</h2>
      <div class="meta">Intelligence &rarr; Graph &rarr; Persona &rarr; Ship</div>
    </div>
    <div class="pipe">
      ${pipeline
        .map(
          (p, i) => `<div class="step">
        <div class="sn">STAGE ${p.k}</div>
        <h3>${p.t}${i < pipeline.length - 1 ? ' <span class="arrow">&rarr;</span>' : ""}</h3>
        <p>${p.d}</p>
      </div>`,
        )
        .join("\n      ")}
    </div>

    <div class="sec-head">
      <h2>Live across the network <em>today</em></h2>
      <div class="meta">Computed at build time</div>
    </div>
    <div class="stats">
      ${stats.map((st) => `<div class="stat"><div class="v">${st.n}</div><div class="l">${st.label}</div></div>`).join("\n      ")}
    </div>
    <div class="stats-cap">Every figure is derived from the live city containers &mdash; nothing here is hand-typed.</div>

    <div class="econ">
      <div class="lbl">The economics</div>
      <p>
        A flat build-and-host model, a <strong>revenue share</strong> against merchant &amp; affiliate placement, or a hybrid &mdash;
        structured to your budget cycle. Curated listings appear organically; paid tiers earn priority without ever
        beating a better recommendation. And you keep your data: merchant lists, content, and community posts are yours on exit.
      </p>
    </div>

    <div class="foot">
      <div class="contact">
        <a href="mailto:partners@shaw-labs.com">partners@shaw-labs.com</a>
        <span class="sub">localtour.directory/partners/cities &middot; reply from a human within 48 hours</span>
      </div>
      <div class="colophon">
        LocalTour<br/>SH@W Labs &middot; 2026
      </div>
    </div>

  </div>
</body>
</html>`;
}

async function main() {
  const stats = loadStats();

  // We run after `vite build`, so dist/ should already exist — but guard anyway.
  if (!existsSync(DIST_DIR)) {
    console.warn(`⚠ gen-onepager: ${rel(DIST_DIR)}/ not found (did \`vite build\` run?). Creating ${rel(OUT_DIR)}/ so the PDF still lands.`);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const html = buildHtml(stats);

  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    // A missing browser binary should not fail the whole deploy build — skip with a clear hint.
    console.error(`✗ gen-onepager: could not launch Chromium (${err.message}). Try \`npx playwright install chromium\`. Skipping the PDF.`);
    return;
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: OUT_PDF,
      format: "Letter",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
  } finally {
    await browser.close();
  }

  const kb = (statSync(OUT_PDF).size / 1024).toFixed(1);
  console.log(`✓ one-pager: ${rel(OUT_PDF)} (${kb} KB) · ${num(stats.cities)} cities · ${num(stats.businesses)} businesses · ${num(stats.nodes)} nodes`);
}

main().catch((err) => {
  console.error(`✗ gen-onepager failed: ${err.stack || err.message}`);
  process.exitCode = 1;
});
