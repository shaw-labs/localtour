// WS7 SEO — prerendered per-city shells. The SPA fallback serves one generic
// index.html for every route, so crawlers saw no per-city title/meta/OG (flagged
// in the production audit). This writes dist/cities/<slug>/index.html and
// dist/cities/<slug>/wall/index.html: byte-identical to the built shell (same
// hashed assets — the app boots exactly the same) but with city-correct head
// tags + canonical + TouristDestination JSON-LD. Real files win over the
// fallback, so this is additive (Principle 3). Runs AFTER vite build.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const BASE = "https://localtour.directory";
const dist = path.join(ROOT, "dist");
const shellPath = path.join(dist, "index.html");
if (!existsSync(shellPath)) throw new Error("run after vite build");
const shell = readFileSync(shellPath, "utf8");

const modular = path.join(ROOT, "cities-modular");
const slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "config.json")));

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function retitle(html, { title, desc, url, ld }) {
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  const extra = (ld && ld.__hero ? `<link rel="preload" as="image" type="image/avif" href="${ld.__hero}" fetchpriority="high"/>` : "") + `<link rel="canonical" href="${url}"/>` + (ld ? `<script type="application/ld+json">${JSON.stringify({ ...ld, __hero: undefined })}</script>`.replace(',"__hero":undefined', "") : "");
  return out.replace("</head>", extra + "</head>");
}

let n = 0;
for (const slug of slugs) {
  const cfg = JSON.parse(readFileSync(path.join(modular, slug, "config.json"), "utf8"));
  const dir = JSON.parse(readFileSync(path.join(modular, slug, "directory.json"), "utf8"));
  const desc = `${cfg.tagline}. ${dir.length} curated places, an AI concierge, deals, and the ${cfg.name} 250 Trail — experienced like a local.`.slice(0, 158);

  // city page shell
  const cityUrl = `${BASE}/cities/${slug}/`; // trailing slash = the 301 target Netlify serves
  mkdirSync(path.join(dist, "cities", slug), { recursive: true });
  writeFileSync(
    path.join(dist, "cities", slug, "index.html"),
    retitle(shell, {
      title: `${cfg.name} — ${cfg.tagline} · LocalTour`,
      desc,
      url: cityUrl,
      ld: {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: `${cfg.name}, ${cfg.state}`,
        description: desc,
        url: cityUrl,
        touristType: "Travelers who want to experience a city like a local",
        __hero: cfg.images?.hero ? `/cities/${slug}/images/${cfg.images.hero.replace(/\.[^.]+$/, "")}.avif` : undefined,
      },
    }),
  );

  // wall page shell
  mkdirSync(path.join(dist, "cities", slug, "wall"), { recursive: true });
  writeFileSync(
    path.join(dist, "cities", slug, "wall", "index.html"),
    retitle(shell, {
      title: `The Wall — ${cfg.name} · LocalTour`,
      desc: `Real photos from real visitors to ${cfg.name}. No influencer staging — just moments.`,
      url: `${cityUrl}wall/`,
      ld: null,
    }),
  );
  n += 2;
}
console.log(`✓ city shells: ${n} prerendered heads (city + wall × ${slugs.length} cities)`);
