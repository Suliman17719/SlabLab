# Stage 12 — Numerical Benchmark Validation

## Purpose
Add deterministic regression tests for arithmetic and data-flow in the current engines. These tests are not a certification of compliance with EN 1992-1-1, BS 8110, ACI 318-25, or SBC 304-2024.

## Benchmarks covered
1. Material design strengths and reinforcing-bar area.
2. Default dead-load sum, slab self-weight, ULS combination, and quasi-permanent combination.
3. Simply supported one-way strip moment and shear coefficients under UDL.
4. Two-way table lookup/interpolation and moment dimensional consistency.
5. Crack-spacing table lookup/interpolation and refusal outside the encoded stress range.
6. Guards against invalid two-way panel type, aspect ratio, coefficient direction, and non-positive dimensions.
7. Fail-closed overall status while analysis, shear, or anchorage remains unresolved.

## How to run
From the project root with Node.js installed:

```sh
node tests/stage11-status.test.js
node tests/stage12-benchmarks.test.js
```

## Reference equations used in test arithmetic
- `fyd = fyk / gamma_s`
- `fcd = alpha_cc * fck / gamma_c`
- `As(bar) = pi * phi^2 / 4`
- `fctd = 0.7 * fctm / gamma_c`
- `Gk = sum(superimposed dead loads) + h * gamma_concrete`
- `n = gamma_G * Gk + gamma_Q * Qk`
- Simply supported strip under uniform load: `M = wL^2/8`, `V = wL/2`.
- Two-way coefficient moment dimensional check: `M = beta * n * lx^2`.

## Important limitations
- Tests that compare a result to the same encoded table verify lookup/interpolation and arithmetic only; they do not independently verify the table's source, edition, case mapping, or applicability.
- The encoded Table 7.3N values and BS 8110 Table 3.14 coefficients still require edition-specific source verification against licensed/official code material.
- The one-way shear demand remains a simplified estimate and the app explicitly leaves the shear check unresolved.
- Anchorage/lap remains preliminary because bond conditions and the full alpha-factor/detailing checks are not implemented.
- The deflection method and reinforcement detailing need independent hand-calculation benchmarks from a verified reference example before the app can claim full code compliance.
- A passing regression suite means the programmed arithmetic matches these stated test cases; it does not mean a slab design is safe or ready for construction.
