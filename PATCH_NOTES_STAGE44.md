# Stage 44 — Numerical benchmark and domain-guard audit

- Added `tests/stage44-numerical-benchmarks.test.js` with independent arithmetic checks for coefficient-driven two-way moments, simply-supported uniform-load shear demand, preliminary gross-section deflection, punching-demand geometry, and the limited one-way thickness screen.
- Added negative-domain checks for unsupported panel aspect ratio, negative factored loads, unsupported support conditions, and edge-column punching geometry.
- Reasserted that the SBC screen is not design-ready and that deflection/punching outputs remain limited utilities rather than code-compliance checks.
- Updated the service-worker cache key and existing cache-version assertions to Stage 44.

## Scope and caveats
These tests verify arithmetic and fail-closed behavior of implemented helper functions only. They do **not** validate normative ACI 318-25 or SBC 304-2024 compliance, and do not replace independent structural-engineering review. ACI/SBC full-design routes remain disabled; authoritative provisions and broader independent validation are still required.
