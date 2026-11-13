/* st0x app: the whole site is one full-screen terminal. intro, views, live market status, board, gap, names, week, about. */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const X = window.S0, { S, esc, usd, big, pct, cls, num } = X;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const introOn = !/[?&]nointro\b/.test(location.search);
  let view = 'chart';

  // ---------------------------------------------------------------- ascii decode
  const GLY = '.:-=+*#%@/\\|_<>01x';
  function decode(el, ms = 900, delay = 0) { const nodes = []; const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) { if (c.nodeValue.length) nodes.push({ n: c, t: c.nodeValue }); } else if (c.nodeType === 1 && c.tagName !== 'I') walk(c); } }; walk(el);
    const total = nodes.reduce((a, x) => a + x.t.length, 0); if (!total) return; nodes.forEach(x => x.n.nodeValue = x.t.replace(/\S/g, ' ')); el.style.visibility = 'visible';
    const t0 = performance.now() + delay; const step = now => { const p = Math.max(0, Math.min(1, (now - t0) / ms)); let i = 0;
      for (const x of nodes) { let s = ''; for (const ch of x.t) { const k = i / total, edge = p * 1.25 - k * 1.0; s += ch === ' ' ? ' ' : edge >= .25 ? ch : edge > 0 ? GLY[(Math.random() * GLY.length) | 0] : ' '; i++; } x.n.nodeValue = s; }
      if (p < 1) requestAnimationFrame(step); else nodes.forEach(x => x.n.nodeValue = x.t); }; requestAnimationFrame(step); }


  // ---------------------------------------------------------------- views (no page scroll: everything lives in the desk)
  function show(v, quiet) { if (!$(`.view[data-v="${v}"]`)) v = 'chart'; view = v; $$('#views button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    $$('.view').forEach(el => { const on = el.dataset.v === v; el.classList.toggle('on', on); if (on && !quiet) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); } });
    try { localStorage.setItem('st0x-view', v); } catch { }
    if (v === 'board' && S.board) requestAnimationFrame(() => paintHeat(S.board));
    if (v === 'names' && S.board) paintNames(S.board);
    if (v === 'week') playWeek();
    if (v === 'about') { aboutCity(); if (S.board) countNums(); const w = $('#footWm'); if (w && !w.dataset.d) { w.dataset.d = 1; decode(w, 1000); } }
    if (innerWidth <= 900) mobile(v === 'chart' && mobileMode === 'list' ? 'chart' : mobileMode === 'list' || mobileMode === 'trade' ? 'chart' : mobileMode); }
  $('#views').addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.v); });
  const openStock = m => { X.select(m); show('chart'); if (innerWidth <= 900) mobile('chart'); };
  // phones: one panel at a time
  let mobileMode = 'chart'; function mobile(m) { mobileMode = m; $('#app').dataset.m = m; $$('#mnav button').forEach(b => b.classList.toggle('on', b.dataset.m === m)); }
  $('#mnav').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; mobile(b.dataset.m); if (b.dataset.m === 'console') setTimeout(() => $('#conIn').focus(), 50); });
  $('#wlList').addEventListener('click', () => { if (innerWidth <= 900) setTimeout(() => mobile('chart'), 60); });
  mobile('chart');

  // ---------------------------------------------------------------- market status: top bar, status bar, week view
  function tick() { const n = X.nyse(), left = n.next ? X.dur(n.next - Date.now()) : '—';
    const p = $('#pNyse'); p.className = 'pill ' + (n.open ? 'open' : 'closed'); p.querySelector('b').textContent = n.open ? 'open' : 'closed'; p.querySelector('small').textContent = n.next ? (n.open ? `closes in ${left}` : `opens in ${left}`) : '';
    $('#tbNyse').textContent = 'nyse ' + (n.open ? 'open · closes ' : 'closed · opens ') + (n.next ? X.etLabel(n.next) : '');
    $('#sbNyse').textContent = `nyse ${n.open ? 'open' : 'closed'} · ${n.open ? 'closes' : 'opens'} ${n.next ? X.etLabel(n.next) : ''} (${left})`;
    $('#sbClock').textContent = X.etLabel(Date.now()) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' local';
    if (lastBoard) { const s = Math.round((Date.now() - lastBoard) / 1000); $('#sbUpd').textContent = `updated ${s}s ago`; }
    paintNow(); paintClocks(n); }
  const CLK = [['new york', 'America/New_York'], ['london', 'Europe/London'], ['dubai', 'Asia/Dubai'], ['tokyo', 'Asia/Tokyo']];
  const fmt = {}; CLK.forEach(([, z]) => fmt[z] = new Intl.DateTimeFormat('en-GB', { timeZone: z, hour: '2-digit', minute: '2-digit', weekday: 'short' })); const fmtMe = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', weekday: 'short' });
  function paintClocks(n) { const el = $('#clocks'); if (!el) return; const d = new Date();
    el.innerHTML = CLK.map(([c, z], i) => `<span><i class="${i === 0 && n.open ? 'on' : ''}"></i>${c} <b>${fmt[z].format(d).toLowerCase()}</b></span>`).join('') + `<span><i class="on"></i>you <b>${fmtMe.format(d).toLowerCase()}</b> · st0x open</span>`; }
  async function loadHours() { try { const r = await fetch('/api/x?a=hours'); const j = await r.json(); if (j.schedule) X.setSchedule(j.schedule); } catch { } tick(); paintHol(); paintNext(); }

  // ---------------------------------------------------------------- the week: 168 cells
  const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], cells = [];
  function buildWeek() { $('#wkDays').innerHTML = DAYS.map(d => `<span>${d}</span>`).join(''); $('#wkHours').innerHTML = Array.from({ length: 24 }, (_, h) => `<span>${String(h).padStart(2, '0')}</span>`).join('');
    const grid = $('#wkGrid'); let html = ''; for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) html += `<i class="cell" data-d="${d}" data-h="${h}"></i>`; grid.innerHTML = html;
    $$('#wkGrid .cell').forEach(c => cells.push({ el: c, d: +c.dataset.d, h: +c.dataset.h, nyse: +c.dataset.d < 5 && +c.dataset.h >= 9 && +c.dataset.h < 16, half: +c.dataset.d < 5 && +c.dataset.h === 9 }));
    cells.filter(c => c.half).forEach(c => c.el.style.setProperty('--half', '1')); }
  const NY = () => cells.filter(c => c.nyse);
  let weekPlayed = false; function playWeek() { if (weekPlayed) return; weekPlayed = true; const o = { p: 0 }; gsap.to(o, { p: 1, duration: reduce ? .01 : 2.6, ease: 'power1.inOut', onUpdate: () => paintWeek(o.p) }); }
  function paintWeek(p) { const ny = NY(), k1 = Math.round(Math.min(1, p / .4) * ny.length), k2 = Math.round(Math.max(0, Math.min(1, (p - .48) / .46)) * 168);
    ny.forEach((c, i) => c.el.classList.toggle('n', i < k1)); cells.forEach((c, i) => c.el.classList.toggle('o', i < k2));
    const nh = ny.slice(0, k1).reduce((a, c) => a + (c.half ? .5 : 1), 0); $('#wkNyse').textContent = nh.toFixed(1) + 'h'; $('#wkNyseP').textContent = (nh / 168 * 100).toFixed(1) + '% of the week';
    $('#wkOurs').textContent = k2 + 'h'; $('#wkOursP').textContent = (k2 / 168 * 100).toFixed(1) + '% of the week';
    const line = $('#wkLine'), phase = p > .48 ? 2 : 1; if (line.dataset.p != phase) { line.dataset.p = phase; line.innerHTML = phase === 2 ? 'st0x trades <b class="green">all 168</b>. weekends, nights, holidays.' : 'wall street trades <b class="grey">32.5</b> of them.'; } }
  function paintNow() { if (!cells.length) return; const p = X.et(Date.now()), d = (p.wd + 6) % 7, h = p.h; cells.forEach(c => c.el.classList.toggle('now', c.d === d && c.h === h));
    $('#wkNow').textContent = `${DAYS[d]} ${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')} et`; const n = X.nyse(); $('#wkNowS').textContent = n.open ? 'nyse open, st0x open' : 'nyse closed, st0x open'; }
  function paintNext() { const el = $('#wkNext'); if (!el) return; const out = [], MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    for (let i = 1; i < 380 && out.length < 6; i++) { const p = X.et(Date.now() + i * 864e5); if (p.wd === 0 || p.wd === 6) continue; const s = X.session(p.y, p.m, p.d, p.wd); if (s.closed || s.early) out.push({ p, early: !s.closed && s.early, name: X.HOLNAME[s.k] || 'market holiday' }); }
    el.innerHTML = out.length ? '<span style="box-shadow:none;padding-left:0;color:var(--mute)">nyse shut or short next:</span>' + out.map(o => `<span class="${o.early ? 'e' : ''}"><b>${o.early ? '1pm' : 'shut'}</b>${DAYS[(o.p.wd + 6) % 7]} ${MON[o.p.m - 1]} ${o.p.d} · ${o.name}</span>`).join('') : ''; }
  function paintHol() { const n = X.nyse(); if (!n.hol) return; const p = n.hol.p, name = X.HOLNAME[n.hol.k] || 'market holiday', MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    $('#wkHol').textContent = `next time nyse ${n.hol.early ? 'closes early' : 'stays shut on a weekday'}: ${DAYS[(p.wd + 6) % 7]} ${MON[p.m - 1]} ${p.d}, ${name}. st0x won't notice.`; }

  // ---------------------------------------------------------------- live board views
  let lastBoard = 0;
  function paintTape(b) { const L = b.stocks.slice(0, 30); const one = L.map(s => `<span class="tp"><img src="${esc(s.icon)}" alt="" loading="lazy"><b>${esc(s.tok)}</b><em>${usd(s.usd)}</em><span class="${cls(s.ch24)}">${s.ch24 >= 0 ? '▲' : '▼'} ${pct(s.ch24)}</span></span>`).join(''); $('#tapeRun').innerHTML = one + one; }
  function paintGapSum(b) { const el = $('#gapSum'); if (!el) return; const L = b.stocks.filter(s => s.gap != null); if (!L.length) return; const avg = L.reduce((a, s) => a + s.gap, 0) / L.length, hi = L.reduce((a, s) => s.gap > a.gap ? s : a), lo = L.reduce((a, s) => s.gap < a.gap ? s : a), above = L.filter(s => s.gap > 0).length;
    el.innerHTML = `<div><b class="${cls(avg)}">${pct(avg)}</b><span>average gap, ${L.length} xStocks</span></div><div><b class="u"><img src="${esc(hi.icon)}" alt="">${esc(hi.tok)} ${pct(hi.gap)}</b><span>richest vs its share</span></div><div><b class="d"><img src="${esc(lo.icon)}" alt="">${esc(lo.tok)} ${pct(lo.gap)}</b><span>cheapest vs its share</span></div><div><b>${above}/${L.length}</b><span>trading above the share</span></div>`; }
  function paintGap(b) { const n = X.nyse(); $('#gapLede').innerHTML = n.open ? 'nyse is open, so tokens and shares move together. come back after 4pm et and watch them drift apart.' : 'nyse is closed. the share price is frozen at its last print. the tokens keep trading. this is the gap, live.';
    const L = b.stocks.filter(s => s.gap != null).slice(0, 14); if (!L.length) { $('#gapTbl').innerHTML = '<div class="empty">no reference prices right now.</div>'; return; }
    const mx = Math.max(1, ...L.map(s => Math.abs(s.gap)));
    $('#gapTbl').innerHTML = `<div class="gr h"><span>stock</span><span>token (on-chain)</span><span>share (last print)</span><span>gap</span><span>share updated</span></div>` + L.map(s => { const w = Math.min(50, Math.abs(s.gap) / mx * 50);
      return `<div class="gr clk" data-m="${s.mint}"><span class="nm"><img src="${esc(s.icon)}" alt="" loading="lazy"><span><b>${esc(s.tok)}</b></span></span><span>${usd(s.usd)}</span><span>${usd(s.ref)}</span><span style="display:grid;grid-template-columns:1fr 64px;gap:10px;align-items:center"><span class="bar"><i class="${s.gap < 0 ? 'neg' : ''}" style="${s.gap < 0 ? `right:50%;left:auto;width:${w}%` : `width:${w}%`}"></i></span><span class="gv ${cls(s.gap)}">${pct(s.gap)}</span></span><span class="at">${s.refAt ? X.etLabel(Date.parse(s.refAt)) : '—'}</span></div>`; }).join(''); }
  let hmMode = 'ch', hmDone = false;
  function worst(row, side) { const sum = row.reduce((a, b) => a + b, 0), mx = Math.max(...row), mn = Math.min(...row); return Math.max(side * side * mx / (sum * sum), sum * sum / (side * side * mn)); }
  function squarify(vals, x, y, w, h) { const tot = vals.reduce((a, b) => a + b, 0), k = w * h / tot, A = vals.map(v => v * k), out = []; let i = 0;
    while (i < A.length) { const side = Math.min(w, h); let row = [A[i]], j = i + 1, wr = worst(row, side); while (j < A.length) { const nr = [...row, A[j]], nw = worst(nr, side); if (nw > wr) break; row = nr; wr = nw; j++; }
      const sum = row.reduce((a, b) => a + b, 0); if (w >= h) { const cw = sum / h; let yy = y; for (const a of row) { out.push([x, yy, cw, a / cw]); yy += a / cw; } x += cw; w -= cw; } else { const rh = sum / w; let xx = x; for (const a of row) { out.push([xx, y, a / rh, rh]); xx += a / rh; } y += rh; h -= rh; } i = j; }
    return out; }
  const mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  function paintHeat(b) { const box = $('#hm'); if (!box || !b) return; const L = b.stocks.filter(s => s.liq > 0).slice(0, 60), W = box.clientWidth, H = box.clientHeight; if (!W) return;
    const R = squarify(L.map(s => Math.pow(s.liq, .62)), 0, 0, W, H), cap = hmMode === 'ch' ? 4 : 1.2;
    box.innerHTML = L.map((s, i) => { const [x, y, w, h] = R[i], v = hmMode === 'ch' ? s.ch24 : s.gap, t = v == null ? 0 : Math.min(1, Math.abs(v) / cap), bg = v == null ? '#eef1ef' : v >= 0 ? mix('#f1fbf5', '#0f8f46', t) : mix('#fdf0f0', '#c42424', t), fg = t > .55 ? '#fff' : '#0d0f0e';
      const c = w < 44 || h < 24 ? 'xs' : w < 86 || h < 52 ? 'sm' : '';
      return `<div class="ht ${c}" data-m="${s.mint}" style="left:${(x / W * 100).toFixed(3)}%;top:${(y / H * 100).toFixed(3)}%;width:${(w / W * 100).toFixed(3)}%;height:${(h / H * 100).toFixed(3)}%;background:${bg};color:${fg}" title="${esc(s.tok)} ${usd(s.usd)} ${pct(v)}"><span class="hl"><img src="${esc(s.icon)}" alt="" loading="lazy" onerror="this.remove()"><b>${esc(s.tok)}</b></span><span><em>${pct(v)}</em><br><small>${usd(s.usd)} · ${big(s.liq)}</small></span></div>`; }).join('');
    if (!hmDone && view === 'board') { hmDone = true; gsap.from('#hm .ht', { opacity: 0, scale: .7, duration: .55, ease: 'back.out(1.6)', stagger: { each: .01 } }); } }

  let nmDone = false;
  function paintNames(b) { const g = $('#nmGrid'); if (!g) return; const L = b.stocks.slice(0, 36);
    g.innerHTML = L.map(s => `<button class="nmc" data-m="${s.mint}"><img src="${esc(s.icon)}" alt="${esc(s.name)} logo" loading="lazy" onerror="this.style.visibility='hidden'"><span class="t"><b>${esc(s.tok)}</b><small>${esc(s.name)}</small></span><span class="p"><b>${usd(s.usd)}</b><span class="${cls(s.ch24)}">${pct(s.ch24)}</span></span></button>`).join('');
    if (!nmDone && view === 'names') { nmDone = true; gsap.from('#nmGrid .nmc', { opacity: 0, y: 20, duration: .5, ease: 'power3.out', stagger: { each: .018 } }); } }
  function paintBuilt(b) { if (!b.brands) return; $$('#built img[data-brand]').forEach(i => { const u = b.brands[i.dataset.brand]; if (u && i.src !== u) i.src = u; else if (!u) i.remove(); }); }
  let numsDone = false;
  function paintNums(b) { const set = (k, v) => { const el = $(`[data-n="${k}"]`); if (el) el.dataset.v = v; }; set('count', b.count); set('liq', b.liq); set('vol', b.vol24);
    if (numsDone) { $('[data-n="count"]').textContent = b.count; $('[data-n="liq"]').textContent = big(b.liq); $('[data-n="vol"]').textContent = big(b.vol24); } }
  function countNums() { if (numsDone) return; numsDone = true; $$('[data-n]').forEach(el => { const v = +el.dataset.v; if (!isFinite(v)) return; const o = { v: 0 }, f = el.dataset.n === 'count' ? x => Math.round(x) : x => big(x);
    gsap.to(o, { v, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = f(o.v) }); }); }

  // ---------------------------------------------------------------- about: the city, blurred, behind the line
  let aboutDone = false; function aboutCity() { if (aboutDone || !window.City) return; const cv = $('#cityCv'), box = cv.parentElement; City.load().then(() => { const W = box.clientWidth, H = box.clientHeight; if (!W) return; aboutDone = true;
    const r = $('.ab-h b').getBoundingClientRect(), b = box.getBoundingClientRect(), k = b.width / W || 1, cx = (r.left - b.left + r.width / 2) / k, cy = (r.top - b.top + r.height / 2) / k, ax = r.width / k / 2 + 60, ay = 70;
    const g = City.build(W, H, W < 700 ? 8 : 10, (x, y) => { const q = Math.hypot((x - cx) / ax, (y - cy) / ay), t = Math.min(1, Math.max(0, (q - .8) / .5)); return t * t * (3 - 2 * t); }); City.live(cv, g); }).catch(() => { }); }

  // ---------------------------------------------------------------- the token (only once it exists)
  async function loadCfg() { let c = {}; try { c = await (await fetch('/api/x?a=cfg')).json(); } catch { }
    if (!c.ca) return; const ca = c.ca; $('#token').hidden = false; $('#tokH').hidden = false; $('#tokCa').textContent = ca; const pill = $('#tokPill'); pill.hidden = false; pill.href = `https://pump.fun/coin/${ca}`;
    $('#tokBuy').href = `https://pump.fun/coin/${ca}`; $('#tokChart').href = `https://dexscreener.com/solana/${ca}`; if (c.x) { $('#tokX').href = c.x; $('#tokX').hidden = false; }
    $('#tokCopy').onclick = async () => { try { await navigator.clipboard.writeText(ca); X.toast('contract address copied'); } catch { X.toast(ca); } };
    const px = async () => { try { const d = await (await fetch(`https://api.dexscreener.com/tokens/v1/solana/${ca}`)).json(); const p = (Array.isArray(d) ? d : []).sort((a, b) => ((b.liquidity || {}).usd || 0) - ((a.liquidity || {}).usd || 0))[0]; if (!p) return;
      $('#tokPx').textContent = usd(+p.priceUsd); $('#tokMc').textContent = big(p.marketCap || p.fdv); const ch = (p.priceChange || {}).h24; $('#tokCh').textContent = pct(ch); $('#tokCh').className = cls(ch); $('#tokPillPx').textContent = big(p.marketCap || p.fdv); } catch { } };
    px(); setInterval(px, 30000); }

  const WM = ['     _    ___', ' ___| |_ / _ \\__  __', '/ __| __| | | \\ \\/ /', '\\__ \\ |_| |_| |>  <', '|___/\\__|\\___//_/\\_\\'];
  $('#footWm').innerHTML = WM.map(l => [...l].map((c, i) => i >= 8 && i < 15 && c !== ' ' ? `<b>${esc(c)}</b>` : esc(c)).join('')).join('\n');

  // ---------------------------------------------------------------- intro (~6.5s, no words): the line, the bell, the week, the cursor, the terminal
  let playing = false;
  const PANELS = ['.top', '#tape', '.wl', '.center', '.side', '.dock'];
  function overlay() { let o = $('#intro'); if (!o) { o = document.createElement('div'); o.id = 'intro'; o.setAttribute('aria-hidden', 'true'); o.innerHTML = '<canvas id="introCv"></canvas><i id="introCur"></i>'; document.body.prepend(o); } return o; }
  function reveal(fast) { $('#app').classList.add('in'); if (fast) return; gsap.fromTo(PANELS, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', stagger: .05, clearProps: 'transform,opacity' }); }
  function playIntro() { if (playing || !window.Intro) { reveal(true); return; } playing = true; const o = overlay(), cv = $('#introCv'), cur = $('#introCur'), app = $('#app');
    gsap.set([o, cv, cur], { clearProps: 'all' }); app.classList.add('in');
    let run = null; const t0 = performance.now();
    const fin = () => { o.remove(); playing = false; removeEventListener('pointerdown', skip); removeEventListener('keydown', skip);  setTimeout(() => $('#conIn').focus({ preventScroll: true }), 300); };
    function skip(e) { if (performance.now() - t0 < 500) return; if (e.type === 'keydown' && !['Escape', 'Enter', ' '].includes(e.key)) return; run && run.skip(); }
    addEventListener('pointerdown', skip); addEventListener('keydown', skip);
    // the overlay only paints the canvas (the page behind is white); the app, clipped to nothing, opens out of the cursor at the end
    o.style.background = 'transparent';
    try { run = Intro.play({ canvas: cv, cursor: cur, app, onDone: fin }); } catch (e) { console.error(e); app.style.clipPath = ''; app.style.transform = ''; fin(); return; }
    setTimeout(() => { if (playing && !document.hidden) run.finish(); }, 14000); }
  $('.logo').addEventListener('click', e => { e.preventDefault(); playIntro(); });

  // ---------------------------------------------------------------- go
  // the command log stays tucked away until it's wanted; a command opens it
  const dock = $('.dock'); $('#conT').addEventListener('click', () => dock.classList.toggle('open'));
  $('#conIn').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.value.trim()) dock.classList.add('open'); });
  new MutationObserver(() => { if (!dock.classList.contains('open')) { const l = $('#conLog').lastElementChild; if (l && /er|ok/.test(l.className)) { dock.classList.add('open'); } } }).observe($('#conLog'), { childList: true });
  buildWeek(); paintWeek(0); loadHours(); setInterval(tick, 1000); setInterval(loadHours, 10 * 60e3);
  X.on(b => { lastBoard = Date.now(); paintTape(b); paintGap(b); paintGapSum(b); paintNums(b); paintBuilt(b); if (view === 'board') paintHeat(b); if (view === 'names') paintNames(b); $$('[data-live=count]').forEach(e => e.textContent = b.count); if (view === 'about' && !numsDone) countNums(); });
  $('#hmCtl').addEventListener('click', e => { const bt = e.target.closest('button'); if (!bt) return; hmMode = bt.dataset.c; $$('#hmCtl button').forEach(x => x.classList.toggle('on', x === bt)); paintHeat(S.board); });
  // anything that picks a stock brings the terminal view forward
  ['#wlList', '#pfList', '#btPane'].forEach(id => $(id).addEventListener('click', e => { if (e.target.closest('[data-m]') && view !== 'chart') show('chart'); }));
  $('#conIn').addEventListener('keydown', e => { if (e.key === 'Enter' && /^\s*(buy|sell|limit|price|p|chart|c|since|share|depth|fav|star)\b/i.test(e.target.value) && view !== 'chart') show('chart'); }, true);
  ['#hm', '#gapTbl', '#nmGrid'].forEach(id => $(id).addEventListener('click', e => { const t = e.target.closest('[data-m]'); if (t) openStock(t.dataset.m); }));
  addEventListener('resize', () => { clearTimeout(paintHeat.t); paintHeat.t = setTimeout(() => S.board && view === 'board' && paintHeat(S.board), 200); });
  let saved = 'chart'; try { saved = localStorage.getItem('st0x-view') || 'chart'; } catch { } show(saved, true);
  loadCfg();
  if (introOn) { if (document.hidden) { const go = () => { if (!document.hidden) { document.removeEventListener('visibilitychange', go); playIntro(); } }; document.addEventListener('visibilitychange', go); } else playIntro(); }
  else { const o = $('#intro'); if (o) o.remove(); reveal(false); }
})();
