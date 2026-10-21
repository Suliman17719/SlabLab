# Patch notes — Stage 13

- Audited the EC2 7.4.2 simplified span/depth calculation.
- Corrected the steel-stress modification factor `F1` to use `As,prov/As,req` rather than `As,prov/max(As,req, As,min)`.
- Kept the minimum-steel-adjusted reinforcement ratio in the basic span/depth expression.
- Added deterministic tests for the denominator distinction, factor cap, span/depth arithmetic, and long-span factor.
- Updated service-worker cache key to `slablab-v1.1-audit13`.
- Documented the correction and the remaining National Annex / applicability limitations.

No code edition is declared fully compliant by this patch.
