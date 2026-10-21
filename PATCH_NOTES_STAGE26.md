# SlabLab — Stage 26 Release Readiness Audit

## Changes
- Audited the packaged HTML for local asset references and added an automated release-audit test.
- Synchronized `manifest.json` and `manifest.webmanifest`; the linked manifest now uses the dark application theme and includes the maskable icon.
- Set a consistent start URL and scope for the installed PWA.
- Bumped the service-worker cache to `slablab-v1.1-release-stage26` so deployed clients can fetch the updated manifest and shell.
- Retained the fail-closed ACI 318-25 and SBC 304-2024 design-code gates.

## Verification
- Run every test: `for f in tests/*.test.js; do node "$f"; done`
- Syntax-check application and engine modules with `node --check`.
- Validate the ZIP with `unzip -t`.

## Scope and limitations
This is a software package/release-readiness audit. Automated tests do not certify structural formulas, code compliance, browser installation, real-device behavior, or offline behavior in Android Chrome/iOS Safari. EC2 remains limited-review status; ACI and SBC remain disabled. SlabLab is not construction-ready and results require independent review by a qualified structural engineer.
