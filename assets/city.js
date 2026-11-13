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
  function build(W, H, fs, fade, opt = {}) {   // opt: { s: scale, wrap: repeat the skyline sideways, roll: image px shift }
    const cw = fs * .6, ch = fs * 1.18, C = Math.ceil(W / cw), R = Math.ceil(H / ch), im = IMG;
    const s = opt.s || Math.max(W / im.w, (H * .62) / im.h), w = im.w * s, h = im.h * s, x0 = opt.wrap ? 0 : (W - w) / 2, ground = H * .955, y0 = ground - .885 * h, roll = Math.round(opt.roll || 0);
    const ID = new Int32Array(C * R), THIN = new Uint8Array(C * R), DEP = new Map(), BX = new Map(), BY = new Map();
    const N = 4;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const cnt = new Map(); let best = 0, bid = 0, xs = new Map();
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        let px = Math.floor(((c + (i + .5) / N) * cw - x0) / s); const py = Math.floor(((r + (j + .5) / N) * ch - y0) / s); if (opt.wrap) px = (((px + roll) % im.w) + im.w) % im.w;
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

  window.City = { load, bare, ready: () => !!IMG, build, drawAll, live };
})();
