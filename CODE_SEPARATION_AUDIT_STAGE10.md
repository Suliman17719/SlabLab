# Stage 10 — Code Separation Audit

## Changes
- Added an explicit immutable code registry in `app.js`.
- EC2 is the only active calculation route; it is explicitly labelled limited/review-required, not fully validated.
- ACI 318-25 and SBC 304-2024 are marked disabled until independent provisions, equations, factors, detailing rules, and verification tests are implemented.
- Settings now states the code availability and the restricted use of BS 8110 moment coefficients in identified analysis routes.
- Updated the service-worker cache version to `slablab-v1.1-audit10` so clients request the updated app files.

## Important limitation
This stage does not implement ACI or SBC equations, and does not claim complete EC2 compliance. The active engine still contains checks marked preliminary or review-required. Numerical output must not be treated as construction-ready.

## Verification performed
- JavaScript syntax checks for `app.js`, `engine.js`, `engine2.js`, and `sw.js`.
- Registry smoke test confirms EC2 is active-limited while ACI 318-25 and SBC 304-2024 are disabled.
- Static check confirms the UI communicates these limitations and the cache version is updated.
