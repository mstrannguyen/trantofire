/* ===========================================================
   Tran to Fire — settings.
   Month-to-month you edit js/data.js, not this file.
   =========================================================== */
window.TTF = {
  HIGH_WATER_MARK: 88.09,   // TQQQ record high, 3 Jun 2026 — the starting reference.
                            // It ratchets up on its own if a later price beats it.

  CONTRIBUTION:    800,     // US$ per month

  // Interest earned on the cash reserve while it waits to be deployed.
  // 0.04 = 4% a year, accrued monthly at a twelfth of that, which is how
  // an Australian high-interest saver or offset account behaves in practice.
  // Set to 0 to ignore interest entirely.
  CASH_RATE:       0.04
};
