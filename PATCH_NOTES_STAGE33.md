# SlabLab Development — Stage 33

## Implemented
- Added `oneWaySlabMinimumThickness()` to the ACI 318-25 development engine. It screens minimum thickness for nonprestressed solid one-way slabs using Table 7.3.1.1 for normalweight concrete and the reinforcement-yield-strength adjustment in §7.3.1.1.1.
- Added an in-app workbench for span, provided thickness, steel yield strength and support condition. It reports the tabulated thickness, adjustment factor and screening result.
- Added tests for all four support conditions, fy adjustment, adequate/inadequate thickness, invalid inputs, source traceability and UI wiring.
- Updated the service-worker cache to `slablab-v1.1-development-stage33`.

## Limits / safety
- This is a minimum-thickness screen, not a calculated immediate/long-term deflection check and not full ACI design. Applicability conditions, exceptions, lightweight-concrete adjustments and other code requirements must be verified against the licensed ACI 318-25 Code Requirements.
- SBC 304-2024 remains disabled for numerical design: the available SBC module contains traceability/input validation, not a verified independent design equation set. Do not substitute ACI equations for SBC-specific requirements without verifying the official SBC text.
- Full-slab production calculations remain routed to the existing limited EC2 path.
