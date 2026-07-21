// Classic view — trip planner overlay (ported verbatim; chicago index.html ~2451–2615).
import { useState } from "react";
import { useCityModel } from "../../cityModel";
import { track, bizId } from "../../beacon";
import { planParam } from "../../planShare";
import { PlaceActions } from "../../PlaceActions";

/* ═══ TRIP PLANNER OVERLAY ═══ */
export function R_TripPlanner({onClose}) {
  const { CITY, directory, MODES, slug, planner, byName } = useCityModel();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({days: 2, crew: 'couple', vibes: []});
  const [itinerary, setItinerary] = useState(null);
  const [shared, setShared] = useState(false);

  // Build a shareable URL for the current plan, copy it (best-effort), and log the
  // share via the beacon. Does not mutate the itinerary or touch generate().
  function share() {
    const shareUrl = window.location.pathname + planParam(prefs, itinerary);
    // writeText rejects ASYNC on permission denial — swallow the promise too
    try { navigator.clipboard?.writeText(shareUrl).catch(() => {}); } catch { /* no clipboard API */ }
    track.shareCreated(slug, "classic");
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  }

  function pick(arr, n) {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  }

  // High-confidence "evening-only" detector: keeps a Wed-Sat-dinner tasting room
  // out of the Morning/Lunch slots. Only skips when the hours string is clearly
  // evening ("Tue-Sat evenings", "Wed-Sat 5-10pm", "dinner only") — vague or
  // missing hours never block a pick.
  function eveningOnly(hours) {
    if (!hours) return false;
    const h = hours.toLowerCase();
    if (/(brunch|breakfast|lunch|morning|daily\s*\d|am\b)/.test(h)) return false;
    if (/(evenings?|dinner)\b/.test(h)) return true;
    const first = h.match(/(\d{1,2})(?::\d{2})?\s*(am|pm)?\s*[-–]/);
    if (first && (first[2] === "pm" || (!first[2] && /pm/.test(h))) && Number(first[1]) >= 4 && Number(first[1]) <= 11) return true;
    return false;
  }

  // WS-followup planner brain: draws from the CURATED pools (planner.json —
  // meal-typed and time-of-day-typed by construction), deduped across the WHOLE
  // trip, with soft vibe preference and same-neighborhood affinity per day
  // (no coords exist, so "geography" = shared address neighborhood). Falls back
  // to category-filtered directory only when a pool runs dry on long trips.
  function generate() {
    const pools = planner || {};
    const hood = (b) => (b.address ? (b.address.split(',')[1] || '').trim().toLowerCase() : '');
    const usedTrip = new Set(); // GLOBAL dedupe — a place appears once per trip

    // hydrate a pool: curated items → {biz, note}, dropping unresolvable names
    const hydrate = (key) => (pools[key] || [])
      .map((it) => ({ biz: byName[it.business], note: it.note, duration: it.duration }))
      .filter((x) => x.biz);

    const fallbackCats = {
      food: ['dining', 'coffee_bakeries'],
      fun: ['attractions', 'entertainment', 'outdoor_adventure'],
      bars: ['bars_nightlife'],
    };
    const fallback = (kind) => directory
      .filter((b) => fallbackCats[kind].includes(b.category))
      .map((b) => ({ biz: b, note: null }));

    const days = [];
    for (let d = 0; d < prefs.days; d++) {
      const slots = [];
      let dayHoods = [];

      const addSlot = (time, poolKeys, kind, { daytime = false } = {}) => {
        // candidate chain: curated pools (in preference order) → directory fallback
        let cands = [];
        for (const k of poolKeys) cands = cands.concat(hydrate(k));
        if (!cands.length && kind) cands = fallback(kind);
        cands = cands.filter((c) => !usedTrip.has(c.biz.name));
        if (daytime) {
          const ok = cands.filter((c) => !eveningOnly(c.biz.hours));
          if (ok.length) cands = ok;
        }
        if (!cands.length) return;
        // soft vibe preference
        if (prefs.vibes.length) {
          const vibed = cands.filter((c) => (c.biz.modes || []).some((m) => prefs.vibes.includes(m)));
          if (vibed.length) cands = vibed;
        }
        // neighborhood affinity: prefer candidates in a neighborhood already on today's route
        const shuffled = pick(cands, cands.length);
        const nearby = dayHoods.length ? shuffled.find((c) => dayHoods.includes(hood(c.biz))) : null;
        const chosen = nearby || shuffled[0];
        usedTrip.add(chosen.biz.name);
        const h = hood(chosen.biz);
        if (h && !dayHoods.includes(h)) dayHoods.push(h);
        slots.push({ time, biz: chosen.biz, note: chosen.note || null });
      };

      // rotate the afternoon flavors so multi-day trips don't repeat a theme
      const dayFlavors = prefs.crew === 'family'
        ? [['family_activities'], ['beach_lake_outdoor', 'culture_history'], ['culture_history', 'shopping_browsing']]
        : [['culture_history', 'beach_lake_outdoor'], ['beach_lake_outdoor', 'shopping_browsing'], ['shopping_browsing', 'culture_history']];
      const am = dayFlavors[d % dayFlavors.length];
      const pm = dayFlavors[(d + 1) % dayFlavors.length];
      const dinnerRotation = prefs.crew === 'couple'
        ? [['dinner_romantic'], ['dinner_upscale'], ['dinner_casual']]
        : prefs.crew === 'family'
          ? [['dinner_casual'], ['dinner_casual', 'dinner_upscale']]
          : [['dinner_casual'], ['dinner_upscale'], ['dinner_casual']];

      addSlot('Morning', ['morning_starts'], 'food', { daytime: true });
      addSlot('Late Morning', am, 'fun', { daytime: true });
      addSlot('Lunch', ['casual_lunch'], 'food', { daytime: true });
      addSlot('Afternoon', pm, 'fun');
      if (prefs.crew !== 'family') addSlot('Happy Hour', ['happy_hour_drinks'], 'bars');
      addSlot('Dinner', dinnerRotation[d % dinnerRotation.length], 'food');
      if (prefs.crew !== 'family') addSlot('Night', ['nightlife'], 'bars');

      days.push({
        day: d + 1,
        label: prefs.days === 1 ? 'Your Day' : `Day ${d + 1}`,
        slots
      });
    }
    setItinerary(days);
    setStep(99);
  }

  return (
    <div className="planner-overlay">
      <div className="planner-bar">
        <div className="planner-bar-inner">
          <button className="planner-back" onClick={onClose}>← Back</button>
          <div className="planner-title">Plan your <em>visit</em></div>
          <div style={{width: 60}} />
        </div>
        {step < 3 && (
          <div className="planner-progress">
            {[0, 1, 2].map(i => <span key={i} className={i <= step ? 'on' : ''} />)}
          </div>
        )}
      </div>
      <div className="planner-content">
        {step === 0 && (
          <div>
            <h3>How many days?</h3>
            <div className="planner-pills">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`planner-pill ${prefs.days === n ? 'on' : ''}`}
                  onClick={() => setPrefs({...prefs, days: n})}
                >
                  {n === 1 ? 'Day trip' : `${n} days`}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setStep(1)}>Next →</button>
          </div>
        )}
        {step === 1 && (
          <div>
            <h3>Who's coming?</h3>
            <div className="planner-options">
              {[
                {id: 'solo', label: 'Solo', icon: '🧍'},
                {id: 'couple', label: 'Couple', icon: '💑'},
                {id: 'friends', label: 'Friends', icon: '👯'},
                {id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦'}
              ].map(o => (
                <button
                  key={o.id}
                  className={`planner-option ${prefs.crew === o.id ? 'on' : ''}`}
                  onClick={() => setPrefs({...prefs, crew: o.id})}
                >
                  <span className="icn">{o.icon}</span>
                  {o.label}
                </button>
              ))}
            </div>
            <div className="planner-nav">
              <button className="btn btn-ghost" onClick={() => setStep(0)}>←</button>
              <button className="btn btn-primary" onClick={() => setStep(2)}>Next →</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3>What are you into?</h3>
            <div className="planner-pills">
              {MODES.map(m => (
                <button
                  key={m.id}
                  className={`planner-pill ${prefs.vibes.includes(m.id) ? 'on' : ''}`}
                  onClick={() => setPrefs({
                    ...prefs,
                    vibes: prefs.vibes.includes(m.id)
                      ? prefs.vibes.filter(v => v !== m.id)
                      : [...prefs.vibes, m.id]
                  })}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
            <div className="planner-nav">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>←</button>
              <button className="btn btn-primary" onClick={generate}>Build itinerary →</button>
            </div>
          </div>
        )}
        {step === 99 && itinerary && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16}}>
              <h3 style={{marginBottom: 0}}>Your {CITY.name} itinerary</h3>
              <div style={{display: 'flex', gap: 10}}>
                <button className="btn btn-ghost" onClick={generate}>🔀 Shuffle</button>
                <button className="btn btn-ghost" onClick={share}>{shared ? 'Link copied' : '🔗 Share this plan'}</button>
                <button className="btn btn-ghost" onClick={() => { setStep(0); setItinerary(null); }}>Start over</button>
              </div>
            </div>
            {itinerary.map(day => (
              <div key={day.day} className="planner-day">
                <h4>{day.label}</h4>
                {day.slots.map((slot, i) => (
                  <div key={i} className="planner-slot">
                    <div className="time">{slot.time}</div>
                    <a href={`/cities/${slug}/places/${bizId(slot.biz.name)}/`} onClick={() => track.bizClick(slug, slot.biz.name, "classic")} style={{ color: "inherit", textDecoration: "none" }}><h5>{slot.biz.name}</h5></a>
                    <p>{slot.note || slot.biz.description}</p>
                    <PlaceActions biz={slot.biz} slug={slug} compact />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
