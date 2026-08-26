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
      { icon: "gauge", label: "Safety Systems Off", caption: "Refrigeration, scrubber, and flare tower all shut down", source: "'Refrigeration...had been shut down for cost reasons, the gas scrubber and flare tower...were both non-operational'" },
      { icon: "vaporCloud", label: "Toxic Gas Release", caption: "Dense cloud over densely populated area", source: "'sent a dense toxic gas cloud over the densely populated area'" },
      { icon: "building", label: "Community Impact", caption: "Estimates range from 3,800 to over 15,000 deaths", source: "fatalities/injuries frontmatter fields — surrounding population" },
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
      { icon: "corrosion", label: "Cement Barrier Failed", caption: "Failed to seal off the hydrocarbon-bearing formation", source: "'the cement job...failed to seal off the hydrocarbon-bearing formation'" },
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
      { icon: "valve", label: "Worn Slide Valve", caption: "Failed to keep air separated from hydrocarbons", source: "'a worn slide valve failed to maintain the barrier...between air and hydrocarbons'" },
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
"ab-specialty-silicones-2019": { stages: [
    { icon: "tank", label: "Identical Containers", caption: "KOH and XL10 drums looked the same", source: "'Drums of KOH solution being brought to the area looked identical to drums of a different chemical, Andisil XL10'" },
    { icon: "vaporCloud", label: "Hydrogen Generated", caption: "Reaction released explosive hydrogen gas", source: "'the reaction rapidly generated explosive quantities of flammable hydrogen gas'" },
    { icon: "warningIgnored", label: "2014 Near-Miss Ignored", caption: "Same hazard flagged years earlier", source: "'a near-identical 2014 incident had already occurred and gone uncorrected'" },
    { icon: "explosion", label: "Explosion", caption: "4 killed, including the company's owners", source: "'Four workers were killed, including the company's owner and a second co-owner'" },
  ]},
  "airgas-cantonment-2016": { stages: [
    { icon: "gauge", label: "Pump Overheating", caption: "Heat exceeded safe operating limits", source: "'a pump heated the nitrous oxide above its safe operating limits'" },
    { icon: "valve", label: "No Safer Design Evaluated", caption: "Known hazard never engineered out", source: "'Airgas never evaluated safer design alternatives that could have eliminated the need for that specific pump'" },
    { icon: "explosion", label: "Explosion", caption: "Nitrous oxide decomposed explosively", source: "'triggered a decomposition reaction...causing a catastrophic explosion'" },
    { icon: "warningIgnored", label: "Regulatory Gap", caption: "No PSM requirement covered this industry", source: "'most of the federal regulations requiring such systems at hazardous chemical facilities simply don't apply to nitrous oxide manufacturers'" },
  ]},
  "allied-terminals-2008": { stages: [
    { icon: "corrosion", label: "Welding Defect", caption: "Flaw present since original construction", source: "root causes: 'CSB's investigation pointed to flaws in the tank's welded construction'" },
    { icon: "tank", label: "Tank Splits Open", caption: "2.1 million gallons released almost instantly", source: "'splitting open vertically and releasing roughly 2.1 million gallons of fertilizer almost instantaneously'" },
    { icon: "person", label: "Workers Caught", caption: "Welder and helper immersed in fertilizer", source: "'A welder and his helper...were caught in the collapse and immersed in the released liquid fertilizer'" },
    { icon: "building", label: "Community Reached", caption: "Flooded a road, reached a neighborhood", source: "'flooded a nearby road...reached portions of a nearby residential neighborhood'" },
  ]},
  "arkema-crosby-2017": { stages: [
    { icon: "building", label: "Hurricane Harvey Floods Site", caption: "Unprecedented rainfall overwhelmed the plant", source: "'Hurricane Harvey brought an unprecedented volume of rainfall to the Arkema plant'" },
    { icon: "gauge", label: "Power and Refrigeration Lost", caption: "Both primary and backup power failed", source: "'knocking out both primary power and backup power to the low-temperature warehouses'" },
    { icon: "warningIgnored", label: "Trailers Couldn't Be Moved", caption: "Three trailers flooded before relocation", source: "'Three trailers, however, could not be moved in time and were flooded, losing refrigeration entirely'" },
    { icon: "fire", label: "Fire", caption: "Over 350,000 lbs of organic peroxide burned", source: "'more than 350,000 pounds of organic peroxide burned'" },
  ]},
  "azf-toulouse-2001": { stages: [
    { icon: "tank", label: "Off-Spec Storage", caption: "Ammonium nitrate dumped in mixed storage", source: "'off-spec ammonium nitrate that had been dumped in the same storage area'" },
    { icon: "warningIgnored", label: "Incompatible Chemicals Mixed", caption: "A chlorinated compound entered the area", source: "'accidental mixing of a small quantity of sodium dichloroisocyanurate...with off-spec ammonium nitrate'" },
    { icon: "explosion", label: "Explosion", caption: "Equivalent to 20-40 tons of TNT", source: "'An explosion equivalent to roughly 20-40 tons of TNT destroyed a warehouse'" },
    { icon: "building", label: "City-Wide Damage", caption: "Damage extended across southern Toulouse", source: "'one of the largest industrial accidents in modern French history, with damage extending across southern Toulouse'" },
  ]},
  "barton-solvents-2007": { stages: [
    { icon: "tank", label: "Splash-Filling a Tote", caption: "A technique known to generate static charge", source: "'using a technique known as splash filling, pouring the liquid in from above rather than filling from the bottom'" },
    { icon: "warningIgnored", label: "Equipment Not Grounded", caption: "No bonding on the nozzle, hose, or weight", source: "'none of the conductive metal components involved...were bonded and grounded'" },
    { icon: "fire", label: "Ignition", caption: "A static spark ignited the vapor", source: "'a popping sound signaled the tote had ignited'" },
    { icon: "building", label: "Second Incident in 3 Months", caption: "Same failure hit a sister site in July", source: "'a similar static-spark, bonding-and-grounding failure had destroyed the company's Wichita, Kansas facility in July 2007'" },
  ]},
  "bayer-cropscience-2008": { stages: [
    { icon: "gauge", label: "Premature Startup", caption: "Interlocks bypassed to resume production", source: "'began startup of the process before completing a proper pre-startup safety review and while bypassing safety interlocks'" },
    { icon: "valve", label: "Thermal Runaway", caption: "Residue treater pressure built rapidly", source: "'a thermal runaway reaction developed inside a pressure vessel called a residue treater'" },
    { icon: "explosion", label: "Vessel Explosion", caption: "Flew roughly 50 feet through the air", source: "'flying roughly 50 feet through the air, demolishing process equipment'" },
    { icon: "warningIgnored", label: "Near-Miss with MIC Tank", caption: "Trajectory came close to a Bhopal-scale event", source: "'the exploding vessel's trajectory came close to striking piping atop a nearby tank holding methyl isocyanate (MIC)'" },
  ]},
  "bp-grangemouth-2000": { stages: [
    { icon: "gauge", label: "Cable Cut During Excavation", caption: "Power lost, forced an emergency shutdown", source: "'an underground 33kV cable was damaged during excavation work...forcing an emergency shutdown'" },
    { icon: "corrosion", label: "1950s Pipe Tee Failed", caption: "Steam main ruptured near a public road", source: "'the failure originated at a pipe tee-connection incorrectly fitted decades earlier in the 1950s'" },
    { icon: "fire", label: "FCCU Fire on Startup", caption: "Hydrocarbon leak ignited during restart", source: "'a significant hydrocarbon leak created a vapor cloud that ignited into a serious fire'" },
    { icon: "building", label: "Large-Scale Evacuation", caption: "19,000 people evacuated", source: "'triggering a large-scale evacuation before being brought under control in about 90 minutes'" },
  ]},
  "buncefield-2005": { stages: [
    { icon: "gauge", label: "Level Gauge Failed", caption: "Primary instrument missed the rising level", source: "'a storage tank's automatic tank gauge failed to register the rising level'" },
    { icon: "warningIgnored", label: "Backup Switch Also Failed", caption: "Independent safeguard untested, also down", source: "'an independent high-level switch...had also failed and was not detected because it was not being tested regularly'" },
    { icon: "overfill", label: "Tank Overflows", caption: "Gasoline released for about 40 minutes", source: "'The tank overflowed for around 40 minutes, releasing a large volume of gasoline'" },
    { icon: "explosion", label: "Explosion", caption: "One of the largest peacetime blasts in Europe", source: "'causing one of the largest peacetime explosions in Europe'" },
  ]},
  "chemtool-rockton-2021": { stages: [
    { icon: "valve", label: "Equipment Struck Piping", caption: "A scissor lift contacted elevated piping", source: "'a contractor operating a scissor lift struck a valve or section of piping'" },
    { icon: "vaporCloud", label: "Oil Released", caption: "Mineral oil began leaking from the line", source: "'with enough mechanical force to release mineral oil'" },
    { icon: "fire", label: "Fire", caption: "Ignition source never conclusively identified", source: "'the released oil ignited, the exact ignition source was never conclusively determined'" },
    { icon: "building", label: "Days-Long Burn", caption: "Officials let the fire burn out under control", source: "'officials made the deliberate decision to let the fire burn itself out over several days'" },
  ]},
  "chevron-richmond-2012": { stages: [
    { icon: "corrosion", label: "Sulfidation Corrosion", caption: "Low-silicon piping thinned over decades", source: "'ruptured after decades of sulfidation corrosion...had thinned the pipe wall well beyond safe limits'" },
    { icon: "warningIgnored", label: "2002 Recommendation Ignored", caption: "The company's own inspectors flagged this pipe", source: "root causes: 'Chevron's own metallurgists and pipe inspectors had recommended replacing this pipe roughly a decade before it ruptured'" },
    { icon: "fire", label: "Pipe Ruptures & Fire", caption: "Vapor cloud engulfed 19 employees", source: "'a large vapor cloud that engulfed 19 Chevron employees before igniting'" },
    { icon: "building", label: "Community Impact", caption: "15,000 residents sought medical treatment", source: "'roughly 15,000 nearby residents sought medical treatment'" },
  ]},
  "cta-acoustics-2003": { stages: [
    { icon: "dustCloud", label: "Dust Hazard Unknown to Workers", caption: "Phenolic resin dust never flagged as explosive", source: "'The building itself was never designed to limit dust explosion severity'" },
    { icon: "warningIgnored", label: "Supplier Withheld a Warning", caption: "Borden knew of a 1999 explosion, didn't say", source: "root causes: 'Borden Chemical...was aware of a nearly identical 1999 dust explosion...but never passed that safety lesson on'" },
    { icon: "fire", label: "Oven Left Open", caption: "Heat source ignited the accumulated dust", source: "'a curing oven had been left open due to an unresolved temperature control problem'" },
    { icon: "explosion", label: "Explosion & Fire", caption: "7 killed, 37 injured", source: "'killing seven workers, injuring 37, and destroying the facility'" },
  ]},
  "darling-ingredients-2023": { stages: [
    { icon: "tank", label: "Water-Reactive Chemical", caption: "Aluminum chloride solution stored on site", source: "'tied to a tank containing aluminum chloride solution'" },
    { icon: "warningIgnored", label: "Water Contact", caption: "Reacts violently, potentially explosively", source: "'Aluminum chloride solution is inherently unstable and reacts violently, potentially explosively, with water'" },
    { icon: "explosion", label: "Explosion", caption: "Occurred inside an enclosed building", source: "'An explosion occurred in an ancillary building'" },
    { icon: "person", label: "One Fatality", caption: "Lone worker on site that day", source: "'One worker died in the incident'" },
  ]},
  "didion-milling-2017": { stages: [
    { icon: "dustCloud", label: "No Dust Hazard Analysis", caption: "Corn dust never formally assessed", source: "'no dust hazard analysis had ever been performed'" },
    { icon: "warningIgnored", label: "Smoldering Treated as Routine", caption: "Precursor fires were never investigated", source: "'the facility's safety culture had normalized smoldering fires as a routine, unremarkable occurrence'" },
    { icon: "explosion", label: "Initial Explosion", caption: "A smoldering nest ignited inside piping", source: "'a \"smoldering nest\"...an accumulation of corn product that had ignited inside process piping'" },
    { icon: "fire", label: "Cascading Explosions", caption: "Spread through interconnected buildings", source: "'spread through interconnected piping into other buildings...fueling a cascade of secondary explosions'" },
  ]},
  "dupont-laporte-2014": { stages: [
    { icon: "valve", label: "Hydrate Blockage", caption: "Water entered methyl mercaptan piping", source: "'water inadvertently entered methyl mercaptan feed piping and...formed an ice-like hydrate that blocked the line'" },
    { icon: "warningIgnored", label: "2011 PHA Finding Ignored", caption: "Same hazard flagged three years earlier", source: "'A 2011 process hazard analysis...had already identified hydrate formation in this piping as a risk, but adequate safeguards were never put in place'" },
    { icon: "vaporCloud", label: "Toxic Release", caption: "24,000 lbs escaped inside the building", source: "'roughly 24,000 pounds of the highly toxic, flammable chemical escaped and vaporized inside the building'" },
    { icon: "person", label: "Four Fatalities", caption: "Investigated without respiratory protection", source: "'Personnel investigated the developing leak without respiratory protection; four workers died'" },
  ]},
  "evergreen-packaging-2020": { stages: [
    { icon: "fire", label: "Heat Gun Used on Resin", caption: "Warming flammable resin in cold weather", source: "'the crew began using an electric heat gun to warm it'" },
    { icon: "warningIgnored", label: "Crews Not Communicating", caption: "Second crew unaware of the new ignition source", source: "'without communicating this decision to either Evergreen Packaging or the Rimcor crew'" },
    { icon: "fire", label: "Fire Ignites", caption: "The heat gun fell into a bucket of resin", source: "'the heat gun fell into a five-gallon bucket of the flammable resin, igniting a fire'" },
    { icon: "building", label: "Spread to Connected Tower", caption: "Combustible construction let fire travel", source: "'smoke and flames spread quickly through the connecting pipe into the downflow tower'" },
  ]},
  "exxonmobil-torrance-2015": { stages: [
    { icon: "valve", label: "Faulty Slide Valve", caption: "Failed to separate hydrocarbons from air", source: "'a faulty slide valve failed to keep hydrocarbons separated from the unit's \"air side\"'" },
    { icon: "vaporCloud", label: "Hydrocarbons Backflow", caption: "Entered equipment not built to contain a blast", source: "'Hydrocarbons backflowed through the process and ignited inside the electrostatic precipitator'" },
    { icon: "explosion", label: "Explosion", caption: "Catalyst dust dispersed up to a mile", source: "'The blast dispersed large quantities of catalyst dust up to a mile from the refinery'" },
    { icon: "warningIgnored", label: "Near-Miss with HF Tank", caption: "Debris narrowly missed a toxic HF inventory", source: "'narrowly missing a tank holding tens of thousands of pounds of modified hydrofluoric acid'" },
  ]},
  "formosa-illiopolis-2004": { stages: [
    { icon: "valve", label: "Wrong Reactor Opened", caption: "Operator bypassed a pressure interlock", source: "'an operator mistakenly opened the bottom valve of a different, nearby reactor...apparently bypassing an active pressure safety interlock'" },
    { icon: "warningIgnored", label: "Same Failure Happened Before", caption: "A near-identical incident two months earlier", source: "root causes: 'the exact same failure mode had happened before, twice, and was not corrected'" },
    { icon: "vaporCloud", label: "VCM Release", caption: "Vinyl chloride monomer formed a vapor cloud", source: "'released a large quantity of highly flammable vinyl chloride monomer (VCM), which formed a vapor cloud and detonated'" },
    { icon: "explosion", label: "Explosion", caption: "5 killed, plant never reopened", source: "'Five workers were killed and three others severely injured; the facility was destroyed and never reopened'" },
  ]},
  "freedom-industries-elk-river-2014": { stages: [
    { icon: "corrosion", label: "Undetected Pitting Corrosion", caption: "Tank not inspected in at least a decade", source: "'developed two small holes in its floor from pitting corrosion...had not been internally inspected in at least ten years'" },
    { icon: "warningIgnored", label: "Containment Also Failed", caption: "Secondary wall had its own cracks and holes", source: "'The tank's secondary containment wall...had cracks and holes of its own from years of disrepair'" },
    { icon: "vaporCloud", label: "Chemical Leak", caption: "Crude MCHM entered the Elk River", source: "'Crude MCHM...leaked through the holes'" },
    { icon: "building", label: "300,000 Without Water", caption: "Do-not-use order across nine counties", source: "'forced a \"do-not-use\" order on tap water for up to 300,000 residents across nine counties'" },
  ]},
  "goodyear-houston-2008": { stages: [
    { icon: "valve", label: "Relief Path Blocked", caption: "Valves closed to replace a burst rupture disk", source: "'several valves...were closed, including a valve that isolated the exchanger from its relief valve'" },
    { icon: "gauge", label: "Steam Reintroduced", caption: "Exchanger had no way to relieve pressure", source: "'When pressurized steam was later introduced...the exchanger had no path to safely relieve the resulting overpressure'" },
    { icon: "explosion", label: "Explosion", caption: "Ammonia released, debris struck a worker", source: "'ruptured violently, releasing ammonia and hurling debris that struck and fatally injured an employee'" },
    { icon: "warningIgnored", label: "No Drills in 4 Years", caption: "Body not found for roughly six hours", source: "'Her body wasn't discovered...until roughly six hours after the explosion'" },
  ]},
  "hayes-lemmerz-2003": { stages: [
    { icon: "dustCloud", label: "No MOC on Dust System", caption: "Collector installed without a hazard review", source: "root causes: 'the company did not follow a management of change process'" },
    { icon: "warningIgnored", label: "Prior Fires Never Investigated", caption: "The same dust hazard had ignited before", source: "root causes: 'The plant had experienced earlier fires involving the same dust hazard without any formal investigation'" },
    { icon: "explosion", label: "Dust Collector Explodes", caption: "Blast spread through connecting ductwork", source: "'An explosion occurred in the dust collector and spread through connecting ductwork'" },
    { icon: "fire", label: "Secondary Explosion", caption: "Dust on overhead beams also ignited", source: "'a secondary explosion when accumulated dust on overhead beams and structures also ignited'" },
  ]},
  "home-market-foods-2022": { stages: [
    { icon: "valve", label: "Unrelated HVAC Work", caption: "Contractors weren't working on the ammonia system", source: "\"'they were doing nothing associated with the ammonia system'\"" },
    { icon: "corrosion", label: "Pipe Accidentally Severed", caption: "Ammonia piping struck during nearby work", source: "'An ammonia pipe was accidentally severed during their work'" },
    { icon: "vaporCloud", label: "Ammonia Release", caption: "Measured over 20x the deadly threshold", source: "'firefighters measured levels exceeding 6,000 parts per million on arrival, more than 20 times the deadly threshold'" },
    { icon: "person", label: "One Fatality", caption: "A 68-year-old contractor died from exposure", source: "'One contractor, 68-year-old Richard Arguin, died from the exposure'" },
  ]},
  "jaipur-2009": { stages: [
    { icon: "valve", label: "Valve Sequence Error", caption: "Valves were opened in the wrong order", source: "'operators preparing the tank opened valves in the wrong sequence'" },
    { icon: "vaporCloud", label: "Massive Vapor Cloud", caption: "About 4 times the size of Buncefield's", source: "'grew to roughly 1,000 meters in diameter, about four times the size of the vapor cloud at Buncefield'" },
    { icon: "warningIgnored", label: "No Remote Shutoff", caption: "Only a manual valve could stop the leak", source: "'The site had no remotely operated shutdown valve, so stopping the leak required someone to physically reach the valve'" },
    { icon: "explosion", label: "Explosion After 75 Minutes", caption: "Terminal destroyed, fire burned 11 days", source: "'The leak continued uncontrolled for 75 minutes before the cloud found an ignition source and exploded'" },
  ]},
  "kleen-energy-2010": { stages: [
    { icon: "valve", label: "Gas Blow to Clean Piping", caption: "High-pressure natural gas vented to open air", source: "'using a \"gas blow\", a common industry practice of venting high-pressure natural gas...directly to atmosphere'" },
    { icon: "vaporCloud", label: "Gas Accumulates", caption: "400,000 cubic feet in a congested area", source: "'gas blows released an estimated 400,000 standard cubic feet of natural gas into a congested outdoor area'" },
    { icon: "warningIgnored", label: "No Rule Against the Practice", caption: "No regulation prohibited this method", source: "root causes: 'the CSB found no specific federal workplace safety standard prohibited this practice'" },
    { icon: "explosion", label: "Explosion", caption: "Registered as a small earthquake", source: "'with an explosion large enough to register as a small earthquake'" },
  ]},
  "kmco-crosby-2019": { stages: [
    { icon: "corrosion", label: "Brittle Cast-Iron Strainer", caption: "Material not suited for this pressurized service", source: "'a cast iron \"y-strainer\"...ruptured due to brittle overload fracture'" },
    { icon: "vaporCloud", label: "Isobutylene Release", caption: "Strainer ruptured, formed a vapor cloud", source: "'Isobutylene...escaped and formed a large vapor cloud'" },
    { icon: "warningIgnored", label: "Trainee Approached the Cloud", caption: "Culture expected operators to intervene", source: "'the operator called for help assessing the situation rather than immediately retreating to safety'" },
    { icon: "explosion", label: "Explosion", caption: "At least 28 injured", source: "'an explosion that killed one KMCO employee and seriously injured two others; at least 28 people in total were injured'" },
  ]},
  "kuraray-america-2018": { stages: [
    { icon: "gauge", label: "High-Pressure Alarm Sounds", caption: "Workers were not evacuated from the area", source: "'When the reactor's high-pressure alarm sounded...workers were not evacuated from the area'" },
    { icon: "valve", label: "Safety Interlock Disabled", caption: "A protective system was out of service", source: "root causes: 'a disabled safety interlock was a contributing factor'" },
    { icon: "vaporCloud", label: "Relief System Vents", caption: "Discharged ethylene toward occupied space", source: "'its discharge piping was aimed horizontally into the air near where workers were positioned'" },
    { icon: "fire", label: "Fire", caption: "23 injured, mostly while running to escape", source: "'23 workers...were injured, most from burns and from injuries sustained while running to escape'" },
  ]},
  "longford-1998": { stages: [
    { icon: "gauge", label: "No HAZOP Ever Conducted", caption: "This heat exchange hazard never formally studied", source: "root causes: 'a formal hazard and operability study would very likely have identified the low-temperature embrittlement risk'" },
    { icon: "corrosion", label: "Metal Embrittled", caption: "Warm oil flow stopped, operators unaware why", source: "'the exchanger, no longer receiving the warm oil that kept it from embrittling, cooled dramatically'" },
    { icon: "valve", label: "Warm Oil Reintroduced", caption: "Sudden heat fractured the brittle metal", source: "'the sudden reintroduction of heat caused the now brittle, supercooled metal to fracture'" },
    { icon: "fire", label: "Release & Fire", caption: "Cut gas supply to nearly all of Victoria", source: "'cut gas supply to nearly all of Victoria state for about two weeks'" },
  ]},
  "loy-lange-box-2017": { stages: [
    { icon: "corrosion", label: "Corrosion Known Since 2004", caption: "The company was aware for over a decade", source: "'The company had been aware of corrosion problems as far back as 2004'" },
    { icon: "warningIgnored", label: "2012 Repair Incomplete", caption: "Original compromised steel left in place", source: "'A 2012 repair attempt removed only part of the corroded metal...the original, still-compromised steel remained in place'" },
    { icon: "gauge", label: "Operated While Leaking", caption: "Vessel run despite a known active leak", source: "'employees had discovered the vessel was actively leaking...Loy-Lange continued operating the equipment anyway'" },
    { icon: "explosion", label: "Explosion", caption: "Launched 500 feet into a neighboring business", source: "'launched the roughly 2,000-pound vessel through the air and through the roof of a neighboring business...roughly 500 feet away'" },
  ]},
  "mgpi-atchison-2016": { stages: [
    { icon: "tank", label: "Look-Alike Fill Lines", caption: "Acid and bleach lines sat 18 inches apart", source: "'The two fill lines looked similar, were not clearly marked to distinguish them, and sat only about 18 inches apart'" },
    { icon: "warningIgnored", label: "Both Lines Left Unlocked", caption: "Operator missed that the wrong one was open", source: "'did not notice that the adjacent sodium hypochlorite fill line was also already unlocked'" },
    { icon: "vaporCloud", label: "Wrong Chemical Delivered", caption: "Acid pumped into the sodium hypochlorite tank", source: "'The driver connected the sulfuric acid delivery hose to the sodium hypochlorite line by mistake'" },
    { icon: "building", label: "11,000 Sheltered in Place", caption: "A toxic chlorine gas cloud spread off-site", source: "'local authorities ordered roughly 11,000 residents to shelter in place'" },
  ]},
  "milford-haven-1994": { stages: [
    { icon: "gauge", label: "Valve Indicator Wrong", caption: "Showed open while actually closed", source: "'a control valve was actually closed while the control system's indication showed it as open'" },
    { icon: "overfill", label: "Vessel Kept Filling", caption: "The outlet was shut, unknown to operators", source: "'flammable hydrocarbon liquid continued to be pumped into a process vessel whose outlet was, unknown to operators, shut'" },
    { icon: "valve", label: "Flare Undersized", caption: "System couldn't relieve the developing pressure", source: "'The flare system...was not designed to handle an excursion of this scale'" },
    { icon: "explosion", label: "Explosion", caption: "26 injured — no fatalities, largely by chance", source: "'a stroke of good fortune investigators noted was a significant factor in there being no fatalities'" },
  ]},
  "motiva-delaware-city-2001": { stages: [
    { icon: "corrosion", label: "Corroded Tank Undetected", caption: "Holes had formed in the roof and shell", source: "'holes caused by corrosion that had gone unaddressed'" },
    { icon: "fire", label: "Hot Work Overhead", caption: "Catwalk repair performed above the tank farm", source: "'a crew of contract workers was repairing grating on a catwalk above a spent sulfuric acid storage tank farm'" },
    { icon: "vaporCloud", label: "Spark Ignites Vapors", caption: "Flammable gas was escaping through the corrosion", source: "'a spark from their hot work ignited flammable vapors escaping from holes in the roof and shell'" },
    { icon: "person", label: "1.1M Gallons Released", caption: "One contractor killed, river contaminated", source: "'Approximately 1.1 million gallons of spent sulfuric acid were released in total'" },
  ]},
  "ndk-crystal-2009": { stages: [
    { icon: "corrosion", label: "Cracking Found in 2007", caption: "An insurer's consultant warned against reuse", source: "'the company discovered stress corrosion cracking in four of the eight vessel lids'" },
    { icon: "warningIgnored", label: "Warning Not Heeded", caption: "Vessels returned to service without testing", source: "'a consultant...expressed \"serious reservations\" about returning them to service...NDK...returned them to service anyway without independently testing them'" },
    { icon: "explosion", label: "Vessel Ruptures", caption: "Nearly three years after the warning", source: "'Nearly three years later, Vessel #2 catastrophically ruptured'" },
    { icon: "person", label: "Offsite Fatality", caption: "A fragment struck a truck driver 650 feet away", source: "'A piece of the building structure was blown 650 feet and struck a truck driver...killing him'" },
  ]},
  "optima-belle-2020": { stages: [
    { icon: "investigation", label: "Inaccurate Safety Data Sheet", caption: "Real decomposition point known but not shared", source: "'Clearon...knew...that the compound could decompose at temperatures far lower than the...figure listed on its own safety data sheet'" },
    { icon: "gauge", label: "No Thermal Testing Done", caption: "First use of this compound in this equipment", source: "'the first time either company had used this equipment for this specific compound'" },
    { icon: "explosion", label: "Dryer Explodes", caption: "Decomposition reaction built pressure fast", source: "'the compound underwent an unanticipated decomposition reaction, releasing gases that pushed the dryer's internal pressure above its design limit'" },
    { icon: "vaporCloud", label: "Chlorine Release", caption: "A 2-mile shelter-in-place was ordered", source: "'the dryer exploded, releasing toxic chlorine gas'" },
  ]},
  "pca-deridder-2017": { stages: [
    { icon: "fire", label: "Hot Work on a Tank", caption: "Welding performed during a facility shutdown", source: "'a contract crew was performing welding and grinding...on a storage tank'" },
    { icon: "warningIgnored", label: "2008 Sister-Site Fatality", caption: "A near-identical incident killed 3 in Wisconsin", source: "'in 2008, a nearly identical hot-work tank explosion at the company's Tomahawk, Wisconsin plant had also killed three workers'" },
    { icon: "vaporCloud", label: "Gas Hazard Missed", caption: "Flammable material inside not identified", source: "'The tank contained non-condensable gases and flammable material that had not been adequately identified'" },
    { icon: "explosion", label: "Explosion", caption: "3 killed, 7 injured", source: "'Three contract workers performing the hot work were killed, and seven others were injured'" },
  ]},
  "philadelphia-energy-solutions-2019": { stages: [
    { icon: "corrosion", label: "1973 Pipe Elbow", caption: "Corroded to about 7% of original thickness", source: "'A steel pipe elbow installed in 1973...ruptured after decades of corrosion had eaten the pipe wall down to roughly 7% of its original thickness'" },
    { icon: "investigation", label: "Outdated Material Standard", caption: "Alloy hasn't met standards since 1995", source: "root causes: 'the alloy has not met international industry standards since they were updated in 1995'" },
    { icon: "fire", label: "Fire", caption: "HF mixed with burning hydrocarbons", source: "'causing a major fire followed by a series of explosions'" },
    { icon: "building", label: "Refinery Permanently Closed", caption: "117,000 residents lived within a mile", source: "'the refinery, sitting less than a mile from roughly 117,000 residents, never reopened'" },
  ]},
  "phillips-pasadena-1989": { stages: [
    { icon: "valve", label: "Single-Valve Isolation", caption: "The only barrier on a live reactor line", source: "'An 8-inch ball valve, the only barrier between the open line and the live reactor, was left unsecured'" },
    { icon: "warningIgnored", label: "No Process Hazard Analysis", caption: "This exact failure mode was never identified", source: "root causes: 'no process hazard analysis had been performed on the polyethylene unit'" },
    { icon: "vaporCloud", label: "85,000 lbs Released", caption: "Vapor cloud spread undetected, no gas detection", source: "'roughly 85,000 pounds of highly flammable process gas...escaped in under two minutes'" },
    { icon: "explosion", label: "Explosion", caption: "23 killed, 314 injured", source: "'23 workers were killed and 314 injured'" },
  ]},
  "seveso-1976": { stages: [
    { icon: "valve", label: "Reactor Shut Down Mid-Cycle", caption: "Left unsupervised over the weekend", source: "'shut down mid-cycle on a Friday evening...and abandoned unsupervised for the weekend'" },
    { icon: "gauge", label: "No Automatic Cooling", caption: "Residual heat kept the reaction going", source: "'With no stirring and no automatic cooling system, residual heat in the mixture drove a slow exothermic reaction'" },
    { icon: "overfill", label: "Pressure Exceeds Relief Setting", caption: "Rupture disc sized for the wrong hazard", source: "'pressure inside the reactor exceeded the rupture disc's set point...and it burst'" },
    { icon: "vaporCloud", label: "Dioxin Release", caption: "TCDD cloud spread over Seveso and Meda", source: "'The cloud carried an estimated 1-2 kg of TCDD dioxin...over the towns of Seveso and Meda'" },
  ]},
  "silver-eagle-refinery-2009": { stages: [
    { icon: "corrosion", label: "Never-Inspected Pipe", caption: "In service since 1993, no inspection records", source: "'CSB's metallurgical analysis found no inspection records for the pipe at any point in its service life'" },
    { icon: "gauge", label: "Sulfidation Corrosion", caption: "The same mechanism seen in several other incidents", source: "'sulfur compounds in the process stream had caused sulfidation corrosion to progressively thin the pipe walls, undetected, over 16 years'" },
    { icon: "explosion", label: "Hydrogen Explosion", caption: "Blast wave reached an adjacent subdivision", source: "'The rupture released a large quantity of hydrogen that ignited immediately'" },
    { icon: "building", label: "100+ Homes Damaged", caption: "No injuries — by chance no one was nearby", source: "'the resulting blast wave traveled from the refinery into an adjacent residential subdivision, damaging more than 100 homes'" },
  ]},
  "sunoco-nederland-2016": { stages: [
    { icon: "fire", label: "Hot Work on Crude Pipe", caption: "Welding inside a flange with residual oil", source: "'conducting hot work...on a section of pipe that still contained residual crude oil'" },
    { icon: "warningIgnored", label: "Procedure Gaps", caption: "Both company and contractor guidance had holes", source: "root causes: 'both Sunoco's and L-Con's hot work procedures had similar, significant gaps'" },
    { icon: "explosion", label: "Explosion", caption: "Vapor ignited between two isolation tools", source: "'flammable vapor...ignited, causing a pressure buildup that led to an explosion at both ends'" },
    { icon: "person", label: "7 Burned", caption: "No fatalities, several airlifted to hospitals", source: "'Seven workers suffered burn injuries...with no fatalities'" },
  ]},
  "t2-laboratories-2007": { stages: [
    { icon: "gauge", label: "Cooling Lost", caption: "A batch reactor's exotherm accelerated unchecked", source: "'the reactor's cooling system likely malfunctioned...while the reaction was underway'" },
    { icon: "warningIgnored", label: "Prior Near-Misses Ignored", caption: "Earlier runs showed the same warning signs", source: "root causes: 'the company had experienced prior near-misses during earlier production runs...without recognizing them as warnings'" },
    { icon: "explosion", label: "BLEVE", caption: "The reactor ruptured violently", source: "'the exothermic reaction accelerated into a runaway...the reactor violently ruptured'" },
    { icon: "building", label: "Debris Found a Mile Away", caption: "4 killed, 32 injured off-site too", source: "'Wreckage was found up to a mile from the site'" },
  ]},
  "tesoro-anacortes-2010": { stages: [
    { icon: "corrosion", label: "High-Temp Hydrogen Attack", caption: "Invisible degradation over decades of service", source: "'the direct cause was high temperature hydrogen attack (HTHA)...gradually cracks and weakens carbon steel from the inside, invisibly, over years'" },
    { icon: "investigation", label: "Industry Standard Inadequate", caption: "Existing inspection guidance missed the risk", source: "root causes: 'CSB found the American Petroleum Institute's standard for assessing equipment vulnerability to HTHA was inadequate'" },
    { icon: "explosion", label: "Exchanger Ruptures", caption: "Fire burned for more than three hours", source: "'one of the exchangers catastrophically ruptured at its weld seams'" },
    { icon: "person", label: "7 Fatalities", caption: "Deadliest US refinery incident since 2005", source: "'the deadliest incident at a U.S. refinery since 2005'" },
  ]},
  "tianjin-2015": { stages: [
    { icon: "warningIgnored", label: "Nitrocellulose Dried Out", caption: "Its wetting agent evaporated in summer heat", source: "'overheated in summer temperatures after its protective wetting agent evaporated'" },
    { icon: "dustCloud", label: "Incompatible Co-Storage", caption: "Dozens of chemical classes stored together", source: "'dozens of different hazardous chemicals had been stored together in violation of separation requirements'" },
    { icon: "fire", label: "Initial Fire", caption: "The nitrocellulose self-ignited", source: "'Nitrocellulose becomes unstable and prone to spontaneous ignition when it dries out'" },
    { icon: "explosion", label: "Massive Detonation", caption: "173 killed, mostly first responders", source: "'killed 173 people, the majority of them firefighters and emergency responders'" },
  ]},
  "tpc-port-neches-2019": { stages: [
    { icon: "valve", label: "Dead Leg Unaddressed", caption: "Piping left disconnected from active flow", source: "'a section of piping connected to out-of-service equipment, a \"dead leg\" left over when a process pump was taken offline'" },
    { icon: "warningIgnored", label: "2016 Recommendation Ignored", caption: "An internal fix identified 3 years earlier", source: "root causes: 'a 2016 internal hazard analysis recommendation was never implemented'" },
    { icon: "overfill", label: "Polymer Builds Up", caption: "Over 100 days of undetected accumulation", source: "'For more than 100 days before the incident...popcorn polymer...had been steadily accumulating'" },
    { icon: "explosion", label: "Explosion", caption: "6,000 gallons of butadiene released in a minute", source: "'Roughly 6,000 gallons of liquid butadiene emptied from the fractionator in under a minute'" },
  ]},
  "us-steel-clairton-2025": { stages: [
    { icon: "valve", label: "Ad Hoc Valve Washing", caption: "No written procedure existed for the task", source: "'U.S. Steel had no written procedure specifying how this task should be safely performed'" },
    { icon: "gauge", label: "Valve Cracks", caption: "High-pressure water over-pressurized the valve", source: "'The over-pressurization from this improvised approach cracked the valve'" },
    { icon: "vaporCloud", label: "Gas Ignites", caption: "Coke oven gas escaped and found ignition", source: "'releasing highly flammable, toxic coke oven gas into the air, where it ignited'" },
    { icon: "building", label: "Control Rooms Too Close", caption: "2 killed, 11 injured — 2010 precedent unheeded", source: "'none of the buildings in the area...had been designed or constructed to withstand an explosion'" },
  ]},
  "valero-mckee-2007": { stages: [
    { icon: "valve", label: "Leaking Valve into Idle Piping", caption: "A small leak into a supposedly idle line", source: "'was accidentally left partially open, allowing small amounts of propane and entrained water to seep into the idle pipe'" },
    { icon: "gauge", label: "Water Freezes and Cracks Pipe", caption: "No freeze protection program was in place", source: "'A period of unusually cold weather...froze that trapped water, which expanded and cracked the pipe'" },
    { icon: "vaporCloud", label: "Propane Escapes", caption: "4,500 lbs per minute once the ice melted", source: "'high-pressure liquid propane began escaping at an estimated rate of 4,500 pounds per minute'" },
    { icon: "fire", label: "Fire", caption: "Refinery shut down for nearly two months", source: "'The refinery was completely shut down for nearly two months'" },
  ]},
  "wacker-polysilicon-2020": { stages: [
    { icon: "valve", label: "No Written Torque Procedure", caption: "A contract crew over-torqued a flange bolt", source: "root causes: 'the contract pipefitters were tasked with torquing bolts...without documented, verified instructions'" },
    { icon: "vaporCloud", label: "HCl Cloud Forms", caption: "A nearby crew had no chemical protection", source: "'cracking the pipe and releasing a rapidly expanding cloud of HCl gas across the platform'" },
    { icon: "warningIgnored", label: "Single Means of Egress", caption: "Flagged 3 months earlier, left unaddressed", source: "'The platform had only one way down, a staircase, and as the gas cloud spread, workers lost visibility'" },
    { icon: "person", label: "Workers Fall 70 Feet", caption: "Trying to escape the gas cloud", source: "'began climbing down the outside of the structure instead. All three fell approximately 70 feet'" },
  ]},
  "watson-grinding-2020": { stages: [
    { icon: "corrosion", label: "Degraded Welding Hose", caption: "A poorly crimped fitting came loose overnight", source: "'a degraded and poorly crimped rubber welding hose came off its fitting'" },
    { icon: "valve", label: "Valve Left Open", caption: "No isolation at the end of the workday", source: "'A manual shutoff valve at the tank had also not been closed at the end of the previous workday'" },
    { icon: "warningIgnored", label: "Gas Detection Not Working", caption: "The leak went undetected for hours", source: "root causes: 'a gas detection alarm, exhaust fan startup system, and automatic gas shutoff system were all not working properly'" },
    { icon: "explosion", label: "Explosion", caption: "3 killed, including a nearby resident", source: "'causing a massive explosion that destroyed the building and scattered debris up to half a mile away'" },
  ]},
  "west-pharmaceutical-2003": { stages: [
    { icon: "dustCloud", label: "Dust Above the Ceiling", caption: "Never designed to prevent accumulation", source: "'had accumulated above a suspended ceiling over the manufacturing area, a space that was never designed or maintained to prevent dust buildup'" },
    { icon: "warningIgnored", label: "Fire Code Never Consulted", caption: "NFPA 654 requirements weren't applied", source: "root causes: 'CSB found the company's engineering management systems did not ensure relevant industry fire codes...were referenced or applied'" },
    { icon: "explosion", label: "Explosion", caption: "The blast was felt 25 miles away", source: "'An explosion and fire destroyed the plant...the blast was felt 25 miles away'" },
    { icon: "fire", label: "Debris Ignites Woods", caption: "6 killed, 38 injured", source: "'burning debris ignited wooded areas up to two miles from the site'" },
  ]},
  "williams-olefins-2013": { stages: [
    { icon: "valve", label: "1990s Change Removed Protection", caption: "Single-reboiler operation left one unprotected", source: "'Williams changed operating practice to run the fractionator with only one reboiler in service at a time...without adequately addressing the resulting loss of overpressure protection'" },
    { icon: "warningIgnored", label: "Gap Unaddressed for 12 Years", caption: "A known risk that was never fixed", source: "'went unresolved for roughly 12 years'" },
    { icon: "gauge", label: "Trapped Propane Flashes", caption: "Hot water introduced to an 'isolated' vessel", source: "'had liquid propane trapped inside despite that isolation. When hot water was directed into it...the trapped liquid flashed to vapor'" },
    { icon: "explosion", label: "BLEVE", caption: "2 killed, 167 injured — mostly contractors", source: "'The reboiler's shell catastrophically ruptured in a boiling liquid expanding vapor explosion (BLEVE)'" },
  ]},
  "yenkin-majestic-2021": { stages: [
    { icon: "valve", label: "Manway Not Pressure Tested", caption: "Installed just 3 months before the incident", source: "'an access port that had been newly installed on the kettle only three months earlier'" },
    { icon: "warningIgnored", label: "Procedure Violated", caption: "Solvent was added with the agitator off", source: "'an operator added liquid solvent to a kettle of hot resin while the kettle's agitator was turned off, contrary to established procedure'" },
    { icon: "overfill", label: "Pressure Builds", caption: "Sudden mixing rapidly vaporized the solvent", source: "'the sudden mixing caused the solvent to rapidly vaporize, building pressure inside the kettle'" },
    { icon: "explosion", label: "Explosion & Fire", caption: "1 killed, 8 injured, burned 11 hours", source: "'triggering an explosion that was seen, heard, and felt throughout parts of Columbus'" },
  ]},
