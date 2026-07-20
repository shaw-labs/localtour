// LocalTour engine — event/deal expiry (WS2 truth pass). Events auto-hide once
// past; recurring/undated events are evergreen and always shown. Handles the three
// legacy date formats: single ISO ("2026-06-12"), ISO range ("A to B"/"A through B"),
// and recurring free text ("recurring: mid-July").

/** The date an event is "over" — the LATEST ISO date in the string, or null for
 *  recurring/undated (evergreen). Ranges expire on their END date (fixes the FIFA
 *  bug: LA/SF encoded the World Cup as a past single date, NYC as the live range). */
export function eventEndDate(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr);
  if (/^\s*recurring/i.test(s)) return null; // evergreen
  const iso = s.match(/\d{4}-\d{2}-\d{2}/g);
  return iso && iso.length ? iso[iso.length - 1] : null; // last ISO date = end; none → evergreen
}

/** today as an ISO date string (client-render time, so expiry is relative to the viewer). */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isEventActive(dateStr, today = todayISO()) {
  const end = eventEndDate(dateStr);
  return end === null || end >= today;
}

export function isDealActive(deal, today = todayISO()) {
  return !deal.expires || deal.expires >= today;
}
