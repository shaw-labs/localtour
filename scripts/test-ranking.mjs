// Plain node test for the WS4 tier-ranking engine (no framework).
//   run: node scripts/test-ranking.mjs
// Asserts the two Principle-6 guarantees plus tie-break + purity behavior.
import { applyTierBoost } from "../src/engine/ranking.js";

let failures = 0;
function check(label, cond) {
  if (cond) {
    console.log("PASS: " + label);
  } else {
    console.log("FAIL: " + label);
    failures++;
  }
}
const idx = (arr, name) => arr.findIndex((b) => b.name === name);

const promotions = {
  testville: {
    PromoPartner: "partner",
    PromoPartner2: "partner",
    PromoAnchor: "anchor",
  },
};

// (a) A promoted item is boosted above an equal-or-lower-rated organic item.
// Organic order puts MidOrganic above the equally-rated PromoPartner; after the
// boost the promoted item overtakes it — while the clearly-best TopOrganic holds
// slot 1.
const catA = [
  { name: "TopOrganic", rating: 4.8 },
  { name: "MidOrganic", rating: 4.3 },
  { name: "PromoPartner", rating: 4.3 },
];
const outA = applyTierBoost(catA, "testville", promotions);
check("(a) promoted item boosted above equal-rated organic item",
  idx(outA, "PromoPartner") < idx(outA, "MidOrganic"));
check("(a) organically best item still holds slot 1",
  outA[0].name === "TopOrganic");

// (b) An organic item rated strictly higher than every promoted item is STILL
// slot 1 after the boost — money cannot buy the top spot from a better place.
const catB = [
  { name: "PromoAnchor", rating: 4.2 },
  { name: "PromoPartner2", rating: 4.4 },
  { name: "PlainBest", rating: 4.9 },
];
const outB = applyTierBoost(catB, "testville", promotions);
check("(b) organic item rated above every promoted item stays slot 1",
  outB[0].name === "PlainBest");

// anchor outranks partner when organic ratings are equal.
const catC = [
  { name: "Filler", rating: 5.0 },
  { name: "PromoPartner", rating: 4.5 },
  { name: "PromoAnchor", rating: 4.5 },
];
const outC = applyTierBoost(catC, "testville", promotions);
check("anchor ranks ahead of partner at equal rating",
  idx(outC, "PromoAnchor") < idx(outC, "PromoPartner"));

// missing ratings -> treated as 0; promoted floats up among the unrated, but the
// organic incumbent keeps slot 1.
const catD = [
  { name: "PlainA" },
  { name: "PromoPartner" },
  { name: "PlainB" },
];
const outD = applyTierBoost(catD, "testville", promotions);
check("missing ratings handled; promoted floats up among unrated",
  idx(outD, "PromoPartner") < idx(outD, "PlainB"));
check("unrated slot 1 stays the organic incumbent",
  outD[0].name === "PlainA");

// purity: the input array is not mutated.
const catE = [
  { name: "PlainTop", rating: 4.9 },
  { name: "PromoPartner", rating: 4.0 },
];
const beforeE = catE.map((b) => b.name).join(",");
const outE = applyTierBoost(catE, "testville", promotions);
check("input array is not mutated (pure)",
  catE.map((b) => b.name).join(",") === beforeE);
check("returns a new array (not the same reference)", outE !== catE);

if (failures > 0) {
  console.log("\n" + failures + " check(s) FAILED");
  process.exit(1);
}
console.log("\nAll ranking checks passed.");
