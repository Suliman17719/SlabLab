# SlabLab Stage 38 — ACI two-way strip flexure screen

## Implemented
- Added `twoWaySlabStripDesign()` to `aci318-25-engine.js`. It checks two independently entered slab-strip directions for provided reinforcement area, minimum reinforcement, flexural strength using the existing section solver, tension-controlled strain screen, and maximum spacing.
- Added X/Y effective depths, factored strip moments, reinforcement, material strengths, and bar-location inputs to the ACI two-way development workbench.
- Added explicit status semantics: zero moment is reported as not checked and cannot produce a limited pass.
- Kept the minimum-reinforcement expression aligned with the currently mapped §7.6.1.1/§8.6.1.1 text; applicability and exceptions still require confirmation against the licensed code text.
- Bumped the service-worker cache key to `slablab-v1.1-development-stage38` and added regression tests.

## Scope limitations
This is a two-direction strip flexure screen, not a full two-way slab design. It does not derive moments from panel geometry/load/support conditions and does not implement punching shear, complete one-way shear in both directions, deflection, column-strip distribution, torsion/corner restraint, anchorage/laps, openings, or full detailing. The applicable clauses and fy adjustment must be verified against the licensed ACI 318-25 Code Requirements. A limited pass is not construction approval. ACI/SBC remain disabled for the main production design route.

## Verification
Run all tests with `for f in tests/*.test.js; do node "$f" || exit 1; done`. Also run `node --check app.js`, `node --check aci318-25-engine.js`, and `node --check sw.js`.