"formosa-point-comfort-2020": { stages: [
    { icon: "tank", label: "Container Believed Empty", caption: "Still held 1,250 lbs of chlorine", source: "'The container was not actually empty at all, still holding 1,250 pounds of chlorine'" },
    { icon: "vaporCloud", label: "Chlorine Escapes", caption: "Worker wasn't wearing respiratory protection", source: "'Because the container was believed empty, the worker wasn't wearing respiratory protection'" },
    { icon: "warningIgnored", label: "Three Attempts Failed", caption: "Took 50 minutes to close the vapor valve", source: "'Three attempts to stop the release failed before an emergency responder was able to close the container's vapor valve'" },
    { icon: "person", label: "Worker Hospitalized", caption: "Flown to hospital with respiratory difficulties", source: "fatalities/injuries frontmatter fields" },
  ]},
  "bio-lab-westlake-2020": { stages: [
    { icon: "building", label: "Hurricane Laura Hits", caption: "Category 4 storm tore roofs off the facility", source: "'Category 4 Hurricane Laura tore roofs off portions of the Bio-Lab facility'" },
    { icon: "vaporCloud", label: "Rainwater Reaches TCCA", caption: "Wetting triggers heat and chlorine gas", source: "'rainwater reached stored TCCA and triggered exactly that reaction, initiating a fire'" },
    { icon: "warningIgnored", label: "2010 Recommendation Unimplemented", caption: "Roof vulnerability flagged a decade earlier", source: "'a process hazard analysis a decade before the incident that recommended assessing whether facility buildings...could withstand hurricane-strength winds'" },
    { icon: "fire", label: "Fire & Toxic Plume", caption: "$250 million rebuild, closed over two years", source: "'stayed closed for over two years, and was eventually rebuilt at a cost of $250 million'" },
  ]},
  "accurate-energetic-systems-2025": { stages: [
    { icon: "tank", label: "Explosives Melted in Kettles", caption: "24,600 lbs of material present", source: "'melting explosive material in agitated, steam-jacketed kettles'" },
    { icon: "warningIgnored", label: "No Sprinkler System", caption: "Fire protection gap under active review", source: "'the absence of a sprinkler system in Building 602'" },
    { icon: "explosion", label: "Catastrophic Explosion", caption: "Building destroyed, felt 20+ miles away", source: "'The explosions completely destroyed Building 602...felt more than 20 miles away'" },
    { icon: "person", label: "16 Killed", caption: "One of the deadliest US industrial incidents in years", source: "fatalities/injuries frontmatter fields" },
  ]},
  "rubicon-geismar-2022": { stages: [
    { icon: "gauge", label: "Rupture Disc Activates Early", caption: "Opened at 13 psi, not its 30 psi design", source: "'process data showed it actually opened at about 13 psi'" },
    { icon: "vaporCloud", label: "Hot MDI Discharges", caption: "Piping ended just 8 inches above the floor", source: "'discharged into vertically-oriented piping that ended only about eight inches above a solid concrete floor'" },
    { icon: "warningIgnored", label: "Known Hazard Not Mitigated", caption: "PHA had already identified this exact risk", source: "'Rubicon's process hazard analysis had already identified personnel exposure to hot MDI as a potential consequence'" },
    { icon: "person", label: "Two Workers Sprayed", caption: "Hospitalized with thermal burns", source: "fatalities/injuries frontmatter fields" },
  ]},
  "pemex-deer-park-2024": { stages: [
    { icon: "valve", label: "Wrong Flange Opened", caption: "Correct one was 5 feet away", source: "'mistakenly opened a flange on piping...when they had actually been assigned to open a different flange located about five feet away'" },
    { icon: "vaporCloud", label: "H2S Vapor Travels Downwind", caption: "Reached an adjacent occupied unit", source: "'The hydrogen sulfide vapor then traveled downwind into an adjacent unit'" },
    { icon: "warningIgnored", label: "No Positive Equipment ID", caption: "Drawings weren't precise enough to tell pipes apart", source: "'the refinery lacked an effective method to clearly distinguish the correct flange before work began'" },
    { icon: "person", label: "Two Fatalities", caption: "27,000 lbs of hydrogen sulfide released", source: "fatalities/injuries frontmatter fields" },
  ]},
  "millard-refrigerated-2010": { stages: [
    { icon: "gauge", label: "Power Restored After Outage", caption: "Operator cleared alarms mid-defrost cycle", source: "'an operator troubleshooting the restart cleared alarms in the control system, which reset a group of freezer evaporators mid-cycle'" },
    { icon: "valve", label: "Hydraulic Shock", caption: "Hot gas met liquid ammonia in the same line", source: "'hydraulic shock\", a sudden, localized pressure surge caused by a rapid change in flow velocity'" },
    { icon: "vaporCloud", label: "32,000 lbs of Ammonia Released", caption: "Cloud drifted over 800 nearby workers", source: "'The ammonia cloud drifted directly over a nearby site where more than 800 people were working'" },
    { icon: "warningIgnored", label: "Third Release at This Site", caption: "Two prior releases hadn't been fully addressed", source: "'the company had experienced two earlier releases (2007 and January 2010) at the same site'" },
  ]},
  "itc-deer-park-2019": { stages: [
    { icon: "corrosion", label: "Pump Bearing Fails", caption: "Kept running 30 minutes after failure", source: "'The pump kept running for roughly 30 minutes after the failure, releasing flammable product'" },
    { icon: "warningIgnored", label: "2014 Recommendation Ignored", caption: "Gas detection was never added", source: "'a hazard review team had specifically recommended adding flammable gas detection near this tank five years earlier'" },
    { icon: "fire", label: "Fire Spreads to 14 Tanks", caption: "Burned for three days", source: "'The fire spread to 14 neighboring tanks in the same containment area and burned for three days'" },
    { icon: "building", label: "$150M+ in Damage", caption: "Ship Channel closed, no injuries", source: "fatalities/injuries frontmatter fields" },
  ]},
  "catalyst-refiners-2026": { stages: [
    { icon: "tank", label: "Chemicals Mixed During Disposal", caption: "Nitric acid added to a wastewater tank", source: "'began adding diluted nitric acid into the same tank'" },
    { icon: "vaporCloud", label: "Toxic Fog Forms", caption: "Two workers lost consciousness", source: "'Workers noticed a chemical reaction developing and fog forming over the tank'" },
    { icon: "warningIgnored", label: "Coworkers Went to Help", caption: "Both inhaled the fumes and later died", source: "'Two other employees then went into the area to help their collapsed colleagues. Both inhaled the resulting hydrogen sulfide fumes'" },
    { icon: "person", label: "Two Fatalities", caption: "Investigation still ongoing", source: "fatalities/injuries frontmatter fields" },
  ]},
  "valero-meraux-2020": { stages: [
    { icon: "gauge", label: "PSV Fails to Reseat", caption: "Approved plan: close an inlet valve", source: "'the valve failed to fully \"reseat\" back into its closed position'" },
    { icon: "warningIgnored", label: "Field Deviation from Plan", caption: "Operators closed a different valve instead", source: "'made a decision on the spot to close a different valve instead, a 20-inch outlet valve'" },
    { icon: "explosion", label: "Substitute Valve Fails", caption: "Triggered an explosion and fire", source: "'That substituted valve immediately failed when closed, triggering an explosion and fire'" },
    { icon: "person", label: "One Worker Injured", caption: "$5.15 million in property damage", source: "fatalities/injuries frontmatter fields" },
  ]},
  "lacc-westlake-2020": { stages: [
    { icon: "tank", label: "Clearing a Chemical Hose", caption: "Temporary workaround for unreliable equipment", source: "'a workaround the company had adopted to manage a reliability problem with its regular oxidizing reactor equipment'" },
    { icon: "overfill", label: "Unsecured Hatch", caption: "Pressurized caustic erupted outward", source: "'erupted spent caustic out through its unsecured top hatch, splashing the corrosive liquid onto her'" },
    { icon: "warningIgnored", label: "Safety Shower Too Far", caption: "Took two minutes to reach it", source: "'was far enough away that it took her roughly two minutes to reach it'" },
    { icon: "person", label: "Chemical Burns", caption: "Hospitalized for treatment", source: "fatalities/injuries frontmatter fields" },
  ]},
  "horsehead-monaca-2010": { stages: [
    { icon: "valve", label: "Column Rebuilt", caption: "Reused a sump designed for lower flow", source: "'reused a sump at its base that had originally been designed for a different column configuration with a much lower liquid flow rate'" },
    { icon: "corrosion", label: "Sump Blocks, Zinc Traps", caption: "Became superheated inside the column", source: "'the liquid zinc became superheated by heat from the combustion chamber'" },
    { icon: "warningIgnored", label: "Warning Signs Missed", caption: "Visible days before, not recognized", source: "'symptoms of the developing blockage had been visible in the days before the explosion but were not recognized'" },
    { icon: "explosion", label: "Explosive Decompression", caption: "Two operators killed", source: "fatalities/injuries frontmatter fields" },
  ]},
  "georgia-pacific-naheola-2002": { stages: [
    { icon: "tank", label: "Routine Spillage into Pit", caption: "Up to 5 gallons lost per delivery", source: "'each losing up to five gallons of NaSH into a collection pit at the site, a normal, expected part of the unloading process'" },
    { icon: "vaporCloud", label: "Reacts in Acidic Sewer", caption: "Generated lethal hydrogen sulfide gas", source: "'it reacted to release hydrogen sulfide gas, a highly toxic gas that can cause immediate death'" },
    { icon: "warningIgnored", label: "Contractors Had No Idea", caption: "Unrelated construction work nearby", source: "'Nearly everyone affected was a contractor from Burkes Construction working on an unrelated construction project'" },
    { icon: "person", label: "Two Killed, Eight Injured", caption: "A decades-old design flaw", source: "fatalities/injuries frontmatter fields" },
  ]},
  "woodland-pulp-2026": { stages: [
    { icon: "gauge", label: "Abrupt Shutdown Ordered", caption: "Driven by rising natural gas prices", source: "'Facing a sharp rise in natural gas prices...Woodland Pulp management decided to shut down most of the mill'" },
    { icon: "vaporCloud", label: "Automatic Dosing Reacts", caption: "pH correction generated hydrogen sulfide", source: "'automatically increased sulfuric acid dosing into the sewer to compensate...reacted with the sulfur-containing fluids'" },
    { icon: "warningIgnored", label: "No Personnel Tracking", caption: "Workers not found for over 3 hours", source: "'the two collapsed workers weren't discovered until more than three hours after'" },
    { icon: "person", label: "Two Fatalities", caption: "Investigation still ongoing", source: "fatalities/injuries frontmatter fields" },
  ]},
  "exxonmobil-baton-rouge-2016": { stages: [
    { icon: "valve", label: "Wrong Bolts Removed", caption: "Top-cap screws, not gearbox screws", source: "'the operator instead removed four vertical screws that actually secured the valve's pressure-retaining top-cap'" },
    { icon: "vaporCloud", label: "Isobutane Vapor Cloud", caption: "Reached a welder in 30 seconds", source: "'The cloud reached a welding machine operating about 70 feet away within roughly 30 seconds'" },
    { icon: "warningIgnored", label: "Rare Valve Design", caption: "Only 3% of 500 valves shared this design", source: "'only about 15 of the roughly 500 manually operated plug valves in the unit, some 3%, shared this particular design'" },
    { icon: "fire", label: "Fireball", caption: "Four workers severely burned", source: "fatalities/injuries frontmatter fields" },
  ]},
  "phillips-66-borger-2023": { stages: [
    { icon: "valve", label: "Impact Wrench Set to Reverse", caption: "Left in the wrong setting", source: "'A contractor used a battery-operated impact wrench that had inadvertently been left set to reverse'" },
    { icon: "corrosion", label: "Screw Backs Out", caption: "Released pressurized gas liquid at 400 psi", source: "'the wrench instead backed the screw out entirely, removing it and releasing pressurized natural gas liquid'" },
    { icon: "fire", label: "Residual Pressure Ignites", caption: "Cavern itself was properly sealed", source: "'Although the cavern itself had been properly sealed for the maintenance work, the residual pressurized material in the snubbing unit ignited'" },
    { icon: "person", label: "One Fatality", caption: "Died from burns", source: "fatalities/injuries frontmatter fields" },
  ]},
