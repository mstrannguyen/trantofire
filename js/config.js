/* ===========================================================
   Tran to Fire — settings.
   Month-to-month you edit js/data.js, not this file.
   =========================================================== */
window.TTF = {
  // Fallback only. The site pulls TQQQ's all-time high live from Yahoo Finance
  // and uses that instead whenever it is higher. This value is what shows if
  // Yahoo cannot be reached, and it ratchets up from your logged prices too.
  HIGH_WATER_MARK: 88.09,   // TQQQ record high, 3 Jun 2026

  CONTRIBUTION:    800,     // US$ per month

  // Interest earned on the cash reserve while it waits to be deployed.
  // 0.04 = 4% a year, accrued monthly. Set to 0 to ignore interest.
  CASH_RATE:       0.04,

  // Brokerage on each buy, in US dollars. This is real money leaving the
  // account, so it is taken out of the cash available before shares are
  // bought, and it reduces the reserve.
  BROKERAGE:       3,

  // TQQQ's annual expense ratio, currently 0.86% net of the fee waiver.
  //
  // IMPORTANT: this is NOT deducted from the portfolio value, and it must not
  // be. An ETF's expense ratio is accrued daily out of the fund's own assets,
  // which lowers its NAV, and the market price already reflects that. The
  // price you see is net of the fee. Subtracting it again would double-count
  // it and the site would stop matching your broker statement.
  //
  // It is used only to ESTIMATE what the fee has cost you, shown as a
  // separate figure so the drag is visible rather than invisible.
  EXPENSE_RATIO:   0.0086
};
