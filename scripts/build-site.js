/**
 * build-site.js
 * 1. Writes site/incidents-data.js — a shared `window.INCIDENTS` data
 *    array (used by both the homepage hero and the archive page).
 * 2. Injects a small "recent additions" teaser (6 cards) into
 *    site/index.html, linking through to the full archive page.
 *
 * The full, filterable archive lives at site/archive.html, which is a
 * static file that reads incidents-data.js at runtime — it is not
 * rebuilt/injected here, just kept in sync via the shared data file.
 *
 * Run: node scripts/build-site.js   (after build-index.js)
 */

const fs = require("fs");
const path = require("path");
const { matter } = require("./frontmatter");

const INDEX_JSON = path.join(__dirname, "..", "index.json");
const INCIDENTS_DIR = path.join(__dirname, "..", "incidents");
const SITE_DIR = path.join(__dirname, "..", "site");
const SITE_HTML = path.join(SITE_DIR, "index.html");
const DATA_JS = path.join(SITE_DIR, "incidents-data.js");

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function firstParagraph(body) {
  const afterHeading = body.split(/##\s*What Happened\s*\n/i)[1] || body;
  const para = afterHeading.split(/\n\s*\n/).find(p => p.trim() && !p.trim().startsWith("#"));
  return (para || "").replace(/\s+/g, " ").trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

function humanize(slug) {
  return String(slug || "")
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function cardFor(inc) {
  const d = new Date(inc.date);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const sevClass = inc.severity === 1 ? " sev-1" : "";
  const tags = (inc.psm_elements || []).slice(0, 3)
    .map(t => `<span class="tag">${esc(humanize(t))}</span>`).join("");

  return `      <a class="card${sevClass}" href="incidents/${esc(inc.id)}/">
        <div class="tab">${mm}.${dd} &middot; ${d.getUTCFullYear()}</div>
        <h4>${esc(inc.title)}</h4>
        <div class="loc">${esc(inc.location)}</div>
        <div class="tags">${tags}</div>
      </a>`;
}

function main() {
  if (!fs.existsSync(INDEX_JSON)) {
    console.error("index.json not found — run build-index.js first.");
    process.exit(1);
  }

  const incidents = JSON.parse(fs.readFileSync(INDEX_JSON, "utf8"))
    .filter(i => i.status === "published");

  // Full data blob shared by index.html (hero) and archive.html (filters/list/calendar).
  const fullData = incidents.map(inc => {
    const raw = fs.readFileSync(path.join(INCIDENTS_DIR, inc.file), "utf8");
    const { content } = matter(raw);
    return {
      id: inc.id,
      title: inc.title,
      date: inc.date,
      location: inc.location,
      industry: inc.industry || [],
      severity: inc.severity,
      fatalities: inc.fatalities,
      injuries: inc.injuries,
      psm_elements: inc.psm_elements || [],
      root_causes: inc.root_causes || [],
      blurb: truncate(firstParagraph(content), 240),
    };
  });

  fs.writeFileSync(DATA_JS, `window.INCIDENTS = ${JSON.stringify(fullData)};\n`);

  // Homepage teaser: 6 most recent incidents by date.
  const teaser = [...incidents]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
  const cardsHtml = teaser.map(cardFor).join("\n");

  let html = fs.readFileSync(SITE_HTML, "utf8");

  const startMarker = '<!-- Cards injected from index.json at build time by scripts/build-site.js -->';
  const endMarker = '\n    </div>'; // closes the .grid div immediately after the cards
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    console.error("Could not find archive-cards injection marker in site/index.html");
    process.exit(1);
  }
  const afterMarker = startIdx + startMarker.length;
  const endIdx = html.indexOf(endMarker, afterMarker);
  if (endIdx === -1) {
    console.error("Could not find archive-cards end marker after start marker.");
    process.exit(1);
  }
  html = html.slice(0, afterMarker) + "\n" + cardsHtml + endMarker + html.slice(endIdx + endMarker.length);

  const dataStart = '<!-- INCIDENT_DATA_START -->';
  const dataEnd = '<!-- INCIDENT_DATA_END -->';
  const scriptTag = `${dataStart}\n<script src="incidents-data.js"></script>\n${dataEnd}`;
  if (html.includes(dataStart) && html.includes(dataEnd)) {
    const s = html.indexOf(dataStart);
    const e = html.indexOf(dataEnd) + dataEnd.length;
    html = html.slice(0, s) + scriptTag + html.slice(e);
  } else {
    console.error("Could not find INCIDENT_DATA markers in site/index.html.");
    process.exit(1);
  }

  fs.writeFileSync(SITE_HTML, html);

  console.log(`Wrote incidents-data.js (${fullData.length} incidents), injected ${teaser.length} teaser cards into site/index.html`);
}

main();