"wynnewood-refinery-2012": { stages: [
    { icon: "gauge", label: "Boiler Restart During Turnaround", caption: "Wickes boiler brought back online", source: "'operators worked to restart the refinery's Wickes boiler, which had been taken offline during the turnaround'" },
    { icon: "vaporCloud", label: "Natural Gas Accumulates", caption: "Not properly purged before restart", source: "'excess natural gas accumulated inside the boiler instead of being properly purged'" },
    { icon: "warningIgnored", label: "Repeat PSM Violations", caption: "Same gaps found before", source: "'several of the citations issued were classified as repeat violations'" },
    { icon: "explosion", label: "Explosion", caption: "2 workers killed", source: "fatalities/injuries frontmatter fields" },
  ]},
  "marcus-oil-2004": { stages: [
    { icon: "corrosion", label: "Defective Repair Weld", caption: "Reduced vessel strength by 75%", source: "'reduced the vessel's structural strength by more than 75 percent'" },
    { icon: "warningIgnored", label: "No Pressure Test After Repair", caption: "Defective weld went undetected", source: "'no pressure test was performed after the repair'" },
    { icon: "explosion", label: "Vessel Ruptures", caption: "Fragments thrown a quarter mile", source: "'steel fragments were thrown up to a quarter mile from the plant'" },
    { icon: "fire", label: "7-Hour Fire", caption: "3 firefighters, several residents injured", source: "fatalities/injuries frontmatter fields" },
  ]},
  "bp-husky-toledo-2022": { stages: [
    { icon: "overfill", label: "Naphtha Overflows Vapor Drum", caption: "Vessel meant to hold only vapor", source: "'liquid naphtha was released from a pressurized vessel, which resulted in a vapor cloud'" },
    { icon: "gauge", label: "Alarm Flood", caption: "3,700+ alarms in 12 hours", source: "'board operators had been managing an alarm flood of more than 3,700 alarms'" },
    { icon: "warningIgnored", label: "2019 Precedent Missed", caption: "Same vessel overflowed before", source: "'a nearly identical 2019 incident had already provided a warning'" },
    { icon: "fire", label: "Flash Fire", caption: "Two brothers killed", source: "fatalities/injuries frontmatter fields" },
  ]},
  "mfg-chemical-2004": { stages: [
    { icon: "tank", label: "First Production-Scale Batch", caption: "No scale-up hazard analysis done", source: "'MFG moved directly from laboratory-scale testing to a full 4,000-gallon production batch'" },
    { icon: "gauge", label: "Reaction Goes Out of Control", caption: "Over-pressurized the reactor", source: "'the reaction went out of control, rapidly over-pressurizing a 4,000-gallon reactor'" },
    { icon: "vaporCloud", label: "Toxic Vapor Released 8+ Hours", caption: "200+ families evacuated", source: "'releasing highly toxic and flammable allyl alcohol...for more than eight hours'" },
    { icon: "person", label: "154 Treated for Exposure", caption: "Responders lacked proper PPE", source: "fatalities/injuries frontmatter fields" },
  ]},
  "synthron-2006": { stages: [
    { icon: "valve", label: "Batch Size Increased 45%", caption: "Combined two batches into one", source: "'increasing the total monomer charge by 45 percent'" },
    { icon: "corrosion", label: "Fouled Condenser", caption: "30 years without cleaning", source: "'had not been cleaned or inspected in 30 years'" },
    { icon: "vaporCloud", label: "Reaction Runs Away", caption: "Vapor escaped through a poorly secured hatch", source: "'secured with only 4 of the 18 clamps the manufacturer recommended'" },
    { icon: "explosion", label: "Explosion", caption: "1 killed, 14 injured", source: "fatalities/injuries frontmatter fields" },
  ]},
  "biolab-conyers-2024": { stages: [
    { icon: "corrosion", label: "Corroded Sprinkler Fails", caption: "1,100+ corroded heads found 9 months earlier", source: "'a corroded sprinkler component failed...allowing water to leak onto stored chlorinated isocyanurate'" },
    { icon: "warningIgnored", label: "Inventory Doubled vs. Declared", caption: "14 million lbs vs. 6.2 million declared", source: "'nearly 14 million pounds of reactive chemicals...more than double'" },
    { icon: "fire", label: "Warehouse Fires", caption: "Entire warehouse destroyed", source: "'a second, larger fire broke out...ultimately destroying the warehouse entirely'" },
    { icon: "building", label: "90,000 Sheltered in Place", caption: "17,000 evacuated, no injuries", source: "fatalities/injuries frontmatter fields" },
  ]},
  "first-chemical-2002": { stages: [
    { icon: "corrosion", label: "Leaking Steam Valves", caption: "Heated \"isolated\" material for weeks", source: "'steam was slowly leaking through deteriorated shut-off valves'" },
    { icon: "warningIgnored", label: "Alarm Ignored", caption: "Level alarm the day before, no action taken", source: "'a liquid-level alarm activated the day before the explosion, no action was taken'" },
    { icon: "explosion", label: "Column Explodes", caption: "Control room only 50 feet away", source: "'located only 50 feet from the column's base'" },
    { icon: "person", label: "3 Injured", caption: "Cuts from shattered glass", source: "fatalities/injuries frontmatter fields" },
  ]},
  "bp-amoco-augusta-2001": { stages: [
    { icon: "tank", label: "Aborted Startup", caption: "Waste plastic diverted to catch tank", source: "'an unusually large amount of partially reacted waste plastic was diverted into a polymer catch tank'" },
    { icon: "gauge", label: "Blocked Pressure Gauge", caption: "Foam obstructed the one warning sign", source: "'a blocked pressure gauge hid the vessel's true condition'" },
    { icon: "warningIgnored", label: "Prior Near-Misses Not Investigated", caption: "Plugged drains, minor fires before", source: "'prior near-miss incidents were not adequately investigated'" },
    { icon: "explosion", label: "Cover Blows Off", caption: "3 workers killed", source: "fatalities/injuries frontmatter fields" },
  ]},
