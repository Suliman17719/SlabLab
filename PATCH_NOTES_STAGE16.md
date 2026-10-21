# Patch notes — Stage 16
- Added standalone `aci318-25-engine.js` preliminary flexural section module.
- Added `tests/stage16-aci-flexure.test.js`.
- Added `ACI318_25_STAGE16.md` scope and limitations.
- Added module script and service-worker cache entry; bumped cache key to `slablab-v1.1-aci-stage16`.
- Added explicit app-level rejection of negative live-load defaults and overrides for all slab routes; validation error text is surfaced to the user.
- ACI remains disabled in the user-facing code selector until the full code-specific engine is implemented and independently verified.
