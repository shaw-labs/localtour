// Open-now status from LocalTour's FREE-TEXT hours strings. Parses only
// high-confidence patterns; anything ambiguous returns "unknown" (never a
// guess, never a throw). Used by place cards + place pages.
//
// openStatus("Tue-Sat 5-10pm") → { status: "open"|"closed"|"unknown", label }

const DAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

/** parse a day token → 0..6 (matches on the first 3 letters), or null */
function dayNum(tok) {
  const t = tok.toLowerCase().replace(/[^a-z]/g, "").slice(0, 3);
  return DAYS[t] ?? null;
}

/** expand "Wed-Sun" → [3,4,5,6,0]; wraps (Fri-Mon → 5,6,0,1) */
function dayRange(a, b) {
  const s = dayNum(a), e = dayNum(b);
  if (s == null || e == null) return null;
  const out = [];
  let d = s;
  for (let i = 0; i < 7; i++) { out.push(d); if (d === e) break; d = (d + 1) % 7; }
  return out;
}

/** "9am" / "4:30pm" / "noon" / "midnight" / "17" → minutes since midnight, or null.
 *  meridiemHint carries a pm/am seen later in the same range so "5-10pm" → 5pm. */
function toMin(tok, meridiemHint) {
  const t = tok.toLowerCase().trim();
  if (t === "noon") return 12 * 60;
  if (t === "midnight") return 0;
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] || 0);
  const mer = m[3] || meridiemHint;
  if (mer === "pm" && h !== 12) h += 12;
  else if (mer === "am" && h === 12) h = 0;
  else if (!mer && h <= 11) return null; // bare number, no hint — too ambiguous
  return h * 60 + min;
}

const isOpen = (status, label) => ({ status, label });

/**
 * @param {string} hoursStr
 * @param {Date} [now]
 * @returns {{status:"open"|"closed"|"unknown", label:string}}
 */
export function openStatus(hoursStr, now = new Date()) {
  if (!hoursStr || typeof hoursStr !== "string") return isOpen("unknown", "");
  const h = hoursStr.toLowerCase().trim();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  if (/24\s*\/\s*7|24\s*hours|always\s*open|open\s*24/.test(h)) return isOpen("open", "Open now");
  if (/irregular|call|varies|by appointment|check|social media|seasonal|hours vary/.test(h)) return isOpen("unknown", "");

  // split into segments ("Sun-Thu 4:30-10pm, Fri-Sat 4:30-11pm")
  const segments = h.split(/[,;]|\band\b/).map((s) => s.trim()).filter(Boolean);
  let sawTimedSegment = false;
  let dayKnownButUntimed = null; // "evenings"/"dinner" fallback

  for (const seg of segments) {
    // leading day range (optional) — "daily" / "everyday" = all week
    let days = null;
    const dm = seg.match(/^(daily|everyday|every day)\b/);
    if (dm) days = [0, 1, 2, 3, 4, 5, 6];
    else {
      const dr = seg.match(/^([a-z]{3,5})\s*[-–]\s*([a-z]{3,5})/);
      if (dr) days = dayRange(dr[1], dr[2]);
      else {
        const single = seg.match(/^([a-z]{3,5})\b/);
        const d = single ? dayNum(single[1]) : null;
        if (d != null) days = [d];
      }
    }
    // a time range anywhere in the segment
    const tr = seg.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|noon|midnight)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|noon|midnight)/);

    if (tr) {
      const rangeMer = /pm/.test(tr[2]) ? "pm" : /am/.test(tr[2]) ? null : null;
      let start = toMin(tr[1], rangeMer);
      let end = toMin(tr[2]);
      if (start != null && end != null) {
        sawTimedSegment = true;
        const applies = !days || days.includes(day);
        const crosses = end <= start; // "9am-2am"
        if (applies) {
          if (crosses ? (mins >= start || mins < end) : (mins >= start && mins < end)) return isOpen("open", "Open now");
        }
        // crossing-midnight: also "open" if it's the NEXT day early morning of yesterday's window
        if (crosses && days && days.includes((day + 6) % 7) && mins < end) return isOpen("open", "Open now");
        continue;
      }
    }

    // no parseable time in this segment — remember day-only + evening hints
    if (days) {
      if (days.includes(day)) {
        // pure "evenings/dinner" today → we can bracket 5–10pm; any OTHER untimed
        // daypart (lunch/brunch/all-day) today means we don't know the hour → "day"
        if (/evenings?|dinner/.test(seg)) { if (dayKnownButUntimed == null) dayKnownButUntimed = "evening"; }
        else dayKnownButUntimed = "day";
      } else if (dayKnownButUntimed == null) {
        dayKnownButUntimed = "off"; // today falls outside a stated day range
      }
    }
  }

  if (sawTimedSegment) return isOpen("closed", "Closed now");

  // day-only strings: we know the day but usually not the hour
  if (dayKnownButUntimed === "off") return isOpen("closed", "Closed today");
  if (dayKnownButUntimed === "evening") {
    if (mins >= 17 * 60 && mins < 22 * 60) return isOpen("open", "Open now");
    if (mins < 16 * 60) return isOpen("closed", "Opens this evening");
    return isOpen("unknown", "");
  }
  return isOpen("unknown", "");
}
