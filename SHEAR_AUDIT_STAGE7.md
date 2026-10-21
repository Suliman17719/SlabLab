# SlabLab — Stage 7: Shear audit

## Scope
This patch addresses unsafe presentation of the existing preliminary EC2 shear calculation. It does **not** claim to complete shear design.

## Changes
- The one-way and two-way slab engines no longer report shear as `OK (no links)` solely because the simplified demand estimate is below the calculated concrete shear resistance.
- Both engines retain the numerical `VRd,c` estimate as a preliminary screen and explicitly label the shear design status `NOT OK (review required)`.
- Removed the displayed estimated link-leg design from the calculation steps. The prior link estimate was not a valid slab shear reinforcement design and must not be used for detailing.
- Two-way slabs now explicitly disclose that one global shear estimate is compared against both directional capacities; this is not a directional shear analysis.
- Service worker cache bumped to `slablab-v1.1-audit6`.

## EC2 basis and limitations
The preliminary concrete shear resistance follows EN 1992-1-1:2004 §6.2.2, Expressions (6.2a)/(6.2b), with recommended values `CRd,c = 0.18/γc`, `k1 = 0.15` (the latter is not currently included because the app has no axial-force input), and `vmin = 0.035 k^(3/2) sqrt(fck)` as the recommended expression (6.3N). The standard defines `k = min(1 + sqrt(200/d), 2.0)` and `ρl = Asl/(bw d) ≤ 0.02`; `Asl` must extend at least `lbd + d` beyond the section. The standard also requires `VEd ≤ VRd,max` where applicable. Reference: EN 1992-1-1:2004 §6.2.2–6.2.3.

Current implementation limitations requiring a future complete pass:
1. `VEd` is a simplified span/panel estimate, not a support-face or section-at-distance-`d` result from a verified reaction/load model.
2. The effective tensile steel `Asl` anchorage/extension beyond the checked section is not established by geometry or bar curtailment data.
3. The app does not expose National Annex values or axial compression `σcp`; default recommended values are not a substitute for selecting the project National Annex.
4. The current `VRd,max` expression and its inputs are retained only as a preliminary screen; the app does not provide a complete EC2 §6.2.3 design workflow.
5. Slab shear reinforcement is not designed by this tool. No estimated legs/spacing should be used for detailing.
6. Two-way shear demand is not resolved separately in x and y. The single `R.V` cannot substantiate a final pass/fail for both directions.
7. Punching shear around columns, concentrated loads, openings, and local support effects is not covered by this one-way/two-way slab shear check.

## Safe interpretation
Every shear result remains `NOT OK (review required)` until the demand model, section location, anchored reinforcement, National Annex parameters, and applicable shear checks are verified. This is intentionally conservative; it is not a claim that the physical slab necessarily fails.
