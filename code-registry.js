/* Central code availability registry. A status of active-limited is not a claim of full code compliance. */
(function (root) {
  'use strict';
  const registry = Object.freeze({
    EC2: Object.freeze({
      label: 'Eurocode 2', status: 'active-limited', selectable: true,
      designEngine: 'SL / SL2',
      analysisTables: 'BS 8110 coefficients only where explicitly identified',
      note: 'Limited audit status; independent engineering review remains required.'
    }),
    ACI318_25: Object.freeze({
      label: 'ACI 318-25', status: 'disabled', selectable: false,
      designEngine: 'aci318-25-engine.js (preliminary flexure only)',
      analysisTables: null,
      note: 'Preliminary section module only. Full provisions and independent verification remain outstanding.'
    }),
    SBC304_2024: Object.freeze({
      label: 'SBC 304-2024', status: 'disabled', selectable: false,
      designEngine: 'sbc304-2024-engine.js (requirements traceability only)',
      analysisTables: null,
      note: 'Full design disabled; includes a limited SBC Table 7.3.1.1 thickness screen at fy = 420 MPa only.'
    })
  });
  const activeCode = 'EC2';
  function canRunDesign(code) {
    return code === activeCode && !!registry[code] && registry[code].selectable === true;
  }
  function assertDesignCode(code) {
    if (!canRunDesign(code)) throw new Error('Design calculations are disabled for code: ' + String(code));
    return true;
  }
  root.SL_CODES = Object.freeze({ registry, activeCode, canRunDesign, assertDesignCode });
})(typeof window !== 'undefined' ? window : globalThis);
