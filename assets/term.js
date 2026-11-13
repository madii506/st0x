/* st0x terminal: live board, NYSE clock, real candles, Jupiter quotes and swaps signed in the visitor's wallet, a command line. */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const API = '/api/x', JUP = 'https://lite-api.jup.ag';
  const SOL = 'So11111111111111111111111111111111111111112', USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const getJ = async (u, o) => { const r = await fetch(u, o); const j = await r.json().catch(() => ({})); if (!r.ok || j.error) throw new Error(j.error || ('HTTP ' + r.status)); return j; };
  const usd = (v, d) => v == null || !isFinite(v) ? '—' : '$' + (+v).toLocaleString('en-US', { minimumFractionDigits: d ?? (v >= 1000 ? 0 : v >= 1 ? 2 : 4), maximumFractionDigits: d ?? (v >= 1000 ? 0 : v >= 1 ? 2 : 6) });
  const big = v => v == null || !isFinite(v) ? '—' : v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? '$' + (v / 1e3).toFixed(1) + 'K' : '$' + v.toFixed(0);
  const pct = (v, d = 2) => v == null || !isFinite(v) ? '—' : (v > 0 ? '+' : '') + v.toFixed(d) + '%';
  const cls = v => v == null ? '' : v >= 0 ? 'u' : 'd';
  const num = (v, d = 4) => v == null || !isFinite(v) ? '—' : (+v).toLocaleString('en-US', { maximumFractionDigits: d });
  const toast = (m, ms = 3200) => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), ms); };

  // ================================================================ NYSE clock (the schedule comes from Pyth, holidays included)
  const ETF = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hour12: false });
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function et(ms) { const p = {}; for (const x of ETF.formatToParts(new Date(ms))) p[x.type] = x.value; return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second, wd: WD[p.weekday] }; }
  function etToUtc(y, m, d, h, mi) { const g = Date.UTC(y, m - 1, d, h, mi); const p = et(g); const back = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi); return g - (back - g); }
  const H2026 = { '0101': 'C', '0119': 'C', '0216': 'C', '0403': 'C', '0525': 'C', '0619': 'C', '0703': 'C', '0907': 'C', '1126': 'C', '1127': '0930-1300', '1224': '0930-1300', '1225': 'C' };
  const HOLNAME = { '0101': "new year's day", '0118': 'martin luther king jr. day', '0119': 'martin luther king jr. day', '0215': "presidents' day", '0216': "presidents' day", '0326': 'good friday', '0403': 'good friday', '0525': 'memorial day', '0531': 'memorial day', '0618': 'juneteenth', '0619': 'juneteenth', '0703': 'independence day', '0705': 'independence day', '0907': 'labor day', '0906': 'labor day', '1126': 'thanksgiving', '1125': 'thanksgiving', '1127': 'day after thanksgiving', '1224': 'christmas eve', '1225': 'christmas' };
  const MKT = { week: ['0930-1600', '0930-1600', '0930-1600', '0930-1600', '0930-1600', 'C', 'C'], hol: {}, src: 'default' };
  function setSchedule(s) { try { const [, wk, hol] = String(s).split(';'); const w = wk.split(','); if (w.length === 7) MKT.week = w; MKT.hol = {}; for (const h of (hol || '').split(',')) { const [k, v] = h.split('/'); if (/^\d{4}$/.test(k)) MKT.hol[k] = v; } MKT.src = 'pyth'; } catch { } }
  function session(y, m, d, wd) { const k = String(m).padStart(2, '0') + String(d).padStart(2, '0'); let v = y === 2026 ? H2026[k] : undefined; if (v === undefined && y !== 2026) v = MKT.hol[k]; if (v === undefined) v = MKT.week[(wd + 6) % 7];
    if (!v || v === 'C') return { closed: true, k }; const [a, b] = v.split('-'); return { closed: false, k, start: etToUtc(y, m, d, +a.slice(0, 2), +a.slice(2)), end: etToUtc(y, m, d, +b.slice(0, 2), +b.slice(2)), early: v !== '0930-1600' }; }
  function openAt(ms) { const p = et(ms), s = session(p.y, p.m, p.d, p.wd); return !s.closed && ms >= s.start && ms < s.end; }
  function nyse(now = Date.now()) { const open = openAt(now); let next = null, hol = null;
    for (let i = 0; i < 12 && !next; i++) { const p = et(now + i * 864e5), s = session(p.y, p.m, p.d, p.wd); if (s.closed) { if (!hol && p.wd > 0 && p.wd < 6) hol = { ms: now + i * 864e5, k: s.k, p }; continue; }
      if (open && now < s.end) next = s.end; else if (!open && now < s.start) next = s.start; }
    let up = null; for (let i = 1; i < 400 && !up; i++) { const p = et(now + i * 864e5); if (p.wd === 0 || p.wd === 6) continue; const s = session(p.y, p.m, p.d, p.wd); if (s.closed) up = { k: s.k, p }; else if (s.early) up = { k: s.k, p, early: true }; }
    return { open, next, hol: up }; }
  const dur = ms => { const s = Math.max(0, Math.round(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return d ? `${d}d ${h}h ${m}m` : h ? `${h}h ${m}m` : `${m}m ${ss}s`; };
  const DAYN = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const etLabel = ms => { const p = et(ms); return `${DAYN[p.wd]} ${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')} et`; };

  // ================================================================ shared state
  const LS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, SV = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
  const S = { fav: new Set(LS('st0x-fav', [])), alerts: LS('st0x-alerts', []), board: null, sel: null, tf: '1h', side: 'buy', unit: 'SOL', slip: 100, wallet: null, provider: null, bag: null, quote: null, subs: [], sort: 'liq', q: '' };
  window.S0 = { S, et, nyse, dur, etLabel, openAt, setSchedule, MKT, HOLNAME, usd, big, pct, cls, num, esc, toast, on: f => S.subs.push(f), select: m => select(m), connect: () => openWallets() };

  async function loadBoard() { try { const b = await getJ(API + '?a=board'); const prev = S.board; S.board = b; paintList(prev); paintBar(); if (!S.sel) select(pickDefault()); else paintSel(); S.subs.forEach(f => { try { f(b); } catch (e) { console.error(e); } }); checkAlerts(); }
    catch (e) { if (!S.board) $('#wlList').innerHTML = `<div class="empty">could not reach the board (${esc(e.message)}). retrying…</div>`; } }
  const pickDefault = () => { const L = S.board.stocks; return (L.find(s => s.sym === 'NVDA') || L[0]).mint; };
  const bySym = t => { if (!S.board) return null; const k = String(t || '').toUpperCase().replace(/^\$/, ''); return S.board.stocks.find(s => s.sym === k || s.tok.toUpperCase() === k || s.sym === k.replace(/X$/, '')) || null; };
  const byMint = m => S.board && S.board.stocks.find(s => s.mint === m);

  // ================================================================ watchlist
  function sorted() { const L = S.board.stocks.slice(), q = S.q.trim().toLowerCase(); const f = q ? L.filter(s => s.sym.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.tok.toLowerCase().includes(q)) : L;
    if (S.sort === 'ch') f.sort((a, b) => (b.ch24 ?? -1e9) - (a.ch24 ?? -1e9)); else if (S.sort === 'gap') f.sort((a, b) => Math.abs(b.gap ?? 0) - Math.abs(a.gap ?? 0));
    return [...f.filter(s => S.fav.has(s.mint)), ...f.filter(s => !S.fav.has(s.mint))]; }
  function paintList(prev) { if (!S.board) return; const P = prev ? Object.fromEntries(prev.stocks.map(s => [s.mint, s.usd])) : {}; const L = sorted();
    $('#wlList').innerHTML = L.length ? L.map(s => { const fl = P[s.mint] && s.usd !== P[s.mint] ? (s.usd > P[s.mint] ? ' flash-u' : ' flash-d') : '';
      return `<button class="wr${s.mint === S.sel ? ' sel' : ''}${fl}" data-m="${s.mint}"><span class="nm"><img src="${esc(s.icon)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"><span><b>${esc(s.sym)}</b>${S.fav.has(s.mint) ? '<span class="st">★</span>' : ''}<small>${esc(s.name)}</small></span></span><span class="px">${usd(s.usd)}</span><span class="c ${cls(s.ch24)}">${pct(s.ch24)}</span></button>`; }).join('') : '<div class="empty">nothing matches.</div>'; }
  function paintBar() { const b = S.board; $('#tbSol').textContent = 'sol ' + usd(b.sol, 2); $('#tbCount').textContent = b.count + ' stocks'; }

  // ================================================================ selection + chart
  function select(mint) { if (!mint || !byMint(mint)) return; S.sel = mint; S.quote = null; paintList(); paintSel(); loadCandles(); requote(); }
  function paintSel() { const s = byMint(S.sel); if (!s) return; $('#chIcon').src = s.icon; $('#chSym').textContent = s.tok; $('#chName').textContent = s.name + ' · ' + s.sym;
    $('#chPx').textContent = usd(s.usd); const c = $('#chCh'); c.textContent = pct(s.ch24) + ' 24h'; c.className = cls(s.ch24);
    $('#chMeta').innerHTML = [['liquidity', big(s.liq)], ['24h volume', big(s.vol24)], ['holders', s.holders ? num(s.holders, 0) : '—'], ['share price', s.ref ? usd(s.ref) : '—'], ['gap', `<span class="${cls(s.gap)}">${pct(s.gap)}</span>`]].map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('');
    $('#chStar').textContent = S.fav.has(s.mint) ? '[ ★ ]' : '[ ☆ ]'; $('#chStar').classList.toggle('on', S.fav.has(s.mint)); paintSince(); paintTicket(); }
  let CH = { rows: [], hover: -1 }, chartReq = 0;
  async function loadCandles() { const id = ++chartReq, s = byMint(S.sel); $('#chMsg').textContent = 'loading candles…'; $('#chMsg').style.display = '';
    try { const j = await getJ(`${API}?a=candles&mint=${S.sel}&tf=${S.tf}`); if (id !== chartReq) return; CH = { rows: j.rows, hover: -1, tf: j.tf, dex: j.dex };
      $('#chSrc').textContent = j.rows.length ? `${j.rows.length} candles · ${j.dex || 'pool'} · geckoterminal` : ''; $('#chMsg').style.display = j.rows.length ? 'none' : ''; if (!j.rows.length) $('#chMsg').textContent = `no ${S.tf} candles for ${s.tok} yet`; drawChart(); paintSince(); }
    catch (e) { if (id !== chartReq) return; CH = { rows: [], hover: -1 }; drawChart(); $('#chMsg').textContent = 'candles unavailable: ' + e.message; $('#chMsg').style.display = ''; } }
  const TFS = { '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400 };
  function closedAt(t) { // seconds: is the whole candle outside a NYSE session?
    if (S.tf === '1d') { const p = et(t * 1000 + 12 * 3600e3), s = session(p.y, p.m, p.d, p.wd); return s.closed; }
    const mid = (t + TFS[S.tf] / 2) * 1000; return !openAt(mid); }
  function niceStep(r) { const p = Math.pow(10, Math.floor(Math.log10(r))), n = r / p; return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p; }
  function drawChart() { const cv = $('#chCv'), box = cv.parentElement.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), W = box.width, H = box.height; if (!W || !H) return;
    cv.width = W * dpr; cv.height = H * dpr; const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    const rows = CH.rows; if (!rows.length) return; const R = 66, B = 24, T = 18, vh = (H - B - T) * .14, ph = H - B - T - vh - 8;
    const lo = Math.min(...rows.map(r => r.l)), hi = Math.max(...rows.map(r => r.h)), pad = (hi - lo) * .08 || hi * .01, a = lo - pad, b = hi + pad;
    const step = (W - R) / rows.length, X = i => i * step + step / 2, Y = v => T + (b - v) / (b - a) * ph, vmax = Math.max(...rows.map(r => r.v || 0)) || 1;
    x.font = '600 10px JB, monospace';
    // nyse-closed bands
    let bs = -1; const bands = []; rows.forEach((r, i) => { const c = closedAt(r.t); if (c && bs < 0) bs = i; if ((!c || i === rows.length - 1) && bs >= 0) { bands.push([bs, c ? i : i - 1]); bs = -1; } });
    for (const [s, e] of bands) { const x0 = s * step, x1 = (e + 1) * step; x.fillStyle = '#eefaf3'; x.fillRect(x0, 0, x1 - x0, H - B); x.fillStyle = '#bfe8cf'; x.fillRect(x0, 0, 1, H - B); x.fillRect(x1 - 1, 0, 1, H - B);
      if (x1 - x0 > 74) { x.fillStyle = '#12a150'; x.globalAlpha = .9; x.fillText('nyse closed', x0 + 6, 12); x.globalAlpha = 1; } }
    // grid + price axis
    const st = niceStep((b - a) / 5); x.fillStyle = '#9aa39f'; x.textAlign = 'left';
    for (let v = Math.ceil(a / st) * st; v <= b; v += st) { const y = Y(v); x.fillStyle = '#e3e7e5'; for (let gx = 0; gx < W - R; gx += 6) x.fillRect(gx, Math.round(y), 2, 1); x.fillStyle = '#878f8b'; x.fillText(usd(v), W - R + 8, y + 3); }
    // time axis
    x.fillStyle = '#878f8b'; const every = Math.max(1, Math.round(90 / step)); x.textAlign = 'center';
    rows.forEach((r, i) => { if (i % every) return; const p = et(r.t * 1000); x.fillText(S.tf === '1d' ? `${MON[p.m - 1]} ${p.d}` : `${DAYN[p.wd]} ${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`, X(i), H - 8); });
    // volume + candles
    const cw = Math.max(1, Math.min(14, step * .64));
    rows.forEach((r, i) => { const up = r.c >= r.o, col = up ? '#12a150' : '#dc2a2a', cx = X(i);
      x.fillStyle = up ? 'rgba(18,161,80,.18)' : 'rgba(220,42,42,.16)'; const vv = (r.v || 0) / vmax * vh; x.fillRect(cx - cw / 2, H - B - vv, cw, vv);
      x.fillStyle = col; x.fillRect(Math.round(cx) - .5, Y(r.h), 1, Math.max(1, Y(r.l) - Y(r.h))); const y0 = Y(Math.max(r.o, r.c)), y1 = Y(Math.min(r.o, r.c)); x.fillRect(cx - cw / 2, y0, cw, Math.max(1, y1 - y0)); });
    // last price
    const last = rows[rows.length - 1], ly = Y(last.c); x.fillStyle = '#0d0f0e'; for (let gx = 0; gx < W - R; gx += 7) x.fillRect(gx, Math.round(ly), 3, 1);
    x.fillRect(W - R + 2, ly - 9, R - 4, 18); x.fillStyle = '#fff'; x.textAlign = 'left'; x.fillText(usd(last.c), W - R + 7, ly + 3.5);
    // crosshair
    if (CH.hover >= 0 && rows[CH.hover]) { const i = CH.hover, r = rows[i]; x.fillStyle = 'rgba(13,15,14,.35)'; x.fillRect(Math.round(X(i)), 0, 1, H - B);
      const tip = $('#chTip'), ch = r.o ? (r.c / r.o - 1) * 100 : 0, closed = closedAt(r.t);
      tip.innerHTML = `${etLabel(r.t * 1000)} · ${closed ? '<span style="color:#7ee2a6">nyse closed</span>' : 'nyse open'}<br>o ${usd(r.o)}  h ${usd(r.h)}<br>l ${usd(r.l)}  c ${usd(r.c)}  <span style="color:${ch >= 0 ? '#7ee2a6' : '#ff9a9a'}">${pct(ch)}</span>`;
      tip.style.opacity = 1; const tx = X(i) + 14, tw = tip.offsetWidth; tip.style.left = (tx + tw > W - R ? X(i) - tw - 14 : tx) + 'px'; tip.style.top = '24px'; } else $('#chTip').style.opacity = 0;
    CH.geo = { step, R, W }; }
  function chartHover(e) { if (!CH.geo) return; const r = $('#chCv').getBoundingClientRect(), mx = e.clientX - r.left; const i = Math.floor(mx / CH.geo.step); CH.hover = mx < CH.geo.W - CH.geo.R && i >= 0 && i < CH.rows.length ? i : -1; drawChart(); }

  // ================================================================ trade ticket (Jupiter)
  function decOf(m) { if (m === SOL) return 9; if (m === USDC) return 6; const s = byMint(m); return s ? s.decimals ?? 8 : 8; }
  function legs() { const s = byMint(S.sel); if (!s) return null; const pay = S.side === 'buy' ? (S.unit === 'USDC' ? USDC : SOL) : s.mint, get = S.side === 'buy' ? s.mint : (S.unit === 'USDC' ? USDC : SOL); return { s, pay, get }; }
  function heldOf(m) { if (!S.bag) return null; if (m === SOL) return { ui: S.bag.sol, raw: String(Math.floor(S.bag.sol * 1e9)) }; if (m === USDC) return { ui: S.bag.usdc, raw: String(Math.floor(S.bag.usdc * 1e6)) }; const t = S.bag.stocks.find(x => x.mint === m); return t ? { ui: t.amount, raw: t.raw } : { ui: 0, raw: '0' }; }
  function paintTicket() { const L = legs(); if (!L) return; const { s, pay } = L;
    $$('#tkSide button').forEach(b => b.classList.toggle('on', b.dataset.side === S.side)); $('#tkUnit').textContent = S.side === 'buy' ? S.unit : s.tok;
    $('#tkPayL').textContent = S.side === 'buy' ? 'you pay' : 'you sell'; const h = heldOf(pay); $('#tkBal').textContent = h ? 'balance ' + num(h.ui, S.side === 'buy' ? 4 : 6) : '';
    const go = $('#tkGo'); go.classList.toggle('sell', S.side === 'sell'); paintQuote(); }
  function rawIn() { const L = legs(), v = parseFloat(String($('#tkAmt').value).replace(/,/g, '')); if (!L || !(v > 0)) return null; const d = decOf(L.pay); return BigInt(Math.floor(v * 10 ** Math.min(d, 9))) * (d > 9 ? 10n ** BigInt(d - 9) : 1n); }
  let qTimer = 0, qReq = 0;
  function requote() { clearTimeout(qTimer); S.quote = null; paintQuote(true); qTimer = setTimeout(getQuote, 380); }
  async function getQuote() { const L = legs(), amt = rawIn(); if (!L || !amt) { S.quote = null; paintQuote(); return null; } const id = ++qReq;
    try { const q = await getJ(`${JUP}/swap/v1/quote?inputMint=${L.pay}&outputMint=${L.get}&amount=${amt}&slippageBps=${S.slip}&restrictIntermediateTokens=true`); if (id !== qReq) return null; S.quote = { q, L, at: Date.now() }; paintQuote(); return S.quote; }
    catch (e) { if (id !== qReq) return null; S.quote = { err: /could not find any route|no route/i.test(e.message) ? 'no route for this size right now' : e.message }; paintQuote(); return null; } }
  function quoteView(Q) { const { q, L } = Q, s = L.s, outUi = +q.outAmount / 10 ** decOf(L.get), inUi = +q.inAmount / 10 ** decOf(L.pay), minUi = +q.otherAmountThreshold / 10 ** decOf(L.get), solUsd = S.board && S.board.sol;
    const usdIn = L.pay === SOL ? inUi * solUsd : L.pay === USDC ? inUi : inUi * (s.usd || 0), usdOut = L.get === SOL ? outUi * solUsd : L.get === USDC ? outUi : outUi * (s.usd || 0);
    const shares = S.side === 'buy' ? outUi : inUi, px = S.side === 'buy' ? usdIn / outUi : usdOut / inUi, vs = s.usd ? (px / s.usd - 1) * 100 : null;
    const route = (q.routePlan || []).map(r => r.swapInfo && r.swapInfo.label).filter(Boolean); return { outUi, inUi, minUi, usdIn, usdOut, px, vs, shares, impact: +q.priceImpactPct * 100, route: [...new Set(route)].join(' → ') || '—', outSym: L.get === SOL ? 'SOL' : L.get === USDC ? 'USDC' : s.tok, inSym: L.pay === SOL ? 'SOL' : L.pay === USDC ? 'USDC' : s.tok }; }
  function paintQuote(loading) { const go = $('#tkGo'), Q = S.quote, set = (k, v) => $(k).innerHTML = v;
    if (!Q || Q.err) { $('#tkOut').textContent = Q && Q.err ? Q.err : loading && rawIn() ? 'quoting…' : '—'; $('#tkGetUsd').textContent = ''; ['#qPx', '#qVs', '#qImp', '#qMin', '#qRoute'].forEach(k => set(k, '—'));
      go.textContent = !rawIn() ? '[ enter an amount ]' : Q && Q.err ? '[ no route ]' : '[ quoting… ]'; go.disabled = true;
      if (!S.wallet && !rawIn()) { go.disabled = false; go.textContent = '[ connect wallet ]'; } return; }
    const v = quoteView(Q); $('#tkOut').textContent = num(v.outUi, v.outSym.length > 4 || v.outSym.endsWith('x') ? 6 : 4) + ' ' + v.outSym; $('#tkGetUsd').textContent = '≈ ' + usd(v.usdOut, 2);
    set('#qPx', usd(v.px) + ' / share'); set('#qVs', `<span class="${v.vs != null && Math.abs(v.vs) < .5 ? '' : cls(-Math.abs(v.vs))}">${pct(v.vs)}</span>`); set('#qImp', `<span class="${v.impact > 1 ? 'd' : ''}">${v.impact < .01 ? '<0.01%' : v.impact.toFixed(2) + '%'}</span>`);
    set('#qMin', num(v.minUi, 6) + ' ' + v.outSym); set('#qRoute', esc(v.route));
    const h = heldOf(Q.L.pay), short = h && BigInt(h.raw || '0') < BigInt(Q.q.inAmount) + (Q.L.pay === SOL ? 15000000n : 0n);
    go.disabled = false; go.textContent = !S.wallet ? '[ connect wallet ]' : short ? `[ not enough ${v.inSym} ]` : `[ ${S.side} ${v.shares < 1 ? num(v.shares, 5) : num(v.shares, 3)} ${Q.L.s.tok} ]`; if (S.wallet && short) go.disabled = true; }

  // ================================================================ wallets
  const WALLETS = [['Phantom', () => window.phantom && window.phantom.solana, 'https://phantom.com/download'], ['Solflare', () => window.solflare && window.solflare.isSolflare && window.solflare, 'https://solflare.com/download'], ['Backpack', () => window.backpack, 'https://backpack.app/download']];
  function openWallets() { const box = $('#wm .mbox'); box.classList.remove('wide'); box.querySelector('.mh b').textContent = 'connect a wallet'; const fn = box.querySelector(':scope > .fine'); if (fn) fn.hidden = false; $('#wmList').innerHTML = WALLETS.map(([n, f]) => `<button class="mw" data-w="${n}">${n}<span>${f() ? 'detected' : 'install'}</span></button>`).join(''); $('#wm').hidden = false; }
  async function connectWith(n) { const w = WALLETS.find(x => x[0] === n), p = w && w[1](); if (!p) { window.open(w[2], '_blank', 'noopener'); return; }
    try { const r = await p.connect(); onConnect(((r && r.publicKey) || p.publicKey).toString(), p); $('#wm').hidden = true; } catch { toast('connection cancelled'); } }
  function onConnect(pk, p) { S.wallet = pk; S.provider = p; if (p.on && !p._st0x) { p._st0x = 1; try { p.on('accountChanged', k => k ? onConnect(k.toString(), p) : disconnect()); } catch { } }
    const short = pk.slice(0, 4) + '…' + pk.slice(-4); $('#tbWallet').textContent = `[ ${short} ]`; $('#navWallet').textContent = `[ ${short} ]`; log(`connected ${short}`, 'ok'); loadBag(); paintQuote(); }
  async function disconnect() { try { await S.provider.disconnect(); } catch { } S.wallet = null; S.provider = null; S.bag = null; $('#tbWallet').textContent = '[ connect wallet ]'; $('#navWallet').textContent = '[ connect ]'; $('#pf').hidden = true; paintTicket(); log('disconnected', 'dim'); }
  async function loadBag() { if (!S.wallet) return; try { S.bag = await getJ(`${API}?a=wallet&addr=${S.wallet}`); paintBag(); paintTicket(); } catch (e) { log('could not read your wallet: ' + e.message, 'er'); } }
  function paintBag() { const b = S.bag; if (!b) return; $('#pf').hidden = false; $('#pfTot').textContent = `${num(b.sol, 4)} SOL${b.usdc ? ' · ' + num(b.usdc, 2) + ' USDC' : ''} · total ${usd(b.totalUsd, 2)}`;
    $('#pfList').innerHTML = b.stocks.length ? b.stocks.map(t => `<button class="pfi" data-m="${t.mint}"><img src="${esc(t.icon)}" alt="">${esc(t.tok)} <b>${num(t.amount, 6)}</b><span>${usd(t.usd, 2)}</span></button>`).join('') : '<span class="dim" style="font-size:12px;color:var(--mute)">no xStocks in this wallet yet.</span>'; }

  // ================================================================ sign and send
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function execute() { if (!S.wallet) { openWallets(); return; } let Q = S.quote; if (!Q || Q.err || Date.now() - Q.at > 20000) Q = await getQuote(); if (!Q || Q.err) { toast('no quote right now'); return; }
    if (!window.solanaWeb3) { toast('still loading, try again in a second'); return; } const v = quoteView(Q), go = $('#tkGo'); go.disabled = true; go.textContent = '[ building… ]';
    try { const sw = await getJ(`${JUP}/swap/v1/swap`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quoteResponse: Q.q, userPublicKey: S.wallet, wrapAndUnwrapSol: true, dynamicComputeUnitLimit: true, dynamicSlippage: false, prioritizationFeeLamports: { priorityLevelWithMaxLamports: { maxLamports: 800000, priorityLevel: 'high' } } }) });
      if (sw.simulationError) throw new Error(/debit|insufficient/i.test(sw.simulationError.error || '') ? `not enough ${v.inSym} for this trade plus fees` : 'simulation failed: ' + (sw.simulationError.error || sw.simulationError.errorCode));
      const tx = solanaWeb3.VersionedTransaction.deserialize(b64(sw.swapTransaction)); go.textContent = '[ approve in wallet… ]'; log(`${S.side} ${num(v.shares, 6)} ${Q.L.s.tok} · waiting for your wallet…`, 'dim');
      let sig; if (S.provider.signAndSendTransaction) { const r = await S.provider.signAndSendTransaction(tx); sig = typeof r === 'string' ? r : r.signature; }
      else { const signed = await S.provider.signTransaction(tx); let bin = ''; signed.serialize().forEach(c => bin += String.fromCharCode(c)); sig = (await getJ(`${API}?a=send`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tx: btoa(bin) }) })).sig; }
      if (sig && typeof sig !== 'string') sig = solanaWeb3.bs58 ? solanaWeb3.bs58.encode(sig) : String(sig);
      go.textContent = '[ confirming… ]'; log(`sent · <a href="https://solscan.io/tx/${esc(sig)}" target="_blank" rel="noopener">view on solscan</a>`, 'dim', true);
      let ok = false; for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 1500)); const st = await getJ(`${API}?a=tx&sig=${sig}`).catch(() => null); if (st && st.err) throw new Error('the transaction failed on-chain'); if (st && /confirmed|finalized/.test(st.status || '')) { ok = true; break; } }
      if (ok) { log(`done. ${S.side === 'buy' ? 'bought' : 'sold'} ${num(v.shares, 6)} ${Q.L.s.tok} at ${usd(v.px)}.`, 'ok'); toast(`${S.side === 'buy' ? 'bought' : 'sold'} ${Q.L.s.tok}`); $('#tkAmt').value = ''; }
      else log('not confirmed yet. check solscan; it may still land.', 'er');
      loadBag(); }
    catch (e) { const m = /reject|cancel|denied|declined/i.test(e.message || '') ? 'cancelled in wallet' : (e.message || 'something went wrong'); log(m, 'er'); toast(m); }
    S.quote = null; requote(); }


  // ================================================================ since the bell: what the token did while nyse was shut (or since today's open)
  function sinceClose() { const rows = CH.rows; if (!rows || rows.length < 3 || S.tf === '1d') return null; const s = byMint(S.sel); if (!s || !s.usd) return null; const n = nyse();
    if (!n.open) { for (let i = rows.length - 1; i >= 0; i--) if (!closedAt(rows[i].t)) { const at = (rows[i].t + TFS[S.tf]) * 1000; return { kind: 'closed', at, px: rows[i].c, ch: (s.usd / rows[i].c - 1) * 100 }; } return null; }
    let i = rows.length - 1; while (i > 0 && !closedAt(rows[i - 1].t)) i--; if (closedAt(rows[i].t)) return null; return { kind: 'open', at: rows[i].t * 1000, px: rows[i].o, ch: (s.usd / rows[i].o - 1) * 100 }; }
  function paintSince() { const m = $('#chMeta'); if (!m) return; const old = m.querySelector('.since'); if (old) old.remove(); const v = sinceClose(); if (!v) return;
    const el = document.createElement('span'); el.className = 'since'; el.innerHTML = `${v.kind === 'closed' ? 'since nyse closed' : 'since the open'} (${etLabel(v.at)}) <b class="${cls(v.ch)}">${pct(v.ch)}</b>`; m.prepend(el); }

  // ================================================================ alerts: kept in this browser, checked on every refresh
  function saveAlerts() { SV('st0x-alerts', S.alerts); }
  function beep() { try { const A = new (window.AudioContext || window.webkitAudioContext)(), o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = 880; g.gain.value = .04; o.connect(g); g.connect(A.destination); o.start(); o.frequency.setValueAtTime(1320, A.currentTime + .09); o.stop(A.currentTime + .2); } catch { } }
  function addAlert(s, op, px) { const a = { id: Date.now(), mint: s.mint, tok: s.tok, op, px }; S.alerts.push(a); saveAlerts();
    try { if (window.Notification && Notification.permission === 'default') Notification.requestPermission(); } catch { } return a; }
  function checkAlerts() { if (!S.board || !S.alerts.length) return; const hit = [];
    S.alerts = S.alerts.filter(a => { const s = byMint(a.mint); if (!s || !s.usd) return true; const ok = a.op === '>' ? s.usd >= a.px : s.usd <= a.px; if (ok) hit.push([a, s]); return !ok; });
    if (!hit.length) return; saveAlerts();
    for (const [a, s] of hit) { const m = `${a.tok} is ${a.op === '>' ? 'above' : 'below'} ${usd(a.px)}: now ${usd(s.usd)}${nyse().open ? '' : ' (nyse is closed)'}`; log('alert · ' + m, 'ok'); toast('alert · ' + m, 6000); beep();
      try { if (window.Notification && Notification.permission === 'granted') new Notification('st0x · ' + a.tok, { body: m, icon: '/icon-512.png' }); } catch { } } }

  // ================================================================ share card: a png of the live numbers, for X
  function shareCard() { const s = byMint(S.sel); if (!s) return; const W = 1200, H = 630, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); const n = nyse();
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = '#e6eae8'; for (let gy = 30; gy < H; gy += 24) for (let gx = 30; gx < W; gx += 24) x.fillRect(gx, gy, 2, 2);
    const F = (w, z) => `${w} ${z}px JB, ui-monospace, monospace`;
    x.font = F(800, 40); x.fillStyle = '#0d0f0e'; x.fillText('st', 60, 92); let w = x.measureText('st').width; x.fillStyle = '#12a150'; x.fillText('0', 60 + w, 92); w += x.measureText('0').width; x.fillStyle = '#0d0f0e'; x.fillText('x', 60 + w, 92);
    const st = `nyse ${n.open ? 'open' : 'closed'} · st0x open · ${etLabel(Date.now())}`; x.font = F(700, 20); const sw = x.measureText(st).width; x.fillStyle = '#f6f8f7'; x.beginPath(); x.roundRect(W - 60 - sw - 44, 58, sw + 44, 44, 22); x.fill();
    x.fillStyle = n.open ? '#12a150' : '#dc2a2a'; x.beginPath(); x.arc(W - 60 - sw - 22, 80, 6, 0, 7); x.fill(); x.fillStyle = '#0d0f0e'; x.fillText(st, W - 60 - sw - 8, 87);
    x.font = F(800, 120); x.fillStyle = '#0d0f0e'; x.fillText(s.tok, 56, 250); x.font = F(700, 64); x.fillText(usd(s.usd), 60, 340);
    const pw = x.measureText(usd(s.usd)).width; x.font = F(800, 34); x.fillStyle = s.ch24 >= 0 ? '#12a150' : '#dc2a2a'; x.fillText(pct(s.ch24) + ' 24h', 60 + pw + 26, 338);
    x.font = F(500, 22); x.fillStyle = '#383e3b'; if (s.ref) { x.fillText(`token ${usd(s.usd)} · share ${usd(s.ref)}`, 60, 400); x.fillText(`gap ${pct(s.gap)} vs the real share`, 60, 432); } else x.fillText(`${s.name} · on solana`, 60, 400);
    const v = sinceClose(); if (v) { x.fillStyle = v.ch >= 0 ? '#12a150' : '#dc2a2a'; x.font = F(700, 24); x.fillText(`${v.kind === 'closed' ? 'since nyse closed' : 'since the open'}: ${pct(v.ch)}`, 60, 476); }
    // mini chart of the last candles, nyse-closed hours tinted
    const R = (CH.rows || []).slice(-72); if (R.length > 4) { const X0 = 680, Y0 = 150, CW = 460, CHh = 300, lo = Math.min(...R.map(r => r.l)), hi = Math.max(...R.map(r => r.h)), stp = CW / R.length, Y = p => Y0 + (hi - p) / (hi - lo || 1) * CHh;
      R.forEach((r, i) => { if (closedAt(r.t)) { x.fillStyle = '#eefaf3'; x.fillRect(X0 + i * stp, Y0 - 10, stp + .5, CHh + 20); } });
      R.forEach((r, i) => { const col = r.c >= r.o ? '#12a150' : '#dc2a2a', cx = X0 + i * stp + stp / 2; x.fillStyle = col; x.fillRect(cx - 1, Y(r.h), 2, Math.max(1, Y(r.l) - Y(r.h))); const a = Y(Math.max(r.o, r.c)), b = Y(Math.min(r.o, r.c)); x.fillRect(cx - stp * .32, a, stp * .64, Math.max(2, b - a)); });
      x.font = F(600, 16); x.fillStyle = '#878f8b'; x.fillText(`${S.tf} candles · green = nyse closed, still trading`, X0, Y0 + CHh + 40); }
    x.fillStyle = '#0d0f0e'; x.fillRect(0, H - 70, W, 70); x.font = F(700, 22); x.fillStyle = '#fff'; x.fillText('wall street closes at 4pm. st0x doesn\'t.', 60, H - 28); x.fillStyle = '#7ee2a6'; const host = location.host; x.fillText(host, W - 60 - x.measureText(host).width, H - 28);
    const url = c.toDataURL('image/png'), text = `${s.tok} at ${usd(s.usd)}${n.open ? '' : ' while nyse is closed'}${s.gap != null ? `. gap ${pct(s.gap)} vs the share` : ''}. trading 24/7 on st0x`;
    $('#wmList').innerHTML = ''; const box = $('#wm .mbox'); box.classList.add('wide'); box.querySelector('.mh b').textContent = 'share ' + s.tok;
    $('#wmList').innerHTML = `<img class="shot" src="${url}" alt="share card"><div class="mrow"><a class="btn" download="st0x-${esc(s.tok)}.png" href="${url}">[ download png ]</a><a class="btn ghost" target="_blank" rel="noopener" href="https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.origin)}">[ post on 𝕏 ]</a></div><p class="fine" style="margin-top:10px">download the card, then attach it to your post.</p>`;
    box.querySelector('.fine:last-child') && (box.querySelector(':scope > .fine').hidden = true); $('#wm').hidden = false; }

  // ================================================================ console
  const hist = []; let hi = 0, pending = null;
  function log(html, c, raw) { const p = document.createElement('p'); p.className = c || ''; p.innerHTML = raw ? html : esc(html); $('#conLog').appendChild(p); $('#conLog').scrollTop = 1e9; return p; }
  const HELP = [['buy nvda 0.1', 'buy NVDAx with 0.1 SOL (add usdc to pay in USDC, or $20)'], ['sell tsla 50%', 'sell half your TSLAx (or an amount, or all)'], ['price spy', 'live on-chain price and the real share price'], ['gap', 'the biggest gaps between token and share right now'], ['top', "today's biggest movers"], ['chart aapl 4h', 'open a chart (15m, 1h, 4h, 1d)'], ['hours', 'is nyse open? when does it change?'], ['alert nvda > 170', 'ping me when a price crosses (kept in this browser)'], ['alerts / unalert 1', 'list or remove alerts'], ['fav nvda', 'star a stock; starred ones sit on top'], ['share', 'make a png card of the open stock for X'], ['since', 'what it did since nyse closed (or opened)'], ['bag', 'your wallet: SOL, USDC and xStocks'], ['connect / disconnect', 'link or unlink a wallet'], ['clear', 'clear this log']];
  function stockArg(t) { const s = bySym(t); if (!s) { log(`unknown stock "${t}". try nvda, tsla, spy, aapl…`, 'er'); return null; } return s; }
  async function run(line) { const raw = line.trim(); if (!raw) return; log(raw, 'me'); hist.push(raw); hi = hist.length; const [cmd, ...a] = raw.toLowerCase().split(/\s+/);
    if (pending && /^(y|yes|sign|ok)$/.test(cmd)) { const p = pending; pending = null; return p(); } if (pending && /^(n|no|cancel)$/.test(cmd)) { pending = null; return log('cancelled.', 'dim'); } pending = null;
    if (!S.board) return log('the board is still loading…', 'dim');
    switch (cmd) {
      case 'help': case '?': return log(HELP.map(([c, d]) => `${c.padEnd(22)}${d}`).join('\n'), 'dim');
      case 'clear': case 'cls': $('#conLog').innerHTML = ''; return;
      case 'connect': return openWallets();
      case 'disconnect': return disconnect();
      case 'hours': case 'nyse': { const n = nyse(); return log(n.open ? `nyse is open. closes in ${dur(n.next - Date.now())} (${etLabel(n.next)}). st0x is open either way.` : `nyse is closed. opens in ${dur(n.next - Date.now())} (${etLabel(n.next)}). st0x is open right now.`, n.open ? '' : 'ok'); }
      case 'price': case 'p': { const s = stockArg(a[0]); if (!s) return; select(s.mint); return log(`${s.tok}  ${usd(s.usd)}  ${pct(s.ch24)} 24h · share ${s.ref ? usd(s.ref) : '—'} · gap ${pct(s.gap)} · liquidity ${big(s.liq)}`); }
      case 'chart': case 'c': { const s = stockArg(a[0]); if (!s) return; if (TFS[a[1]]) setTf(a[1]); select(s.mint); document.getElementById('chCv').scrollIntoView({ behavior: 'smooth', block: 'center' }); return log(`chart: ${s.tok} ${S.tf}`, 'dim'); }
      case 'top': { const L = S.board.stocks.filter(s => s.ch24 != null).sort((x, y) => y.ch24 - x.ch24); return log([...L.slice(0, 5), ...L.slice(-3)].map(s => `${s.tok.padEnd(8)}${usd(s.usd).padStart(11)}  ${pct(s.ch24)}`).join('\n')); }
      case 'gap': { if (a[0]) { const s = stockArg(a[0]); if (!s) return; return log(`${s.tok} trades at ${usd(s.usd)} on-chain; the share last printed ${usd(s.ref)}${s.refAt ? ' (' + etLabel(Date.parse(s.refAt)) + ')' : ''}. gap ${pct(s.gap)}.`); }
        const L = S.board.stocks.filter(s => s.gap != null).sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap)).slice(0, 6); return log(L.map(s => `${s.tok.padEnd(8)} token ${usd(s.usd).padStart(10)}  share ${usd(s.ref).padStart(10)}  ${pct(s.gap)}`).join('\n')); }
      case 'bag': case 'wallet': case 'portfolio': { if (!S.wallet) { log('connect a wallet first: type connect', 'dim'); return; } await loadBag(); const b = S.bag; if (!b) return; return log([`${num(b.sol, 4)} SOL${b.usdc ? ' · ' + num(b.usdc, 2) + ' USDC' : ''}`, ...b.stocks.map(t => `${t.tok.padEnd(8)}${num(t.amount, 6).padStart(14)}  ${usd(t.usd, 2)}`), `total ${usd(b.totalUsd, 2)}`].join('\n')); }
      case 'buy': case 'sell': { const s = stockArg(a[0]); if (!s) return; let amt = a[1], unit = S.side === cmd ? S.unit : 'SOL';
        if (!amt) return log(`how much? e.g. ${cmd} ${s.sym.toLowerCase()} ${cmd === 'buy' ? '0.1' : '50%'}`, 'dim');
        S.side = cmd; select(s.mint);
        if (cmd === 'buy') { unit = a.includes('usdc') ? 'USDC' : 'SOL'; if (/^\$/.test(amt)) { const d = parseFloat(amt.slice(1)); if (!(d > 0)) return log('bad amount', 'er'); if (a.includes('usdc')) amt = String(d); else { amt = (d / S.board.sol).toFixed(6); log(`$${d} ≈ ${amt} SOL`, 'dim'); } } }
        else { unit = a.includes('usdc') ? 'USDC' : 'SOL'; if (/%$|^all$|^max$/.test(amt)) { if (!S.wallet) return log('connect a wallet first so i can read your balance: type connect', 'dim'); const h = heldOf(s.mint); if (!h || !(h.ui > 0)) return log(`you hold no ${s.tok}.`, 'er'); const p = /%$/.test(amt) ? parseFloat(amt) / 100 : 1; amt = String(+(h.ui * Math.min(1, p)).toFixed(8)); } }
        if (!(parseFloat(amt) > 0)) return log('bad amount', 'er');
        S.unit = unit; $('#tkAmt').value = amt; paintTicket(); log('quoting…', 'dim'); const Q = await getQuote(); if (!Q) return log((S.quote && S.quote.err) || 'no quote', 'er');
        const v = quoteView(Q); const p = log(`${cmd} ${num(v.shares, 6)} ${s.tok} for ${num(v.inUi, 6)} ${v.inSym} · ${usd(v.px)}/share (${pct(v.vs)} vs board) · impact ${v.impact < .01 ? '<0.01' : v.impact.toFixed(2)}% · ${v.route}\n`, '');
        const act = document.createElement('span'); act.className = 'act'; act.innerHTML = `<button>sign</button><button class="no">cancel</button>`; p.appendChild(act);
        pending = () => { act.remove(); return execute(); }; act.children[0].onclick = () => { if (pending) { const f = pending; pending = null; f(); } }; act.children[1].onclick = () => { pending = null; act.remove(); log('cancelled.', 'dim'); };
        if (!S.wallet) log('type y to connect and sign, or press sign.', 'dim'); else log('type y or press sign to approve it in your wallet.', 'dim'); return; }
      case 'alert': { const s = stockArg(a[0]); if (!s) return; let op = a[1], px = parseFloat(String(a[2] ?? a[1]).replace('$', ''));
        if (!(px > 0)) return log('e.g. alert nvda > 170  or  alert tsla < 380', 'dim'); if (op !== '>' && op !== '<') op = px >= s.usd ? '>' : '<';
        const al = addAlert(s, op, px); return log(`alert set: ${s.tok} ${op} ${usd(px)} (now ${usd(s.usd)}). it fires while this tab is open.`, 'ok'); }
      case 'alerts': return log(S.alerts.length ? S.alerts.map((x, i) => `${i + 1}. ${x.tok} ${x.op} ${usd(x.px)}`).join('\n') : 'no alerts. try: alert nvda > 170', 'dim');
      case 'unalert': { if (a[0] === 'all') S.alerts = []; else S.alerts.splice((+a[0] || 0) - 1, 1); saveAlerts(); return log(`${S.alerts.length} alert(s) left.`, 'dim'); }
      case 'fav': case 'star': { const s = stockArg(a[0]); if (!s) return; S.fav.has(s.mint) ? S.fav.delete(s.mint) : S.fav.add(s.mint); SV('st0x-fav', [...S.fav]); paintList(); paintSel(); return log(`${s.tok} ${S.fav.has(s.mint) ? 'starred' : 'unstarred'}.`, 'dim'); }
      case 'share': { if (a[0]) { const s = stockArg(a[0]); if (!s) return; select(s.mint); setTimeout(shareCard, 900); return; } return shareCard(); }
      case 'since': { const v = sinceClose(); return log(v ? `${byMint(S.sel).tok} ${v.kind === 'closed' ? 'since nyse closed' : 'since the open'} (${etLabel(v.at)}): ${pct(v.ch)}` : 'not enough candles for that yet (try the 1h or 15m view).', 'dim'); }
      default: return log(`unknown command "${cmd}". type help.`, 'er'); } }
  function hint() { const v = $('#conIn').value, m = /^(buy|sell|price|p|chart|c|gap)\s+(\S+)$/i.exec(v); if (!m || !S.board) { $('#conHint').textContent = ''; return; } const k = m[2].toUpperCase(), s = S.board.stocks.find(x => x.sym.startsWith(k)); $('#conHint').textContent = s && s.sym !== k ? `tab → ${s.sym.toLowerCase()}` : ''; }

  // ================================================================ wiring
  function setTf(tf) { S.tf = tf; $$('#chTf button').forEach(b => b.classList.toggle('on', b.dataset.tf === tf)); }
  function wire() {
    $('#wlList').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) select(b.dataset.m); });
    $('#pfList').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { S.side = 'sell'; select(b.dataset.m); } });
    $('#wlQ').addEventListener('input', e => { S.q = e.target.value; paintList(); });
    $('#wlSort').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.sort = b.dataset.s; $$('#wlSort button').forEach(x => x.classList.toggle('on', x === b)); paintList(); });
    $('#chTf').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; setTf(b.dataset.tf); loadCandles(); });
    const cv = $('#chCv'); cv.addEventListener('mousemove', chartHover); cv.addEventListener('mouseleave', () => { CH.hover = -1; drawChart(); });
    let rz = 0; new ResizeObserver(() => { cancelAnimationFrame(rz); rz = requestAnimationFrame(drawChart); }).observe(cv.parentElement);
    $('#tkSide').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || S.side === b.dataset.side) return; S.side = b.dataset.side; $('#tkAmt').value = ''; S.quote = null; paintTicket(); });
    $('#tkUnit').addEventListener('click', () => { if (S.side !== 'buy') return; S.unit = S.unit === 'SOL' ? 'USDC' : 'SOL'; paintTicket(); requote(); });
    $('#tkAmt').addEventListener('input', requote);
    $('#tkPct').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const L = legs(); if (!S.wallet) { openWallets(); return; } const h = heldOf(L.pay); if (!h) return; let v = h.ui * (+b.dataset.p / 100); if (L.pay === SOL) v = Math.max(0, Math.min(v, h.ui - .015)); $('#tkAmt').value = v > 0 ? String(+v.toFixed(L.pay === SOL ? 4 : 8)) : ''; requote(); });
    $('#qSlip').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.slip = +b.dataset.b; $$('#qSlip button').forEach(x => x.classList.toggle('on', x === b)); requote(); });
    $('#tkGo').addEventListener('click', () => S.wallet ? execute() : openWallets());
    $('#tbWallet').addEventListener('click', () => S.wallet ? disconnect() : openWallets());
    $('#navWallet').addEventListener('click', () => S.wallet ? disconnect() : openWallets());
    $('#wmList').addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) connectWith(b.dataset.w); });
    $('#wmX').addEventListener('click', () => $('#wm').hidden = true); $('#wm').addEventListener('click', e => { if (e.target.id === 'wm') $('#wm').hidden = true; });
    $('#chStar').addEventListener('click', () => { const m = S.sel; S.fav.has(m) ? S.fav.delete(m) : S.fav.add(m); SV('st0x-fav', [...S.fav]); paintList(); paintSel(); });
    $('#chAlert').addEventListener('click', () => { const s = byMint(S.sel); if (!s) return; const t = +(s.usd * 1.02).toPrecision(4); $('#conIn').value = `alert ${s.sym.toLowerCase()} > ${t}`; $('#conIn').focus({ preventScroll: true }); log('edit the price and press enter to set the alert.', 'dim'); });
    $('#chShare').addEventListener('click', shareCard);
    addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#terminal').scrollIntoView({ block: 'center' }); $('#conIn').focus({ preventScroll: true }); } });
    const ci = $('#conIn'); ci.addEventListener('input', hint);
    ci.addEventListener('keydown', e => { if (e.key === 'Enter') { const v = ci.value; ci.value = ''; hint(); run(v); }
      else if (e.key === 'ArrowUp') { if (hi > 0) { hi--; ci.value = hist[hi] || ''; } e.preventDefault(); } else if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); ci.value = hist[hi] || ''; e.preventDefault(); }
      else if (e.key === 'Tab') { const m = /^(\S+\s+)(\S+)$/.exec(ci.value); if (m && S.board) { const s = S.board.stocks.find(x => x.sym.startsWith(m[2].toUpperCase())); if (s) { ci.value = m[1] + s.sym.toLowerCase() + ' '; hint(); } } e.preventDefault(); } });
    $('#con').addEventListener('click', e => { if (!e.target.closest('button,a')) ci.focus({ preventScroll: true }); });
    log('st0x terminal. live xStocks on solana, any hour, any day.', 'dim'); log('type help for commands. try: price nvda · gap · since · alert tsla > 400 · buy nvda 0.1 · ctrl/⌘ k jumps here', 'dim');
    // silent reconnect for wallets the visitor already trusted
    setTimeout(async () => { const p = window.phantom && window.phantom.solana; if (p && p.connect) { try { const r = await p.connect({ onlyIfTrusted: true }); if (r && r.publicKey) onConnect(r.publicKey.toString(), p); } catch { } } }, 900);
  }
  function start() { wire(); loadBoard(); setInterval(() => { if (!document.hidden) loadBoard(); }, 20000); setInterval(() => { if (!document.hidden && S.sel) loadCandles(); }, 90000); setInterval(() => { if (S.quote && !S.quote.err && Date.now() - S.quote.at > 15000) requote(); }, 5000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
