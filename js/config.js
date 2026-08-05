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
     The two sleeves. Same rules, same money, different index.

     Each runs its own reserve, its own high-water mark and its own tier
     ladder. Nothing is shared between them except the rules themselves, so
     a crash in one does not reach into the other's cash.
     --------------------------------------------------------- */
  SLEEVES: [
    {
      sym:          "TQQQ",
      index:        "Nasdaq-100",
      mult:         3,
      data:         "TTF_DATA",          // window.TTF_DATA
      CONTRIBUTION: 800,                 // US$ per month
      // Fallback only. The site pulls the record high live from Yahoo and
      // uses that when it is higher. This is what shows if Yahoo cannot be
      // reached, and it ratchets up from logged prices too.
      HIGH_WATER_MARK: 88.09,            // TQQQ record high, 3 Jun 2026
      EXPENSE_RATIO:   0.0086,           // 0.86% net of the fee waiver
      BROKERAGE:       3,                // monthly buys and the August rebalance
      bench:        ["QQQ", "QLD"],      // the same money into 1x and 2x

      /* Once a year, in August, after that month's buy, this fund is brought
         back to half shares and half cash. The parcel is this fund's shares
         plus this fund's reserve and nothing else. Above the target the excess
         is sold into cash, below it the reserve buys back in, whole shares
         rounded down either way so it never overshoots. Brokerage is charged
         on that trade in either direction.

         First one is August 2027, a year after the first buy, then every
         August to 2045. */
      REBALANCE: { target: 0.5, month: 8, from: "2027-08" }
    },
    {
      sym:          "SSO",
      index:        "S&P 500",
      mult:         2,
      data:         "TTF_DATA_SSO",      // window.TTF_DATA_SSO
      CONTRIBUTION: 800,
      // Fallback only. The site derives the record high from Yahoo's full
      // split-adjusted monthly history on every load and measures the tiers
      // against that, the same as TQQQ.
      //
      // Note for anyone checking this against a data site: SSO ran a 2:1
      // forward split on 20 November 2025, and several sites still publish an
      // unadjusted all-time high in the $160s that predates it. Everything
      // here is post-split.
      HIGH_WATER_MARK: 70.13,            // SSO record high, June 2026
      EXPENSE_RATIO:   0.0090,           // 0.90%, per the fund table on /
      BROKERAGE:       3,
      bench:        ["VOO", "UPRO"]
      // No REBALANCE key: this fund is never rebalanced and has no target.
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
  HIGH_WATER_MARK: 88.09,
  CONTRIBUTION:    800,
  EXPENSE_RATIO:   0.0086
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
