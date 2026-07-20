// WS8 — one-shot corrections from the adversarial fact-check pass (wf_f89db923).
// Every change below implements a sourced finding; "when uncertain, say less."
// Run once; verifies each replacement actually applied and exits 1 on any miss.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const FIXES = {
  miami: [
    // Sunny's is Will Thompson + Carey Hynes (Jaguar Sun), NOT the Boia De couple.
    ["at the open-air courtyard from the same couple behind Boia De — a pop-up that grew",
     "at the open-air courtyard — a pop-up that grew"],
  ],
  "new-orleans": [
    // Oysters Rockefeller: created 1889 (Antoine's own history), not 1899.
    ["the birthplace of oysters Rockefeller in 1899", "the birthplace of oysters Rockefeller in 1889"],
    // Building is 1868, dish 1889 — "1840 dining room that invented them" overstates.
    ["oysters Rockefeller in the 1840 dining room that invented them",
     "oysters Rockefeller at the 1840 house that invented them"],
    // Parkway closed '93/reopened '03 and no longer bakes its own bread.
    ["Baking on this Mid-City corner since 1911, Parkway opened its poor boy shop",
     "On this Mid-City corner since 1911, Parkway opened its poor boy shop"],
  ],
  houston: [
    // Fajitas weren't born on Navigation (Sonny Falcon, Kyle TX 1969; vaquero origins) —
    // Ninfa's POPULARIZED tacos al carbon from there.
    ["the fajita's Navigation Boulevard birthplace", "the Navigation Boulevard taqueria that taught America to crave tacos al carbon"],
    ["fajita's birthplace on Navigation Boulevard", "Navigation Boulevard, where tacos al carbon became a national craving"],
    // Lashkari's 1980 arrival year is unverifiable — say less.
    ["Kaiser Lashkari came from Pakistan in 1980 and", "Kaiser Lashkari came from Karachi and"],
    // 145 languages is census-derived (Kinder popularized it) — attribute loosely.
    ["Rice's Kinder Institute has been publishing", "the census keeps confirming"],
    // One finalist nod on record, not plural.
    ["James Beard finalist nods", "a James Beard finalist nod"],
  ],
  "smoky-mountains": [
    // Old Mill: Isaac Love built the 1817 forge; the mill came later (son William, 1830s).
    ["Isaac Love's 1830 gristmill", "the Love family's 1830s gristmill"],
    // Original stones replaced (1977) — drop "same equipment".
    ["still grinds meal and grits today with the same equipment it started with",
     "still grinds meal and grits today, two centuries into the same trade"],
    // The standing Primitive Baptist church building is 1887 (congregation 1827).
    ["the 1827 Primitive Baptist church", "the Primitive Baptist church (a congregation organized in 1827)"],
    // Cable Mill: NPS says "around 1870", not 1868.
    ["an 1868 water mill", "a water mill from around 1870"],
    ["the 1868 Cable Mill", "John Cable's gristmill, built around 1870,"],
    // Ole Smoky "first federally licensed in East TN" is marketing — hedge.
    ["the license that in 2010 made this the first federally licensed distillery in East Tennessee's history",
     "the 2010 license that made legal moonshine a Gatlinburg fixture"],
  ],
  "new-york-city": [
    // Economy Candy origin mechanism contradicted by the store's own telling — keep the verifiable core.
    ["the Cohen family's candy cart outsold their shoe-repair shop in the Depression, so in 1937 the candy won",
     "penny candy has crowded every shelf on Rivington since 1937"],
    ["The Cohen family's Depression-era candy cart outsold the shoes, and by 1937 the candy had the whole store.",
     "Floor-to-ceiling penny candy on Rivington since 1937 — three generations in, the whole store still belongs to the sweets."],
    // Katz's 1888 is the deli's own count, disputed by historians — attribute it.
    ["since 1888", "since 1888 by its own count"],
    // Russ & Daughters: first KNOWN.
    ["the first \\\"& Daughters\\\" business in America", "the first known \\\"& Daughters\\\" business in America"],
    // The walk is ~1.5 miles, not fifteen blocks.
    ["Fifteen blocks", "A mile and a half"],
  ],
  chicago: [
    // "Invented" stated as flat fact where sources hedge.
    ["created the Maxwell Street Polish in 1943", "by most tellings created the Maxwell Street Polish in 1943"],
    // Kasama is Ukrainian Village, not "up north" with Andersonville's Simon's.
    ["Finish up north, where a Swedish tavern has poured since 1934 and a Filipino tasting counter holds the newest star",
     "Finish where a Swedish tavern has poured since 1934 up in Andersonville — after a Ukrainian Village tasting counter that carried Filipino cooking to a Michelin star"],
  ],
};

let misses = 0;
for (const [slug, subs] of Object.entries(FIXES)) {
  const p = path.join(ROOT, "cities-modular", slug, "trails.json");
  let src = readFileSync(p, "utf8");
  for (const [from, to] of subs) {
    if (!src.includes(from)) {
      console.error(`✗ ${slug}: pattern not found → ${from.slice(0, 70)}…`);
      misses++;
      continue;
    }
    src = src.split(from).join(to);
  }
  writeFileSync(p, src);
  console.log(`✓ ${slug}: ${subs.length} fixes attempted`);
}
if (misses) { console.error(`${misses} pattern(s) missed — inspect manually`); process.exit(1); }
console.log("All fact-check corrections applied.");
