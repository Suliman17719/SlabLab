# SlabLab — Stage 29

## ACI two-way slab strip calculation consistency fix

Corrected `ACI31825.twoWaySlabReinforcement()` so the provided reinforcement area is calculated over the actual entered strip width `b`, consistent with `grossArea = b × h` and `AsMin = 0.0018 × grossArea`. Previously, the provided steel calculation always assumed a 1000 mm strip even when the user entered a different `b`, which could produce inconsistent comparisons.

Updated the output units label and added a regression test for a 500 mm strip.

## Scope and safety

This is a calculation-consistency fix only. It does not validate the cited ACI provisions or make ACI 318-25 a complete slab-design workflow. Confirm all applicable provisions and exceptions against the licensed ACI 318-25 text. SBC 304-2024 remains disabled pending verified numerical implementation.
