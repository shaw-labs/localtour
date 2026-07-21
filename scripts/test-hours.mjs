// Fixed-clock tests for the free-text hours parser. Wed = day 3.
import { openStatus } from "../src/engine/hours.js";

const WED_EVE = new Date("2026-07-22T19:30:00"); // Wednesday 7:30pm
const WED_AM = new Date("2026-07-22T09:00:00");   // Wednesday 9:00am
const SUN_EVE = new Date("2026-07-26T19:30:00");  // Sunday 7:30pm

let fail = 0;
const t = (hours, now, want, msg) => {
  const got = openStatus(hours, now).status;
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} [${want}] ${msg}  (${JSON.stringify(hours)} → ${got})`);
};

t("Tue-Sat 5-10pm", WED_EVE, "open", "timed range, inside day + time");
t("Tue-Sat 5-10pm", WED_AM, "closed", "timed range, right day wrong hour");
t("Daily 9am-2am", WED_EVE, "open", "daily crossing-midnight, evening");
t("Daily 9am-2am", WED_AM, "open", "daily crossing-midnight, morning");
t("Mon-Fri 7am-3pm", WED_EVE, "closed", "weekday lunch spot, closed by evening");
t("Mon-Fri 7am-3pm", WED_AM, "open", "weekday lunch spot, open at 9am");
t("Sun-Thu 4:30-10pm, Fri-Sat 4:30-11pm", WED_EVE, "open", "multi-segment, Wed in first");
t("Wed-Sun evenings", WED_EVE, "open", "day-only + evenings, 7:30pm");
t("Wed-Sun evenings", WED_AM, "closed", "day-only + evenings, 9am → opens later");
t("Tue-Sat evenings", SUN_EVE, "closed", "outside day range on Sunday");
t("24/7", WED_AM, "open", "always open");
t("Irregular — call or check social media", WED_EVE, "unknown", "irregular → unknown");
t("Wed-Sat, seatings at 5pm & 8pm", WED_EVE, "unknown", "day matches but no parseable range → unknown");
t("", WED_EVE, "unknown", "empty");
t(null, WED_EVE, "unknown", "null");
t("Mon-Sat dinner, Mon-Fri lunch", WED_AM, "unknown", "mixed lunch+dinner, no times — honest unknown");

console.log(fail ? `\n${fail} FAILED` : `\nAll 16 hours tests passed.`);
process.exit(fail ? 1 : 0);
