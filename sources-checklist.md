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
| 🔲 | Chernobyl Nuclear Disaster | 1986 | IAEA | — (note: nuclear, not chemical process — confirm fit before researching) |
| 🔲 | Macondo well control failures (pre-DWH) | — | CSB | — (largely superseded by deepwater-horizon-2010.md — likely skip) |

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
- BP Grangemouth incidents (2000) — UK HSE
- Enterprise Products Mont Belvieu NGL explosion (2020) — CSB
- Milford Haven Refinery Explosion, Texaco (1994) — UK HSE
- Nypro Flixborough-adjacent incidents / other UK HSE COMAH case studies
- Various ARIA/BARPI entries for European solvent and storage tank fires
  not yet reviewed individually
- Fieldwood Energy incident (referenced in EPSC's own 2026 process safety
  calendar — cross-check against CSB/BSEE for details)
- Tesoro Anacortes Refinery fire (2010) — ✅ done, see above
- BP Grangemouth "Three Greens" incidents specifically (2000) — UK HSE
- Bayer CropScience Institute explosion, West Virginia (2008) — ✅ done, see above
- Goodyear Houston chemical release (2008) — CSB
- Praxair/other industrial gas asphyxiation incidents — CCPS case studies
- CTA Acoustics Corbin, KY dust explosion (2003) — CSB, same national dust
  study as West Pharmaceutical, good pairing
- Hayes Lemmerz dust explosion, Huntington, IN (2003) — CSB, third of the
  same 2003 dust explosion trio

Before writing any of these up, verify against a primary source (CSB final
report, HSE case study, or equivalent) rather than a secondary summary —
several secondary sources online mix up incident names, dates, and
causes (see the `husky-superior-2018.md` correction: an earlier draft of
this checklist mislabeled it as a "toluene release" before the CSB report
was checked directly).
