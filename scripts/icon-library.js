/**
 * icon-library.js
 * A set of reusable, generic SVG icon shapes for incident illustrations.
 * These are deliberately symbolic (a tower, a cloud, a flame) rather than
 * literal depictions of any real facility — no photography, no third-party
 * assets, entirely original vector shapes. Colors match the RskLess brand.
 *
 * Each function returns an SVG snippet centered in a 120x120 box, meant to
 * be dropped into a <g transform="translate(x,y)"> wrapper by the caller.
 */

const NAVY = "#13567F";
const ORANGE = "#E8622C";
const NAVY_LIGHT = "#DCE9F2";
const ORANGE_LIGHT = "#FBE3D6";
const RED = "#C81E1E";
const GRAY = "#8FA9BC";

function circle(fill) {
  return `<circle cx="60" cy="80" r="58" fill="${fill}"/>`;
}

const ICONS = {
  // A process vessel/tower — used for startup, normal operation
  vessel: (accent = NAVY) => `
    ${circle(NAVY_LIGHT)}
    <rect x="38" y="45" width="44" height="75" rx="6" fill="${accent}"/>
    <rect x="46" y="55" width="28" height="6" rx="3" fill="#F5F8FA"/>
    <rect x="46" y="68" width="28" height="6" rx="3" fill="#F5F8FA"/>
    <rect x="46" y="81" width="28" height="6" rx="3" fill="#F5F8FA"/>
    <rect x="46" y="94" width="28" height="6" rx="3" fill="#F5F8FA"/>`,

  // A vessel overfilled past a marked safe line
  overfill: () => `
    ${circle(ORANGE_LIGHT)}
    <rect x="38" y="45" width="44" height="75" rx="6" fill="${ORANGE}"/>
    <rect x="46" y="52" width="28" height="6" rx="3" fill="${ORANGE_LIGHT}"/>
    <rect x="46" y="63" width="28" height="6" rx="3" fill="${ORANGE_LIGHT}"/>
    <rect x="46" y="74" width="28" height="6" rx="3" fill="${ORANGE_LIGHT}"/>
    <path d="M60,38 L52,26 L68,26 Z" fill="${ORANGE}"/>
    <line x1="30" y1="38" x2="90" y2="38" stroke="${RED}" stroke-width="2" stroke-dasharray="3 3"/>`,

  // A valve/pipe fitting — used for mechanical/valve failures
  valve: () => `
    ${circle(NAVY_LIGHT)}
    <rect x="20" y="72" width="80" height="16" rx="4" fill="${NAVY}"/>
    <circle cx="60" cy="80" r="20" fill="${ORANGE}"/>
    <rect x="52" y="60" width="16" height="16" fill="${NAVY}"/>
    <rect x="46" y="52" width="28" height="10" rx="3" fill="${NAVY}"/>`,

  // A cracked/corroded pipe
  corrosion: () => `
    ${circle(ORANGE_LIGHT)}
    <rect x="20" y="72" width="80" height="16" rx="4" fill="${GRAY}"/>
    <path d="M55,72 L62,80 L52,84 L60,88" stroke="${RED}" stroke-width="3" fill="none"/>
    <circle cx="58" cy="80" r="4" fill="${RED}"/>`,

  // A gray toxic/vapor gas cloud
  vaporCloud: () => `
    ${circle(NAVY_LIGHT)}
    <ellipse cx="60" cy="72" rx="34" ry="18" fill="${GRAY}"/>
    <ellipse cx="40" cy="80" rx="20" ry="13" fill="${GRAY}"/>
    <ellipse cx="82" cy="80" rx="20" ry="13" fill="${GRAY}"/>`,

  // A tan/brown dust cloud (for combustible dust incidents)
  dustCloud: () => `
    ${circle(ORANGE_LIGHT)}
    <ellipse cx="60" cy="72" rx="34" ry="18" fill="#C9A876"/>
    <ellipse cx="40" cy="80" rx="20" ry="13" fill="#C9A876"/>
    <ellipse cx="82" cy="80" rx="20" ry="13" fill="#C9A876"/>`,

  // A flame
  fire: () => `
    ${circle(ORANGE_LIGHT)}
    <path d="M60,35 C45,55 40,68 48,82 C42,80 38,72 40,64 C36,80 45,100 65,100 C82,100 90,85 82,68 C88,74 88,84 84,90 C92,80 90,60 76,45 C78,55 74,62 68,60 C72,50 68,40 60,35 Z" fill="${ORANGE}"/>`,

  // An explosion burst
  explosion: () => `
    <circle cx="60" cy="80" r="58" fill="${ORANGE_LIGHT}"/>
    <path d="M60,30 L70,55 L95,50 L78,70 L100,90 L72,86 L75,112 L60,92 L45,112 L48,86 L20,90 L42,70 L25,50 L50,55 Z" fill="${ORANGE}"/>
    <circle cx="60" cy="78" r="14" fill="${RED}"/>`,

  // A small trailer/building silhouette, for facility-siting or nearby-population elements
  building: () => `
    ${circle(NAVY_LIGHT)}
    <rect x="30" y="70" width="60" height="35" rx="2" fill="${NAVY}"/>
    <rect x="38" y="78" width="10" height="10" fill="#F5F8FA"/>
    <rect x="55" y="78" width="10" height="10" fill="#F5F8FA"/>
    <rect x="72" y="78" width="10" height="10" fill="#F5F8FA"/>
    <path d="M25,70 L60,48 L95,70 Z" fill="${NAVY}"/>`,

  // A warning triangle, for "known hazard ignored" / prior near-miss elements
  warningIgnored: () => `
    ${circle(ORANGE_LIGHT)}
    <path d="M60,35 L95,100 L25,100 Z" fill="${ORANGE}"/>
    <rect x="56" y="58" width="8" height="24" rx="3" fill="#F5F8FA"/>
    <circle cx="60" cy="90" r="4" fill="#F5F8FA"/>`,

  // A storage tank
  tank: () => `
    ${circle(NAVY_LIGHT)}
    <rect x="28" y="55" width="64" height="55" rx="8" fill="${NAVY}"/>
    <ellipse cx="60" cy="55" rx="32" ry="10" fill="#3A7CA5"/>
    <line x1="28" y1="80" x2="92" y2="80" stroke="${ORANGE}" stroke-width="3"/>`,

  // A person figure — used for casualty/rescue/worker-impact elements
  person: () => `
    ${circle(ORANGE_LIGHT)}
    <circle cx="60" cy="52" r="14" fill="${NAVY}"/>
    <path d="M38,105 C38,80 48,70 60,70 C72,70 82,80 82,105 Z" fill="${NAVY}"/>`,

  // A magnifying glass / document, for investigation & root-cause elements
  investigation: () => `
    ${circle(NAVY_LIGHT)}
    <circle cx="52" cy="70" r="22" fill="none" stroke="${NAVY}" stroke-width="6"/>
    <line x1="68" y1="86" x2="88" y2="106" stroke="${NAVY}" stroke-width="7" stroke-linecap="round"/>
    <rect x="42" y="60" width="20" height="4" fill="${ORANGE}"/>
    <rect x="42" y="68" width="20" height="4" fill="${ORANGE}"/>`,

  // A pressure gauge / dial, for overpressure or mechanical integrity elements
  gauge: () => `
    ${circle(NAVY_LIGHT)}
    <circle cx="60" cy="75" r="30" fill="#fff" stroke="${NAVY}" stroke-width="4"/>
    <line x1="60" y1="75" x2="78" y2="58" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="75" r="4" fill="${NAVY}"/>
    <rect x="50" y="105" width="20" height="14" rx="3" fill="${NAVY}"/>`,
};

module.exports = { ICONS, NAVY, ORANGE, NAVY_LIGHT, ORANGE_LIGHT, RED, GRAY };
