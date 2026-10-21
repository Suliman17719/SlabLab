# Patch notes — Stage 7

- Shear checks now always require engineering review; no automatic `OK` result is emitted from the simplified global demand estimate.
- Removed preliminary shear-link leg/spacing output from calculation steps to avoid implying a valid reinforcement design.
- Added explicit explanation of one-way/two-way shear model limitations in `SHEAR_AUDIT_STAGE7.md`.
- Updated service-worker cache key to `slablab-v1.1-audit6`.
- JavaScript syntax and smoke tests passed at packaging time.