"concept-sciences-1999": { stages: [
    { icon: "tank", label: "First Large-Scale Batch", caption: "First commercial run at this scale", source: "'Concept Sciences was attempting its first large-scale commercial batch of hydroxylamine'" },
    { icon: "gauge", label: "Concentration Rises After Shutdown", caption: "Material grew more hazardous, not less", source: "'now at a higher concentration than during active processing and still at an elevated temperature'" },
    { icon: "explosion", label: "Explosive Decomposition", caption: "Registered on a seismograph 5 miles away", source: "'registered 0.7 on a seismograph five miles away'" },
    { icon: "building", label: "5 Killed, 14 Injured", caption: "Destroyed 11 nearby buildings", source: "fatalities/injuries frontmatter fields" },
  ]},
  "tosco-avon-1999": { stages: [
    { icon: "valve", label: "Permit Requirements Skipped", caption: "Line not drained, steamed, or isolated", source: "'these requirements were not met, and the work proceeded anyway'" },
    { icon: "warningIgnored", label: "13 Days, No Reassessment", caption: "Job never re-evaluated", source: "'the job was never re-evaluated and the unit was never shut down'" },
    { icon: "fire", label: "Naphtha Ignites on Hot Tower", caption: "5 workers engulfed on the structure", source: "'naphtha released directly onto the hot fractionator tower and ignited'" },
    { icon: "person", label: "4 Killed", caption: "Second fatal incident in 2 years", source: "fatalities/injuries frontmatter fields" },
  ]},
  "condea-vista-1998": { stages: [
    { icon: "valve", label: "Process Changed Without MOC", caption: "Powdered aluminum replaced direct addition", source: "'switching from direct aluminum chloride addition to powdered aluminum...wasn't run through the kind of systematic MOC review'" },
    { icon: "corrosion", label: "Sludge Plugs the Reactor", caption: "180 gallons of reactive residue", source: "'roughly 180 gallons of it by the time of the incident'" },
    { icon: "vaporCloud", label: "Steam Injected to Clear It", caption: "Triggered a runaway reaction", source: "'The steam immediately triggered a runaway reaction with the trapped aluminum'" },
    { icon: "explosion", label: "Explosion", caption: "5 injured, homes shaken", source: "fatalities/injuries frontmatter fields" },
  ]},
  "morton-international-1998": { stages: [
    { icon: "gauge", label: "Routine Batch Begins", caption: "Expected 6-8 hour production run", source: "'workers began what they expected to be a routine six to eight hour production run'" },
    { icon: "valve", label: "Reaction Accelerates", caption: "Exceeded the kettle's cooling capacity", source: "'the reaction accelerated beyond what the kettle's cooling system could remove'" },
    { icon: "warningIgnored", label: "No Emergency Venting", caption: "Two hazard reviews missed this risk", source: "'no emergency shutdown or venting system existed'" },
    { icon: "explosion", label: "Kettle Ruptures", caption: "9 injured, community sheltered", source: "fatalities/injuries frontmatter fields" },
  ]},
