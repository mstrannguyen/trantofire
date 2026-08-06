/* ===========================================================
   Tran to Fire — settings.
   Month-to-month you edit js/data.js, not this file.
   =========================================================== */
window.TTF = {

  // Interest earned on a cash reserve while it waits to be deployed.
  // 0.04 = 4% a year, accrued monthly. Set to 0 to ignore interest.
  CASH_RATE:  0.04,

  // Brokerage on each trade, in US dollars. Real money leaving the account, so
  // it comes out of the cash after the tier has set the share count, and it
  // reduces the reserve. Repeated on each fund below so a change there is all
  // it takes if the two ever stop matching.
  BROKERAGE:  3,

  /* ---------------------------------------------------------
     The two funds bought on a schedule. Both are 2x, one on each index.

     Each runs its own reserve, its own high-water mark and its own tier
     ladder. Nothing is shared between them except the rules themselves, so
     a crash in one does not reach into the other's cash.

     Neither is ever rebalanced and neither has a target. Bought and held:
     selling to trim a position realises a gain and hands over the tax, and
     the compounding after that runs on what is left.

     TQQQ and UPRO are not on this schedule and are not in this list. They
     are crash entries, bought when an index has already fallen a long way,
     and there is nothing to log month by month until one triggers. The rule
     for them is written up on the Strategy page.
     --------------------------------------------------------- */
  SLEEVES: [
    {
      sym:          "QLD",
      index:        "Nasdaq-100",
      mult:         2,
      data:         "TTF_DATA",          // window.TTF_DATA
      CONTRIBUTION: 800,                 // US$ per month
      // Fallback only. The site derives the record high from Yahoo's full
      // split-adjusted monthly history on every load and uses that when it is
      // higher.
      //
      // Note for anyone checking this against a data site: QLD ran a 2:1
      // forward split on 20 November 2025. Several sites still report an
      // all-time high of $153.33 from 29 October 2025, which is the pre-split
      // price. Halved, that peak is $76.67, and the June 2026 one is higher.
      HIGH_WATER_MARK: 101.19,           // QLD record high, June 2026
      EXPENSE_RATIO:   0.0095,           // 0.95%, per the fund table on /
      BROKERAGE:       3,
      bench:        ["QQQ", "TQQQ"]      // the same money into 1x and 3x
    },
    {
      sym:          "SSO",
      index:        "S&P 500",
      mult:         2,
      data:         "TTF_DATA_SSO",      // window.TTF_DATA_SSO
      CONTRIBUTION: 800,
      // Fallback only. The site pulls the record high live from Yahoo and
      // uses that when it is higher.
      //
      // Note for anyone checking this against a data site: SSO ran a 2:1
      // forward split on 20 November 2025, and several sites still publish an
      // unadjusted all-time high in the $160s that predates it. Everything
      // here is post-split.
      HIGH_WATER_MARK: 70.13,            // SSO record high, June 2026
      EXPENSE_RATIO:   0.0090,           // 0.90%, per the fund table on /
      BROKERAGE:       3,
      bench:        ["VOO", "UPRO"]      // the same money into 1x and 3x
    }
  ],

  /* ---------------------------------------------------------
     The expense ratios above are REPORTED, never deducted.

     An ETF accrues its fee daily out of the fund's own assets, which lowers
     its NAV, and the market price already reflects that. The price you see is
     net of the fee. Subtracting it again would double-count it and the site
     would stop matching your broker statement. It is shown as a separate
     figure so the drag is visible rather than invisible.
     --------------------------------------------------------- */

  // Kept so anything not yet sleeve-aware still resolves. These mirror the
  // TQQQ sleeve above.
  HIGH_WATER_MARK: null,
  CONTRIBUTION:    800,
  EXPENSE_RATIO:   0.0095
};

/* Convenience: the sleeve record for a symbol, with the shared settings
   folded in, so callers can hand one object straight to TTF_ENGINE.run(). */
window.TTF.sleeve = function (sym) {
  var base = window.TTF, out = null;
  (base.SLEEVES || []).forEach(function (s) { if (s.sym === sym) out = s; });
  if (!out) return null;
  var cfg = { CASH_RATE: base.CASH_RATE, BROKERAGE: base.BROKERAGE };
  for (var k in out) cfg[k] = out[k];
  cfg.rows = window[out.data] || [];
  return cfg;
};
