# SlabLab Stage 9 — Two-way analysis and coefficient guardrails

## Scope
This stage audits coefficient-method guardrails and result communication. It does **not** certify the full BS 8110 Table 3.14 coefficient dataset or the applicability of every support case.

## Changes
- `coef()` validates the panel type (1–9), coefficient direction (1–4), and aspect ratio (`ly/lx >= 1`) rather than silently accepting invalid arguments.
- Two-way design rejects non-positive/non-finite span or thickness values and invalid support-case selections.
- Aspect ratios above 2.0 are explicitly flagged as `NOT OK` for the coefficient analysis because the present table implementation caps at 2.0; the returned capped numerical moments are only provisional and must not be treated as verified design moments.
- Two-way results now include an Analysis / coefficients status item; the default status is review-required because actual support continuity, load pattern, and table applicability cannot be confirmed from the present inputs alone.
- Service-worker cache version bumped to `slablab-v1.1-audit9` so updated code can be fetched.

## Critical limitations retained and disclosed
- The existing coefficient array is retained, not independently re-created from a verified licensed copy of BS 8110. Values, row ordering, and panel-case mapping still require cell-by-cell verification against the intended edition/table.
- The nine UI support cases simplify edge conditions. They do not capture rotational restraint stiffness, corner restraint, torsion reinforcement adequacy, openings, concentrated loads, or adjacent-panel stiffness.
- The moment expression uses `M = beta * n * lx^2` for all four coefficient families. This must be verified against the exact table convention and axis definitions before design use.
- The global shear estimate is still preliminary and not directional; see Stage 7 notes.
- BS 8110 moment coefficients combined with EC2 resistance checks are a hybrid workflow, not a claim of full compliance with either code. Document the analysis standard, design standard, and National Annex explicitly.
- Do not use this application as the sole basis for construction drawings.
