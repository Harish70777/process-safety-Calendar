/**
 * build-site.js
 * Reads index.json and injects an archive card for every published
 * incident into site/index.html, between the marker comment and
 * </div>. Idempotent — re-running replaces the previously injected
 * cards rather than duplicating them.
 *
 * Run: node scripts/build-site.js   (after build-index.js)
 */

const fs = require("fs");
const path = require("path");
const { matter } = require("./frontmatter");

const INDEX_JSON = path.join(__dirname, "..", "index.json");
const INCIDENTS_DIR = path.join(__dirname, "..", "incidents");
const SITE_HTML = path.join(__dirname, "..", "site", "index.html");

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function firstParagraph(body) {
  // Grab the first non-empty paragraph after the "## What Happened" heading,
  // falling back to the very first paragraph in the file if that's absent.
  const afterHeading = body.split(/##\s*What Happened\s*\n/i)[1] || body;
  const para = afterHeading.split(/\n\s*\n/).find(p => p.trim() && !p.trim().startsWith("#"));
  return (para || "").replace(/\s+/g, " ").trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

function cardFor(inc) {
  const d = new Date(inc.date);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const sevClass = inc.severity === 1 ? " sev-1" : "";
  const tags = (inc.psm_elements || []).slice(0, 3)
    .map(t => `<span class="tag">${esc(t)}</span>`).join("");

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

  const cardsHtml = incidents.map(cardFor).join("\n");

  // Build a lightweight data blob for the hero card to pick from at
  // page-load time — includes a short blurb pulled from each incident's
  // own Markdown body, not hardcoded anywhere.
  const heroData = incidents.map(inc => {
    const raw = fs.readFileSync(path.join(INCIDENTS_DIR, inc.file), "utf8");
    const { content } = matter(raw);
    return {
      id: inc.id,
      title: inc.title,
      date: inc.date,
      location: inc.location,
      severity: inc.severity,
      fatalities: inc.fatalities,
      injuries: inc.injuries,
      blurb: truncate(firstParagraph(content), 240),
    };
  });

  let html = fs.readFileSync(SITE_HTML, "utf8");

  // Inject archive cards
  const startMarker = '<!-- Cards injected from index.json at build time by scripts/build-site.js -->';
  const endMarker = '</div>\n  </div>\n</section>';
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
  html = html.slice(0, afterMarker) + "\n" + cardsHtml + "\n    " + html.slice(endIdx);

  // Inject/replace the hero data script
  const dataStart = '<!-- INCIDENT_DATA_START -->';
  const dataEnd = '<!-- INCIDENT_DATA_END -->';
  const dataScript = `${dataStart}\n<script>window.INCIDENTS = ${JSON.stringify(heroData)};</script>\n${dataEnd}`;

  if (html.includes(dataStart) && html.includes(dataEnd)) {
    const s = html.indexOf(dataStart);
    const e = html.indexOf(dataEnd) + dataEnd.length;
    html = html.slice(0, s) + dataScript + html.slice(e);
  } else {
    console.error("Could not find INCIDENT_DATA markers in site/index.html — hero card will not be dynamic.");
    process.exit(1);
  }

  fs.writeFileSync(SITE_HTML, html);

  console.log(`Injected ${incidents.length} archive cards and hero data into site/index.html`);
}

main();
