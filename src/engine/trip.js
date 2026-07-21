// "Add to trip" — a per-city list of business names in localStorage, shared by
// place cards, the concierge, and the planner. Ordered, unique, never throws
// (storage-blocked → session-only in-memory). A change listener lets React
// chips re-render, and cross-tab edits sync via the storage event.
import { planParam } from "./planShare";

const KEY = "lt_trip";
let memory = null; // fallback when localStorage is unavailable
const listeners = new Set();

/** @returns {Record<string,string[]>} */
function readAll() {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    memory = memory || {};
    return memory;
  }
}

function writeAll(obj) {
  if (memory) { memory = obj; fire(); return; }
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {
    memory = obj; // switched to session mode
  }
  fire();
}

function fire() {
  for (const cb of listeners) { try { cb(); } catch { /* a bad listener can't break others */ } }
}

/** @param {string} city @returns {string[]} */
export function tripList(city) {
  const all = readAll();
  return Array.isArray(all[city]) ? all[city] : [];
}

/** @param {string} city @param {string} name */
export function tripHas(city, name) {
  return tripList(city).includes(name);
}

/** Toggle a place in/out of the city's trip. @returns {boolean} new membership */
export function tripToggle(city, name) {
  const all = readAll();
  const list = Array.isArray(all[city]) ? all[city].slice() : [];
  const i = list.indexOf(name);
  let added;
  if (i === -1) { list.push(name); added = true; } else { list.splice(i, 1); added = false; }
  writeAll({ ...all, [city]: list });
  return added;
}

/** @param {string} city @returns {number} */
export function tripCount(city) {
  return tripList(city).length;
}

/** @param {string} city */
export function tripClear(city) {
  const all = readAll();
  if (!all[city]) return;
  const next = { ...all };
  delete next[city];
  writeAll(next);
}

/**
 * A shareable/read-only URL for the current trip (same ?plan= format the planner
 * emits — the trip IS an itinerary). Null when empty or nothing resolves.
 * @param {string} city @param {Record<string,any>} byName
 * @returns {string|null}
 */
export function tripPlanUrl(city, byName) {
  const names = tripList(city);
  if (!names.length) return null;
  const slots = names.map((n, i) => ({ time: `Stop ${i + 1}`, biz: byName[n] })).filter((s) => s.biz);
  if (!slots.length) return null;
  const itinerary = [{ day: 1, label: "My trip", slots }];
  return `/cities/${city}` + planParam({ days: 1, crew: "trip", vibes: [] }, itinerary);
}

/** Subscribe to trip changes (toggle/clear + cross-tab). @returns {() => void} unsubscribe */
export function onTripChange(cb) {
  listeners.add(cb);
  const onStorage = (e) => { if (e.key === KEY) cb(); };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
