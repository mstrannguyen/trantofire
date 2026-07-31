/* ===========================================================================
   Tran to Fire — the monthly log.

   THIS IS THE ONLY FILE YOU EDIT EACH MONTH.

   Every month from August 2026 to July 2046 is already written below, and
   commented out with //. When you place a buy:

       1. find that month
       2. delete the two slashes at the front of the line
       3. put in the price you paid
       4. commit

   That is the whole job. The site works out the drawdown, which tier applies,
   how much to deploy, how many whole shares that buys, the reserve, the
   portfolio value and the return. You never type any of those.

   ---------------------------------------------------------------------------
   WHEN REALITY DIFFERS FROM THE RULES, say so. That is the point of the site.

       fill:    the price you were actually filled at, if not the price above
       shares:  how many you ACTUALLY bought, if it wasn't what the rules said.
                The site flags that month and shows both numbers.
       fee:     brokerage paid, so the reserve stays honest
       high:    a NEW record high TQQQ reached since your last buy. The site
                only sees one price a month, so if it spiked to a record
                between buy days it will never know unless you say so, and
                every later drawdown would be measured from the wrong number.
       note:    a short line shown beside that month in the log
       contribution: if you put in something other than the usual amount

       { month: "2026-09", price: 71.20, fill: 71.35, fee: 9.50,
         shares: 6, note: "Order only partly filled" },

   ---------------------------------------------------------------------------
   RULES OF THE FILE

   - keep the comma at the end of every line
   - use straight quotes "  not curly quotes  “ ”
   - skipping a month? just leave it commented out
   - the site reads these in date order, so it does not matter if one is
     out of place, but keeping them tidy helps you

   Straight quotes matter. Notepad and the GitHub editor are safe.
   Word and Google Docs will silently break this file.

   The cash reserve earns interest at the rate set in js/config.js
   (CASH_RATE, currently 4% a year). Change it there if your savings or
   offset rate moves.
   =========================================================================== */

