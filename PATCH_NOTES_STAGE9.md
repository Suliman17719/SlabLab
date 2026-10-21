# Patch notes — Stage 9

1. Added strict input validation to the two-way coefficient lookup.
2. Added analysis status for the coefficient method; review is required even for ratios within the table range because support/load applicability is not fully represented.
3. Explicitly flags `ly/lx > 2.0` as outside the supported coefficient range. Numeric output remains capped for diagnostic continuity only and is not approved for design.
4. Added an Analysis / coefficients check to the two-way results screen.
5. Bumped service-worker cache key to `slablab-v1.1-audit9`.
6. Added `TWO_WAY_ANALYSIS_AUDIT_STAGE9.md` documenting limitations.
