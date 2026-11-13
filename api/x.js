// st0x API — everything the terminal reads, from public sources only. Nothing here holds keys or funds:
// every trade is a Jupiter transaction the visitor signs in their own wallet.
// GET a=board · a=candles&mint=&tf= · a=hours · a=wallet&addr= · a=tx&sig= · a=cfg       POST a=send {tx}
const SEED = require('./stocks.json');

const JUP = 'https://lite-api.jup.ag';
const SOL = 'So11111111111111111111111111111111111111112', USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const T22 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', TOK = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const RPCS = [process.env.RPC_URL, 'https://solana-rpc.publicnode.com', 'https://api.mainnet-beta.solana.com'].filter(Boolean);
const MIN_LIQ = 1500;

const out = (res, code, b, cache) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', cache || 'no-store'); res.end(JSON.stringify(b)); };
const body = req => new Promise(ok => { if (req.body) return ok(typeof req.body === 'string' ? JSON.parse(req.body) : req.body); let d = ''; req.on('data', c => d += c); req.on('end', () => { try { ok(JSON.parse(d || '{}')); } catch { ok({}); } }); });
const B58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
async function getJ(url, ms = 9000, opts) { const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(ms), headers: { accept: 'application/json', ...(opts && opts.headers) } }); if (!r.ok) throw new Error(r.status + ' from ' + url.split('/')[2]); return r.json(); }
const cache = new Map();
async function memo(key, ttl, fn) { const c = cache.get(key); if (c && c.v !== undefined && Date.now() - c.t < ttl) return c.v; if (c && c.p) return c.p;
  const p = fn().then(v => { cache.set(key, { t: Date.now(), v }); return v; }, e => { if (c && c.v !== undefined) { cache.set(key, { t: c.t, v: c.v }); return c.v; } cache.delete(key); throw e; });
  cache.set(key, { ...(c || { t: 0 }), p }); return p; }
async function rpc(method, params) { let last; for (const u of RPCS) { try { const r = await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(12000) });
  if (!r.ok) { last = new Error('rpc ' + r.status); continue; } const j = await r.json(); if (j.error) { last = new Error(j.error.message || 'rpc error'); continue; } return j.result; } catch (e) { last = e; } } throw last || new Error('rpc unavailable'); }

// ---------------------------------------------------------------- the universe: every verified xStock on Solana
const FUNDS = new Set(['SPY', 'QQQ', 'TQQQ', 'VTI', 'VOO', 'IWM', 'IJR', 'TLT', 'TBLL', 'SCHF', 'IEMG', 'DIA', 'GLD', 'SLV', 'GOLD', 'IAU', 'SMH', 'XLK', 'XLF', 'XLE', 'ARKK', 'IBIT']);
const universe = () => memo('uni', 30 * 60e3, async () => {
  const by = Object.fromEntries(SEED.map(s => [s.mint, { ...s }]));
  try { const L = await getJ(`${JUP}/tokens/v2/tag?query=verified`, 15000);
    for (const t of Array.isArray(L) ? L : []) { if (!t.id || !/^Xs/.test(t.id)) continue; const m = /^(.*?)\s*xStock\s*$/i.exec(String(t.name || '').trim()); if (!m) continue;
      const sym = String(t.symbol || '').replace(/x$/, '').toUpperCase(); if (!/^[A-Z0-9.]{1,8}$/.test(sym)) continue;
      by[t.id] = Object.assign(by[t.id] || { sym, tok: t.symbol, mint: t.id, name: m[1].trim(), kind: FUNDS.has(sym) ? 'fund' : 'stock' }, { icon: t.icon || null }); } } catch { /* the seed list still works */ }
  return Object.values(by); });

async function search(mints) { const o = {};
  for (let i = 0; i < mints.length; i += 90) { try { const j = await getJ(`${JUP}/tokens/v2/search?query=${mints.slice(i, i + 90).join(',')}`, 12000);
    for (const t of j || []) { const s = t.stats24h || {}; o[t.id] = { icon: t.icon || null, decimals: t.decimals, usd: t.usdPrice ?? null, ch24: s.priceChange ?? null, liq: t.liquidity ?? null, mcap: t.mcap ?? null, holders: t.holderCount ?? null, vol24: (s.buyVolume || 0) + (s.sellVolume || 0), traders24: s.numTraders ?? null, program: t.tokenProgram || null }; } } catch { } }
  return o; }
async function prices(mints) { const o = {};
  for (let i = 0; i < mints.length; i += 50) { try { const j = await getJ(`${JUP}/price/v3?ids=${mints.slice(i, i + 50).join(',')}`, 9000);
    for (const [m, v] of Object.entries(j || {})) if (v) o[m] = { usd: v.usdPrice ?? null, ch24: v.priceChange24h ?? null, liq: v.liquidity ?? null, decimals: v.decimals, ref: v.stockData && v.stockData.price ? { price: +v.stockData.price, at: v.stockData.updatedAt || null, mcap: v.stockData.mcap || null } : null, mult: v.scaledUiConfig ? +v.scaledUiConfig.multiplier || null : null }; } catch { } }
  return o; }

