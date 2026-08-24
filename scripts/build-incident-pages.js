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

const SITE_URL = "https://calendar.rskless.com"; // Update if/when a custom domain is set up

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

function pageTemplate(data, bodyHtml, hasIllustration) {
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
<title>${esc(data.title)}: PSM Events Calendar</title>
<link rel="icon" type="image/svg+xml" href="../../rskless-favicon.svg">
<meta name="description" content="${esc(data.title)}, ${d.getUTCFullYear()}: what happened, root causes, and lessons learned.">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(data.title)} (${d.getUTCFullYear()})">
<meta property="og:description" content="${esc(data.location)}${toll ? " — " + esc(toll) : ""}. Root causes, and lessons learned, from RskLess.">
<meta property="og:url" content="${SITE_URL}/incidents/${esc(data.id || "")}/">
<meta property="og:site_name" content="PSM Events Calendar">
<meta property="og:image" content="${SITE_URL}/rskless-icon.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(data.title)} (${d.getUTCFullYear()})">
<meta name="twitter:description" content="${esc(data.location)}${toll ? " — " + esc(toll) : ""}. Root causes, and lessons learned, from RskLess.">
<style>
  :root{
    --orange:#E8622C; --orange-dark:#C94E1E; --navy:#13567F; --navy-dark:#0D3E5C;
    --paper:#FFFFFF; --paper-alt:#F5F8FA; --ink:#2B2B2B; --red:#C81E1E; --line:#E3E7EC;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial, sans-serif;line-height:1.65;}
  .wrap{max-width:760px;margin:0 auto;padding:0 24px;}
  header{background:var(--paper);border-bottom:1px solid var(--line);padding:16px 0;}
  .brand{font-family:Arial, sans-serif;font-weight:700;font-size:19px;color:var(--orange);display:flex;align-items:center;gap:10px;text-decoration:none;}
  main{padding:40px 0 64px;}
  .eyebrow{font-family:Arial, sans-serif;font-weight:600;font-size:12px;letter-spacing:0.05em;color:var(--orange);margin-bottom:10px;}
  h1{font-family:Arial, sans-serif;font-weight:800;font-size:32px;line-height:1.25;margin:0 0 14px;color:var(--navy);}
  .meta-row{font-family:Arial, sans-serif;font-size:13px;color:#555;margin-bottom:8px;}
  .tier-tag{display:inline-block;font-family:Arial, sans-serif;font-weight:600;font-size:11px;letter-spacing:0.03em;text-transform:uppercase;padding:3px 10px;border-radius:4px;border:1px solid var(--red);color:var(--red);margin-bottom:16px;}
  .tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:28px;}
  .tag{font-family:Arial, sans-serif;font-size:11px;padding:4px 10px;border-radius:10px;background:var(--paper-alt);color:#555;}
  article h2{font-family:Arial, sans-serif;font-weight:700;font-size:20px;margin:32px 0 12px;color:var(--navy);}
  article p{font-size:15.5px;color:#292929;margin:0 0 14px;}
  article ul, article ol{padding-left:22px;margin:0 0 14px;}
  article li{font-size:15.5px;color:#292929;margin-bottom:8px;}
  article strong{color:var(--navy);}
  .sources{margin-top:36px;padding-top:20px;border-top:1px solid var(--line);}
  .sources h3{font-family:Arial, sans-serif;font-weight:600;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;color:var(--orange);margin:0 0 10px;}
  .sources ul{padding-left:20px;margin:0;}
  .sources li{font-size:13.5px;color:#555;margin-bottom:4px;}
  .back-link{display:inline-block;margin-top:36px;font-family:Arial, sans-serif;font-weight:600;font-size:13px;color:var(--orange);text-decoration:none;}
  .back-link:hover{color:var(--orange-dark);}
</style>
</head>
<body>
<header>
  <div class="wrap"><a class="brand" href="../../"><img src="../../rskless-badge.svg" alt="RskLess" style="height:40px;width:auto;"> PSM Events Calendar</a></div>
</header>
<main>
  <div class="wrap">
    <div class="eyebrow">Anniversary: ${dateStr}</div>
    <h1>${esc(data.title)}</h1>
    <div class="meta-row">${esc(data.location)}${toll ? " &middot; " + esc(toll) : ""}</div>
    <div class="tags">${tags}</div>
    ${hasIllustration ? `<div class="illustration"><img src="illustration.svg" alt="Illustrated summary of ${esc(data.title)}" style="width:100%;height:auto;border-radius:8px;margin:16px 0;"></div>` : ""}
    ${data.csb_video_id ? `<div class="csb-video" style="margin:16px 0;"><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;"><iframe src="https://www.youtube.com/embed/${esc(data.csb_video_id)}" title="CSB Safety Video: ${esc(data.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div><p style="font-size:12px;color:#777;margin-top:6px;">Official CSB Safety Video, via the U.S. Chemical Safety Board's YouTube channel.</p></div>` : ""}
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
    const pageDir = path.join(OUT_DIR, id);
    const hasIllustration = fs.existsSync(path.join(pageDir, "illustration.svg"));
    const bodyHtml = mdToHtml(content);
    const html = pageTemplate({ ...data, id }, bodyHtml, hasIllustration);

    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(path.join(pageDir, "index.html"), html);
    written++;
  }

  console.log(`Wrote ${written} individual incident pages to site/incidents/`);
}

main();
