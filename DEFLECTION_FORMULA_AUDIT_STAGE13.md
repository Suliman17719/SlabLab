# Stage 13 — Deflection formula audit

## Correction made

The EC2 span-to-effective-depth check uses two separate reinforcement ratios:

- The basic expression uses `rho = max(As,req, As,min)/(b·d)` so that minimum reinforcement does not produce an artificially low reinforcement ratio.
- The steel-stress modification factor uses the simplified EC2 Expression (7.17) form `F1 = min[(As,prov/As,req)·(500/fyk), 1.5]`.

Previously, the code used `AsT = max(As,req, As,min)` in the denominator of `F1` as well. When minimum reinforcement governs, that is not the same as the expression's `As,req` term and can make the modification factor unnecessarily low. The code now uses `f.Ar` (required ULS reinforcement) in `F1`, while retaining `AsT` for `rho`.

## Verification

`tests/stage13-deflection.test.js` checks:

1. `rho` uses the greater of required and minimum reinforcement.
2. `F1` uses provided/required reinforcement and the configured steel grade.
3. The 1.5 cap is applied.
4. The configured long-span factor is applied beyond its threshold.
5. The actual `L/d` is calculated from span and effective depth.

Run:

```sh
node tests/stage13-deflection.test.js
node tests/stage12-benchmarks.test.js
node tests/stage11-status.test.js
```

## Limitations

This correction does not certify the complete EC2 deflection check. The applicable National Annex, structural-system factor `K`, brittle-partition assumptions, support conditions, and suitability of the simplified deemed-to-satisfy method must still be checked. This stage does not implement a full curvature/integrated deflection calculation under Clause 7.4.3. Do not treat a green deflection result as proof of code compliance without those checks.
