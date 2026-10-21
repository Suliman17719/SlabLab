SlabLab Audit Stage 5

This archive contains a targeted preliminary correction to anchorage and lap-length calculations in the one-way and two-way slab engines. Read ANCHORAGE_LAP_AUDIT_STAGE5.md and PATCH_NOTES.md before using or deploying it.

Important: anchorage/lap is deliberately marked NOT OK / review required until α1–α5, actual bond conditions and lap percentage are fully captured and verified. This is not construction-ready design software.


Stage 6 adds a crack-control audit. Crack-control results based on Table 7.3N are simplified; unsupported table cases and the thin-slab exemption require explicit review. See `CRACK_CONTROL_AUDIT_STAGE6.md`. The app remains a review tool, not a substitute for a verified design calculation.


## Audit Stage 8
Flexural design now includes iterative crack-control spacing, an explicit provided-steel moment resistance cross-check, and a configured K′/neutral-axis limit check. See `FLEXURE_AUDIT_STAGE8.md` for scope and limitations. The application remains a review-stage engineering aid, not construction-ready design software.


## Code support status (Stage 10)
Only the limited EC2 calculation route is active. ACI 318-25 and SBC 304-2024 are intentionally disabled pending independently verified implementations. This educational tool is not construction-ready. See `CODE_SEPARATION_AUDIT_STAGE10.md`.

## Stage 11 status audit
The result summary uses fail-closed status aggregation: only explicit `OK` states count as passes; missing or review-required checks prevent an overall pass. See `FORMULA_STATUS_AUDIT_STAGE11.md` and run `node tests/stage11-status.test.js`. This is status hardening, not formula certification or construction approval.

## Stage 12 numerical benchmark validation
Added deterministic regression checks for material factors, load combinations, one-way UDL coefficients, two-way coefficient interpolation, crack-spacing lookup, and invalid-input guards. Run `node tests/stage12-benchmarks.test.js`. These checks verify arithmetic/data flow for the stated cases only; they do not independently certify code-table sources or full design compliance. See `BENCHMARK_VALIDATION_STAGE12.md`.

## Stage 13 deflection formula audit
The EC2 7.4.2 simplified span/depth steel-stress modification factor now uses `As,prov/As,req`, while the basic reinforcement ratio continues to use `max(As,req, As,min)`. Run `node tests/stage13-deflection.test.js`. This is a targeted formula correction, not a full certification of the deflection method; see `DEFLECTION_FORMULA_AUDIT_STAGE13.md`.


## Stage 14 — Flexural resistance audit

The provided-steel resistance calculation now reports the raw lever arm `zprov = d − 0.4x` and rejects invalid neutral-axis geometry instead of clamping the lever arm to zero. See `FLEXURE_RESISTANCE_AUDIT_STAGE14.md` and run `node tests/stage14-flexure.test.js`. This is not a claim of complete Eurocode compliance.


## Stage 15 — Input validation audit

Stage 15 rejects invalid spans, slab thickness/effective-depth combinations, negative loads, non-positive material factors, and invalid overridden analysis dimensions before calculation. See `INPUT_VALIDATION_AUDIT_STAGE15.md`. This is numerical input validation only and does not establish full EC2 compliance.


## Stage 16 — ACI development (not enabled)

A standalone `aci318-25-engine.js` module has been added for preliminary singly-reinforced rectangular-strip flexural section calculations. It is loaded by the page but remains disabled as a complete design route. Minimum slab reinforcement, spacing, shear, deflection, development, detailing, load combinations, and ACI 318-25 edition-specific verification remain incomplete. See `ACI318_25_STAGE16.md` and `ACI318_25_STAGE17.md`. Stage 17 adds a separate slab strain-limit status and tests for tension-controlled versus compression-controlled reinforcement; the ACI route remains disabled as a complete code.

The app now explicitly blocks negative default live loads and live-load overrides before calculation and displays validation messages. Stage 16 tests cover the preliminary ACI module and negative-load regression cases.


