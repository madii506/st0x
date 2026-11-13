/* st0x page: intro, hero city, the week, tape, gap table, numbers, flow, token, faq, scroll and motion. */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const X = window.S0, { S, esc, usd, big, pct, cls, num } = X;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introOn = false; try { introOn = !sessionStorage.getItem('st0x-intro') && !reduce; } catch { introOn = !reduce; }
  if (!introOn) document.documentElement.classList.add('nointro'); else document.body.classList.add('locked');
  gsap.registerPlugin(ScrollTrigger);

  // ---------------------------------------------------------------- smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) { lenis = new Lenis({ lerp: .1, wheelMultiplier: 1 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); if (introOn) lenis.stop(); }
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const id = a.getAttribute('href'); const t = id === '#top' ? 0 : $(id); if (t === null) return; e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: id === '#top' ? 0 : -64, duration: 1.4 }) : (t === 0 ? scrollTo(0, 0) : t.scrollIntoView({ behavior: 'smooth' })); });
  const nav = $('#nav'), prog = $('#prog'); const onScroll = () => { nav.classList.toggle('solid', scrollY > 40); const m = document.documentElement.scrollHeight - innerHeight; prog.style.setProperty('--p', m > 0 ? (scrollY / m).toFixed(4) : 0); }; addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------------------------------------------------------------- ascii decode: characters scramble, then settle
  const GLY = '.:-=+*#%@/\\|_<>01x';
  function decode(el, ms = 900, delay = 0) { const nodes = []; const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) { if (c.nodeValue.length) nodes.push({ n: c, t: c.nodeValue }); } else if (c.nodeType === 1 && c.tagName !== 'I') walk(c); } }; walk(el);
    const total = nodes.reduce((a, x) => a + x.t.length, 0); if (!total) return; nodes.forEach(x => x.n.nodeValue = x.t.replace(/\S/g, ' ')); el.style.visibility = 'visible';
    const t0 = performance.now() + delay; const step = now => { const p = Math.max(0, Math.min(1, (now - t0) / ms)); let i = 0;
      for (const x of nodes) { let s = ''; for (const ch of x.t) { const k = i / total, edge = p * 1.25 - k * 1.0; s += ch === ' ' ? ' ' : edge >= .25 ? ch : edge > 0 ? GLY[(Math.random() * GLY.length) | 0] : ' '; i++; } x.n.nodeValue = s; }
      if (p < 1) requestAnimationFrame(step); else nodes.forEach(x => x.n.nodeValue = x.t); }; requestAnimationFrame(step); }

  // ---------------------------------------------------------------- hero city + intro
  const hero = $('#hero'), cityCv = $('#cityCv'); let G = null, stopLive = null, lastW = 0, lastH = 0;
  const fsFor = w => w < 560 ? 9 : w < 900 ? 10.5 : w < 1400 ? 12 : 13;
  function heroFade() { const r = $('.hero-in').getBoundingClientRect(), h = hero.getBoundingClientRect(), cx = r.left - h.left + r.width / 2, cy = r.top - h.top + r.height / 2, ax = r.width / 2 + Math.max(60, h.width * .06), ay = r.height / 2 + Math.max(70, h.height * .1);
    return (x, y) => { const dx = (x - cx) / ax, dy = (y - cy) / ay, q = Math.sqrt(dx * dx + dy * dy), t = Math.min(1, Math.max(0, (q - .82) / .5)); return t * t * (3 - 2 * t); }; }
  function buildCity() { const W = hero.clientWidth, H = hero.clientHeight; lastW = W; lastH = H; G = City.build(W, H, fsFor(W), heroFade()); if (stopLive) stopLive(); stopLive = City.live(cityCv, G); return G; }
  addEventListener('resize', () => { clearTimeout(buildCity.t); buildCity.t = setTimeout(() => { if (!G) return; const W = hero.clientWidth, H = hero.clientHeight; if (W !== lastW || Math.abs(H - lastH) > 140) buildCity(); }, 250); });

  function heroIn(fast) { const l1 = $('#h1 .l1'), l2 = $('#h1 .l2'); l1.style.visibility = l2.style.visibility = 'hidden';
    decode(l1, fast ? 500 : 800, 0); decode(l2, fast ? 450 : 650, fast ? 250 : 520);
    gsap.fromTo(['#heroStatus', '.hero-in .cta', '.scrollhint'], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1, delay: fast ? .35 : .9 }); }

  async function boot() {
    try { await document.fonts.load('600 12px JB'); } catch { }
    try { await City.load(); } catch { /* the page still works without the city */ }
    if (window.City && G === null) { try { buildCity(); } catch (e) { console.error(e); } }
    if (!introOn) { heroIn(true); return; }
    const icv = $('#introCv'), cur = $('#introCur'), g = City.build(innerWidth, hero.clientHeight || innerHeight, fsFor(innerWidth), heroFade());
    let blink = gsap.to(cur, { opacity: 0, duration: .01, repeat: 3, yoyo: true, repeatDelay: .13, ease: 'none' });
    let finished = false; const end = () => { if (finished) return; finished = true; try { sessionStorage.setItem('st0x-intro', '1'); } catch { }
      blink.kill(); gsap.set(cur, { opacity: 1 }); const tgt = $('#h1Cur').getBoundingClientRect(), now = cur.getBoundingClientRect();
      // the cursor flies into the headline and becomes its cursor
      const tl = gsap.timeline({ onComplete: () => { $('#intro').remove(); document.body.classList.remove('locked'); lenis && lenis.start(); ScrollTrigger.refresh(); } });
      tl.to(icv, { filter: 'blur(1.1px)', duration: .55, ease: 'power2.inOut' }, 0)
        .to(cur, { x: tgt.left + tgt.width / 2 - (now.left + now.width / 2), y: tgt.top + tgt.height / 2 - (now.top + now.height / 2), scaleX: tgt.width / now.width, scaleY: tgt.height / now.height, duration: .75, ease: 'expo.inOut' }, .05)
        .add(() => heroIn(false), .45)
        .to('#intro', { backgroundColor: 'rgba(255,255,255,0)', duration: .5 }, .35).to(icv, { opacity: 0, duration: .45 }, .55).to(cur, { opacity: 0, duration: .15 }, .8); };
    const run = City.intro(icv, g, end, cur);
    const skip = () => { run.skip(); }; ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, skip, { once: true, passive: true }));
  }

  // ---------------------------------------------------------------- live NYSE status (hero, nav, terminal bar)
  function tick() { const n = X.nyse(), left = n.next ? X.dur(n.next - Date.now()) : '—';
    const hs = $('#heroStatus .nyse'); hs.className = 'st nyse ' + (n.open ? 'open' : 'closed'); hs.querySelector('b').textContent = n.open ? 'open' : 'closed'; hs.querySelector('em').textContent = n.next ? (n.open ? `closes in ${left}` : `opens in ${left}`) : '';
    const mk = $('#navMk'); mk.className = 'mk ' + (n.open ? 'open' : 'closed'); mk.querySelector('b').textContent = n.open ? 'open' : 'closed';
    $('#tbNyse').textContent = 'nyse ' + (n.open ? 'open · closes ' : 'closed · opens ') + (n.next ? X.etLabel(n.next) : '');
    paintNow(); paintClocks(n); }
  const CLK = [['new york', 'America/New_York'], ['london', 'Europe/London'], ['dubai', 'Asia/Dubai'], ['tokyo', 'Asia/Tokyo']];
  const fmt = {}; CLK.forEach(([, z]) => fmt[z] = new Intl.DateTimeFormat('en-GB', { timeZone: z, hour: '2-digit', minute: '2-digit', weekday: 'short' })); const fmtMe = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', weekday: 'short' });
  function paintClocks(n) { const el = $('#clocks'); if (!el) return; const d = new Date();
    el.innerHTML = CLK.map(([c, z], i) => `<span><i class="${i === 0 && n.open ? 'on' : ''}"></i>${c} <b>${fmt[z].format(d).toLowerCase()}</b></span>`).join('') + `<span><i class="on"></i>you <b>${fmtMe.format(d).toLowerCase()}</b> · st0x open</span>`; }
  async function loadHours() { try { const r = await fetch('/api/x?a=hours'); const j = await r.json(); if (j.schedule) X.setSchedule(j.schedule); } catch { } tick(); paintHol(); }

  // ---------------------------------------------------------------- the week: 168 cells
  const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], cells = [];
  function buildWeek() { $('#wkDays').innerHTML = DAYS.map(d => `<span>${d}</span>`).join(''); $('#wkHours').innerHTML = Array.from({ length: 24 }, (_, h) => `<span>${String(h).padStart(2, '0')}</span>`).join('');
    const grid = $('#wkGrid'); let html = ''; for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) html += `<i class="cell" data-d="${d}" data-h="${h}"></i>`; grid.innerHTML = html;
    $$('#wkGrid .cell').forEach(c => cells.push({ el: c, d: +c.dataset.d, h: +c.dataset.h, nyse: +c.dataset.d < 5 && +c.dataset.h >= 9 && +c.dataset.h < 16, half: +c.dataset.d < 5 && +c.dataset.h === 9 }));
    cells.filter(c => c.half).forEach(c => c.el.style.setProperty('--half', '1')); }
  const NY = () => cells.filter(c => c.nyse);
  function paintWeek(p) { const ny = NY(), k1 = Math.round(Math.min(1, p / .4) * ny.length), k2 = Math.round(Math.max(0, Math.min(1, (p - .48) / .46)) * 168);
    ny.forEach((c, i) => c.el.classList.toggle('n', i < k1)); cells.forEach((c, i) => c.el.classList.toggle('o', i < k2));
    const nh = ny.slice(0, k1).reduce((a, c) => a + (c.half ? .5 : 1), 0); $('#wkNyse').textContent = nh.toFixed(1) + 'h'; $('#wkNyseP').textContent = (nh / 168 * 100).toFixed(1) + '% of the week';
    $('#wkOurs').textContent = k2 + 'h'; $('#wkOursP').textContent = (k2 / 168 * 100).toFixed(1) + '% of the week';
    const line = $('#wkLine'), phase = p > .48 ? 2 : 1; if (line.dataset.p != phase) { line.dataset.p = phase; line.innerHTML = phase === 2 ? 'st0x trades <b class="green">all 168</b>. weekends, nights, holidays.' : 'wall street trades <b class="grey">32.5</b> of them.'; } }
  function paintNow() { if (!cells.length) return; const p = X.et(Date.now()), d = (p.wd + 6) % 7, h = p.h; cells.forEach(c => c.el.classList.toggle('now', c.d === d && c.h === h));
    $('#wkNow').textContent = `${DAYS[d]} ${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')} et`; const n = X.nyse(); $('#wkNowS').textContent = n.open ? 'nyse open, st0x open' : 'nyse closed, st0x open'; }
  function paintHol() { const n = X.nyse(); if (!n.hol) return; const p = n.hol.p, name = X.HOLNAME[n.hol.k] || 'market holiday', MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    $('#wkHol').textContent = `next time nyse ${n.hol.early ? 'closes early' : 'stays shut on a weekday'}: ${DAYS[(p.wd + 6) % 7]} ${MON[p.m - 1]} ${p.d}, ${name}. st0x won't notice.`; }

  // ---------------------------------------------------------------- tape, gap table, numbers (all from the live board)
  function paintTape(b) { const L = b.stocks.slice(0, 30); const one = L.map(s => `<span class="tp"><img src="${esc(s.icon)}" alt="" loading="lazy"><b>${esc(s.tok)}</b><em>${usd(s.usd)}</em><span class="${cls(s.ch24)}">${s.ch24 >= 0 ? '▲' : '▼'} ${pct(s.ch24)}</span></span>`).join(''); $('#tapeRun').innerHTML = one + one; }
  function paintGap(b) { const n = X.nyse(); $('#gapLede').innerHTML = n.open ? 'nyse is open, so tokens and shares move together. come back after 4pm et and watch them drift apart.' : 'nyse is closed. the share price is frozen at its last print. the tokens keep trading. this is the gap, live.';
    const L = b.stocks.filter(s => s.gap != null).slice(0, 14); if (!L.length) { $('#gapTbl').innerHTML = '<div class="empty">no reference prices right now.</div>'; return; }
    const mx = Math.max(1, ...L.map(s => Math.abs(s.gap)));
    $('#gapTbl').innerHTML = `<div class="gr h"><span>stock</span><span>token (on-chain)</span><span>share (last print)</span><span>gap</span><span>share updated</span></div>` + L.map(s => { const w = Math.min(50, Math.abs(s.gap) / mx * 50);
      return `<div class="gr clk" data-m="${s.mint}"><span class="nm"><img src="${esc(s.icon)}" alt="" loading="lazy"><span><b>${esc(s.tok)}</b></span></span><span>${usd(s.usd)}</span><span>${usd(s.ref)}</span><span style="display:grid;grid-template-columns:1fr 64px;gap:10px;align-items:center"><span class="bar"><i class="${s.gap < 0 ? 'neg' : ''}" style="${s.gap < 0 ? `right:50%;left:auto;width:${w}%` : `width:${w}%`}"></i></span><span class="gv ${cls(s.gap)}">${pct(s.gap)}</span></span><span class="at">${s.refAt ? X.etLabel(Date.parse(s.refAt)) : '—'}</span></div>`; }).join(''); }

  // ---------------------------------------------------------------- the board: a squarified heatmap sized by liquidity
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
      return `<div class="ht ${c}" data-m="${s.mint}" style="left:${(x / W * 100).toFixed(3)}%;top:${(y / H * 100).toFixed(3)}%;width:${(w / W * 100).toFixed(3)}%;height:${(h / H * 100).toFixed(3)}%;background:${bg};color:${fg}" title="${esc(s.tok)} ${usd(s.usd)} ${pct(v)}"><b>${esc(s.tok)}</b><span><em>${pct(v)}</em><br><small>${usd(s.usd)} · ${big(s.liq)}</small></span></div>`; }).join('');
    if (!hmDone && ScrollTrigger.isInViewport(box, .2)) { hmDone = true; gsap.from('#hm .ht', { opacity: 0, scale: .7, duration: .6, ease: 'back.out(1.6)', stagger: { each: .012 } }); } }

  let numsDone = false;
  function paintNums(b) { const set = (k, v) => { const el = $(`[data-n="${k}"]`); if (el) el.dataset.v = v; }; set('count', b.count); set('liq', b.liq); set('vol', b.vol24);
    if (numsDone) { $('[data-n="count"]').textContent = b.count; $('[data-n="liq"]').textContent = big(b.liq); $('[data-n="vol"]').textContent = big(b.vol24); } }
  function countNums() { if (numsDone) return; numsDone = true; $$('[data-n]').forEach(el => { const v = +el.dataset.v; if (!isFinite(v)) return; const o = { v: 0 }, f = el.dataset.n === 'count' ? x => Math.round(x) : x => big(x);
    gsap.to(o, { v, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = f(o.v) }); }); }

  // ---------------------------------------------------------------- the token (only once it exists)
  async function loadCfg() { let c = {}; try { c = await (await fetch('/api/x?a=cfg')).json(); } catch { }
    if (c.x) { $('#heroX').href = c.x; $('#heroX').hidden = false; $('#tokX').href = c.x; $('#tokX').hidden = false; }
    if (!c.ca) return; const ca = c.ca; $('#token').hidden = false; $('#faqIdx').textContent = '07'; $('#tokCa').textContent = ca;
    $('#tokBuy').href = $('#heroBuy').href = `https://pump.fun/coin/${ca}`; $('#heroBuy').hidden = false; $('#tokChart').href = `https://dexscreener.com/solana/${ca}`;
    $('#tokCopy').onclick = async () => { try { await navigator.clipboard.writeText(ca); X.toast('contract address copied'); } catch { X.toast(ca); } };
    const px = async () => { try { const d = await (await fetch(`https://api.dexscreener.com/tokens/v1/solana/${ca}`)).json(); const p = (Array.isArray(d) ? d : []).sort((a, b) => ((b.liquidity || {}).usd || 0) - ((a.liquidity || {}).usd || 0))[0]; if (!p) return;
      $('#tokPx').textContent = usd(+p.priceUsd); $('#tokMc').textContent = big(p.marketCap || p.fdv); const ch = (p.priceChange || {}).h24; $('#tokCh').textContent = pct(ch); $('#tokCh').className = cls(ch); } catch { } };
    px(); setInterval(px, 30000); ScrollTrigger.refresh(); }

  // ---------------------------------------------------------------- footer wordmark
  const WM = ['     _    ___', ' ___| |_ / _ \\__  __', '/ __| __| | | \\ \\/ /', '\\__ \\ |_| |_| |>  <', '|___/\\__|\\___//_/\\_\\'];
  $('#footWm').innerHTML = WM.map(l => [...l].map((c, i) => i >= 8 && i < 15 && c !== ' ' ? `<b>${esc(c)}</b>` : esc(c)).join('')).join('\n');

  // ---------------------------------------------------------------- motion
  function motion() {
    // the week fills as you scroll (pinned on wide screens)
    const wide = innerWidth > 860 && innerHeight > 640;
    ScrollTrigger.create({ refreshPriority: 1, trigger: '#week', start: wide ? 'top 64px' : 'top 75%', end: wide ? '+=1300' : 'bottom 45%', pin: wide ? '#week' : false, scrub: .4, anticipatePin: 1, onUpdate: s => paintWeek(s.progress) });
    // a weekend on st0x: the panels scroll sideways (pinned on wide screens)
    const track = $('#stTrack');
    if (wide) { const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { refreshPriority: 1, trigger: '#story', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: s => { const b = $('#stBar'); if (b) b.style.transform = `scaleX(${s.progress})`; } } });
      $$('.sp').forEach(p => ScrollTrigger.create({ trigger: p, containerAnimation: tw, start: 'left 85%', once: true, onEnter: () => decode(p.querySelector('.sp-t'), 600) })); }
    else $$('.sp').forEach(p => ScrollTrigger.create({ trigger: p, start: 'top 85%', once: true, onEnter: () => decode(p.querySelector('.sp-t'), 600) }));
    // heatmap tiles pop in the first time the board is seen
    ScrollTrigger.create({ trigger: '#hm', start: 'top 80%', once: true, onEnter: () => { if (S.board && !hmDone) { hmDone = true; paintHeat(S.board); gsap.from('#hm .ht', { opacity: 0, scale: .7, duration: .6, ease: 'back.out(1.6)', stagger: { each: .012 } }); } } });
    // hero: the city recedes as you scroll
    gsap.to('.hero-in', { y: -90, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { cityCv.style.setProperty('--hb', (1.1 + s.progress * 4).toFixed(2) + 'px'); cityCv.style.setProperty('--hs', (1 + s.progress * .07).toFixed(3)); cityCv.style.setProperty('--hy', (s.progress * 60).toFixed(1) + 'px'); } });
    // headings decode when they arrive
    $$('h2.scr').forEach(h => { h.style.visibility = 'hidden'; ScrollTrigger.create({ trigger: h, start: 'top 86%', once: true, onEnter: () => decode(h, 700) }); });
    // reveal blocks
    const rv = ['.clocks', '.hm-ctl', '.lede', '.term', '.gap-tbl', '.fnode', '.farrow', '.num', '.rk', '.faq details', '.tok', '.wk-legend', '.wk-hol', '#gap .fine'];
    rv.forEach(s => $$(s).forEach(el => el.classList.add('rv')));
    ScrollTrigger.batch('.rv', { start: 'top 90%', once: true, onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .07, overwrite: true }) });
    // numbers count up
    ScrollTrigger.create({ trigger: '#nums', start: 'top 85%', once: true, onEnter: () => { if (S.board) countNums(); else X.on(() => countNums()); } });
    // a packet travels along each arrow
    $$('.farrow').forEach((a, i) => { const d = document.createElement('i'); d.className = 'dot'; a.appendChild(d); gsap.fromTo(d, { left: '0%', opacity: 0 }, { left: 'calc(100% - 7px)', opacity: 1, duration: 1.3, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.4, delay: i * .45, keyframes: { opacity: [0, 1, 1, 0] } }); });
    // big type bands that run faster when you scroll faster
    $$('.band-run').forEach((el, i) => { let x = 0, w = 0; const dir = i % 2 ? 1 : -1; const measure = () => { w = el.scrollWidth / 2; }; measure(); addEventListener('resize', measure); addEventListener('load', measure);
      gsap.ticker.add((t, dt) => { const v = lenis ? Math.abs(lenis.velocity || 0) : 0; x += dir * (0.04 + v * 0.02) * dt; if (w) { if (x <= -w) x += w; if (x > 0) x -= w; } el.style.transform = `translate3d(${x}px,0,0)`; }); });
    // footer wordmark decodes
    ScrollTrigger.create({ trigger: '#foot', start: 'top 85%', once: true, onEnter: () => decode($('#footWm'), 1100) });
  }

  // ---------------------------------------------------------------- go
  buildWeek(); paintWeek(0); loadHours(); setInterval(tick, 1000); setInterval(loadHours, 10 * 60e3);
  X.on(b => { paintTape(b); paintGap(b); paintNums(b); paintHeat(b); $$('[data-live=count]').forEach(e => e.textContent = b.count); });
  $('#hmCtl').addEventListener('click', e => { const bt = e.target.closest('button'); if (!bt) return; hmMode = bt.dataset.c; $$('#hmCtl button').forEach(x => x.classList.toggle('on', x === bt)); paintHeat(S.board); });
  $('#hm').addEventListener('click', e => { const t = e.target.closest('[data-m]'); if (!t) return; X.select(t.dataset.m); const tt = $('#terminal'); lenis ? lenis.scrollTo(tt, { offset: -64 }) : tt.scrollIntoView({ behavior: 'smooth' }); });
  addEventListener('resize', () => { clearTimeout(paintHeat.t); paintHeat.t = setTimeout(() => S.board && paintHeat(S.board), 200); });
  $('#gapTbl').addEventListener('click', e => { const r = e.target.closest('[data-m]'); if (!r) return; X.select(r.dataset.m); const t = $('#terminal'); lenis ? lenis.scrollTo(t, { offset: -64 }) : t.scrollIntoView({ behavior: 'smooth' }); });
  motion(); loadCfg(); boot();
  addEventListener('load', () => ScrollTrigger.refresh());
})();
