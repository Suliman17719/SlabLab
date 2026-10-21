# SlabLab Stage 40 — Two-way coefficient-driven moment utility

## Implemented
- Added `twoWayMomentFromCoefficients()` to the ACI development engine.
- Calculates coefficient-based moments `Mx = alphaX * wu * lx^2` and `My = alphaY * wu * lx^2` for the explicitly supported coefficient-driven workflow.
- Validates positive spans/load, nonnegative coefficients, short/long span ordering, and `ly/lx <= 2.0`.
- Added inputs to the existing ACI two-way workbench; calculated moments populate MuX/MuY for the existing limited strip flexure screen.
- Added tests for formula outputs, invalid input rejection, UI integration, and service-worker cache version.

## Critical scope limits
- The app does not select or validate alpha coefficients. The user must obtain coefficients from a verified table/method matching the actual support conditions, panel position, loading, and code edition.
- This is not elastic plate analysis and does not calculate support negative moments, positive moments by panel region, torsion, corner restraint, openings, concentrated loads, or load combinations.
- ACI/SBC remain disabled for the primary production design route. No full code compliance is claimed.

## Verification
- Run the full suite with `for f in tests/*.test.js; do node "$f" || exit 1; done`.
- Check syntax with `node --check app.js` and `node --check aci318-25-engine.js`.
