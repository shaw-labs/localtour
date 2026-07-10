// LocalTour WS4 — founder CLI to export captured leads to CSV.
//
// The money-door forms (merchant intake, DMO city inquiry, newsletter) POST to
// /api/lead, which stores each submission in the Netlify Blobs "lt-leads" store.
// This dumps one form's leads to a CSV you can open in Sheets/Excel.
//
// Usage:
//   node scripts/export-leads.mjs --form merchant-intake [--out leads.csv]
//   forms: newsletter | merchant-intake | city-inquiry
//
// Runs OUTSIDE the Netlify runtime, so @netlify/blobs needs explicit credentials:
//   export NETLIFY_SITE_ID=307ea660-1618-4355-9520-1e23dda757f7
//   export NETLIFY_API_TOKEN=<a Netlify personal access token>
import { writeFileSync } from "node:fs";
import { getStore } from "@netlify/blobs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    if (eq !== -1) { args[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const key = a.slice(2), next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function fail(msg) { console.error(msg); process.exit(1); }

const FORMS = ["newsletter", "merchant-intake", "city-inquiry"];
const args = parseArgs(process.argv.slice(2));
const form = typeof args.form === "string" ? args.form : "";
if (!FORMS.includes(form)) fail(`--form must be one of: ${FORMS.join(" | ")}\nUsage: node scripts/export-leads.mjs --form merchant-intake [--out leads.csv]`);

const siteID = process.env.NETLIFY_SITE_ID;
const token = process.env.NETLIFY_API_TOKEN;
if (!siteID || !token) {
  fail(
    "Netlify credentials missing. Set both, then re-run:\n\n" +
      "  export NETLIFY_SITE_ID=307ea660-1618-4355-9520-1e23dda757f7\n" +
      "  export NETLIFY_API_TOKEN=<a Netlify personal access token>\n",
  );
}

const store = getStore({ name: "lt-leads", siteID, token });
const listed = await store.list({ prefix: `${form}/` });
const leads = [];
for (const blob of listed.blobs) {
  try { const raw = await store.get(blob.key); if (raw) leads.push(JSON.parse(raw)); } catch { /* skip */ }
}
leads.sort((a, b) => a.ts - b.ts);

const csv = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const cols = [...new Set(leads.flatMap((l) => Object.keys(l.fields || {})))];
const header = ["submitted_at", ...cols];
const rows = leads.map((l) => [new Date(l.ts).toISOString(), ...cols.map((c) => csv((l.fields || {})[c] || ""))]);
const out = [header.map(csv).join(","), ...rows.map((r) => r.join(","))].join("\n") + "\n";

const outFile = typeof args.out === "string" ? args.out : `${form}-leads.csv`;
writeFileSync(outFile, out);
console.log(`✓ ${leads.length} ${form} lead(s) → ${outFile}`);
