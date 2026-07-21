// WS7 SEO — build-time static pages per business (additive routes, Principle 3):
//   dist/cities/<slug>/places/<biz-slug>/index.html
// Server-rendered HTML: name, description, must-try, hours, address, active
// deals + LocalBusiness JSON-LD + canonical + OG, with an "open the full
// experience" link into the app. Real files win over the SPA fallback, so these
// are pure additions — no app change. Crawl mesh: each page links its city,
// 4 same-category neighbors, and the sitemap lists every URL (gen-sitemap).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const BASE = "https://localtour.directory";
const modular = path.join(ROOT, "cities-modular");
const dist = path.join(ROOT, "dist");
if (!existsSync(dist)) throw new Error("run after vite build (dist/ missing)");

const slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "directory.json")));

// same slugify as the beacon's bizId — keeps place URLs consistent with analytics ids
export function bizSlug(name) {
  return String(name).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const LD_TYPE = {
  dining: "Restaurant", coffee_bakeries: "CafeOrCoffeeShop", bars_nightlife: "BarOrPub",
  lodging: "Hotel", shopping: "Store", wellness_spa: "HealthAndBeautyBusiness",
  attractions: "TouristAttraction", entertainment: "EntertainmentBusiness",
  outdoor_adventure: "TouristAttraction", services: "LocalBusiness",
};
const CAT_LABEL = {
  dining: "Dining", coffee_bakeries: "Coffee & Bakeries", bars_nightlife: "Bars & Nightlife",
  lodging: "Lodging", shopping: "Shopping", wellness_spa: "Wellness & Spa",
  attractions: "Attractions", entertainment: "Entertainment",
  outdoor_adventure: "Outdoor & Adventure", services: "Services",
};

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const today = new Date().toISOString().slice(0, 10);

// per-city "listing verified" dates from gen-verified.mjs — optional (footer line skipped if absent)
let verified = {};
try {
  verified = JSON.parse(readFileSync(path.join(ROOT, "src", "generated", "verified.json"), "utf8"));
} catch {
  /* not generated yet — pages simply omit the verified line */
}

let pages = 0;
const placeUrls = [];

for (const slug of slugs) {
  const cfg = JSON.parse(readFileSync(path.join(modular, slug, "config.json"), "utf8"));
  const directory = JSON.parse(readFileSync(path.join(modular, slug, "directory.json"), "utf8"));
  const deals = JSON.parse(readFileSync(path.join(modular, slug, "deals.json"), "utf8"))
    .filter((d) => !d.expires || d.expires >= today);
  const byCat = {};
  const used = new Map(); // slug collision guard
  const entries = directory.map((b) => {
    let ps = bizSlug(b.name) || "place";
    if (used.has(ps)) { const n = used.get(ps) + 1; used.set(ps, n); ps = `${ps}-${n}`; } else used.set(ps, 1);
    (byCat[b.category] ||= []).push({ b, ps });
    return { b, ps };
  });

  for (const { b, ps } of entries) {
    const url = `${BASE}/cities/${slug}/places/${ps}/`;
    const cityUrl = `${BASE}/cities/${slug}`;
    const bizDeals = deals.filter((d) => d.business_name === b.name);
    const related = (byCat[b.category] || []).filter((e) => e.b.name !== b.name).slice(0, 4);
    const desc = (b.description || `${b.name} in ${cfg.name}.`).slice(0, 300);
    const metaDesc = esc(desc.slice(0, 155));
    const catLabel = CAT_LABEL[b.category] || b.category;

    const ld = {
      "@context": "https://schema.org",
      "@type": LD_TYPE[b.category] || "LocalBusiness",
      name: b.name,
      description: desc,
      url: b.website || url,
      ...(b.address ? { address: { "@type": "PostalAddress", streetAddress: b.address, addressLocality: cfg.name, addressRegion: cfg.state, addressCountry: "US" } } : {}),
      ...(b.phone ? { telephone: b.phone } : {}),
      ...(b.price ? { priceRange: b.price } : {}),
      ...(b.hours ? { openingHours: b.hours } : {}),
      isPartOf: { "@type": "WebSite", name: "LocalTour", url: BASE },
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(b.name)} — ${esc(cfg.name)} · LocalTour</title>
<meta name="description" content="${metaDesc}"/>
<link rel="canonical" href="${url}"/>
<meta property="og:title" content="${esc(b.name)} — ${esc(cfg.name)}"/>
<meta property="og:description" content="${metaDesc}"/>
<meta property="og:type" content="place"/>
<meta property="og:url" content="${url}"/>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23dc2626'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='16' font-weight='800' fill='white'>LT</text></svg>"/>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#faf8f4;color:#0c1b2a;font-family:Georgia,'Times New Roman',serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:680px;margin:0 auto;padding:28px 22px 64px}
.crumb{font-family:-apple-system,system-ui,sans-serif;font-size:12px;color:#718096;margin-bottom:26px}
.crumb a{color:#b3131f;text-decoration:none}
.cat{font-family:-apple-system,system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#b3131f}
h1{font-size:clamp(30px,7vw,44px);line-height:1.1;letter-spacing:-.015em;margin:10px 0 8px}
.meta{font-family:-apple-system,system-ui,sans-serif;font-size:14px;color:#4a5568;margin-bottom:20px}
.meta b{color:#a8791f}
p.desc{font-size:17px;color:#2d3748;margin-bottom:20px}
.try{border-left:3px solid #b3131f;background:rgba(179,19,31,.05);padding:12px 16px;font-style:italic;color:#4a5568;margin-bottom:22px}
.facts{font-family:-apple-system,system-ui,sans-serif;font-size:14px;color:#2d3748;display:flex;flex-direction:column;gap:8px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:16px 0;margin-bottom:22px}
.facts a{color:#b3131f;text-decoration:none}
.deal{border:1px dashed #a8791f;background:rgba(168,121,31,.06);padding:12px 16px;margin-bottom:10px;font-family:-apple-system,system-ui,sans-serif;font-size:14px}
.deal b{display:block;color:#0c1b2a}
.deal span{color:#718096;font-size:12.5px}
.cta{display:inline-block;background:#b3131f;color:#fff;font-family:-apple-system,system-ui,sans-serif;font-size:15px;font-weight:700;padding:14px 26px;border-radius:999px;text-decoration:none;margin:8px 0 26px}
h2{font-size:20px;margin:26px 0 10px}
.rel{font-family:-apple-system,system-ui,sans-serif;font-size:14px;display:flex;flex-direction:column;gap:8px}
.rel a{color:#0c1b2a;text-decoration:none;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;background:#fff}
.rel a b{color:#b3131f}
footer{margin-top:34px;font-family:-apple-system,system-ui,sans-serif;font-size:12px;color:#a0aec0}
footer a{color:#718096}
</style>
</head>
<body>
<div class="wrap">
  <nav class="crumb"><a href="/">LocalTour</a> · <a href="/cities/${slug}">${esc(cfg.name)}</a> · ${esc(catLabel)}</nav>
  <div class="cat">${esc(catLabel)}${b.subcategory ? " · " + esc(String(b.subcategory).replace(/_/g, " ")) : ""}</div>
  <h1>${esc(b.name)}</h1>
  <div class="meta">${b.rating ? `<b>★ ${esc(b.rating)}</b> · ` : ""}${b.price ? esc(b.price) + " · " : ""}${esc(cfg.name)}, ${esc(cfg.state)}</div>
  <p class="desc">${esc(desc)}</p>
  ${b.must_try ? `<div class="try">Try: ${esc(b.must_try)}</div>` : ""}
  <div class="facts">
    ${b.address ? `<span>📍 <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + " " + b.address)}" rel="nofollow noopener">${esc(b.address)}</a></span>` : ""}
    ${b.address ? `<span>🧭 <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.name + " " + b.address)}" rel="nofollow noopener">Directions</a></span>` : ""}
    ${b.hours ? `<span>🕐 ${esc(b.hours)}</span>` : ""}
    ${b.phone ? `<span>📞 <a href="tel:${esc(String(b.phone).replace(/[^+0-9]/g, ""))}">${esc(b.phone)}</a></span>` : ""}
    ${b.website ? `<span>🔗 <a href="${esc(b.website)}" rel="noopener nofollow">Reserve / official site</a></span>` : ""}
  </div>
  ${bizDeals.length ? `<h2>Current deals</h2>` + bizDeals.map((d) => `<div class="deal"><b>${esc(d.offer_text)}</b><span>Reveal and redeem inside the LocalTour app view.</span></div>`).join("") : ""}
  <a class="cta" href="/cities/${slug}">Open ${esc(cfg.name)} in the full experience →</a>
  ${related.length ? `<h2>Nearby in ${esc(catLabel)}</h2><div class="rel">` + related.map((r) => `<a href="/cities/${slug}/places/${r.ps}/"><b>${esc(r.b.name)}</b>${r.b.rating ? ` · ★ ${esc(r.b.rating)}` : ""}</a>`).join("") + `</div>` : ""}
  ${verified[slug] ? `<p style="font-family:-apple-system,system-ui,sans-serif;font-size:12px;color:#a0aec0;margin-top:26px">Listing verified ${esc(verified[slug])}</p>` : ""}
  <footer><a href="/cities/${slug}">${esc(cfg.name)}</a> · <a href="/cities/${slug}/wall">The Wall</a> · <a href="/">All cities</a> · A SH@W Labs product</footer>
</div>
</body>
</html>
`;
    const out = path.join(dist, "cities", slug, "places", ps);
    mkdirSync(out, { recursive: true });
    writeFileSync(path.join(out, "index.html"), html);
    placeUrls.push(`/cities/${slug}/places/${ps}/`);
    pages++;
  }
}

// hand the URL list to gen-sitemap (which runs pre-vite) via a manifest merged
// into the built sitemap here — we ARE post-build, so patch dist/sitemap.xml.
const smPath = path.join(dist, "sitemap.xml");
if (existsSync(smPath)) {
  let sm = readFileSync(smPath, "utf8");
  const inject = placeUrls.map((u) => `  <url><loc>${BASE}${u}</loc><lastmod>${today}</lastmod></url>`).join("\n");
  sm = sm.replace("</urlset>", inject + "\n</urlset>");
  writeFileSync(smPath, sm);
}
console.log(`✓ places: ${pages} static business pages → dist/cities/*/places/* (+ sitemap now ${placeUrls.length + 37} URLs)`);
