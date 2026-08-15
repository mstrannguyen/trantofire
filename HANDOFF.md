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
  - Baseline (0 to −19%) → **20%**
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
- **The price that decides the tier is the price actually paid** on the day
  the order is placed

### The 3× funds

TQQQ and UPRO are NOT on the monthly schedule and are not in `SLEEVES`.

- Bought only once a fund is **40% below its record high**, measured on the
  3× fund itself, not on the index. Briefly changed to 50% in Aug 2026 and
  changed straight back; 40% is the rule
- Funded with **separate money**, not from the $800s and not from either
  reserve
- **DCA in over months** rather than committing at once, then hold. No target,
  no rebalance, no selling
- Nothing to track month by month until one triggers
- Strategy page section `id="crash"`

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

August 2026, the first month, in `js/data.js`:

- **QLD $90.21**, 10.9% below its high, baseline tier, 1 share, $706.79 reserve
- **SSO $67.62**, `shares: 2` pinned, baseline tier, $661.76 reserve
- Combined $1,594 on $1,600 in, $1,368.55 cash, P/L −$6

---

## Record highs: read this before touching them

The single most error-prone part of the site. Three separate bugs here.

- Highs come **live from Yahoo on every load**, derived from the full
  split-adjusted monthly history. `js/config.js` holds QLD **$101.19** and
  SSO **$71.79** as offline fallbacks ONLY
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
- ProShares split SSO, QLD and TQQQ **2:1 on 20 Nov 2025**. Several data sites
  still publish pre-split all-time highs (SSO in the $160s, QLD $153.33).
  Everything on the site is post-split

---

## How the site works

**One file to edit each month: `js/data.js`.** Every month Aug 2026 to Jul 2046
is pre-written and commented out, for both funds. Uncomment the line, type the
price paid, commit. Everything else is calculated.

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
  against VOO and UPRO, driven by each sleeve's `bench` pair
- `js/compare.js` — the home page growth-of-$10k chart (hardcoded Nasdaq
  annual balances; QLD's line is derived from QQQ and TQQQ, not typed)
- `js/journal.js` / `js/journal-render.js` — the Journal, one figures block
  per fund
- `js/funds.js` — fills the return columns in the home page fund table
- `js/comments.js` — FastComments loader. Tenant ID lives here
- `_redirects` — the `/api/price*` PROXY rules. Twelve of them: monthly for
  TQQQ, QQQ, QLD, UPRO, SSO, VOO; daily for TQQQ, QQQ, QLD, SSO, VOO, UPRO
- `_headers` — CSP `script-src 'self'`, so NO inline scripts. HSTS commented out

**Nothing on the site is a typed-in figure that could go stale**, with two
deliberate exceptions: the home page growth chart's annual balances, and the
config fallback highs.

**Live price:** Yahoo via a Netlify **proxy rule** in `_redirects`. Serverless
functions were tried first and did NOT work, because functions need a build
step that drag-and-drop deploys skip. The proxy needs no build.

### Pages

Home, Strategy, Progress, Journal, My Story, Privacy.

Strategy runs: The intention, Optimal leverage (Cooper), The tier ladder,
Worked example, Why not just buy every month, Lifecycle investing, When it
really falls (`#crash`), What I didn't build this on, How this goes wrong,
The mechanics, Comments.

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
      answer points there. If tran@trantofire.au is ever created at VentraIP,
      set SPF and DKIM at the same time or replies land in spam
- [ ] **Force HTTPS** in Netlify, then uncomment the HSTS line in `_headers`
- [ ] **Two-factor auth** on Netlify, VentraIP and GitHub
- [ ] **Domain transfer lock** at VentraIP for both domains
- [ ] Add trantofire.au as a site in the FastComments account
- [ ] Self-host the two Google Fonts to remove the last third-party request
- [ ] Email signup section is commented out in `index.html`. Needs a provider

Known cosmetic leftovers, flagged and not actioned: `precisely` in the home
page capital-gains paragraph, "The bigger point is" in My Story, and
`.table-scroll` used in markup with no CSS rule.

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
- Colours were separated by measuring **RGB distance**, not by eye

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
