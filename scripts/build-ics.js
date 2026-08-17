/**
 * build-ics.js
 * Reads index.json (produced by build-index.js) and generates a single
 * subscribable calendar.ics file — one yearly-recurring VEVENT per
 * published incident.
 *
 * Run: node scripts/build-ics.js   (after build-index.js)
 */

const fs = require("fs");
const path = require("path");

const INDEX_JSON = path.join(__dirname, "..", "index.json");
const OUT_ICS = path.join(__dirname, "..", "site", "calendar.ics");
const SITE_URL = "https://harish70777.github.io/process-safety-Calendar";

function escapeICS(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// iCalendar lines must be folded at 75 octets — long DESCRIPTION fields
// need continuation lines starting with a space, or some calendar apps
// will truncate or reject the event.
function foldLine(line) {
  const max = 74;
  if (line.length <= max) return line;
  let result = "";
  let rest = line;
  let first = true;
  while (rest.length > 0) {
    const chunkSize = first ? max : max - 1;
    result += (first ? "" : "\r\n ") + rest.slice(0, chunkSize);
    rest = rest.slice(chunkSize);
    first = false;
  }
  return result;
}

function buildDescription(inc) {
  const fatalities = inc.fatalities !== undefined ? `${inc.fatalities} fatalities` : "";
  const injuries = inc.injuries !== undefined ? `${inc.injuries} injuries` : "";
  const toll = [fatalities, injuries].filter(Boolean).join(", ");
  const lessonsLink = `${SITE_URL}/incidents/${inc.id}`;

  return [
    toll ? `${toll}.` : "",
    `Root causes: ${(inc.root_causes || []).join(", ")}.`,
    `Full brief and lessons learned: ${lessonsLink}`,
  ].filter(Boolean).join("\n\n"); // real newlines — escapeICS() converts these to the \n escape ICS expects
}

function buildEvent(inc) {
  const dt = new Date(inc.date);
  const dtStr = dt.toISOString().slice(0, 10).replace(/-/g, "");
  const uid = `${inc.id}@processsafetycalendar.com`;

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${dtStr}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    "RRULE:FREQ=YEARLY",
    foldLine(`SUMMARY:⚠️ Anniversary: ${escapeICS(inc.title)} (${dt.getFullYear()})`),
    foldLine(`DESCRIPTION:${escapeICS(buildDescription(inc))}`),
    foldLine(`LOCATION:${escapeICS(inc.location || "")}`),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT0S",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
  ];

  return lines.join("\r\n");
}

function main() {
  if (!fs.existsSync(INDEX_JSON)) {
    console.error("❌ index.json not found — run build-index.js first.");
    process.exit(1);
  }

  const incidents = JSON.parse(fs.readFileSync(INDEX_JSON, "utf8"));
  const published = incidents.filter(i => i.status === "published");

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Process Safety Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Process Safety Calendar",
    "X-WR-CALDESC:Historical process safety incidents, on their anniversary date, with lessons learned.",
    ...published.map(buildEvent),
    "END:VCALENDAR",
  ].join("\r\n");

  fs.mkdirSync(path.dirname(OUT_ICS), { recursive: true });
  fs.writeFileSync(OUT_ICS, calendar);

  console.log(`✅ Wrote ${published.length} events to ${OUT_ICS}`);
  if (published.length < incidents.length) {
    console.log(`ℹ️  ${incidents.length - published.length} incident(s) skipped (status != "published")`);
  }
}

main();
