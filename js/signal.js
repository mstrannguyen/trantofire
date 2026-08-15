/* Home page signal cards.
 *
 * Two layers. First, anything already logged in js/data.js renders instantly.
 * Then the live prices arrive from Yahoo and upgrade the valuation.
 *
 * The live layer runs even when NOTHING has been logged, because "what is the
 * fund doing right now and what would the rules say about it" is useful from
 * the first day the site is up, long before the first buy.
 *
 * One card per sleeve up top, shaded by that sleeve's own tier, so the state
 * of both funds reads at a glance without doubling the number of cards. The
 * portfolio row underneath is the two sleeves added together, with the split
 * in the small print.
 */
(function () {
  "use strict";
  var E = window.TTF_ENGINE, cfg = window.TTF, usd = E.usd, pct = E.pct, ddPct = E.ddPct;
  function $(id) { return document.getElementById(id); }
  function setText(id, v) { var e = $(id); if (e) e.textContent = v; }

  var sleeves = (cfg.SLEEVES || []).map(function (s) { return cfg.sleeve(s.sym); })
                  .filter(function (s) { return s; });
  if (!sleeves.length || !E) return;

  var summary  = $("sg-summary");
  var summary2 = $("sg-summary-2");
  var summaryH = $("sg-summary-h");
  var ret      = $("sg-return");
  var retFunds = $("sg-return-funds");

  /* Paints one of the two return cards.

     Green, red or neither is decided by the figure as DISPLAYED, not as held.
     A position eight cents under water rounds to 0.0% and to $0, and printing
     that in red behind a minus sign tells the reader the month went against
     them when it did nothing at all. Same rule as ddPct in the engine: the
     display must not claim something the figures have not done. */
  function paintReturn(el, subId, gain, base, tail) {
    if (!el) return;
    if (!(base > 0)) {
      el.textContent = "\u2014";
      el.className = "sg-return flat";
      setText(subId, "Nothing bought yet.");
      return;
    }
    var r      = gain / base;
    var showR  = Math.abs(r * 100) < 0.05 ? 0 : r;    // pct() prints 1 decimal
    var showG  = Math.abs(gain)     < 0.5  ? 0 : gain; // usd() prints whole dollars

    el.textContent = (showR > 0 ? "+" : "") + pct(showR);
    el.className = "sg-return " + (showR > 0 ? "pos" : showR < 0 ? "neg" : "flat");
    setText(subId, (showG > 0 ? "+" : "") + usd(showG) + " on " + usd(base) + " " + tail);
  }

  /* per sleeve: the run, and the latest valuation to fold into the totals */
  var state = {};

  function signalCard(sl, d, liveNote) {
    setText("sg-deploy-" + sl.sym, pct(d.tier.pct, 0));
    setText("sg-deploy-sub-" + sl.sym,
      d.tier.label + " \u00b7 " + usd(d.price, 2) + ", " +
      (Math.abs(d.drawdown) < 0.0005
        ? "at its record high"
        : ddPct(d.drawdown) + " below its " + usd(d.high, 2) + " high") +
      (liveNote ? " \u00b7 live" : ""));
    var card = $("sg-act-" + sl.sym);
    if (card) card.className = "sig-card act t" + d.tier.n;
  }

  /* The totals are re-rendered every time a sleeve reports, so the row is
     right after the first one lands and right again after the second. */
  function totals() {
    var reserve = 0, position = 0, portfolio = 0, moneyIn = 0, cost = 0, any = false;
    sleeves.forEach(function (sl) {
      var v = state[sl.sym];
      if (!v) return;
      any = true;
      reserve   += v.reserve;
      position  += v.etfValue;
      portfolio += v.portfolio;
      moneyIn   += v.moneyIn;
      cost      += v.shares * v.avgCost;   // avgCost already carries the brokerage
      setText("sg-hold-" + sl.sym, v.shares + " share" + (v.shares === 1 ? "" : "s") +
        " at " + usd(v.avgCost, 2) + " \u00b7 " + usd(v.reserve) + " in reserve");
    });
    if (!any) return;

    if (summary)  summary.hidden  = false;
    if (summary2) summary2.hidden = false;
    if (summaryH) summaryH.hidden = false;

    setText("sg-reserve", usd(reserve));
    setText("sg-portfolio", usd(portfolio));
    setText("sg-portfolio-sub", usd(position) + " in funds plus the reserves.");

    /* Two returns, one gain, two denominators.

       Money invested is what has actually been spent on shares. Money in is
       every dollar contributed, most of which is still cash while the ladder
       sits on baseline. The gains differ only by the interest the reserve has
       earned, which counts as return rather than as money in, so the two
       figures are equal until the first month of interest lands.

       A percentage with no denominator on the page cannot be checked, so each
       card prints its own underneath. */
    paintReturn(retFunds, "sg-return-funds-sub", position - cost, cost, "spent on shares.");
    paintReturn(ret,      "sg-return-sub",       portfolio - moneyIn, moneyIn,
      "in, " + usd(reserve) + " of it still cash.");
  }

  /* ---------- layer 1: whatever is already logged ---------- */
  sleeves.forEach(function (sl) {
    sl.hist = E.run(sl.rows || [], sl);
    var last = sl.hist.length ? sl.hist[sl.hist.length - 1] : null;
    if (!last) return;

    /* Without a record high there is nothing to measure a drawdown from, and
       the engine reads that as no drawdown at all, which would show Baseline
       whatever the fund had actually done. The card waits for Yahoo instead of
       printing a tier it cannot stand behind. The money below is unaffected:
       the buy is logged at the shares actually bought. */
    if (last.highKnown) signalCard(sl, last, false);
    else {
      setText("sg-deploy-" + sl.sym, "\u2014");
      setText("sg-deploy-sub-" + sl.sym, "Waiting on the record high from Yahoo Finance.");
    }
    state[sl.sym] = {
      reserve: last.reserve, etfValue: last.portfolio - last.reserve,
      portfolio: last.portfolio, moneyIn: last.moneyIn,
      shares: last.shares, avgCost: last.avgCost
    };
  });
  totals();

  /* ---------- layer 2: the live market ---------- */
  if (!window.TTF_LIVE || !window.TTF_LIVE.quoteFor) return;

  var stamped = false;

  sleeves.forEach(function (sl) {
    window.TTF_LIVE.quoteFor(sl.sym).then(function (live) {
      if (!live) return;

      /* Yahoo's figure IS the record high. Nothing is stored to compare it
         against, so it is taken as it comes. An earlier version kept a
         constant in config and only took the live figure when it was higher,
         which let a stale number sit above the real high and read every
         drawdown a rung shallow. */
      var lifted = {};
      for (var k in sl) lifted[k] = sl[k];
      var haveAth = live.ath > 0;
      if (haveAth) lifted.HIGH_WATER_MARK = live.ath;
      var hist = haveAth ? E.run(sl.rows || [], lifted) : sl.hist;

      var n = E.next(hist, lifted, live.price);
      if (n) signalCard(sl, n, true);

      if (hist.length) {
        var r = E.revalue(hist, live.price);
        if (r) {
          state[sl.sym] = {
            reserve: r.reserve, etfValue: r.etfValue, portfolio: r.portfolio,
            moneyIn: r.moneyIn, shares: r.shares, avgCost: r.avgCost
          };
          totals();
        }
      }

      if (!stamped) {
        stamped = true;
        var stamp = $("sg-live");
        if (stamp) {
          stamp.textContent = "Live prices from " + live.source +
            (live.asOf ? ", " + window.TTF_LIVE.asOfLabel(live.asOf) + " Sydney time" : "") + ".";
        }
      }
    });
  });
})();
