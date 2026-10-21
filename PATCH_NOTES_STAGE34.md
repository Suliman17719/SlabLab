# SlabLab Development — Stage 34

## Implemented
- Added an independent, limited SBC 304-2024 one-way solid slab minimum-thickness screen based on the support ratios in Table 7.3.1.1.
- Added a dedicated SBC thickness workbench, input validation, output, and a separate test suite.
- Restricted the helper to fy = 420 MPa because the edition-specific adjustment has not yet been verified from the normative SBC Code Requirements text.
- Kept full SBC design disabled. No flexural strength, shear, punching, reinforcement design, or deflection calculation is enabled.
- Updated service-worker cache to `slablab-v1.1-development-stage34` and updated existing cache assertions.

## Verification boundary
The official SBC portal identifies the SBC 304-2024 edition, and the published official Table 7.3.1.1 ratios are 20, 24, 28 and 10 for simply supported, one-end continuous, both-ends continuous and cantilever slabs, respectively. This helper is a limited table screen, not a substitute for checking the full Code Requirements, applicability conditions, exceptions, material factors or deflection. No claim of full SBC compliance is made.

## Tests
Run `node tests/stage34-sbc-oneway-thickness.test.js` and the full `tests/*.test.js` suite. The feature has unit/UI source assertions only; it has not been tested on a real device or deployed to GitHub Pages.
