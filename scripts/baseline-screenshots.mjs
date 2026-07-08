// Phase 0 — screenshot baseline of the LIVE static site (the parity oracle WS1
// diffs against). Serves the read-only Desktop tree locally and captures:
//   both views (feed/classic) × 8 cities × {mobile, desktop}   = 32
//   + landing, vegas portal, 4 platform, 4 company, chicago wall (desktop) = 11
// → docs/baseline/. JPEG q70 fullPage. Vegas: slotgenie.bet nav is aborted so
// the trapdoor can't leave the page mid-capture.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";
import { ROOT, SLUGS } from "./lib/city-data.mjs";

const STATIC_ROOT =
  process.env.LT_STATIC_ROOT ?? "/Users/aaronshaw/Desktop/3ok 3/localtour.directory";
const PORT = 8943;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(ROOT, "docs", "baseline");
const SETTLE_MS = 3500; // in-browser Babel compile + image paint

const DEVICES = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const STANDALONES = [
  ["landing", "/"],
  ["vegas", "/vegas/"],
  ["platform-explore", "/platform/explore.html"],
  ["platform-concierge", "/platform/concierge.html"],
  ["platform-planner", "/platform/planner.html"],
  ["platform-community", "/platform/community.html"],
  ["company-about", "/company/about.html"],
  ["company-partners", "/company/partners.html"],
  ["company-privacy", "/company/privacy.html"],
  ["company-terms", "/company/terms.html"],
  ["wall-chicago", "/cities/chicago/wall.html"],
];

const server = spawn(
  "python3",
  ["-m", "http.server", String(PORT), "--directory", STATIC_ROOT],
  { stdio: "ignore" },
);
process.on("exit", () => server.kill());
await sleep(1200);

const browser = await chromium.launch();
let shots = 0;

async function capture(context, url, file, { settle = SETTLE_MS } = {}) {
  const page = await context.newPage();
  // The legacy pages boot React/Babel from cdnjs and pull remote fonts/images —
  // those must load. Only the Vegas trapdoor's slotgenie.bet redirect (and its
  // pre-warming iframe) is blocked so capture can't leave the page.
  await page.route(
    (u) => u.hostname.endsWith("slotgenie.bet"),
    (route) => route.abort(),
  );
  try {
    await page.goto(BASE + url, { waitUntil: "load", timeout: 45_000 });
    await sleep(settle);
    // Scroll through the page to latch IntersectionObserver reveals + lazy images
    // (fullPage capture renders without scrolling, so below-fold content would
    // otherwise sit at opacity 0), then return to the top.
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
    mkdirSync(path.dirname(file), { recursive: true });
    await page.screenshot({
      path: file,
      fullPage: true,
      type: "jpeg",
      quality: 70,
      animations: "disabled", // freeze marquees/tickers — deterministic + fast raster
      timeout: 120_000, // 1440×~29,000px pages take a while to stitch
    });
    shots += 1;
    console.log(`✓ ${path.relative(ROOT, file)}`);
  } finally {
    await page.close();
  }
}

// City pages — both views × both devices
for (const [device, viewport] of Object.entries(DEVICES)) {
  for (const view of ["feed", "classic"]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    await context.addInitScript((v) => sessionStorage.setItem("lt_view", v), view);
    for (const slug of SLUGS) {
      await capture(
        context,
        `/cities/${slug}/`,
        path.join(OUT, view, `${slug}-${device}.jpg`),
      );
    }
    await context.close();
  }
}

// Standalone pages — desktop. Vegas is captured mid-animation (1.2s), before its redirect.
{
  const context = await browser.newContext({ viewport: DEVICES.desktop, deviceScaleFactor: 1 });
  for (const [name, url] of STANDALONES) {
    await capture(context, url, path.join(OUT, "standalone", `${name}-desktop.jpg`), {
      settle: name === "vegas" ? 1200 : SETTLE_MS,
    });
  }
  await context.close();
}

await browser.close();
server.kill();
console.log(`baseline complete: ${shots} screenshots → docs/baseline/`);
