# SlabLab — Stage 16: ACI 318-25 development module

## Implemented in this stage
- Added `aci318-25-engine.js` as a separate, isolated module; it does not call or reuse EC2 design equations.
- Implemented a preliminary singly reinforced rectangular-strip flexural section calculation using SI units: ACI-style rectangular compression block, beta1 function, strain-dependent flexural strength reduction factor, nominal moment, and a bisection solution for required steel for a supplied factored moment.
- Loaded the module from `index.html` and added it to the service-worker core cache. It is **not exposed as an enabled design route** in the app.
- Added explicit UI-side rejection of negative/non-finite default live load and live-load overrides before calculation; improved error toasts to show validation messages. Numeric load fields now declare `min=0`.
- Added regression tests for the ACI module and negative live loads.

## Critical scope limitation
This is **not a complete ACI 318-25 slab design engine and must not be used for construction design**. The module does not implement or claim verification of ACI 318-25 minimum slab reinforcement, bar spacing, shear, deflection, development/lap, detailing, load combinations, one-way/two-way coefficient analysis, or all edition-specific provisions. The official adopted text and applicable references must be checked before enabling ACI in the UI. The app's ACI code registry remains disabled by design.

## Verification
The Stage 16 tests verify programmed arithmetic and expected guard behavior only. They are not independent certification or proof of full code compliance.
