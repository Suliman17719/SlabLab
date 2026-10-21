# Patch notes — Stage 14

- Audited the provided-steel flexural resistance calculation.
- Exposed the provided-steel lever arm `zprov = d − 0.4x` in calculation results.
- Removed the zero-clamp that concealed negative lever-arm geometry; such cases now fail the capacity check.
- Added regression tests for equilibrium, resistance, neutral-axis geometry, and the configured `K′` limit.
- No new design code was enabled; ACI 318-25 and SBC 304-2024 remain disabled pending independent implementation and verification.
