# SlabLab Stage 39 — ACI one-way shear-demand integration

## Implemented
- Added `oneWayShearDemandUniformLoad()` for the limited case of a simply supported slab strip under a full-span factored uniform load.
- Uses a face-to-face clear span and evaluates the shear at a section `d` from the support face: `Vu = wu × (Lclear/2 − d)`, with `wu` in kN/m and lengths in mm.
- Integrated the calculated shear demand into the existing ACI one-way strip workbench. A manually entered `Vu` takes precedence over the estimate.
- Added an optional factored uniform load input and a result label showing when the automatic uniform-load case was used.
- Updated the service-worker cache key and regression tests.

## Boundaries
- Automatic shear demand is rejected for continuous spans, cantilevers, or other support conditions. Enter `Vu` from a verified analysis for those cases.
- The helper assumes no point loads, partial-span loads, or other actions and does not decide whether the selected section governs for every slab configuration.
- This is not a full ACI design and does not implement punching shear, deflection, moment analysis, or full detailing. ACI/SBC remain disabled for the primary production design route.
- The shear-capacity expression and all applicability conditions still require independent verification against an authorized ACI 318-25 copy before engineering use.

## Verification
Run `for f in tests/*.test.js; do node "$f" || exit 1; done`, then syntax checks for `app.js`, `aci318-25-engine.js`, `sbc304-2024-engine.js`, and `sw.js`.
