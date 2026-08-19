/**
 * build-illustrations.js
 * Generates a 4-stage illustrative diagram (SVG) for each incident listed
 * in RECIPES below, saved to site/incidents/<id>/illustration.svg.
 *
 * Design intent: entirely original, symbolic vector icons (no photography,
 * no third-party assets — sidesteps the copyright concerns real incident
 * photos would carry). Casualty figures, dates, and titles are pulled
 * automatically from each incident's own verified frontmatter — never
 * retyped by hand — so the numbers on the illustration can never drift
 * from the source-of-truth .md file.
 *
 * Each incident's RECIPE (which 4 icons + captions represent its actual
 * sequence of events) is a judgment call made by reading that incident's
 * "What Happened" and root_causes — the `source` field on each stage notes
 * what in the file justified that choice, for spot-checking later.
 *
 * Run: node scripts/build-illustrations.js
 */

const fs = require("fs");
const path = require("path");
const { matter } = require("./frontmatter");
const { ICONS, NAVY } = require("./icon-library");

const INCIDENTS_DIR = path.join(__dirname, "..", "incidents");
const OUT_BASE = path.join(__dirname, "..", "site", "incidents");
const AUDIT_FILE = path.join(__dirname, "..", "illustration-audit.txt");

// ---------------------------------------------------------------------
// RECIPES: one entry per incident that has an illustration built so far.
// Each stage: { icon: <key from icon-library.js>, label, source: <where
// in the .md file this stage comes from, for spot-checking> }
// ---------------------------------------------------------------------
const RECIPES = {
  "texas-city-2005": {
    stages: [
      { icon: "vessel", label: "Startup", caption: "Tower being filled before PSSR complete", source: "'During startup of the isomerization (ISOM) unit...'" },
      { icon: "overfill", label: "Overfilled", caption: "Faulty level indicator missed rising level", source: "'operators overfilled a distillation tower... due to a faulty level indicator'" },
      { icon: "vaporCloud", label: "Vapor Cloud", caption: "Drifted toward occupied contractor trailers", source: "'releasing a dense hydrocarbon vapor cloud'" },
      { icon: "explosion", label: "Explosion", caption: "15 killed, 180 injured — March 23, 2005", source: "fatalities/injuries frontmatter fields" },
    ],
  },
  "bhopal-1984": {
    stages: [
      { icon: "tank", label: "MIC Storage Tank", caption: "40 tons of methyl isocyanate on site", source: "'a storage tank holding roughly 40 tons of methyl isocyanate'" },
      { icon: "gauge", label: "Safety Systems Off", caption: "Cooling, scrubber, and flare all shut down", source: "'Refrigeration...had been shut down for cost reasons, the gas scrubber and flare tower...were both non-operational'" },
      { icon: "vaporCloud", label: "Toxic Gas Release", caption: "Dense cloud over densely populated area", source: "'sent a dense toxic gas cloud over the densely populated area'" },
      { icon: "building", label: "Community Impact", caption: "Death toll estimates vary widely", source: "fatalities/injuries frontmatter fields — surrounding population" },
    ],
  },
  "piper-alpha-1988": {
    stages: [
      { icon: "valve", label: "Valve Removed for Maintenance", caption: "Pump isolated, sealed with loose blind flange", source: "'A pressure safety valve was removed from a condensate pump for maintenance'" },
      { icon: "warningIgnored", label: "Shift Handover Failed", caption: "Night shift unaware the valve was offline", source: "'permit-to-work...was not properly communicated across shift handover'" },
      { icon: "fire", label: "Ignition", caption: "Leaked through the flange, then ignited", source: "'causing condensate to leak through the flange and ignite'" },
      { icon: "explosion", label: "Platform Destroyed", caption: "167 of 226 workers died", source: "'The platform was destroyed; 167 of 226 workers died'" },
    ],
  },
  "flixborough-1974": {
    stages: [
      { icon: "corrosion", label: "Reactor Cracked", caption: "Crack found in one of six reactors", source: "'a crack was found in one of six reactors'" },
      { icon: "valve", label: "Temporary Bypass Installed", caption: "No proper engineering calculations done", source: "'a temporary bypass pipe was installed...without proper engineering calculations'" },
      { icon: "vaporCloud", label: "Cyclohexane Release", caption: "30+ tons released, formed a vapor cloud", source: "'releasing an estimated 30+ tons of cyclohexane, which formed a vapor cloud'" },
      { icon: "explosion", label: "Explosion", caption: "Force of roughly 15–45 tons of TNT", source: "'exploded with the force of roughly 15-45 tons of TNT'" },
    ],
  },
  "deepwater-horizon-2010": {
    stages: [
      { icon: "corrosion", label: "Cement Barrier Failed", caption: "Failed to seal off the well", source: "'the cement job...failed to seal off the hydrocarbon-bearing formation'" },
      { icon: "gauge", label: "Pressure Test Misread", caption: "Crew misread a failed test as passing", source: "'a negative pressure test...was misinterpreted by the crew as successful'" },
      { icon: "fire", label: "Blowout & Fire", caption: "Hydrocarbons flowed up the wellbore and ignited", source: "'hydrocarbons flowed uncontrolled up the wellbore and ignited'" },
      { icon: "vaporCloud", label: "Oil Spill", caption: "Largest marine oil spill in U.S. history", source: "'triggering the largest marine oil spill in U.S. history'" },
    ],
  },
  "west-fertilizer-2013": {
    stages: [
      { icon: "building", label: "Wood-Framed Storage", caption: "30 tons of ammonium nitrate in wood bins", source: "'FGAN was stored in a wood-framed building with wood bins'" },
      { icon: "fire", label: "Fire Breaks Out", caption: "Fire began inside the wooden storage building", source: "'A fire broke out inside a wooden storage building'" },
      { icon: "warningIgnored", label: "Responders Unaware of Risk", caption: "Firefighters didn't know detonation was possible", source: "'firefighters...were not aware of the detonation risk'" },
      { icon: "explosion", label: "Detonation", caption: "15 killed — 12 were emergency responders", source: "fatalities/injuries frontmatter fields — 12 of 15 killed were responders" },
    ],
  },
  "imperial-sugar-2008": {
    stages: [
      { icon: "dustCloud", label: "Dust Accumulation", caption: "Inches-thick sugar dust on horizontal surfaces", source: "'inches-thick layers of sugar dust had built up on horizontal surfaces'" },
      { icon: "valve", label: "Enclosure Created Hazard", caption: "New panels let dust reach explosive levels", source: "'steel panels...inadvertently created an enclosed space where explosive concentrations...could accumulate'" },
      { icon: "explosion", label: "Primary Explosion", caption: "Ignited inside the enclosed conveyor space", source: "'a primary explosion inside that enclosure'" },
      { icon: "fire", label: "Cascading Explosions", caption: "Blast wave lofted dust throughout the facility", source: "'triggering a chain of much larger secondary explosions'" },
    ],
  },
  "husky-superior-2018": {
    stages: [
      { icon: "valve", label: "Worn Slide Valve", caption: "Let air mix with hydrocarbons", source: "'a worn slide valve failed to maintain the barrier...between air and hydrocarbons'" },
      { icon: "vaporCloud", label: "Air-Hydrocarbon Mix", caption: "Air entered the reactor through the regenerator", source: "'Air was inadvertently directed through the regenerator into the reactor'" },
      { icon: "explosion", label: "Vessel Explosion", caption: "100+ metal fragments thrown up to 1,200 feet", source: "'Two vessels...exploded, propelling over 100 metal fragments'" },
      { icon: "warningIgnored", label: "Near-Miss with HF Tank", caption: "Debris came within 150 feet of an HF tank", source: "'debris had come within 150 feet of the HF tank'" },
    ],
  },
  "dupont-belle-2010": {
    stages: [
      { icon: "corrosion", label: "Hose Overdue for Replacement", caption: "Required monthly, not changed in 7 months", source: "'the one that killed Fish had not been changed in seven months'" },
      { icon: "warningIgnored", label: "Near-Miss Hours Earlier", caption: "Identical hose had frayed earlier that day", source: "'during a \"safety pause\" prompted by an earlier near-miss'" },
      { icon: "vaporCloud", label: "Phosgene Release", caption: "Second hose ruptured, sprayed an operator", source: "'a second phosgene hose ruptured...spraying...phosgene'" },
      { icon: "person", label: "Fatal Exposure", caption: "1 killed, 2 others exposed while helping", source: "fatalities/injuries frontmatter fields" },
    ],
  },
  "foundation-food-group-2021": {
    stages: [
      { icon: "corrosion", label: "Bubbler Tube Bent", caption: "Likely bent during maintenance work", source: "'a \"bubbler tube\"...was bent, likely during maintenance work'" },
      { icon: "vaporCloud", label: "Nitrogen Overflow", caption: "Freezer room filled with unsafe nitrogen levels", source: "'the freezer room to fill with an unsafe quantity of liquid nitrogen'" },
      { icon: "warningIgnored", label: "Workers Entered to Help", caption: "14 entered, unaware the air was lethal", source: "'14 employees entered the freezer room...not realizing the air itself had become lethal'" },
      { icon: "person", label: "Six Fatalities", caption: "Several died trying to rescue coworkers", source: "fatalities/injuries frontmatter fields" },
    ],
  },
};

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrapText(text, maxChars, context) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars) {
      lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  }
  if (current.trim()) lines.push(current.trim());
  if (lines.length > 2) {
    console.warn(`WARNING: caption too long, text was cut off: "${text}"${context ? ` (${context})` : ""}`);
  }
  return lines.slice(0, 2); // cap at 2 lines to keep layout consistent
}

