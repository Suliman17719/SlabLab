# SlabLab — Stage 28

## ACI 318-25 limited two-way slab reinforcement checks

Added `ACI31825.twoWaySlabReinforcement()` for a nonprestressed solid two-way slab strip. It calculates gross strip area, minimum flexural reinforcement using 0.0018 Ag, provided reinforcement per metre from bar diameter/spacing, and the maximum spacing limits of min(2h, 450 mm) at critical sections or min(3h, 450 mm) at other sections.

### Important limitations
- This is a narrowly scoped preliminary check, not a complete ACI 318-25 slab design or approval to activate the main ACI design workflow.
- Confirm applicability, exceptions, definitions of critical sections, material/structural system assumptions, and all relevant clauses against the licensed ACI 318-25 Code Requirements before engineering use.
- Does not check shear/punching, deflection, crack-control spacing under §24.3, development/splices, cover, fire, durability, load combinations, analysis, or full detailing.
- SBC 304-2024 remains disabled and unchanged because its numerical requirements and Saudi-specific provisions still need direct verification.

## Release/cache
- Service-worker cache bumped to `slablab-v1.1-development-stage28`.
- Stage 27 integration test extended for the new function and invalid-input guards.
