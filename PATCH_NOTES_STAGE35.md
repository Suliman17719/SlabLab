# SlabLab Development — Stage 35

## Goal
Consolidate existing ACI one-way slab-related calculations into one user-facing workflow rather than adding another isolated calculator.

## Implemented
- Added `oneWaySlabStripDesign()` to `aci318-25-engine.js`.
- Combined bar diameter/spacing → provided steel area, minimum flexural reinforcement (`0.0018 Ag`, ACI 318-25 §7.6.1.1), the existing preliminary section-flexure solver, and the minimum-thickness screen.
- Added an integrated screen accessible from Settings. The user supplies the factored strip moment from a separate analysis; the app does not derive it from loads.
- Updated service-worker cache and regression assertions to Stage 35.
- Added focused validation and integration tests.

## Explicit limits
This is a combined preliminary workflow, not full ACI 318-25 design. One-way shear, calculated immediate/long-term deflection, anchorage/laps, full detailing, load combinations, support moment analysis, concentrated loads/openings, and special material cases remain outside the implementation. A pass means only the listed checks pass. ACI remains disabled for the main production design workflow.

## Verification
Run `node tests/stage35-aci-integrated-strip.test.js` and all `tests/*.test.js`, plus syntax checks for JavaScript and JSON parsing for both manifests. No live device test or GitHub deployment is claimed.
