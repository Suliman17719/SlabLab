# SlabLab Development — Stage 30

## Purpose
Stage 30 strengthens automated regression coverage around the existing limited ACI helper without claiming that the helper is a complete ACI 318-25 design implementation.

## Changes
- Added `tests/stage30-aci-property.test.js` for strip-width scaling, reinforcement-area arithmetic, bar-spacing and bar-diameter relationships, spacing-limit boundaries, invalid-input rejection, and scope-safety assertions.
- Updated the service-worker cache key to `slablab-v1.1-development-stage30` so browsers do not continue serving the previous development cache after deployment.
- Updated release-test expectations for the new cache key.

## Explicit limitations
- No new structural design equation was introduced in this stage.
- The ACI helper remains limited and is not independently verified against the licensed ACI 318-25 text.
- Shear, punching shear, deflection, development/anchorage, full detailing, and complete slab workflows remain unimplemented or unverified.
- SBC 304-2024 remains a traceability scaffold and disabled for numerical design.
- No GitHub deployment or physical-device/PWA offline test was performed.

## Validation
Run all tests with: `for f in tests/*.test.js; do node "$f"; done`
