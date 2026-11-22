# Tran to Fire — project handoff

Paste this into a new chat to pick up where we left off, and upload the
site zip with it. That zip is the whole site, and GitHub is the truth:
always start from a fresh download, never from an old one.

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

The site went through several shapes in one long session. THIS is the current
one. Anything else you read in an old file or an old chat is superseded.

### The two funds on the monthly schedule

- **QLD** (2× Nasdaq-100) and **SSO** (2× S&P 500)
- **US$800 a month into each**, fixed in USD, so US$1,600 in total
- Each runs its own reserve and its own record high. Nothing is shared
- Deploy % of ALL available cash (prior reserve + this month's contribution),
  by drawdown from the record high:
  - Baseline (less than 20% below) → **20%**
  - Dip (−20%) → **33%**
  - Deep dip (−40%) → **67%**
  - Crash (−60%) → **100%**
- Whole shares only. One buy a month per fund
- **Neither is ever rebalanced and neither is sold**
- 20-year horizon, Aug 2026 to Jul 2046
- **$3 brokerage** per trade on both funds. The tier sets the share count
  first; the fee comes out of the cash afterwards
- **Cash reserve earns 4% a year**, accrued monthly, counted as return not as
  money in
- Management fees are reported, never deducted — an ETF accrues them inside
  its own price, so subtracting would double-count
- **The price that decides the tier and the share count is the last close
  before the order goes in** (`price:` in `js/data.js`). The fill (`fill:`)
  only decides what the shares cost and what stays in the reserve, so an order
  sized the night before always matches the rules. Until November 2026 the
  price logged was the fill and the two were the same thing
- **A month's row values the shares at the price paid** (`fill`, or `price`
  where there is no fill), the same price the cost comes from (21 Nov 2026).
  It used to value them at `price`, the close before the order, so November
  2026's rows came out $14.30 (QLD) and $11.22 (SSO) lower than at the prices
  paid.
  The log table, the journal cards and the two return charts all read it from
  `etfValue` in `js/engine.js`

### The 3× funds

TQQQ and UPRO are **not part of the plan**. The site is SSO and QLD only.

- Until 15 Nov 2026 the Strategy page had a section, "When it really falls"
  (`id="crash"`), on buying TQQQ and UPRO from 30% below their record high
  with separate money. It was removed on that day, with every line that
  pointed to it (Home, Strategy, `js/config.js`). Do not bring it back
- TQQQ and UPRO stay on the site as **comparisons only**: the fund family
  table and growth chart on Home, the leverage chart and "What I didn't build
  this on" on Strategy, and each fund's `bench` pair on Progress
- Site copy must not describe the plan's own funds as 3×. QLD and SSO are 2×

### What was tried and removed

Do not reinstate any of these; each was built and then taken out.

- TQQQ as the monthly Nasdaq buy (replaced by QLD)
- An **August rebalance** of the TQQQ parcel to 50/50 shares and cash.
  `js/engine.js` still supports `cfg.REBALANCE` but no fund uses it
- Any wording about "stepping down to QLD" or "tilting the mix between the
  two funds" as the way leverage comes down
- A second growth chart on the home page for VOO/SSO/UPRO
- `js/marks.js` was removed once and then brought back; it is in use now

Rules come from Henrique Centieiro's TradingView Strategy 3. B.D. Collins'
book "$1,000 to $1,000,000" is the other main source. Ayres and Nalebuff's
*Lifecycle Investing* caps leverage at 2:1, which is where the strategy now
sits — the site says so.

---

## What is logged so far

August to November 2026 in `js/data.js`, every month on the baseline tier:

| Month | QLD | SSO |
|---|---|---|
| Aug 2026 | 1 at $90.21 | 2 at $67.62 |
| Sep 2026 | 3 at $90.24 | 4 at $70.54 |
| Oct 2026 | 4 at $95.27 | 5 at $69.98 |
| Nov 2026 | 5 at $83.69, sized on a close of $82.59 | 6 at $68.33, sized on a close of $67.67. The rules said 7, so the month is marked ≠ |

