/* SlabLab – Learn: 6 topics × 2 lessons (concept + worked example), shown as themed slide presentations.
   Every number in the worked examples is computed by the same engines the app uses, from fixed example inputs
   (independent of the user's Project defaults), so the lessons always agree with the calculator. Works offline. */
(function (root) {
  'use strict';
  const E = root.SL, E2 = root.SL2, g = E.g;
  const C = { gr: '#12C26B', gr2: '#0C9A55', cy: '#1DD3F0', cy2: '#0DAFCB', mu: '#9FB8B0', con: '#C8D4D0', conD: '#8FA39C', dk: '#0A0F0D', wh: '#FFFFFF', am: '#F5A524', rd: '#EF4444' };
  const LT = '&lt;', GT = '&gt;';
  const fx = (x, n) => Number(x).toFixed(n);

  /* ---------------------------------------------------------------- worked-example models */
  let _m = null;
  function M() {            // running example: slab S1 – one-way, simply supported, L = 4.0 m, on 300 × 500 beams
    if (_m) return _m;
    const c = Object.assign({}, E.DEF), inp = { cs: 'Simply supported', L: 4000, bw: 300, hb: 500 };
    const R = E.design(inp, c), o = R.o, fs = R.fs, sh = R.sh, at = sh.at;
    const sp1 = Math.max(Math.min(E.f25(fs.sreq), Math.min(3 * R.h, 400)), 25);               // strength-only spacing
    const trial = sp => { const Ap = o.Ab * c.b / sp, sg = o.fyd * (fs.Ar / Ap) * (R.ld.q / R.ld.n); return { sp, Ap, sg, sm: E.smax(sg, c.wk) }; };
    const t1 = trial(sp1), t2 = trial(fs.sp);
    const Kuse = Math.min(fs.K, c.Kl), zform = R.d * (0.5 + Math.sqrt(Math.max(0, 0.25 - Kuse / o.k2)));
    _m = { c, inp, R, o, fs, sh, at, sp1, t1, t2, zform, df: R.df, an: R.anch.sag };
    return _m;
  }
  let _y = null;
  function Y() {            // yield-line example: 4.0 m square panel, all edges simple (S) or all continuous (C, i = 1)
    if (_y) return _y;
    const c = Object.assign({}, E.DEF), ld = E.loads(c, c.h, 0, null);
    const poly = e => ({ nv: 4, x: [0, 4000, 4000, 0, '', ''], y: [0, 0, 4000, 4000, '', ''], e: [e, e, e, e, 'S', 'S'], ri: 1, Pxo: '', Pyo: '' });
    const S = E2.yieldLine(poly('S'), ld.n), K = E2.yieldLine(poly('C'), ld.n);
    const edges = Z => Z.ed.map(e => { const h = Math.abs(e.dx * (Z.Pys - e.y) - e.dy * (Z.Pxs - e.x)) / e.L; return { L: e.L, h, Lh: e.L * h, Lhr: e.L / h, rho: e.rho }; });
    _y = { c, ld, S, K, eS: edges(S), eK: edges(K) };
    return _y;
  }

  /* ---------------------------------------------------------------- html helpers */
  const P = t => `<p>${t}</p>`;
  const UL = a => `<ul>${a.map(t => `<li>${t}</li>`).join('')}</ul>`;
  const EQ = (label, formula, note, hl) => `<div class="eq${hl ? ' hl' : ''}"><small>${label}</small><code>${formula}</code>${note ? `<span${/^\s*=|<b>|[✓✗]/.test(note) ? ' class="n"' : ''}>${note}</span>` : ''}</div>`;
  const CALL = (t, k) => `<div class="cl${k ? ' ' + (k === 'am' ? 'warn' : k) : ''}">${t}</div>`;
  const FIG = (svg, cap) => `<div class="fg">${svg}</div>${cap ? `<p class="cap">${cap}</p>` : ''}`;
  const MT = a => `<div class="mt2">${a.map(([l, v, u]) => `<div>${l}<b>${v}</b>${u || ''}</div>`).join('')}</div>`;
  const CHIPS = a => `<div class="chs">${a.map(([t, k]) => `<span class="chip ${k || 'ok'}">${t}</span>`).join('')}</div>`;
  const KV = a => `<div class="kv">${a.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>`;
  const BAR = (l, v, col) => `<div class="br" style="--c:${col || C.gr}">${l}<b>${v}</b></div>`;
  const SD = (tag, h, html) => ({ tag, h, html });
  const TITLE = (T, kind, h, sub) => ({ title: true, topic: T.name, icon: T.icon, kind, h, sub });

  /* ---------------------------------------------------------------- svg helpers */
  const svg = (vb, body) => `<svg viewBox="${vb}" role="img" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const tx = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-size="${o.s || 9}" font-weight="${o.w || 500}" fill="${o.c || C.mu}" text-anchor="${o.a || 'middle'}"${o.i ? ' font-style="italic"' : ''}>${t}</text>`;
  const ln = (x1, y1, x2, y2, col, w, dash, cls, dl) => { const fd = dash && cls === 'dr'; return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${col}" stroke-width="${w || 1.2}" fill="none"${dash ? ` stroke-dasharray="${dash}"` : ''}${cls ? (fd ? ' class="fd"' : ` class="${cls}" pathLength="1"`) : ''}${dl ? ` style="animation-delay:${dl}s"` : ''}/>`; };
  function arr(x1, y1, x2, y2, col, w, hs, cls, dl) {
    col = col || C.cy; w = w || 1.5; hs = hs || 5;
    const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - hs * Math.cos(a), hy = y2 - hs * Math.sin(a), px = -Math.sin(a) * hs * 0.55, py = Math.cos(a) * hs * 0.55;
    return `<path d="M${x1} ${y1}L${hx.toFixed(1)} ${hy.toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none"${cls ? ` class="${cls}" pathLength="1"` : ''}${dl ? ` style="animation-delay:${dl}s"` : ''}/><path d="M${x2} ${y2}L${(hx + px).toFixed(1)} ${(hy + py).toFixed(1)}L${(hx - px).toFixed(1)} ${(hy - py).toFixed(1)}z" fill="${col}"/>`;
  }
  const dim = (x1, y1, x2, y2, col) => arr(x1, y1, x2, y2, col || C.cy, 1, 4) + arr(x2, y2, x1, y1, col || C.cy, 1, 4);
  const supp = (x, y, col) => `<path d="M${x - 7} ${y + 10}L${x} ${y}L${x + 7} ${y + 10}z" fill="${col || C.wh}"/>`;
  const udl = (x1, x2, y1, y2, n, col, dl) => { let s = ''; const st = (x2 - x1) / (n - 1); for (let i = 0; i < n; i++) s += arr(x1 + i * st, y1, x1 + i * st, y2, col || C.gr, 1.3, 4); return s; };

  /* ---------------------------------------------------------------- figures */
  function figFlexure() {                         // section · strain · stress/forces
    return svg('0 0 300 172',
      // section
      `<rect x="14" y="22" width="60" height="100" rx="2" fill="${C.con}" stroke="${C.conD}"/>` +
      [26, 44, 62].map(x => `<circle cx="${x}" cy="110" r="3.6" fill="${C.gr}"/>`).join('') +
      dim(84, 22, 84, 110, C.cy) + tx(93, 69, 'd', { c: C.cy, s: 10, w: 700, a: 'start' }) +
      tx(44, 138, 'b = 1000', { s: 8.5 }) +
      // strain
      ln(150, 18, 150, 124, C.mu, 1, '3 3') +
      `<polygon points="118,22 150,22 150,62" fill="rgba(29,211,240,.32)" stroke="${C.cy}" stroke-width="1.2"/>` +
      `<polygon points="150,62 188,110 150,110" fill="rgba(18,194,107,.32)" stroke="${C.gr}" stroke-width="1.2"/>` +
      ln(118, 22, 188, 110, C.wh, 1.3, '', 'dr', 0.2) +
      ln(104, 62, 196, 62, C.mu, 0.8, '2 3') + tx(176, 58, 'N.A.', { a: 'start', s: 7.5 }) +
      tx(120, 16, 'εc', { c: C.cy, w: 700, s: 10 }) + tx(185, 124, 'εs', { c: C.gr, w: 700, s: 10 }) +
      dim(158, 22, 158, 62, C.am) + tx(164, 45, 'x', { c: C.am, w: 700, s: 10, a: 'start' }) +
      // stress block + forces
      ln(240, 18, 240, 124, C.mu, 1, '3 3') +
      `<rect x="212" y="22" width="28" height="32" fill="rgba(29,211,240,.32)" stroke="${C.cy}" stroke-width="1.2"/>` +
      tx(226, 17, 'fcd', { c: C.cy, w: 700, s: 9 }) + tx(226, 66, '0.8x', { s: 8, c: C.am, w: 700 }) +
      arr(288, 38, 246, 38, C.cy, 2, 6, 'dr', 0.5) + tx(268, 31, 'Fc', { c: C.cy, w: 700, s: 10 }) +
      arr(246, 110, 288, 110, C.gr, 2, 6, 'dr', 0.8) + tx(268, 126, 'Fs = As·fyd', { c: C.gr, w: 700, s: 8.5 }) +
      dim(262, 40, 262, 108, C.wh) + tx(257, 77, 'z', { c: C.wh, w: 700, s: 10, a: 'end' }) +
      tx(44, 156, 'Section', { s: 9 }) + tx(150, 156, 'Strain', { s: 9 }) + tx(250, 156, 'Stress block · forces', { s: 9 }));
  }
  function figMoment(L, M) {                      // simply supported slab: UDL, parabola M = nL²/8
    return svg('0 0 300 138',
      udl(40, 260, 12, 30, 12, C.gr) + tx(282, 24, 'n', { c: C.gr, w: 700, s: 10 }) +
      `<rect x="30" y="32" width="240" height="10" rx="2" fill="${C.con}"/>` + supp(40, 42, C.wh) + supp(260, 42, C.wh) +
      ln(40, 64, 260, 64, C.mu, 1) +
      `<path d="M40 64Q150 136 260 64" fill="rgba(29,211,240,.18)" stroke="${C.cy}" stroke-width="1.6" class="dr" pathLength="1"/>` +
      ln(150, 64, 150, 100, C.am, 1, '2 2') + tx(150, 114, 'M = nL²/8' + (M != null ? ' = ' + g(M, 2) + ' kNm/m' : ''), { c: C.am, w: 700, s: 9.5 }) +
      dim(40, 126, 260, 126, C.cy) + tx(150, 136, 'L' + (L ? ' = ' + L : ''), { c: C.cy, w: 700, s: 9 }));
  }
  function figShear(v) {                          // slab on beams + shear-force diagram + critical section at d from the face
    v = v || {};
    const xc = 80, xf = 50;
    return svg('0 0 300 190',
      udl(30, 270, 8, 30, 11, C.gr) + tx(284, 20, 'n', { c: C.gr, w: 700, s: 10 }) +
      `<rect x="26" y="34" width="248" height="14" rx="2" fill="${C.con}"/>` +
      `<rect x="14" y="48" width="36" height="34" rx="2" fill="${C.conD}"/><rect x="250" y="48" width="36" height="34" rx="2" fill="${C.conD}"/>` +
      tx(32, 68, 'beam', { s: 7.5, c: C.dk, w: 600 }) + tx(268, 68, 'beam', { s: 7.5, c: C.dk, w: 600 }) +
      ln(32, 34, 32, 184, C.mu, 0.8, '3 3') + ln(268, 34, 268, 184, C.mu, 0.8, '3 3') +
      ln(32, 148, 268, 148, C.mu, 1) +
      `<polygon points="32,148 32,110 150,148" fill="rgba(29,211,240,.22)" stroke="${C.cy}" stroke-width="1.4"/>` +
      `<polygon points="150,148 268,148 268,186" fill="rgba(18,194,107,.2)" stroke="${C.gr}" stroke-width="1.4"/>` +
      ln(xf, 48, xf, 160, C.wh, 0.8, '2 2') +
      `<path d="M${xc} 34V160" stroke="${C.am}" stroke-width="1.4" stroke-dasharray="4 3" fill="none" class="fd" style="animation-delay:.4s"/>` +
      `<circle cx="${xf}" cy="115.7" r="3" fill="${C.wh}"/><circle cx="${xc}" cy="125.4" r="4.2" fill="${C.cy}" stroke="${C.wh}" stroke-width="1.3"/>` +
      dim(32, 97, xf, 97, C.wh) + dim(xf, 97, xc, 97, C.am) +
      tx(41, 91, 'bw/2', { s: 7.5, c: C.wh }) + tx((xf + xc) / 2, 91, 'd', { s: 9, c: C.am, w: 700 }) +
      tx(26, 110, 'V', { a: 'end', c: C.cy, w: 700, s: 10 }) +
      tx(xc + 10, 116, v.Vd ? 'VEd,d = ' + v.Vd : 'VEd,d', { a: 'start', c: C.cy, w: 700, s: 9 }) +
      tx(36, 166, 'Shear force V', { a: 'start', s: 8.5 }) + (v.V ? tx(36, 178, 'V = ' + v.V + ' kN/m', { a: 'start', s: 8.5, c: C.mu }) : ''));
  }
  function figDeflection(txt) {
    return svg('0 0 300 128',
      udl(40, 260, 6, 24, 12, C.gr) +
      ln(40, 52, 260, 52, C.mu, 1.2, '4 3') +
      `<path d="M40 52Q150 108 260 52" fill="none" stroke="${C.cy}" stroke-width="2.2" class="dr" pathLength="1"/>` +
      supp(40, 52, C.wh) + supp(260, 52, C.wh) +
      dim(150, 52, 150, 80, C.am) + tx(158, 68, 'δ', { a: 'start', c: C.am, w: 700, s: 11 }) +
      dim(40, 106, 260, 106, C.cy) + tx(150, 119, 'L', { c: C.cy, w: 700, s: 10 }) +
      tx(150, 44, txt || 'δ ≤ L/250', { c: C.am, w: 700, s: 9.5 }));
  }
  function figBars(a, b, la, lb) {                // horizontal comparison bars (actual vs allowed)
    const mx = Math.max(a, b) * 1.08, w1 = 230 * a / mx, w2 = 230 * b / mx;
    return svg('0 0 300 96',
      tx(8, 14, la, { a: 'start', s: 9, c: C.wh, w: 600 }) + `<rect x="8" y="20" width="${w1.toFixed(1)}" height="16" rx="8" fill="${C.cy}" class="gw"/>` + tx(Math.min(8 + w1 + 6, 252), 32, g(a, 1), { a: 'start', c: C.cy, w: 700, s: 10 }) +
      tx(8, 56, lb, { a: 'start', s: 9, c: C.wh, w: 600 }) + `<rect x="8" y="62" width="${w2.toFixed(1)}" height="16" rx="8" fill="${C.gr}" class="gw"/>` + tx(Math.min(8 + w2 + 6, 252), 74, g(b, 1), { a: 'start', c: C.gr, w: 700, s: 10 }));
  }
  function figCrack() {
    const bars = [50, 110, 170, 230].map(x => `<circle cx="${x}" cy="80" r="4" fill="${C.gr}"/>`).join('');
    const crack = x => `<path d="M${x} 94L${x + 2} 80L${x - 2} 66L${x + 2} 52L${x} 42" stroke="${C.dk}" stroke-width="1.6" fill="none" class="dr" pathLength="1"/>`;
    return svg('0 0 300 132',
      `<rect x="20" y="22" width="260" height="72" rx="3" fill="${C.con}" stroke="${C.conD}"/>` + bars + crack(80) + crack(140) + crack(200) + crack(260) +
      dim(110, 108, 170, 108, C.cy) + tx(140, 121, 'bar spacing s', { c: C.cy, w: 700, s: 9 }) +
      arr(120, 98, 136, 98, C.am, 1.2, 3) + arr(156, 98, 144, 98, C.am, 1.2, 3) + tx(150, 17, 'service load: cracks open at the bottom face', { s: 8.5 }) +
      tx(174, 36, 'wk', { a: 'start', c: C.am, w: 700, s: 9 }));
  }
  function figSmax(pts, hl) {                     // Table 7.3N: s max vs steel stress, for wk = 0.4 / 0.3 / 0.2 (hl = limit to emphasise)
    const X = s => 40 + (s - 160) * 1.2, Yv = s => 140 - s * 0.4;
    const dm = w => hl != null && String(hl) !== String(w);
    const L = (arr, col, dash, w, op) => `<polyline points="${arr.map(p => X(p[0]).toFixed(1) + ',' + Yv(p[1]).toFixed(1)).join(' ')}" fill="none" stroke="${col}" stroke-width="${w || 1.6}" opacity="${op || 1}"${dash ? ` stroke-dasharray="${dash}" class="fd"` : ' class="dr" pathLength="1"'}/>`;
    let s = '';
    for (const v of [100, 200, 300]) s += ln(40, Yv(v), 280, Yv(v), 'rgba(159,184,176,.25)', 0.8) + tx(34, Yv(v) + 3, v, { a: 'end', s: 8 });
    for (const v of [160, 200, 240, 280, 320, 360]) s += tx(X(v), 154, v, { s: 8 });
    s += ln(40, 20, 40, 140, C.mu, 1) + ln(40, 140, 280, 140, C.mu, 1);
    s += L([[160, 300], [200, 300], [240, 250], [280, 200], [320, 150], [360, 100]], C.mu, '4 3', dm(0.4) ? 1.1 : 1.6, dm(0.4) ? 0.45 : 1) +
      L([[160, 300], [200, 250], [240, 200], [280, 150], [320, 100], [360, 50]], C.cy, '', dm(0.3) ? 1.2 : 2.2, dm(0.3) ? 0.45 : 1) +
      L([[160, 200], [200, 150], [240, 100], [280, 50]], C.am, '', dm(0.2) ? 1.2 : 1.8, dm(0.2) ? 0.45 : 1);
    s += tx(X(360) + 4, Yv(100) + 3, '0.4', { a: 'start', s: 8, c: C.mu, w: 700 }) + tx(X(360) + 4, Yv(50) + 3, '0.3', { a: 'start', s: 8, c: C.cy, w: 700 }) + tx(X(280) + 4, Yv(50) + 3, '0.2', { a: 'start', s: 8, c: C.am, w: 700 });
    s += tx(160, 168, 'steel stress σs  (N/mm²)', { s: 8.5 }) + `<text transform="translate(9 80) rotate(-90)" font-size="8.5" fill="${C.mu}" text-anchor="middle">s max (mm)</text>` + tx(150, 12, 'EC2 Table 7.3N · lines = wk limit (mm)', { s: 8.5 });
    (pts || []).forEach(p => { const col = p.ok ? C.gr : C.rd; s += `<circle cx="${X(p.sg).toFixed(1)}" cy="${Yv(p.sp).toFixed(1)}" r="4.6" fill="${col}" stroke="${C.wh}" stroke-width="1.2"/>` + tx(+X(p.sg).toFixed(1) + 8, +Yv(p.sp).toFixed(1) + (p.dy || 3), p.t, { a: 'start', s: 8.5, c: C.wh, w: 700 }); });
    return svg('0 0 300 174', s);
  }
  function figAnchor(v) {                         // anchorage of a bar and a lap splice
    v = v || {};
    return svg('0 0 300 158',
      `<rect x="20" y="16" width="232" height="46" rx="3" fill="${C.con}" stroke="${C.conD}"/>` +
      `<path d="M38 39H284" stroke="${C.gr}" stroke-width="5" stroke-linecap="round" class="dr" pathLength="1"/>` +
      [56, 74, 92, 110, 128, 146, 164, 182, 200, 218].map(x => `<path d="M${x} 35l4 8" stroke="${C.dk}" stroke-width="1" opacity=".5"/>`).join('') +
      arr(262, 39, 296, 39, C.gr, 2, 6) + tx(278, 31, 'Fs', { c: C.gr, w: 700, s: 10 }) +
      [60, 100, 140, 180, 220].map(x => arr(x + 22, 50, x, 50, C.cy, 1.3, 4)).join('') + tx(130, 59, 'bond stress fbd', { s: 8, c: C.cy, w: 600 }) +
      dim(38, 72, 252, 72, C.am) + tx(145, 84, 'anchorage length lbd' + (v.lbd ? ' = ' + v.lbd + ' mm' : ''), { c: C.am, w: 700, s: 9 }) +
      `<path d="M30 112H190" stroke="${C.gr}" stroke-width="4.5" stroke-linecap="round"/><path d="M110 124H270" stroke="${C.cy}" stroke-width="4.5" stroke-linecap="round"/>` +
      arr(30, 112, 12, 112, C.gr, 1.8, 5) + arr(270, 124, 290, 124, C.cy, 1.8, 5) +
      ln(110, 104, 110, 136, C.am, 0.8, '2 2') + ln(190, 104, 190, 136, C.am, 0.8, '2 2') +
      dim(110, 140, 190, 140, C.am) + tx(150, 153, 'lap length l0' + (v.l0 ? ' = ' + v.l0 + ' mm' : ''), { c: C.am, w: 700, s: 9 }));
  }
  function figYieldPlan(o) {                      // convex polygon with a fan of yield lines to apex P
    o = o || {};
    const P = o.P || [[0, 0], [6, 0], [5, 4], [0, 4]], ap = o.ap, W = 300, H = o.H || 150, m = 22;
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min((W - 2 * m) / (x1 - x0), (H - 2 * m) / (y1 - y0)), ox = (W - (x1 - x0) * s) / 2, oy = (H - (y1 - y0) * s) / 2;
    const X = x => ox + (x - x0) * s, Yy = y => H - oy - (y - y0) * s;
    const pts = P.map(p => X(p[0]).toFixed(1) + ',' + Yy(p[1]).toFixed(1)).join(' ');
    let b = `<polygon points="${pts}" fill="rgba(18,194,107,.14)" stroke="${C.gr}" stroke-width="1.8"/>`;
    if (ap) b += P.map((p, i) => ln(X(ap[0]).toFixed(1), Yy(ap[1]).toFixed(1), X(p[0]).toFixed(1), Yy(p[1]).toFixed(1), C.cy, 1.2, '4 3', 'dr', 0.2 + i * 0.15)).join('');
    const e = o.e || [];
    b += P.map((p, i) => { const q = P[(i + 1) % P.length], mx = X((p[0] + q[0]) / 2), my = Yy((p[1] + q[1]) / 2), k = e[i]; if (!k) return ''; const c = k === 'C'; return `<rect x="${(mx - 7).toFixed(1)}" y="${(my - 6).toFixed(1)}" width="14" height="12" rx="6" fill="${c ? C.gr : C.wh}"/>` + tx(mx.toFixed(1), (my + 3).toFixed(1), k, { s: 7.5, w: 700, c: c ? C.wh : C.dk }); }).join('');
    if (ap) b += `<circle cx="${X(ap[0]).toFixed(1)}" cy="${Yy(ap[1]).toFixed(1)}" r="5" fill="${C.gr}" stroke="${C.wh}" stroke-width="1.5"/>` + tx((X(ap[0]) + 9).toFixed(1), (Yy(ap[1]) - 7).toFixed(1), 'P', { a: 'start', c: C.wh, w: 700, s: 10 });
    if (o.plates) b += o.plates.map(t => tx(X(t[0]).toFixed(1), Yy(t[1]).toFixed(1), t[2], { s: 8, c: C.cy, w: 700 })).join('');
    if (o.extra) b += o.extra({ X, Yy, s });
    return svg(`0 0 ${W} ${H}`, b);
  }
  function figYieldSide() {                       // a rigid plate rotating about its supported edge
    return svg('0 0 300 96',
      `<path d="M30 76H270" stroke="${C.mu}" stroke-width="1" stroke-dasharray="4 3"/>` +
      `<path d="M30 76L170 30" stroke="${C.cy}" stroke-width="2.4" class="dr" pathLength="1"/>` + `<path d="M270 76L170 30" stroke="${C.gr}" stroke-width="2.4" class="dr" pathLength="1" style="animation-delay:.3s"/>` +
      supp(30, 76, C.wh) + supp(270, 76, C.wh) + `<circle cx="170" cy="30" r="4.4" fill="${C.cy}" stroke="${C.wh}" stroke-width="1.3"/>` +
      dim(170, 30, 170, 76, C.am) + tx(178, 56, 'δ', { a: 'start', c: C.am, w: 700, s: 11 }) +
      tx(100, 92, 'plate rotates about its edge', { s: 8.5 }) + tx(236, 92, 'yield line at the apex', { s: 8.5 }));
  }

  function figSlab(Ltxt) {                        // slab on two beams with UDL
    return svg('0 0 300 114',
      udl(40, 260, 6, 26, 12, C.gr) + tx(284, 18, 'n', { c: C.gr, w: 700, s: 10 }) +
      `<rect x="26" y="30" width="248" height="14" rx="2" fill="${C.con}"/>` +
      `<rect x="14" y="44" width="36" height="34" rx="2" fill="${C.conD}"/><rect x="250" y="44" width="36" height="34" rx="2" fill="${C.conD}"/>` +
      tx(32, 91, 'beam', { s: 7.5 }) + tx(268, 91, 'beam', { s: 7.5 }) +
      ln(32, 44, 32, 100, C.mu, 0.8, '3 3') + ln(268, 44, 268, 100, C.mu, 0.8, '3 3') +
      dim(32, 100, 268, 100, C.cy) + tx(150, 111, Ltxt, { c: C.cy, w: 700, s: 9.5 }));
  }

  /* ---------------------------------------------------------------- topics */
  const ICON = {
    flex: '<path d="M3 7c4 9 14 9 18 0"/><path d="M3 4v6M21 4v6"/>',
    shear: '<path d="M8 20V6M5 9l3-3 3 3"/><path d="M16 4v14M13 15l3 3 3-3"/>',
    defl: '<path d="M3 6h18" stroke-dasharray="2 2"/><path d="M3 6c4 11 14 11 18 0"/><path d="M12 6v9M10 13l2 2 2-2"/>',
    crack: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M13 5l-2 4 3 2-2 4 1 4"/>',
    anch: '<path d="M3 12h13"/><path d="M16 12a3.5 3.5 0 0 1 0 7"/><path d="M6 9v6M9 9v6M12 9v6"/>',
    yl: '<path d="M4 6l15-1 2 13-17 1z"/><path d="M12 12L4 6M12 12l7-7M12 12l9 6M12 12L4 19"/>'
  };
  const TOPICS = [];
  function topic(id, name, sub, icon) { const t = { id, name, sub, icon: ICON[icon], lessons: [] }; TOPICS.push(t); return t; }
  const lesson = (t, key, kind, title, build) => t.lessons.push({ id: t.id + '-' + key, kind, title, build });

  /* ================================================================ 1 · FLEXURE */
  const tF = topic('flexure', 'Flexure', 'Bending of a slab strip', 'flex');
  lesson(tF, 'concept', 'Concept', 'How a slab strip resists bending', () => {
    const c = E.DEF, o = E.derive(c);
    return [
      TITLE(tF, 'Concept', 'Flexure', 'How a slab strip resists bending'),
      SD('THE IDEA', 'Bending in a slab', UL([
        'Load makes the slab sag: the <b>top fibres are squeezed</b> (compression) and the <b>bottom fibres are stretched</b> (tension).',
        'Concrete is weak in tension, so <b>steel bars near the bottom</b> carry the tensile force.',
        'We design a <b>1 m wide strip</b> (b = 1000 mm), so every result is <b>per metre</b> of slab.'])),
      SD('SECTION · STRAIN · STRESS', 'Internal forces', FIG(figFlexure(), 'The compression block <b>Fc</b> in the concrete and the tension <b>Fs</b> in the steel form a couple: <b>M = Fs · z</b>.')),
      SD('MATERIALS', 'Design strengths',
        EQ('Concrete', 'fcd = αcc · fck / γc', `= ${c.acc} · ${c.fck} / ${c.gc} = <b>${g(o.fcd, 2)} N/mm²</b>`) +
        EQ('Steel', 'fyd = fyk / γs', `= ${c.fyk} / ${c.gs} = <b>${g(o.fyd, 0)} N/mm²</b>`) +
        CALL(`αcc is a National Annex parameter (EN 1992-1-1 recommends 1.0). The app default is ${c.acc}; change it in Project defaults.`)),
      SD('THE METHOD', 'From moment to steel',
        EQ('Effective depth', 'd = h − cover − Φ/2', 'from the top face to the centre of the bar') +
        EQ('Moment factor', 'K = M·10⁶ / (b·d²·fck)', 'M in kNm/m · b and d in mm') +
        EQ('Lever arm', `z = d·[0.5 + √(0.25 − K/${g(o.k2, 3)})] ≤ 0.95·d`, `${g(o.k2, 3)} = 2·αcc/γc`) +
        EQ('Steel area', 'As = M·10⁶ / (fyd·z)   [mm²/m]', '', true)),
      SD('LIMITS', 'Checks that protect you', UL([
        `<b>K ≤ K′ = ${c.Kl}</b> (x/d ≤ 0.45). Above it, add depth or compression steel.`,
        '<b>As ≥ As,min</b> = max(0.26·fctm/fyk·b·d , 0.0013·b·d): avoids a brittle failure when the concrete first cracks (EC2 9.2.1.1).',
        '<b>As ≤ As,max</b> = 0.04·Ac.',
        'Main bars: spacing ≤ min(3h , 400 mm). Distribution bars: at least 20% of the main steel (EC2 9.3.1.1).'])),
      SD('IN THE APP', 'See it in the app',
        P('Open <b>Design → One-way slab</b>, press <b>Calculate</b>, then <b>View steps</b>: every equation above appears with your own numbers.') +
        P('The app also checks the bars it chooses: <b>x = As,prov·fyd / (0.8·fcd·b)</b> and <b>MRd = As,prov·fyd·(d − 0.4x) ≥ MEd</b>.') +
        CALL('Next lesson: a worked example, from load to bars.'))
    ];
  });
  lesson(tF, 'example', 'Worked example', 'Slab S1: from load to bars', () => {
    const m = M(), R = m.R, c = m.c, o = m.o, f = R.fs, ld = R.ld, d = R.d, Ms = R.Ms;
    return [
      TITLE(tF, 'Worked example', 'Flexure', 'Slab S1: from load to bars'),
      SD('GIVEN', 'Slab S1', FIG(figSlab('L = 4.0 m (centre-to-centre of the beams)')) +
        KV([['Slab', 'one-way, simply supported'], ['Thickness h', c.h + ' mm'], ['fck / fyk', c.fck + ' / ' + c.fyk + ' N/mm²'], ['Cover · main bar', c.cover + ' mm · Φ' + c.phi], ['Qk (live)', fx(c.Qk, 1) + ' kN/m²'], ['Finishes & services', g(ld.Gsup, 3) + ' kN/m²']])),
      SD('STEP 1', 'Design load n',
        EQ('Permanent load', 'Gk = finishes + self-weight', `= ${g(ld.Gsup, 3)} + ${g(R.h / 1000, 2)}·${c.gconc} = <b>${g(ld.Gk, 3)} kN/m²</b>`) +
        EQ('Ultimate load', 'n = γG·Gk + γQ·Qk', `= ${c.gG}·${g(ld.Gk, 3)} + ${c.gQ}·${fx(ld.Qk, 1)} = <b>${g(ld.n, 2)} kN/m²</b>`, true) +
        CALL('Per metre strip: n is also the line load in kN/m.')),
      SD('STEP 2', 'Design moment', FIG(figMoment('4.0 m', Ms), '') +
        EQ('Simply supported slab', 'M = n·L² / 8', `= ${g(ld.n, 2)}·${fx(R.L / 1000, 1)}² / 8 = <b>${g(Ms, 2)} kNm/m</b>`, true)),
      SD('STEP 3', 'Effective depth and K',
        EQ('Effective depth', 'd = h − cover − Φ/2', `= ${R.h} − ${c.cover} − ${c.phi}/2 = <b>${g(d, 0)} mm</b>`) +
        EQ('Moment factor', 'K = M·10⁶ / (b·d²·fck)', `= ${g(Ms, 2)}·10⁶ / (${c.b}·${g(d, 0)}²·${c.fck}) = <b>${g(f.K, 4)}</b>`, true) +
        CALL(`K = ${g(f.K, 4)} ≤ K′ = ${c.Kl} ✓ — no compression steel needed.`)),
      SD('STEP 4', 'Lever arm and steel area',
        EQ('Lever arm', `z = min( 0.95·d , d·[0.5 + √(0.25 − K/${g(o.k2, 3)})] )`, `= min( ${g(0.95 * d, 1)} , ${g(m.zform, 1)} ) = <b>${g(f.z, 1)} mm</b>`) +
        EQ('Required steel', 'As = M·10⁶ / (fyd·z)', `= ${g(Ms, 2)}·10⁶ / (${g(o.fyd, 0)}·${g(f.z, 1)}) = <b>${g(f.Ar, 0)} mm²/m</b>`, true) +
        EQ('Minimum steel', 'As,min = max(0.26·fctm/fyk·b·d , 0.0013·b·d)', `= ${g(f.Amin, 0)} mm²/m — ${f.Ar >= f.Amin ? 'As,req governs' : 'As,min governs'}`)),
      SD('STEP 5', 'Choose the bars',
        P(`Strength alone: s = Ab·b / As = ${g(o.Ab, 1)}·1000 / ${g(f.Au, 0)} = ${g(f.sreq, 0)} mm → round down to <b>${m.sp1} mm</b> (H${c.phi} @ ${m.sp1} = ${g(m.t1.Ap, 0)} mm²/m).`) +
        CALL(`The app then tightens the spacing for <b>crack control</b> (see the Crack control lessons). Final bars: <b>${f.txt}</b> = ${g(f.Ap, 0)} mm²/m.`) +
        BAR('Distribution bars (≥ 20% of main steel)', R.sec.txt, C.cy)),
      SD('STEP 6', 'Check the bars provided',
        EQ('Neutral axis', 'x = As,prov·fyd / (0.8·fcd·b)', `= ${g(f.Ap, 0)}·${g(o.fyd, 0)} / (0.8·${g(o.fcd, 2)}·${c.b}) = <b>${g(f.x, 1)} mm</b>  (x/d = ${g(f.xd, 3)})`) +
        EQ('Resistance', 'MRd = As,prov·fyd·(d − 0.4x)', `= ${g(f.Ap, 0)}·${g(o.fyd, 0)}·${g(f.zprov, 1)} / 10⁶ = <b>${g(f.Mrd, 1)} kNm/m</b>`, true) +
        CALL(`MRd = ${g(f.Mrd, 1)} ${f.Mrd >= Ms ? '≥' : '&lt;'} MEd = ${g(Ms, 2)} kNm/m ${f.capacityChk === 'OK' ? '✓' : '✗'}`)),
      SD('RESULT', 'Slab S1 · flexure',
        MT([['M sag', g(Ms, 2), 'kNm/m'], ['As,req', g(f.Ar, 0), 'mm²/m'], ['As,prov', g(f.Ap, 0), 'mm²/m']]) +
        BAR('Bottom bars', f.txt) + BAR('Distribution', R.sec.txt, C.cy) +
        CHIPS([[(R.st.flex === 'OK' ? '✓' : '✗') + ' Flexure', R.st.flex === 'OK' ? 'ok' : 'no']]) +
        CALL('Try it: <b>Design → One-way slab</b>, <i>Simply supported</i>, L = 4000, then compare with the app.'))
    ];
  });

  /* ================================================================ 2 · SHEAR */
  const tS = topic('shear', 'Shear', 'Critical section at d from the beam', 'shear');
  lesson(tS, 'concept', 'Concept', 'Shear in slabs and the critical section', () => {
    const c = E.DEF;
    return [
      TITLE(tS, 'Concept', 'Shear', 'Shear in slabs and the critical section'),
      SD('WHY', 'Why check shear?', UL([
        'Near a support the load pushes the slab down while the beam holds it up: a vertical <b>shear force V</b> acts across the slab.',
        'Slabs usually need <b>no stirrups</b>. The concrete alone resists V, but you must prove it: <b>VEd ≤ VRd,c</b>.',
        'When this holds, EC2 6.2.1(4) lets slabs omit the minimum shear links.'])),
      SD('WHERE', 'Where do we check?', FIG(figShear(), 'Load within <b>d</b> of the beam face goes straight into the beam, so EC2 6.2.1(8) allows the check at <b>d from the face</b> (uniform load on the top, support pushing into the slab).')),
      SD('THE CRITICAL SECTION', 'Shear at d from the face',
        EQ('Distance from the beam centre-line', 'x = bw/2 + d', 'half the beam width + effective depth') +
        EQ('Shear at the critical section', 'VEd,d = V − n·x', 'V = shear at the centre-line (kN/m) · n in kN/m² · x in m', true) +
        EQ('Shear at the beam face', 'VEd,face = V − n·bw/2', 'used for the crushing check')),
      SD('CAPACITY', 'Concrete shear resistance',
        EQ('Resistance', 'VRd,c = max[ CRd,c·k·(100·ρ1·fck)^⅓ , vmin ]·b·d', 'in kN per metre strip', true) +
        EQ('Factors', 'CRd,c = 0.18/γc   ·   k = 1 + √(200/d) ≤ 2', 'd in mm') +
        EQ('Steel ratio', 'ρ1 = Asl / (b·d) ≤ 0.02', `Asl = tension bars that continue at least lbd + d past the section. By default the app uses ${c.frac * 100}% of the bottom bars (bars to support).`) +
        EQ('Minimum', 'vmin = 0.035·k^(3/2)·fck^(1/2)', 'N/mm²')),
      SD('THE DECISION', 'Two checks',
        UL([
          '<b>Check 1</b> · VEd,d ≤ VRd,c: no shear reinforcement is needed.',
          '<b>Check 2</b> · VEd,face ≤ VRd,max = ν·fcd·b·0.9d / (cotθ + tanθ), with ν = 0.6·(1 − fck/250): the concrete must not crush.',
          'If check 1 fails: <b>increase h</b> (the usual fix for slabs) or add links, which need a slab at least 200 mm deep (EC2 9.3.2).'])),
      SD('IN THE APP', 'Enter the beam size',
        P('In <b>Slab data</b> enter the <b>beam width bw</b> (and depth hb). The app finds x = bw/2 + d, computes VEd,d and shows ✓ or ✗ for Shear.') +
        UL(['Spans are centre-to-centre of the beams.', 'Uniform load on the top face; the support pushes into the slab.', 'Tension bars are anchored beyond lbd + d; EC2 recommended CRd,c (no National Annex change).']) +
        CALL('If bw is left empty the app does not guess: Shear stays ✗ until you enter it.', 'am'))
    ];
  });
  lesson(tS, 'example', 'Worked example', 'Slab S1 on 300 × 500 mm beams', () => {
    const m = M(), R = m.R, c = m.c, s = m.sh, a = m.at, ld = R.ld, d = R.d, f = R.fs;
    const crd = 0.18 / c.gc, form = crd * s.k * Math.pow(100 * s.rho * c.fck, 1 / 3);
    return [
      TITLE(tS, 'Worked example', 'Shear', 'Slab S1 on 300 × 500 mm beams'),
      SD('GIVEN', 'Slab S1 and its beams', FIG(figSlab('L = 4.0 m (centre-to-centre)'), '') +
        KV([['Support beams', `${a.bw} × ${a.hb} mm`], ['Effective depth d', g(d, 0) + ' mm'], ['Design load n', g(ld.n, 2) + ' kN/m²'], ['Bottom bars', f.txt], ['Bars to support', c.frac * 100 + '%  →  ' + g(s.As1, 0) + ' mm²/m'], ['fck', c.fck + ' N/mm²']])),
      SD('STEP 1', 'Shear at the support', EQ('Simply supported slab', 'V = n·L / 2', `= ${g(ld.n, 2)}·${fx(R.L / 1000, 1)} / 2 = <b>${g(R.V, 2)} kN/m</b>`, true) + CALL('This is the shear at the beam <b>centre-line</b>, before the reduction at d.')),
      SD('STEP 2', 'Critical section', FIG(figShear({ V: g(R.V, 2), Vd: g(a.Vd, 2) }), '') +
        EQ('Distance', 'x = bw/2 + d', `= ${a.bw}/2 + ${g(d, 0)} = <b>${g(a.x, 0)} mm</b>`) +
        EQ('Shear at d from the face', 'VEd,d = V − n·x', `= ${g(R.V, 2)} − ${g(ld.n, 2)}·${g(a.x / 1000, 3)} = <b>${g(a.Vd, 2)} kN/m</b>`, true)),
      SD('STEP 3', 'Factors k and ρ1',
        EQ('k', 'k = min(1 + √(200/d) , 2)', `= min(1 + √(200/${g(d, 0)}) , 2) = <b>${g(s.k, 3)}</b>`) +
        EQ('ρ1', 'ρ1 = Asl / (b·d)', `= ${g(s.As1, 0)} / (${c.b}·${g(d, 0)}) = <b>${g(s.rho, 5)}</b>  (≤ 0.02 ✓)`) +
        EQ('Formula value', 'CRd,c·k·(100·ρ1·fck)^⅓', `= ${g(crd, 2)}·${g(s.k, 3)}·(100·${g(s.rho, 5)}·${c.fck})^⅓ = <b>${g(form, 3)} N/mm²</b>`)),
      SD('STEP 4', 'Resistance VRd,c',
        EQ('Minimum value', 'vmin = 0.035·k^(3/2)·fck^(1/2)', `= 0.035·${g(s.k, 3)}^1.5·√${c.fck} = <b>${g(s.vmin, 3)} N/mm²</b>`) +
        EQ('Resistance', 'VRd,c = max(' + g(form, 3) + ' , ' + g(s.vmin, 3) + ')·b·d', `= ${g(Math.max(form, s.vmin), 3)}·${c.b}·${g(d, 0)} / 1000 = <b>${g(s.vc, 1)} kN/m</b>`, true) +
        CALL(s.vmin >= form ? 'vmin governs: typical for lightly reinforced slabs.' : 'The formula value governs.')),
      SD('STEP 5', 'Compare',
        EQ('Check 1 · concrete', 'VEd,d ≤ VRd,c', `${g(a.Vd, 2)} ${a.passC ? '≤' : '&gt;'} ${g(s.vc, 1)} kN/m ${a.passC ? '✓' : '✗'}  (utilisation ${g(a.util * 100, 0)}%)`, true) +
        EQ('Check 2 · crushing', 'VEd,face = V − n·bw/2 ≤ VRd,max', `${g(a.Vface, 2)} ${a.passM ? '≤' : '&gt;'} ${g(s.vmax, 1)} kN/m ${a.passM ? '✓' : '✗'}`) +
        CALL(a.state === 'ok' ? '<b>No shear reinforcement required.</b> The app shows ✓ Shear.' : 'The check fails — see the next slide.', a.state === 'ok' ? '' : 'am')),
      SD('WHAT IF?', 'If VEd,d were larger than VRd,c', UL([
        '<b>Increase the thickness h</b>: d grows, so VRd,c grows and VEd,d falls. The usual fix.',
        'Bring more bottom steel to the support: ρ1 rises, so VRd,c rises a little.',
        'Or design shear links: allowed only in slabs at least 200 mm deep (EC2 9.3.2). The app does not design them.'])),
      SD('RESULT', 'Slab S1 · shear',
        MT([['VEd,d', g(a.Vd, 1), 'kN/m'], ['VRd,c', g(s.vc, 1), 'kN/m'], ['Use', g(a.util * 100, 0) + '%', '']]) +
        CHIPS([[(a.state === 'ok' ? '✓' : '✗') + ' Shear', a.state === 'ok' ? 'ok' : 'no']]) +
        CALL('Try it: in <b>Slab data</b> enter bw = 300 and hb = 500, calculate, then open <b>View steps → Shear</b>.'))
    ];
  });

  /* ================================================================ 3 · DEFLECTION */
  const tD = topic('deflection', 'Deflection', 'The span/depth rule', 'defl');
  lesson(tD, 'concept', 'Concept', 'The span/depth rule', () => [
    TITLE(tD, 'Concept', 'Deflection', 'The span/depth rule'),
    SD('WHY', 'Why limit deflection?', UL([
      'Large deflections crack finishes and partitions, and the floor looks and feels wrong.',
      'EC2 7.4.1 suggests <b>span/250</b> under the quasi-permanent load, and <b>span/500</b> for the part that can damage partitions or finishes.',
      'Instead of calculating deflection, EC2 7.4.2 lets you control it with a <b>span/depth limit</b>.'])),
    SD('THE PICTURE', 'Deflected shape', FIG(figDeflection('δ ≤ L/250'), 'A stiffer slab (larger d) deflects less. The rule keeps L/d below a limit that depends on the steel and on the support condition.')),
    SD('THE LIMIT', 'Basic span/depth',
      EQ('If ρ ≤ ρ0', 'L/d = K·[ 11 + 1.5·√fck·ρ0/ρ + 3.2·√fck·(ρ0/ρ − 1)^(3/2) ]', 'EC2 Expression (7.16a)') +
      EQ('If ρ &gt; ρ0', 'L/d = K·[ 11 + 1.5·√fck·ρ0/ρ ]', 'EC2 Expression (7.16b) with ρ′ = 0 (no compression steel)') +
      EQ('Ratios', 'ρ0 = √fck / 1000   ·   ρ = As / (b·d)', 'ρ0 is the reference steel ratio', true)),
    SD('FACTORS', 'K and the modifiers',
      EQ('K (support condition)', 'simply supported 1.0 · end span 1.3 · interior span 1.5 · cantilever 0.4', 'EC2 Table 7.4N') +
      EQ('Steel stress', 'f1 = (As,prov / As,req)·(500 / fyk) ≤ 1.5', 'more steel than required lowers the steel stress, so the limit rises (the app caps f1 at 1.5)') +
      EQ('Long spans', 'f2 = 7 / L   (L in m, only if L &gt; 7 m)', 'for spans over 7 m that carry partitions') +
      EQ('Check', 'L/d ≤ basic × f1 × f2', '', true)),
    SD('IF IT FAILS', 'Ways to pass', UL([
      '<b>Increase d</b> (a thicker slab): the most effective fix, because L/d falls while the limit stays.',
      'Provide a little more tension steel: this raises f1 (up to 1.5).',
      'A stiffer support condition (continuity) raises K.'])),
    SD('IN THE APP', 'Where to see it',
      P('The app takes ρ from <b>max(As,req , As,min)</b> and applies K from your support case. Open <b>View steps → Deflection</b> to see each factor.') +
      UL(['One-way slabs: checked on the mid-span steel.', 'Two-way slabs: checked in both directions.', 'Irregular slabs: always flagged, because direct deflection verification is required.']))
  ]);
  lesson(tD, 'example', 'Worked example', 'Slab S1: span/depth check', () => {
    const m = M(), R = m.R, c = m.c, o = m.o, f = R.fs, df = R.df, d = R.d, low = df.rho <= df.rho0;
    const q = df.rho0 / df.rho, sf = Math.sqrt(c.fck), a1 = 1.5 * sf * q, a2 = low ? 3.2 * sf * Math.pow(Math.max(0, q - 1), 1.5) : 0, raw = (f.Ap / f.Ar) * (500 / c.fyk);
    return [
      TITLE(tD, 'Worked example', 'Deflection', 'Slab S1: span/depth check'),
      SD('GIVEN', 'Slab S1', KV([['Span L', fx(R.L / 1000, 1) + ' m (simply supported)'], ['Effective depth d', g(d, 0) + ' mm'], ['K (support case)', fx(df.K, 1)], ['As,req · As,min', g(f.Ar, 0) + ' · ' + g(f.Amin, 0) + ' mm²/m'], ['As,prov', g(f.Ap, 0) + ' mm²/m'], ['fck · fyk', c.fck + ' · ' + c.fyk + ' N/mm²']])),
      SD('STEP 1', 'Steel ratios',
        EQ('ρ', 'ρ = max(As,req , As,min) / (b·d)', `= ${g(df.AsT, 0)} / (${c.b}·${g(d, 0)}) = <b>${g(df.rho, 5)}</b>`) +
        EQ('ρ0', 'ρ0 = √fck / 1000', `= √${c.fck} / 1000 = <b>${g(df.rho0, 3)}</b>`) +
        CALL(low ? 'ρ ≤ ρ0, so use Expression (7.16a).' : 'ρ &gt; ρ0, so use Expression (7.16b).')),
      SD('STEP 2', 'Basic span/depth',
        EQ('Ratio', 'ρ0 / ρ', `= ${g(df.rho0, 3)} / ${g(df.rho, 5)} = <b>${g(q, 3)}</b>`) +
        (low ? EQ('Basic limit', 'K·[ 11 + 1.5·√fck·ρ0/ρ + 3.2·√fck·(ρ0/ρ − 1)^(3/2) ]', `= ${g(df.K, 1)}·[ 11 + ${g(a1, 2)} + ${g(a2, 2)} ] = <b>${g(df.basic, 1)}</b>`, true)
          : EQ('Basic limit', 'K·[ 11 + 1.5·√fck·ρ0/ρ ]', `= ${g(df.K, 1)}·[ 11 + ${g(a1, 2)} ] = <b>${g(df.basic, 1)}</b>`, true))),
      SD('STEP 3', 'Modification factors',
        EQ('Steel stress', 'f1 = min( As,prov/As,req · 500/fyk , 1.5 )', `= min( ${g(f.Ap, 0)}/${g(f.Ar, 0)}·500/${c.fyk} , 1.5 ) = min( ${g(raw, 3)} , 1.5 ) = <b>${g(df.f1, 2)}</b>`) +
        EQ('Long spans', 'f2 = 7/L if L &gt; 7 m', `L = ${fx(R.L / 1000, 1)} m, so f2 = <b>${fx(df.f2, 1)}</b>`) +
        EQ('Allowed span/depth', 'basic × f1 × f2', `= ${g(df.basic, 1)}·${g(df.f1, 2)}·${fx(df.f2, 1)} = <b>${g(df.mod, 1)}</b>`, true)),
      SD('STEP 4', 'Compare', FIG(figBars(df.act, df.mod, 'Actual L/d = L / d', 'Allowed L/d'), '') +
        EQ('Actual', 'L/d', `= ${R.L} / ${g(d, 0)} = <b>${g(df.act, 1)}</b>`) +
        CALL(`${g(df.act, 1)} ${df.act <= df.mod ? '≤' : '&gt;'} ${g(df.mod, 1)} ${df.chk === 'OK' ? '✓' : '✗'} — ${df.chk === 'OK' ? 'the deflection check passes' : 'the slab is too slender'}.`, df.chk === 'OK' ? '' : 'am')),
      SD('RESULT', 'Slab S1 · deflection',
        MT([['Actual L/d', g(df.act, 1), ''], ['Allowed', g(df.mod, 1), ''], ['Use', g(df.act / df.mod * 100, 0) + '%', '']]) +
        CHIPS([[(df.chk === 'OK' ? '✓' : '✗') + ' Deflection', df.chk === 'OK' ? 'ok' : 'no']]) +
        CALL('Try it: <b>View steps → Deflection (EC2 7.4.2)</b> shows the same factors.'))
    ];
  });

  /* ================================================================ 4 · CRACK CONTROL */
  const tC = topic('crack', 'Crack control', 'Bar spacing and steel stress', 'crack');
  lesson(tC, 'concept', 'Concept', 'Controlling crack width', () => {
    const c = E.DEF;
    return [
      TITLE(tC, 'Concept', 'Crack control', 'Controlling crack width'),
      SD('WHY', 'Why control cracking?', UL([
        'Reinforced concrete cracks under service load. That is normal and expected.',
        'Wide cracks let moisture reach the steel (corrosion) and spoil the appearance.',
        `EC2 Table 7.1N limits the crack width wk: <b>0.4 mm</b> for dry interiors (XC1) and <b>0.3 mm</b> for most other exposures. The app default is ${c.wk} mm.`])),
      SD('THE PICTURE', 'Cracks and bar spacing', FIG(figCrack(), 'Closer bars spread the strain over more cracks, so each crack stays narrow.')),
      SD('THE SHORTCUT', 'Limit the bar spacing', UL([
        'EC2 7.3.3 lets you skip the crack-width calculation: keep the <b>bar spacing ≤ smax</b> from Table 7.3N.',
        'smax depends on the steel stress σs under service load and on the wk limit.',
        'Slabs up to <b>h = 200 mm</b> in bending need no specific measure if the EC2 9.3 detailing rules are followed (7.3.3(1)). The app flags this for review instead of passing it automatically.'])),
      SD('TABLE 7.3N', 'Maximum bar spacing', FIG(figSmax(), 'Lower steel stress allows wider spacing. Above 360 N/mm² the table does not apply.')),
      SD('STEEL STRESS', 'Estimating σs',
        EQ('Service load', 'q = Gk + ψ2·Qk', `quasi-permanent load (ψ2 = ${c.psi2})`) +
        EQ('Steel stress', 'σs ≈ fyd·(As,req / As,prov)·(q / n)', 'n = γG·Gk + γQ·Qk is the ultimate load', true) +
        EQ('Rule', 's ≤ smax(σs , wk)', '') +
        CALL('More bars (smaller spacing) lower σs and raise smax, so the app tightens the spacing until the rule is met.')),
      SD('IN THE APP', 'Where to see it',
        P('<b>View steps → Crack control</b> lists σs, smax and the final spacing.') +
        UL(['The app interpolates Table 7.3N between the tabulated stresses.', 'It reports “not applicable” above 360 N/mm² or for wk other than 0.2, 0.3 or 0.4 mm.', 'It applies to the sagging and the hogging steel.']))
    ];
  });
  lesson(tC, 'example', 'Worked example', 'Slab S1: finding the bar spacing', () => {
    const m = M(), R = m.R, c = m.c, o = m.o, f = R.fs, ld = R.ld, t1 = m.t1, t2 = m.t2, ratio = ld.q / ld.n, next = E.f25(t1.sm);
    return [
      TITLE(tC, 'Worked example', 'Crack control', 'Slab S1: finding the bar spacing'),
      SD('GIVEN', 'Where we start', KV([['Required steel', g(f.Ar, 0) + ' mm²/m'], ['First trial (strength)', `H${c.phi} @ ${m.sp1}`], ['Crack limit wk', c.wk + ' mm'], ['ψ2', c.psi2], ['Gk', g(ld.Gk, 3) + ' kN/m²'], ['Qk', fx(ld.Qk, 1) + ' kN/m²']]) +
        CALL(`The strength design gave H${c.phi} @ ${m.sp1}. Does it also control cracking?`)),
      SD('STEP 1', 'Service load ratio',
        EQ('Quasi-permanent load', 'q = Gk + ψ2·Qk', `= ${g(ld.Gk, 3)} + ${c.psi2}·${fx(ld.Qk, 1)} = <b>${g(ld.q, 3)} kN/m²</b>`) +
        EQ('Load ratio', 'q / n', `= ${g(ld.q, 3)} / ${g(ld.n, 2)} = <b>${g(ratio, 3)}</b>`, true)),
      SD('STEP 2', `Trial 1 · H${c.phi} @ ${t1.sp}`,
        EQ('Steel provided', 'As,prov = Ab·b / s', `= ${g(o.Ab, 1)}·1000 / ${t1.sp} = ${g(t1.Ap, 0)} mm²/m`) +
        EQ('Steel stress', 'σs = fyd·(As,req/As,prov)·(q/n)', `= ${g(o.fyd, 0)}·(${g(f.Ar, 0)}/${g(t1.Ap, 0)})·${g(ratio, 3)} = <b>${g(t1.sg, 0)} N/mm²</b>`) +
        EQ('Table 7.3N', `smax at σs, wk = ${c.wk}`, `= <b>${g(t1.sm, 0)} mm</b> (interpolated)`, true) +
        CALL(`${t1.sp} mm ${t1.sp > t1.sm ? '&gt;' : '≤'} ${g(t1.sm, 0)} mm ${t1.sp > t1.sm ? '✗ the bars are too far apart.' : '✓'}`, t1.sp > t1.sm ? 'am' : '')),
      SD('STEP 3', `Trial 2 · H${c.phi} @ ${t2.sp}`,
        P(`Round smax down to a multiple of 25 mm: ${g(t1.sm, 0)} → <b>${next} mm</b>.`) +
        EQ('Steel provided', 'As,prov = Ab·b / s', `= ${g(o.Ab, 1)}·1000 / ${t2.sp} = ${g(t2.Ap, 0)} mm²/m`) +
        EQ('Steel stress', 'σs = fyd·(As,req/As,prov)·(q/n)', `= ${g(o.fyd, 0)}·(${g(f.Ar, 0)}/${g(t2.Ap, 0)})·${g(ratio, 3)} = <b>${g(t2.sg, 0)} N/mm²</b>`) +
        EQ('Table 7.3N', 'smax', `= <b>${g(t2.sm, 0)} mm</b>`, true) +
        CALL(`${t2.sp} mm ${t2.sp <= t2.sm ? '≤' : '&gt;'} ${g(t2.sm, 0)} mm ${t2.sp <= t2.sm ? '✓' : '✗'}`)),
      SD('ON THE CHART', 'Both trials', FIG(figSmax([{ sg: t1.sg, sp: t1.sp, ok: t1.sp <= t1.sm, t: 'H12@' + t1.sp, dy: -7 }, { sg: t2.sg, sp: t2.sp, ok: t2.sp <= t2.sm, t: 'H12@' + t2.sp, dy: 13 }], c.wk), 'A trial above the wk = ' + c.wk + ' line (cyan) fails; below it passes.')),
      SD('RESULT', 'Slab S1 · crack control',
        MT([['σs', g(t2.sg, 0), 'N/mm²'], ['Spacing', f.sp, 'mm'], ['smax', g(t2.sm, 0), 'mm']]) + BAR('Bottom bars', f.txt) +
        CHIPS([[(R.st.crack === 'OK' ? '✓' : '✗') + ' Crack control', R.st.crack === 'OK' ? 'ok' : 'no']]) +
        CALL('Try it: <b>View steps → Crack control</b> shows σs, smax and the final spacing.'))
    ];
  });

  /* ================================================================ 5 · ANCHORAGE */
  const tA = topic('anchorage', 'Anchorage & lap', 'Bond and bar lengths', 'anch');
  lesson(tA, 'concept', 'Concept', 'Bond, anchorage and lap lengths', () => {
    const c = E.DEF, o = E.derive(c);
    return [
      TITLE(tA, 'Concept', 'Anchorage & lap', 'Bond, anchorage and lap lengths'),
      SD('WHY', 'Why anchor bars?', UL([
        'A bar carries force only if the concrete grips it. The grip is <b>bond</b> between the ribbed bar and the concrete.',
        'If the bar is too short it <b>slips</b>, and the steel never reaches its strength.',
        'EC2 gives an <b>anchorage length lbd</b> for bar ends and a <b>lap length l0</b> where bars are joined.'])),
      SD('THE PICTURE', 'Anchorage and lap', FIG(figAnchor(), 'Bond stress acts along the bar. A lap passes the force from one bar to the next through the concrete.')),
      SD('BOND', 'Design bond strength',
        EQ('Tensile strength', 'fctd = 0.7·fctm / γc', `= 0.7·${c.fctm} / ${c.gc} = <b>${g(o.fctd, 3)} N/mm²</b>`) +
        EQ('Bond strength', 'fbd = 2.25·η1·η2·fctd', `= 2.25·${o.eta1}·${o.eta2}·${g(o.fctd, 3)} = <b>${g(o.fbd, 3)} N/mm²</b>`, true) +
        CALL('η1 = 1.0 for good bond conditions and 0.7 otherwise. η2 = 1.0 for bars up to 32 mm.')),
      SD('LENGTHS', 'Anchorage and lap lengths',
        EQ('Basic length', 'lb,rqd = (Φ/4)·(σsd / fbd)', 'σsd = stress in the bar at the section (up to fyd)') +
        EQ('Design anchorage', 'lbd = α·lb,rqd ≥ max(0.3·lb,rqd , 10Φ , 100 mm)', '', true) +
        EQ('Lap length', 'l0 = α6·lbd ≥ max(0.3·α6·lb,rqd , 15Φ , 200 mm)', 'α6 = 1.0 to 1.5, rising with the percentage of bars lapped at one section')),
      SD('IN THE APP', 'How the app checks anchorage',
        UL([
          'Each bar group gets its own <b>bond condition</b> (η1) and <b>α2</b> from your cover and bar spacing; α1 = α3 = α4 = α5 = 1.',
          'σsd is scaled by As,req / As,prov: a bar that is not fully stressed needs less length.',
          'At the support the app checks <b>lbd ≤ bw − cover</b> for the bars that reach the support (FE = VEd·al/z, 50 % of the span bars).',
          'Enter the <b>beam width bw</b> in Slab data: without it the available length is unknown and the check stays ✗.']) +
        CALL('<b>View steps → Anchorage &amp; lap</b> shows every factor and the final status.'))
    ];
  });
  lesson(tA, 'example', 'Worked example', 'Slab S1: bottom bars', () => {
    const m = M(), R = m.R, c = m.c, o = m.o, f = R.fs, an = m.an, sp = R.supA[0];
    return [
      TITLE(tA, 'Worked example', 'Anchorage & lap', 'Slab S1: bottom bars'),
      SD('GIVEN', 'Bottom bars of slab S1', KV([['Bars', f.txt], ['As,req / As,prov', `${g(f.Au, 0)} / ${g(f.Ap, 0)} mm²/m`], ['fck · fctm', `${c.fck} · ${c.fctm} N/mm²`], ['Slab depth', R.h + ' mm · good bond (bottom bars)'], ['Bar Φ', c.phi + ' mm'], ['α6 (lap)', c.a6]])),
      SD('STEP 1', 'Bond strength',
        EQ('Tensile strength', 'fctd = 0.7·fctm / γc', `= 0.7·${c.fctm} / ${c.gc} = <b>${g(o.fctd, 3)} N/mm²</b>`) +
        EQ('Bond strength', 'fbd = 2.25·η1·η2·fctd', `= 2.25·${o.eta1}·${o.eta2}·${g(o.fctd, 3)} = <b>${g(o.fbd, 3)} N/mm²</b>`, true)),
      SD('STEP 2', 'Basic length',
        EQ('Full stress', 'lb,rqd = (Φ/4)·(fyd / fbd)', `= (${c.phi}/4)·(${g(o.fyd, 0)} / ${g(o.fbd, 3)}) = <b>${g(o.lb, 0)} mm</b>`) +
        EQ('Bar not fully stressed', 'ratio = As,req / As,prov', `= ${g(f.Au, 0)} / ${g(f.Ap, 0)} = <b>${g(an.ratio, 3)}</b>`) +
        EQ('Reduced basic length', `lb,rqd = ratio · ${g(o.lb, 0)}`, `= <b>${g(an.lbrqd, 0)} mm</b>`, true)),
      SD('STEP 3', 'The α factors',
        EQ('Clear bar distance', 'a = s − Φ', `= ${f.sp} − ${c.phi} = ${g(an.a, 0)} mm`) +
        EQ('Cover dimension', 'cd = min(a/2 , c1 , c)', `= min(${g(an.a / 2, 0)} , ${c.cover} , ${c.cover}) = <b>${g(an.cd, 0)} mm</b>`) +
        EQ('Cover factor', 'α2 = 1 − 0.15·(cd − Φ)/Φ ≥ 0.7', `= 1 − 0.15·(${g(an.cd, 0)} − ${c.phi})/${c.phi} = <b>${g(an.alpha2, 3)}</b>`, true) +
        CALL('α1 = α3 = α4 = α5 = 1 (straight bars, no transverse steel, no transverse pressure).')),
      SD('STEP 4', 'Design anchorage and lap', FIG(figAnchor({ lbd: g(an.lbd, 0), l0: g(an.lap, 0) }), '') +
        EQ('Anchorage', 'lbd = max(α·lb,rqd , 0.3·lb,rqd , 10Φ , 100)', `= max(${g(an.alphaProd * an.lbrqd, 0)} , ${g(0.3 * an.lbrqd, 0)} , ${10 * c.phi} , 100) = <b>${g(an.lbd, 0)} mm</b>`, true) +
        EQ('Lap', 'l0 = max(α6·lbd , 0.3·α6·lb,rqd , 15Φ , 200)', `= max(${g(c.a6 * an.lbd, 0)} , ${g(0.3 * c.a6 * an.lbrqd, 0)} , ${15 * c.phi} , 200) = <b>${g(an.lap, 0)} mm</b>`, true)),
      SD('STEP 5', 'Bars at the support', FIG(figSupportAnchor({ lav: g(sp.lav, 0), lbd: g(sp.lbd, 0), k: Math.min(1, sp.lbd / sp.lav) }), '') +
        EQ('Force to anchor', 'FE = VEd·al/z , al = d , z = 0.9d', `= ${g(R.V, 2)}·${g(R.d, 0)}/(0.9·${g(R.d, 0)}) = <b>${g(sp.Fe, 1)} kN/m</b>`) +
        EQ('Bars that reach the support', `${c.frac * 100} % of As,prov`, `= ${g(sp.As, 0)} mm²/m → ratio FE/(As·fyd) = ${g(sp.ratio, 3)}`) +
        EQ('Required length', 'lbd = max(α·lb·ratio , lb,min)', `= <b>${g(sp.lbd, 0)} mm</b> (lb,min = ${g(sp.lbmin, 0)} mm)`, true)),
      SD('STEP 6', 'Does it fit in the beam?',
        EQ('Available', 'lav = bw − cover', `= ${m.at.bw} − ${c.cover} = <b>${g(sp.lav, 0)} mm</b>`) +
        EQ('Check', 'lbd ≤ lav', `${g(sp.lbd, 0)} ${sp.ok ? '≤' : '&gt;'} ${g(sp.lav, 0)} mm ${sp.ok ? '✓' : '✗'}`, true) +
        CALL(sp.ok ? 'The bars fit with a margin: straight bars to the end of the beam (less cover) are enough.' : 'The bars do not fit: widen the support, use smaller bars or provide hooks.', sp.ok ? '' : 'am')),
      SD('WHAT IF?', 'A narrow support, bw = 150 mm',
        EQ('Available', 'lav = bw − cover', `= 150 − ${c.cover} = ${150 - c.cover} mm`) +
        EQ('Required', 'lbd', `= ${g(sp.lbd, 0)} mm → ${sp.lbd <= 150 - c.cover ? '✓ still fits' : '✗ does not fit'}`, true) +
        CALL('Narrow beams and walls are where anchorage problems appear first.')),
      SD('RESULT', 'Slab S1 · anchorage',
        MT([['lbd', g(an.lbd, 0), 'mm'], ['l0', g(an.lap, 0), 'mm'], ['At support', g(sp.lbd, 0) + '/' + g(sp.lav, 0), 'mm']]) +
        CHIPS([[(/^OK/.test(R.st.anchorage) ? '✓' : '✗') + ' Anchorage / lap', /^OK/.test(R.st.anchorage) ? 'ok' : 'no']]) +
        CALL('Try it: enter bw = 300 in <b>Slab data</b>, calculate, then open <b>View steps → Anchorage &amp; lap</b>.'))
    ];
  });

  /* ================================================================ 6 · YIELD LINE */
  const TB = (head, rows) => `<table class="tb"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const tY = topic('yield', 'Yield line', 'Irregular slabs by collapse', 'yl');
  lesson(tY, 'concept', 'Concept', 'Collapse mechanisms for irregular slabs', () => [
    TITLE(tY, 'Concept', 'Yield line', 'Collapse mechanisms for irregular slabs'),
    SD('THE IDEA', 'Collapse by yield lines', UL([
      'A slab loaded to collapse forms <b>yield lines</b>: cracks where the steel yields. They split the slab into rigid plates.',
      'Each plate turns about its supported edge. <b>Work done by the load = work absorbed in the yield lines.</b>',
      'It is a plastic <b>upper-bound</b> method, quick for odd shapes where coefficient tables do not exist.'])),
    SD('THE PICTURE', 'Plates and yield lines',
      FIG(figYieldPlan({ P: [[0, 0], [6, 0], [5, 4], [0, 4]], ap: [2.7, 2.1], e: ['S', 'S', 'S', 'C'], H: 138, plates: [[2.7, 0.7, '1'], [4.6, 2.0, '2'], [2.9, 3.4, '3'], [0.9, 2.1, '4']] }) + figYieldSide(),
        'Dashed cyan lines join the apex <b>P</b> to the corners. <b>S</b> = simple edge, <b>C</b> = continuous edge.')),
    SD('THE MECHANISM', 'The fan used by the app', UL([
      'Pick an apex <b>P</b> and join it to every corner: one triangular plate per edge. The app accepts P only where the perpendicular from P meets each edge.',
      'Plate k has base <b>L</b> (the edge) and height <b>h</b> (distance from P to the edge). Give P a deflection δ: the plate rotates by θ = δ/h.',
      'The app searches a grid for the apex that gives the <b>largest m</b>: the critical fan.'])),
    SD('WORK EQUATION', 'Equating the work',
      EQ('External work, plate k', 'n · (L·h/2) · (δ/3)', 'load × plate area × deflection of its centroid') +
      EQ('Internal work, plate k', 'm·(1+ρ)·L · (δ/h)', 'ρ = 0 on a simple edge · ρ = i on a continuous edge') +
      EQ('Equate and solve', 'm = n·Σ(L·h) / [ 6·Σ((1+ρ)·L/h) ]', 'm in kNm/m · n in kN/m² · L and h in m', true)),
    SD('EDGES', 'Simple or continuous', UL([
      '<b>S</b> = simple edge: no hogging moment (ρ = 0).',
      '<b>C</b> = continuous edge: a hogging yield line with m′ = i·m (ρ = i). The app default is i = 1.',
      'Design moments: <b>m</b> for sagging in both directions and <b>i·m</b> for hogging. The flexure design then follows the Flexure lessons.'])),
    SD('LIMITS', 'Use it with care', UL([
      'Upper-bound method: a mechanism that is not the critical one can <b>under-estimate</b> the moment needed. Try other apex positions and patterns.',
      'The fan needs a <b>convex</b> polygon. The app rejects concave shapes.',
      'It covers collapse (ULS) only. Deflection and cracking need separate checks.',
      'The app’s shear is a simple estimate: V = n·hmax/2 (×1.15 with a continuous edge). Verify it for important slabs.'])),
    SD('IN THE APP', 'Where to find it',
      P('Open <b>Design → Irregular</b> and choose <b>Yield Line</b>. Enter 3 to 6 vertices (x, y in mm), mark each edge <b>S</b> or <b>C</b>, then run the design.') +
      CALL('Next lesson: a worked example on a square panel, where the answer can be checked by hand.'))
  ]);
  lesson(tY, 'example', 'Worked example', 'A 4.0 m square panel', () => {
    const y = Y(), S = y.S, K = y.K, n = y.ld.n, sum = (a, k) => a.reduce((t, e) => t + e[k], 0);
    const sLh = sum(y.eS, 'Lh'), sS = y.eS.reduce((s, e) => s + (1 + e.rho) * e.Lhr, 0), sK = y.eK.reduce((s, e) => s + (1 + e.rho) * e.Lhr, 0);
    const edgeFig = ed => figYieldPlan({
      P: [[0, 0], [4, 0], [4, 4], [0, 4]], ap: [S.Pxs, S.Pys], e: [ed, ed, ed, ed], H: 150,
      extra: ({ X, Yy }) => dim(X(S.Pxs) + 14, Yy(S.Pys), X(S.Pxs) + 14, Yy(0) - 9, C.am) + tx(X(S.Pxs) + 18, Yy(S.Pys / 2) + 3, 'h = ' + fx(S.hmax, 1) + ' m', { a: 'start', c: C.am, w: 700, s: 8.5 }) +
        dim(X(0), Yy(0) + 11, X(4), Yy(0) + 11, C.cy) + tx(X(2), Yy(0) + 20, 'L = 4.0 m', { c: C.cy, w: 700, s: 8.5 })
    });
    return [
      TITLE(tY, 'Worked example', 'Yield line', 'A 4.0 m square panel'),
      SD('GIVEN', 'Panel P1', FIG(edgeFig('S'), '') +
        KV([['Panel', '4.0 × 4.0 m square'], ['Load n', g(n, 2) + ' kN/m²'], ['Case A', 'all edges simple (S)'], ['Case B', 'all edges continuous (C), i = 1']])),
      SD('STEP 1', 'Apex and plates',
        P(`The grid search puts the apex at the centre, P = (${fx(S.Pxs, 1)} , ${fx(S.Pys, 1)}) m. All four plates are alike.`) +
        TB(['Plate', 'L (m)', 'h (m)', 'L·h', 'L/h'], y.eS.map((e, i) => [i + 1, fx(e.L, 2), fx(e.h, 2), fx(e.Lh, 2), fx(e.Lhr, 2)]).concat([['Σ', fx(sum(y.eS, 'L'), 1), '', '<b>' + fx(sLh, 1) + '</b>', fx(sum(y.eS, 'Lhr'), 1)]]))),
      SD('STEP 2', 'Case A · simple edges',
        EQ('Σ(L·h)', 'sum over the 4 plates', `= <b>${fx(sLh, 1)} m²</b>`) +
        EQ('Σ((1+ρ)·L/h)', 'ρ = 0 on every edge', `= <b>${fx(sS, 1)}</b>`) +
        EQ('Sagging moment', 'm = n·Σ(L·h) / [ 6·Σ((1+ρ)·L/h) ]', `= ${g(n, 2)}·${fx(sLh, 1)} / (6·${fx(sS, 1)}) = <b>${g(S.msag, 2)} kNm/m</b>`, true) +
        CALL(`Hand check: a simply supported square has m = n·L²/24 = ${g(n, 2)}·16/24 = ${g(n * 16 / 24, 2)} ✓`)),
      SD('STEP 3', 'Case B · continuous edges',
        EQ('Σ((1+ρ)·L/h)', 'ρ = i = 1 on every edge', `= <b>${fx(sK, 1)}</b>`) +
        EQ('Sagging moment', 'm = n·Σ(L·h) / [ 6·Σ((1+ρ)·L/h) ]', `= ${g(n, 2)}·${fx(sLh, 1)} / (6·${fx(sK, 1)}) = <b>${g(K.msag, 2)} kNm/m</b>`, true) +
        EQ('Hogging moment', 'm′ = i·m', `= 1·${g(K.msag, 2)} = <b>${g(K.mhog, 2)} kNm/m</b>`) +
        CALL(`Hand check: a square fixed on all edges has m = n·L²/48 = ${g(n * 16 / 48, 2)} ✓`)),
      SD('RESULT', 'Design moments and shear',
        TB(['Case', 'm sag', 'm′ hog', 'V (app)'], [['A · simple', g(S.msag, 2), '–', g(S.V, 2)], ['B · continuous', g(K.msag, 2), g(K.mhog, 2), g(K.V, 2)]]) +
        P('Moments in kNm/m, V in kN/m (the app’s simple estimate n·hmax/2, ×1.15 with continuous edges).') +
        CALL('Next: design the steel for these moments exactly as in the Flexure lessons, one strip per direction.'))
    ];
  });

  /* ================================================================ Stage 47 · extended lesson content
     Extra slides are inserted into every lesson (before “IN THE APP” in concepts, before “RESULT” in examples)
     so each concept is explained completely: idea → mechanics → method → limits → mistakes → recap.            */
  const alt = (inp, cin) => E.design(Object.assign({ cs: 'Simply supported', L: 4000, bw: 300, hb: 500 }, inp), Object.assign({}, E.DEF, cin || {}));
  function figSupportAnchor(v) {                  // bottom bar anchored at a supporting beam: lav, lbd, cover, force FE
    v = v || {};
    return svg('0 0 300 142',
      `<rect x="20" y="18" width="270" height="34" rx="2" fill="${C.con}" stroke="${C.conD}"/>` +
      `<rect x="20" y="52" width="96" height="62" rx="2" fill="${C.conD}"/>` + tx(68, 88, 'beam bw', { s: 8.5, c: C.dk, w: 700 }) +
      `<path d="M30 44H286" stroke="${C.gr}" stroke-width="4.6" stroke-linecap="round" class="dr" pathLength="1"/>` +
      ln(20, 14, 20, 128, C.mu, 0.8, '3 3') + ln(116, 14, 116, 128, C.mu, 0.8, '3 3') + ln(30, 18, 30, 52, C.am, 0.8, '2 2') +
      arr(250, 36, 290, 36, C.gr, 1.8, 6) + tx(270, 29, 'FE', { c: C.gr, w: 700, s: 10 }) +
      dim(30, 124, 116, 124, C.cy) + tx(73, 137, 'lav = bw − cover' + (v.lav ? ' = ' + v.lav + ' mm' : ''), { c: C.cy, w: 700, s: 9 }) +
      dim(30, 100, 30 + (v.k || 0.55) * 86, 100, C.am) + tx(30 + (v.k || 0.55) * 43, 111, 'lbd' + (v.lbd ? ' = ' + v.lbd : ''), { c: C.am, w: 700, s: 9 }) +
      tx(160, 80, 'the bar must be anchored for FE = VEd·al / z', { s: 8.5, a: 'start' }) +
      tx(160, 94, 'inside the length available at the support', { s: 8.5, a: 'start' }));
  }
  function figMomentShear() {                     // moment + shear diagram of a simply supported strip (UDL)
    return svg('0 0 300 168',
      udl(40, 260, 6, 20, 12, C.gr) + `<rect x="30" y="22" width="240" height="8" rx="2" fill="${C.con}"/>` + supp(40, 30, C.wh) + supp(260, 30, C.wh) +
      ln(40, 70, 260, 70, C.mu, 1) + `<path d="M40 70Q150 128 260 70" fill="rgba(239,68,68,.2)" stroke="${C.rd}" stroke-width="1.6"/>` + tx(150, 92, 'M = nL²/8', { c: C.rd, w: 700, s: 9 }) +
      ln(40, 140, 260, 140, C.mu, 1) + `<polygon points="40,140 40,118 150,140" fill="rgba(245,165,36,.25)" stroke="${C.am}" stroke-width="1.4"/><polygon points="150,140 260,140 260,162" fill="rgba(245,165,36,.25)" stroke="${C.am}" stroke-width="1.4"/>` +
      tx(50, 114, '+nL/2', { c: C.am, w: 700, s: 8.5, a: 'start' }) + tx(250, 160, '−nL/2', { c: C.am, w: 700, s: 8.5, a: 'end' }) + tx(284, 74, 'M', { c: C.rd, w: 700, s: 9 }) + tx(284, 144, 'V', { c: C.am, w: 700, s: 9 }));
  }
  const EX = {};
  /* ------------------------------------------------ 1 · FLEXURE */
  EX['flexure-concept'] = () => {
    const c = E.DEF, o = E.derive(c), cs = E.CASES;
    return [
      SD('BEFORE WE START', 'The slab strip and its units',
        UL(['A one-way slab bends mainly in the <b>short direction</b>, so we cut out a strip <b>1 m wide</b> running across the beams and design that strip like a small beam.',
          'Units used everywhere in the app: <b>kN</b>, <b>m</b> for spans, <b>mm</b> for section sizes, <b>N/mm²</b> (= MPa) for stresses. Moments come out in <b>kNm per metre of slab</b>.',
          'A slab is called one-way when it spans between two supports, or when a rectangular panel has ly/lx &gt; 2: nearly all the load then travels along the short span.'])),
      SD('LOADS', 'From pressure to line load',
        P('The load on a slab is a pressure (kN/m²). On a 1 m strip, 1 m² of pressure is the same number as 1 kN/m of line load, so <b>n (kN/m²) = w (kN/m)</b>.') +
        EQ('Permanent (dead) load', 'Gk = finishes + services + h·γconcrete', `self-weight = h(m)·${c.gconc} kN/m³`) +
        EQ('Variable (live) load', 'Qk', 'people, furniture, movable partitions: set by the use of the building') +
        EQ('Ultimate design load', 'n = γG·Gk + γQ·Qk', `γG = ${c.gG} and γQ = ${c.gQ}: the factors cover the chance that loads are higher than expected`, true) +
        CALL('Safety is added twice: factors on <b>loads</b> (γG, γQ) and factors on <b>materials</b> (γc, γs).')),
      SD('MOMENTS', 'How the bending moment is found',
        FIG(figMomentShear(), 'Simply supported strip under uniform load: the moment is a parabola with its peak at mid-span; the shear is largest at the supports.') +
        EQ('Simply supported', 'M = n·L² / 8', 'peak sagging moment at mid-span', true) +
        P('Continuous slabs use coefficients: ' + `<b>end span</b> ${cs['End span'][0]}·nL² sagging and ${cs['End span'][1]}·nL² hogging · <b>interior span</b> ${cs['Interior span'][0]}·nL² and ${cs['Interior span'][1]}·nL² · <b>cantilever</b> ${cs['Cantilever'][1]}·nL² hogging at the root.`)),
      SD('WHICH SIDE?', 'Sagging and hogging',
        UL(['<b>Sagging</b> (positive) moment bends the slab like a smile: tension at the <b>bottom</b>, so the main bars are at the bottom near mid-span.',
          '<b>Hogging</b> (negative) moment bends it like a frown: tension at the <b>top</b>, so bars go on the top face over an interior support, and at the root of a cantilever.',
          'A continuous slab has both: the app designs <b>bottom bars</b> for the sagging moment and <b>top bars</b> for the hogging moment at the supports.'])),
      SD('THREE STAGES', 'How a slab really behaves',
        UL(['<b>Stage 1 · uncracked</b>: at small loads the whole section works and the steel hardly matters.',
          '<b>Stage 2 · cracked</b>: the bottom concrete cracks; the steel takes all the tension. This is the stage of service loads (used for deflection and cracks).',
          '<b>Stage 3 · ultimate</b>: the steel yields and the top concrete reaches its crushing strain. This is the stage used for the strength design in this lesson.']) +
        CALL('We design for stage 3 and then check stage 2 (deflection, crack width) separately.')),
      SD('THE ASSUMPTIONS', 'What the design model assumes',
        UL(['Plane sections stay plane: strain varies <b>linearly</b> with the distance from the neutral axis.',
          'Concrete takes <b>no tension</b> after cracking.',
          'Concrete crushes at the strain <b>εcu = 0.0035</b>; the compressive stress is replaced by an equivalent <b>rectangular block</b> of depth <b>0.8x</b> and stress <b>fcd</b>.',
          'Steel is elastic-perfectly plastic: the stress is <b>fyd</b> once it yields.'])),
      SD('DERIVING THE FORMULAS', 'Where z and As come from',
        EQ('Compression force', 'Fc = fcd · b · 0.8x', 'from the rectangular block') +
        EQ('Lever arm', 'z = d − 0.4x', 'the block acts at 0.4x below the top face') +
        EQ('Moment of the couple', 'M = Fc·z = 0.8·x·b·fcd·(d − 0.4x)', 'this gives a quadratic in x') +
        EQ('Solved with K', `z = d·[0.5 + √(0.25 − K/${g(o.k2, 3)})]`, 'K = M/(b·d²·fck): a handy dimensionless measure of how hard the section works', true) +
        EQ('Tension force', 'Fs = As·fyd = Fc', 'equilibrium: tension equals compression, so As = M/(fyd·z)')),
      SD('DUCTILITY', 'Under-reinforced is the goal',
        UL(['<b>Under-reinforced</b> (low K): the steel yields first. The slab deflects and cracks visibly, giving <b>warning</b> before collapse.',
          '<b>Over-reinforced</b> (high K): concrete crushes before the steel yields: a sudden, brittle failure with no warning. EC2 forbids it by limiting x/d.',
          `The limit <b>K′ = ${c.Kl}</b> (about x/d ≤ 0.45) keeps the slab ductile. If K &gt; K′ the app reports ✗: make the slab <b>thicker</b> (the best fix for slabs), or add compression steel (not designed by the app).`])),
      SD('CHOOSING BARS', 'From As to bar size and spacing',
        EQ('Spacing', 's = Ab·1000 / As', 'Ab = area of one bar: H12 = 113 mm², H10 = 78.5 mm²') +
        UL(['Round the spacing <b>down</b> to a multiple of 25 mm.', 'Maximum spacing for main bars: min(3h , 400 mm). Minimum practical spacing: about 75 mm (the app flags less).', 'Distribution (secondary) bars run at right angles on top of the main bars: at least <b>20 %</b> of the main steel.'])),
      SD('COMMON MISTAKES', 'Check yourself against these',
        UL(['Mixing units: moment in kNm but section in mm → multiply by 10⁶.', 'Using the slab thickness h instead of the <b>effective depth d</b> = h − cover − Φ/2.', 'Forgetting self-weight in Gk.', 'Taking As from the formula but ignoring <b>As,min</b>.', 'Putting the bars at the wrong face: sagging → bottom, hogging → top.'])),
      SD('RECAP', 'Flexure in one minute',
        UL(['Load n → moment M (coefficients or analysis) → K → z → <b>As = M/(fyd·z)</b>.', 'Check <b>K ≤ K′</b>, <b>As ≥ As,min</b> and <b>As ≤ As,max</b>.', 'Choose bars, then verify with <b>MRd ≥ MEd</b>.', 'Then move on to shear, deflection, cracking and anchorage: strength is only the first of five checks.']))
    ];
  };
  EX['flexure-example'] = () => {
    const m = M(), R = m.R, c = m.c, f = R.fs, ld = R.ld, L = R.L / 1000;
    const hand = ld.n * L * L / 8, t = alt({ hov: 300 }), t2 = alt({ L: 5000 });
    return [
      SD('HAND CHECK', 'Is the moment sensible?',
        EQ('Independent calculation', 'M = n·L² / 8', `= ${g(ld.n, 2)}·${fx(L, 1)}² / 8 = <b>${g(hand, 2)} kNm/m</b>`, true) +
        CALL(`The app gives ${g(R.Ms, 2)} kNm/m: the same. Always do a rough check like this before trusting any program.`)),
      SD('SELF-CHECK', 'Does the steel look reasonable?',
        EQ('Steel ratio', 'ρ = As,prov / (b·d)', `= ${g(f.Ap, 0)} / (${c.b}·${g(R.d, 0)}) = <b>${g(100 * f.Ap / (c.b * R.d), 2)} %</b>`) +
        UL(['Typical slabs sit between about <b>0.15 % and 0.8 %</b>: this is inside the normal range.', `As,min = ${g(f.Amin, 0)} mm²/m is ${f.Amin > f.Ar ? 'governing' : 'lower than As,req, so the calculation governs'}.`, `The bar spacing (${f.sp} mm) is ≤ min(3h , 400) = ${Math.min(3 * R.h, 400)} mm ✓`])),
      SD('WHAT IF?', 'A thicker slab, h = 300 mm',
        EQ('New load', 'self-weight grows', `n = ${g(t.ld.n, 2)} kN/m² (was ${g(ld.n, 2)})`) +
        EQ('New moment', 'M = n·L²/8', `= <b>${g(t.Ms, 2)} kNm/m</b> (was ${g(R.Ms, 2)})`) +
        EQ('New steel', 'As,req', `= <b>${g(t.fs.Ar, 0)} mm²/m</b> (was ${g(f.Ar, 0)}) with d = ${g(t.d, 0)} mm`, true) +
        CALL('A deeper slab needs <b>less</b> steel per metre even though the load is higher: the lever arm grows faster than the moment.')),
      SD('WHAT IF?', 'A longer span, L = 5.0 m',
        EQ('Moment', 'M = n·L²/8', `= <b>${g(t2.Ms, 2)} kNm/m</b> (was ${g(R.Ms, 2)}): × ${g(t2.Ms / R.Ms, 2)} for a span only 25 % longer`) +
        EQ('Steel', 'As,req', `= <b>${g(t2.fs.Ar, 0)} mm²/m</b> → ${t2.fs.txt}`, true) +
        CALL('The moment grows with the <b>square</b> of the span: spans are the most powerful variable in slab design.'))
    ];
  };
  /* ------------------------------------------------ 2 · SHEAR */
  EX['shear-concept'] = () => [
    SD('THE MECHANISM', 'How concrete resists shear without stirrups',
      UL(['<b>Uncracked compression zone</b> carries part of the shear in the top of the slab.', '<b>Aggregate interlock</b>: the rough faces of a diagonal crack lock together and transfer force across it.', '<b>Dowel action</b>: the tension bars resist a little vertical movement of the crack faces.', 'Together these give the concrete shear strength VRd,c: no links needed if VEd stays below it.'])),
    SD('SHEAR CRACKS', 'Diagonal tension',
      P('Shear makes the concrete try to split along diagonals at about 45°. Without links the diagonal crack can open suddenly, so shear failure is <b>brittle</b>: it gives little warning. This is why EC2 asks for a clear check, even for slabs.') +
      CALL('Flexural failure is ductile; shear failure is not. Design so that the slab always fails in bending first.')),
    SD('THE FORMULA PARTS', 'Reading VRd,c term by term',
      EQ('Size effect', 'k = 1 + √(200/d) ≤ 2.0', 'thicker members are weaker per unit depth, so k falls as d grows') +
      EQ('Steel effect', '(100·ρ1·fck)^⅓', 'more tension steel keeps cracks narrow, which improves interlock and dowel action') +
      EQ('Concrete effect', 'fck^½ in vmin', 'a stronger concrete has a stronger tensile strength') +
      CALL('ρ1 only counts bars that continue at least lbd + d beyond the section: this is why <b>anchorage matters for shear</b>.')),
    SD('SUPPORT SHEAR', 'How big is V?',
      EQ('Simply supported', 'V = n·L / 2', 'at the centre-line of each support', true) +
      P('In continuous strips the first interior support carries more: about <b>0.6·n·L</b> for an end span (coefficient βv = 0.6, as the app uses) and <b>0.5·n·L</b> for an interior span. For an exact value the app’s <b>continuous strip</b> analysis takes the envelope of load patterns.')),
    SD('WORKFLOW', 'The shear check in order',
      UL(['1 · Find V at the support centre-line.', '2 · Move to the section at <b>x = bw/2 + d</b> and compute VEd,d = V − n·x.', '3 · Compute k, ρ1, then VRd,c.', '4 · If VEd,d ≤ VRd,c → <b>OK</b>. Also confirm VEd,face ≤ VRd,max.', '5 · If it fails: <b>increase h</b> first; links only if the slab is at least 200 mm deep.'])),
    SD('COMMON MISTAKES', 'What goes wrong',
      UL(['Checking at the face of the beam instead of at <b>d</b> (conservative, but not what EC2 intends).', 'Forgetting that the span is centre-to-centre, so V acts at the <b>centre-line</b>.', 'Using ρ1 from all the bars when only part of them reach the support.', 'Using shear at d when the load is <b>not</b> applied on the top face (for example a line load hung from the slab).'])),
    SD('RECAP', 'Shear in one minute',
      UL(['Check <b>VEd,d ≤ VRd,c</b> at x = bw/2 + d.', 'Also <b>VEd,face ≤ VRd,max</b> (no crushing).', 'To fix a failure: thicker slab → more steel to the support → links.', 'Enter <b>bw</b> in the app or the shear check stays ✗.']))
  ];
  EX['shear-example'] = () => {
    const m = M(), R = m.R, s = m.sh, a = m.at, ld = R.ld, e = alt({ cs: 'End span' }), t = alt({ hov: 160 });
    return [
      SD('HAND CHECK', 'Using the simplest numbers',
        EQ('Support shear', 'V = n·L/2', `= ${g(ld.n, 2)}·${fx(R.L / 1000, 1)}/2 = ${g(R.V, 2)} kN/m ✓`) +
        EQ('Reduction in 0.35 m', 'n·x', `= ${g(ld.n, 2)}·${g(a.x / 1000, 3)} = ${g(ld.n * a.x / 1000, 2)} kN/m (${g(100 * ld.n * a.x / 1000 / R.V, 0)} % of V)`) +
        CALL('The check at d removes a noticeable part of the shear: that is why the app asks for the beam width.')),
      SD('WHAT IF?', 'The same slab as an end span',
        EQ('Support shear', 'V = 0.6·n·L', `= <b>${g(e.V, 2)} kN/m</b> (simply supported: ${g(R.V, 2)})`) +
        EQ('At d from the face', 'VEd,d', `= ${g(e.sh.at.Vd, 2)} kN/m against VRd,c = ${g(e.sh.vc, 1)} kN/m → ${e.sh.at.passC ? '✓' : '✗'}`, true) +
        CALL('Continuity <b>reduces</b> the mid-span moment but <b>raises</b> the support shear: check both.')),
      SD('WHAT IF?', 'A very slender slab, h = 160 mm',
        EQ('Effective depth', 'd', `= <b>${g(t.d, 0)} mm</b> (was ${g(R.d, 0)})`) +
        EQ('Capacity', 'VRd,c', `= <b>${g(t.sh.vc, 1)} kN/m</b> (was ${g(s.vc, 1)})`) +
        EQ('Demand', 'VEd,d', `= ${g(t.sh.at.Vd, 2)} kN/m → ${t.sh.at.passC ? '✓ still passes' : '✗ fails'}`, true) +
        CALL('Shear capacity is roughly proportional to d, so thin slabs lose capacity quickly.'))
    ];
  };
  /* ------------------------------------------------ 3 · DEFLECTION */
  EX['deflection-concept'] = () => [
    SD('WHAT CAUSES IT', 'Why a slab keeps sagging',
      UL(['<b>Elastic</b> deflection appears when the load is applied; it depends on the stiffness EI.', '<b>Cracking</b> lowers the stiffness of the slab: a cracked slab deflects more than an uncracked one.', '<b>Creep</b> (concrete slowly shortening under long-term load) can double the deflection over the years.', '<b>Shrinkage</b> curls the slab because the steel restrains the bottom more than the top.'])),
    SD('THE FIRST PRINCIPLES', 'The deflection formula and the shortcut',
      EQ('Elastic deflection', 'δ = 5·w·L⁴ / (384·E·I)', 'simply supported, uniform load: L enters to the <b>fourth power</b>') +
      P('A full calculation needs the cracked inertia, creep and shrinkage. EC2 7.4.2 replaces it with a tested limit on <b>L/d</b>, valid when it is applied with the conditions in the code.') +
      CALL('Doubling the thickness cuts the elastic deflection by a factor of 8 (I grows with h³).')),
    SD('EFFECT OF STEEL', 'Why ρ appears in the limit',
      UL(['The expression (7.16) gives a <b>higher</b> allowed L/d when ρ is small: a lightly stressed section cracks less and stays stiffer.', 'A <b>heavily reinforced</b> slab (ρ &gt; ρ0) is more highly stressed, so its allowed L/d is lower.', 'ρ0 = √fck/1000 is the reference ratio that separates the two cases.', 'The app uses at least As,min when it works out ρ, so a very lightly reinforced slab does not get an unrealistically high limit.'])),
    SD('SUPPORT CONDITION', 'Why K depends on the structure',
      TB(['Case', 'K', 'Why'], [['Simply supported', '1.0', 'the whole span sags'], ['End span', '1.3', 'one end is restrained'], ['Interior span', '1.5', 'both ends are restrained'], ['Cantilever', '0.4', 'free end deflects a lot']]) +
      P('A continuous slab is stiffer because the hogging moments at the supports reduce the mid-span moment and curvature.')),
    SD('PRACTICAL RULES', 'Quick thickness estimates',
      UL(['For a simply supported one-way slab, try <b>h ≈ L/25</b> to L/30 in normal conditions.', 'For an end span <b>L/30–L/35</b>; for an interior span <b>L/35–L/40</b>.', 'Cantilevers: <b>L/8–L/10</b>.', 'These are only starting points: the app does the real check.'])),
    SD('COMMON MISTAKES', 'What to watch',
      UL(['Using the total depth h instead of the effective depth d in L/d.', 'Ignoring the 7 m rule for long spans with brittle partitions.', 'Providing much more steel than required just to pass: it works up to f1 = 1.5 only.', 'Forgetting that irregular slabs always need a direct check in the app.'])),
    SD('RECAP', 'Deflection in one minute',
      UL(['Keep <b>L/d ≤ basic × f1 × f2</b>.', 'Basic depends on ρ, fck and K.', 'Fix a failure with <b>more depth</b>.', 'The rule controls the deflection after the finishes are applied, not construction stages.']))
  ];
  EX['deflection-example'] = () => {
    const m = M(), R = m.R, df = R.df, t = alt({ L: 5000 }), u = alt({ hov: 160 });
    return [
      SD('HAND CHECK', 'Rule of thumb',
        EQ('Thickness / span', 'h / L', `= ${R.h} / ${R.L} = L/${g(R.L / R.h, 1)}`) +
        CALL('Our slab is about L/16 deep, far thicker than the usual L/25 starting guess: this is why the check has plenty of margin.')),
      SD('WHAT IF?', 'A longer span, L = 5.0 m',
        EQ('New limit', 'allowed L/d', `= ${g(t.df.mod, 1)}`) + EQ('New actual', 'L/d', `= ${g(t.df.act, 1)} → ${t.df.chk === 'OK' ? '✓' : '✗'}`, true) +
        CALL('The longer the span at the same thickness, the closer L/d gets to its limit.')),
      SD('WHAT IF?', 'A thin slab, h = 160 mm',
        EQ('Allowed', 'L/d limit', `= ${g(u.df.mod, 1)}`) + EQ('Actual', 'L/d', `= ${g(u.df.act, 1)} → ${u.df.chk === 'OK' ? '✓' : '✗ too slender'}`, true) +
        CALL(u.df.chk === 'OK' ? 'It still passes, but with much less margin.' : 'The fix: increase the thickness. Check again after every change.', u.df.chk === 'OK' ? '' : 'am'))
    ];
  };
  /* ------------------------------------------------ 4 · CRACK CONTROL */
  EX['crack-concept'] = () => [
    SD('HOW A CRACK FORMS', 'Tension stiffening',
      UL(['When the bottom concrete reaches its tensile strength, a first crack opens and the steel takes the whole force there.', 'Between cracks the bond transfers force back to the concrete, so the concrete between cracks still carries some tension (<b>tension stiffening</b>).', 'New cracks form until the bond can no longer build up enough tension: this fixes the <b>crack spacing</b>.'])),
    SD('CRACK WIDTH', 'What decides wk',
      EQ('Crack width', 'wk = sr,max · (εsm − εcm)', 'distance between cracks × difference in mean strain of steel and concrete') +
      UL(['Larger steel stress → larger εsm → wider cracks.', 'Larger bar spacing or cover → larger sr,max → wider cracks.', 'Smaller bars at close spacing → narrower cracks.']) +
      CALL('Table 7.3N packages these effects into a simple spacing limit.')),
    SD('EXPOSURE', 'Choosing the wk limit',
      TB(['Exposure', 'Typical wk'], [['XC1 · dry interior', '0.4 mm'], ['XC2–XC4 · wet / outdoors', '0.3 mm'], ['XD / XS · chlorides', '0.3 mm or less, plus cover and durability rules']]) +
      P('The limit is a <b>durability</b> and appearance measure, not a strength limit. Choose it from the exposure class of the slab.')),
    SD('MINIMUM STEEL', 'Preventing a single wide crack',
      P('If the slab has too little steel, the first crack can yield the bar and open widely. EC2 7.3.2 and 9.2.1.1 therefore require a <b>minimum steel</b> area. The app uses As,min = max(0.26·fctm/fyk·b·d , 0.0013·b·d) in the flexure design, so this is already covered.')),
    SD('BARS AND COVER', 'Practical effects',
      UL(['<b>Smaller bars at closer spacing</b> beat large bars far apart for the same area.', 'More <b>cover</b> protects the steel but widens surface cracks: do not over-cover.', 'Top bars over supports are the most exposed to cracking: check them too.'])),
    SD('COMMON MISTAKES', 'What goes wrong',
      UL(['Using the table above 360 N/mm²: it does not apply.', 'Using the <b>ultimate</b> load instead of the quasi-permanent load for σs.', 'Passing the strength design and forgetting that cracking may need closer bars.', 'Assuming the h ≤ 200 mm exemption always applies: the app asks for review.'])),
    SD('RECAP', 'Crack control in one minute',
      UL(['<b>s ≤ smax(σs , wk)</b>.', 'σs ≈ fyd·(As,req/As,prov)·(q/n).', 'Tighten the spacing until the rule passes.', 'The thinner the bars and the closer the spacing, the narrower the cracks.']))
  ];
  EX['crack-example'] = () => {
    const m = M(), R = m.R, f = R.fs, a = alt({}, { wk: 0.4 }), b = alt({}, { wk: 0.2 });
    return [
      SD('WHAT IF?', 'A dry interior, wk = 0.4 mm',
        EQ('Spacing', 'H12 @', `<b>${a.fs.sp} mm</b> (wk = 0.3: ${f.sp} mm)`) + EQ('Steel', 'As,prov', `${g(a.fs.Ap, 0)} mm²/m`, true) +
        CALL('A looser limit allows wider spacing and less steel.')),
      SD('WHAT IF?', 'A demanding exposure, wk = 0.2 mm',
        EQ('Spacing', 'H12 @', `<b>${b.fs.sp} mm</b> (wk = 0.3: ${f.sp} mm)`) + EQ('Steel', 'As,prov', `${g(b.fs.Ap, 0)} mm²/m`, true) +
        CALL('A stricter limit tightens the spacing: more bars, same strength.')),
      SD('TAKEAWAY', 'Spacing is a trade-off',
        UL(['The bars needed for strength are rarely the bars needed for cracking.', 'The iteration in the app (lower s → lower σs → higher smax) always ends on a safe spacing.', 'You can also change the bar size in Project defaults to see the effect.']))
    ];
  };
  /* ------------------------------------------------ 5 · ANCHORAGE */
  EX['anchorage-concept'] = () => {
    const c = E.DEF;
    return [
      SD('HOW BOND WORKS', 'Three ways a bar grips the concrete',
        UL(['<b>Adhesion</b>: a weak chemical grip that is lost at the first slip.', '<b>Friction</b> from the roughness of the bar.', '<b>Mechanical interlock</b> of the ribs: by far the main source. The ribs push on the concrete, which then cracks and splits around the bar if the cover is small.'])),
      SD('GOOD AND POOR BOND', 'η1: where the bar sits',
        P('Bond is better where the concrete is well compacted and not weakened by bleed water.') +
        UL(['<b>Good bond (η1 = 1.0)</b>: slab h ≤ 250 mm, or bars in the bottom half of a thicker slab.', '<b>Poor bond (η1 = 0.7)</b>: <b>top bars</b> in a slab thicker than 250 mm.', 'The app picks η1 for each bar group from the slab thickness: bottom bars are always good; top bars become poor when h &gt; 250 mm.']) +
        CALL('Poor bond makes fbd 30 % smaller, so the anchorage length grows by 1/0.7 = 43 %.')),
      SD('THE α FACTORS', 'Correcting the length for the detail',
        TB(['Factor', 'Effect', 'App value'], [['α1', 'shape of the bar (hooks, bends)', '1.0 · straight bars'], ['α2', 'concrete cover: more cover → shorter', '1 − 0.15(cd − Φ)/Φ, between 0.7 and 1.0'], ['α3', 'confinement by transverse steel', '1.0 · no transverse steel counted'], ['α4', 'welded transverse bars', '1.0'], ['α5', 'transverse pressure', '1.0 · conservative']]) +
        P('Product limit: <b>α2·α3·α5 ≥ 0.7</b>.')),
      SD('COVER AND α2', 'How cd is found',
        EQ('Cover dimension', 'cd = min( a/2 , c1 , c )', 'a = clear distance between bars · c1 = side cover · c = bottom cover') +
        EQ('Factor', 'α2 = 1 − 0.15·(cd − Φ)/Φ', `for H${c.phi} at ${c.cover} mm cover: cd = ${c.cover} → α2 = <b>${g(1 - 0.15 * (c.cover - c.phi) / c.phi, 3)}</b>`, true) +
        CALL('The app takes cd from your cover and the final bar spacing, so changing the cover or the spacing changes lbd.')),
      SD('THE SUPPORT RULE', 'Bars that reach the support',
        FIG(figSupportAnchor(), 'At a simple end support the bottom bars pull on the concrete with the force <b>FE</b>. They need lbd inside the support.') +
        EQ('Force to anchor', 'FE = VEd·al/z + NEd', 'EC2 9.2.1.4(2): al = d for slabs without links, z ≈ 0.9d, NEd = 0 in slabs', true) +
        EQ('Bars to support', 'at least 50 % of the span steel', 'EC2 9.3.1.2(1): the app uses 50 % by default (Project defaults → Bars to support)')),
      SD('THE AVAILABLE LENGTH', 'Does the bar fit?',
        EQ('Straight length at the beam', 'lav = bw − cover', 'from the beam centre-line support face to the end of the bar, less the end cover', true) +
        EQ('Condition', 'lbd,support ≤ lav', 'if it fails: wider support, smaller bars, or bend/hook the bars (check the α1 rules)') +
        CALL('This is the check that the app now performs and reports as <b>Anchorage / lap</b>. It needs the beam width bw.')),
      SD('LAP SPLICES', 'Joining bars',
        UL(['Lap bars at points of <b>low stress</b>, and stagger them: not all at one section.', 'α6 depends on the share of bars lapped within 0.65·l0: 25 % → 1.15 · 33 % → 1.2 · 50 % → 1.4 · &gt; 50 % → 1.5.', `The app default is α6 = ${c.a6} (more than 50 % lapped): the safe choice.`, 'The minimum lap: 15Φ and 200 mm.'])),
      SD('CURTAILMENT', 'Where top bars stop',
        UL(['A bar needed for hogging moment must extend past the point where it is no longer needed.', 'The <b>shift rule</b> (EC2 9.2.1.3) moves the moment diagram by al = d to cover shear effects.', 'So the top bar extends at least <b>lbd + d</b> beyond that point. The Steps screen reports this distance.'])),
      SD('COMMON MISTAKES', 'What goes wrong',
        UL(['Taking the full bar length as lbd: the force must also be applied from the right place.', 'Using good bond for thick-slab top bars.', 'Putting all laps at the section of maximum moment.', 'Forgetting that lbd is measured along the bar from where the bar is stressed.'])),
      SD('RECAP', 'Anchorage in one minute',
        UL(['<b>fbd = 2.25·η1·η2·fctd</b>.', '<b>lbd = α·lb,rqd ≥ lb,min</b> and <b>l0 = α6·lbd</b>.', 'At the support: <b>lbd ≤ lav = bw − cover</b>.', 'Poor bond or small covers lengthen the bars.']))
    ];
  };
  /* ------------------------------------------------ 6 · YIELD LINE */
  EX['yield-concept'] = () => [
    SD('WHY IT WORKS', 'Plasticity of a slab',
      UL(['A reinforced slab with moderate steel is <b>ductile</b>: after the steel yields along a line, the moment stays almost constant while the rotation grows.', 'Moments can therefore <b>redistribute</b> until enough yield lines form to turn the slab into a mechanism.', 'The load at which the mechanism forms is the collapse load.'])),
    SD('THE RULES', 'Johansen’s assumptions',
      UL(['Yield lines are <b>straight</b>.', 'The slab between yield lines is <b>rigid</b> (plates).', 'Yield lines form <b>at supports</b> if the edge is continuous, and between plates.', 'Each yield line between two plates goes through the <b>intersection</b> of their axes of rotation.', 'Axes of rotation lie along supported edges.'])),
    SD('UPPER BOUND', 'Why try several patterns',
      P('Any valid mechanism gives a load that is <b>≥</b> the true collapse load (upper bound). Equivalently, for a given load the moment found can be <b>too small</b>. So try several apex positions and keep the one that needs the <b>largest m</b>.') +
      CALL('The app searches a grid of apex positions to find the critical fan. For a very irregular slab, confirm with a finite-element analysis.')),
    SD('RESULT FOR RECTANGLES', 'A useful check',
      EQ('Square panel, simple edges', 'm = n·L² / 24', 'result of the fan with the apex at the centre') +
      EQ('Square panel, fixed edges', 'm = n·L² / 48', 'sagging; with i = 1 the hogging moment is the same value', true) +
      P('These are the hand checks used in the worked example.')),
    SD('STEEL LAYOUT', 'What the moments mean for the bars',
      UL(['The method gives <b>m</b> in both directions. The app designs the same bars in x and y (isotropic steel).', 'The hogging steel <b>i·m</b> goes on top along continuous edges.', 'The theory assumes the steel can yield: do not use over-reinforced sections.'])),
    SD('SERVICE CHECKS', 'After the collapse design',
      UL(['Yield-line theory says nothing about <b>deflection</b> or <b>crack width</b>.', 'Keep the ratio of support to span moments close to that of an elastic analysis (i ≈ 1 to 2) to limit cracking.', 'Check the span/depth rule as a rough guide: the app flags it for review.'])),
    SD('RECAP', 'Yield line in one minute',
      UL(['Split the slab into plates by yield lines.', 'Equate external and internal work.', '<b>m = n·Σ(L·h) / [6·Σ((1+ρ)·L/h)]</b>.', 'Try several patterns: keep the largest m.']))
  ];
  EX['yield-example'] = () => {
    const y = Y(), S = y.S, K = y.K, n = y.ld.n;
    return [
      SD('REVIEW', 'What the two cases tell us',
        EQ('Ratio', 'm(continuous) / m(simple)', `= ${g(K.msag, 2)} / ${g(S.msag, 2)} = <b>${g(K.msag / S.msag, 2)}</b>`, true) +
        P('Fixing the edges halves the sagging moment but needs the <b>same</b> value on top. This is why continuity is economical: the steel is spread between the span and the supports.')),
      SD('NEXT STEPS', 'From m to bars',
        UL([`Sagging bars for m = ${g(S.msag, 2)} kNm/m (simple) in both directions: use the Flexure lessons.`, `Hogging bars for i·m = ${g(K.mhog, 2)} kNm/m on the continuous edges.`, 'Then check shear, deflection, cracking and anchorage.']))
    ];
  };

  /* Insert the extra slides: before “IN THE APP” (concepts), before “RESULT” (examples). */
  function withExtra(id, base) {
    const f = EX[id]; if (!f) return base;
    const add = f(), key = id.endsWith('concept') ? 'IN THE APP' : 'RESULT';
    let at = base.findIndex(x => !x.title && x.tag === key);
    if (at < 0) at = base.length;
    return base.slice(0, at).concat(add, base.slice(at));
  }

  /* ---------------------------------------------------------------- public API */
  const cache = {};
  const dur = x => x.title ? 5 : Math.max(7, Math.min(18, Math.round(5 + String(x.html || '').replace(/<[^>]+>/g, '').length / 17)));
  function slides(t, l) { const k = t + ':' + l; if (!cache[k]) cache[k] = withExtra(TOPICS[t].lessons[l].id, TOPICS[t].lessons[l].build()); return cache[k]; }
  function meta(t, l) { const sl = slides(t, l), sec = sl.reduce((a, x) => a + dur(x), 0); return { slides: sl.length, mins: Math.max(1, Math.round(sec / 60)) }; }
  const ids = () => { const a = []; TOPICS.forEach(T => T.lessons.forEach(x => a.push(x.id))); return a; };
  root.SL_LEARN = { topics: TOPICS, slides, meta, dur, ids, total: () => ids().length };
})(typeof window !== 'undefined' ? window : globalThis);
