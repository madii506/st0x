/* st0x intro: white, clean, no words (~7s).
   a quiet desk with a monitor. someone in a green hoodie walks in, steps behind the chair, turns and sits.
   the monitor wakes, they type a password, it goes green, a fist goes up,
   and the camera throws you through the monitor into the terminal. */
(() => {
  const INK = '#0d0f0e', INK2 = '#3b413e', G = '#12a150', G2 = '#0c7a3b', HOOD = '#0f9147', LINE = '#e1e5e3';
  const TAU = Math.PI * 2, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, oc = t => 1 - Math.pow(1 - t, 3), oq = t => 1 - Math.pow(1 - t, 5);
  const ob = t => { const c = 1.5, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
  // walking: accelerate, cruise, settle (trapezoid speed), so feet never skate at the ends
  const walkEase = s => { const a = .16, d = .22, v = 1 / (1 - a / 2 - d / 2); return s < a ? v * s * s / (2 * a) : s > 1 - d ? 1 - v * (1 - s) * (1 - s) / (2 * d) : v * (s - a / 2); };

  function play(o) { const { canvas: cv, cursor: cur, app, onDone } = o, W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); const x = cv.getContext('2d'); if (cur) cur.style.opacity = 0;
    // ---------------- the room
    const port = W < H, h = Math.min(H * .46, W * .75), FY = H * (port ? .72 : .82), cx = W / 2;
    const AREA = .187 * h * h, Sw = Math.sqrt(AREA * W / H), Sh = Math.sqrt(AREA * H / W);   // the screen has the page's own shape, so the terminal fits it exactly
    const deskY = FY - .4 * h, DW = Math.max(Sw * 1.9, 1.15 * h), scrB = deskY - .2 * h, S = { x: cx - Sw / 2, y: scrB - Sh, w: Sw, h: Sh }, Sc = { x: cx, y: scrB - Sh / 2 };
    const seatY = FY - .26 * h, chairX = cx - (port ? .2 : .26) * h, bez = .012 * h, chin = .03 * h;
    // ---------------- the walk
    const x0 = -.35 * h, dist = chairX - x0, nSteps = Math.max(2, Math.round(dist / (.45 * h))), AMP = Math.asin(Math.min(.8, dist / nSteps / (.92 * h)));
    const T = { walk0: 650 }; T.walk1 = T.walk0 + clamp(dist / (1.3 * h) * 1000, 900, 2000); T.turn = T.walk1; T.sit0 = T.turn + 240; T.sit1 = T.sit0 + 560;
    T.wake0 = T.sit1 - 120; T.wake1 = T.wake0 + 460; T.type0 = T.wake1 + 380; T.key = 135; T.enter = T.type0 + 6 * T.key + 140; T.ok = T.enter + 70;
    T.rev0 = T.ok + 520; T.rev1 = T.rev0 + 380; T.push0 = T.rev1 - 120; T.push1 = T.push0 + 1150; T.end = T.push1;
    const keyAt = i => T.type0 + i * T.key;
    // ---------------- camera: a slow drift in, then thrown through the screen
    const Zf = W / Sw, zp = 1.04;
    let skip = false, done = false, raf = 0; const t0 = performance.now(); let tOff = 0;
    app.style.transformOrigin = '0 0';

    const line = (pts, col, w) => { x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); };
    const disc = (px, py, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); };
    const rr = (px, py, w, hh, r, col) => { x.fillStyle = col; x.beginPath(); x.roundRect(px, py, w, hh, r); x.fill(); };
    const appear = (t, s) => oc(seg(t, s, s + 420));
    function lift(t, s, fn) { const a = appear(t, s); if (a <= 0) return; x.save(); x.globalAlpha *= a; x.translate(0, (1 - a) * .05 * h); fn(); x.restore(); }

    // ---------------- the person, side on (walking right)
    function side(px, env, p) {
      const leg = k => { const q = p + k * Math.PI, th = AMP * env * Math.sin(q), kb = .08 + .65 * env * Math.pow(Math.max(0, Math.cos(q)), 1.5), sa = th - kb;
        const kx = .235 * h * Math.sin(th), ky = .235 * h * Math.cos(th); return { kx, ky, ax: kx + .235 * h * Math.sin(sa), ay: ky + .235 * h * Math.cos(sa) }; };
      const L0 = leg(0), L1 = leg(1), hipY = FY - .03 * h - Math.max(L0.ay, L1.ay), hx = px;
      const lean = .07, shX = hx + .29 * h * Math.sin(lean), shY = hipY - .29 * h * Math.cos(lean);
      const arm = k => { const ua = (k ? 1 : -1) * .42 * env * Math.sin(p), ex = shX + .16 * h * Math.sin(ua), ey = shY + .03 * h + .16 * h * Math.cos(ua), fa = ua + .45;
        return [[shX, shY + .03 * h], [ex, ey], [ex + .15 * h * Math.sin(fa), ey + .15 * h * Math.cos(fa)]]; };
      const drawLeg = (Lg, col) => { const A = [hx + Lg.kx, hipY + Lg.ky], B = [hx + Lg.ax, hipY + Lg.ay]; line([[hx, hipY], A, B], col, .075 * h); line([[B[0] - .012 * h, B[1] + .012 * h], [B[0] + .065 * h, B[1] + .012 * h]], col, .055 * h); };
      const a1 = arm(1); line(a1, G2, .065 * h); disc(a1[2][0], a1[2][1], .032 * h, INK2);
      drawLeg(L1, INK2); drawLeg(L0, INK);
      line([[hx, hipY - .05 * h], [shX, shY + .05 * h]], G, .2 * h);
      disc(shX - .06 * h, shY - .05 * h, .07 * h, HOOD);
      disc(shX + .025 * h, shY - .155 * h, .09 * h, INK);
      const a0 = arm(0); line(a0, '#fff', .085 * h); line(a0, G, .065 * h); disc(a0[2][0], a0[2][1], .032 * h, INK);
    }
    // ---------------- the person, from behind (standing, sitting, typing, fist up)
    let pumpArm = null;
    function backView(px, hipY, sit, t, pump) {
      // legs: to the floor while standing; only the shins under the seat once sitting
      for (const s of [-1, 1]) { const top = [px + s * .055 * h * (1 + .35 * sit), lerp(hipY + .02 * h, seatY + .06 * h, sit)], foot = [px + s * .075 * h, FY - .025 * h];
        line([top, foot], INK, lerp(.075, .062, sit) * h); line([[foot[0] - .02 * h, foot[1] + .008 * h], [foot[0] + .02 * h, foot[1] + .008 * h]], INK, .06 * h); }
      // arms reach in front of the torso (towards the desk), so they go first: only the elbows show while typing
      for (const s of [-1, 1]) { const ki = Math.floor((t - T.type0) / T.key), typing = t > T.type0 && t < T.enter + 60, tap = typing && (ki % 2 === (s > 0 ? 0 : 1)) ? Math.sin(Math.PI * seg((t - T.type0) % T.key, 0, T.key * .8)) : 0;
        const jit = sit * .006 * h * Math.sin(t / 47 + s * 2) - tap * .018 * h;
        const sh = [px + s * .125 * h, hipY - .255 * h];
        let el = [lerp(px + s * .15 * h, px + s * .215 * h, sit), lerp(hipY - .1 * h, hipY - .12 * h + jit, sit)], wr = [lerp(px + s * .155 * h, px + s * .13 * h, sit), lerp(hipY + .03 * h, hipY - .17 * h + jit * 1.4, sit)];
        if (s > 0 && pump > 0) { el = [lerp(el[0], px + .23 * h, pump), lerp(el[1], hipY - .34 * h, pump)]; wr = [lerp(wr[0], px + .21 * h, pump), lerp(wr[1], hipY - .53 * h, pump)]; }
        if (s > 0 && pump > .2) pumpArm = [sh, el, wr]; else { line([sh, el, wr], s < 0 ? G2 : G, .065 * h); disc(wr[0], wr[1], .034 * h, INK); } }
      rr(px - .14 * h, hipY - .3 * h, .28 * h, .34 * h, .09 * h, G);
      x.fillStyle = HOOD; x.beginPath(); x.ellipse(px, hipY - .27 * h, .095 * h, .045 * h, 0, 0, TAU); x.fill();
      const nod = t > T.ok && t < T.ok + 500 ? Math.sin(Math.PI * seg(t, T.ok, T.ok + 500)) * .012 * h : 0;
      disc(px, hipY - .4 * h + nod, .09 * h, INK);
      if (pumpArm) { line(pumpArm, G, .065 * h); disc(pumpArm[2][0], pumpArm[2][1], .04 * h, INK); pumpArm = null; }
    }
    function chair(t) { const b = Math.sin(Math.PI * seg(t, T.sit0 + 220, T.sit0 + 520)) * .014 * h, cbx = chairX;
      x.fillStyle = '#eff2f0'; x.beginPath(); x.ellipse(cbx, FY + .004 * h, .25 * h, .02 * h, 0, 0, TAU); x.fill();
      rr(cbx - .016 * h, seatY + .02 * h, .032 * h, FY - .06 * h - seatY - .02 * h, .01 * h, '#3b413e');
      rr(cbx - .17 * h, FY - .062 * h, .34 * h, .022 * h, .011 * h, '#2c312e');
      for (const k of [-1, 0, 1]) disc(cbx + k * .16 * h, FY - .022 * h, .022 * h, INK);
      rr(cbx - .18 * h, seatY - .03 * h + b, .36 * h, .05 * h, .025 * h, '#2c312e');
      rr(cbx - .165 * h, seatY - .245 * h + b, .33 * h, .21 * h, .055 * h, '#1f2321');
      rr(cbx - .14 * h, seatY - .225 * h + b, .28 * h, .17 * h, .04 * h, '#2c312e'); }

    // ---------------- the monitor's screen: off, waking, login, then the real terminal behind it
    function screen(t) { const { x: X, y: Y, w, h: sh } = S, u = Math.min(w, sh), r = .01 * h, rev = seg(t, T.rev0, T.rev1);
      if (rev > 0) { x.save(); x.globalCompositeOperation = 'destination-out'; x.globalAlpha = 1; x.beginPath(); x.roundRect(X, Y, w, sh, r); x.fill(); x.restore(); }
      if (rev >= 1) return; x.save(); x.beginPath(); x.roundRect(X, Y, w, sh, r); x.clip(); x.globalAlpha *= 1 - rev;
      x.fillStyle = '#121514'; x.fillRect(X, Y, w, sh);
      const on = seg(t, T.wake0, T.wake1); if (on > 0) { const k1 = oq(clamp(on / .4)), k2 = io(clamp((on - .3) / .7)), lw = w * k1, lh = Math.max(1.5, sh * k2); x.fillStyle = '#fff'; x.fillRect(X + (w - lw) / 2, Y + (sh - lh) / 2, lw, lh); }
      if (t > T.wake1 - 140) { const ok = t >= T.ok, ccx = X + w / 2;
        // the zero, popping in
        const pop = ob(seg(t, T.wake1 - 140, T.wake1 + 240)), L = u * .13 * pop, ly = Y + sh * .38;
        if (L > 0) { x.strokeStyle = G; x.lineWidth = L * 9 / 27; x.beginPath(); x.roundRect(ccx - L * 19 / 27, ly - L, L * 38 / 27, L * 2, L * 19 / 27); x.stroke();
          x.lineWidth = L * 8 / 27; x.lineCap = 'round'; x.beginPath(); x.moveTo(ccx - L * 8.5 / 27, ly + L * 12.5 / 27); x.lineTo(ccx + L * 8.5 / 27, ly - L * 12.5 / 27); x.stroke(); }
        // the password field
        const fa = oc(seg(t, T.wake1, T.wake1 + 300)); if (fa > 0) { x.save(); x.globalAlpha *= fa; const fw = Math.min(w * .62, u * 1.05), fh = u * .12, fx = X + (w - fw) / 2, fy = Y + sh * .66 - fh / 2;
          x.fillStyle = ok ? '#eef9f2' : '#fff'; x.strokeStyle = ok ? G : '#d3d9d6'; x.lineWidth = Math.max(1, u * .008); x.beginPath(); x.roundRect(fx, fy, fw, fh, fh / 2); x.fill(); x.stroke();
          let n = 0; for (let i = 0; i < 6; i++) { const k = oc(seg(t, keyAt(i), keyAt(i) + 90)); if (k <= 0) break; n = i + 1; disc(fx + fh * .55 + i * fh * .5, fy + fh / 2, fh * .12 * k, ok ? G : INK); }
          if (!ok && Math.floor(t / 380) % 2 === 0) { x.fillStyle = G; x.fillRect(fx + fh * .55 + n * fh * .5 - fh * .18, fy + fh * .26, Math.max(1, fh * .06), fh * .48); }
          if (ok) { const c = ob(seg(t, T.ok, T.ok + 280)), ck = seg(t, T.ok + 80, T.ok + 320), qx = fx + fw - fh * .55, qy = fy + fh / 2; disc(qx, qy, fh * .32 * c, G);
            if (ck > 0) { const p1 = [qx - fh * .14, qy], p2 = [qx - fh * .04, qy + fh * .1], p3 = [qx + fh * .15, qy - fh * .11], k = ck * 2;
              line(k < 1 ? [p1, [lerp(p1[0], p2[0], k), lerp(p1[1], p2[1], k)]] : [p1, p2, [lerp(p2[0], p3[0], k - 1), lerp(p2[1], p3[1], k - 1)]], '#fff', Math.max(1.2, fh * .07)); } }
          x.restore(); }
        // loading the terminal
        const ld = io(seg(t, T.ok + 150, T.rev0 + 80)); if (ld > 0) { x.fillStyle = G; x.fillRect(X, Y + sh - Math.max(2, u * .014), w * ld, Math.max(2, u * .014)); } }
      x.restore(); }

    function frame(now) { let t = now - t0 + tOff; if (skip && t < T.push0) { tOff += T.push0 - t; t = T.push0; }
      const e = io(seg(t, T.push0, T.push1)), z = e > 0 ? zp * Math.exp(e * Math.log(Zf / zp)) : lerp(1, zp, oc(seg(t, 0, T.push0))), f = e > 0 ? (z - zp) / (Zf - zp) : 0;
      const P = { x: lerp(Sc.x, W / 2, f), y: lerp(Sc.y, H / 2, f) }, zc = e > 0 ? z * Math.pow(z / zp, .5) : z;
      const world = (zz, dy = 0) => x.setTransform(dpr * zz, 0, 0, dpr * zz, dpr * (P.x - Sc.x * zz), dpr * (P.y - Sc.y * zz + dy));
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      world(z);
      // floor, drawn out from the middle
      const fl = oc(seg(t, 0, 600)); x.fillStyle = LINE; x.fillRect(cx - W * fl, FY, W * 2 * fl, Math.max(1, 1.5 / z));
      // a wall clock that never stops
      lift(t, 280, () => { const kx = cx + DW * .36, ky = FY - 1.25 * h, r = .075 * h; x.fillStyle = '#fff'; x.strokeStyle = INK; x.lineWidth = .01 * h; x.beginPath(); x.arc(kx, ky, r, 0, TAU); x.fill(); x.stroke();
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line([[kx + Math.cos(a) * r * .72, ky + Math.sin(a) * r * .72], [kx + Math.cos(a) * r * .82, ky + Math.sin(a) * r * .82]], INK2, .007 * h); }
        const am = t / 1600 * TAU - Math.PI / 2, ah = t / 19200 * TAU + .9; line([[kx, ky], [kx + Math.cos(am) * r * .62, ky + Math.sin(am) * r * .62]], INK, .009 * h); line([[kx, ky], [kx + Math.cos(ah) * r * .42, ky + Math.sin(ah) * r * .42]], INK, .012 * h); disc(kx, ky, .012 * h, G); });
      // the desk
      lift(t, 80, () => { rr(cx - DW / 2 + .03 * h, deskY + .03 * h, .03 * h, FY - deskY - .03 * h, .006 * h, '#d3d9d6'); rr(cx + DW / 2 - .06 * h, deskY + .03 * h, .03 * h, FY - deskY - .03 * h, .006 * h, '#d3d9d6');
        rr(cx - DW / 2, deskY, DW, .035 * h, .008 * h, '#e4e8e6'); });
      // the monitor
      lift(t, 170, () => { rr(cx - .11 * h, deskY - .016 * h, .22 * h, .018 * h, .008 * h, '#2c312e'); rr(cx - .018 * h, scrB + chin, .036 * h, deskY - scrB - chin, .006 * h, '#3b413e');
        rr(S.x - bez, S.y - bez, Sw + bez * 2, Sh + bez + chin, .01 * h + bez, '#151816'); disc(cx, scrB + chin * .55, .005 * h, t > T.wake0 ? G : '#3b413e'); screen(t); });
      // a plant, a mug, a keyboard
      lift(t, 340, () => { const px = cx - DW / 2 + .13 * h; x.fillStyle = '#e2e6e4'; x.beginPath(); x.moveTo(px - .05 * h, deskY - .09 * h); x.lineTo(px + .05 * h, deskY - .09 * h); x.lineTo(px + .038 * h, deskY); x.lineTo(px - .038 * h, deskY); x.fill();
        const sw = Math.sin(t / 700) * .04; for (const [a, l, c] of [[-.55, .11, G], [.05, .14, '#16b85c'], [.6, .1, G2]]) { x.save(); x.translate(px, deskY - .09 * h); x.rotate(a + sw); x.fillStyle = c; x.beginPath(); x.ellipse(0, -l * h / 2, .028 * h, l * h / 2, 0, 0, TAU); x.fill(); x.restore(); }
        const mx = cx + DW / 2 - .17 * h; x.strokeStyle = INK; x.lineWidth = .008 * h; x.fillStyle = '#fff'; x.beginPath(); x.roundRect(mx, deskY - .085 * h, .07 * h, .085 * h, .012 * h); x.fill(); x.stroke();
        x.beginPath(); x.arc(mx + .07 * h, deskY - .045 * h, .02 * h, -Math.PI / 2, Math.PI / 2); x.stroke();
        x.strokeStyle = G; x.lineWidth = .006 * h; x.beginPath(); x.roundRect(mx + .026 * h, deskY - .06 * h, .018 * h, .03 * h, .009 * h); x.stroke();
        const ga = x.globalAlpha; for (const k of [0, 1]) { const ph = (t / 1400 + k * .5) % 1; x.globalAlpha = ga * Math.sin(Math.PI * ph) * .7; x.strokeStyle = '#c4ccc8'; x.lineWidth = .006 * h; x.beginPath();
          const sx = mx + .022 * h + k * .026 * h, sy = deskY - .1 * h - ph * .07 * h; x.moveTo(sx, sy); x.bezierCurveTo(sx + .015 * h, sy - .02 * h, sx - .015 * h, sy - .035 * h, sx, sy - .05 * h); x.stroke(); }
        x.globalAlpha = ga; rr(chairX - .17 * h, deskY - .016 * h, .34 * h, .016 * h, .005 * h, '#2c312e'); rr(chairX + .21 * h, deskY - .016 * h, .04 * h, .016 * h, .008 * h, '#2c312e'); });

      // ---- the person and the chair are nearer the camera, so they rush past faster when we dive
      world(zc, H * 1.3 * e); const fadeP = e < .75 ? 1 : 0;
      if (t > T.walk0 && fadeP > 0) {
        const wu = walkEase(seg(t, T.walk0, T.walk1)), steps = wu * nSteps, px = x0 + dist * wu, env = Math.min(1, steps * 1.4, (nSteps - steps) * 1.4), p = Math.PI * steps;
        x.fillStyle = '#eff2f0'; x.beginPath(); x.ellipse(px, FY + .004 * h, .13 * h, .016 * h, 0, 0, TAU); x.fill();
        const tk = seg(t, T.turn, T.turn + 220);
        if (tk < .5) { x.save(); x.translate(px, 0); x.scale(1 - tk * 2, 1); x.translate(-px, 0); side(px, env, p); x.restore(); }
        else { const sit = ob(seg(t, T.sit0, T.sit1)), hipY = lerp(FY - .465 * h, seatY, Math.min(sit, 1.05)), pump = t > T.ok + 100 ? ob(seg(t, T.ok + 100, T.ok + 360)) * (1 - io(seg(t, T.ok + 760, T.ok + 1000))) : 0;
          x.save(); x.translate(px, 0); x.scale((tk - .5) * 2, 1); x.translate(-px, 0); backView(px, hipY, clamp(sit), t, Math.max(0, pump)); x.restore(); } }
      if (fadeP > 0) lift(t, 230, () => chair(t));
      x.globalAlpha = 1;

      // ---- thrown in: speed lines around the screen while we fly
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sp = Math.sin(Math.PI * clamp((e - .1) / .8)); if (sp > 0) { const sw = Sw * z, sh = Sh * z; x.save(); x.beginPath(); x.rect(0, 0, W, H); x.roundRect(P.x - sw / 2, P.y - sh / 2, sw, sh, .01 * h * z); x.clip('evenodd');
        x.strokeStyle = '#cfd6d3'; x.lineCap = 'round'; const D = Math.hypot(W, H) / 2; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU + ((i * 73) % 7) * .03, r0 = D * (.42 + ((i * 37) % 10) / 40) * (1 - .25 * e), l = D * (.1 + ((i * 53) % 9) / 50);
          x.globalAlpha = sp * .7; x.lineWidth = 1 + (i % 3); x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); x.lineTo(W / 2 + Math.cos(a) * (r0 + l), H / 2 + Math.sin(a) * (r0 + l)); x.stroke(); } x.restore(); x.globalAlpha = 1; }

      // ---- the real terminal sits exactly in the monitor's screen and grows with it
      app.style.transform = `translate(${(P.x - Sw / 2 * z).toFixed(2)}px,${(P.y - Sh / 2 * z).toFixed(2)}px) scale(${(Sw * z / W).toFixed(5)})`;
      if (t >= T.end) { if (!done) { done = true; app.style.transform = ''; app.style.transformOrigin = ''; onDone && onDone(); } return; }
      raf = requestAnimationFrame(frame); }

    frame(performance.now());
    return { skip() { skip = true; }, length: T.end, finish() { cancelAnimationFrame(raf); app.style.transform = ''; app.style.transformOrigin = ''; if (!done) { done = true; onDone && onDone(); } } };
  }
  window.Intro = { play };
})();
