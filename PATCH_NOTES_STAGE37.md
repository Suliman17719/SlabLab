# SlabLab Development — Stage 37

## Delivered
- Added `oneWaySlabShear()` as a separate limited SI-unit ACI 318-25 one-way shear screen for a nonprestressed solid slab strip without minimum shear reinforcement and without axial force.
- The calculation uses the Table 22.5.5.1(c) reinforcement-ratio expression, the size-effect factor, and stated lower/upper bounds.
- Integrated the optional externally calculated factored shear `Vu` into the existing ACI one-way strip workbench. Leaving `Vu` blank explicitly reports `NOT CHECKED — ENTER Vu`; it does not silently pass shear.
- Displays `phi Vc` and `Vu` when the check is run. The main ACI/SBC production routes remain disabled.
- Bumped the service-worker cache to `slablab-v1.1-development-stage37`.

## Critical limitations
- `Vu` must be calculated externally at the governing code critical section. This helper does not calculate reactions or locate the critical section.
- It assumes no axial force, no minimum shear reinforcement, longitudinal tension reinforcement developed at the critical section, and `lambda = 1.0` unless supplied directly to the helper. It does not handle punching shear, openings, concentrated loads, or full detailing.
- Formula coefficients and all applicability conditions must be checked against the licensed authoritative ACI 318-25 Code Requirements before engineering use. This development helper is not a certification of code compliance and does not activate ACI design for production slab workflows.

## Verification
Run `for f in tests/*.test.js; do node "$f"; done`, syntax-check `app.js`, `aci318-25-engine.js`, and `sw.js`, parse the manifests, and validate the ZIP. No GitHub deployment or real-device test is claimed.
