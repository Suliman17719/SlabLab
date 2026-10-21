# SlabLab Stage 41 — Preliminary serviceability and punching-demand utilities

## Implemented
- Added `immediateDeflectionGrossSection()` to estimate elastic deflection for a simply supported strip under a full-span uniform service load using `Ec = 4700 sqrt(fc)` and gross uncracked inertia `Ig = b h^3 / 12`.
- Added `punchingShearDemandGeometry()` for a rectangular interior column and rectangular tributary panel, calculating critical perimeter geometry at `d/2` and a uniform-load net punching demand after subtracting the load within the critical perimeter footprint.
- Added separate ACI development workbench screens for both calculations.
- Updated service-worker cache key to Stage 41 and updated historical tests to assert the current cache key.

## Safety and scope
- The deflection function is a gross uncracked elastic estimate only. It does not calculate cracked stiffness, reinforcement effects, creep, shrinkage, load-duration factors, or code allowable deflection. It is not an ACI compliance check.
- The punching function calculates demand and perimeter geometry only. It does not calculate concrete punching capacity `phiVc` and gives no pass/fail conclusion. It is restricted to a centered interior rectangular column, rectangular tributary panel, and uniform factored area load. Edge/corner columns, openings, eccentricity/unbalanced moment transfer, and special geometries are excluded.
- ACI and SBC remain disabled for full production design. No full code compliance is claimed.

## Verification
- Run all tests using `for f in tests/*.test.js; do node "$f" || exit 1; done`.
- Run `node --check app.js`, `node --check aci318-25-engine.js`, and `node --check sw.js`.
