// Build-time sitemap from the same city containers everything else derives from
// (Principle 1: computed, never hand-typed). Emits public/sitemap.xml → dist.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const BASE = "https://localtour.directory";
const modular = path.join(ROOT, "cities-modular");
const slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "config.json")));

const urls = [
  "/", "/vegas/",
  "/company/partners.html", "/company/about.html", "/company/privacy.html", "/company/terms.html",
  "/partners/cities/",
  ...slugs.flatMap((s) => [`/cities/${s}`, `/cities/${s}/wall`]),
];

const today = new Date().toISOString().slice(0, 10);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) => `  <url><loc>${BASE}${u}</loc><lastmod>${today}</lastmod></url>`),
  "</urlset>",
].join("\n");

writeFileSync(path.join(ROOT, "public", "sitemap.xml"), xml + "\n");
console.log(`✓ sitemap: ${urls.length} URLs → public/sitemap.xml`);
