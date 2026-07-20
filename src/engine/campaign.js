// WS8 — campaign identity with sunset-by-design. The America 250 branding is
// data (data/campaign.json), and the check runs at RENDER time against the
// viewer's clock: past window_end the layer re-skins to its evergreen fallback
// ("Heritage Trails") with no rebuild and no truth debt in 2027.
//
// Clock override for testing the sunset (per the brief): append
// ?campaign_now=2027-01-15 to any URL and the layer renders as that date.
import CAMPAIGN from "../../data/campaign.json";

function nowISO() {
  try {
    const o = new URLSearchParams(window.location.search).get("campaign_now");
    if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
  } catch {
    /* no window (SSR/tests) */
  }
  return new Date().toISOString().slice(0, 10);
}

/** The active campaign skin: {name, tagline, active} resolved for today. */
export function activeCampaign() {
  const today = nowISO();
  const inWindow = today >= CAMPAIGN.window_start && today <= CAMPAIGN.window_end;
  return inWindow
    ? { name: CAMPAIGN.name, tagline: CAMPAIGN.tagline, active: true }
    : { name: CAMPAIGN.fallback_name, tagline: CAMPAIGN.fallback_tagline, active: false };
}
