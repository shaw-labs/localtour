// Phase 1 parity matrix — capture the ENGINE with the exact methodology of the
// baseline oracle (scripts/baseline-screenshots.mjs): both views × 8 cities ×
// {mobile, desktop}, scroll-through reveal latching, animations disabled, JPEG q70.
// Output: parity-report/engine/<view>/<slug>-<device>.jpg + parity-report/heights.json
// (docs/baseline/ is the other side of every pair).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";
import { ROOT, SLUGS } from "./lib/city-data.mjs";

const PORT = 4399;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(ROOT, "parity-report");
const SETTLE_MS = 3000;

const DEVICES = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

// serve dist/ with SPA fallback unless something already listens on PORT
let server = null;
try {
  await fetch(BASE, { signal: AbortSignal.timeout(1500) });
  console.log(`using existing server on :${PORT}`);
} catch {
  server = spawn("npx", ["vite", "preview", "--port", String(PORT)], { cwd: ROOT, stdio: "ignore" });
  process.on("exit", () => server?.kill());
  await sleep(3000);
}

const browser = await chromium.launch();
const heights = {};
let shots = 0;

for (const [device, viewport] of Object.entries(DEVICES)) {
  for (const view of ["feed", "classic"]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    await context.addInitScript((v) => localStorage.setItem("lt_view", v), view);
    for (const slug of SLUGS) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
      await page.goto(`${BASE}/cities/${slug}`, { waitUntil: "load", timeout: 45_000 });
      await sleep(SETTLE_MS);
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = () => {
            y += 700;
            window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(step, 55);
            else {
              window.scrollTo(0, 0);
              setTimeout(resolve, 600);
            }
          };
          step();
        });
      });
      await sleep(700);
      const h = await page.evaluate(() => document.body.scrollHeight);
      const file = path.join(OUT, "engine", view, `${slug}-${device}.jpg`);
      mkdirSync(path.dirname(file), { recursive: true });
      await page.screenshot({ path: file, fullPage: true, type: "jpeg", quality: 70, animations: "disabled", timeout: 120_000 });
      heights[`${view}/${slug}-${device}`] = { engineHeight: h, pageErrors: errors };
      shots += 1;
      console.log(`✓ engine ${view}/${slug}-${device} (${h}px${errors.length ? ` · ${errors.length} ERRORS` : ""})`);
      await page.close();
    }
    await context.close();
  }
}

await browser.close();
server?.kill();
writeFileSync(path.join(OUT, "heights.json"), JSON.stringify(heights, null, 1));
console.log(`parity capture complete: ${shots} shots → parity-report/engine/`);