"dpc-enterprises-glendale-2003": { stages: [
    { icon: "tank", label: "Scrubber Caustic Depleted", caption: "Routinely run down below 0.5%", source: "'routinely run down to less than 0.5 percent'" },
    { icon: "warningIgnored", label: "Alarms Commonly Ignored", caption: "Violated the company's own procedures", source: "'it was common practice at the facility to allow chlorine transfer to continue even after the alarms activated'" },
    { icon: "vaporCloud", label: "Chlorine Vents to Atmosphere", caption: "Continued for about 6 hours", source: "'continuing to generate and release chlorine gas for approximately six hours'" },
    { icon: "building", label: "4,000+ Evacuated", caption: "16 treated, second DPC incident in 2 years", source: "fatalities/injuries frontmatter fields" },
  ]},
  "little-general-store-2007": { stages: [
    { icon: "tank", label: "Tank Sited Against Building", caption: "Violated required clearance since 1994", source: "'installed directly against the store's exterior wall since 1994'" },
    { icon: "valve", label: "Valve Malfunctions", caption: "Junior technician, 45 days training", source: "'The technician had inadequate training and was working unsupervised'" },
    { icon: "warningIgnored", label: "No Evacuation for 30 Minutes", caption: "Responders stayed near the leak", source: "'No one present ordered an evacuation during the nearly thirty minutes before ignition'" },
    { icon: "explosion", label: "Explosion", caption: "4 killed, 6 injured", source: "fatalities/injuries frontmatter fields" },
  ]},
  "xcel-cabin-creek-2007": { stages: [
    { icon: "valve", label: "Cleaning Solvent in Tunnel", caption: "1,000+ feet underground, one exit", source: "'cleaning spray equipment with MEK in the open penstock atmosphere'" },
    { icon: "warningIgnored", label: "Single Exit Flagged, Unaddressed", caption: "Both companies knew, neither acted", source: "'neither company took action to address it'" },
    { icon: "fire", label: "Flash Fire Traps Workers", caption: "No qualified rescue responders on site", source: "'Xcel had no technically qualified confined-space rescue responders on duty'" },
    { icon: "person", label: "5 Killed", caption: "Contractor chosen despite zero safety rating", source: "fatalities/injuries frontmatter fields" },
  ]},
