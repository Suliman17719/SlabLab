SlabLab audit patch notes
=========================

Updated files:
- engine.js
- engine2.js
- app.js
- index.html
- style.css
- manifest.json
- manifest.webmanifest
- sw.js

Fixes included:
1. Deflection L/d calculation now uses at least the minimum required tension steel when forming rho, preventing an unrealistically tiny As_req from inflating the allowable L/d limit.
2. Two-way slabs now calculate separate deflection checks for short (x) and long (y) directions. The overall result passes only if both directions pass.
3. Irregular polygons are no longer shown as passing the deflection check based only on an equivalent rectangle. The app flags direct deflection verification as required.
4. Continuous-strip analysis now evaluates all eight live-load on/off patterns for the three-span local model, rather than only four.
5. Saved projects can be deleted; the home screen shows all saved projects rather than only the first three.
6. Slab IDs for two-way and irregular slabs use a text keyboard so alphabetic IDs can be entered.
7. Save deduplication now distinguishes slab type + ID, so e.g. TW1 and IR1 do not overwrite each other.
8. Asset paths for fonts/icons were corrected to match the repository's root-level files; service-worker cache version bumped to v0.9.
9. One-way BS 8110 Table 3.12 coefficient mode now requires span count, bay area, and adjacent-span data before it can report coefficient applicability as OK; it checks the published conditions (at least three approximately equal spans, bay area >30 m², Qk/Gk ≤1.25, Qk ≤5 kN/m²). Inputs are available under Optional overrides.
10. Flexural check now explicitly fails if the provided bar area is less than the required bar area, including when the minimum spacing clamp would otherwise hide the shortfall.
11. The End span input now states its assumed support case (simple outer support and first interior support).

Validation performed:
- JavaScript syntax checks passed for engine.js, engine2.js, app.js, and sw.js.
- Basic regression smoke tests passed for one-way, two-way, and irregular slab calculations.

Important engineering limitation:
This is a targeted code correction, not independent certification of every structural formula.
The two-way coefficient table is identified in the app as BS 8110 Table 3.14 coefficients, while reinforcement checks use EC2 formulas. The irregular slab yield-line/equivalent-rectangle methods also remain simplified and require engineering validation against the actual geometry and support conditions. Do not use the app as the sole basis for construction design until the full calculation methods are independently verified.

12. Shear-link output corrected: the computed quantity is an estimated number of legs per link at an assumed spacing of 0.75d, not legs per metre. Where shear reinforcement is indicated, the status now remains NOT OK until minimum shear reinforcement, spacing, link layout and detailing are verified; the output is explicitly labelled preliminary.
13. Coefficient applicability message now remains REVIEW REQUIRED even when the entered local checks pass, because the app does not yet collect and verify every span length and all support/load conditions for the complete continuous slab.

Stage 2 validation note: the smoke tests do not constitute independent validation of design equations or code compliance.

14. Bumped the service-worker cache key to `slablab-v1.0-audit3` so browsers fetch the corrected engine and result text after deployment.
15. Coefficient validation is counted as a failed/review-required check in the overall status until all-span/support/load validation is available; it cannot silently leave the overall result as OK.

Stage 5 — Anchorage and lap-length audit
----------------------------------------
16. Bond strength now explicitly includes η1 and η2; good bond is assumed and flagged as an assumption.
17. Required anchorage length uses the required steel area including minimum reinforcement, divided by provided steel area.
18. Anchorage minimum length uses max(0.3 lb,rqd, 10Φ, 100 mm).
19. Lap length uses max(α6·lbd, 0.3·α6·lb,rqd, 15Φ, 200 mm), rather than simply multiplying the anchorage length by α6.
20. Both one-way and two-way engines report preliminary anchorage/lap results and include an explicit NOT OK / review-required status while α1–α5, bond conditions and lap percentage remain unverified.
21. Service-worker cache key bumped to slablab-v1.1-audit4.


Stage 6 — Crack-control audit
-----------------------------
22. Corrected the EN 1992-1-1:2004 Table 7.3N maximum bar-spacing values for wk = 0.4, 0.3 and 0.2 mm.
23. A missing/dash table value is now treated as not applicable, not as 0 mm; the simplified table is not extrapolated beyond its stress range and unsupported wk values no longer silently fall back to 0.3 mm.
24. Removed the automatic crack-control pass for slabs with h ≤ 200 mm. The EC2 7.3.3(1) exemption is conditional on bending without significant axial tension and verified detailing under 9.3, which this app does not fully verify.
25. When Table 7.3N is not applicable, the engine marks crack control NOT OK / direct crack-width verification required, rather than passing based on a fabricated spacing limit.
26. Calculation steps no longer display a false 0 mm limit when a table value is unavailable.
27. Service-worker cache key bumped to slablab-v1.1-audit5.

- Stage 8: corrected service-steel stress to use ULS-required flexural steel divided by provided steel, multiplied by the service/ultimate load ratio.
- Stage 8: crack-control spacing is now iterated because provided steel area changes the calculated service stress and the Table 7.3N spacing limit.
- Stage 8: added a separate flexural resistance check using the provided steel area and rectangular EC2 stress block, plus a neutral-axis/ductility-limit check based on the configured K′.
- Stage 8: calculation steps expose MEd, Mrd, x/d, and the configured ductility limit; invalid material/section inputs are rejected by the flexural function.
- Stage 8: service-worker cache key bumped to slablab-v1.1-audit7.
