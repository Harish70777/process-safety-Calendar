/**
 * build-incident-pages.js
 * Reads incidents/*.md directly and generates one static page per
 * published incident at site/incidents/<id>/index.html — this is
 * what the "Full brief and lessons learned" link in calendar.ics
 * and the archive cards actually point to.
 *
 * Run: node scripts/build-incident-pages.js
 */

const fs = require("fs");
const path = require("path");
const { matter } = require("./frontmatter");
const { mdToHtml } = require("./markdown-lite");

const INCIDENTS_DIR = path.join(__dirname, "..", "incidents");
const OUT_DIR = path.join(__dirname, "..", "site", "incidents");

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function humanize(slug) {
  return String(slug || "")
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function pageTemplate(data, bodyHtml) {
  const d = new Date(data.date);
  const dateStr = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  const toll = [
    data.fatalities !== undefined ? `${data.fatalities} fatalities` : "",
    data.injuries !== undefined ? `${data.injuries} injuries` : "",
  ].filter(Boolean).join(", ");
  const tags = (data.psm_elements || []).map(t => `<span class="tag">${esc(humanize(t))}</span>`).join("");
  const sources = (data.sources || []).map(s => `<li>${esc(s)}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(data.title)} — Process Safety Calendar</title>
<meta name="description" content="${esc(data.title)}, ${d.getUTCFullYear()}: what happened, root causes, and lessons learned.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --paper:#EFF3F5; --ink:#101820; --blueprint:#0B4F6C;
    --amber:#F2A900; --red:#C81E1E; --line:#C7D0D6; --paper-card:#FFFFFF;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:'IBM Plex Sans', sans-serif;line-height:1.65;}
  .wrap{max-width:760px;margin:0 auto;padding:0 24px;}
  header{border-bottom:1px solid var(--line);padding:20px 0;}
  .brand{font-family:'IBM Plex Mono', monospace;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);}
  .brand .dot{width:8px;height:8px;background:var(--amber);border:1px solid var(--ink);}
  main{padding:40px 0 64px;}
  .eyebrow{font-family:'IBM Plex Mono', monospace;font-size:12px;letter-spacing:0.05em;color:var(--blueprint);margin-bottom:10px;}
  h1{font-family:'Space Grotesk', sans-serif;font-weight:700;font-size:34px;line-height:1.2;margin:0 0 14px;}
  .meta-row{font-family:'IBM Plex Mono', monospace;font-size:13px;color:#555;margin-bottom:8px;}
  .tier-tag{display:inline-block;font-family:'IBM Plex Mono', monospace;font-size:11px;letter-spacing:0.05em;text-transform:uppercase;padding:3px 8px;border:1px solid var(--red);color:var(--red);margin-bottom:16px;}
  .tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:28px;}
  .tag{font-family:'IBM Plex Mono', monospace;font-size:11px;padding:3px 8px;border:1px solid var(--line);color:#555;}
  article h2{font-family:'Space Grotesk', sans-serif;font-size:20px;margin:32px 0 12px;}
  article p{font-size:15.5px;color:#292929;margin:0 0 14px;}
  article ul, article ol{padding-left:22px;margin:0 0 14px;}
  article li{font-size:15.5px;color:#292929;margin-bottom:8px;}
  article strong{color:var(--ink);}
  .sources{margin-top:36px;padding-top:20px;border-top:1px solid var(--line);}
  .sources h3{font-family:'IBM Plex Mono', monospace;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;color:var(--blueprint);margin:0 0 10px;}
  .sources ul{padding-left:20px;margin:0;}
  .sources li{font-size:13.5px;color:#555;margin-bottom:4px;}
  .back-link{display:inline-block;margin-top:36px;font-family:'IBM Plex Mono', monospace;font-size:13px;color:var(--blueprint);text-decoration:none;}
  .back-link:hover{text-decoration:underline;}
</style>
</head>
<body>
<header>
  <div class="wrap"><a class="brand" href="../../"><span class="dot"></span> Process Safety Calendar</a></div>
</header>
<main>
  <div class="wrap">
    <div class="eyebrow">Anniversary: ${dateStr}</div>
    <h1>${esc(data.title)}</h1>
    <div class="meta-row">${esc(data.location)}${toll ? " &middot; " + esc(toll) : ""}</div>
    <div class="tags">${tags}</div>
    <article>
${bodyHtml}
    </article>
    ${sources ? `<div class="sources"><h3>Sources</h3><ul>${sources}</ul></div>` : ""}
    <a class="back-link" href="../../#archive">&larr; Back to the full archive</a>
  </div>
</main>
</body>
</html>
`;
}

function main() {
  const files = fs.readdirSync(INCIDENTS_DIR).filter(f => f.endsWith(".md"));
  let written = 0;

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const file of files) {
    const raw = fs.readFileSync(path.join(INCIDENTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    if (data.status !== "published") continue;

    const id = file.replace(/\.md$/, "");
    const bodyHtml = mdToHtml(content);
    const html = pageTemplate(data, bodyHtml);

    const pageDir = path.join(OUT_DIR, id);
    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(path.join(pageDir, "index.html"), html);
    written++;
  }

  console.log(`Wrote ${written} individual incident pages to site/incidents/`);
}

main();