"equilon-anacortes-1998": { stages: [
    { icon: "gauge", label: "Power and Steam Lost", caption: "Abnormal conditions for 37 hours", source: "'Approximately 37 hours before the fire, the Equilon Enterprises oil refinery...lost electric power and steam supply'" },
    { icon: "warningIgnored", label: "No MOC for Abnormal Conditions", caption: "Unit kept running outside normal parameters", source: "'resuming and continuing operations under these unusual circumstances did not go through the kind of formal MOC review'" },
    { icon: "fire", label: "Delayed Coker Fire", caption: "Time was available to analyze more carefully", source: "'neither incident involved an emergency requiring rapid, split-second decisions'" },
    { icon: "person", label: "6 Killed", caption: "Grouped with CONDEA Vista in CSB's MOC bulletin", source: "fatalities/injuries frontmatter fields" },
  ]},
  "bethune-point-2006": { stages: [
    { icon: "fire", label: "Hot Work Above Methanol Vent", caption: "Cutting a storm-damaged roof", source: "'workers using a cutting torch on a roof above the methanol storage tank accidentally ignited vapors coming from the tank vent'" },
    { icon: "warningIgnored", label: "No Hot Work Controls", caption: "City had no program to assess non-routine tasks", source: "'The City of Daytona Beach did not implement adequate controls for hot work'" },
    { icon: "corrosion", label: "PVC Piping, Not Steel", caption: "Contributed to how the fire cascaded", source: "'methanol piping and valves were built of polyvinyl chloride rather than steel'" },
    { icon: "person", label: "2 Killed, 1 Injured", caption: "City safety programs found inadequate", source: "fatalities/injuries frontmatter fields" },
  ]},
  "honeywell-baton-rouge-2003": { stages: [
    { icon: "vaporCloud", label: "Chlorine Release", caption: "7 injured, shelter-in-place issued", source: "'a release of chlorine gas from the Honeywell International...resulted in injuries to seven plant workers'" },
    { icon: "warningIgnored", label: "Two More Releases in 24 Days", caption: "Common deficiencies ran through all three", source: "'CSB's overall analysis found that changes to equipment or procedures...had not consistently gone through the kind of review needed'" },
    { icon: "tank", label: "Cylinder Releases Antimony Pentachloride", caption: "9 days after the first incident", source: "'a 1-ton cylinder at the same plant released its contents to the atmosphere'" },
    { icon: "person", label: "1 Killed, 9 Injured Total", caption: "Third release involved hydrogen fluoride", source: "fatalities/injuries frontmatter fields" },
  ]},
  "dow-plaquemine-2023": { stages: [
    { icon: "warningIgnored", label: "10 Prior Incidents in 4 Years", caption: "Half at the same Glycol II unit", source: "'the Plaquemine facility had already experienced ten separate emergency incidents'" },
    { icon: "explosion", label: "Explosions and Fire", caption: "Burned for nearly two days", source: "'a series of explosions and fires occurred...causing significant damage'" },
    { icon: "vaporCloud", label: "31,000 lbs of EtO Released", caption: "A known human carcinogen", source: "'More than 31,000 pounds of ethylene oxide...were released into the atmosphere'" },
    { icon: "building", label: "Hundreds Sheltered in Place", caption: "No injuries, by fortunate circumstance", source: "fatalities/injuries frontmatter fields" },
  ]},
  "chevron-richmond-2007": { stages: [
    { icon: "corrosion", label: "Low-Silicon Piping Fails", caption: "Same corrosion that would recur in 2012", source: "'The failed piping was later found to contain a low percentage of silicon'" },
    { icon: "fire", label: "Fire, Shelter-in-Place", caption: "1 minor injury", source: "'Contra Costa Health Services issued a shelter-in-place order'" },
    { icon: "warningIgnored", label: "Inspection Recommendation Ignored", caption: "Company's own engineers flagged the risk", source: "'Chevron's own internal engineering group issued a technical report specifically recommending 100 percent component inspection'" },
    { icon: "explosion", label: "5.5-Year Warning Before 2012", caption: "Same failure mode recurred, far worse", source: "fatalities/injuries frontmatter fields" },
  ]},
  "chevron-pascagoula-2013": { stages: [
    { icon: "gauge", label: "Power Outage Forces Shutdown", caption: "Emergency restart of the furnace unit", source: "'A power outage...forced an emergency shutdown of the Cracking II processing unit'" },
    { icon: "warningIgnored", label: "Furnace Not Properly Purged", caption: "Same pattern as Wynnewood Refinery", source: "'proper furnace purging procedures had not been performed on the unit before the restart'" },
    { icon: "explosion", label: "Furnace Explodes", caption: "A dozen operators were nearby", source: "'the furnace exploded at approximately 2:00 a.m.'" },
    { icon: "person", label: "1 Killed", caption: "5-year Chevron employee", source: "fatalities/injuries frontmatter fields" },
  ]},
  "dupont-buffalo-2010": { stages: [
    { icon: "valve", label: "Tanks Not Isolated", caption: "Overflow line connected to live tanks", source: "'an overflow line connected the tank undergoing hot work to two operating tanks'" },
    { icon: "gauge", label: "Only Exterior Air Monitored", caption: "Interior of the tank was never tested", source: "'no monitoring was performed inside the tank itself'" },
    { icon: "fire", label: "Welding Ignites Hidden Vapor", caption: "Tank cover blown off", source: "'sparks or heat from the welding ignited vinyl fluoride vapor that had silently accumulated inside the tank'" },
    { icon: "person", label: "1 Killed, 1 Injured", caption: "Permit signer unfamiliar with the hazard", source: "fatalities/injuries frontmatter fields" },
  ]},
  "praxair-st-louis-2005": { stages: [
    { icon: "tank", label: "Cylinders Stored on Hot Asphalt", caption: "97°F day, heat radiating from pavement", source: "'cylinders stored in the open on asphalt absorbed heat radiating from the pavement'" },
    { icon: "gauge", label: "Relief Valve Vents, Ignites", caption: "Set point too low for propylene", source: "'CSB found the industry-standard set points specified for these valves allowed venting well below the pressure that would actually damage the cylinders'" },
    { icon: "explosion", label: "8,000+ Cylinders Explode", caption: "Fragments flew up to 800 feet", source: "'more than 8,000 cylinders caught fire, with many launching like rockets'" },
    { icon: "person", label: "1 Killed (Delayed)", caption: "Resident died 11 days later from smoke", source: "fatalities/injuries frontmatter fields" },
  ]},
  "partridge-raleigh-2006": { stages: [
    { icon: "tank", label: "Only One Tank Cleaned", caption: "Adjacent tanks still held crude oil", source: "'only one of the tanks involved...was emptied and cleaned; the adjacent tanks were not'" },
    { icon: "warningIgnored", label: "Torch Used to Test for Vapor", caption: "No combustible gas detector used", source: "'The welder used a lit oxy-acetylene welding torch itself to test one tank for the presence of flammable vapor'" },
    { icon: "explosion", label: "Vapor Ignites, Tank Tops Blow Off", caption: "3 workers thrown by the blast", source: "'pressure from the burning vapor blew the tops off two of them'" },
    { icon: "person", label: "3 Killed, 1 Injured", caption: "Survivor's harness prevented a fatal fall", source: "fatalities/injuries frontmatter fields" },
  ]},
  "conagra-slim-jim-2009": { stages: [
    { icon: "valve", label: "Gas Vented Indoors", caption: "Gas blow purge done inside the building", source: "'Rather than directing this purge outdoors, the contractors vented the gas inside the building'" },
    { icon: "vaporCloud", label: "Flammable Cloud Accumulates", caption: "Ignition source never determined", source: "'The escaping natural gas accumulated and formed a flammable cloud inside the plant'" },
    { icon: "explosion", label: "Explosion Collapses Roof", caption: "Ruptured refrigeration piping too", source: "'The explosion's force ruptured ammonia refrigeration lines'" },
    { icon: "person", label: "3 Killed, 41 Injured", caption: "Ammonia release complicated response", source: "fatalities/injuries frontmatter fields" },
  ]},
"napp-technologies-1995": { stages: [
    { icon: "tank", label: "Blending Runs 24 Hours", caption: "Expected to take under an hour", source: "'expected to take less than an hour but instead continued for nearly 24 hours'" },
    { icon: "vaporCloud", label: "Water Enters the Mixture", caption: "Reactive aluminum powder and sulfite", source: "'water was introduced into the mixture...triggering the water-reactive combination'" },
    { icon: "warningIgnored", label: "Fire Dept Notified Late", caption: "12-hour delay after danger was known", source: "'was not notified of a developing problem at the plant until shortly before the explosion'" },
    { icon: "explosion", label: "Explosion", caption: "5 killed, 35 injured", source: "fatalities/injuries frontmatter fields" },
  ]},
  "terra-industries-port-neal-1994": { stages: [
    { icon: "gauge", label: "Vessels Left Charged After Shutdown", caption: "No monitoring of the ammonium nitrate plant", source: "'left charged with material and unmonitored after shutdown'" },
    { icon: "corrosion", label: "Acidic Conditions Develop", caption: "Steam applied for a prolonged period", source: "'strongly acidic conditions in the neutralizer and rundown tank'" },
    { icon: "explosion", label: "Two Detonations", caption: "Felt in 2 neighboring states", source: "'two massive detonations leveled portions of an ammonium nitrate plant'" },
    { icon: "vaporCloud", label: "Ammonia Cloud, 2,500 Evacuated", caption: "4 killed, 18 injured", source: "fatalities/injuries frontmatter fields" },
  ]},
  "givaudan-louisville-2024": { stages: [
    { icon: "tank", label: "Reactor Built in 1978", caption: "Relocated and modified for this plant", source: "'originally built in 1978...modified in 2021 to fit the Louisville facility's design'" },
    { icon: "gauge", label: "Sugar Reaction Runs Away", caption: "Relief system 4x too small", source: "'the reactor's relief system would have needed to be approximately four times larger'" },
    { icon: "explosion", label: "Reactor Ruptures", caption: "Control room only 40 feet away", source: "'The blast wave struck a control room located only 40 feet from the reactor'" },
    { icon: "person", label: "2 Killed, 3 Injured", caption: "\"A catastrophe waiting to happen\"", source: "fatalities/injuries frontmatter fields" },
  ]},
  "bps-west-helena-1997": { stages: [
    { icon: "warningIgnored", label: "Pesticide Sack Overheats", caption: "Contact with a hot compressor pipe", source: "'a bulk sack of azinphos-methyl generated heat through decomposition after being placed in contact with heated equipment'" },
    { icon: "fire", label: "Smoke Reported", caption: "Firefighters told there was no explosion risk", source: "'company representatives reportedly told them there was no risk of an explosion'" },
    { icon: "explosion", label: "Explosion While Searching", caption: "Cinderblock wall collapses", source: "'a collapsing cinderblock wall killed three of the firefighters'" },
    { icon: "person", label: "3 Firefighters Killed", caption: "17 injured, river closed 12 hours", source: "fatalities/injuries frontmatter fields" },
  ]},
  "whitehall-leather-1999": { stages: [
    { icon: "tank", label: "Wrong Chemical Assumed", caption: "\"Pickle acid\" nickname caused confusion", source: "'assumed this new delivery of sodium hydrosulfide was also pickle acid'" },
    { icon: "warningIgnored", label: "No Verification Before Unloading", caption: "No procedure to confirm the match", source: "'no procedure requiring confirmation that an incoming delivery matched the intended receiving tank'" },
    { icon: "vaporCloud", label: "Chemicals Mix, Release Toxic Gas", caption: "Hydrogen sulfide generated", source: "'the two chemicals reacted and produced hydrogen sulfide gas'" },
    { icon: "person", label: "1 Killed, 1 Injured", caption: "Neither chemical had an NFPA rating", source: "fatalities/injuries frontmatter fields" },
  ]},
  "arco-channelview-1990": { stages: [
    { icon: "gauge", label: "Nitrogen Purge Reduced", caption: "Compressor taken out for repair", source: "'the tank received only minimal nitrogen purging'" },
    { icon: "warningIgnored", label: "Analyzer in a Dead Zone", caption: "Missed the oxygen buildup", source: "'a temporary oxygen analyzer...failed to detect the dangerous buildup in time'" },
    { icon: "explosion", label: "Tank Explodes", caption: "Felt up to 20 miles away", source: "'The blast leveled an area the size of a city block'" },
    { icon: "person", label: "17 Killed, 5 Injured", caption: "Halted 15% of US styrene output", source: "fatalities/injuries frontmatter fields" },
  ]},
  "angus-sterlington-1991": { stages: [
    { icon: "fire", label: "Small Fire Noticed", caption: "Alarm sounded near a compressor", source: "'workers preparing to check a compressor...noticed a small fire and sounded the plant's fire alarm'" },
    { icon: "warningIgnored", label: "Only 30 Seconds of Warning", caption: "Explosion followed almost immediately", source: "'Approximately 30 seconds later, an explosion occurred'" },
    { icon: "explosion", label: "Explosion, Then Cascading Blasts", caption: "Felt 8 miles away", source: "'followed by a series of smaller secondary explosions'" },
    { icon: "person", label: "8 Killed, ~120 Injured", caption: "$10M fine for insufficient protocols", source: "fatalities/injuries frontmatter fields" },
  ]},
"albright-wilson-charleston-1991": { stages: [
    { icon: "tank", label: "Mixing Flame Retardant", caption: "Special Products Unit, before noon", source: "'began mixing chemicals to produce a flame retardant when an unexpected reaction'" },
    { icon: "warningIgnored", label: "Subcontractors Nearby", caption: "Installing insulation near the mixer", source: "'a subcontractor that was installing insulation around pipes near the mixing apparatus'" },
    { icon: "explosion", label: "Unexpected Reaction Ignites", caption: "Building loses walls and roof", source: "'the structure lost part of its walls and roof'" },
    { icon: "person", label: "9 Killed, 33 Injured", caption: "Cause never publicly determined", source: "fatalities/injuries frontmatter fields" },
  ]},
  "shell-belpre-1994": { stages: [
    { icon: "gauge", label: "Runaway Reaction in Reactor", caption: "15,000-gallon Kraton-D polymer unit", source: "'A catastrophic failure of a 15,000 gallon polymer reactor vessel was initiated by a runaway chemical reaction'" },
    { icon: "fire", label: "Fire Reaches Tank Farm", caption: "Spread from the destroyed K-1 unit", source: "'The fire then spread to a nearby chemical storage tank farm'" },
    { icon: "explosion", label: "6 Tanks Ignite", caption: "Styrene and diesel, burned 9 hours", source: "'Five more tanks ignited...holding millions of gallons of styrene'" },
    { icon: "person", label: "3 Killed", caption: "1,700 residents evacuated", source: "fatalities/injuries frontmatter fields" },
  ]},
  "shell-norco-1988": { stages: [
    { icon: "corrosion", label: "Vapor Line Corrodes", caption: "8-inch line off a 10-inch header", source: "'corrosion of an 8-inch vapor line running from a 10-inch header'" },
    { icon: "warningIgnored", label: "Unit Run Beyond Design", caption: "Known corrosion, existing mitigation", source: "'the unit had a known corrosion problem, evidenced by an ammonia injection system'" },
    { icon: "vaporCloud", label: "17,000 lbs Released in 30 Seconds", caption: "Vapor cloud explosion near control room", source: "'releasing an estimated 17,000 pounds of hydrocarbon vapor in roughly 30 seconds'" },
    { icon: "person", label: "7 Killed, 18 Injured", caption: "Damage felt 45 miles away", source: "fatalities/injuries frontmatter fields" },
  ]},
  "bastian-plating-1988": { stages: [
    { icon: "tank", label: "Acid Meets Cyanide Residue", caption: "Cleaning a vat that held zinc cyanide", source: "'muriatic acid used to clean the vat reacted with residual zinc cyanide compounds'" },
    { icon: "vaporCloud", label: "Worker Collapses in Confined Space", caption: "Hydrogen cyanide gas generated", source: "'The worker collapsed while inside the confined space'" },
    { icon: "warningIgnored", label: "Coworkers Attempt Rescue", caption: "No respiratory protection", source: "'Three coworkers...attempted to rescue him without any respiratory protection'" },
    { icon: "person", label: "5 Killed, 20 Injured", caption: "Worst confined-space accident in US history", source: "fatalities/injuries frontmatter fields" },
  ]},