## Stage 21 — SBC clause audit
SBC 304-2024 one-way/two-way slab clause headings are mapped for traceability only. The engine remains disabled until the operative Code Requirements text and calculations are independently verified. See `SBC304_2024_STAGE21.md`.


## Stage 22 — ACI flexural solver hardening

The preliminary ACI section module now restricts the required-steel search to the calculated tension-controlled boundary and reports when the requested moment cannot be met within that boundary. Numeric input parsing is stricter, and zero reinforcement is no longer assigned a strain-domain label. Run `node tests/stage22-aci-solver.test.js`. ACI remains disabled as a complete design-code route; minimum reinforcement, spacing, shear, deflection, development, detailing, load combinations, and authoritative edition-specific verification are still outstanding. See `ACI318_25_STAGE22.md`.

## Stage 23 — SBC requirements traceability

Added the official SBC 304-CR-2024 Code Requirements table-of-contents source alongside the Code & Commentaries contents, clarified that these sources support clause/page traceability but do not verify numerical equations, and added a fail-closed traceability test. SBC remains disabled for design calculations pending review of the actual applicable requirements and Saudi-specific provisions. Run `node tests/stage23-sbc-requirements-traceability.test.js`.

## Stage 24 — code registry integration
The design-code availability registry is centralized in `code-registry.js` and drives the Settings screen. Calculation entry points fail closed unless the selected code is the currently permitted EC2 route. ACI 318-25 and SBC 304-2024 remain disabled pending complete provision implementation and independent verification. The service worker caches the registry module for offline operation. See `PATCH_NOTES_STAGE24.md`.

## Stage 25 — Integration regression pass
Added `tests/stage25-integration.test.js` to exercise all current EC2 calculation routes, assert fail-closed status behavior, test invalid-input boundaries, confirm ACI/SBC limitations remain explicit, and check application guards/offline shell wiring. The service-worker cache key is now `slablab-v1.1-integration-stage25`. These are software regression checks only; they do not certify code compliance or replace device/browser testing.

## Stage 26 — release readiness audit
Synchronized the linked PWA manifest and alternate webmanifest, aligned standalone launch metadata and dark theme colors, verified packaged local assets, and added `tests/stage26-release-audit.test.js`. The service worker cache is now `slablab-v1.1-release-stage26`. This verifies packaging and software wiring only; it is not an engineering certification or a substitute for browser/device/offline acceptance testing. EC2 remains limited-review status and ACI/SBC remain disabled. See `PATCH_NOTES_STAGE26.md`.

## Stage 27 — first ACI integration
Added a separate preliminary ACI rectangular-section flexure screen, explicitly isolated from the EC2 slab-design routes. This does **not** activate ACI for full slab design; all omitted checks remain disclosed. SBC 304-2024 remains locked pending verification of its Code Requirements text and Saudi-specific provisions. See `PATCH_NOTES_STAGE27.md`.

## Stage 28 — ACI limited two-way slab reinforcement checks
See `PATCH_NOTES_STAGE28.md`. This adds a limited check for minimum flexural reinforcement and maximum bar spacing for nonprestressed solid two-way slab strips; it does not activate complete ACI or SBC slab design.

## Stage 29 — ACI strip-width consistency
- Fixed provided reinforcement area scaling to use the entered strip width `b` in the ACI preliminary two-way slab reinforcement helper.
- Added a regression case for a 500 mm strip and updated the service-worker cache version.
- This correction does not activate full ACI design; SBC remains disabled pending verified implementation.


## Stage 30 update
Stage 30 adds arithmetic-property and boundary regression tests for the limited ACI helper and updates the service-worker cache key. It introduces no new design equation and does not enable ACI or SBC full-design workflows. See `PATCH_NOTES_STAGE30.md`.


## Stage 31 — ACI shear implementation map
Stage 31 adds a structured SI-unit traceability map for one-way shear (Chapter 22.5), two-way/punching shear (Chapter 22.6), critical-section requirements, material applicability, and shear strength-reduction-factor checks. It deliberately adds no shear equation and does not enable ACI/SBC design. ACI 318-25 shear provisions must be verified against an authorized copy of the Code Requirements and benchmarked independently before numerical implementation. Run `node tests/stage31-shear-scope.test.js`. The service-worker cache key is now `slablab-v1.1-development-stage31`.


