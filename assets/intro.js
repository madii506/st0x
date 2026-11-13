/* st0x intro, no words (~6.5s).
   a price line runs across a clean white screen. the bell drops a wall at 4pm and the old market greys out.
   the line doesn't stop: it goes through the wall in green and keeps climbing while the camera follows.
   the camera pulls back to the whole week, 168 hours; the 32.5 nyse hours light first, then every hour turns green.
   the week folds into one green cursor, and the terminal opens out of it. */
(() => {
  const G = '#12a150', INK = '#0d0f0e', GREY = '#c6ccc9';
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, oc = t => 1 - Math.pow(1 - t, 3), ic = t => t * t * t, oq = t => 1 - Math.pow(1 - t, 5);
  const seg = (t, a, b) => clamp((t - a) / (b - a));

  function play(o) { const { canvas: cv, cursor: cur, app, onDone } = o, W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; const x = cv.getContext('2d');
    // ---------------- timeline (ms)
    const T = { blink: 0, draw0: 520, bell: 2050, go: 2420, pan1: 3800, zoom0: 3650, zoom1: 4550, grid0: 3950, ny0: 4250, all0: 4650, all1: 5250, fold0: 5350, fold1: 6050, open0: 6050, open1: 6750 };
    // ---------------- the price path: a restless market, then a climb that never stops
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const midY = H * .55, xs = W * .1, xb = W * .5, xe = xb + W * 1.25, A = [];
    let y = 0, vy = 0; for (let i = 0; i <= 150; i++) { vy = vy * .86 + (rnd() - .5) * 1.1 - y * .025; y += vy; A.push([lerp(xs, xb, i / 150), midY + y * H * .0075]); }
    const B = []; let yb = A[A.length - 1][1] - midY, v2 = 0; for (let i = 1; i <= 260; i++) { const k = i / 260; v2 = v2 * .8 + (rnd() - .52) * 1.6; yb += v2 * H * .004 - H * .0019 * (1 + k); B.push([lerp(xb, xe, k), midY + yb]); }
    const yTop = Math.min(...B.map(p => p[1]));
    // ---------------- the week grid
    const cols = 24, rows = 7, gap = Math.max(3, W * .003), cs = Math.min((W * .8 - gap * (cols - 1)) / cols, (H * .5 - gap * (rows - 1)) / rows), gw = cols * cs + (cols - 1) * gap, gh = rows * cs + (rows - 1) * gap, gx = (W - gw) / 2, gy = (H - gh) / 2;
    const cells = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const cx = gx + c * (cs + gap), cy = gy + r * (cs + gap), d = Math.hypot(cx + cs / 2 - W / 2, cy + cs / 2 - H / 2);
      cells.push({ r, c, x: cx, y: cy, nyse: r < 5 && c >= 9 && c < 16, d, i: r * cols + c }); }
    const maxD = Math.max(...cells.map(c => c.d));
    let skip = false, done = false, raf = 0; const t0 = performance.now(); let tOff = 0;
    const moveCur = (px, py, sc = 1, op = 1) => { cur.style.transform = `translate(${px - 7}px,${py - 13}px) scale(${sc})`; cur.style.opacity = op; };
    function line(pts, upto, col, w, cam, alpha) { if (upto < 1) return; x.globalAlpha = alpha; x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath();
      const n = Math.floor(upto), f = upto - n; for (let i = 0; i <= Math.min(n, pts.length - 1); i++) { const p = pts[i]; i ? x.lineTo(p[0] - cam, p[1]) : x.moveTo(p[0] - cam, p[1]); }
      if (n < pts.length - 1 && f > 0) { const a = pts[n], b = pts[n + 1]; x.lineTo(lerp(a[0], b[0], f) - cam, lerp(a[1], b[1], f)); } x.stroke(); }
    const tipOf = (pts, upto) => { const n = Math.min(pts.length - 1, Math.floor(upto)), f = upto - n, a = pts[n], b = pts[Math.min(pts.length - 1, n + 1)]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; };
    function frame(now) { let t = now - t0 + tOff; if (skip && t < T.fold0) { tOff += T.fold0 - t; t = T.fold0; }
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      // camera: follow the green tip, then pull back to show the week
      const pa = io(seg(t, T.draw0, T.bell)), pb = oc(seg(t, T.go, T.pan1)), upA = pa * (A.length - 1), upB = pb * (B.length - 1);
      const tip = t < T.go ? tipOf(A, upA) : tipOf(B, upB), camX = Math.max(0, tip[0] - W * .66), z = io(seg(t, T.zoom0, T.zoom1)), sc = lerp(1, .32, z);
      const lineA = 1 - seg(t, T.zoom0 + 200, T.zoom1);
      if (lineA > 0) { x.save(); x.translate(W / 2, H * .5); x.scale(sc, sc); x.translate(-W / 2, -H * .5 + (yTop < H * .15 && t > T.go ? (H * .2 - yTop) * pb * .55 : 0));
        // three hairlines and a soft time axis
        x.globalAlpha = .6 * seg(t, 120, 600) * lineA; x.fillStyle = '#e6eae8'; for (const k of [.3, .55, .8]) x.fillRect(-W, H * k, W * 4, 1);
        // the market before the bell (greys once the bell rings)
        const grey = seg(t, T.bell + 60, T.bell + 380); line(A, upA, grey ? GREY : INK, 2.2, camX, lineA); if (grey && grey < 1) line(A, upA, INK, 2.2, camX, (1 - grey) * lineA);
        // the wall at 4pm
        if (t > T.bell) { const k = oq(seg(t, T.bell, T.bell + 260)); x.globalAlpha = lineA; x.fillStyle = INK; for (let yy = -H; yy < -H + H * 3 * k; yy += 12) x.fillRect(xb - camX - 1, yy, 2, 6);
          const r = seg(t, T.bell, T.bell + 700); if (r < 1) { x.globalAlpha = (1 - r) * .45 * lineA; x.strokeStyle = INK; x.lineWidth = 1.5; x.beginPath(); x.arc(xb - camX, A[A.length - 1][1], 8 + oc(r) * 120, 0, 6.283); x.stroke(); } }
        // the climb after the bell: green line with a soft area under it
        if (t > T.go && upB > 1) { const n = Math.floor(upB), last = tipOf(B, upB); x.globalAlpha = .1 * lineA; const grd = x.createLinearGradient(0, yTop, 0, H); grd.addColorStop(0, G); grd.addColorStop(1, 'rgba(18,161,80,0)'); x.fillStyle = grd;
          x.beginPath(); x.moveTo(B[0][0] - camX, H * 1.2); for (let i = 0; i <= n; i++) x.lineTo(B[i][0] - camX, B[i][1]); x.lineTo(last[0] - camX, last[1]); x.lineTo(last[0] - camX, H * 1.2); x.closePath(); x.fill();
          line([[xb, A[A.length - 1][1]], ...B], upB + 1, G, 2.6, camX, lineA);
          // a live price tag riding the right edge
          x.globalAlpha = lineA * seg(t, T.go, T.go + 300); x.fillStyle = G; x.fillRect(W - 34 + (camX ? 0 : 0), last[1] - 7, 26, 14); for (let px = last[0] - camX + 10; px < W - 40; px += 8) x.fillRect(px, last[1] - .5, 3, 1); }
        else if (t < T.go) { x.globalAlpha = lineA * seg(t, T.draw0, T.draw0 + 300); x.fillStyle = INK; x.fillRect(W - 34, tip[1] - 7, 26, 14); for (let px = tip[0] + 10; px < W - 40; px += 8) x.fillRect(px, tip[1] - .5, 3, 1); }
        x.restore(); }
      // the cursor: blink in place, ride the tip, then glide to the centre of the week
      if (t < T.draw0) { const on = Math.floor(t / 130) % 2 === 0; moveCur(xs, midY, 1, on ? 1 : .15); }
      else if (t < T.zoom0) { const sx = W / 2 + (tip[0] - camX - W / 2) * sc, sy = H * .5 + (tip[1] - H * .5) * sc; moveCur(sx + 10, sy, 1, 1); }
      // the week: every hour of it. nyse's 32.5 hours light first, then all 168 go green
      if (t > T.grid0) { const fold = seg(t, T.fold0, T.fold1);
        for (const c of cells) { const app = oc(seg(t, T.grid0 + c.c * 14 + c.r * 22, T.grid0 + 260 + c.c * 14 + c.r * 22)); if (app <= 0) continue;
          const ny = c.nyse ? oc(seg(t, T.ny0 + (c.c - 9) * 30 + c.r * 25, T.ny0 + 200 + (c.c - 9) * 30 + c.r * 25)) : 0, al = oc(seg(t, T.all0 + c.i * 2.6, T.all0 + 220 + c.i * 2.6));
          const f = ic(clamp((fold - (1 - c.d / maxD) * .25 - ((c.i * 37) % 11) / 110) / .65)), px = lerp(c.x, W / 2 - cs / 2, f), py = lerp(c.y, H / 2 - cs / 2, f), k = lerp(app, .25, f), w = cs * k;
          x.globalAlpha = 1 - f * .7; x.fillStyle = al > 0 ? (c.nyse ? '#0c7a3b' : G) : ny > 0 ? '#c3c9c6' : '#eef1ef';
          if (al > 0 && al < 1) { x.fillStyle = c.nyse ? '#c3c9c6' : '#eef1ef'; x.beginPath(); x.roundRect(px + (cs - w) / 2, py + (cs - w) / 2, w, w, 3); x.fill(); x.globalAlpha = (1 - f * .7) * al; x.fillStyle = c.nyse ? '#0c7a3b' : G; }
          x.beginPath(); x.roundRect(px + (cs - w) / 2, py + (cs - w) / 2, w, w, 3); x.fill(); }
        // a thin now-marker sweeping the week while it fills
        const sw = seg(t, T.all0, T.all1); if (sw > 0 && sw < 1 && fold === 0) { x.globalAlpha = .9; x.fillStyle = INK; x.fillRect(gx + gw * sw, gy - 10, 2, gh + 20); } }
      if (t >= T.zoom0 && t < T.open0) { const k = io(seg(t, T.zoom0, T.fold1)); const from = cur._last || [W / 2, H / 2]; moveCur(lerp(from[0], W / 2, k), lerp(from[1], H / 2, k), 1 + seg(t, T.fold1 - 250, T.fold1) * .6, 1); }
      else if (t < T.zoom0) { const m = cur.style.transform.match(/translate\(([-\d.]+)px,([-\d.]+)px/); if (m) cur._last = [+m[1] + 7, +m[2] + 13]; }
      // the terminal opens out of the cursor
      if (t >= T.open0) { const k = io(seg(t, T.open0, T.open1)); app.style.clipPath = `circle(${(k * Math.hypot(W, H)).toFixed(1)}px at ${W / 2}px ${H / 2}px)`; cv.style.opacity = 1 - k; moveCur(W / 2, H / 2, lerp(1.6, 0, oc(k)), 1 - k); }
      x.globalAlpha = 1;
      if (t >= T.open1) { if (!done) { done = true; app.style.clipPath = ''; onDone && onDone(); } return; }
      raf = requestAnimationFrame(frame); }
    app.style.clipPath = 'circle(0px at 50% 50%)';
    raf = requestAnimationFrame(frame);
    return { skip() { skip = true; }, length: T.open1, finish() { cancelAnimationFrame(raf); app.style.clipPath = ''; if (!done) { done = true; onDone && onDone(); } } };
  }
  window.Intro = { play };
})();
