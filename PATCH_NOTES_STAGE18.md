# Stage 18 patch notes
- Added `sbc304-2024-engine.js` as a separate, fail-closed SBC module.
- Added `tests/stage18-sbc-scaffold.test.js`.
- Added `SBC304_2024_STAGE18.md` documenting the official chapter map and limitations.
- Updated app registry wording to identify the new module while keeping SBC disabled.
- Added the SBC module to `index.html` and service-worker precache list; bumped cache version.
- No SBC calculation is enabled. Existing EC2 behavior and ACI preliminary module are unchanged.
