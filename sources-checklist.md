# Coverage checklist

Tracks progress against the canonical incident lists referenced by CSB,
UK HSE, BARPI/ARIA, CCPS, IChemE, and Marsh's "100 Largest Losses."
Update the status as incidents are researched and published.

Legend: ✅ published · ⏳ researching · 🔲 not started

| Status | Incident | Year | Primary source | File |
|---|---|---|---|---|
| ✅ | Flixborough Chemical Plant Explosion | 1974 | UK Court of Inquiry | `flixborough-1974.md` |
| ✅ | Seveso Dioxin Release | 1976 | UK HSE / ARIA | `seveso-1976.md` |
| ✅ | Bhopal Gas Tragedy | 1984 | ICMR / CSB case study | `bhopal-1984.md` |
| ✅ | Piper Alpha Offshore Platform Explosion | 1988 | Cullen Report | `piper-alpha-1988.md` |
| ✅ | Phillips 66 Pasadena Explosion | 1989 | OSHA Report to the President | `phillips-pasadena-1989.md` |
| ✅ | Longford Esso Gas Plant Explosion | 1998 | Longford Royal Commission | `longford-1998.md` |
| ✅ | AZF Toulouse Fertilizer Plant Explosion | 2001 | French judicial investigation | `azf-toulouse-2001.md` |
| ✅ | T2 Laboratories Explosion | 2007 | CSB Final Report | `t2-laboratories-2007.md` |
| ✅ | Imperial Sugar Refinery Explosion | 2008 | CSB Final Report | `imperial-sugar-2008.md` |
| ✅ | Kleen Energy Plant Explosion | 2010 | CSB Urgent Recommendation | `kleen-energy-2010.md` |
| ✅ | Deepwater Horizon | 2010 | CSB / BOEMRE Joint Report | `deepwater-horizon-2010.md` |
| ✅ | BP Texas City Refinery Explosion | 2005 | CSB Final Report | `texas-city-2005.md` |
| ✅ | Buncefield Oil Storage Depot Explosion | 2005 | Buncefield MIIB | `buncefield-2005.md` |
| ✅ | West Fertilizer Company Explosion | 2013 | CSB Final Report | `west-fertilizer-2013.md` |
| ✅ | Jaipur Oil Terminal Fire | 2009 | Independent Inquiry Committee (India) | `jaipur-2009.md` |
| ✅ | Tianjin Port Explosions | 2015 | China State Council Investigation | `tianjin-2015.md` |
| ✅ | Husky Energy Superior Refinery FCC Explosion | 2018 | CSB Final Report | `husky-superior-2018.md` |
| ✅ | ExxonMobil Torrance Refinery Explosion | 2015 | CSB Final Report | `exxonmobil-torrance-2015.md` |
| ✅ | Philadelphia Energy Solutions Refinery Fire/HF Release | 2019 | CSB Final Report | `philadelphia-energy-solutions-2019.md` |
| ✅ | DuPont La Porte Methyl Mercaptan Release | 2014 | CSB Final Report | `dupont-laporte-2014.md` |
| ✅ | Williams Olefins Plant Reboiler Explosion | 2013 | CSB Final Case Study | `williams-olefins-2013.md` |
| ✅ | Chevron Richmond Refinery Pipe Rupture/Fire | 2012 | CSB Final Investigation Report | `chevron-richmond-2012.md` |
| ✅ | Tesoro Anacortes Refinery Heat Exchanger Explosion | 2010 | CSB Final Investigation Report | `tesoro-anacortes-2010.md` |
| ✅ | West Pharmaceutical Services Dust Explosion | 2003 | CSB Final Investigation Report | `west-pharmaceutical-2003.md` |
| ✅ | Motiva Delaware City Sulfuric Acid Tank Explosion | 2001 | CSB Investigation Report | `motiva-delaware-city-2001.md` |
| ✅ | Formosa Plastics Vinyl Chloride Explosion | 2004 | CSB Final Investigation Report | `formosa-illiopolis-2004.md` |
| ✅ | Bayer CropScience Pesticide Waste Tank Explosion | 2008 | CSB Final Investigation Report | `bayer-cropscience-2008.md` |
| ✅ | CTA Acoustics Dust Explosion and Fire | 2003 | CSB Final Investigation Report | `cta-acoustics-2003.md` |
| ✅ | Hayes Lemmerz Aluminum Dust Explosion | 2003 | CSB Final Investigation Report | `hayes-lemmerz-2003.md` |
| ✅ | BP Grangemouth — Three Major Incidents | 2000 | HSE/SEPA Major Incident Report | `bp-grangemouth-2000.md` |
| ✅ | Texaco Milford Haven Refinery Explosion | 1994 | HSE Investigation Report | `milford-haven-1994.md` |
| ✅ | Goodyear Houston Heat Exchanger Rupture | 2008 | CSB Case Study | `goodyear-houston-2008.md` |
| ✅ | Freedom Industries Elk River Chemical Spill | 2014 | CSB Final Investigation Report | `freedom-industries-elk-river-2014.md` |
| ✅ | Arkema Crosby Organic Peroxide Fire | 2017 | CSB Investigation Report | `arkema-crosby-2017.md` |
| ✅ | AB Specialty Silicones Chemical Explosion | 2019 | CSB Safety Video/Update | `ab-specialty-silicones-2019.md` |
| ✅ | Watson Grinding Propylene Explosion | 2020 | CSB Final Investigation Report | `watson-grinding-2020.md` |
| ✅ | MGPI Processing Toxic Chlorine Release | 2016 | CSB Investigation Report | `mgpi-atchison-2016.md` |
| ✅ | Loy-Lange Box Company Pressure Vessel Explosion | 2017 | CSB Final Investigation Report | `loy-lange-box-2017.md` |
| ✅ | Packaging Corporation of America DeRidder Explosion | 2017 | CSB Investigation Report | `pca-deridder-2017.md` |
| ✅ | Didion Milling Combustible Dust Explosions | 2017 | CSB Final Investigation Report | `didion-milling-2017.md` |
| 🔲 | Chernobyl Nuclear Disaster | 1986 | IAEA | — (note: nuclear, not chemical process — confirm fit before researching) |
| 🔲 | Macondo well control failures (pre-DWH) | — | CSB | — (largely superseded by deepwater-horizon-2010.md — likely skip) |
| ⚠️ | Enterprise Products Mont Belvieu NGL explosion (2020) | — | Unconfirmed — no CSB report found for a 2020 incident; a fatal 2011 explosion at the same complex was OSHA-investigated, not CSB. Do not research further without a verified primary source. |