## Stage 32 — limited ACI/SBC development workbenches
Stage 32 adds an in-app ACI two-way slab reinforcement arithmetic check using the existing limited helper, and an SBC input-validation/provision-status workbench using the independent SBC module. The SBC workbench deliberately produces no design capacity; neither code is enabled for full-slab production workflows. The EC2 workflow remains unchanged. The service-worker cache key is `slablab-v1.1-development-stage32`. Run `node tests/stage32-code-workbenches.test.js` and all test files before release.


## Stage 33 — ACI one-way slab minimum-thickness screen
Stage 33 adds a limited screen based on ACI 318-25 Table 7.3.1.1 and §7.3.1.1.1 for nonprestressed solid one-way slabs with normalweight concrete. This is not a calculated deflection check and does not activate ACI for full-slab production workflows. SBC remains disabled for numerical design until SBC-specific requirements are verified. Run `node tests/stage33-aci-oneway-thickness.test.js` and the complete test suite before release. Cache key: `slablab-v1.1-development-stage33`.


## Stage 34 — SBC one-way slab minimum-thickness screen
Stage 34 adds a limited SBC 304-2024 Table 7.3.1.1 thickness screen for nonprestressed solid one-way slabs, restricted to fy = 420 MPa until the Saudi-edition adjustment is verified from the normative text. This does not enable full SBC design or calculate deflection. Run `node tests/stage34-sbc-oneway-thickness.test.js` and the full suite before release. Cache key: `slablab-v1.1-development-stage34`.


## Stage 35 — Integrated ACI one-way slab strip checks
Stage 35 adds a combined preliminary workflow for a one-way slab strip: provided steel from bar diameter/spacing, ACI §7.6.1.1 minimum flexural reinforcement, the existing section-flexure solver, and the Table 7.3.1.1 minimum-thickness screen. It is accessible from Settings. This does not calculate Mu, analyze continuity, check shear, calculate deflection, or complete detailing; ACI remains disabled for the main production design workflow. Run `node tests/stage35-aci-integrated-strip.test.js` and all `tests/*.test.js`. Cache key: `slablab-v1.1-development-stage35`.


Stage 36 clarifies that a passing result from the integrated ACI strip tool applies only to its listed checks and must not be interpreted as full design approval. Cache key: `slablab-v1.1-development-stage36`.


## Stage 37 — limited ACI one-way shear screen
Stage 37 adds a bounded SI-unit helper for one-way shear in a nonprestressed solid slab strip without minimum shear reinforcement and without axial force. The integrated workbench accepts an externally calculated `Vu`; leaving it blank reports shear as not checked. This is not punching-shear design and does not activate ACI/SBC production design. Formula coefficients and applicability must be verified against the licensed ACI 318-25 Code Requirements. See `PATCH_NOTES_STAGE37.md` and run `node tests/stage37-aci-oneway-shear.test.js`. Cache key: `slablab-v1.1-development-stage37`.


## Stage 38 — ACI two-way strip flexure screen
Stage 38 adds independent X/Y strip flexural-capacity checks to the ACI development workbench using entered factored moments and reinforcement. It checks minimum steel, flexural strength, a tension-strain screen, and spacing, while explicitly leaving panel moment analysis, punching shear, deflection, and detailing unimplemented. ACI and SBC remain disabled for the primary full-slab workflow. See `PATCH_NOTES_STAGE38.md` and run `node tests/stage38-aci-twoway-strip-flexure.test.js`. Cache key: `slablab-v1.1-development-stage38`.


## Stage 39 — ACI one-way shear-demand integration
Stage 39 adds a load-case-specific automatic estimate of factored one-way shear demand for a simply supported strip under full-span uniform load. It uses a face-to-face clear span and the section at distance d from the support face; manually entered Vu overrides this estimate. Automatic calculation is rejected for continuous spans, cantilevers, or unsupported load patterns. This does not add panel analysis, punching shear, deflection, or complete code compliance. ACI/SBC remain disabled for the primary production route. See `PATCH_NOTES_STAGE39.md` and run `node tests/stage39-aci-shear-demand.test.js` plus the complete test suite. Cache key: `slablab-v1.1-development-stage39`.

