# Stage 47 — Anchorage check fixed, longer lessons, multi-span continuous strip

## 1. Anchorage / lap check (EC2 8.4 · 8.7 · 9.3.1.2 · 9.2.1.4)
Cause: the status was hard-coded `NOT OK` in `engine.js` / `engine2.js`, so it could never pass.
Now it is calculated:
- Bond condition per bar group: η1 = 1.0 (bottom bars, or slab h ≤ 250 mm) / 0.7 (top bars, h > 250 mm); η2 from Φ.
- α2 = 1 − 0.15(cd − Φ)/Φ (0.7–1.0) with cd = min(a/2, c1, c); α1 = α3 = α4 = α5 = 1; α2·α3·α5 ≥ 0.7.
- lbd ≥ max(0.3·lb,rqd, 10Φ, 100); l0 = α6·lbd ≥ max(0.3·α6·lb,rqd, 15Φ, 200).
- Support check: FE = VEd·al/z (al = d, z = 0.9d) carried by the bars that reach the support (Bars to support, default 50 %); required lbd ≤ lav = bw − cover. Cantilever: the whole top-bar force must fit in the support.
- Two-way / irregular: x and y bottom bars checked the same way.
- Needs the support beam width `bw` (as for shear); without it the status stays NOT OK with a clear message.
- Steps screen shows every factor and the final status.

## 2. Lessons
154 slides (was 86): every Concept lesson now covers idea → mechanics → derivation → limits → common mistakes → recap; every Worked example has hand checks and "what if" variations computed by the app engines. Anchorage lessons describe the new full check.

## 3. Continuous strip (One-way slabs)
- Any number of spans (1–10), each with its own length and design load w (kN/m, blank = slab design load n).
- End conditions Pinned / Fixed, design span selector.
- Strip drawing with loads, supports and dimensions, then bending-moment diagram (red) and shear-force diagram (yellow), live as values are typed; repeated on the Results screen.
- Analysis: slope-deflection (constant EI), loads exactly as entered (no pattern loading). Verified: 2 equal spans M = wL²/8, 3 equal spans wL²/10, fixed-fixed wL²/12.
- Design uses the selected span: M sag max, larger support moment, larger end shear.

Files: engine.js, engine2.js, app.js, lessons.js, index.html, sw.js (cache stage47); new strip.js.
