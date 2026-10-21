# SlabLab Stage 27 — First ACI UI integration

## Implemented
- Added a separate ACI 318-25 preliminary rectangular-section flexure screen in Settings.
- The screen calls only `ACI31825.section()` and reports required steel area, provided flexural strength, strain domain, and the engine's preliminary checks.
- Added explicit scope warnings that this is not a full ACI slab-design workflow and that minimum reinforcement, spacing, shear, deflection, development, load combinations, and detailing are not checked.
- Kept the central code registry and all full-slab design routes fail-closed: EC2 remains the only available slab workflow; ACI and SBC are not enabled as complete slab-design codes.
- Kept SBC numerical calculations locked because the available official public material located so far is code access/catalogue and contents/traceability information, not verified numerical requirements for implementing the whole design path.
- Bumped Service Worker cache to `slablab-v1.1-development-stage27`.

## Validation
- Syntax and automated tests are run as part of the Stage 27 packaging workflow.
- This is a software integration milestone, not verification that the preliminary equations comply fully with ACI 318-25. Do not use for construction or professional design without checking the licensed 318-25 text, independent hand calculations, and technical review.
