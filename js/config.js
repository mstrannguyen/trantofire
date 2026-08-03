/* ===========================================================
   Tran to Fire — settings.
   Month-to-month you edit js/data.js, not this file.
   =========================================================== */
window.TTF = {

  // Interest earned on a cash reserve while it waits to be deployed.
  // 0.04 = 4% a year, accrued monthly. Set to 0 to ignore interest.
  CASH_RATE:  0.04,

  // Brokerage on each buy, in US dollars. Real money leaving the account, so
  // it comes out of the cash available before shares are bought, and it
  // reduces the reserve.
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
      bench:        ["QQQ", "QLD"]       // the same money into 1x and 2x
    },
    {
      sym:          "SSO",
      index:        "S&P 500",
      mult:         2,
      data:         "TTF_DATA_SSO",      // window.TTF_DATA_SSO
      CONTRIBUTION: 800,
      // TO SET ONCE: SSO's record high. Left empty on purpose rather than
      // guessed. The site derives it from Yahoo's full split-adjusted monthly
      // history on every load and prints it to the console, so read it there
      // and paste it in. Until then the mark ratchets from logged prices
      // alone, which reads the tier too shallow if Yahoo is unreachable.
      HIGH_WATER_MARK: null,
      EXPENSE_RATIO:   0.0090,           // 0.90%, per the fund table on /
      bench:        ["VOO", "UPRO"]
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