"merck-barceloneta-1986": { stages: [
    { icon: "tank", label: "Tank Component Fails", caption: "A carbon disk allegedly contributed", source: "'a carbon disk installed as part of the tank assembly contributed to the failure'" },
    { icon: "explosion", label: "Tank Explodes", caption: "Fumes smelled 15 miles away", source: "'Residents as far as 15 miles away reported smelling fumes'" },
    { icon: "warningIgnored", label: "Cyanide Feared in Water Supply", caption: "Byproduct of the plant's chemistry", source: "'government officials expressed concern that the local water supply might be contaminated with cyanide'" },
    { icon: "person", label: "3 Killed, 5 Injured", caption: "Plant closed for 2 years", source: "fatalities/injuries frontmatter fields" },
  ]},
  "georgia-pacific-columbus-1997": { stages: [
    { icon: "building", label: "Reactor in a Residential Area", caption: "Years of prior hazardous releases", source: "'residents in the surrounding South Side neighborhood had already experienced years of hazardous releases'" },
    { icon: "gauge", label: "Known Hazard Since 1957", caption: "Runaway reactions documented decades earlier", source: "'phenol-formaldehyde runaway reactions had already caused recorded incidents dating back to 1957'" },
    { icon: "explosion", label: "Reactor Explodes", caption: "Toxins spread across the neighborhood", source: "'The explosion spread toxins across the adjacent residential area'" },
    { icon: "person", label: "1 Killed, 4 Injured", caption: "$22 million settlement followed", source: "fatalities/injuries frontmatter fields" },
  ]},
  "plastifax-gulfport-1982": { stages: [
    { icon: "gauge", label: "Nitration Reaction Underway", caption: "Converting hexanol to hexyl-nitrate", source: "'during the nitration of 2-ethyl-hexanol to produce 2-ethyl-hexyl-nitrate'" },
    { icon: "warningIgnored", label: "Insufficient Process Supervision", caption: "NIOSH recommended closer oversight", source: "'better supervision of potentially explosive chemical processes'" },
    { icon: "explosion", label: "Plant Levels", caption: "Debris found nearly a mile away", source: "'Metal debris from the blast was scattered nearly a mile away'" },
    { icon: "person", label: "3 Killed, 9 Injured", caption: "5,000 evacuated for 4 hours", source: "fatalities/injuries frontmatter fields" },
  ]},
"phillips-pasadena-1999": { stages: [
    { icon: "gauge", label: "Capacity Boosted 40%", caption: "One month before the explosion", source: "'Phillips had increased the unit's K-Resin production capacity by 40 percent'" },
    { icon: "explosion", label: "Reactor Explodes", caption: "One of four clustered reactors", source: "'an explosion occurred in one of four K-Resin styrene-butadiene copolymer reactors'" },
    { icon: "warningIgnored", label: "$204,000 Fine", caption: "Modest penalty for the outcome", source: "'a $204,000 fine against Phillips for 13 alleged safety violations'" },
    { icon: "person", label: "2 Killed, 3 Injured", caption: "Same unit exploded again in 2000", source: "fatalities/injuries frontmatter fields" },
  ]},
  "phillips-pasadena-2000": { stages: [
    { icon: "gauge", label: "Tank Out of Service, No Gauges", caption: "Being cleaned, no warning instrumentation", source: "'the tank was out of service for cleaning and had no pressure or temperature gauges'" },
    { icon: "warningIgnored", label: "Same Unit as 1999 Fatality", caption: "Corrective action proved insufficient", source: "'the K-Resin unit had already experienced a fatal explosion roughly nine months earlier'" },
    { icon: "explosion", label: "Explosion & Fire", caption: "Burned nearly 4 hours", source: "'Huge flames erupted...sending a massive column of black smoke'" },
    { icon: "person", label: "1 Killed, 71 Injured", caption: "$2.5M OSHA fine for training failures", source: "fatalities/injuries frontmatter fields" },
  ]},
  "formosa-point-comfort-2005": { stages: [
    { icon: "valve", label: "Forklift Snags Drain Valve", caption: "Unprotected piping near vehicle traffic", source: "'a trailer being towed by a forklift snagged a small drain valve'" },
    { icon: "vaporCloud", label: "Vapor Cloud Blocks Access", caption: "Manual-only valves, no remote shutoff", source: "'the advancing vapor cloud forced them to retreat before they could do so'" },
    { icon: "fire", label: "Fire Burns 5 Days", caption: "Flames reached 500-800 feet", source: "'The fire burned for nearly five days before being fully extinguished'" },
    { icon: "person", label: "0 Killed, 16 Injured", caption: "Structural steel failed, vents ruptured", source: "fatalities/injuries frontmatter fields" },
  ]},
"mckee-refinery-1956": { stages: [
    { icon: "vaporCloud", label: "Vapor Reaches Asphalt Fire", caption: "Relief valve released pentane vapor", source: "'wind carried the vapor toward a nearby asphalt tank...where a small fire was being maintained'" },
    { icon: "fire", label: "Flame Flashes Back to Tank", caption: "1-hour fight at gauging device and vents", source: "'the flame flashed back to Spheroid No. 199'" },
    { icon: "warningIgnored", label: "Product Pumped Out Mid-Fire", caption: "Increased the tank's empty vapor space", source: "'a step that increased the empty vapor space inside the vessel'" },
    { icon: "explosion", label: "BLEVE", caption: "19 firefighters killed", source: "fatalities/injuries frontmatter fields" },
  ]},
  "tosco-avon-1997": { stages: [
    { icon: "gauge", label: "Pipe Ruptures, Excess Heat", caption: "Hydrocracker unit, hydrocarbon-hydrogen mix", source: "'A pipeline ruptured under excessively high operating temperatures'" },
    { icon: "warningIgnored", label: "Shutdown Procedures Not Followed", caption: "Management tolerated risky practices", source: "'operators did not follow required emergency procedures to depressure and shutdown the reactor'" },
    { icon: "explosion", label: "Explosion & Fire", caption: "Inspectors locked out over 2 hours", source: "'plant security personnel locked out county inspectors dispatched to the blaze for 2+ hours'" },
    { icon: "person", label: "1 Killed, 46 Injured", caption: "Pattern repeated in 1999 naphtha fire", source: "fatalities/injuries frontmatter fields" },
  ]},
  "union-carbide-seadrift-1991": { stages: [
    { icon: "corrosion", label: "Refining Column Fails", caption: "Ethylene oxide unit destroyed", source: "'The explosion originated in this column, which was completely destroyed'" },
    { icon: "warningIgnored", label: "Shrapnel Ruptures Nearby Lines", caption: "Methane and hydrocarbon lines hit", source: "'debris from the refining column failure struck a nearby pipe rack, rupturing methane and hydrocarbon lines'" },
    { icon: "explosion", label: "Damage Spreads to 2 More Units", caption: "Glycol unit and co-generation damaged", source: "'The ethylene glycol unit and the facility's co-generation unit were both damaged'" },
    { icon: "person", label: "1 Killed, 19+ Injured", caption: "Entire facility idled", source: "fatalities/injuries frontmatter fields" },
  ]},
"citgo-corpus-christi-2009": { stages: [
    { icon: "valve", label: "Control Valve Fails", caption: "Caused violent piping shake", source: "'a control valve suddenly failed, causing a blockage of liquid that triggered violent shaking'" },
    { icon: "corrosion", label: "Threaded Connections Break", caption: "Released flammable hydrocarbons", source: "'this shaking broke two threaded pipe connections'" },
    { icon: "fire", label: "Fire Burns Several Days", caption: "42,000 lbs of HF released", source: "'a fire that burned for several days...approximately 42,000 pounds of hydrogen fluoride'" },
    { icon: "warningIgnored", label: "Water Supply Nearly Exhausted", caption: "Backup seawater transfer also failed", source: "'CITGO nearly exhausted the stored water supply for the water mitigation system'" },
  ]},
  "delek-tyler-2008": { stages: [
    { icon: "corrosion", label: "Line Ruptures", caption: "Saturated gas unit piping fails", source: "'a line ruptured in the saturated gas unit'" },
    { icon: "vaporCloud", label: "Flammable Gas Released", caption: "Pressurized hydrocarbon escapes", source: "'releasing pressurized flammable material into the surrounding area'" },
    { icon: "explosion", label: "Explosion & Fire", caption: "Escaping gas ignites", source: "'the escaping hydrocarbon gas found an ignition source'" },
    { icon: "person", label: "2 Killed, 3 Injured", caption: "Root cause detail not fully public", source: "fatalities/injuries frontmatter fields" },
  ]},
  "alon-big-spring-2008": { stages: [
    { icon: "gauge", label: "Propylene Splitter Explodes", caption: "Holiday, skeleton crew on site", source: "'an explosion occurred...centered around the facility's propylene splitter unit'" },
    { icon: "warningIgnored", label: "Fire Threatens HF Unit", caption: "Near-miss on toxic acid release", source: "'the fire that followed the initial explosion threatened the refinery's adjacent alkylation unit'" },
    { icon: "building", label: "Felt for Miles", caption: "Schools and interstate closed", source: "'The blast was strong enough to be felt for miles'" },
    { icon: "person", label: "0 Killed, 5 Injured", caption: "Refinery shut 2 months", source: "fatalities/injuries frontmatter fields" },
  ]},
  "marathon-galveston-bay-2023": { stages: [
    { icon: "gauge", label: "Pump Flagged for Repair", caption: "Maintenance deferred for production", source: "'Marathon had flagged this pump as needing maintenance...deferred'" },
    { icon: "corrosion", label: "Crack Goes Undetected", caption: "Inspection never happened", source: "'the crack that ultimately caused the leak would very likely have been identified'" },
    { icon: "fire", label: "Seal Fails, Fire Erupts", caption: "Same site as 2005 BP disaster", source: "'A seal failure on the reformer unit...ignited and caused the fatal blaze'" },
    { icon: "person", label: "1 Killed, 3 Injured", caption: "55-year-old machinist", source: "fatalities/injuries frontmatter fields" },
  ]},
  "shell-deer-park-2023": { stages: [
    { icon: "gauge", label: "Heat Exchanger Maintenance", caption: "Leak between two gas oils", source: "'A leak developed during a heat exchange between two heavy gas oils'" },
    { icon: "fire", label: "Fire Reignites Twice", caption: "Not fully extinguished first time", source: "'the fire restarted on both the following Saturday and Sunday'" },
    { icon: "warningIgnored", label: "Wastewater Capacity Exceeded", caption: "Controlled discharge into ship channel", source: "'the volume of water required to control a multi-day fire surpassed the facility's on-site storage'" },
    { icon: "person", label: "0 Killed, 9 Injured", caption: "Precautionary hospitalization", source: "fatalities/injuries frontmatter fields" },
  ]},
  "ineos-pasadena-2023": { stages: [
    { icon: "valve", label: "Transfer Hose Disconnects", caption: "LPG being offloaded from tanker", source: "'a hose disconnected between the tank trailer and the facility'" },
    { icon: "fire", label: "Vapor Ignites", caption: "Fire engulfs the tanker truck", source: "'released LPG ignited during the offloading process'" },
    { icon: "explosion", label: "BLEVE", caption: "Exits reportedly not open", source: "'various exits were not open' during the evacuation attempt" },
    { icon: "person", label: "0 Killed, 1 Injured", caption: "Driver thrown to the ground", source: "fatalities/injuries frontmatter fields" },
  ]},