## How to add the next incident

1. Copy an existing file in `/incidents/` as a template.
2. Fill in every field in the frontmatter — `build-index.js` will flag anything missing.
3. Set `status: draft` while researching, `status: published` when it's ready to go live.
4. Update this checklist's row to ✅ and commit.
5. Push to `main` — GitHub Actions rebuilds the index, calendar, and site automatically.

## Cadence

Target: 2–3 new incidents per month from this list. Revisit and update older
entries when a source publishes a new anniversary retrospective (e.g. CSB's
20th-anniversary digests) so the "lessons learned" stay current.

## Candidates for the next research batch (not yet vetted)

These are additional names that come up repeatedly across CSB, HSE, ARIA,
CCPS, and Marsh's "100 Largest Losses" but haven't been individually
researched and verified yet — pulled from source lists, not yet checked
against a primary investigation report:

- Formosa Plastics Illiopolis Explosion (2004) — ✅ done, see above
- Motiva Enterprises Delaware City Refinery Sulfuric Acid Tank Failure (2001) — ✅ done, see above
- BP Grangemouth incidents (2000) — ✅ done, see above
- Milford Haven Refinery Explosion, Texaco (1994) — ✅ done, see above
- Nypro Flixborough-adjacent incidents / other UK HSE COMAH case studies
- Various ARIA/BARPI entries for European solvent and storage tank fires
  not yet reviewed individually
- Fieldwood Energy incident (referenced in EPSC's own 2026 process safety
  calendar — cross-check against CSB/BSEE for details)
- Goodyear Houston chemical release (2008) — ✅ done, see above
- Praxair/other industrial gas asphyxiation incidents — CCPS case studies
- CTA Acoustics Corbin, KY dust explosion (2003) — ✅ done, see above
- Hayes Lemmerz dust explosion, Huntington, IN (2003) — ✅ done, see above
- Freedom Industries Elk River, WV drinking water contamination (2014) —
  ✅ done, see above
- Arkema Crosby, TX organic peroxide fire, Hurricane Harvey (2017) —
  ✅ done, see above
- AB Specialty Silicones, Waukegan, IL explosion (2019) — ✅ done, see above
- Watson Grinding and Manufacturing, Houston, TX explosion (2020) —
  ✅ done, see above
- MGPI Processing, Atchison, KS toxic release (2016) — ✅ done, see above
- Loy-Lange Box Company, St. Louis, MO pressure vessel explosion (2017) —
  ✅ done, see above
- Packaging Corp of America, DeRidder, LA explosion (2017) — ✅ done,
  see above
- Didion Milling, Cambria, WI dust explosion (2017) — ✅ done, see above

## Fresh candidates for the next research batch (not yet vetted)

- Evergreen Packaging paper mill, NC — heat gun ignited resin bucket in a
  confined space, 2 killed (2020) — CSB
- Chemtool, Rockton, IL fire (2021) — CSB
- NDK Crystal, Belvidere, IL stress corrosion cracking explosion (2009) — CSB
- Kuraray America EVA plant explosion, Pasadena, TX (2018) — CSB
- Allied Terminals fertilizer tank collapse, Chesapeake, VA (2008) — CSB
- Barton Solvents, Des Moines, IA static electricity fire (2007) — CSB
- Silver Eagle Refinery, Woods Cross, UT hydrogen explosion (2009) — CSB
- Valero Refinery, Sunray, TX propane fire from frozen piping (2007) — CSB
- International Paper, Pensacola, FL explosion — referenced in the PCA
  DeRidder report as a related non-condensable gas system incident, worth
  checking directly

Before writing any of these up, verify against a primary source (CSB final
report, HSE case study, or equivalent) rather than a secondary summary —
several secondary sources online mix up incident names, dates, and
causes (see the `husky-superior-2018.md` correction: an earlier draft of
this checklist mislabeled it as a "toluene release" before the CSB report
was checked directly).
