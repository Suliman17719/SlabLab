# ACI 318-25 — Stage 17 flexural audit

## Scope
This stage refines the isolated preliminary singly-reinforced rectangular slab-strip flexural module. It is not activated as a complete design route in the app.

## Implemented in this stage
- Explicitly reports the compression-controlled strain limit `epsTy = fy/Es` and tension-controlled limit `epsTy + 0.003` used by the module.
- Reports the strain domain and separate strength and slab strain-limit statuses for required and provided steel.
- Applies a fail-closed slab strain-limit status: provided steel is not accepted for slab flexure unless it is tension-controlled.
- Keeps unimplemented checks clearly marked `NOT IMPLEMENTED`.
- Adds tests for valid tension-controlled steel, an over-reinforced/compression-controlled case, invalid geometry, invalid moment/steel inputs, and beta1 values.

## Basis and limitation
ACI's official publication page identifies ACI CODE-318-25 as the current code and states that the 2025 edition contains changes relative to 318-19. A publicly accessible excerpt of the 318-25 text identifies §7.3.3.1 as requiring nonprestressed slabs to be tension-controlled and refers to Table 21.2.2 for the strain criterion. The code module uses `eps_ty + 0.003` as its tension-controlled limit, but this must be verified against the licensed official SI edition and the applicable reinforcement/material provisions before claiming full code compliance.

## Not implemented / not verified
Minimum slab reinforcement, maximum reinforcement limits beyond the strain gate, bar spacing, one-way shear, deflection, crack control, development/splices, load combinations, two-way slab coefficient tables, punching shear, detailing, exposure/durability, and all other ACI 318-25 requirements. This module remains disabled as a full design code.
