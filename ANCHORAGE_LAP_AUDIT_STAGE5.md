SlabLab — Stage 5: Anchorage and Lap Length Audit
=================================================

Scope
-----
This is a targeted correction to the existing EC2-style preliminary anchorage/lap calculations in both one-way and two-way slab engines. It is not certification of the whole app or a substitute for checking the applicable EN 1992-1-1 edition and National Annex.

Changes
-------
1. The bond-strength calculation now explicitly includes η1 and η2. The current implementation assumes good bond conditions (η1 = 1.0) and uses η2 = 1.0 for Φ ≤ 32 mm and (132 − Φ)/100 for Φ > 32 mm.
2. The required basic anchorage length is adjusted by As,req/As,prov, using the design steel area including the minimum-steel requirement.
3. The anchorage minimum is checked against max(0.3 lb,rqd, 10Φ, 100 mm).
4. The lap length is checked against max(α6·lbd, 0.3·α6·lb,rqd, 15Φ, 200 mm).
5. Both one-way and two-way calculation reports now show the lap minimum expression.
6. The UI now explicitly flags anchorage/lap as NOT OK / review required because α1–α5, actual bond conditions, cover/confinement, transverse pressure and the percentage of bars lapped are not yet captured by inputs. Overall status therefore cannot falsely claim all checks passed while these inputs remain absent.
7. Service-worker cache key bumped to slablab-v1.1-audit4.

Known limitations
-----------------
- α1–α5 are provisionally taken as 1.0; this is not a universal design assumption and must be verified for the actual bar position, cover, confinement, welded transverse bars and transverse pressure.
- α6 is user-configurable and defaults to 1.5, but the app does not calculate it from the percentage of reinforcement lapped within the required lap zone.
- Anchorage requirements at supports, hooks/bends, curtailment, transverse reinforcement, minimum spacing and detailing are not fully checked.
- The bond model assumes good bond; poor bond conditions are not selected by the user.
- Results are preliminary and must not be used as construction-ready detailing without independent review.

Tests performed
---------------
- JavaScript syntax checks: engine.js, engine2.js, app.js and sw.js passed.
- Smoke tests: one-way and two-way designs execute and return anchorage/lap outputs.
- Lap minimum test: for a low calculated lap demand, the result is not less than 200 mm and not less than 15Φ.
- Overall status test: designs remain NOT OK / review required while anchorage inputs are incomplete.
