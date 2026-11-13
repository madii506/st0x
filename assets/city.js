/* st0x city: an ASCII skyline drawn from a building-ID map (each tower one flat colour; blue = depth).
   Built on a character grid at any size, used by the intro (assembling, no text) and as the hero background. */
(() => {
  const RAMP = ' .:-=+*#%@', SCR = '.:-=+*#%@/\\|_[]<>01x';
  const G = '#12a150', INK = '#2f3532';
  let IMG = null;
  const hash = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  function load() { if (IMG) return Promise.resolve(IMG); return new Promise((ok, no) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); IMG = { w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data }; ok(IMG); }; im.onerror = no; im.src = '/assets/city.png'; }); }

  // W,H in css px; fs = font size; fade(x,y) in css px -> 0..1 keeps the headline clear
  function bare(W, H, fs) { const cw = fs * .6, ch = fs * 1.18; return { cells: [], sky: [], C: Math.ceil(W / cw), R: Math.ceil(H / ch), cw, ch, fs, W, H }; }
  function build(W, H, fs, fade) {
    const cw = fs * .6, ch = fs * 1.18, C = Math.ceil(W / cw), R = Math.ceil(H / ch), im = IMG;
    const s = Math.max(W / im.w, (H * .62) / im.h), w = im.w * s, h = im.h * s, x0 = (W - w) / 2, ground = H * .955, y0 = ground - .885 * h;
    const ID = new Int32Array(C * R), THIN = new Uint8Array(C * R), DEP = new Map(), BX = new Map(), BY = new Map();
    const N = 4;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const cnt = new Map(); let best = 0, bid = 0, xs = new Map();
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const px = Math.floor(((c + (i + .5) / N) * cw - x0) / s), py = Math.floor(((r + (j + .5) / N) * ch - y0) / s);
        if (px < 0 || py < 0 || px >= im.w || py >= im.h) continue; const k = (py * im.w + px) * 4; if (im.d[k + 3] < 200) continue;
        const id = im.d[k] + im.d[k + 1] * 256; const v = (cnt.get(id) || 0) + 1; cnt.set(id, v); DEP.set(id, im.d[k + 2]); if (!xs.has(id)) xs.set(id, new Set()); xs.get(id).add(i);
        if (v > best) { best = v; bid = id; } }
      const f = best / (N * N), at = r * C + c;
      if (f >= .42) ID[at] = bid; else if (f >= .06 && xs.get(bid).size <= 1) { ID[at] = bid; THIN[at] = 1; }
      if (ID[at]) { BX.set(bid, Math.min(BX.has(bid) ? BX.get(bid) : 1e9, c)); BY.set(bid, Math.min(BY.has(bid) ? BY.get(bid) : 1e9, r)); }
    }
    const at = (r, c) => (r < 0 || c < 0 || r >= R || c >= C) ? 0 : ID[r * C + c];
    const cells = [], top = new Int32Array(C).fill(R);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const b = ID[r * C + c]; if (!b) continue; top[c] = Math.min(top[c], r);
      const fd = fade ? fade((c + .5) * cw, (r + .5) * ch) : 1; if (fd <= .02) continue;
      if (THIN[r * C + c]) { cells.push({ r, c, k: '|', col: '#4a524e', a: .7 * fd, t: 'thin' }); continue; }
      let d = .66 - DEP.get(b) / 255 * .5 + (hash(b, 7, 3) - .5) * .26;
      const L = at(r, c - 1), Rr = at(r, c + 1), U = at(r - 1, c), edge = L !== b || Rr !== b || U !== b;
      const x = c - BX.get(b), y = r - BY.get(b), win = !edge && y % 2 === 1 && x % 2 === 1, lit = win && hash(b, Math.floor(x / 3), y) < .11;
      if (edge) d += .2; else if (win) d -= .32;
      d = Math.max(0, Math.min(1, d)) * fd;
      if (lit) { cells.push({ r, c, k: '#', col: G, a: .9 * fd, t: 'lit' }); continue; }
      const k = Math.round(d * (RAMP.length - 1)); if (k <= 0) continue;
      cells.push({ r, c, k: RAMP[k], col: INK, a: .35 + .55 * d, t: win ? 'win' : 'b' });
    }
    // sky: stars and a crescent moon, top right
    const sky = [], gr = Math.round(ground / ch);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const nStars = Math.round(C * R / 140);
    for (let i = 0; i < nStars; i++) { const r = 1 + Math.floor(rnd() * R * .55), c = Math.floor(rnd() * C); if (r >= top[c] - 1) continue; const fd = fade ? fade((c + .5) * cw, (r + .5) * ch) : 1; if (fd < .5) continue; sky.push({ r, c, k: '·.+*'[Math.floor(rnd() * 4)], col: '#9aa39f', a: .35 + rnd() * .35, t: 'star', ph: rnd() * 6.28 }); }
    const mr = Math.max(2.4, R * .055), mc = Math.round(C * .83), mrow = Math.round(R * .14);
    for (let r = Math.floor(mrow - mr - 1); r <= mrow + mr + 1; r++) for (let c = Math.floor(mc - mr * 2.2); c <= mc + mr * 2.2; c++) {
      const dy = (r - mrow) * ch, dx = (c - mc) * cw, RR = mr * ch, d1 = Math.hypot(dx, dy), d2 = Math.hypot(dx + RR * .45, dy + RR * .3);
      if (d1 < RR && d2 > RR * .82 && r >= 0 && c >= 0 && c < C) { const t = Math.min(1, (d2 - RR * .82) / (RR * .5)); sky.push({ r, c, k: '.:*#@'[Math.min(4, Math.floor(t * 5))], col: '#8d9792', a: .8, t: 'moon' }); } }
    for (let c = 0; c < C; c++) sky.push({ r: gr + 1, c, k: '─', col: '#c3c9c6', a: 1, t: 'ground' });
    return { cells, sky, C, R, cw, ch, fs, W, H, gr };
  }

  function glyph(x, g, cell, a) { x.globalAlpha = a; x.fillStyle = cell.col; if (cell.k === '─') { x.fillRect(cell.c * g.cw, (cell.r + .5) * g.ch - .5, g.cw + .5, 1); return; } x.fillText(cell.k, cell.c * g.cw, (cell.r + .8) * g.ch); }
  function setup(cv, g) { const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(g.W * dpr); cv.height = Math.round(g.H * dpr); const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.font = `600 ${g.fs}px JB, ui-monospace, monospace`; x.textBaseline = 'alphabetic'; return x; }
  function drawAll(cv, g) { const x = setup(cv, g); x.clearRect(0, 0, g.W, g.H); for (const s of g.sky) glyph(x, g, s, s.a); for (const c of g.cells) glyph(x, g, c, c.a); x.globalAlpha = 1; return x; }

  // windows that keep switching on and off: the street never sleeps
  function live(cv, g) { const x = setup(cv, g); drawAll(cv, g); const lits = g.cells.filter(c => c.t === 'lit' || c.t === 'win'); let stop = false;
    const tick = () => { if (stop) return; if (!document.hidden) for (let i = 0; i < 4; i++) { const c = lits[Math.floor(Math.random() * lits.length)]; if (!c) break; const on = c.t !== 'lit';
      c.t = on ? 'lit' : 'win'; c.k = on ? '#' : '.'; c.col = on ? G : INK; c.a = on ? .9 : .4; x.globalAlpha = 1; x.clearRect(c.c * g.cw, c.r * g.ch, g.cw, g.ch); glyph(x, g, c, c.a); }
      setTimeout(tick, 650); };
    setTimeout(tick, 1200); return () => { stop = true; }; }

  // the intro, no words, ~9s. a dot grid boots from the centre; a cursor runs out a market with volume and a live price line;
  // the bell rings (shake, dashed line, two rings), the old market greys out, data keeps streaming on the open side and the line
  // climbs in green; the candles fall into the street and the city builds itself; the city dims and the terminal's own panels
  // draw themselves as wireframes on top, ready to be swapped for the real thing.
  function intro(cv, g, done, cur, opt = {}) { const x = setup(cv, g), T0 = performance.now();
    const c0 = Math.round(g.C * .07), c1 = Math.round(g.C * .93), step = 3, N = Math.floor((c1 - c0) / step), iBell = Math.round(N * .56);
    const mid = g.R * .42, amp = g.R * .26, volBase = mid + amp + 3, volH = g.R * .07;
    let v = 0, seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; const P = [];
    for (let i = 0; i < N; i++) { const after = i > iBell, up = after ? rnd() < .8 : rnd() < .52, body = .3 + rnd() * (after ? 1.2 : 1);
      const o = v, cl = up ? v + body : v - body * (after ? .5 : .95), hi = Math.max(o, cl) + rnd() * .7, lo = Math.min(o, cl) - rnd() * .7; P.push({ o, cl, hi, lo, up, after, vol: .25 + rnd() * .75 * (after ? 1.2 : 1) }); v = cl; }
    const mn = Math.min(...P.map(p => p.lo)), mx = Math.max(...P.map(p => p.hi)), row = p => mid + amp - (p - mn) / (mx - mn) * amp * 2;
    const GRID = 700, DRAW0 = 850, DRAW = 2300, PAUSE = 480, tOf = i => DRAW0 + i * (DRAW / N) + (i > iBell ? PAUSE : 0), tBell = tOf(iBell) + 30, FALL = tOf(N - 1) + 420;
    P.forEach((p, i) => { p.t = tOf(i); p.fall = FALL + (i / N) * 520 + rnd() * 120; });
    // data streams that keep flowing on the open side after the bell
    const streams = Array.from({ length: 9 }, (_, k) => ({ r: Math.round(g.R * (.12 + k * .085)), sp: .05 + rnd() * .09, off: rnd() * 400, s: Array.from({ length: 70 }, () => SCR[(rnd() * SCR.length) | 0]).join('') }));
    // the city arrives whenever its map has loaded
    let CITY0 = Infinity, WF0 = Infinity, END = Infinity; const city = { cells: [], sky: [] };
    function setCity(gc) { city.cells = gc.cells; city.sky = gc.sky; const now = performance.now() - T0; CITY0 = Math.max(FALL + 140, now + 60); WF0 = CITY0 + 2350; END = WF0 + 1650;
      for (const c of city.cells) { c.at = CITY0 + (1 - c.r / gc.R) * 1000 + hash(c.r, c.c, 5) * 320 + Math.abs(c.c / gc.C - .5) * 220; if (c.t === 'lit') c.at += 700 + hash(c.c, c.r, 9) * 700; }
      for (const s of city.sky) s.at = s.t === 'ground' ? CITY0 - 150 + Math.abs(s.c / gc.C - .5) * 520 : CITY0 + 1000 + hash(s.r, s.c, 2) * 700; }
    if (g.cells && g.cells.length) setCity(g);
    const off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height; const ox = off.getContext('2d'), dpr = cv.width / g.W; ox.setTransform(dpr, 0, 0, dpr, 0, 0); ox.font = x.font; ox.textBaseline = 'alphabetic';
    let raf = 0, skip = false, finished = false, panels = null;
    const cx0 = g.W / 2, cy0 = g.H / 2, moveCur = (px, py) => { if (!cur) return; cur.style.left = px + 'px'; cur.style.top = py + 'px'; };
    const colOf = (p, dim) => p.after ? (p.up ? G : '#dc2a2a') : (p.up ? (dim ? '#c9cfcc' : '#1d2220') : (dim ? '#e0e4e2' : '#9aa29e'));
    const bw = g.cw * 2.1, cxOf = i => (c0 + i * step) * g.cw;
    const candle = (i, p, alpha, dy, dim) => { const cx = cxOf(i), rt = row(p.hi), rb = row(p.lo), bt = row(Math.max(p.o, p.cl)), bb = row(Math.min(p.o, p.cl));
      x.globalAlpha = alpha; x.fillStyle = colOf(p, dim); x.fillRect(cx + bw / 2 - 1, rt * g.ch + dy, 2, Math.max(1, (rb - rt) * g.ch)); x.fillRect(cx, bt * g.ch + dy, bw, Math.max(g.ch * .4, (bb - bt) * g.ch));
      x.globalAlpha = alpha * .3; const vh = p.vol * volH * g.ch; x.fillRect(cx, volBase * g.ch + volH * g.ch - vh + dy, bw, vh); };
    const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const frame = now => { let t = now - T0; if (skip) t = Math.max(t, isFinite(END) ? END : FALL + 200);
      const tf = x.getTransform(); x.setTransform(tf.a, 0, 0, tf.d, 0, 0); x.clearRect(0, 0, g.W, g.H);
      const sh = t > tBell && t < tBell + 200 ? (1 - (t - tBell) / 200) * 4 : 0; if (sh) x.translate((Math.random() - .5) * sh, (Math.random() - .5) * sh);
      // the dot grid boots out from the centre, then fades as the city takes over
      const gridA = t < FALL ? 1 : Math.max(0, 1 - (t - FALL) / 500), gr = Math.min(1, t / GRID) * Math.hypot(g.W, g.H) * .6;
      if (gridA > 0) { x.fillStyle = '#d9dfdc'; for (let r = 2; r < g.R; r += 2) for (let c = 2; c < g.C; c += 4) { const px = c * g.cw, py = r * g.ch, d = Math.hypot(px - cx0, py - cy0); if (d > gr) continue; x.globalAlpha = gridA * Math.min(1, (gr - d) / 120); x.fillRect(px, py, 2, 2); } }
      // a scan line sweeps once across while the grid boots
      if (t < GRID + 250) { const k = t / (GRID + 250), y = k * g.H; x.globalAlpha = .5 * (1 - k); x.fillStyle = G; x.fillRect(0, y, g.W, 1.5); }
      if (t < DRAW0) { const k = Math.min(1, Math.max(0, (t - 520) / 300)), e = ease(k), sx = cxOf(0), sy = row(0) * g.ch; moveCur(cx0 + (sx - cx0) * e, cy0 + (sy - cy0) * e); }
      // time ticks along the bottom of the chart
      let head = null; for (let i = 0; i < N; i++) if (t >= P[i].t) head = i;
      if (head != null && t < FALL + 300) { const a = t > FALL ? 1 - (t - FALL) / 300 : 1; x.globalAlpha = .5 * a; x.fillStyle = '#9aa29e'; for (let i = 0; i <= head; i += 6) x.fillRect(cxOf(i) + bw / 2, (volBase + volH + 1.2) * g.ch, 1, g.ch * .5); x.fillRect(cxOf(0), (volBase + volH + 1.2) * g.ch, cxOf(head) - cxOf(0) + bw, 1); }
      // the bell
      const bx = cxOf(iBell) + bw + g.cw * .5;
      if (t > tBell && t < FALL + 450) { const k = Math.min(1, (t - tBell) / 220), fade = t > FALL ? 1 - (t - FALL) / 450 : 1;
        x.globalAlpha = fade; x.fillStyle = '#0d0f0e'; for (let y = 0; y < g.H * k; y += 12) x.fillRect(bx - 1, y, 2, 6);
        for (const dl of [0, 160]) { const tt = t - tBell - dl; if (tt < 0 || tt > 640) continue; const r = tt / 640; x.globalAlpha = (1 - r) * .5; x.strokeStyle = dl ? G : '#0d0f0e'; x.lineWidth = 2; x.beginPath(); x.arc(bx, row(P[iBell].cl) * g.ch, 12 + r * 170, 0, 6.283); x.stroke(); } }
      if (t > tBell && t < FALL + 450) { const a = Math.min(1, (t - tBell) / 420) * (t > FALL ? Math.max(0, 1 - (t - FALL) / 450) : 1); x.globalAlpha = .07 * a; x.fillStyle = G; x.fillRect(bx, 0, g.W - bx, g.H);
        // streams of characters keep flowing on the open side
        x.fillStyle = G; for (const s of streams) { const len = s.s.length * g.cw, sx = bx + ((g.W - bx + len) - ((t - tBell) * s.sp + s.off) % (g.W - bx + len)) - len * .2;
          x.save(); x.beginPath(); x.rect(bx + 2, 0, g.W - bx, g.H); x.clip(); x.globalAlpha = .22 * a; x.fillText(s.s, sx, (s.r + .8) * g.ch); x.restore(); } }
      // price line and the live price marker
      if (head != null && t < FALL + 200) { const a = t > FALL ? 1 - (t - FALL) / 200 : 1; x.lineWidth = 1.5; x.lineJoin = 'round';
        x.globalAlpha = .35 * a; x.strokeStyle = '#7d8682'; x.beginPath(); for (let i = 0; i <= Math.min(head, iBell); i++) { const px = cxOf(i) + bw / 2, py = row(P[i].cl) * g.ch; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
        if (head > iBell) { x.globalAlpha = .6 * a; x.strokeStyle = G; x.beginPath(); for (let i = iBell; i <= head; i++) { const px = cxOf(i) + bw / 2, py = row(P[i].cl) * g.ch; i === iBell ? x.moveTo(px, py) : x.lineTo(px, py); } x.stroke(); }
        const hy = row(P[head].cl) * g.ch, hx = cxOf(head) + bw + 4; x.globalAlpha = .5 * a; x.fillStyle = head > iBell ? G : '#0d0f0e'; for (let px = hx + 10; px < g.W - 40; px += 9) x.fillRect(px, hy, 4, 1); x.globalAlpha = a; x.fillRect(g.W - 38, hy - 7, 30, 14); }
      // candles, then they fall into the street
      for (let i = 0; i <= (head ?? -1); i++) { const p = P[i], dim = !p.after && t > tBell + 160;
        if (t < p.fall) candle(i, p, Math.min(1, (t - p.t) / 110), 0, dim);
        else { const f = (t - p.fall) / 1000, dy = 1500 * f * f, a = 1 - f / .6; if (a <= 0) continue;
          if (a < .75 && hash(i, Math.floor(t / 60), 3) < .5) { x.globalAlpha = a; x.fillStyle = colOf(p, dim); x.fillText(SCR[(hash(i, Math.floor(t / 50), 1) * SCR.length) | 0], cxOf(i), row(p.cl) * g.ch + dy); }
          else candle(i, p, a, dy, dim); } }
      if (head != null && t >= DRAW0 && t < FALL) moveCur(cxOf(head) + bw + g.cw, row(P[head].cl) * g.ch);
      if (t >= FALL && t < WF0) { const k = Math.min(1, (t - FALL) / 700), e = 1 - Math.pow(1 - k, 3), fx = cxOf(N - 1) + bw + g.cw, fy = row(P[N - 1].cl) * g.ch; moveCur(fx + (cx0 - fx) * e, fy + (cy0 - fy) * e); }
      // the city, dimming once the terminal starts drawing over it
      const cityA = t < WF0 ? 1 : Math.max(.22, 1 - (t - WF0) / 700 * .78);
      if (isFinite(CITY0) && t >= CITY0 - 200) { x.globalAlpha = cityA; x.drawImage(off, 0, 0, g.W, g.H); }
      for (const s of city.sky) { if (s.done || t < s.at) continue; const k = (t - s.at) / 450; if (k >= 1) { glyph(ox, g, s, s.a); s.done = 1; } else glyph(x, g, s, s.a * k * cityA); }
      for (const c of city.cells) { if (c.done || t < c.at) continue; const p = (t - c.at) / 180;
        if (p < 1) { x.globalAlpha = .55 * cityA; x.fillStyle = c.t === 'lit' ? G : '#7d8682'; x.fillText(SCR[(Math.random() * SCR.length) | 0], c.c * g.cw, (c.r + .8) * g.ch); }
        else if (c.t !== 'lit' || p >= 3) { glyph(ox, g, c, c.a); c.done = 1; } else glyph(x, g, c, Math.min(1, c.a + .1) * cityA); }
      // the terminal draws itself: every panel as a wireframe, edges racing round, then filled
      if (t >= WF0) { if (!panels) panels = (opt.panels && opt.panels()) || [];
        panels.forEach((r, k) => { const t0 = WF0 + k * 75, p = Math.min(1, Math.max(0, (t - t0) / 650)); if (p <= 0) return; const e = ease(p), per = 2 * (r.w + r.h), L = per * e;
          const fillA = Math.min(1, Math.max(0, (t - t0 - 500) / 450)); if (fillA > 0) { x.globalAlpha = .92 * fillA; x.fillStyle = '#fff'; x.fillRect(r.x, r.y, r.w, r.h); }
          x.globalAlpha = 1; x.strokeStyle = k === 0 ? G : '#0d0f0e'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(r.x, r.y);
          const segs = [[r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h], [r.x, r.y]]; let left = L, px = r.x, py = r.y;
          for (const [qx, qy] of segs) { const d = Math.hypot(qx - px, qy - py); if (left <= 0) break; const f = Math.min(1, left / d); x.lineTo(px + (qx - px) * f, py + (qy - py) * f); left -= d; px = qx; py = qy; } x.stroke();
          x.fillStyle = G; for (const [qx, qy] of [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]]) { x.globalAlpha = e; x.fillRect(qx - 3, qy - 3, 6, 6); }
          // a few skeleton rows inside, like content arriving
          if (fillA > 0 && r.h > 60) { x.globalAlpha = .5 * fillA; x.fillStyle = '#e3e7e5'; for (let yy = r.y + 16; yy < r.y + r.h - 12 && yy < r.y + 16 + 9 * 18; yy += 18) x.fillRect(r.x + 14, yy, Math.max(20, (r.w - 28) * (.35 + hash(k, yy, 4) * .6)), 6); } }); }
      x.globalAlpha = 1;
      if (t >= END && !finished) { finished = true; done && done(); return; } raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    return { skip() { skip = true; }, end: () => (isFinite(END) ? END : FALL + 4500), setCity, fall: FALL };
  }

  window.City = { load, bare, ready: () => !!IMG, build, drawAll, live, intro };
})();