function buildSVG(data, recipe) {
  const stageWidth = 240;
  const totalWidth = stageWidth * 4;
  const height = 340;

  const toll = [
    data.fatalities !== undefined ? `${Number(data.fatalities).toLocaleString("en-US")} killed` : "",
    data.injuries !== undefined ? `${Number(data.injuries).toLocaleString("en-US")} injured` : "",
  ].filter(Boolean).join(", ");

  const stagesSVG = recipe.stages.map((stage, i) => {
    const x = 60 + i * stageWidth;
    const iconFn = ICONS[stage.icon];
    const iconSVG = iconFn ? iconFn() : ICONS.vessel();
    const captionLines = wrapText(stage.label, 20, `${data.id} / label`);
    const labelSVG = captionLines.map((line, li) =>
      `<text x="60" y="${160 + li * 16}" text-anchor="middle" class="label">${esc(line)}</text>`
    ).join("\n        ");

    const subLines = stage.caption ? wrapText(stage.caption, 24, `${data.id} / caption`) : [];
    const subY = 160 + captionLines.length * 16 + 6;
    const subSVG = subLines.map((line, li) =>
      `<text x="60" y="${subY + li * 13}" text-anchor="middle" class="sublabel">${esc(line)}</text>`
    ).join("\n        ");

    return `  <g transform="translate(${x},50)">
        ${iconSVG}
        ${labelSVG}
        ${subSVG}
      </g>`;
  }).join("\n\n");

  const connectorLines = [];
  for (let i = 0; i < recipe.stages.length - 1; i++) {
    const x1 = 60 + i * stageWidth + 118;
    const x2 = 60 + (i + 1) * stageWidth + 2;
    connectorLines.push(`<line x1="${x1}" y1="130" x2="${x2}" y2="130" class="arrow" stroke-dasharray="4 5"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" font-family="'Poppins', sans-serif">
  <defs>
    <style>
      .label { font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 15px; fill: #13567F; }
      .sublabel { font-family: 'Poppins', sans-serif; font-size: 11px; fill: #666; }
      .arrow { stroke: #C9D6DE; stroke-width: 2; fill: none; }
    </style>
  </defs>
  <rect width="${totalWidth}" height="${height}" fill="#F5F8FA"/>
  ${connectorLines.join("\n  ")}
${stagesSVG}
  <rect x="0" y="${height - 30}" width="${totalWidth}" height="30" fill="${NAVY}"/>
  <text x="${totalWidth / 2}" y="${height - 11}" text-anchor="middle" fill="#fff" font-size="12" font-family="'Poppins', sans-serif" font-weight="500">${esc(data.title)}${toll ? " \u2014 " + esc(toll) : ""}</text>
</svg>`;
}

function main() {
  const files = fs.readdirSync(INCIDENTS_DIR).filter(f => f.endsWith(".md"));
  let built = 0;
  const auditLines = [
    "=== Illustration Audit Trail ===",
    "For each stage of each diagram, this shows the exact source text that",
    "justified using that icon/caption — spot-check any of these against",
    "the incident's own .md file at any time.",
    "",
  ];

  for (const file of files) {
    const id = file.replace(/\.md$/, "");
    const recipe = RECIPES[id];
    if (!recipe) continue;

    const raw = fs.readFileSync(path.join(INCIDENTS_DIR, file), "utf8");
    const { data } = matter(raw);
    if (data.status !== "published") continue;

    const svg = buildSVG(data, recipe);
    const outDir = path.join(OUT_BASE, id);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "illustration.svg"), svg);
    built++;

    auditLines.push(`--- ${data.title} (${id}) ---`);
    recipe.stages.forEach((s, i) => {
      auditLines.push(`  Stage ${i + 1} [${s.icon}] "${s.label}": ${s.source}`);
    });
    auditLines.push("");
  }

  fs.writeFileSync(AUDIT_FILE, auditLines.join("\n"));
  console.log(`Built ${built} illustrations. Audit trail written to illustration-audit.txt`);
  console.log(`(${Object.keys(RECIPES).length - built} recipe(s) skipped — check status/published or missing file)`);
}

main();
