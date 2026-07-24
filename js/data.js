/* ===========================================================================
   TranToFire — the monthly log.

   THIS IS THE ONLY FILE YOU EDIT EACH MONTH.

   Add one line per month, newest at the bottom. You only need the price.
   Everything else — drawdown, which tier fired, how much to deploy, how many
   whole shares that buys, what's left in the reserve, portfolio value and
   return — is calculated from it.

       { month: "2026-08", price: 66.00 },
                  |          |
                  |          '-- TQQQ price on the day you placed the order
                  '------------- year and month

   The site works out how many shares the rules told you to buy. Nine months
   out of ten your broker confirmation will match it exactly and there is
   nothing more to enter.

   WHEN REALITY DIFFERS, say so — that is the whole point of the site:

       high:    a NEW record high TQQQ hit since your last buy. The site only
                sees one price a month, so if it spiked to a record between
                buy days and fell back before you ordered, it will never know
                unless you say so — and every later drawdown will be measured
                from the wrong number.
       fill:    the price you were actually filled at, if not the price above
       shares:  the number of shares you ACTUALLY bought, if it wasn't what
                the rules said. The site will mark that month as a deviation
                and show both numbers. Do not hide it.
       fee:     brokerage paid, so the reserve stays honest
       note:    a short line shown beside that month in the log

       { month: "2026-09", price: 71.20, fill: 71.35, fee: 9.50,
         shares: 6, note: "Fat-fingered the order, bought one short" },

   OPTIONAL:
       contribution: if you put in something other than the usual amount

   To skip a month entirely, just leave it out.
   =========================================================================== */

window.TTF_DATA = [

  // Nothing logged yet. After your first buy, delete the // in front of the
  // line below and put in the real price:

  { month: "2026-08", price: 66.00 },
  { month: "2026-09", price: 70.00 },
  //{ month: "2026-10", price: 50.00 },
   

];
