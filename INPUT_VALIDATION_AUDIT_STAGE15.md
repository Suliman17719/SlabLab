# SlabLab — Stage 15: Input Validation Audit

## Scope
This stage adds pre-calculation validation to the one-way, two-way, and irregular-slab calculation routes. It is an input-integrity patch, not a certification of Eurocode 2 compliance.

## Changes
- Added a shared `validateCommon()` guard in `engine.js` for positive finite geometry/material/factor values, non-negative cover and loads, and plausible slab thickness relative to cover and bar diameter.
- One-way slabs now reject non-positive/non-finite spans before analysis.
- Two-way slabs now validate both input spans, effective-depth allowance in both directions, and any overridden short/long analysis dimensions.
- Irregular slabs now reject invalid area or representative span before equivalent dimensions are derived.
- Added regression tests covering valid baseline cases and invalid geometry, loads, material factors, and span overrides.

## Validation boundaries
- The guards do not validate every possible input dependency or prove that a selected analysis method is appropriate for a real slab.
- A passed input guard means only that the values meet these basic numerical/physical constraints.
- Shear, anchorage/lap, two-way coefficient applicability, irregular-slab deflection, and other existing review flags remain unresolved; the overall status must not be interpreted as construction approval.
- The app remains locked to its current limited EC2 route. ACI 318-25 and SBC 304-2024 remain disabled until separate provisions and independent verification are implemented.
