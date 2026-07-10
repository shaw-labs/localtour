// Classic view — trip planner overlay (ported verbatim; chicago index.html ~2451–2615).
import { useState } from "react";
import { useCityModel } from "../../cityModel";
import { track } from "../../beacon";
import { planParam } from "../../planShare";

/* ═══ TRIP PLANNER OVERLAY ═══ */
export function R_TripPlanner({onClose}) {
  const { CITY, directory, MODES, slug } = useCityModel();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({days: 2, crew: 'couple', vibes: []});
  const [itinerary, setItinerary] = useState(null);
  const [shared, setShared] = useState(false);

  // Build a shareable URL for the current plan, copy it (best-effort), and log the
  // share via the beacon. Does not mutate the itinerary or touch generate().
  function share() {
    const shareUrl = window.location.pathname + planParam(prefs, itinerary);
    try { navigator.clipboard.writeText(shareUrl); } catch { /* clipboard blocked — non-fatal */ }
    track.shareCreated(slug, "classic");
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  }

  function pick(arr, n) {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  }

  function generate() {
    const days = [];
    const byVibe = prefs.vibes.length > 0
      ? directory.filter(b => b.modes.some(m => prefs.vibes.includes(m)))
      : directory;
    const dining = byVibe.filter(b => b.category === 'dining' || b.category === 'coffee_bakeries');
    const fun = byVibe.filter(b => ['attractions','entertainment','outdoor_adventure','outdoor','boating_water'].includes(b.category));
    const bars = byVibe.filter(b => ['bars_nightlife','bars'].includes(b.category));
    for (let d = 0; d < prefs.days; d++) {
      const slots = [];
      const used = new Set();
      const addSlot = (time, pool) => {
        const options = pool.filter(a => !used.has(a.name));
        if (options.length) {
          const picked = pick(options, 1)[0];
          used.add(picked.name);
          slots.push({time, biz: picked});
        }
      };
      addSlot('Morning', dining);
      addSlot('Late Morning', fun);
      addSlot('Lunch', dining);
      addSlot('Afternoon', fun);
      addSlot('Dinner', dining);
      if (prefs.crew !== 'family') addSlot('Night', bars);
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
                    <h5>{slot.biz.name}</h5>
                    <p>{slot.biz.description}</p>
                    <div className="actions">
                      {slot.biz.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(slot.biz.address + ' ' + slot.biz.name)}`}
                          target="_blank" rel="noopener noreferrer"
                        >📍 Map</a>
                      )}
                      {slot.biz.phone && <a href={`tel:${slot.biz.phone.replace(/[^+0-9]/g, '')}`}>📞 Call</a>}
                      {slot.biz.website && <a href={slot.biz.website} target="_blank" rel="noopener noreferrer">🔗 Site</a>}
                    </div>
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
