// Wire the delivered per-city photos into config.images so the engine renders real
// imagery (hero, story dispersal, cinematic breaks, wall mosaic) instead of gradient
// fallbacks. Reads cities/<slug>/images/ and writes config.images into
// cities-modular/<slug>/config.json.  Usage: node scripts/wire-images.mjs <slug> [slug...]
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const slugs = process.argv.slice(2);
if (!slugs.length) throw new Error("usage: node scripts/wire-images.mjs <slug> [slug...]");

for (const slug of slugs) {
  const imgDir = path.join(ROOT, "cities", slug, "images");
  const cfgPath = path.join(ROOT, "cities-modular", slug, "config.json");
  if (!existsSync(imgDir)) { console.log(`⚠ ${slug}: no cities/${slug}/images — skipped`); continue; }
  if (!existsSync(cfgPath)) { console.log(`⚠ ${slug}: no config.json yet — skipped`); continue; }

  const files = readdirSync(imgDir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
  const hero = files.find((f) => /^hero/i.test(f)) ?? null;
  const seasonal = files.filter((f) => /^seasonal/i.test(f)).sort();
  const cat = files.filter((f) => /^dir-/i.test(f)); // dir-<category>.jpg → per-category card photo
  const story = files.filter((f) => f !== hero && !/^seasonal/i.test(f) && !/^dir-/i.test(f)).sort();

  // dir-<category>.jpg → { <category>: "dir-<category>.jpg" } (business cards read CAT_IMAGES[category])
  const categories = {};
  for (const f of cat) {
    const key = f.replace(/^dir-/i, "").replace(/\.[^.]+$/, "");
    categories[key] = f;
  }

  const config = JSON.parse(readFileSync(cfgPath, "utf8"));
  config.images = {
    hero,                         // HERO.image
    story,                        // FeedStoryCard + Classic dispersal + cinematic breaks
    wall: seasonal,               // wall mosaic (seasonal shots read well as a grid)
    categories,                   // per-category business-card photos
    section_breaks: {},
  };
  writeFileSync(cfgPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`✓ ${slug}: hero=${hero} story=${story.length} wall=${seasonal.length} categories=${Object.keys(categories).length}`);
}
