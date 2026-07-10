// Build wall.json (community-wall posts) for every city, matching the legacy
// wall.html format: [{id, sig, time, caption, likes, img, album, comments:[{sig,text}]}].
//   • legacy 8 → extract their hand-authored INITIAL_POSTS from the static wall.html
//   • factory 7 → generate posts from the delivered scenic images + in-voice captions
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const modular = path.join(ROOT, "cities-modular");
const citiesDir = path.join(ROOT, "cities");
const slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "config.json")));

// Legacy static wall pages live at cities/<slug>/wall.html with a const INITIAL_POSTS=[...] literal.
function legacyPosts(slug) {
  const p = path.join(citiesDir, slug, "wall.html");
  if (!existsSync(p)) return null;
  const src = readFileSync(p, "utf8");
  const m = src.match(/INITIAL_POSTS\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) return null;
  try {
    const posts = JSON.parse(m[1]); // the literal is strict JSON (double-quoted keys)
    return posts.map((x) => ({ album: "Photos", comments: [], ...x }));
  } catch {
    return null;
  }
}

// Voice + like/time banks for generated factory-city posts.
const AUTHORS = ["", "Maya R.", "", "Devon", "Priya", "", "Marcus T.", "Lena", "", "Cole"];
const TIMES = ["2 hours ago", "5 hours ago", "Yesterday", "Yesterday", "2 days ago", "3 days ago", "Last week"];
const like = (i) => 90 + ((i * 137 + 41) % 210); // deterministic pseudo-likes

// Per-city caption bank keyed by image-theme (matches the delivered filenames).
const CAPTIONS = {
  phoenix: { "hero-aerial": "Valley of the Sun from above. That light is real.", "seasonal-winter": "Snowbird season. 72 and not sorry about it.", "seasonal-summer": "Summer in Phoenix. The pool won, and I let it.", "seasonal-spring": "Spring training crowds, citrus in the air.", "seasonal-fall": "Golden hour on the desert. Every single night.", "district-roosevelt-row": "Chased the murals down Roosevelt Row.", "outdoors-papago-park": "Hole-in-the-Rock at sunset. Worth the early wake-up.", "resort-golf-corridor": "Camelback corridor. Pretended I could afford it." },
  "salt-lake-city": { "hero-aerial": "The Wasatch right off downtown. Still can't believe it.", "seasonal-winter": "Greatest Snow on Earth is not just a slogan.", "seasonal-summer": "Canyon hiking, then a global dinner on State Street.", "seasonal-spring": "Snow up top, blossoms in the valley. Same day.", "seasonal-fall": "Aspen gold in the Cottonwoods.", "district-temple-square": "Temple Square, then State Street for dumplings.", "outdoors-cottonwood-canyon": "First chair. Canyon traffic was worth it.", "food-global-state-street": "Every block on State Street is a different country." },
  nashville: { "hero-aerial": "Music City skyline, second verse.", "seasonal-winter": "Opryland lights. Corny? Yes. Went twice.", "seasonal-summer": "CMA Fest energy all over downtown.", "seasonal-spring": "Porch weather in East Nashville.", "seasonal-fall": "Songwriter season. Every bar's a stage.", "district-lower-broadway": "Broadway neon. Loud, bright, unapologetic.", "food-hot-chicken": "Hot chicken, extra hot. Regretted nothing.", "music-writers-round": "A writers' round in a tiny room. The real Nashville." },
  "kansas-city": { "hero-aerial": "KC from up high — fountains everywhere.", "seasonal-winter": "Chiefs season. The whole city's red.", "seasonal-summer": "Ballpark nights and burnt ends.", "seasonal-spring": "Patio and baseball weather, finally.", "seasonal-fall": "Crisp air, smoke on the breeze.", "district-18th-vine": "18th & Vine. Jazz still lives here.", "bbq-pit": "Burnt ends. I understand now.", "landmark-union-station": "Union Station glowing at dusk." },
  denver: { "hero-aerial": "Mile High, Rockies on the horizon.", "seasonal-winter": "Ski-gateway mornings, city nights.", "seasonal-summer": "Red Rocks season. Nothing beats it.", "seasonal-spring": "300 days of sun, and today was one.", "seasonal-fall": "Golden foothills an hour from downtown.", "district-rino": "RiNo murals and a brewery on every block.", "red-rocks-evening": "Red Rocks at blue hour. Chills.", "landmark-union-station": "Union Station — the best living room in Denver." },
  austin: { "hero-aerial": "ATX from above, green and blue.", "seasonal-winter": "Mild winter, patios still open.", "seasonal-summer": "Water-first summer: springs, then tacos.", "seasonal-spring": "SXSW chaos, in the best way.", "seasonal-fall": "ACL weekend. The whole city sings.", "district-east-austin": "East side murals and cold beer.", "water-barton-springs": "Barton Springs, 68 degrees year-round.", "bats-congress-bridge": "A million bats off Congress at dusk." },
  portland: { "hero-aerial": "Bridges and firs. Peak PNW.", "seasonal-winter": "Rainy_day pool is real here. Museums it is.", "seasonal-summer": "The glorious dry season. Everything's open.", "seasonal-spring": "Rose Festival blooms everywhere.", "seasonal-fall": "First rains, first soups.", "district-alberta": "Alberta arts district, coffee in hand.", "food-cart-pod": "Cart pod dinner. Six countries, one block.", "forest-park": "Forest Park ferns after the rain." },
};

function themeOf(file) {
  return file.replace(/\.[^.]+$/, "").replace(/-(sm)$/, "");
}

function generatedPosts(slug) {
  const imgDir = path.join(citiesDir, slug, "images");
  if (!existsSync(imgDir)) return [];
  const bank = CAPTIONS[slug] || {};
  // scenic images make good "travel photos": hero, seasonal, themed story shots (not dir-* cards)
  const files = readdirSync(imgDir).filter(
    (f) => /\.(jpe?g|png)$/i.test(f) && !/^dir-/i.test(f) && !/-sm\./i.test(f),
  );
  // order: themed/story first, then seasonal, then hero
  const rank = (f) => (/^hero/i.test(f) ? 3 : /^seasonal/i.test(f) ? 2 : 1);
  files.sort((a, b) => rank(a) - rank(b));
  return files.map((f, i) => {
    const theme = themeOf(f);
    const caption = bank[theme] || `A little bit of ${slug.replace(/-/g, " ")}, in the wild.`;
    return {
      id: i + 1,
      sig: AUTHORS[i % AUTHORS.length],
      time: TIMES[i % TIMES.length],
      caption,
      likes: like(i),
      img: `/cities/${slug}/images/${f}`,
      album: "Photos",
      comments: [],
    };
  });
}

let legacy = 0, gen = 0;
for (const slug of slugs) {
  const posts = legacyPosts(slug) ?? generatedPosts(slug);
  if (legacyPosts(slug)) legacy++; else gen++;
  writeFileSync(path.join(modular, slug, "wall.json"), JSON.stringify(posts, null, 2) + "\n");
}
console.log(`✓ walls: ${legacy} legacy extracted + ${gen} generated → cities-modular/*/wall.json`);
