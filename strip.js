/* SlabLab – continuous strip drawing + shear-force (yellow) and bending-moment (red) diagrams.
   Pure SVG, uses the app theme variables, so it follows the light / dark themes. Used by the One-way slab screens. */
(function (root) {
  'use strict';
  const RED = '#EF4444', YEL = '#F5C518', GRN = '#12C26B', CY = '#1DD3F0', CY2 = '#0DAFCB';
  const f = (x, n) => { const s = (+x).toFixed(n); return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
  const T = (x, y, t, o) => { o = o || {}; return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.s || 8.5}" font-weight="${o.w || 600}" text-anchor="${o.a || 'middle'}" style="fill:${o.c || 'var(--mu)'}">${t}</text>`; };
  const P = (d, st) => `<path d="${d}" ${st}/>`;
  function arrow(x, y1, y2, col) { return `<path d="M${x.toFixed(1)} ${y1}V${y2 - 3}" stroke="${col}" stroke-width="1.2" fill="none"/><path d="M${(x - 2.6).toFixed(1)} ${y2 - 4.5}L${x.toFixed(1)} ${y2}L${(x + 2.6).toFixed(1)} ${y2 - 4.5}z" fill="${col}"/>`; }

  /* model = { m: multiSpan result, sp: [{L (m), w}], el, er, k: design span index } */
  function svg(model) {
    const m = model.m, sp = model.sp, n = sp.length, W = 340, X0 = 16, X1 = W - 16;
    const tot = sp.reduce((a, s) => a + s.L, 0), sc = (X1 - X0) / tot;
    const xs = [X0]; sp.forEach(s => xs.push(xs[xs.length - 1] + s.L * sc));
    let b = '';
    /* ---- 1 · strip with loads, supports and dimensions ---- */
    const yS = 44, hS = 11;
    const wmax = Math.max(...sp.map(s => s.w), 1e-9);
    if (model.k != null && sp[model.k]) b += `<rect x="${xs[model.k].toFixed(1)}" y="8" width="${(xs[model.k + 1] - xs[model.k]).toFixed(1)}" height="88" fill="rgba(29,211,240,.10)"/>`;
    sp.forEach((s, i) => {
      const a = xs[i], z = xs[i + 1], cnt = Math.max(3, Math.min(14, Math.round((z - a) / 12))), hh = 10 + 14 * s.w / wmax;
      b += `<path d="M${a.toFixed(1)} ${yS - hh - 2}H${z.toFixed(1)}" stroke="${GRN}" stroke-width="1.4" fill="none"/>`;
      for (let q = 0; q < cnt; q++) b += arrow(a + (q + 0.5) * (z - a) / cnt, yS - hh - 2, yS - 1, GRN);
      const wpx = z - a; b += T((a + z) / 2, yS - hh - 6, wpx >= 95 ? `w${i + 1} = ${f(s.w, 2)} kN/m` : wpx >= 55 ? `${f(s.w, 1)} kN/m` : `${f(s.w, 1)}`, { c: GRN, w: 700, s: wpx >= 55 ? 7.5 : 7 });
    });
    b += `<rect x="${X0}" y="${yS}" width="${(X1 - X0).toFixed(1)}" height="${hS}" rx="2" style="fill:var(--ln)" stroke="#8FA39C"/>`;
    xs.forEach((x, j) => {
      const fixedEnd = (j === 0 && model.el === 'Fixed') || (j === n && model.er === 'Fixed');
      if (fixedEnd) { const dir = j === 0 ? -1 : 1; b += `<rect x="${(x + (dir < 0 ? -7 : 0)).toFixed(1)}" y="${yS - 6}" width="7" height="${hS + 28}" fill="#8FA39C"/>`; }
      else b += `<path d="M${(x - 7).toFixed(1)} ${yS + hS + 11}L${x.toFixed(1)} ${yS + hS}L${(x + 7).toFixed(1)} ${yS + hS + 11}z" style="fill:var(--fg)"/>`;
      b += T(x, yS + hS + 23, String.fromCharCode(65 + (j % 26)), { c: CY2, w: 700, s: 9 });
    });
    sp.forEach((s, i) => { const a = xs[i], z = xs[i + 1], y = 88; b += `<path d="M${(a + 2).toFixed(1)} ${y}H${(z - 2).toFixed(1)}" stroke="${CY}" stroke-width="1"/><path d="M${(a + 2).toFixed(1)} ${y - 3}v6M${(z - 2).toFixed(1)} ${y - 3}v6" stroke="${CY}" stroke-width="1"/>` + T((a + z) / 2, y + 10, `${Math.round(s.L * 1000)} mm`, { c: CY2, w: 700, s: 8 }); });

    /* ---- 2 · bending moment diagram (red, sagging plotted downwards on the tension side) ---- */
    const bY = 178, bH = 34;
    const Mmax = Math.max(1e-9, ...m.spans.map(s => Math.max(Math.abs(s.MsA), Math.abs(s.MsB), s.Ms)));
    const mk = bH / Mmax;
    b += T(X0, 122, 'Bending moment  M  (kNm/m)', { a: 'start', c: RED, w: 700, s: 9 });
    b += `<path d="M${X0} ${bY}H${X1}" stroke="var(--mu)" stroke-width="0.8"/>`;
    m.spans.forEach((s, i) => {
      const pts = s.pts.map(p => `${(xs[i] + p.x * sc).toFixed(1)},${(bY + p.M * mk).toFixed(1)}`);
      b += `<polygon points="${xs[i].toFixed(1)},${bY} ${pts.join(' ')} ${xs[i + 1].toFixed(1)},${bY}" fill="rgba(239,68,68,.20)" stroke="${RED}" stroke-width="1.6" stroke-linejoin="round"/>`;
    });
    xs.forEach(x => { b += `<path d="M${x.toFixed(1)} 130V${bY + bH + 6}" stroke="var(--mu)" stroke-width="0.5" stroke-dasharray="2 3"/>`; });
    m.sup.forEach((v, j) => { if (Math.abs(v) > 0.005 * Mmax + 1e-6) b += T(Math.min(X1 - 6, Math.max(X0 + 6, xs[j])), bY + v * mk + (v < 0 ? -4 : 11), f(v, 1), { c: RED, s: 8, w: 700 }); });
    m.spans.forEach((s, i) => { if (s.Ms > 0.005 * Mmax) b += T(xs[i] + s.xm * sc, bY + s.Ms * mk + 10, f(s.Ms, 1), { c: RED, s: 8, w: 700 }); });

    /* ---- 3 · shear force diagram (yellow) ---- */
    const vY = 296, vH = 34;
    const Vmax = Math.max(1e-9, ...m.spans.map(s => Math.max(Math.abs(s.VA), Math.abs(s.VB))));
    const vk = vH / Vmax;
    b += T(X0, 244, 'Shear force  V  (kN/m)', { a: 'start', c: YEL, w: 700, s: 9 });
    b += `<path d="M${X0} ${vY}H${X1}" stroke="var(--mu)" stroke-width="0.8"/>`;
    m.spans.forEach((s, i) => {
      const pts = s.pts.map(p => `${(xs[i] + p.x * sc).toFixed(1)},${(vY - p.V * vk).toFixed(1)}`);
      b += `<polygon points="${xs[i].toFixed(1)},${vY} ${pts.join(' ')} ${xs[i + 1].toFixed(1)},${vY}" fill="rgba(245,197,24,.26)" stroke="${YEL}" stroke-width="1.6" stroke-linejoin="round"/>`;
      b += T(xs[i] + 3, vY - s.VA * vk + (s.VA >= 0 ? -3 : 10), f(s.VA, 1), { a: 'start', c: YEL, s: 8, w: 700 });
      b += T(xs[i + 1] - 3, vY - s.VB * vk + (s.VB >= 0 ? -3 : 10), f(s.VB, 1), { a: 'end', c: YEL, s: 8, w: 700 });
    });
    xs.forEach(x => { b += `<path d="M${x.toFixed(1)} 252V${vY + vH + 6}" stroke="var(--mu)" stroke-width="0.5" stroke-dasharray="2 3"/>`; });
    sp.forEach((s, i) => { b += T((xs[i] + xs[i + 1]) / 2, vY + vH + 14, 'span ' + (i + 1), { s: 7.5 }); });
    return `<svg viewBox="0 0 ${W} 348" width="100%" role="img" aria-label="Continuous strip, bending moment and shear force diagrams">${b}</svg>`;
  }
  function summary(model) {
    const m = model.m, ms = Math.max(...m.spans.map(s => s.Ms)), mh = Math.max(...m.sup.map(v => Math.max(0, -v))), v = Math.max(...m.spans.map(s => Math.max(Math.abs(s.VA), Math.abs(s.VB))));
    return `<div class="mt"><div>M sag max<b style="color:${RED}">${f(ms, 2)}</b>kNm/m</div><div>M hog max<b style="color:${RED}">${f(mh, 2)}</b>kNm/m</div><div>V max<b style="color:${YEL}">${f(v, 2)}</b>kN/m</div></div>`;
  }
  root.SL_STRIP = { svg, summary };
})(typeof window !== 'undefined' ? window : globalThis);