// the board: live price, 24h move, liquidity, and the gap between the on-chain price and the reference price of the real share
const board = () => memo('board', 20000, async () => {
  const U = await universe(), mints = U.map(s => s.mint);
  const JUPM = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', PYTHM = 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3';
  const [S, P] = await Promise.all([memo('search', 120000, () => search([SOL, JUPM, PYTHM, ...mints])), prices([SOL, ...mints])]);
  const rows = U.map(s => { const a = S[s.mint] || {}, p = P[s.mint] || {}; const usd = p.usd ?? a.usd ?? null, ref = p.ref;
    return { sym: s.sym, tok: s.tok, name: s.name, mint: s.mint, kind: s.kind, icon: a.icon || s.icon || `https://xstocks-metadata.backed.fi/logos/tokens/${s.tok}.png`, decimals: a.decimals ?? p.decimals ?? 8,
      usd, ch24: p.ch24 ?? a.ch24 ?? null, liq: p.liq ?? a.liq ?? null, vol24: a.vol24 ?? null, holders: a.holders ?? null, traders24: a.traders24 ?? null,
      ref: ref ? ref.price : null, refAt: ref ? ref.at : null, gap: usd && ref && ref.price ? (usd / ref.price - 1) * 100 : null, mult: p.mult || null }; })
    .filter(r => r.usd && (r.liq || 0) >= MIN_LIQ).sort((a, b) => (b.liq || 0) - (a.liq || 0));
  if (!rows.length) throw new Error('no prices right now');
  const sol = (P[SOL] && P[SOL].usd) || (S[SOL] && S[SOL].usd) || null;
  const brands = { solana: (S[SOL] || {}).icon || null, jupiter: (S[JUPM] || {}).icon || null, pyth: (S[PYTHM] || {}).icon || null };
  return { at: Date.now(), brands, sol, count: rows.length, listed: U.length, liq: rows.reduce((t, r) => t + (r.liq || 0), 0), vol24: rows.reduce((t, r) => t + (r.vol24 || 0), 0), holders: rows.reduce((t, r) => t + (r.holders || 0), 0), stocks: rows }; });

// ---------------------------------------------------------------- candles: the most liquid pool, from GeckoTerminal
const TF = { '15m': ['minute', 15, 200], '1h': ['hour', 1, 200], '4h': ['hour', 4, 180], '1d': ['day', 1, 180] };
const poolOf = mint => memo('pool:' + mint, 30 * 60e3, async () => { const d = await getJ(`https://api.dexscreener.com/tokens/v1/solana/${mint}`, 8000); let best = null;
  for (const p of Array.isArray(d) ? d : []) { if (!p.baseToken || (p.baseToken.address !== mint && (p.quoteToken || {}).address !== mint)) continue; const liq = (p.liquidity || {}).usd || 0; if (!best || liq > best.liq) best = { addr: p.pairAddress, liq, dex: p.dexId, quote: p.baseToken.address === mint ? (p.quoteToken || {}).symbol : p.baseToken.symbol }; }
  if (!best) throw new Error('no pool found for this stock'); return best; });
async function candles(mint, tf) { if (!B58.test(mint)) throw new Error('bad mint'); const f = TF[tf] || TF['1h'];
  return memo(`k:${mint}:${tf}`, tf === '15m' ? 45000 : 90000, async () => { const pool = await poolOf(mint);
    const g = await getJ(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${pool.addr}/ohlcv/${f[0]}?aggregate=${f[1]}&limit=${f[2]}&currency=usd&token=${mint}`, 9000);
    const rows = ((g.data && g.data.attributes && g.data.attributes.ohlcv_list) || []).map(x => ({ t: x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4], v: +x[5] })).filter(r => r.c > 0).sort((a, b) => a.t - b.t);
    return { mint, tf: TF[tf] ? tf : '1h', pool: pool.addr, dex: pool.dex, quote: pool.quote, rows }; }); }


// ---------------------------------------------------------------- recent on-chain trades in the most liquid pool (GeckoTerminal)
async function trades(mint) { if (!B58.test(mint)) throw new Error('bad mint');
  return memo('tr:' + mint, 20000, async () => { const pool = await poolOf(mint);
    const g = await getJ(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${pool.addr}/trades`, 9000);
    const rows = (g.data || []).slice(0, 60).map(x => { const t = x.attributes || {}, buy = t.kind === 'buy', stockIsTo = t.to_token_address === mint, amt = stockIsTo ? +t.to_token_amount : +t.from_token_amount;
      const px = stockIsTo ? +t.price_to_in_usd : +t.price_from_in_usd; return { t: Date.parse(t.block_timestamp), side: stockIsTo ? 'buy' : 'sell', usd: +t.volume_in_usd || null, amount: amt || null, price: px || null, tx: t.tx_hash || null, wallet: t.tx_from_address || null }; })
      .filter(r => r.t && r.usd);
    return { mint, pool: pool.addr, dex: pool.dex, rows }; }); }

