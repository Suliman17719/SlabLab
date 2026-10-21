# Stage 46 — Partial design on Home, shear at d from the support beam, Learn lessons

Scope of this stage: only the three requested changes. No other calculation, status or screen was changed.

## 1. ACI / SBC partial-design tools moved from Settings to Home
- Home now has a **Partial design** section between *Slab types* and *Recent projects*: *American code · ACI 318-25* (6 tools) and *Saudi code · SBC 304-2024* (2 tools). The tools, their inputs and their calculations are unchanged.
- Settings keeps the design-code registry and now points to Home. The tool screens return to Home, and Home stays highlighted in the bottom bar while a tool is open.
- The limited-scope notice is kept on Home: these tools do not activate ACI or SBC for full-slab design.

## 2. Shear checked at d from the face of the supporting beam (EN 1992-1-1 6.2.1(8))
- New inputs in **Slab data** for one-way, two-way and irregular slabs: **beam width bw** and **beam depth hb** (mm).
- Critical section: `x = bw/2 + d` from the beam centre-line (spans are centre-to-centre of the beams).
  - `VEd,d = V − n·x` and `VEd,face = V − n·bw/2` (V = support shear, kN/m).
  - Check 1: `VEd,d ≤ VRd,c`. Check 2: `VEd,face ≤ VRd,max`. Both must pass for `OK`.
  - Two-way and irregular slabs use dx and dy for the two directions; the same V is used for both (as before), so the check stays conservative.
  - Irregular / Manual (FE): the entered V Ed is taken at the support line and is reduced to d. Enter the value at the support line, not already reduced.
- If bw is empty the app does not guess: Shear stays `NOT OK` with the message *support beam width not entered*. Projects saved before this stage open the same way.
- Validation: bw must be positive; hb (optional) must not be smaller than the slab thickness; bw/2 + d must lie inside the span.
- `OK` is valid under the assumptions listed in the Steps screen (UDL on the top face, direct support, tension bars anchored beyond lbd + d, EC2 recommended CRd,c). The overall banner can still read *Review needed* because other checks (for example anchorage / lap) are intentionally still preliminary; they were not touched.
- Results: the tile *V Ed* is now *V support* (centre-line value) and a note under the reinforcement shows `VEd,d` against `VRd,c`.

## 3. Learn: 12 animated lessons with progress tracking
- Six topics (Flexure, Shear, Deflection, Crack control, Anchorage & lap, Yield line), each with **Concept** and **Worked example** (86 slides in total).
- Lessons are slide presentations drawn inside the app with the app palette, fonts and light/dark themes (offline, no media files). Controls: Next / Back / Play (auto-advance) / swipe / arrow keys.
- Worked-example numbers are computed by the same engines as the calculator from fixed example inputs (slab S1, L = 4.0 m, 300 × 500 mm beams, project default materials), so they always agree with the app.
- **Lesson done ✅** on the last slide (tap again to undo). A circular **cyan progress ring** at the top of Learn shows completed lessons; progress is stored on the device (`sl_lessons`).

## Files
Changed: `app.js`, `engine.js`, `engine2.js`, `style.css`, `index.html`, `sw.js` (cache `slablab-v2.1-stage46`, `lessons.js` added).
New: `lessons.js`, `PATCH_NOTES_STAGE46.md`.

## Verification performed
- Shear numbers checked against an independent hand calculation (slab S1: V = 33.864, VEd,d = 27.616, VRd,c = 104.81, VRd,max = 519.94 kN/m).
- 196 regression comparisons against the previous engines: every result other than shear is identical.
- Browser run on a phone-size viewport (light and dark): Home, Settings, all eight tools, three slab types, saved projects, all 86 slides, progress persistence, auto-play and offline reload.

## Open observation (not changed in this stage)
- Irregular slab, *Yield Line* mode: the existing estimate `V = n·hmax/2` is the **average** edge reaction of the largest plate. If the load is carried straight to the edge (tributary strip) the maximum shear per metre can be about twice that. Review before relying on shear for yield-line panels.
