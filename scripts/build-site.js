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

const INDEX_JSON = path.join(__dirname, "..", "index.json");
const SITE_HTML = path.join(__dirname, "..", "site", "index.html");

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cardFor(inc) {
  const d = new Date(inc.date);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const sevClass = inc.severity === 1 ? " sev-1" : "";
  const tags = (inc.psm_elements || []).slice(0, 3)
    .map(t => `<span class="tag">${esc(t)}</span>`).join("");

  return `      <div class="card${sevClass}">
        <div class="tab">${mm}.${dd} &middot; ${d.getUTCFullYear()}</div>
        <h4>${esc(inc.title)}</h4>
        <div class="loc">${esc(inc.location)}</div>
        <div class="tags">${tags}</div>
      </div>`;
}

function main() {
  if (!fs.existsSync(INDEX_JSON)) {
    console.error("index.json not found — run build-index.js first.");
    process.exit(1);
  }

  const incidents = JSON.parse(fs.readFileSync(INDEX_JSON, "utf8"))
    .filter(i => i.status === "published");

  const cardsHtml = incidents.map(cardFor).join("\n");

  let html = fs.readFileSync(SITE_HTML, "utf8");

  const startMarker = '<!-- Cards injected from index.json at build time by scripts/build-site.js -->';
  const endMarker = '</div>\n  </div>\n</section>';

  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    console.error("Could not find injection marker in site/index.html");
    process.exit(1);
  }
  const afterMarker = startIdx + startMarker.length;
  const endIdx = html.indexOf(endMarker, afterMarker);
  if (endIdx === -1) {
    console.error("Could not find end marker after start marker.");
    process.exit(1);
  }

  html = html.slice(0, afterMarker) + "\n" + cardsHtml + "\n    " + html.slice(endIdx);
  fs.writeFileSync(SITE_HTML, html);

  console.log(`Injected ${incidents.length} archive cards into site/index.html`);
}

main();
