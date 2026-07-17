// WS5 — the concierge's shared brain, used identically by both views.
// Layer 1: a scored keyword match over the city's concierge nodes (instant, free,
// upgrades the old first-match-wins). Layer 2: askConcierge() → /api/concierge,
// Claude grounded in the city's own business graph, server-validated so it can
// never name a venue that isn't in the directory.

/**
 * Score the query against every node; highest sum of matched key lengths wins,
 * with a word-boundary bonus so "eat" beats accidental substring hits.
 * @param {string} q
 * @param {Array<{keys:string[],text:string,chips?:string[],businesses?:string[]}>} nodes
 * @returns {{node: any, score: number, confident: boolean}}
 */
export function scoreNodes(q, nodes) {
  const ql = (q || "").toLowerCase().trim();
  let best = null, bestScore = 0, exact = false;
  for (const n of nodes || []) {
    let s = 0;
    for (const k of n.keys || []) {
      const kl = k.toLowerCase();
      if (!ql.includes(kl)) continue;
      let pts = kl.length;
      // word-boundary bonus: "bar" inside "barbecue" scores less than the word "bar"
      try {
        const esc = kl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`(^|\\W)${esc}($|\\W)`).test(ql)) pts *= 1.5;
      } catch { /* keep base points */ }
      s += pts;
      if (ql === kl) exact = true;
    }
    if (s > bestScore) { bestScore = s; best = n; }
  }
  return {
    node: best || (nodes && nodes[0]) || null,
    score: bestScore,
    // one real word matched on a boundary (≥4*1.5) or the query IS a key ("hi")
    confident: exact || bestScore >= 6,
  };
}

/**
 * Layer 2: ask the grounded concierge function. Resolves the contract object
 * {source:"ai"|"budget"|"fallback", text, picks:[{name,why}]} or null on ANY
 * failure (timeout, non-200, parse) — callers always have a Layer-1 fallback.
 * @param {string} city @param {string} q @param {number} [timeoutMs]
 * @returns {Promise<{source:string,text:string,picks:Array<{name:string,why:string}>}|null>}
 */
export async function askConcierge(city, q, timeoutMs = 9000) {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch("/api/concierge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, q }),
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.ok !== true || typeof data.text !== "string") return null;
    return { source: data.source, text: data.text, picks: Array.isArray(data.picks) ? data.picks : [] };
  } catch {
    return null;
  }
}

/**
 * Map validated picks to full business objects for the views' existing business
 * renderers. Unknown names are dropped (defense in depth — the server already
 * validated against the directory).
 * @param {Array<{name:string}>} picks @param {Record<string, any>} byName
 */
export function renderPicksToBusinesses(picks, byName) {
  return (picks || []).map((p) => byName[p && p.name]).filter(Boolean);
}
