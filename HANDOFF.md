# Tran to Fire — project handoff

Paste this into a new chat to pick up where we left off, and upload
`trantofire-updated.zip` with it. That zip is the whole site.

If the job is just this month's numbers, read `MONTHLY.md` instead. It is
shorter and it is the only file you need for a routine update.

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
- Whole shares only. One buy a month. No sell rule is published; selling is
  not ruled out and the site no longer claims it never happens.
- 20-year horizon, Aug 2026 to Jul 2046
- **$3 brokerage** per trade, charged by the broking app. The tier sets the
  share count first; the fee comes out of the cash afterwards.
- **Cash reserve earns 4% a year**, accrued monthly, counted as return not as
  money in
- TQQQ's **0.86% management fee is reported but never deducted** — an ETF
  accrues it inside its own price, so subtracting it would double-count
- **The price that decides the tier is the price actually paid** on the day
  the order is placed
- **Lifecycle investing.** Leverage comes down over time, and the mechanism is
  an ANNUAL REBALANCE OF THE MIX between the two sleeves, NOT selling TQQQ to
  buy a lower-multiple fund. The blended exposure falls as the split tilts
  toward SSO at 2×. Do not reinstate any "step down to QLD" wording; that was
  the old framing and it is wrong. Targets, first rebalance date and whether it
  runs on the calendar or on a balance are still being worked out, and the site
  deliberately does NOT list those unknowns — it just says the leverage comes
  down by rebalancing. Grounded in Ayres and Nalebuff, who cap at 2:1 — the
  site says plainly that 3× goes past them.
- **A second sleeve in SSO.** The same counter-cyclical rules run on SSO
  (2× S&P 500) with its own reserve and its own high-water mark, meant to be
  kept long term so the geared side is not all one index, and with drawdowns
  Tran is more comfortable sitting through. US$800 a month into each sleeve,
  US$1,600 in total. BOTH are tracked on the site now; the earlier decision
  not to publish SSO was reversed.

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
- `js/live.js` — live prices, monthly history, daily history. Exposes
  `get()`, `series(sym)` (monthly) and `daily(sym)` (daily closes).
- `js/signal.js` — home page cards
- `js/progress.js` — Progress page: three charts (price + buys, profit,
  drawdown)
- `js/benchmark.js` — the same money into QQQ and QLD, priced on the buy day
- `js/journal.js` / `js/journal-render.js` — the Journal
- `js/compare.js` — growth-of-$10k chart, computed live for QQQ, QLD, TQQQ
  plus a synthetic 3× QQQ line
- `js/funds.js` — fills the return columns in the home page fund table
- `js/comments.js` — FastComments loader. Tenant ID lives here.
- `netlify/functions/price.js` + `netlify.toml` — fallback price route
- `_redirects` — the `/api/price*` PROXY rules. Eight of them now: monthly
  for TQQQ, QQQ, QLD, UPRO, SSO; daily for TQQQ, QQQ, QLD.
- `_headers` — CSP etc. HSTS deliberately commented out.

**Nothing on the site is a typed-in figure that could go stale.** Fund
returns, the growth chart and the benchmark all recalculate from Yahoo on
each load. Third-party sources disagreed with each other by several points a
year, which is why.

**Live price:** Yahoo Finance via a Netlify **proxy rule** in `_redirects`
(`/api/price ... 200`). Serverless functions were tried first and did NOT
work, because functions need a build step that drag-and-drop deploys skip.
The proxy needs no build. Same-origin, so CSP stays `connect-src 'self'`.

**All-time high** is derived from Yahoo's full split-adjusted monthly
history, never trusted from a published "ATH" field — two sites publish
provably wrong figures for TQQQ because they use unadjusted data. Sanity
checks reject anything below the 52-week high or that looks unadjusted.

### Pages

Home, Strategy, Progress, Journal, My Story, Privacy.

Strategy runs: The intention, Optimal leverage (Cooper), The tier ladder,
Worked example, Why not just buy every month, Lifecycle investing, Other ways
to do this, Risk, The mechanics, Comments.

---

## The monthly routine

From now on the monthly update happens in chat rather than by hand-editing
GitHub. The protocol, including the one rule that stops entries being lost,
is in `MONTHLY.md`. Short version: download the zip from GitHub, upload it to
the chat, get the two files back, commit.

## Still outstanding

Ordered. Everything above the line has to happen before launch.

- [ ] **Deploy the current build.** Drag the whole folder. Picking out single
      files has already broken things twice: a new script was missing and the
      benchmark showed dashes, and `_redirects` was missing and the daily
      routes 404'd.
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

## Recent decisions worth not relitigating

Things settled in the last session, so a new chat does not undo them.

- The **cash reserve is excluded** from the Progress profit chart. It is not
  TQQQ, and counting it measures the deployment schedule rather than the fund.
- The **benchmark spends the same dollars**, not the same share count, and
  prices every fund on the day of the buy using daily closes.
- The **fund family table** and the **growth chart** compute themselves.
- The Collins **three-methods table was removed** entirely.
- The **email signup** and the old **"read me sceptically"** section are gone.
  The signup markup is commented out in `index.html`, not deleted.
- **No sell rule is published.** The site used to say the strategy never
  sells. It does not say that any more.
- Marker colour and size on the price chart both encode the tier. Colours
  were separated by measuring RGB distance, not by eye.

---

## Working preferences

Read this part before writing anything.

**Prose must not sound like AI.** This has been the single most frequent
correction, dozens of times. Cut on sight:

- Performative honesty. "I'm publishing this so that if I break it you'll
  know", "there is no version of this where I quietly move the goalposts",
  "I'd rather say so than leave it out". Doing the thing is the proof;
  announcing it undoes it.
- Balanced epigrams and "isn't X, it's Y". "Not a bet, a strategy." "The
  reliable cost isn't drag, it's fees."
- Sentences that admire themselves. "The single most important word on this
  page is every." "It is worth more than any of the analysis above."
- Signposting. "The bigger point is", "two things worth knowing before",
  "read the first point again".
- Filler adverbs: genuinely, simply, truly, precisely.
- Em-dashes in prose. Currently zero across all six pages. Keep it there.

**Say the plain thing and stop.** "TQQQ has consistently outperformed it
historically" beats adding "and that is what decided me". The reader draws
the conclusion.

**Push back when something is wrong.** Every good outcome this project has
came from disagreement, not compliance:

- The Collins table double-counted capital across rows and used the wrong
  benchmark. Caught by reading the source, not the summary.
- The "Australia has changed the rules" section was framed as a reason to
  hold leverage when its own first point argues the opposite. Now backdrop.
- "Risk you carry: none" for paying down a mortgage was wrong; a mortgage is
  borrowed money against one house.
- A dual-axis chart would have misled, because money in grows.

**Verify figures.** Read the actual source. Third-party summaries of these
funds contradict each other. Where a number can be computed, compute it.

**Check the arithmetic reconciles as displayed**, not just exactly. The
worked example needed 1,583 rather than 1,582 so a reader multiplying the
rounded figures on screen lands where the table does.

**Test the code, do not assume it.** Bugs found only by running it: a chart
function deleted by an over-wide replacement, benchmark labels drawn exactly
on top of their marker, a section that removed itself silently because a
null threw inside a promise.
