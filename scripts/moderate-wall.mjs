// LocalTour — founder moderation for visitor wall posts (lt-wall store).
//
// New posts are gated by Claude vision (netlify/functions/_shared/moderate.ts):
// clean → live instantly; flagged OR moderator-unavailable → held "pending"
// for you. This CLI is the approval queue.
//
//   node scripts/moderate-wall.mjs --city phoenix                  # list all (status + reason)
//   node scripts/moderate-wall.mjs --city phoenix --pending        # the review queue only
//   node scripts/moderate-wall.mjs --city phoenix --approve <id>   # publish a held post
//   node scripts/moderate-wall.mjs --city phoenix --delete <id>    # remove post + photo
//
// Runs outside the Netlify runtime — set credentials first:
//   export NETLIFY_SITE_ID=<site id>   (prod: 4ca64564-dd18-4b9f-8b5a-0e7e8c83cd91)
//   export NETLIFY_API_TOKEN=<personal access token>
import { getStore } from "@netlify/blobs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2), next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}
const fail = (m) => { console.error(m); process.exit(1); };

const args = parseArgs(process.argv.slice(2));
const city = typeof args.city === "string" ? args.city : "";
if (!/^[a-z0-9-]+$/.test(city)) fail("Usage: node scripts/moderate-wall.mjs --city <slug> [--delete <post-id>]");

const siteID = process.env.NETLIFY_SITE_ID, token = process.env.NETLIFY_API_TOKEN;
if (!siteID || !token) fail("Set NETLIFY_SITE_ID and NETLIFY_API_TOKEN first.");

const store = getStore({ name: "lt-wall", siteID, token });

if (typeof args.delete === "string") {
  const id = args.delete;
  await store.delete(`post/${city}/${id}`);
  await store.delete(`img/${city}/${id}`).catch(() => {});
  console.log(`✓ removed ${city}/${id} (post + photo)`);
} else if (typeof args.approve === "string") {
  const id = args.approve;
  const key = `post/${city}/${id}`;
  const raw = await store.get(key);
  if (!raw) fail(`no post ${city}/${id}`);
  const post = JSON.parse(raw);
  post.status = "live";
  await store.set(key, JSON.stringify(post));
  console.log(`✓ approved ${city}/${id} — now live on the wall`);
  console.log(`  ${(post.sig || "Visitor")}: ${post.caption.slice(0, 80)}`);
} else {
  const pendingOnly = Boolean(args.pending);
  const listed = await store.list({ prefix: `post/${city}/` });
  if (!listed.blobs.length) { console.log(`no visitor posts for ${city}`); process.exit(0); }
  let shown = 0, pending = 0;
  for (const b of listed.blobs) {
    try {
      const p = JSON.parse(await store.get(b.key));
      const status = p.status ?? "live";
      if (status === "pending") pending++;
      if (pendingOnly && status !== "pending") continue;
      shown++;
      const why = p.mod ? `  [${p.mod.by}${p.mod.category ? ":" + p.mod.category : ""}] ${p.mod.reason || ""}` : "";
      console.log(`${status === "pending" ? "⏳ PENDING" : "✅ live   "}  ${p.id}  ${new Date(p.ts).toISOString()}  ${p.imgKey ? "📷" : "  "}  ${(p.sig || "Visitor").padEnd(14)} ${p.caption.slice(0, 60)}${why}`);
    } catch { console.log(`${b.key}  (unreadable)`); }
  }
  console.log(`\n${shown} shown · ${pending} awaiting review.`);
  if (pending) console.log(`Approve: node scripts/moderate-wall.mjs --city ${city} --approve <id>   Remove: --delete <id>`);
}
