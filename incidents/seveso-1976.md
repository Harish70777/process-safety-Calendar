---
title: Seveso Dioxin Release
date: 1976-07-10
location: Meda/Seveso, Lombardy, Italy
industry: [chemical-manufacturing, pesticides]
chemicals: [trichlorophenol, dioxin-tcdd]
severity: 1
fatalities: 0
injuries: 0
root_causes: [design-deficiency, no-automatic-cooling, inadequate-instrumentation, unsupervised-shutdown, poor-emergency-response]
psm_elements: [mechanical-integrity, operating-procedures, emergency-planning-and-response]
status: published
source_verified: true
sources:
  - "UK HSE COMAH case study archive"
  - "FABIG industrial accidents archive"
  - "ARIA/BARPI accident database (France)"
---

## What Happened

A batch reactor producing 2,4,5-trichlorophenol (TCP) at the ICMESA plant was shut down mid-cycle on a Friday evening, left with unreacted material at elevated temperature, and abandoned unsupervised for the weekend. With no stirring and no automatic cooling system, residual heat in the mixture drove a slow exothermic reaction that continued raising the temperature long after the shutdown. By Saturday around 12:37 pm, pressure inside the reactor exceeded the rupture disc's set point (3.5 bar) and it burst, releasing a toxic vapor cloud through a roof vent for about 20 minutes. The cloud carried an estimated 1–2 kg of TCDD dioxin, one of the most toxic substances known, over the towns of Seveso and Meda. No one died immediately, but widespread chloracne, contamination of land and livestock, and a 16-day delay before the company disclosed what had been released led to a major public health crisis and mass evacuation.

## Root Causes

- **No automatic cooling or temperature control:** the reactor had no automatic shutdown-cooling sequence; safe shutdown depended entirely on staff being present to manually intervene, and no one was on site over the weekend.
- **Inadequate reactor instrumentation:** control systems lacked adequate sensors, alarms, and interlocks for the parameters that mattered (temperature, agitation status), so the developing runaway went undetected.
- **Incomplete understanding of the reaction hazard:** the company was aware of the primary exotherm but had not fully characterized a weaker, slower secondary exotherm capable of driving the runaway that actually occurred.
- **Poorly set relief device:** the rupture disc was sized for a different hazard (overpressure from the transfer air system), not for containing or safely venting a runaway reaction, a lower-set device would have vented at a lower, less hazardous temperature.
- **Facility siting and emergency communication failure:** housing had been built up close to the plant over time, and there was no effective plan for rapid public notification, the company did not disclose the release for over a week.

## Lessons Learned

1. Never leave a batch reactor mid-cycle without completing a safe, verified shutdown sequence, "we'll finish Monday" is a decision that needs its own hazard review.
2. Fully characterize all exothermic pathways in a batch chemistry, not just the dominant one, secondary or weaker exotherms can still drive a runaway given enough unsupervised time.
3. Relief devices must be sized and set for the specific hazard scenario (e.g., runaway reaction), not repurposed from an unrelated design basis.
4. This incident is the direct origin of the EU's Seveso Directive (now Seveso III), the regulatory foundation requiring hazardous facilities to conduct formal risk assessments and coordinate with local authorities on emergency planning, precisely because of the disclosure and siting failures here.
