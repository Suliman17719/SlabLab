# Patch notes — Stage 11

- Hardened overall status aggregation to fail closed.
- Missing one-way/two-way flexure or crack-control results no longer silently pass.
- Required directional two-way results must all be present.
- Irregular-panel deflection remains a required unresolved check until direct verification is available.
- Updated service-worker cache version to `slablab-v1.1-audit11`.
- Added `tests/stage11-status.test.js`.
- Added `FORMULA_STATUS_AUDIT_STAGE11.md` documenting scope and open engineering limitations.

This patch changes status reliability, not the underlying design equations. It does not certify code compliance.