// ---------------------------------------------------------------- market hours: Pyth publishes the NYSE session schedule, holidays included
const hours = () => memo('hours', 5 * 60e3, async () => { const L = await getJ('https://hermes.pyth.network/v2/price_feeds?query=SPY&asset_type=equity', 8000);
  const f = (L || []).find(x => x.attributes && x.attributes.symbol === 'Equity.US.SPY/USD') || (L || [])[0]; if (!f) throw new Error('no schedule');
  return { at: Date.now(), source: 'pyth', schedule: f.attributes.schedule, open: f.market_hours ? !!f.market_hours.is_open : null, nextOpen: f.market_hours ? f.market_hours.next_open : null, nextClose: f.market_hours ? f.market_hours.next_close : null }; });

// ---------------------------------------------------------------- a wallet: SOL and every xStock it holds
async function wallet(addr) { if (!B58.test(addr || '')) throw new Error('bad wallet address'); const B = await board().catch(() => null), by = Object.fromEntries(((B && B.stocks) || []).map(s => [s.mint, s]));
  const [bal, a, b] = await Promise.all([rpc('getBalance', [addr, { commitment: 'confirmed' }]), rpc('getTokenAccountsByOwner', [addr, { programId: T22 }, { encoding: 'jsonParsed', commitment: 'confirmed' }]), rpc('getTokenAccountsByOwner', [addr, { programId: TOK }, { encoding: 'jsonParsed', commitment: 'confirmed' }])]);
  const held = {}; for (const x of [...(a.value || []), ...(b.value || [])]) { const i = x.account.data.parsed.info, ui = +(i.tokenAmount.uiAmountString || 0); if (ui > 0) held[i.mint] = { ui: (held[i.mint] ? held[i.mint].ui : 0) + ui, raw: String(BigInt(i.tokenAmount.amount) + BigInt(held[i.mint] ? held[i.mint].raw : 0)), dec: i.tokenAmount.decimals }; }
  const sol = (bal.value || 0) / 1e9, solUsd = B && B.sol ? sol * B.sol : null;
  const stocks = Object.entries(held).filter(([m]) => by[m]).map(([m, h]) => ({ mint: m, sym: by[m].sym, tok: by[m].tok, icon: by[m].icon, amount: h.ui, raw: h.raw, decimals: h.dec, usd: by[m].usd ? h.ui * by[m].usd : null })).sort((x, y) => (y.usd || 0) - (x.usd || 0));
  const usdc = held[USDC] ? held[USDC].ui : 0;
  return { wallet: addr, sol, solUsd, usdc, stocks, totalUsd: (solUsd || 0) + usdc + stocks.reduce((t, s) => t + (s.usd || 0), 0) }; }

async function txStatus(sig) { if (!/^[1-9A-HJ-NP-Za-km-z]{60,100}$/.test(sig || '')) throw new Error('bad signature'); const r = await rpc('getSignatureStatuses', [[sig], { searchTransactionHistory: false }]); const s = (r.value || [])[0];
  return s ? { found: true, err: s.err, status: s.confirmationStatus || null } : { found: false }; }
async function send(req) { const b = await body(req), tx = String(b.tx || ''); if (!/^[A-Za-z0-9+/=]{100,2000}$/.test(tx)) throw new Error('nothing to send');
  return { sig: await rpc('sendTransaction', [tx, { encoding: 'base64', skipPreflight: false, maxRetries: 3, preflightCommitment: 'confirmed' }]) }; }

const cfg = () => ({ ca: B58.test(process.env.ST0X_CA || '') ? process.env.ST0X_CA : null, x: /^https:\/\/(x|twitter)\.com\/\w+/.test(process.env.ST0X_X || '') ? process.env.ST0X_X : null });

module.exports = async (req, res) => { const q = new URL(req.url, 'http://x').searchParams, a = q.get('a'); res.setHeader('access-control-allow-origin', '*');
  try {
    if (a === 'board') return out(res, 200, await board(), 's-maxage=15, stale-while-revalidate=60');
    if (a === 'candles') return out(res, 200, await candles(String(q.get('mint')), String(q.get('tf') || '1h')), 's-maxage=45, stale-while-revalidate=120');
    if (a === 'hours') return out(res, 200, await hours(), 's-maxage=300, stale-while-revalidate=900');
    if (a === 'trades') return out(res, 200, await trades(String(q.get('mint'))), 's-maxage=15, stale-while-revalidate=45');
    if (a === 'wallet') return out(res, 200, await wallet(q.get('addr')));
    if (a === 'tx') return out(res, 200, await txStatus(q.get('sig')));
    if (a === 'cfg') return out(res, 200, cfg(), 's-maxage=60');
    if (req.method === 'POST' && a === 'send') return out(res, 200, await send(req));
    return out(res, 404, { error: 'unknown action' });
  } catch (e) { return out(res, 400, { error: e.message || String(e) }); } };
module.exports._t = { board, candles, hours, wallet, cache };
