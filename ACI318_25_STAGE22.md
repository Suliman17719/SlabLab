# ACI 318-25 — Stage 22 solver hardening

## Scope
This is still a preliminary rectangular singly-reinforced slab-strip flexural section module, not a complete ACI 318-25 design engine. No claim of full code compliance is made.

## Changes
- Strict numeric parsing rejects blank strings, booleans, nulls, and non-finite values.
- Required-steel search is limited to the computed tension-controlled strain boundary.
- Reports the maximum tension-controlled steel area and associated design moment capacity for the input section.
- Reports an explicit no-tension-controlled-solution status when the requested moment exceeds that boundary capacity instead of returning a non-ductile required-steel result.
- Avoids treating zero provided reinforcement as a tension-controlled reinforcement state.
- Keeps minimum reinforcement, bar spacing, shear, deflection, development, detailing, load combinations, and edition-specific checks explicitly unimplemented.

## Validation
Run `node tests/stage22-aci-solver.test.js`. Tests cover numeric validation, a tension-controlled required-steel case, an infeasible tension-controlled demand, an over-reinforced provided-steel case, and zero-moment handling. These tests are software regression checks, not independent certification of the governing code provisions.

## Release gate
ACI remains disabled in the application registry. Before enabling it, verify the governing ACI 318-25 Code Requirements and applicable SI provisions from an authoritative copy, implement all required slab checks, and compare results with independent hand calculations or validated benchmarks.