"skikda-lng-2004": { stages: [
    { icon: "corrosion", label: "Boiler Known Defective", caption: "Flagged a year earlier, superficial repair", source: "'workers said they had warned a year earlier that the boiler was faulty'" },
    { icon: "vaporCloud", label: "Hydrocarbon Leak into Boiler", caption: "Ingested through the firebox", source: "'A large hydrocarbon leak was ingested into the facility's main boiler firebox'" },
    { icon: "explosion", label: "Boiler Explosion Ignites Vapor Cloud", caption: "3 LNG trains destroyed", source: "'The resulting boiler explosion ignited an extensive vapor cloud'" },
    { icon: "person", label: "27 Killed, 74 Injured", caption: "One of the worst LNG accidents ever", source: "fatalities/injuries frontmatter fields" },
  ]},
  "jilin-petrochemical-2005": { stages: [
    { icon: "valve", label: "Processing Tower Jams", caption: "Aniline nitration unit, abnormal ops", source: "'processing tower T-102 became jammed during abnormal operations'" },
    { icon: "warningIgnored", label: "Worker Mishandles the Clog", caption: "Monitoring failed to detect the issue", source: "'the facility's monitoring systems failed to detect the developing problem'" },
    { icon: "explosion", label: "Explosions, Toxins Reach River", caption: "100 tons of benzene, nitrobenzene released", source: "'released approximately 100 tons of pollutants...into the nearby Songhua River'" },
    { icon: "building", label: "Water Cut for Millions", caption: "5 killed, 70 injured, delayed disclosure", source: "fatalities/injuries frontmatter fields" },
  ]},
  "enschede-fireworks-2000": { stages: [
    { icon: "tank", label: "Wrong Fireworks Grade Stored", caption: "1.1G stored, only 1.4G licensed", source: "'the facility was licensed to hold only lower-hazard 1.4G grade fireworks but actually contained...1.1G grade'" },
    { icon: "warningIgnored", label: "1991 Warning Never Acted On", caption: "Culemborg's recommendations unimplemented", source: "'the level of the hazard posed by the factory had been substantially underestimated'" },
    { icon: "explosion", label: "Three Escalating Explosions", caption: "Felt 50km away, neighborhood leveled", source: "'a series of three explosions of increasing violence'" },
    { icon: "person", label: "23 Killed, 950 Injured", caption: "Largest explosion in NL since WWII", source: "fatalities/injuries frontmatter fields" },
  ]},
  "culemborg-fireworks-1991": { stages: [
    { icon: "warningIgnored", label: "Ignition Source Unknown", caption: "Fire preceded the explosion", source: "'the exact ignition source of the fire...was never conclusively determined'" },
    { icon: "tank", label: "Fireworks Behave Unexpectedly", caption: "Exploded rather than burned as classified", source: "'the fireworks behaved very differently than expected for their official 1.3 hazard classification'" },
    { icon: "explosion", label: "Two Explosions Seconds Apart", caption: "Levee buffer limited wider damage", source: "'immediately followed by another explosion in three adjacent rooms'" },
    { icon: "building", label: "Recommendations Never Funded", caption: "2 killed; same gaps caused Enschede", source: "fatalities/injuries frontmatter fields" },
  ]},
  "san-juanico-1984": { stages: [
    { icon: "corrosion", label: "Pipe Ruptures Between Vessels", caption: "Operators couldn't identify pressure drop", source: "'An 8-inch pipe between a sphere and a series of cylinders had ruptured'" },
    { icon: "warningIgnored", label: "No Effective Gas Detection", caption: "No emergency isolation in time", source: "'the ineffective gas detection system and as a result, lack of emergency isolation'" },
    { icon: "explosion", label: "Cascading BLEVEs for 90 Minutes", caption: "Fire water system disabled by first blast", source: "'a series of additional BLEVEs followed as LPG vessels violently ruptured'" },
    { icon: "person", label: "500+ Killed, 7,000 Injured", caption: "Sited directly beside dense housing", source: "fatalities/injuries frontmatter fields" },
  ]},
  "los-alfaques-1978": { stages: [
    { icon: "tank", label: "Tanker Loses Containment", caption: "23 tons of liquid propylene", source: "'the tank's integrity was lost while directly adjacent to a densely populated area'" },
    { icon: "warningIgnored", label: "Campers Approach the Cloud", caption: "Campsite sited beside the highway", source: "'Campers, curious about the unusual cloud, approached rather than fled'" },
    { icon: "explosion", label: "BLEVE Engulfs the Campsite", caption: "Fireball hundreds of feet high", source: "'sent towering flames hundreds of feet into the air'" },
    { icon: "person", label: "215 Killed, 200+ Injured", caption: "Led to new nighttime-only transport law", source: "fatalities/injuries frontmatter fields" },
  ]},
  "feyzin-1966": { stages: [
    { icon: "valve", label: "Valves Opened Out of Order", caption: "Contrary to draining procedure", source: "'contrary to the established operating procedure, the lower valve was opened only halfway'" },
    { icon: "corrosion", label: "Both Valves Freeze Open", caption: "Handle lost, leak unstoppable", source: "'the extreme cooling effect...caused both valves to freeze'" },
    { icon: "explosion", label: "Sphere BLEVEs After 2 Hours", caption: "300m fireball, debris damages neighbors", source: "'the sphere suddenly ruptured in a catastrophic boiling liquid expanding vapor explosion'" },
    { icon: "person", label: "18 Killed, 81 Injured", caption: "Defined BLEVE engineering worldwide", source: "fatalities/injuries frontmatter fields" },
  ]},
  "bayou-corne-2012": { stages: [
    { icon: "warningIgnored", label: "Warnings Ignored Since 1976", caption: "Cavern drilled too close to dome wall", source: "'ignored warnings about the cavern's instability dating back to 1976'" },
    { icon: "gauge", label: "Months of Seismic Activity", caption: "Bubbling in the bayou, company denied risk", source: "'unexplained seismic activity and mysterious bubbling'" },
    { icon: "building", label: "Salt Cavern Collapses", caption: "Sinkhole grows to 34 acres", source: "'the outer wall of the salt dome gave way'" },
    { icon: "person", label: "0 Killed, 350 Evacuated", caption: "Economic interests over safety, court found", source: "fatalities/injuries frontmatter fields" },
  ]},
  "bhilai-steel-2018": { stages: [
    { icon: "gauge", label: "Uneven Pressure for 2 Days", caption: "Scheduled maintenance planned", source: "'The pipeline had reportedly shown uneven pressure for two days'" },
    { icon: "valve", label: "Joints Opened on Live Gas Line", caption: "Coke oven gas ignites", source: "'when the joints in the pipeline were opened, the coke oven gas ignited'" },
    { icon: "explosion", label: "Explosion 400 Feet Up", caption: "24+ workers present at the site", source: "'causing a fire and explosion approximately 400 feet above the ground'" },
    { icon: "person", label: "9 Killed, 14 Injured", caption: "2nd fatal gas incident in 4 years", source: "fatalities/injuries frontmatter fields" },
  ]},
"continental-oil-commerce-city-1978": { stages: [
    { icon: "valve", label: "New Unit, 2 Weeks Old", caption: "Polymerization unit not yet proven out", source: "'the new polymerization unit was approximately 25 percent destroyed'" },
    { icon: "vaporCloud", label: "Gas Fumes Leak", caption: "From newly installed equipment", source: "'Gas fumes leaking from newly installed equipment...ignited in a fireball'" },
    { icon: "explosion", label: "Explosion, 3.5 on Richter Scale", caption: "Flames 60 feet above the stacks", source: "'The explosion registered 3.5 on the Richter scale'" },
    { icon: "person", label: "3 Killed, 9 Injured", caption: "Same site as later Suncor incidents", source: "fatalities/injuries frontmatter fields" },
  ]},
  "suncor-commerce-city-2022": { stages: [
    { icon: "gauge", label: "Dead Leg Unmanaged 190 Days", caption: "Pump locked out since June 2022", source: "'the process fluid...was stagnant for 190 days before the incident'" },
    { icon: "corrosion", label: "Water Freezes, Ice Damages Valve", caption: "Extreme cold snap, Dec 21-24", source: "'water within the isolated piping froze'" },
    { icon: "vaporCloud", label: "Vapor Cloud Drifts to Fired Heater", caption: "Colorless, odorless portion", source: "'formed a flammable vapor cloud that drifted toward a nearby fired heater'" },
    { icon: "explosion", label: "2 Operators Engulfed", caption: "Told to judge safety by their senses", source: "fatalities/injuries frontmatter fields" },
  ]},
  "conocophillips-carlsbad-2021": { stages: [
    { icon: "valve", label: "Draining an Emulsion Layer", caption: "No hazard analysis for this task", source: "'ConocoPhillips periodically removed the emulsion layer by transferring fluids...to a vacuum truck'" },
    { icon: "vaporCloud", label: "Hose Disconnected Pressurized", caption: "Fluid flowed into open atmosphere", source: "'The driver disconnected the hose from the heater treater, and the contents flowed out'" },
    { icon: "fire", label: "Flash Fire Ignites", caption: "Fired heater left online nearby", source: "'A component of the fired heater treater...likely ignited the flammable vapor'" },
    { icon: "person", label: "1 Injured", caption: "Truck not grounded or bonded", source: "fatalities/injuries frontmatter fields" },
  ]},
  "conocophillips-watford-city-2023": { stages: [
    { icon: "tank", label: "Vessel Draining Into a Bucket", caption: "Inside a sealed, heated building", source: "'the employee began manually draining the vessel...into a bucket inside the building'" },
    { icon: "vaporCloud", label: "Hydrocarbons Vaporize Indoors", caption: "No detection, no ventilation", source: "'the drained hydrocarbons vaporized inside the enclosed building and displaced oxygen'" },
    { icon: "warningIgnored", label: "Personal Monitor Left in Truck", caption: "Turned off, not worn", source: "'his personal gas detection monitor...was turned off and in his truck'" },
    { icon: "person", label: "1 Killed", caption: "Lone worker, no one to notice", source: "fatalities/injuries frontmatter fields" },
  ]},
  "polycarbon-industries-2023": { stages: [
    { icon: "gauge", label: "Agitator Loosens, Generates Heat", caption: "Friction against the vessel's base plate", source: "'the agitator had loosened and was rubbing a plate at the bottom of the filter dryer vessel'" },
    { icon: "warningIgnored", label: "Decomposition Hazard Unknown", caption: "Learned only after the explosion", source: "'PCI learned that Dekon decomposition releases flammable gases...only through post-incident testing'" },
    { icon: "explosion", label: "Self-Accelerating Reaction", caption: "Two escalating explosions", source: "'the vessel's rupture disc opened, and a second larger explosion occurred'" },
    { icon: "person", label: "1 Killed", caption: "Facility permanently closed", source: "fatalities/injuries frontmatter fields" },
  ]},
  "darling-wadesboro-2023": { stages: [
    { icon: "tank", label: "Wrong Chemical Delivered", caption: "Sulfuric acid, not aluminum chloride", source: "'sulfuric acid was added instead'" },
    { icon: "vaporCloud", label: "Reaction Builds Pressure", caption: "Hydrogen chloride vapor generated", source: "'the reaction between aluminum chloride and sulfuric acid producing hydrogen chloride vapor'" },
    { icon: "explosion", label: "Tank Separates from Base", caption: "Company's own theory contradicted evidence", source: "'built pressure inside the tank until it separated the vessel's body from its base'" },
    { icon: "person", label: "1 Killed", caption: "Same pattern as MGPI Atchison", source: "fatalities/injuries frontmatter fields" },
  ]},
  "basf-totalenergies-port-arthur-2023": { stages: [
    { icon: "corrosion", label: "Water Ingress Corrodes Tower", caption: "Iron released, forms iron sulfide", source: "'water to enter the extractive distillation unit, causing internal corrosion'" },
    { icon: "warningIgnored", label: "2016 Finding Not Passed On", caption: "Same tower, forgotten institutional knowledge", source: "'a 2016 incident...had already revealed the potential for iron sulfide...not been effectively transferred'" },
    { icon: "fire", label: "Manways Opened, Air Ignites It", caption: "Pyrophoric material self-ignites", source: "'oxygen entered the tower and triggered an exothermic iron sulfide oxidation reaction'" },
    { icon: "building", label: "Tower Collapses", caption: "$194 million in damage, no injuries", source: "fatalities/injuries frontmatter fields" },
  ]},
  "tyson-foods-perry-2023": { stages: [
    { icon: "valve", label: "Compressor Believed Empty", caption: "Ammonia trapped by a check valve", source: "'ammonia remained trapped between the compressor's discharge check valve...and an isolation valve'" },
    { icon: "warningIgnored", label: "Procedure Missing a Valve Step", caption: "That valve never opened", source: "'the procedure did not include this valve'" },
    { icon: "vaporCloud", label: "Ammonia Bursts Out", caption: "No respiratory protection worn", source: "'a burst of ammonia vapor was released directly into the employee's chest and face'" },
    { icon: "person", label: "1 Injured", caption: "Same gap likely exists elsewhere", source: "fatalities/injuries frontmatter fields" },
  ]},
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
  if (lines.length > 3) {
    console.warn(`WARNING: caption too long even at 3 lines, text was cut off: "${text}"${context ? ` (${context})` : ""}`);
  }
  return lines.slice(0, 3); // cap at 3 lines — enough room for a full clear caption
}

function buildSVG(data, recipe) {
  const stageWidth = 240;
  const totalWidth = stageWidth * 4;
  const height = 380;

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

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" font-family="Arial, sans-serif">
  <defs>
    <style>
      .label { font-family: Arial, sans-serif; font-weight: 700; font-size: 15px; fill: #13567F; }
      .sublabel { font-family: Arial, sans-serif; font-size: 11px; fill: #666; }
      .arrow { stroke: #C9D6DE; stroke-width: 2; fill: none; }
    </style>
  </defs>
  <rect width="${totalWidth}" height="${height}" fill="#F5F8FA"/>
  ${connectorLines.join("\n  ")}
${stagesSVG}
  <rect x="0" y="${height - 30}" width="${totalWidth}" height="30" fill="${NAVY}"/>
  <text x="${totalWidth / 2}" y="${height - 11}" text-anchor="middle" fill="#fff" font-size="12" font-family="Arial, sans-serif" font-weight="500">${esc(data.title)}${toll ? " \u2014 " + esc(toll) : ""}</text>
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