window.TTF_DATA = [

  // ───────── 2026 ─────────
  { month: "2026-08", price: 60.23 },
  // { month: "2026-09", price: 0.00 },
  // { month: "2026-10", price: 0.00 },
  // { month: "2026-11", price: 0.00 },
  // { month: "2026-12", price: 0.00 },

  // ───────── 2027 ─────────
  // { month: "2027-01", price: 0.00 },
  // { month: "2027-02", price: 0.00 },
  // { month: "2027-03", price: 0.00 },
  // { month: "2027-04", price: 0.00 },
  // { month: "2027-05", price: 0.00 },
  // { month: "2027-06", price: 0.00 },
  // { month: "2027-07", price: 0.00 },
  // { month: "2027-08", price: 0.00 },
  // { month: "2027-09", price: 0.00 },
  // { month: "2027-10", price: 0.00 },
  // { month: "2027-11", price: 0.00 },
  // { month: "2027-12", price: 0.00 },

  // ───────── 2028 ─────────
  // { month: "2028-01", price: 0.00 },
  // { month: "2028-02", price: 0.00 },
  // { month: "2028-03", price: 0.00 },
  // { month: "2028-04", price: 0.00 },
  // { month: "2028-05", price: 0.00 },
  // { month: "2028-06", price: 0.00 },
  // { month: "2028-07", price: 0.00 },
  // { month: "2028-08", price: 0.00 },
  // { month: "2028-09", price: 0.00 },
  // { month: "2028-10", price: 0.00 },
  // { month: "2028-11", price: 0.00 },
  // { month: "2028-12", price: 0.00 },

  // ───────── 2029 ─────────
  // { month: "2029-01", price: 0.00 },
  // { month: "2029-02", price: 0.00 },
  // { month: "2029-03", price: 0.00 },
  // { month: "2029-04", price: 0.00 },
  // { month: "2029-05", price: 0.00 },
  // { month: "2029-06", price: 0.00 },
  // { month: "2029-07", price: 0.00 },
  // { month: "2029-08", price: 0.00 },
  // { month: "2029-09", price: 0.00 },
  // { month: "2029-10", price: 0.00 },
  // { month: "2029-11", price: 0.00 },
  // { month: "2029-12", price: 0.00 },

  // ───────── 2030 ─────────
  // { month: "2030-01", price: 0.00 },
  // { month: "2030-02", price: 0.00 },
  // { month: "2030-03", price: 0.00 },
  // { month: "2030-04", price: 0.00 },
  // { month: "2030-05", price: 0.00 },
  // { month: "2030-06", price: 0.00 },
  // { month: "2030-07", price: 0.00 },
  // { month: "2030-08", price: 0.00 },
  // { month: "2030-09", price: 0.00 },
  // { month: "2030-10", price: 0.00 },
  // { month: "2030-11", price: 0.00 },
  // { month: "2030-12", price: 0.00 },

  // ───────── 2031 ─────────
  // { month: "2031-01", price: 0.00 },
  // { month: "2031-02", price: 0.00 },
  // { month: "2031-03", price: 0.00 },
  // { month: "2031-04", price: 0.00 },
  // { month: "2031-05", price: 0.00 },
  // { month: "2031-06", price: 0.00 },
  // { month: "2031-07", price: 0.00 },
  // { month: "2031-08", price: 0.00 },
  // { month: "2031-09", price: 0.00 },
  // { month: "2031-10", price: 0.00 },
  // { month: "2031-11", price: 0.00 },
  // { month: "2031-12", price: 0.00 },

  // ───────── 2032 ─────────
  // { month: "2032-01", price: 0.00 },
  // { month: "2032-02", price: 0.00 },
  // { month: "2032-03", price: 0.00 },
  // { month: "2032-04", price: 0.00 },
  // { month: "2032-05", price: 0.00 },
  // { month: "2032-06", price: 0.00 },
  // { month: "2032-07", price: 0.00 },
  // { month: "2032-08", price: 0.00 },
  // { month: "2032-09", price: 0.00 },
  // { month: "2032-10", price: 0.00 },
  // { month: "2032-11", price: 0.00 },
  // { month: "2032-12", price: 0.00 },

  // ───────── 2033 ─────────
  // { month: "2033-01", price: 0.00 },
  // { month: "2033-02", price: 0.00 },
  // { month: "2033-03", price: 0.00 },
  // { month: "2033-04", price: 0.00 },
  // { month: "2033-05", price: 0.00 },
  // { month: "2033-06", price: 0.00 },
  // { month: "2033-07", price: 0.00 },
  // { month: "2033-08", price: 0.00 },
  // { month: "2033-09", price: 0.00 },
  // { month: "2033-10", price: 0.00 },
  // { month: "2033-11", price: 0.00 },
  // { month: "2033-12", price: 0.00 },

  // ───────── 2034 ─────────
  // { month: "2034-01", price: 0.00 },
  // { month: "2034-02", price: 0.00 },
  // { month: "2034-03", price: 0.00 },
  // { month: "2034-04", price: 0.00 },
  // { month: "2034-05", price: 0.00 },
  // { month: "2034-06", price: 0.00 },
  // { month: "2034-07", price: 0.00 },
  // { month: "2034-08", price: 0.00 },
  // { month: "2034-09", price: 0.00 },
  // { month: "2034-10", price: 0.00 },
  // { month: "2034-11", price: 0.00 },
  // { month: "2034-12", price: 0.00 },

  // ───────── 2035 ─────────
  // { month: "2035-01", price: 0.00 },
  // { month: "2035-02", price: 0.00 },
  // { month: "2035-03", price: 0.00 },
  // { month: "2035-04", price: 0.00 },
  // { month: "2035-05", price: 0.00 },
  // { month: "2035-06", price: 0.00 },
  // { month: "2035-07", price: 0.00 },
  // { month: "2035-08", price: 0.00 },
  // { month: "2035-09", price: 0.00 },
  // { month: "2035-10", price: 0.00 },
  // { month: "2035-11", price: 0.00 },
  // { month: "2035-12", price: 0.00 },

  // ───────── 2036 ─────────
  // { month: "2036-01", price: 0.00 },
  // { month: "2036-02", price: 0.00 },
  // { month: "2036-03", price: 0.00 },
  // { month: "2036-04", price: 0.00 },
  // { month: "2036-05", price: 0.00 },
  // { month: "2036-06", price: 0.00 },
  // { month: "2036-07", price: 0.00 },
  // { month: "2036-08", price: 0.00 },
  // { month: "2036-09", price: 0.00 },
  // { month: "2036-10", price: 0.00 },
  // { month: "2036-11", price: 0.00 },
  // { month: "2036-12", price: 0.00 },

  // ───────── 2037 ─────────
  // { month: "2037-01", price: 0.00 },
  // { month: "2037-02", price: 0.00 },
  // { month: "2037-03", price: 0.00 },
  // { month: "2037-04", price: 0.00 },
  // { month: "2037-05", price: 0.00 },
  // { month: "2037-06", price: 0.00 },
  // { month: "2037-07", price: 0.00 },
  // { month: "2037-08", price: 0.00 },
  // { month: "2037-09", price: 0.00 },
  // { month: "2037-10", price: 0.00 },
  // { month: "2037-11", price: 0.00 },
  // { month: "2037-12", price: 0.00 },

  // ───────── 2038 ─────────
  // { month: "2038-01", price: 0.00 },
  // { month: "2038-02", price: 0.00 },
  // { month: "2038-03", price: 0.00 },
  // { month: "2038-04", price: 0.00 },
  // { month: "2038-05", price: 0.00 },
  // { month: "2038-06", price: 0.00 },
  // { month: "2038-07", price: 0.00 },
  // { month: "2038-08", price: 0.00 },
  // { month: "2038-09", price: 0.00 },
  // { month: "2038-10", price: 0.00 },
  // { month: "2038-11", price: 0.00 },
  // { month: "2038-12", price: 0.00 },

  // ───────── 2039 ─────────
  // { month: "2039-01", price: 0.00 },
  // { month: "2039-02", price: 0.00 },
  // { month: "2039-03", price: 0.00 },
  // { month: "2039-04", price: 0.00 },
  // { month: "2039-05", price: 0.00 },
  // { month: "2039-06", price: 0.00 },
  // { month: "2039-07", price: 0.00 },
  // { month: "2039-08", price: 0.00 },
  // { month: "2039-09", price: 0.00 },
  // { month: "2039-10", price: 0.00 },
  // { month: "2039-11", price: 0.00 },
  // { month: "2039-12", price: 0.00 },

  // ───────── 2040 ─────────
  // { month: "2040-01", price: 0.00 },
  // { month: "2040-02", price: 0.00 },
  // { month: "2040-03", price: 0.00 },
  // { month: "2040-04", price: 0.00 },
  // { month: "2040-05", price: 0.00 },
  // { month: "2040-06", price: 0.00 },
  // { month: "2040-07", price: 0.00 },
  // { month: "2040-08", price: 0.00 },
  // { month: "2040-09", price: 0.00 },
  // { month: "2040-10", price: 0.00 },
  // { month: "2040-11", price: 0.00 },
  // { month: "2040-12", price: 0.00 },

  // ───────── 2041 ─────────
  // { month: "2041-01", price: 0.00 },
  // { month: "2041-02", price: 0.00 },
  // { month: "2041-03", price: 0.00 },
  // { month: "2041-04", price: 0.00 },
  // { month: "2041-05", price: 0.00 },
  // { month: "2041-06", price: 0.00 },
  // { month: "2041-07", price: 0.00 },
  // { month: "2041-08", price: 0.00 },
  // { month: "2041-09", price: 0.00 },
  // { month: "2041-10", price: 0.00 },
  // { month: "2041-11", price: 0.00 },
  // { month: "2041-12", price: 0.00 },

  // ───────── 2042 ─────────
  // { month: "2042-01", price: 0.00 },
  // { month: "2042-02", price: 0.00 },
  // { month: "2042-03", price: 0.00 },
  // { month: "2042-04", price: 0.00 },
  // { month: "2042-05", price: 0.00 },
  // { month: "2042-06", price: 0.00 },
  // { month: "2042-07", price: 0.00 },
  // { month: "2042-08", price: 0.00 },
  // { month: "2042-09", price: 0.00 },
  // { month: "2042-10", price: 0.00 },
  // { month: "2042-11", price: 0.00 },
  // { month: "2042-12", price: 0.00 },

  // ───────── 2043 ─────────
  // { month: "2043-01", price: 0.00 },
  // { month: "2043-02", price: 0.00 },
  // { month: "2043-03", price: 0.00 },
  // { month: "2043-04", price: 0.00 },
  // { month: "2043-05", price: 0.00 },
  // { month: "2043-06", price: 0.00 },
  // { month: "2043-07", price: 0.00 },
  // { month: "2043-08", price: 0.00 },
  // { month: "2043-09", price: 0.00 },
  // { month: "2043-10", price: 0.00 },
  // { month: "2043-11", price: 0.00 },
  // { month: "2043-12", price: 0.00 },

  // ───────── 2044 ─────────
  // { month: "2044-01", price: 0.00 },
  // { month: "2044-02", price: 0.00 },
  // { month: "2044-03", price: 0.00 },
  // { month: "2044-04", price: 0.00 },
  // { month: "2044-05", price: 0.00 },
  // { month: "2044-06", price: 0.00 },
  // { month: "2044-07", price: 0.00 },
  // { month: "2044-08", price: 0.00 },
  // { month: "2044-09", price: 0.00 },
  // { month: "2044-10", price: 0.00 },
  // { month: "2044-11", price: 0.00 },
  // { month: "2044-12", price: 0.00 },

  // ───────── 2045 ─────────
  // { month: "2045-01", price: 0.00 },
  // { month: "2045-02", price: 0.00 },
  // { month: "2045-03", price: 0.00 },
  // { month: "2045-04", price: 0.00 },
  // { month: "2045-05", price: 0.00 },
  // { month: "2045-06", price: 0.00 },
  // { month: "2045-07", price: 0.00 },
  // { month: "2045-08", price: 0.00 },
  // { month: "2045-09", price: 0.00 },
  // { month: "2045-10", price: 0.00 },
  // { month: "2045-11", price: 0.00 },
  // { month: "2045-12", price: 0.00 },

  // ───────── 2046 ─────────
  // { month: "2046-01", price: 0.00 },
  // { month: "2046-02", price: 0.00 },
  // { month: "2046-03", price: 0.00 },
  // { month: "2046-04", price: 0.00 },
  // { month: "2046-05", price: 0.00 },
  // { month: "2046-06", price: 0.00 },
  // { month: "2046-07", price: 0.00 },

];
