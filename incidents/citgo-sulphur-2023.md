---
title: CITGO Sulphur Refinery Heat Exchanger Hydrogen Fire
date: 2023-01-21
location: Sulphur, LA, USA
industry: [oil-gas-refining]
chemicals: [hydrogen]
severity: 2
fatalities: 0
injuries: 0
root_causes: [bolts-under-torqued-at-assembly-in-2013, wrong-bolt-size-in-assembly-instructions, incorrect-instructions-applied-from-similar-exchanger, thermal-cycling-relaxed-flange-over-a-decade]
psm_elements: [mechanical-integrity, process-safety-information]
status: published
source_verified: true
sources:
  - "CSB Incident Reports Volume One (January 2025)"
---

## What Happened

On January 21, 2023, at 4:30 p.m., approximately 30 pounds of hydrogen gas were accidentally released from a shell-and-tube heat exchanger during unit startup at the CITGO Petroleum refinery in Sulphur, Louisiana. The released hydrogen caught fire, forcing an emergency shutdown and causing more than $1.5 million in property damage. The release originated at the flange between the heat exchanger's channel and shell. The exchanger had been assembled in 2013 and had undergone 43 thermal cycles by the time of the incident; over that period, the flange's bolts had relaxed, a generally normal and expected occurrence, but had relaxed to a degree that the flange could no longer reliably contain hydrogen. CITGO's investigation found the bolt torque value specified when the exchanger was originally assembled in 2013 was too low, the result of assembly instructions that listed an incorrect bolt size and therefore an incorrect, insufficient torque value. The company also found that because it was common site practice to torque similar flanges to similar values, the same flawed instructions used for a nearby, similar heat exchanger may have been mistakenly applied to the exchanger involved in this incident. The hydrogen most likely ignited from contact with an adjacent hot heat exchanger, friction generated during the release itself, or a spark.

## Root Causes

- **Bolts were under-torqued when the heat exchanger was assembled in 2013:** the flange's fasteners were tightened to a value insufficient to reliably contain hydrogen over the exchanger's service life.
- **Assembly instructions listed an incorrect bolt size:** the documentation used to determine the correct torque value contained an error specifying the wrong bolt size, which propagated directly into an incorrect, too-low torque specification.
- **Flawed instructions from a similar exchanger may have been mistakenly applied:** common site practice of using consistent torque values across similar flanges likely meant the same erroneous instructions affected more than one piece of equipment.
- **Repeated thermal cycling gradually relaxed the already under-torqued bolts:** 43 thermal cycles over roughly a decade allowed a flange that may have marginally held at installation to progressively weaken until it could no longer contain the process gas.

## Lessons Learned

1. Assembly instructions for pressure-retaining equipment need independent verification of critical details like bolt size and torque value before being used, since a documentation error at this level can go undetected for a decade while progressively weakening the equipment it governs.
2. Applying a "common practice" torque value across multiple similar pieces of equipment, without verifying each one's specific assembly documentation is correct, risks propagating a single documentation error across an entire class of equipment.
3. Flanges subject to repeated thermal cycling need periodic bolt torque verification as part of a mechanical integrity program, since bolt relaxation is a known, expected phenomenon that accumulates over time and eventually compromises containment if never re-checked.
4. When incorrect assembly documentation is discovered for one piece of equipment, the same error should be assumed possible for any other equipment that may have used the same or similar documentation, warranting a broader review rather than a fix limited to the specific unit involved in the incident.
