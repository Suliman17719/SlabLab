# SlabLab — Flexure Audit Stage 8

## Changes

1. **SLS reinforcement stress**
   - Corrected the stress expression to `σs = fyd × (As,ULS-required / As,provided) × (Mser / MEd)`.
   - The application currently approximates `Mser / MEd` using `q / n` from its selected service and ultimate load combinations. This assumption must be reviewed for the project-specific combination and load pattern.

2. **Crack-control spacing iteration**
   - Start with spacing governed by required reinforcement and the general slab spacing limit.
   - Recalculate `As,provided`, `σs`, and EC2 Table 7.3N spacing limit iteratively.
   - If Table 7.3N is not applicable at the calculated stress, direct crack-width verification remains required; no automatic pass is issued.

3. **Independent provided-steel resistance check**
   - `x = As,provided × fyd / (0.8 × fcd × b)`
   - `Mrd = As,provided × fyd × (d − 0.4x)`
   - `Mrd` is compared against `MEd`; neutral-axis ratio `x/d` is checked against `xlim` derived from the configured `K′` limit.
   - The check is an independent arithmetic cross-check using the same EC2 rectangular stress-block assumptions, not an independent full nonlinear section analysis.

4. **Validity safeguards**
   - Flexural calculations return no design result for nonpositive section dimensions or invalid strength/design parameters.
   - Results above the configured `K′` limit remain `NOT OK`, even if the automatically selected bar spacing happens to provide a large steel area.

## Verification performed

- `node --check` passed for `engine.js`, `engine2.js`, `app.js`, and `sw.js`.
- Smoke tests passed for one-way and two-way design calls.
- Tests confirmed a normal low-moment case produces `Mrd ≥ MEd`, while the section-limit check remains active for high `K`.
- Calculation-step output contains the provided-steel resistance and ductility checks.

## Limitations still open

- `K′ = 0.167` is the configured default, not a universal EC2 limit for every redistribution/ductility assumption. It must be verified against the chosen EC2 edition, National Annex, and design assumptions.
- The service/ultimate moment ratio `q/n` is an approximation tied to the current app load model. It does not replace generating the correct serviceability combination and moment envelope for each support/span.
- The crack-control table is a simplified EC2 method and relies on the table's applicability assumptions. Direct crack-width calculation under EC2 7.3.4 is not implemented.
- The provided-steel resistance check uses a simplified rectangular stress block and does not replace independent verification of all detailing, anchorage, redistribution, compression reinforcement, or section-design cases.
- Do not use the current application as construction-ready design software without an independent structural-engineering review.
