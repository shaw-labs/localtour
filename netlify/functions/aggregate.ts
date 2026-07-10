// LocalTour WS3 — scheduled daily aggregate rollup.
//
// Reduces yesterday's + today's RAW events (lt-events) into per-day DayAgg
// documents (lt-agg), one per city/date. This is a scale/retention
// optimization: /api/stats reads RAW events live over the last 30 days, so
// freshness never depends on this job — it just keeps a compact rollup around
// and lets raw retention be trimmed later. Keep it simple and safe: a bad city
// or date must not abort the whole run.
//
// Idempotent: writeAgg overwrites the day's document, so re-running (or the
// yesterday/today overlap on consecutive runs) only ever re-derives the same
// counts from the same raw events.

import type { Context } from "@netlify/functions";
import { isoDate, listEventCities, listRawRange, writeAgg, type DayAgg } from "./_shared/store.js";

const DAY_MS = 86_400_000;

export default async (_req: Request, _context: Context): Promise<Response> => {
  const now = Date.now();
  // Two UTC dates: yesterday and today. Distinct (exactly 24h apart), so we
  // always roll up the current day plus the one that may have received late
  // events after the previous run.
  const dates = [isoDate(now - DAY_MS), isoDate(now)];

  let cityCount = 0;
  let daysWritten = 0;
  let eventsReduced = 0;
  const summary: Record<string, Record<string, number>> = {};
  const errors: Array<{ city: string; date: string; error: string }> = [];

  let cities: string[] = [];
  try {
    cities = await listEventCities();
  } catch (err) {
    return json(500, { ok: false, error: describe(err) });
  }

  for (const city of cities) {
    cityCount++;
    for (const date of dates) {
      try {
        const raw = await listRawRange(city, [date]);

        const agg: DayAgg = {};
        for (const ev of raw) {
          // city-scoped events (pageview_city, planner_generated, share_created)
          // have no biz → bucket under "_city"; biz-scoped events bucket by biz.
          const bucket = ev.biz || "_city";
          const row = (agg[bucket] ??= {});
          row[ev.event] = (row[ev.event] ?? 0) + 1;
        }

        await writeAgg(city, date, agg); // idempotent overwrite
        daysWritten++;
        eventsReduced += raw.length;
        (summary[city] ??= {})[date] = raw.length;
      } catch (err) {
        errors.push({ city, date, error: describe(err) });
      }
    }
  }

  return json(200, {
    ok: errors.length === 0,
    ran_at: new Date(now).toISOString(),
    dates,
    cities: cityCount,
    days_written: daysWritten,
    events_reduced: eventsReduced,
    summary,
    ...(errors.length ? { errors } : {}),
  });
};

export const config = { schedule: "@daily" };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
