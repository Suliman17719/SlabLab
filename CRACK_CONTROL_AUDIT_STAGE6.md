# SlabLab – Crack-control audit (Stage 6)

## Changes made
- Corrected the EC2 EN 1992-1-1:2004 Table 7.3N spacing values for `wk = 0.4, 0.3, 0.2 mm`.
- Removed the unsafe fallback that silently treated an unknown crack-width target as `wk = 0.3 mm`.
- A dash in Table 7.3N is represented as not applicable (`null`), not as a physical allowable spacing of zero.
- The simplified table is not extrapolated above 360 MPa; unsupported stress/target combinations now require direct crack-width verification.
- Corrected the false automatic `OK` for slabs `h ≤ 200 mm`. EC2 7.3.3(1) is conditional on bending without significant axial tension and compliance with detailing rules in 9.3. The app cannot yet verify all those conditions, so it flags review required rather than passing.
- SLS steel stress continues to use the ratio `As,req / As,prov` with the ULS-required flexural steel area, and the permanent/quasi-permanent load ratio `q/n`.
- If the simplified table is unavailable, the app can still propose spacing based on steel demand and general spacing limits, but it does not mark crack control as passed.
- Updated one-way and two-way calculation-step text so unavailable table limits are not displayed as `0 mm`.

## Table 7.3N values used (mm)
| Steel stress (MPa) | wk 0.4 mm | wk 0.3 mm | wk 0.2 mm |
|---:|---:|---:|---:|
| 160 | 300 | 300 | 200 |
| 200 | 300 | 250 | 150 |
| 240 | 250 | 200 | 100 |
| 280 | 200 | 150 | 50 |
| 320 | 150 | 100 | Not applicable |
| 360 | 100 | 50 | Not applicable |

Linear interpolation is used between tabulated stress points. This is a simplified crack-control check, not a direct calculation of crack width `wk` under EC2 7.3.4.

## Limitations retained
- Table 7.2N maximum-bar-diameter alternative is not implemented.
- Direct EC2 7.3.4 crack-width calculation is not implemented.
- The load ratio and reinforcement stress model should be checked against the exact selected National Annex and project SLS combination.
- This audit does not establish construction-ready compliance.
