# Patch Notes — Stage 15

1. Added shared input validation before calculations in `engine.js`.
2. Applied validation to one-way, two-way, and irregular-slab entry points.
3. Added validation for invalid analysis-span overrides in the two-way engine.
4. Added `tests/stage15-input-validation.test.js`.
5. Added `INPUT_VALIDATION_AUDIT_STAGE15.md` and this patch note.
6. Bumped the service-worker cache version to `slablab-v1.1-audit15`.

This stage does not implement ACI/SBC equations or remove any existing engineering review flags.
