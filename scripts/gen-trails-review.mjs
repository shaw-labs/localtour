// WS8 — assemble the founder's single batch-review document for the 250 Trails.
// The brief gates ship on founder sign-off of all flagship narratives and stop
// lists; this emits docs/TRAILS_REVIEW.md with every trail's full text, stop
// list (with each stop's directory identity for context), and resolution status.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const modular = path.join(ROOT, "cities-modular");
const slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "trails.json")));
const LEGACY = new Set(["chicago", "houston", "los-angeles", "miami", "new-orleans", "new-york-city", "san-francisco", "smoky-mountains"]);

const lines = [
  "# 250 Trails — founder batch review (WS8)",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} from cities-modular/*/trails.json.`,
  "Review each narrative + stop list; the 8 NEW legacy-city trails gate the campaign ship.",
  "Every stop resolves to a real directory listing (enforced by validate-cities).",
  "Edit the trail's trails.json directly for changes, or note them here.",
  "",
];

let newCount = 0, factoryCount = 0;
for (const slug of slugs) {
  const trails = JSON.parse(readFileSync(path.join(modular, slug, "trails.json"), "utf8"));
  if (!trails.length) continue;
  const dir = new Map(JSON.parse(readFileSync(path.join(modular, slug, "directory.json"), "utf8")).map((b) => [b.name, b]));
  const cfg = JSON.parse(readFileSync(path.join(modular, slug, "config.json"), "utf8"));
  const isNew = LEGACY.has(slug);
  if (isNew) newCount++; else factoryCount++;

  for (const t of trails) {
    const words = (t.narrative || "").trim().split(/\s+/).length;
    lines.push("---", "");
    lines.push(`## ${cfg.name} — ${t.title} ${isNew ? "· **NEW (sign-off required)**" : "· factory (shipped with batch-2)"}`);
    lines.push("");
    lines.push(`> **Hook:** ${t.hook}`);
    lines.push("");
    lines.push(`**Neighborhoods:** ${(t.neighborhoods || []).join(" · ")} · **Narrative:** ${words} words · **Stops:** ${t.stops.length}`);
    lines.push("");
    lines.push(t.narrative || "");
    lines.push("");
    lines.push("| # | Stop | Directory identity | Why this stop |");
    lines.push("|---|------|--------------------|---------------|");
    t.stops.forEach((s, i) => {
      const b = dir.get(s.biz);
      const ident = b ? `${(b.category || "").replace(/_/g, " ")}${b.address ? " · " + b.address.split(",")[0] : ""}` : "⚠ UNRESOLVED";
      lines.push(`| ${i + 1} | **${s.biz}** | ${ident} | ${s.note.replace(/\|/g, "\\|")} |`);
    });
    lines.push("");
    lines.push(`- [ ] ${cfg.name} narrative approved   - [ ] stop list approved`);
    lines.push("");
  }
}

lines.unshift(`**${newCount} new trails for sign-off · ${factoryCount} factory trails included for reference.**`, "");
const out = path.join(ROOT, "docs", "TRAILS_REVIEW.md");
writeFileSync(out, lines.join("\n") + "\n");
console.log(`✓ trails review doc: ${newCount} new + ${factoryCount} factory → docs/TRAILS_REVIEW.md`);
