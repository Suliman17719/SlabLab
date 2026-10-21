# SlabLab Development — Stage 32

## Actual changes
- Added an in-app ACI 318-25 two-way slab strip reinforcement/spacing tool connected to the existing `twoWaySlabReinforcement()` helper.
- Added an SBC 304-2024 workbench connected to the independent SBC input validator and provision status response. It does not claim or calculate design strength.
- Added routes and settings buttons for both workbenches.
- Kept all full-slab production calculations fail-closed to EC2; ACI/SBC are not represented as fully implemented.
- Bumped service-worker cache key to `slablab-v1.1-development-stage32`.
- Added Stage 32 regression tests for the workbench routes, engine connections, and safety boundaries.

## Important limitations
ACI workbench checks only the limited implemented arithmetic and is not a complete ACI 318-25 design. SBC workbench only validates input fields and reports unimplemented checks. Neither workbench is suitable for final structural design.
