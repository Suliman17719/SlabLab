# SlabLab Development — Stage 31

## Purpose
Prepare the next ACI 318-25 shear implementation with explicit clause traceability and fail-closed boundaries rather than introducing an unverified formula.

## Changes
- Added `ACI318_25_SHEAR_IMPLEMENTATION_MAP_STAGE31.json` covering one-way shear, two-way/punching shear, critical sections, material applicability, strength-reduction factors, and required implementation decisions.
- Added `tests/stage31-shear-scope.test.js` to validate the map and ensure that ACI remains disabled and the existing slab helper still reports shear as not implemented.
- Updated the service-worker cache key to `slablab-v1.1-development-stage31` and updated release-test expectations.

## Engineering status
- No shear capacity or punching-shear equation has been implemented in this stage.
- ACI 318-25's exact applicable provisions must be checked against an authorized Code Requirements copy; secondary revision summaries are review aids only.
- One-way shear and punching shear remain disabled/not implemented. ACI 318-25 and SBC 304-2024 remain unavailable for full design workflows.

## Validation
Run all tests with `for f in tests/*.test.js; do node "$f"; done`. These are software checks, not independent structural design certification.