After November: QLD 13 shares and $2,039.53 in reserve, SSO 17 shares and
$2,022.29, with $3,200 put into each.

---

## Record highs: read this before touching them

The single most error-prone part of the site. Three separate bugs here.

- Highs come **live from Yahoo on every load**, derived from the full
  split-adjusted monthly history. **No record high is stored in the
  repository.** Each fetch that works is kept in the visitor's browser for
  120 days (`ttf:high:QLD`, `ttf:high:SSO`), and a fetch that fails falls back
  to that. With neither, the pages leave the figure out
- The live figure wins **whether it is higher or lower** than the stored one.
  An earlier "only take it when higher" ratchet let a stale constant sit above
  the real high and read every drawdown a rung shallow
- The high is taken from the month's **`quote.high`, not `quote.close`**. A
  close-based maximum misses any peak that faded before the last session; QLD
  read $98.46 that way against a true $101.19
- A **bad-bar screen** drops any month whose high is more than 1.5× BOTH
  neighbours. Yahoo returns SSO's Sep 2024 high as $85.57 against neighbours
  near $46, which is that month's pre-split price. Without the screen SSO
  reads $85.57
- **Each past month is measured against the record high as it stood on that
  buy day**, not today's. `TTF_LIVE.withHighs(sleeve)` gives every row the
  highest price before its buy (earlier months' intraday highs, plus the buy
  month's daily highs up to the day before the order) and seeds the engine
  with the first. Today's record reaches only today's figures, through
  `revalue(hist, price, athNow)` and `next(..., athNow)`. Seeding the engine
  with today's record rewrote history: a new high after the last buy pushed
  every earlier month a rung deeper, and the engine then recomputed past share
  counts. Every page, the Journal included, now goes through `withHighs`
- ProShares split SSO, QLD and TQQQ **2:1 on 20 Nov 2025**. Several data sites
  still publish pre-split all-time highs (SSO in the $160s, QLD $153.33).
  Everything on the site is post-split

---

## How the site works

**One file to edit each month: `js/data.js`.** Every month Aug 2026 to Jul 2046
is pre-written and commented out, for both funds. Uncomment the line, type the
last close the buy was sized on, add `fill:` with the price paid, commit.
Everything else is calculated.

```js
{ month: "2026-09", price: 91.40 },
```

Optional overrides: `fill:`, `shares:` (if it differed from the rules — flags a
visible deviation), `fee:`, `note:`, `high:`, `contribution:`, `date:`.

**Journal entries: `js/journal.js`.** Words only; figures are pulled from
data.js automatically. Each entry also carries a macro write-up, deliberately:
the point is that in twenty years the entries read as a record of what
happened and what it did to the position, not just a column of prices.

### Architecture

- `js/config.js` — `SLEEVES` (QLD, SSO), shared CASH_RATE 0.04, BROKERAGE 3
- `js/engine.js` — the strategy as code. `run(rows, cfg)`, ticker-agnostic
- `js/data.js` — `TTF_DATA` (QLD) and `TTF_DATA_SSO`. The only regular edit
- `js/live.js` — Yahoo via the proxy. `get()`, `quoteFor(sym)`, `series(sym)`,
  `daily(sym)`, `asOfLabel()`
- `js/marks.js` — fills record highs printed in page text (`data-hwm="QLD|SSO"`)
- `js/signal.js` — home page cards, one per fund plus combined totals
- `js/progress.js` — Progress page: QLD | SSO | Both tabs, charts, log table
- `js/benchmark.js` — per-fund comparison. QLD against QQQ and TQQQ, SSO
  against VOO and UPRO, driven by each sleeve's `bench` pair. Cards show
  today; a daily chart under them plots the fund against its 1x fund only
  (QQQ, VOO), same cash on the same buy days, same $3, priced at every close
- `TTF_ENGINE.ticks()` — round-number gridlines for any chart that crosses
  zero. Use it for new charts; quarters of the range put "0%" off zero
- `js/compare.js` — the home page growth-of-$10k chart (typed annual balances
  for QQQ, QLD and TQQQ, each from Yahoo's annual total returns; the table
  under the chart prints the same QQQ and TQQQ figures)
- `js/chartkit.js` — what every chart shares (`TTF_CHART`). The colours, read
  from the `--k-*` variables in each page's `:root`. `fit()` draws a chart at
  the width it is shown at and again when that changes. `plate()` puts a white
  plate behind words on the plot, `spread()` moves right-hand labels apart,
  `caption()` puts "break even" where no line runs, `thin()` drops a date
  along the foot that would touch its neighbour. Loaded on Home and Progress,
  before the chart scripts
- `js/journal.js` / `js/journal-render.js` — the Journal, one figures block
  per fund
- `js/funds.js` — fills the return columns in the home page fund table
- `js/comments.js` — FastComments loader. Tenant ID lives here
- `_redirects` — the `/api/price*` PROXY rules. Twelve of them: monthly for
  TQQQ, QQQ, QLD, UPRO, SSO, VOO; daily for TQQQ, QQQ, QLD, SSO, VOO, UPRO
- `_headers` — CSP `script-src 'self'`, so NO inline scripts. HSTS commented out

**Nothing on the site is a typed-in figure that could go stale**, with two
deliberate exceptions: the home page growth chart's annual balances, and the
fee and size columns of the fund table, which are dated in its caption.

**Live price:** Yahoo via a Netlify **proxy rule** in `_redirects`. Serverless
functions were tried first and did NOT work, because functions need a build
step that drag-and-drop deploys skip. The proxy needs no build.

### Pages

Home, Strategy, Progress, Journal, My Story, Privacy.

Strategy runs: The intention, Optimal leverage (Cooper), The tier ladder,
Worked example, Why not just buy every month, Lifecycle investing, What I
didn't build this on, How this goes wrong, The mechanics, Comments.

What the funds hold (corrected 21 Nov 2026). The home page said none of these
funds hold the shares in their index, only swaps. That was wrong. ProShares'
daily holdings for 18 and 19 Nov 2026 show shares at about 66% of SSO's net
assets, 78% of QLD's and 58% of TQQQ's (UPRO about the same as TQQQ), swaps
with ten banks for most of the rest of the exposure (about 116%, 109% and
226%), index futures (13% to 16%), and Treasury bills and a money market fund
alongside. The home page now says so, and "the borrowing sits inside the fund"
on My Story and Strategy reads "the leverage": the funds don't take a loan,
they add swaps and futures to the shares they own. Don't write that they hold
no shares.

My Story's "Rates went up" paragraph is dated to 21 Nov 2026: the cash rate at
4.85% after the rises of 29 September and 3 November, and the average
owner-occupier variable home loan at about 6.7% (Canstar's estimate after
November's rise, 6.74%). The table under it uses the same 6.7%. When the
Reserve Bank moves again, change the paragraph, the table's caption and its
mortgage column (6.7% in three rows), the "7.7% after tax beats 6.7%
guaranteed" line and the source note together.

## Corrections of 22 Nov 2026: what was checked, and what moves together

Every page was read against its sources and against the other pages.

- **Fund fees and sizes** are ProShares' own figures of 20 Nov 2026: net
  expense ratios TQQQ 0.78%, QLD 0.89%, UPRO 0.88%, SSO 0.84% (gross 0.94%,
  0.96%, 0.88%, 0.88%), net assets about $24b, $10b, $4b and $6b. The fees
  are in four places that change together: the fund table and its caption,
  "QLD's 0.89%" under it, the home page footer, and `EXPENSE_RATIO` in
  `js/config.js` (three lines). They can change when ProShares renews its
  prospectus each October, so check them then
- **The growth chart and its table.** QQQ's 2025 return had been typed as
  2024's (+25.6%); it was +20.8%. QLD's line had been worked out from QQQ and
  TQQQ and finished $131k too high; it is now QLD's own annual returns.
  $10,000 from the end of 2010 to the end of 2025: QQQ $128,804, QLD $564,971,
  TQQQ $1,435,525. The table's QQQ and TQQQ cells are the same numbers as the
  points in `js/compare.js`
- **2022, two ways.** Calendar year: QQQ −32.6%, QLD −60.5%, TQQQ −79.1%. From
  the November 2021 high to the December 2022 low: QLD −63.7%, TQQQ −81.7%.
  Say which one a sentence means, and don't set one beside the other
- **Collins, read from the book.** His plan is $83 a month, spent once a
  quarter. The run from January 2003 is twenty years and the run from October
  2007 is fifteen; both end on 3 October 2022 ($1,906,628 and $1,907,248
  against $334,609 and $389,151). TQQQ before February 2010 is his
  reconstruction from QQQ. His 80/20 ladder is 20% of the cash within 15% of
  the Nasdaq-100's high, then 40%, 60% and 80%. His moving-average system is a
  14-week average on a weekly chart with a sale after a 40% fall. His decay
  example prints 2.88 and 1.48 times; worked exactly it is 2.75 and 1.50, and
  My Story gives the exact figures and says so
- **The rule reads the same everywhere.** Cash available is last month's
  reserve, its interest and the month's $800. The fund's last close before the
  order, against its record high (the highest price it has traded), picks the
  tier: less than 20% below is Baseline, then 20%, 40% and 60%. That share of
  all the cash buys whole shares at that close, rounded down. The price paid
  decides the cost. $3 brokerage comes out of what is left
- **Journal, September entry.** August's index moves are Nasdaq's own: S&P 500
  +2.7%, Nasdaq-100 +4.2%, Dow +1.5%
- **Footers.** The Journal's figures come from the log, so they include
  brokerage. Strategy's worked example leaves it out and says so

## The monthly routine

Two buys a month now, QLD and SSO, in two arrays in the same file. The
protocol is in `MONTHLY.md`. Short version: download the zip from GitHub,
upload it to the chat, get the two files back, commit.

## Still outstanding

- [ ] **Deploy the current build.** Drag the whole folder. Picking out single
      files has already broken things twice
- [ ] **Decide which day of the month the buy happens.** Still open. Without a
      `date:` in `js/data.js` the benchmark infers the buy day by matching the
      logged price against daily closes, and the inferred date moves around
- [ ] **Email is off the site entirely.** No address is published on any page;
      comments are the only contact route, and the privacy page's data-removal
      answer points there. If a mailbox on the domain is ever created at
      VentraIP, set SPF and DKIM at the same time or replies land in spam
- [ ] **Force HTTPS** in Netlify, then uncomment the HSTS line in `_headers`
- [ ] **Two-factor auth** on Netlify, VentraIP and GitHub
- [ ] **Domain transfer lock** at VentraIP for both domains
- [ ] Add trantofire.au as a site in the FastComments account
- [ ] Self-host the two Google Fonts to remove the last third-party request.
      The privacy page has a section saying they come from Google; take it out
      when this is done
- [ ] Email signup section is commented out in `index.html`. Needs a provider

---

## Recent decisions worth not relitigating

- The **cash reserve is excluded** from the Progress profit chart. It is not
  the fund, and counting it measures the deployment schedule instead
- The **benchmark spends the same dollars**, not the same share count, and
  prices every fund on the day of the buy using daily closes. Each row shows
  that month's buy valued at today's price
- The **fund family table** computes itself from Yahoo
- **No sell rule is published** for the monthly funds
- The home page growth chart is the **hardcoded** version, ending 2025, the
  last complete year, so it matches the annual table beside it
- Site copy must not use the word **"sleeve"**. It reads as AI jargon. Say
  "fund", "the two funds", "the Nasdaq side"
- **Chart colours (20 Nov 2026).** Every chart uses one set. They are CSS
  variables in the `:root` block of Home, Strategy, Progress and Journal, and
  the four blocks must stay the same. Each has a darker step for words
  (`--k-*-t`):
  - **blue** `#2563EB`: the record high, and whatever a fund is measured
    against (QQQ or VOO, the return on money in, the S&P 500 on the leverage
    chart)
  - **orange** `#F2641A`: the fund itself (what the rules bought, the return
    on money invested, QLD on the growth chart, the Nasdaq-100 on the leverage
    chart)
  - **purple** `#A21CAF`: 3× (TQQQ on the growth chart, the 3× marker on the
    leverage chart)
  - **green** `#089981`, **amber** `#D97706`, **deep orange** `#D9480F`,
    **red** `#B91C1C`: Baseline, Dip, Deep dip, Crash, on the price chart's
    markers and boundaries and the drawdown chart's bands
  - `#2563EB` and `#E11D48`: a Journal bar above and below zero
  - Gains and losses printed as figures stay `#2F6B33` / `#A33220`, on the
    value chart's callouts too
  - Chosen with a colour-blind simulation and a contrast check, not by eye:
    every mark is 3:1 or better against the white card and every coloured
    word 4.5:1 or better. The tier cards, pills and rungs keep the page's own
    blush, clay and plum
- **Charts are drawn at the width they are shown at** (20 Nov 2026). Each used
  to be drawn 880 wide and scaled down, and on a phone its labels came out at
  four or five pixels. `TTF_CHART.fit()` hands the painter the host's width,
  and under 560px the painter uses narrower gutters. The two drawings on
  Strategy are static, so each is on the page twice (`.fig-w` and `.fig-n`)
  and CSS shows the one that suits the width. Change both when either changes
- **No label sits on another label or under a line.** Right-hand labels go
  through `spread()`, words on the plot go on a `plate()`, and a callout with
  no free place is left off. Checked at eight widths from 320 to 1280 against
  logs of one month, two, a year and five years
- **One rule for every result figure**: `E.signedPct` / `E.signedUsd` /
  `E.signClass`. Gains show +, losses −, anything rounding to zero neither.
  Profits and interest are shown **to the cent**, and a total is built from
  its rounded parts, so "profit on shares + interest = profit" adds up as
  printed. Gain and loss colours are `#2F6B33` / `#A33220` everywhere; the
  tier colours mean tiers only
- **One name per measure**: "on money invested" (shares only, against what
  was spent on them) and "on money in" (cash and interest included, against
  every dollar contributed). Use exactly these words
- **A fall of exactly 20%, 40% or 60% is the deeper tier** (15 Nov 2026).
  `tierFor` rounds the drawdown to six decimal places first. SSO at $58.24
  against a high of $72.80 is exactly 20% down, but the subtraction leaves
  0.19999999999999993, which read as Baseline
- On Progress, the pill beside the live figures is **the tier at the live
  price**, marked "live", as on the home page. The log's rows keep each buy's
  own tier. In the same block, the chart's copy of the log is called `points`:
  named `live`, it replaced the price quote and the line read "from undefined"
- **October 2026 is dated 14 Oct** in `js/data.js`, the only day that month
  both logged prices traded. Undated, QLD's day was inferred as 1 Oct, before
  its 6 Oct record, and October read 5.9% below the high instead of 6.2%
- `/updates/2026-08/` was an unfinished template page. It now only sends
  readers to the Journal
- The site's wording follows the engine: **the tier is set on the fund's last
  close before the order**, and the capital gains change is described as law
  (Treasury Laws Amendment (Tax Reform No. 1) Act 2026, 26 June 2026)

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
