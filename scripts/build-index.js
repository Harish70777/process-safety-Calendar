/**
 * build-index.js
 * Scans /incidents/*.md, validates required fields, and produces:
 *   - index.json          (flat list of every incident, for the site + sanity checks)
 *   - index-report.txt    (human-readable completeness/quality report)
 *
 * Run: node scripts/build-index.js
 */

const fs = require("fs");
const path = require("path");
const { matter } = require("./frontmatter");

const INCIDENTS_DIR = path.join(__dirname, "..", "incidents");
const OUT_JSON = path.join(__dirname, "..", "index.json");
const OUT_REPORT = path.join(__dirname, "..", "index-report.txt");

const REQUIRED_FIELDS = [
  "title", "date", "location", "industry", "severity",
  "root_causes", "psm_elements", "status",
];

function loadIncidents() {
  const files = fs.readdirSync(INCIDENTS_DIR).filter(f => f.endsWith(".md"));
  const incidents = [];
  const problems = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(INCIDENTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const missing = REQUIRED_FIELDS.filter(f => data[f] === undefined || data[f] === null || data[f] === "");
    if (missing.length) {
      problems.push(`⚠️  ${file}: missing required field(s): ${missing.join(", ")}`);
    }
    if (!data.date || isNaN(Date.parse(data.date))) {
      problems.push(`⚠️  ${file}: invalid or missing date`);
    }
    if (content.trim().length < 50) {
      problems.push(`⚠️  ${file}: body content looks too short — may be a stub`);
    }

    incidents.push({
      id: file.replace(/\.md$/, ""),
      file,
      ...data,
      hasBody: content.trim().length > 0,
    });
  }

  return { incidents, problems };
}

function checkDuplicateDates(incidents) {
  const byDate = {};
  for (const inc of incidents) {
    const d = new Date(inc.date);
    const key = `${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
    byDate[key] = byDate[key] || [];
    byDate[key].push(inc.title);
  }
  return Object.entries(byDate).filter(([, titles]) => titles.length > 1);
}

function tagDistribution(incidents, field) {
  const counts = {};
  for (const inc of incidents) {
    const tags = Array.isArray(inc[field]) ? inc[field] : [];
    for (const t of tags) counts[t] = (counts[t] || 0) + 1;
  }
  return counts;
}

function main() {
  const { incidents, problems } = loadIncidents();

  incidents.sort((a, b) => new Date(a.date) - new Date(b.date));

  fs.writeFileSync(OUT_JSON, JSON.stringify(incidents, null, 2));

  const published = incidents.filter(i => i.status === "published").length;
  const draft = incidents.filter(i => i.status !== "published").length;
  const duplicateDates = checkDuplicateDates(incidents);
  const psmCounts = tagDistribution(incidents, "psm_elements");
  const rootCauseCounts = tagDistribution(incidents, "root_causes");

  const report = [
    "=== Process Safety Calendar — Index Report ===",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Total incidents:      ${incidents.length}`,
    `  Published:           ${published}`,
    `  Draft/needs review:  ${draft}`,
    "",
    "--- Data quality issues ---",
    problems.length ? problems.join("\n") : "None found — all incidents have required fields. ✅",
    "",
    "--- Duplicate calendar dates (not an error, just FYI) ---",
    duplicateDates.length
      ? duplicateDates.map(([d, titles]) => `${d}: ${titles.join(" | ")}`).join("\n")
      : "No duplicate dates.",
    "",
    "--- Coverage by PSM element (are we balanced, or overweight on one theme?) ---",
    Object.entries(psmCounts).sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `  ${k}: ${v}`).join("\n") || "  (no data)",
    "",
    "--- Coverage by root cause tag ---",
    Object.entries(rootCauseCounts).sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `  ${k}: ${v}`).join("\n") || "  (no data)",
  ].join("\n");

  fs.writeFileSync(OUT_REPORT, report);

  console.log(report);
  console.log(`\n✅ Wrote ${incidents.length} incidents to index.json`);
  if (problems.length) {
    console.log(`⚠️  ${problems.length} data quality issue(s) — see index-report.txt`);
  }
}

main();
