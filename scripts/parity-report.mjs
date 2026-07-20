// Phase 1 parity report — assembles parity-report/index.html from the baseline
// oracle (docs/baseline) + the engine matrix (parity-report/engine). Deployed at
// /parity/ on the work site (copy-city-images.mjs carries parity-report → dist).
import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ROOT, SLUGS } from "./lib/city-data.mjs";

const OUT = path.join(ROOT, "parity-report");
const heights = JSON.parse(readFileSync(path.join(OUT, "heights.json"), "utf8"));

// self-contained report dir: bring the baseline halves alongside the engine halves
cpSync(path.join(ROOT, "docs", "baseline"), path.join(OUT, "baseline"), { recursive: true });

const px = (f) => {
  try {
    return Number(execFileSync("sips", ["-g", "pixelHeight", f], { encoding: "utf8" }).match(/pixelHeight: (\d+)/)?.[1]);
  } catch {
    return null;
  }
};

const rows = [];
for (const view of ["feed", "classic"]) {
  for (const device of ["desktop", "mobile"]) {
    for (const slug of SLUGS) {
      const key = `${view}/${slug}-${device}`;
      const b = path.join(OUT, "baseline", view, `${slug}-${device}.jpg`);
      const e = path.join(OUT, "engine", view, `${slug}-${device}.jpg`);
      const bh = existsSync(b) ? px(b) : null;
      const eh = existsSync(e) ? px(e) : null;
      const delta = bh && eh ? (((eh - bh) / bh) * 100).toFixed(1) : null;
      rows.push({ key, view, device, slug, bh, eh, delta, errors: heights[key]?.pageErrors?.length ?? 0 });
    }
  }
}
writeFileSync(path.join(OUT, "rows.json"), JSON.stringify(rows, null, 1));

const rowHtml = (r) => `
<section class="pair" id="${r.key.replace(/\//g, "-")}">
  <header><h2>${r.slug} · ${r.view} · ${r.device}</h2>
    <span class="meta">baseline ${r.bh ?? "?"}px · engine ${r.eh ?? "?"}px · Δ ${r.delta ?? "?"}%${r.errors ? ` · ⚠ ${r.errors} js errors` : ""}</span></header>
  <div class="panes" data-sync>
    <div class="pane"><div class="tag">baseline (legacy)</div><div class="scroll"><img loading="lazy" src="baseline/${r.view}/${r.slug}-${r.device}.jpg" alt=""></div></div>
    <div class="pane"><div class="tag">engine (WS1)</div><div class="scroll"><img loading="lazy" src="engine/${r.view}/${r.slug}-${r.device}.jpg" alt=""></div></div>
  </div>
</section>`;

const html = `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>LocalTour · WS1 parity — baseline vs engine</title>
<style>
body{background:#0a0a0a;color:#f2ece1;font-family:'DM Sans',-apple-system,sans-serif;margin:0;padding:24px}
h1{font-family:Georgia,serif;font-style:italic;font-weight:500}
table{border-collapse:collapse;font-size:12px;font-family:ui-monospace,Menlo,monospace;margin:16px 0 40px}
td,th{border:1px solid #2a241d;padding:4px 10px;text-align:left}
th{color:#6f6558;text-transform:uppercase;font-size:10px;letter-spacing:.1em}
td.warn{color:#e8a63a} td.ok{color:#6fb583} a{color:#d4a853}
.pair{margin:40px 0}
.pair header{display:flex;gap:16px;align-items:baseline;border-bottom:1px solid #2a241d;padding-bottom:6px}
.pair h2{font-family:Georgia,serif;font-style:italic;font-size:18px;margin:0}
.meta{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#a89c8a}
.panes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.pane .tag{font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#6f6558;margin-bottom:4px}
.scroll{height:72vh;overflow-y:auto;border:1px solid #2a241d;background:#000}
.scroll img{width:100%;display:block}
</style>
<h1>WS1 parity — baseline vs engine</h1>
<p style="color:#a89c8a;max-width:70ch">Same capture methodology on both sides (scroll-through, animations frozen). Scrolling either pane scrolls its partner proportionally. Δ is full-page height delta.</p>
<table><tr><th>variant</th><th>baseline px</th><th>engine px</th><th>Δ%</th><th>js errors</th></tr>
${rows.map((r) => `<tr><td><a href="#${r.key.replace(/\//g, "-")}">${r.key}</a></td><td>${r.bh ?? "?"}</td><td>${r.eh ?? "?"}</td><td class="${Math.abs(Number(r.delta)) > 8 ? "warn" : "ok"}">${r.delta ?? "?"}</td><td class="${r.errors ? "warn" : "ok"}">${r.errors}</td></tr>`).join("\n")}
</table>
${rows.map(rowHtml).join("\n")}
<script>
for (const panes of document.querySelectorAll("[data-sync]")) {
  const [a, b] = panes.querySelectorAll(".scroll");
  let lock = false;
  const link = (x, y) => x.addEventListener("scroll", () => {
    if (lock) return; lock = true;
    const p = x.scrollTop / (x.scrollHeight - x.clientHeight || 1);
    y.scrollTop = p * (y.scrollHeight - y.clientHeight);
    requestAnimationFrame(() => (lock = false));
  }, { passive: true });
  link(a, b); link(b, a);
}
</script></html>`;

writeFileSync(path.join(OUT, "index.html"), html);
console.log(`report: parity-report/index.html · ${rows.length} pairs`);
