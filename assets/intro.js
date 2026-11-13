/* st0x intro: one white ASCII world, nothing but characters (~11s).
   act 1, the street: an ASCII skyline decodes from the ground up. at the bell every green window goes dark, wall street closes.
   then st0x lights every window back up, green, from one window outward, and the camera flies into that window.
   act 2, the desk: the cursor draws the floor and climbs while the st0x logo (the ASCII laptop) decodes itself row by row.
   the screen boots, a login box opens, someone in a green hoodie walks in, sits down cross-legged and types.
   the box goes green, a fist goes up, the screen sweeps into the logo's chart, the real terminal shows through,
   and the camera dives into it. */
(() => {
  const LAP = {"C":74,"R":25,"ground":23,"rows":["         -************++++++++++++++**++++++++++++++++++++++++++.         ","         =##                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#%                                                  ##.         ","         =#                                                   %#.         ","         =#                                                   %#.         ","         =#                                                   %#.         ","         =#                                                   %#:         ","         =######################################################:         ","         -+++%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#+++.         ","        :---#%%%%%%%%%%%%%%%%%%%%%%%##%##%%%%%%%%%%%%%%%%%%%%*---.        ","   ...:-=--*%%%%%%%%##%##%###################################%+--=::..    ","..::::-==================-------::::::::::-------==================-::::..","...::-===================-------:::::::::--------===================-::...","    :===========================++++++++++===========================     ","     .....::::::::::::::::----------------------:::::::::::::::.....      "],"cols":["000000000kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkksssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkssssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkssssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkssssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkssssssssssssssssssssssssssssssssssssssssssssssssssskkk000000000","000000000kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk000000000","000000000kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk000000000","00000000kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk00000000","000kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk0000","kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk","kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk","0000kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk00000","00000kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk000000"],"alph":["00000000067777777777777777777777777777777777777777777777777777775000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068800000000000000000000000000000000000000000000000000885000000000","00000000068000000000000000000000000000000000000000000000000000885000000000","00000000068000000000000000000000000000000000000000000000000000885000000000","00000000068000000000000000000000000000000000000000000000000000885000000000","00000000078000000000000000000000000000000000000000000000000000885000000000","00000000078888888888888888888888888888888888888888888888888888885000000000","00000000067778999999989988988888888888888888888888988988888887775000000000","00000000666689999999889889888888888888888888888888888898898897666500000000","00055556666788888888888888888888888888888888888888888888888888766665550000","55556667777777777777777776666666666666666666666667777777777777777776665555","55555677777777777777777766666666666555566666666667777777777777777777655555","00005766666666666666666666666667777777777766666666666666666666666666700000","00000555555555555566666666666666666666666666666666666666555555555555000000"],"scr":[1,16,11,61]};
  const INK = '#0d0f0e', INK2 = '#59615d', DIM = '#a3aaa6', G = '#12a150', G2 = '#0c7a3b', RED = '#dc2a2a', GROUND = '#b9c0bc', STREAK = '#cdd3d0';
  const TAU = Math.PI * 2, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, oc = t => 1 - Math.pow(1 - t, 3), ic = t => t * t * t;
  const ob = t => { const c = 1.5, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
  const walkEase = s => { const a = .16, d = .22, v = 1 / (1 - a / 2 - d / 2); return s < a ? v * s * s / (2 * a) : s > 1 - d ? 1 - v * (1 - s) * (1 - s) / (2 * d) : v * (s - a / 2); };
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const RAMP = ' .:-=+*#%@', NOISE = '01<>/\\|=+*#%$x';
  const nz = (a, b, t) => NOISE[Math.floor(hash(a, b + Math.floor(t / 42) * 7) * NOISE.length)];
  const GROW = LAP.ground + 1;   // the floor's row, relative to the laptop's top-left cell

  // ---------------- the logo's screen (as on the pfp): header, then the candles, all plain characters
  const SR = LAP.scr[1] - LAP.scr[0] + 1, SC = LAP.scr[3] - LAP.scr[2] + 1;
  const CANDLES = (() => { const out = [], top = 3, bot = SR - 4, x0 = 2, x1 = SC - 3, step = 2, Hh = bot - top + 1, N = Math.floor((x1 - x0) / step) + 1; let v = .1; const rows = p => top + Math.round((1 - p) * (Hh - 1));
    for (let i = 0; i < N; i++) { const up = i % 6 !== 4 && i % 7 !== 5, body = .025 + ((i * 37) % 34) / 1000 * 1.6, o = v, cl = up ? v + body * (10.8 / N + .6) : v - body * .5;
      const hi = Math.max(o, cl) + .02 + ((i * 13) % 18) / 600, lo = Math.min(o, cl) - .02 - ((i * 7) % 14) / 600, c = x0 + i * step, col = up ? G : RED;
      for (let r = rows(hi); r <= rows(lo); r++) out.push([r, c, '|', col]); const rb0 = rows(Math.max(o, cl)), rb1 = Math.max(rb0, rows(Math.min(o, cl))); for (let r = rb0; r <= rb1; r++) out.push([r, c, '#', col]); v = Math.min(.92, cl); }
    const seen = new Map(); out.forEach(o => seen.set(o[0] * 1000 + o[1], o)); return [...seen.values()]; })();
  const UNDER = new Set(); for (const r of [LAP.ground, GROW]) for (let c = 0; c < LAP.C; c++) if (LAP.rows[r] && LAP.rows[r][c] !== ' ') for (let d = -2; d <= 2; d++) UNDER.add(c + d);

  function play(o) { const { canvas: cv, cursor: cur, app, onDone } = o, W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); const x = cv.getContext('2d'); if (cur) cur.style.opacity = 0;
    const port = W < H;
    let curFont = '', curF = 0;
    const glyph = (gx, gy, k, col, a, w, F) => { x.globalAlpha = a; x.fillStyle = col; const f = w * 1000 + F; if (f !== curF) { x.font = `${w} ${F}px JB, ui-monospace, Menlo, monospace`; curF = f; } x.fillText(k, gx, gy + F * 1.18 * .78); };

    // ================= act 1: the street =================
    const A1 = { len: 3500, rise: 1150, close0: 1500, close1: 2050, light0: 2150, light1: 2650, zoom0: 2600, zoom1: 3500 };
    let city = null, tgt = null, cityTried = false;
    try { if (window.City && !City.ready()) City.load().catch(() => { }); } catch { }
    function buildCity() { cityTried = true; try { if (!window.City || !City.ready()) return false; const fs = port ? clamp(W / 62, 7, 10) : clamp(W / 128, 9, 13);
        const sc = (port ? .5 : .6) * H / 403, roll = 1500 - (W / 2) / sc; city = City.build(W, H, fs, null, { s: sc, wrap: true, roll }); city.oy = 0; city.wins = city.cells.filter(c => c.t === 'lit' || c.t === 'win');
        let best = 1e9; for (const c of city.cells) if (c.t === 'lit') { const d = Math.hypot((c.c + .5) * city.cw - W * .5, ((c.r + .5) * city.ch + city.oy - H * .45) * 1.3); if (d < best) { best = d; tgt = c; } }
        if (!tgt) tgt = city.wins[0] || city.cells[0]; city.tx = (tgt.c + .5) * city.cw; city.ty = (tgt.r + .5) * city.ch + city.oy;
        city.maxD = Math.max(...city.wins.map(c => Math.hypot(c.c - tgt.c, (c.r - tgt.r) * 2))) || 1; return true; } catch (e) { console.warn("intro city", e); city = null; return false; } }
    function drawCity(u) { const g = city, F = g.fs, zt = seg(u, A1.zoom0, A1.zoom1), z = Math.exp(ic(zt) * Math.log(110)), f = (z - 1) / 109;
      const Px = lerp(g.tx, W / 2, f), Py = lerp(g.ty, H / 2, f), fade = 1 - seg(u, A1.zoom1 - 380, A1.zoom1 - 40);
      x.setTransform(dpr * z, 0, 0, dpr * z, dpr * (Px - g.tx * z), dpr * (Py - g.ty * z)); x.textBaseline = 'alphabetic'; curF = 0;
      const Y = r => r * g.ch + g.oy, vis = (c, r) => { const sx = (c * g.cw - g.tx) * z + Px, sy = (Y(r) - g.ty) * z + Py; return sx > -g.cw * z && sx < W && sy > -g.ch * z && sy < H; };
      // the ground and the sky
      for (const s of g.sky) { if (!vis(s.c, s.r)) continue; const k = s.k === '─' ? '_' : s.k, at = s.t === 'ground' ? 60 + Math.abs(s.c - g.C / 2) / g.C * 500 : 700 + hash(s.r, s.c) * 600; if (u < at) continue;
        const tw = s.t === 'star' ? .55 + .45 * Math.sin(u / 260 + (s.ph || 0)) : 1; glyph(s.c * g.cw, Y(s.r), k, s.t === 'ground' ? GROUND : s.col, s.a * tw * fade, 500, F); }
      // the buildings: decode from the ground up; windows close at the bell, then st0x lights them all, green
      for (const c of g.cells) { if (!vis(c.c, c.r)) continue; const tr = 80 + (1 - c.r / g.R) * A1.rise + hash(c.r, c.c) * 160; if (u < tr) continue;
        if (u < tr + 120) { glyph(c.c * g.cw, Y(c.r), nz(c.r, c.c, u), G, .45 * fade, 500, F); continue; }
        let k = c.k, col = c.col, a = c.a, w = 600;
        if (c.t === 'lit' || c.t === 'win') { const off = c.t === 'lit' && u > A1.close0 + (c.c / g.C) * (A1.close1 - A1.close0), on = u > A1.light0 + Math.hypot(c.c - tgt.c, (c.r - tgt.r) * 2) / g.maxD * (A1.light1 - A1.light0);
          if (on) { k = '#'; col = G; a = .9; w = 700; } else if (off) { k = '.'; col = INK; a = .3; } else if (c.t === 'lit' && Math.floor(u / 520 + hash(c.r, c.c) * 9) % 7 === 0) { k = '.'; col = INK; a = .35; } }
        glyph(c.c * g.cw, Y(c.r), k, col, a * fade, w, F); } }

    // ================= act 2: the desk =================
    const F = Math.min(W * (port ? .94 : .52) / (LAP.C * .6), H * (port ? .42 : .55) / (LAP.R * 1.18)), cw = F * .6, chh = F * 1.18;
    const groundY = H * (port ? .64 : .74), lx = Math.round(W / 2 - LAP.C * cw / 2), ly = groundY - (GROW + .5) * chh;
    const cX = c => lx + c * cw, rY = r => ly + r * chh;
    const S = { x: cX(LAP.scr[2]), y: rY(LAP.scr[0]), w: SC * cw, h: SR * chh }, Sc = { x: S.x + S.w / 2, y: S.y + S.h / 2 };
    const cMin = Math.floor(-lx / cw) - 2, cMax = Math.ceil((W - lx) / cw) + 2, midC = LAP.scr[2] + Math.floor(SC / 2), midR = LAP.scr[0] + Math.floor(SR / 2) - 1;
    const h = 21 * chh, footY = rY(GROW + .5), seatX = cX(50);
    const T = { cur1: 380, gnd0: 300, gnd1: 760, lap0: 620, row: 40 }; T.boot0 = T.lap0 + LAP.R * T.row + 140; T.box0 = T.boot0 + 380; T.box1 = T.box0 + 300;
    const x0 = W + .3 * h, dist = x0 - seatX, nSteps = Math.max(2, Math.round(dist / (.45 * h))), AMP = Math.asin(Math.min(.8, dist / nSteps / (.92 * h)));
    T.walk0 = T.boot0 - 100; T.walk1 = T.walk0 + clamp(dist / (1.35 * h) * 1000, 850, 1600); T.turn = T.walk1; T.sit0 = T.turn + 220; T.sit1 = T.sit0 + 520;
    T.type0 = Math.max(T.sit1 + 140, T.box1 + 100); T.key = 130; T.enter = T.type0 + 6 * T.key + 100; T.ok = T.enter + 60;
    T.term0 = T.ok + 380; T.sweep = 14; T.term1 = T.term0 + SC * T.sweep + 100;
    T.rev0 = T.term1 + 420; T.rev1 = T.rev0 + 420; T.dive0 = T.rev1 - 150; T.dive1 = T.dive0 + 1250;
    const keyAt = i => T.type0 + i * T.key;
    const Zf = Math.max(W / S.w, H / S.h), zp = 1.05, k0 = Math.min(S.w / W, S.h / H);
    app.style.transformOrigin = '0 0';

    // ---------------- the person: vectors drawn into a tiny raster, read back as line-art characters
    const SX = 4, SY = 8, PC = Math.ceil(1.15 * h / cw) + 4, PR = Math.ceil(1.12 * h / chh) + 3, pc = document.createElement('canvas'); pc.width = PC * SX; pc.height = PR * SY;
    const q = pc.getContext('2d', { willReadFrequently: true });
    const C_INK = 'rgb(255,0,0)', C_INK2 = 'rgb(255,0,255)', C_G = 'rgb(0,255,0)', C_G2 = 'rgb(0,255,255)';
    const ln = (pts, col, w) => { q.strokeStyle = col; q.lineWidth = w; q.lineCap = 'round'; q.lineJoin = 'round'; q.beginPath(); pts.forEach((p, i) => i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1])); q.stroke(); };
    const dsc = (px, py, r, col) => { q.fillStyle = col; q.beginPath(); q.arc(px, py, r, 0, TAU); q.fill(); };
    function side(px, env, p) { // walking, drawn facing right (the caller mirrors it)
      const leg = k => { const qq = p + k * Math.PI, th = AMP * env * Math.sin(qq), kb = .08 + .65 * env * Math.pow(Math.max(0, Math.cos(qq)), 1.5), sa = th - kb, kx = .235 * h * Math.sin(th), ky = .235 * h * Math.cos(th);
        return { kx, ky, ax: kx + .235 * h * Math.sin(sa), ay: ky + .235 * h * Math.cos(sa) }; };
      const L0 = leg(0), L1 = leg(1), hipY = footY - .03 * h - Math.max(L0.ay, L1.ay), lean = .07, shX = px + .29 * h * Math.sin(lean), shY = hipY - .29 * h * Math.cos(lean);
      const arm = k => { const ua = (k ? 1 : -1) * .42 * env * Math.sin(p), ex = shX + .16 * h * Math.sin(ua), ey = shY + .03 * h + .16 * h * Math.cos(ua), fa = ua + .45; return [[shX, shY + .03 * h], [ex, ey], [ex + .15 * h * Math.sin(fa), ey + .15 * h * Math.cos(fa)]]; };
      const legD = (Lg, col) => { const A = [px + Lg.kx, hipY + Lg.ky], B = [px + Lg.ax, hipY + Lg.ay]; ln([[px, hipY], A, B], col, .085 * h); ln([[B[0] - .01 * h, B[1] + .01 * h], [B[0] + .07 * h, B[1] + .01 * h]], col, .06 * h); };
      const a1 = arm(1); ln(a1, C_G2, .075 * h); dsc(a1[2][0], a1[2][1], .035 * h, C_INK2);
      legD(L1, C_INK2); legD(L0, C_INK);
      ln([[px, hipY - .05 * h], [shX, shY + .05 * h]], C_G, .21 * h); dsc(shX - .06 * h, shY - .05 * h, .07 * h, C_G2);
      dsc(shX + .025 * h, shY - .155 * h, .095 * h, C_INK);
      const a0 = arm(0); ln(a0, C_G, .075 * h); dsc(a0[2][0], a0[2][1], .035 * h, C_INK); }
    function back(px, sit, t, pump) { // from behind: standing, then cross-legged on the floor, typing
      const hipY = lerp(footY - .47 * h, footY - .07 * h, sit);
      for (const s of [-1, 1]) { const knee = [px + s * lerp(.06, .25, sit) * h, lerp(footY - .24 * h, footY - .085 * h, sit)], foot = [px + s * lerp(.07, -.05, sit) * h, lerp(footY - .02 * h, footY - .035 * h, sit)];
        ln([[px + s * .055 * h, hipY], knee, foot], C_INK, .09 * h); }
      for (const s of [-1, 1]) { const ki = Math.floor((t - T.type0) / T.key), typing = t > T.type0 && t < T.enter + 60, tap = typing && (ki % 2 === (s > 0 ? 0 : 1)) ? Math.sin(Math.PI * seg((t - T.type0) % T.key, 0, T.key * .8)) : 0;
        const jit = sit * .008 * h * Math.sin(t / 47 + s * 2) - tap * .025 * h, sh = [px + s * .125 * h, hipY - .255 * h];
        const el = [lerp(px + s * .15 * h, px + s * .225 * h, sit), lerp(hipY - .1 * h, hipY - .12 * h + jit, sit)], wr = [lerp(px + s * .155 * h, px + s * .14 * h, sit), lerp(hipY + .03 * h, hipY - .16 * h + jit * 1.4, sit)];
        if (!(s > 0 && pump > .2)) { ln([sh, el, wr], s < 0 ? C_G2 : C_G, .075 * h); dsc(wr[0], wr[1], .038 * h, C_INK); } }
      q.fillStyle = C_G; q.beginPath(); q.roundRect(px - .145 * h, hipY - .3 * h, .29 * h, .34 * h, .09 * h); q.fill();
      q.fillStyle = C_G2; q.beginPath(); q.ellipse(px, hipY - .27 * h, .095 * h, .045 * h, 0, 0, TAU); q.fill();
      const nod = t > T.ok && t < T.ok + 500 ? Math.sin(Math.PI * seg(t, T.ok, T.ok + 500)) * .015 * h : 0; dsc(px, hipY - .4 * h + nod, .095 * h, C_INK);
      if (pump > .2) { const sh = [px + .125 * h, hipY - .255 * h], el = [px + .24 * h, hipY - .36 * h], wr = [lerp(px + .14 * h, px + .22 * h, pump), lerp(hipY - .16 * h, hipY - .56 * h, pump)]; ln([sh, el, wr], C_G, .075 * h); dsc(wr[0], wr[1], .045 * h, C_INK); } }
    function personCells(t) { // -> [r, c, glyph, colour, alpha] on the laptop's grid
      const wu = walkEase(seg(t, T.walk0, T.walk1)), steps = wu * nSteps, px = x0 - dist * wu, env = Math.min(1, steps * 1.4, (nSteps - steps) * 1.4), p = Math.PI * steps;
      const c0 = Math.floor((px - lx) / cw) - Math.floor(PC / 2), r0 = GROW + 1 - PR, ox = cX(c0), oy = rY(r0);
      q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, pc.width, pc.height); q.setTransform(SX / cw, 0, 0, SY / chh, -ox * SX / cw, -oy * SY / chh);
      q.globalAlpha = .4; q.fillStyle = C_INK2; q.beginPath(); q.ellipse(px, footY + .01 * h, .2 * h, .025 * h, 0, 0, TAU); q.fill(); q.globalAlpha = 1;
      const tk = seg(t, T.turn, T.turn + 220);
      if (tk < .5) { q.translate(px, 0); q.scale(-(1 - tk * 2), 1); q.translate(-px, 0); side(px, env, p); }
      else { const sit = clamp(ob(seg(t, T.sit0, T.sit1)), 0, 1.04), pump = t > T.ok + 100 ? ob(seg(t, T.ok + 100, T.ok + 360)) * (1 - io(seg(t, T.ok + 800, T.ok + 1050))) : 0;
        q.translate(px, 0); q.scale((tk - .5) * 2, 1); q.translate(-px, 0); back(px, sit, t, Math.max(0, pump)); }
      const D = q.getImageData(0, 0, pc.width, pc.height).data, out = [], N = SX * SY, CV = new Float32Array(PC * PR), CL = new Uint8Array(PC * PR);
      for (let j = 0; j < PR; j++) for (let i = 0; i < PC; i++) { let cov = 0, wg = 0, wd = 0;
        for (let yy = 0; yy < SY; yy++) for (let xx = 0; xx < SX; xx++) { const k = ((j * SY + yy) * pc.width + i * SX + xx) * 4, a = D[k + 3] / 255; if (!a) continue; cov += a; if (D[k + 1] > D[k]) wg += a; if (D[k + 2] > 128) wd += a; }
        const at = j * PC + i; CV[at] = cov / N; CL[at] = (wg > cov / 2 ? 1 : 0) + (wd > cov / 2 ? 2 : 0); }
      const cvAt = (i, j) => i < 0 || j < 0 || i >= PC || j >= PR ? 0 : CV[j * PC + i];
      for (let j = 0; j < PR; j++) for (let i = 0; i < PC; i++) { const at = j * PC + i, c = CV[at]; if (c < .1) continue;
        const cl = CL[at], green = cl & 1, dim = cl & 2, L = cvAt(i - 1, j), R = cvAt(i + 1, j), U = cvAt(i, j - 1), Dn = cvAt(i, j + 1);
        if (!green && dim && c < .45 && U < .1) { out.push([r0 + j, c0 + i, c < .25 ? '.' : ':', GROUND, .9]); continue; }   // the floor shadow
        const col = green ? (dim ? G2 : G) : (dim ? INK2 : INK); let k;
        if (c > .7 && L > .45 && R > .45 && U > .45 && Dn > .45) k = dim ? '=' : green ? '%' : '#';
        else { const gx = (R - L) / cw, gy = (Dn - U) / chh; if (Math.abs(gx) + Math.abs(gy) < .02 / cw) k = c > .5 ? (green ? '%' : '#') : '+';
          else { let phi = Math.atan2(gy, gx) * 180 / Math.PI + 90; phi = ((phi % 180) + 180) % 180;
            if (phi < 22.5 || phi > 157.5) k = c < .4 ? (gy > 0 ? '.' : '\'') : gy > 0 ? '-' : '_';
            else if (phi > 67.5 && phi < 112.5) k = c < .35 ? ':' : '|';
            else k = phi < 90 ? '\\' : '/'; } }
        out.push([r0 + j, c0 + i, k, col, k === '#' || k === '%' || k === '=' ? .85 : 1]); }
      return out; }

    // ---------------- the screen: boot, login, then the logo's chart (plain characters only)
    function screenCells(t, put) {
      if (t < T.boot0) return;
      const type = (r, c0, s, col, w, at, step = 45) => [...s].forEach((k, i) => { const ti = at + i * step; if (t < ti) return; put(r, c0 + i, t < ti + 70 ? nz(r, c0 + i, t) : k, t < ti + 70 ? DIM : col, w); });
      type(0, 1, 'st0x', G, 800, T.boot0 + 120); type(0, SC - 7, '● 24/7', G, 700, T.boot0 + 260);
      const d1 = Math.floor(SC * oc(seg(t, T.boot0 + 60, T.boot0 + 420))); for (let c = 0; c < d1; c++) put(1, c, '-', DIM);
      const d2 = Math.floor(SC * oc(seg(t, T.boot0 + 200, T.boot0 + 560))); for (let c = 0; c < d2; c++) put(SR - 3, SC - 1 - c, '-', DIM);
      if (t >= T.boot0 + 400) put(SR - 2, 1, '>', DIM, 700);
      if (t >= T.boot0 + 400 && Math.floor(t / 380) % 2 === 0) put(SR - 2, 3, '_', G, 800);
      // the login box: drawn round clockwise, then swept away column by column into the chart
      const ok = t >= T.ok, bw = 27, bc0 = Math.floor((SC - bw) / 2), br = Math.floor(SR / 2) - 2, per = 2 * bw + 2, bd = Math.floor(per * oc(seg(t, T.box0, T.box1)));
      const swept = c => t >= T.term0 + c * T.sweep, flick = c => swept(c) && t < T.term0 + c * T.sweep + 90;
      const bput = (r, c, k, col, w) => { if (flick(c)) put(r, c, nz(r, c, t), G2, 500); else if (!swept(c)) put(r, c, k, col, w); };
      if (bd > 0) { const boxCol = ok ? G : DIM, path = [];
        for (let c = 0; c < bw; c++) path.push([br, bc0 + c, c === 0 || c === bw - 1 ? '+' : '-']); path.push([br + 1, bc0 + bw - 1, '|']);
        for (let c = bw - 1; c >= 0; c--) path.push([br + 2, bc0 + c, c === 0 || c === bw - 1 ? '+' : '-']); path.push([br + 1, bc0, '|']);
        path.slice(0, bd).forEach(([r, c, k]) => bput(r, c, k, boxCol, 600));
        if (t >= T.box1) { bput(br + 1, bc0 + 2, '>', ok ? G : DIM, 700); let n = 0; for (let i = 0; i < 6; i++) if (t >= keyAt(i)) { n = i + 1; bput(br + 1, bc0 + 4 + i, '*', ok ? G : INK, 700); }
          if (!ok && Math.floor(t / 380) % 2 === 0) bput(br + 1, bc0 + 4 + n, '_', G, 800); } }
      // the chart from the logo, revealed by the same sweep
      for (const [r, c, k, col] of CANDLES) if (swept(c) && !flick(c)) put(r, c, k, col, 800); }

    // ---------------- ASCII speed streaks for the dive
    const STREAKS = Array.from({ length: 46 }, (_, i) => ({ a: i / 46 * TAU + ((i * 73) % 7) * .03, r: .42 + ((i * 37) % 10) / 40, l: .1 + ((i * 53) % 9) / 45 }));
    const streakChar = a => { let d = ((a * 180 / Math.PI) % 180 + 180) % 180; return d < 22.5 || d > 157.5 ? '-' : d < 67.5 ? '\\' : d < 112.5 ? '|' : '/'; };

    function drawDesk(t) {
      const e = io(seg(t, T.dive0, T.dive1)), z = e > 0 ? zp * Math.exp(e * Math.log(Zf / zp)) : lerp(1, zp, io(seg(t, 0, T.dive0))), f = e > 0 ? (z - zp) / (Zf - zp) : 0;
      const P = { x: lerp(Sc.x, W / 2, f), y: lerp(Sc.y, H / 2, f) }, zc = e > 0 ? z * Math.pow(z / zp, .5) : z;
      const world = (zz, dy = 0) => x.setTransform(dpr * zz, 0, 0, dpr * zz, dpr * (P.x - Sc.x * zz), dpr * (P.y - Sc.y * zz + dy));
      world(z); x.textBaseline = 'alphabetic'; curF = 0;
      // the person first (as cells), so whatever sits behind them on the grid simply isn't drawn there
      const pcs = t > T.walk0 && e < .7 ? personCells(t) : [], hide = new Set(), sameGrid = e === 0;
      if (sameGrid) for (const p of pcs) hide.add((p[0] + 500) * 100000 + p[1] + 50000);
      const shown = (r, c) => !hide.has((r + 500) * 100000 + c + 50000);
      // the floor, drawn out of the cursor both ways
      const reach = oc(seg(t, T.gnd0, T.gnd1)) * Math.max(midC - cMin, cMax - midC);
      for (let c = cMin; c <= cMax; c++) if (Math.abs(c - midC) <= reach && !(t > T.lap0 && UNDER.has(c)) && shown(GROW, c)) glyph(cX(c), rY(GROW), '_', GROUND, 1, 500, F);
      // the laptop (the st0x logo) decoding from the floor up
      for (let r = 0; r < LAP.R; r++) { const row = LAP.rows[r], cols = LAP.cols[r], al = LAP.alph[r];
        for (let c = 0; c < LAP.C; c++) { const k = row[c]; if (k === ' ' || !shown(r, c)) continue; const tr = T.lap0 + (LAP.R - 1 - r) * T.row + hash(r, c) * 130; if (t < tr) continue;
          if (t < tr + 150) glyph(cX(c), rY(r), nz(r, c, t), G, .55, 500, F); else glyph(cX(c), rY(r), k, cols[c] === 'g' ? G : INK, (+al[c]) / 9, 600, F); } }
      // the cursor: arrives from the window we flew through, blinks on the floor, climbs with the build, waits in the screen
      if (t < T.box1) { const cr = t < T.lap0 ? GROW : Math.max(midR, LAP.R - 1 - Math.floor((t - T.lap0) / T.row)), m = oc(seg(t, 0, T.cur1));
        const gx = lerp(W / 2 - cw / 2, cX(midC), m), gy = lerp(H / 2 - chh / 2, rY(cr), m);
        if (t < T.cur1 || (t > T.lap0 && t < T.lap0 + LAP.R * T.row) || Math.floor(t / 260) % 2 === 0) glyph(gx, gy, '#', G, 1, 800, F); }
      // what's on the screen
      screenCells(t, (r, c, k, col, w = 500) => { const rr = LAP.scr[0] + r, cc = LAP.scr[2] + c; if (shown(rr, cc)) glyph(cX(cc), rY(rr), k, col, 1, w, F); });
      // the real terminal, showing through the screen
      const rev = seg(t, T.rev0, T.rev1); if (rev > 0) { x.save(); x.globalCompositeOperation = 'destination-out'; x.globalAlpha = rev; x.fillRect(S.x - .5, S.y - .5, S.w + 1, S.h + 1); x.restore(); }
      // the person, in front; nearer the camera, so they drop away first when we dive
      if (pcs.length) { world(zc, H * 1.3 * e); curF = 0; for (const [r, c, k, col, a] of pcs) glyph(cX(c), rY(r), k, col, a, 700, F); }
      // the dive: ASCII streaks around the screen
      x.setTransform(dpr, 0, 0, dpr, 0, 0); curF = 0;
      const sp = Math.sin(Math.PI * clamp((e - .1) / .8)); if (sp > 0) { const sw = S.w * z, sh = S.h * z, D = Math.hypot(W, H) / 2, Fs = clamp(F * 1.1, 10, 18), stp = Fs * .7;
        for (const s of STREAKS) { const ch = streakChar(s.a), r0 = D * s.r * (1 - .25 * e), r1 = r0 + D * s.l;
          for (let r = r0; r < r1; r += stp) { const px = W / 2 + Math.cos(s.a) * r, py = H / 2 + Math.sin(s.a) * r; if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;
            if (Math.abs(px - P.x) < sw / 2 && Math.abs(py - P.y) < sh / 2) continue; glyph(px - Fs * .3, py - Fs * .6, ch, STREAK, sp * (1 - (r - r0) / (r1 - r0) * .6), 700, Fs); } } }
      // the terminal itself sits inside the screen and grows with it
      const k = k0 * z; app.style.transform = `translate(${(P.x - W * k / 2).toFixed(2)}px,${(P.y - H * k / 2).toFixed(2)}px) scale(${k.toFixed(5)})`;
      return t >= T.dive1; }

    // ================= the clock =================
    let skip = false, done = false, raf = 0, base = null, a1 = A1.len; const t0 = performance.now(); let tOff = 0;
    function frame(now) { let t = now - t0 + tOff;
      if (base === null) { if (!cityTried || !city) buildCity(); if (city) base = t; else if (t > 900) { base = t; a1 = 0; } }
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      if (base === null && skip) { base = t; a1 = 0; }
      if (base === null) { if (Math.floor(t / 260) % 2 === 0) glyph(W / 2 - cw / 2, H / 2 - chh / 2, '#', G, 1, 800, F); app.style.transform = `translate(${W / 2}px,${H / 2}px) scale(.001)`; raf = requestAnimationFrame(frame); return; }
      let t2 = t - base - a1; if (skip && t2 < T.dive0) { tOff += T.dive0 - t2; t += T.dive0 - t2; t2 = T.dive0; }
      let end = false;
      if (t2 < 0) { drawCity(t - base); app.style.transform = `translate(${W / 2}px,${H / 2}px) scale(.001)`; }
      else end = drawDesk(t2);
      if (end) { if (!done) { done = true; app.style.transform = ''; app.style.transformOrigin = ''; onDone && onDone(); } return; }
      raf = requestAnimationFrame(frame); }

    frame(performance.now());
    return { skip() { skip = true; }, length: A1.len + T.dive1, finish() { cancelAnimationFrame(raf); app.style.transform = ''; app.style.transformOrigin = ''; if (!done) { done = true; onDone && onDone(); } } };
  }
  window.Intro = { play };
})();
