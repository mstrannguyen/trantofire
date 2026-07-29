# Tran to Fire — project handoff

Paste this into a new chat to pick up where we left off. The current site is
in `trantofire.zip`; upload it alongside this file.

---

## Who and what

Tran, in Sydney. Building a public FIRE blog documenting a counter-cyclical
leveraged-ETF experiment, modelled loosely on aussiefirebug.com.

Not retiring — enjoys the job. Wants wealth beyond index returns. This is ONE
experiment with a defined carve-out slice, not the whole portfolio.

**Live at https://trantofire.au** (primary). trantofire.com redirects to it.

---

## The strategy

- Buys **TQQQ** (3× Nasdaq-100)
- **US$800 a month**, fixed in USD (was $2,000 → $1,500 → $1,000 → $800)
- Deploy % of ALL available cash (prior reserve + this month's contribution),
  by drawdown from the all-time high:
  - Baseline (0 to −19%) → **20%**
  - Dip (−20%) → **33%**
  - Deep dip (−40%) → **67%**
  - Crash (−60%) → **100%**
- Whole shares only. One buy a month. Never sells during accumulation.
- 20-year horizon, Aug 2026 to Jul 2046
- **$3 brokerage** per trade, charged by the broking app. The tier sets the
  share count first; the fee comes out of the cash afterwards.
- **Cash reserve earns 4% a year**, accrued monthly, counted as return not as
  money in
- TQQQ's **0.86% management fee is reported but never deducted** — an ETF
  accrues it inside its own price, so subtracting it would double-count
- **The price that decides the tier is the price actually paid** on the day
  the order is placed

Rules come from Henrique Centieiro's TradingView Strategy 3. B.D. Collins'
book "$1,000 to $1,000,000" is the other main source.

---

## How the site works

**One file to edit each month: `js/data.js`.** Every month Aug 2026 to Jul
2046 is pre-written and commented out. Uncomment the line, type the price
paid, commit. Everything else is calculated.

```js
{ month: "2026-08", price: 66.00 },
```

Optional overrides: `fill:` (actual fill price), `shares:` (if it differed
from the rules — flags a visible deviation), `fee:`, `note:`, `high:`,
`contribution:`.

**Journal entries: `js/journal.js`.** Words only; figures are pulled from
data.js automatically.

### Architecture

- `js/config.js` — HIGH_WATER_MARK (fallback), CONTRIBUTION 800,
  CASH_RATE 0.04, BROKERAGE 3, EXPENSE_RATIO 0.0086
- `js/engine.js` — the strategy as code. Everything derives from it.
- `js/data.js` — monthly prices (the only regular edit)
- `js/live.js` — fetches live TQQQ price + all-time high
- `js/signal.js` — home page cards
- `js/progress.js` — Progress page
- `js/journal.js` / `js/journal-render.js` — the Journal
- `js/compare.js` — growth-of-$10k chart
- `netlify/functions/price.js` + `netlify.toml` — fallback price route
- `_redirects` — contains the `/api/price` PROXY rule (the working route)
- `_headers` — CSP etc. HSTS deliberately commented out.

**Live price:** Yahoo Finance via a Netlify **proxy rule** in `_redirects`
(`/api/price ... 200`). Serverless functions were tried first and did NOT
work, because functions need a build step that drag-and-drop deploys skip.
The proxy needs no build. Same-origin, so CSP stays `connect-src 'self'`.

**All-time high** is derived from Yahoo's full split-adjusted monthly
history, never trusted from a published "ATH" field — two sites publish
provably wrong figures for TQQQ because they use unadjusted data. Sanity
checks reject anything below the 52-week high or that looks unadjusted.

### Pages

Home (masthead + signal cards + fund family + how it works + intention +
engine chart), Strategy, Progress, Journal, My Story.

---

## Still outstanding

Ordered. Everything above the line has to happen before launch.

- [ ] **Deploy the current build.** Adds `privacy/`, so drag the whole folder,
      not individual files.
- [ ] **Decide which day of the month the buy happens.** The last place the
      rules leave room for judgment. One sentence on the Strategy page fixes
      it, and it also settles what date goes in `js/data.js`.
- [ ] **Create tran@trantofire.au** at VentraIP, plus a `privacy@` alias into
      the same inbox. Set SPF and DKIM at the same time or replies land in
      spam. The address is already published on My Story and `/privacy/`.
- [x] FastComments Tenant ID is in `js/comments.js` (ndvTLjF3MQ5). Threads go
      live on the next deploy. Add trantofire.au as a site in the FastComments
      account before the trial ends or requests start getting refused.
- [ ] **Force HTTPS** in Netlify once the padlock appears, then uncomment the
      HSTS line in `_headers` and redeploy.
- [ ] **Two-factor auth** on Netlify, VentraIP and GitHub.
- [ ] **Domain transfer lock** at VentraIP for both domains.
- [ ] **Log the first buy** in `js/data.js`, and write the first journal entry
      in `js/journal.js`.

Not blocking launch:

- [ ] Self-host the two Google Fonts to remove the last passive third-party
      request. The privacy page currently admits this is undone.
- [ ] Email signup section on the home page is commented out. Needs a provider
      before it goes back.
- [ ] Excel tracker was uploaded to be updated to match the site
      ($800, Yahoo live price, $3 brokerage) — never completed.
- [ ] Trademark the name and the fire-horse logo with IP Australia if you go
      ahead: word mark first, TM Headstart, roughly $330 a class.

---

## Working preferences

- Prose should sound human, not AI. Em-dashes were cut from 77 to 4 across
  the site. Avoid balanced epigrams, "isn't X it's Y", adjective triads,
  and restating a pull-quote in the paragraph beneath it.
- Wants pushback when something is wrong, not compliance. Several good
  outcomes came from disagreeing (dual-axis chart, double-counting the
  management fee).
- Verify figures against sources rather than asserting them.
