# SlabLab — Stage 25 Integration Test Pass

## Purpose
This stage consolidates the regression suite and adds cross-module integration checks before final packaging. It is a software regression pass, not an independent structural-engineering certification.

## Added
- `tests/stage25-integration.test.js` exercises the one-way, two-way, and irregular-panel EC2 calculation paths with finite-result checks.
- Confirms unresolved shear, anchorage, two-way analysis, and irregular-panel deflection checks prevent a false overall `OK`.
- Confirms invalid dimensions and invalid coefficient cases are rejected.
- Confirms the central registry permits only the limited EC2 route and continues to reject ACI 318-25 and SBC 304-2024.
- Confirms ACI's preliminary section module explicitly marks omitted design checks and SBC does not produce a design result.
- Confirms calculation entry points reference the registry guard and the service worker cache includes the app's required local modules.
- Bumped service-worker cache version to `slablab-v1.1-integration-stage25`.

## Limitations
- Node-based tests do not replace testing in Android Chrome, iOS Safari, or an actual offline browser session.
- Existing EC2 calculation routes remain limited and require independent engineering review; all unresolved checks must be completed before any construction use.
- ACI 318-25 and SBC 304-2024 remain disabled for design calculations.

## Run
Run all test files with `for f in tests/*.test.js; do node "$f"; done`, then run `node --check` on the application and engine JavaScript files.
