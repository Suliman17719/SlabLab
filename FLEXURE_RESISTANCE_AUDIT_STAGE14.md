# Stage 14 — Flexural resistance audit

## Scope
This stage audits the implemented singly reinforced rectangular-section calculation in `engine.js`, which is shared by the two-way slab engine. It does not certify complete EN 1992-1-1 compliance.

## Resistance equations made explicit
- `x = As,prov · fyd / (0.8 · fcd · b)`
- `zprov = d − 0.4x`
- `MRd = As,prov · fyd · zprov`
- Capacity is accepted only if `0 < x < d`, `zprov > 0`, and `MRd ≥ MEd` within numerical tolerance.

Previously the reported lever arm used `max(0, d − 0.4x)`. This clamp could conceal a non-physical negative lever arm in diagnostics. The engine now preserves the raw `zprov` and explicitly rejects invalid neutral-axis geometry.

## Existing design checks retained
- `K = MEd / (b · d² · fck)`.
- The calculation still uses the configured `K′` limit for diagnostic steel sizing, and the design remains rejected when `K > K′`.
- Minimum steel and maximum steel checks remain separate from the provided-steel resistance check.

## Automated verification
`tests/stage14-flexure.test.js` verifies dimensional arithmetic, the implemented rectangular-block lever arm, required-steel equilibrium, provided-steel resistance, invalid neutral-axis geometry, and rejection above the configured `K′` limit.

## Limitations
This is an implementation audit, not an independent certification of all code clauses. The exact EC2 edition, National Annex, section assumptions, material factors, strain limits, compression reinforcement, and detailing provisions must be confirmed before claiming code compliance. The application must continue to label unresolved checks as review-required.
