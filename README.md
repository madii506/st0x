# st0x

wall street closes at 4pm. st0x doesn't.

A 24/7 terminal for tokenized stocks (xStocks) on Solana: live board, real candles with NYSE-closed hours marked, the gap between token and share, and Jupiter swaps signed in your own wallet. st0x never holds funds.

- `index.html`, `assets/` static site (GSAP, ScrollTrigger, Lenis, web3.js vendored)
- `api/x.js` Vercel function: board (Jupiter), candles (Dexscreener + GeckoTerminal), market hours (Pyth), wallet and tx status (Solana RPC)
- env (optional): `ST0X_CA`, `ST0X_X`, `RPC_URL`