## Stage 40 — coefficient-driven two-way moments
Stage 40 adds a coefficient-driven moment utility to the ACI development workbench. It evaluates `Mx = αx·wu·lx²` and `My = αy·wu·lx²` using coefficients supplied by the user, then populates the existing limited two-direction strip flexure screen. The app does not select coefficients or verify that a table applies; users must verify support conditions, panel classification, load pattern, and code edition independently. This is not panel analysis and does not enable ACI/SBC for the primary production route. See `PATCH_NOTES_STAGE40.md`. Cache key: `slablab-v1.1-development-stage40`.

## Stage 41 — preliminary deflection and punching-demand utilities
Stage 41 adds an explicitly limited gross-uncracked elastic immediate-deflection estimate for a simply supported strip under uniform service load, plus punching-shear demand and critical-perimeter geometry for a rectangular interior column. Neither function establishes code compliance: the deflection estimate omits cracked stiffness and long-term effects, while the punching function does not calculate capacity or provide a pass/fail result. ACI/SBC remain unavailable for full production design. See `PATCH_NOTES_STAGE41.md`. Cache key: `slablab-v1.1-development-stage41`.


## Stage 42 — SBC limited-screen release-gate hardening
Stage 42 explicitly labels the SBC thickness utility as `LIMITED_SCREEN_ONLY`, sets `designReady: false`, and reports major missing design checks as not implemented. This prevents a thickness-ratio `OK` from being read as full SBC compliance. ACI/SBC remain disabled for primary production design. Run `node tests/stage42-sbc-release-gate.test.js` and the full suite. Cache key: `slablab-v1.1-development-stage42`.

### Stage 43 — Cross-code integration contract
Stage 43 adds a cross-code contract regression test for registry isolation, release gates, and limited-result semantics, and updates the service-worker cache key to `slablab-v1.1-development-stage43`. This does not complete or enable ACI 318-25 or SBC 304-2024 production design. Run `node tests/stage43-code-integration-contract.test.js` and all test files before release.

### Stage 44 — Numerical benchmark and domain-guard audit
Stage 44 adds deterministic arithmetic benchmarks for existing limited ACI helper functions and negative tests for unsupported domains. These validate the implemented arithmetic and fail-closed behavior only; they are not proof of ACI 318-25 or SBC 304-2024 normative compliance. SBC remains `LIMITED_SCREEN_ONLY`, and ACI/SBC remain disabled for full production design. Run `node tests/stage44-numerical-benchmarks.test.js` and the complete test suite. Cache key: `slablab-v1.1-development-stage44`.

### Stage 45 — Release-readiness gate (not a production release)
Stage 45 adds `RELEASE_READINESS_STAGE45.md` and a machine-readable release decision, plus `tests/stage45-release-readiness-gate.test.js`. It audits code-selection gates, SBC limited-screen status, core offline assets, local HTML references, and synchronized PWA manifests. The explicit decision is **NOT READY FOR ENGINEERING PRODUCTION**: EC2 still requires complete independent audit, and ACI 318-25 / SBC 304-2024 remain disabled pending verified normative implementation and independent benchmarks. Real-device acceptance and GitHub deployment have not been performed. Run the Stage 45 gate and all `tests/*.test.js` before any future release review. Cache key: `slablab-v1.1-development-stage45`.

### Stage 46 — Partial design on Home, shear at d from the beam, Learn lessons
Stage 46 moves the ACI 318-25 / SBC 304-2024 partial-design tools from Settings to Home, adds support-beam width/depth to the slab data so shear is checked at d from the beam face (EN 1992-1-1 6.2.1(8)), and adds the Learn section: 12 animated lessons (6 topics × concept + worked example) with a *Lesson done ✅* button and a circular cyan progress ring. See `PATCH_NOTES_STAGE46.md`.
