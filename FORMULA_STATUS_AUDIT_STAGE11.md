# SlabLab — Stage 11: Formula-status audit and fail-closed result aggregation

## Scope of this patch
This stage hardens the result-status logic. It does **not** certify the structural formulas or establish full compliance with EC2, BS 8110, ACI 318-25, or SBC 304-2024.

## Changes
- Overall status now passes only when every required status explicitly starts with `OK`; `REVIEW REQUIRED`, `NOT OK`, preliminary, blank, or unavailable states do not count as a pass.
- One-way flexure, spacing and crack-control status no longer default to `OK` when required calculation results are missing.
- Two-way flexure, spacing and crack-control status require the expected directional results to exist; a missing direction is unresolved.
- Irregular-panel overall status continues to require all included checks, including direct deflection verification, to pass.
- The service-worker cache key is bumped to `slablab-v1.1-audit11` so updated application scripts are fetched after deployment.
- Added repeatable Node tests for unresolved checks and invalid panel/coefficient inputs.

## Verification performed
- `node --check app.js`
- `node --check engine.js`
- `node --check engine2.js`
- `node --check sw.js`
- `node tests/stage11-status.test.js`
- Example one-way, two-way and irregular/equivalent-rectangle calculations were run. They correctly remain `NOT OK` because the app still flags shear and anchorage as unresolved; the two-way coefficient analysis also remains `REVIEW REQUIRED`.

## Important engineering limitations still open
1. Shear verification is still a preliminary/global screen and is not a completed design check at critical sections.
2. Anchorage and lap calculations remain preliminary; bond conditions and the required EC2 detailing factors are not fully captured.
3. Two-way coefficient selection is not a full independent verification of edge continuity, loading pattern and table applicability. The ratio range is restricted by the table implementation.
4. Deflection and crack-control simplifications need validation against the exact selected code edition, National Annex and benchmark examples.
5. No ACI or SBC design engine is activated. Their code-specific provisions must not be inferred from EC2 or BS 8110.
6. This application is for educational/preliminary calculations and is not a substitute for an engineer's independent design review.

## Release decision
**Audit hardening only — not construction-ready.** A green overall status is intentionally difficult to obtain until all required checks are explicitly implemented and verified.
