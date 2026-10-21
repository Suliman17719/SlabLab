# SlabLab — Stage 24: Design-code registry integration

## Implemented
- Added `code-registry.js` as the single source of truth for code availability and status notes.
- The Settings screen now renders code cards from that registry rather than maintaining a separate hard-coded list.
- Added fail-closed guards to one-way, two-way, and irregular-slab calculation entry points. Only the currently configured EC2 route can run.
- ACI 318-25 remains unavailable for design calculations; its preliminary flexure module is not presented as a complete code engine.
- SBC 304-2024 remains unavailable for design calculations; the current clause/requirements mapping is traceability only.
- Added the registry module to the service-worker core cache and advanced the cache version for offline updates.
- Added Stage 24 automated tests for availability routing, UI integration, script load order, and offline caching.

## Limitations
- EC2 remains `active-limited`, not fully verified or certified code compliance.
- This stage does not implement or validate new structural design equations.
- Independent engineering review remains necessary; do not use the app as the sole basis for construction design.
