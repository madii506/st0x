/* st0x intro: no words, no chart (~7.8s).
   a 24-hour dial assembles in the dark, with the week (168 hours) as a ring around it.
   the hand sweeps wall street's day, 9:30 to 4:00. the bell rings and a shutter rolls down.
   a green seam splits the shutter; the hand carries on in green, round the whole day and the whole week.
   the dial closes into the st0x zero, the slash locks in, and you fly through the zero into the terminal. */
(() => {
  const BG = '#070908', G = '#1fd26f', WH = '#eef2ef', OFF = '#262c29', GREY = '#58605c';
  const TAU = Math.PI * 2, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, oc = t => 1 - Math.pow(1 - t, 3), ic = t => t * t * t, oq = t => 1 - Math.pow(1 - t, 5);
  const ob = t => { const c = 1.3, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
  const ang = h => -Math.PI / 2 + h / 24 * TAU;
  const RGB = {}; const rgb = s => RGB[s] || (RGB[s] = [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)));
  const mix = (a, b, k) => { if (k <= 0) return a; if (k >= 1) return b; const A = rgb(a), B = rgb(b); return `rgb(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))})`; };
  function grainTile() { const c = document.createElement('canvas'); c.width = c.height = 180; const x = c.getContext('2d'), d = x.createImageData(180, 180);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; }

  function play(o) { const { canvas: cv, cursor: cur, app, onDone } = o, W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1), ov = cv.parentElement;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); const x = cv.getContext('2d'); if (cur) cur.style.opacity = 0;
    // ---------------- timeline (ms)
    const T = { ring0: 180, ring1: 900, tk0: 320, wk0: 520, hand0: 1000, s0: 1350, s1: 2650, shut0: 2720, shut1: 3060, seam0: 3150, split0: 3330, g0: 3480, g1: 5000, m0: 5000, m1: 6000, shine0: 6120, shine1: 6640, dive: 6720, end: 7780 };
    // ---------------- geometry: the dial, the week ring, and the logo zero it becomes (favicon: 38x54 pill, stroke 9, slash 8)
    const cx = W / 2, cy = H / 2, M = Math.min(W, H), R = M * .25, RO = R * 1.3, RL = M * .12;
    const hwL = RL * 19 / 27, lwL = RL * 9 / 27, slL = RL * 15.12 / 27, swL = RL * 8 / 27, slashA = Math.atan2(12.5, -8.5);
    const ihw = hwL - lwL / 2, ihh = RL - lwL / 2, Smax = Math.hypot(W, H) / ihw * 1.08;
    const NY = []; for (let i = 0; i < 168; i++) { const d = Math.floor(i / 24), h = i % 24; if (d < 5 && h >= 9 && h < 16) NY.push(i); }
    const nyRank = new Map(NY.map((i, r) => [i, r]));
    const NS = Math.max(10, Math.round(H / 54)), slH = H / NS;
    const slat = x.createLinearGradient(0, 0, 0, slH); slat.addColorStop(0, '#151916'); slat.addColorStop(.5, '#0e110f'); slat.addColorStop(1, '#090b0a');
    const grain = x.createPattern(grainTile(), 'repeat');
    const P = []; let burst = false;
    let skip = false, done = false, raf = 0, last = 0; const t0 = performance.now(); let tOff = 0;
    app.style.transformOrigin = '50% 50%'; app.style.transform = 'scale(.86)';

    function emit(px, py, vx, vy, n, life) { for (let i = 0; i < n; i++) P.push({ x: px, y: py, vx: vx + (Math.random() - .5) * 90, vy: vy + (Math.random() - .5) * 90, l: 0, m: life * (.6 + Math.random() * .6), s: Math.random() < .3 ? 2.4 : 1.4 }); }
    function pill(hw, hh, ox = cx, oy = cy) { x.beginPath(); x.roundRect(ox - hw, oy - hh, hw * 2, hh * 2, hw); }

    function frame(now) { let t = now - t0 + tOff; if (skip && t < T.dive) { tOff += T.dive - t; t = T.dive; P.length = 0; }
      const dt = Math.min(50, last ? now - last : 16); last = now;
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.globalAlpha = 1; x.shadowBlur = 0; x.clearRect(0, 0, W, H);
      const dk = seg(t, T.dive, T.end), mk = io(seg(t, T.m0, T.m1)), gs = io(seg(t, T.g0, T.g1)), sp = io(seg(t, T.s0, T.s1)), grey = seg(t, T.shut0, T.shut0 + 400);
      const S = dk > 0 ? Math.exp(Math.pow(dk, 1.7) * Math.log(Smax)) : 1;

      // ---- the dark, with the zero's hole cut out once we dive
      x.fillStyle = BG;
      if (dk > 0) { x.beginPath(); x.rect(0, 0, W, H); x.roundRect(cx - ihw * S, cy - ihh * S, ihw * S * 2, ihh * S * 2, ihw * S); x.fill('evenodd');
        const hole = 1 - oc(seg(dk, 0, .35)); if (hole > 0) { x.globalAlpha = hole; x.beginPath(); x.roundRect(cx - ihw * S, cy - ihh * S, ihw * S * 2, ihh * S * 2, ihw * S); x.fill(); x.globalAlpha = 1; } }
      else { x.fillRect(0, 0, W, H);
        // a green warmth that grows with the sweep and settles on the logo
        const glow = .16 * gs * (1 - .4 * mk) * (1 - seg(t, T.shine1 - 100, T.dive)); if (glow > 0) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, M * .8); g.addColorStop(0, `rgba(31,210,111,${glow})`); g.addColorStop(1, 'rgba(31,210,111,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
        const v = x.createRadialGradient(cx, cy, M * .35, cx, cy, Math.hypot(W, H) * .62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = v; x.fillRect(0, 0, W, H); }

      // ---- the instrument: crosshairs, a slow outer dashed ring, viewfinder corners
      const inst = (1 - mk) * seg(t, 150, 900);
      if (inst > 0 && dk === 0) { const e = oc(seg(t, 200, 1100)); x.globalAlpha = inst * .9; x.fillStyle = '#131715';
        x.fillRect(cx - W / 2 * e, cy - .5, W * e, 1); x.fillRect(cx - .5, cy - H / 2 * e, 1, H * e);
        x.strokeStyle = '#161b18'; x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, RO * 1.22, 0, TAU); x.stroke();
        x.save(); x.translate(cx, cy); x.rotate(t / 9000); x.setLineDash([2, 10]); x.strokeStyle = '#1f2522'; x.beginPath(); x.arc(0, 0, RO * 1.38, 0, TAU); x.stroke(); x.restore(); x.setLineDash([]); }
      const cor = seg(t, 100, 700) * (1 - seg(t, T.dive, T.dive + 250)); if (cor > 0) { const k = oc(seg(t, 100, 700)), m = lerp(46, 22, k), L = 18; x.globalAlpha = cor * .8; x.fillStyle = '#3a423e';
        for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const px = sx > 0 ? m : W - m, py = sy > 0 ? m : H - m; x.fillRect(px, py, L * sx, 1.5 * sy); x.fillRect(px, py, 1.5 * sx, L * sy); } }
      x.globalAlpha = 1;

      // ---- the dial, until it closes into the zero
      const thump = 1 - .022 * Math.sin(Math.PI * seg(t, T.s1, T.s1 + 240)), sc = lerp(lerp(.94, 1.03, seg(t, 0, T.m0)) * thump, 1, mk);
      const curH = lerp(9.5, 16, sp);
      if (t < T.m1 && dk === 0) { x.save(); x.translate(cx, cy); x.scale(sc, sc);
        const fade = 1 - mk;
        // base ring drawing itself from midnight
        const pr = oc(seg(t, T.ring0, T.ring1)); if (pr > 0 && t < T.m0) { x.strokeStyle = OFF; x.lineWidth = 1.2; x.beginPath(); x.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + pr * TAU); x.stroke(); }
        // 96 quarter-hour ticks inside the ring
        for (let j = 0; j < 96; j++) { const h = j / 4, a = ang(h), app = oc(seg(t, T.tk0 + j * 6, T.tk0 + j * 6 + 220)); if (app <= 0) continue;
          const len = j % 24 === 0 ? 15 : j % 4 === 0 ? 9 : 4, rr = lerp(R - 7, R, mk);
          let col = OFF; const inS = h >= 9.5 && h <= 16 && h <= curH + .01 && t >= T.s0; if (inS) col = mix(WH, GREY, grey);
          if (j % 24 === 0 && !inS) col = '#3b433f';
          const rel = ((h - 16 + 24) % 24) / 24 * 96, gk = clamp((gs * 96 - rel) / 3); if (t >= T.g0 && gk > 0) col = mix(col, G, gk);
          const rIn = lerp(rr - len, R, mk), rOut = rr; x.globalAlpha = app * fade; x.strokeStyle = col; x.lineWidth = j % 4 === 0 ? 1.6 : 1;
          x.beginPath(); x.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn); x.lineTo(Math.cos(a) * rOut, Math.sin(a) * rOut); x.stroke(); }
        // the week: 168 hour ticks around the outside; wall street's 35 light, then all of them go green
        for (let i = 0; i < 168; i++) { const a = -Math.PI / 2 + (i + .5) / 168 * TAU, app = oc(seg(t, T.wk0 + i * 3.2, T.wk0 + i * 3.2 + 240)); if (app <= 0) continue;
          const day = i % 24 === 0, len = day ? 14 : 7; let col = day ? '#353c38' : '#1c211e';
          const r = nyRank.get(i); if (r !== undefined && t >= T.s0 && sp * 35 > r) col = mix(WH, GREY, grey);
          const gk = clamp((gs * 168 - i) / 8); if (gk > 0) col = mix(col, G, gk);
          const k = clamp((mk - (i % 24) / 24 * .3) / .7), rr = lerp(RO, R, io(k)); x.globalAlpha = app * (1 - k); x.strokeStyle = col; x.lineWidth = day ? 1.6 : 2;
          x.beginPath(); x.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); x.lineTo(Math.cos(a) * (rr + len * (1 - k)), Math.sin(a) * (rr + len * (1 - k))); x.stroke(); }
        x.globalAlpha = fade;
        // wall street's day: a white arc, 9:30 to 4:00, greying when the shutter comes down
        if (t >= T.s0) { x.strokeStyle = mix(WH, GREY, grey); x.lineWidth = 3; x.lineCap = 'round'; if (!grey) { x.shadowColor = 'rgba(238,242,239,.5)'; x.shadowBlur = 10; }
          x.beginPath(); x.arc(0, 0, R, ang(9.5), ang(curH)); x.stroke(); x.shadowBlur = 0; }
        // the bell: a ring of sound from the hand at 4:00
        const bell = seg(t, T.s1, T.s1 + 750); if (bell > 0 && bell < 1) { x.globalAlpha = (1 - bell) * .55; x.strokeStyle = WH; x.lineWidth = 1.5; x.beginPath(); x.arc(0, 0, R * (1 + oc(bell) * 1.3), 0, TAU); x.stroke();
          x.beginPath(); x.arc(Math.cos(ang(16)) * R, Math.sin(ang(16)) * R, 4 + oc(bell) * 40, 0, TAU); x.stroke(); x.globalAlpha = fade; }
        // st0x's day: green, from 4:00 all the way round
        if (t >= T.g0 && t < T.m0) { x.strokeStyle = G; x.lineWidth = 3.5; x.lineCap = 'round'; x.shadowColor = 'rgba(31,210,111,.8)'; x.shadowBlur = 16; x.beginPath(); x.arc(0, 0, R, ang(16), ang(16) + gs * TAU); x.stroke(); x.shadowBlur = 0; }
        x.restore(); }

      // ---- the ring closing into the zero (morph), then the logo, then the dive through it
      if (t >= T.m0) { const s = S, hw = lerp(R * sc, hwL, mk) * s, hh = lerp(R * sc, RL, mk) * s, lw = lerp(3.5, lwL, mk) * s;
        x.globalAlpha = 1 - seg(dk, .12, .7); x.strokeStyle = G; x.lineWidth = lw; x.shadowColor = 'rgba(31,210,111,.7)'; x.shadowBlur = dk > 0 ? 0 : lerp(16, 34, mk) * (1 + .25 * Math.sin(t / 160) * seg(t, T.m1, T.m1 + 200));
        pill(hw, hh); x.stroke(); x.shadowBlur = 0; }

      // ---- the hand: grows from the hub, sweeps the session, stops at 4, goes on in green, becomes the slash
      const handIn = oc(seg(t, T.hand0, T.s0)), slashOut = 1 - seg(dk, 0, .22);
      if (handIn > 0 && slashOut > 0) { const s = S, a = t < T.s0 ? ang(9.5) : t < T.g0 ? ang(curH) : t < T.m0 ? ang(16) + gs * TAU : lerp(ang(16) + TAU, slashA + TAU, mk);
        const front = lerp(R * .86 * handIn * sc, slL, mk) * s, back = lerp(0, slL, mk) * s, w = lerp(2.4, swL, mk) * s * lerp(1, .6, seg(dk, 0, .22));
        const col = t < T.g0 ? mix(WH, GREY, grey * (1 - seg(t, T.seam0, T.split0))) : G;
        x.globalAlpha = slashOut; x.strokeStyle = col; x.lineCap = 'round'; x.lineWidth = w; if (t >= T.g0) { x.shadowColor = 'rgba(31,210,111,.8)'; x.shadowBlur = dk > 0 ? 0 : 18; }
        x.beginPath(); x.moveTo(cx - Math.cos(a) * back, cy - Math.sin(a) * back); x.lineTo(cx + Math.cos(a) * front, cy + Math.sin(a) * front); x.stroke(); x.shadowBlur = 0;
        // the hub, and the hot tip while the hand runs green
        if (mk < 1) { x.globalAlpha = (1 - mk) * slashOut; x.fillStyle = t >= T.g0 ? G : col; x.beginPath(); x.arc(cx, cy, 4 * sc, 0, TAU); x.fill();
          if (t >= T.g0 && t < T.m0) { const tx = cx + Math.cos(a) * R * sc, ty = cy + Math.sin(a) * R * sc; x.fillStyle = '#eafff2'; x.shadowColor = G; x.shadowBlur = 20; x.beginPath(); x.arc(tx, ty, 3.4, 0, TAU); x.fill(); x.shadowBlur = 0;
            if (!skip) { const sp2 = 260 + 900 * Math.sin(Math.PI * gs); emit(tx, ty, -Math.sin(a) * sp2 * .35, Math.cos(a) * sp2 * .35, Math.round(dt / 16 * 3), 700); } } } }
      // the opening dot before the dial exists
      if (t < T.ring0 + 300) { const k = 1 - seg(t, T.ring0, T.ring0 + 300); x.globalAlpha = k * (.6 + .4 * Math.sin(t / 60)); x.fillStyle = G; x.shadowColor = G; x.shadowBlur = 18; x.beginPath(); x.arc(cx, cy, 4, 0, TAU); x.fill(); x.shadowBlur = 0; }

      // ---- the logo locks: a shockwave, a burst, and a light passing across it
      if (t >= T.m1 && dk === 0) {
        if (!burst && !skip) { burst = true; for (let i = 0; i < 70; i++) { const a = Math.random() * TAU, v = 160 + Math.random() * 420; emit(cx + Math.cos(a) * hwL, cy + Math.sin(a) * RL, Math.cos(a) * v, Math.sin(a) * v, 1, 900); } }
        const sw = seg(t, T.m1, T.m1 + 650); if (sw < 1) { x.globalAlpha = (1 - sw) * .6; x.strokeStyle = G; x.lineWidth = 1.5; const k = 1 + oc(sw) * 1.6; pill(hwL * k + lwL, RL * k + lwL); x.stroke(); }
        const sh = io(seg(t, T.shine0, T.shine1)); if (sh > 0 && sh < 1) { const g = x.createLinearGradient(cx - RL * 1.4, cy + RL * 1.4, cx + RL * 1.4, cy - RL * 1.4), p = lerp(-.25, 1.25, sh);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(clamp(p - .16), 'rgba(255,255,255,0)'); g.addColorStop(clamp(p), 'rgba(255,255,255,.75)'); g.addColorStop(clamp(p + .16), 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          x.globalAlpha = 1; x.strokeStyle = g; x.lineWidth = lwL; pill(hwL, RL); x.stroke(); x.lineWidth = swL; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - Math.cos(slashA) * slL, cy - Math.sin(slashA) * slL); x.lineTo(cx + Math.cos(slashA) * slL, cy + Math.sin(slashA) * slL); x.stroke(); } }

      // ---- the shutter: rolls down at the bell, then a green seam splits it open
      if (t >= T.shut0 && t < T.split0 + 1100 && dk === 0) { const dn = ob(seg(t, T.shut0, T.shut1)), off = (1 - dn) * -H;
        for (let s = 0; s < NS; s++) { const y = s * slH + off; if (y + slH < 0) continue; const d = Math.abs(s - (NS - 1) / 2) / NS * 260, k = ic(seg(t, T.split0 + d, T.split0 + d + 560)); if (k >= 1) continue;
          const dx = k * cx * 1.2, a = 1 - seg(k, .7, 1); x.globalAlpha = a; x.save(); x.translate(0, y + k * k * 30);
          x.fillStyle = slat; x.fillRect(-dx, 0, cx, slH); x.fillRect(cx + dx, 0, W - cx, slH);
          x.fillStyle = '#202623'; x.fillRect(-dx, 0, cx, 1); x.fillRect(cx + dx, 0, W - cx, 1); x.fillStyle = '#030403'; x.fillRect(-dx, slH - 1, cx, 1); x.fillRect(cx + dx, slH - 1, W - cx, 1); x.restore(); }
        // the bottom bar of the shutter, heavier
        if (t < T.split0) { x.globalAlpha = 1; x.fillStyle = '#1a1f1c'; x.fillRect(0, H - 3 + off, W, 3); }
        const seam = oq(seg(t, T.seam0, T.seam0 + 200)) * (1 - seg(t, T.split0 + 200, T.split0 + 700)); if (seam > 0) { x.globalAlpha = seam; x.fillStyle = G; x.shadowColor = G; x.shadowBlur = 24; const hgt = H * seam; x.fillRect(cx - 1, cy - hgt / 2, 2, hgt); x.shadowBlur = 0; } }

      // ---- sparks
      x.globalAlpha = 1; x.fillStyle = G;
      for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.l += dt; if (p.l >= p.m) { P.splice(i, 1); continue; } const f = dt / 1000; p.x += p.vx * f; p.y += p.vy * f; p.vx *= .97; p.vy *= .97;
        if (dk === 0) { x.globalAlpha = (1 - p.l / p.m) * .9; x.fillRect(p.x, p.y, p.s, p.s); } }

      // ---- film grain over everything
      const gr = .055 * (1 - dk); if (gr > 0) { x.globalAlpha = gr; x.save(); x.translate(Math.random() * 180, Math.random() * 180); x.fillStyle = grain; x.fillRect(-180, -180, W + 360, H + 360); x.restore(); }
      x.globalAlpha = 1;

      // ---- the terminal behind the zero moves up to meet you
      if (dk > 0) app.style.transform = `scale(${lerp(.86, 1, oc(dk)).toFixed(4)})`;
      if (t >= T.end) { if (!done) { done = true; app.style.transform = ''; app.style.transformOrigin = ''; onDone && onDone(); } return; }
      raf = requestAnimationFrame(frame); }

    frame(performance.now()); if (ov) ov.style.background = 'transparent';
    return { skip() { skip = true; }, length: T.end, finish() { cancelAnimationFrame(raf); app.style.transform = ''; app.style.transformOrigin = ''; if (!done) { done = true; onDone && onDone(); } } };
  }
  window.Intro = { play };
})();
