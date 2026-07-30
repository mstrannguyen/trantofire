/* Home page signal cards.
 *
 * Two layers. First, anything already logged in js/data.js renders instantly.
 * Then the live TQQQ price arrives from Yahoo and upgrades the valuation.
 *
 * The live layer runs even when NOTHING has been logged yet, because "what is
 * TQQQ doing right now and what would the rules say about it" is useful from
 * the first day the site is up, long before the first buy.
 */
(function () {
  "use strict";
  var E = window.TTF_ENGINE, cfg = window.TTF, usd = E.usd, pct = E.pct, ddPct = E.ddPct;
  function setText(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }

  var history = E.run(window.TTF_DATA || [], cfg);
  var last    = history.length ? history[history.length - 1] : null;
  var act     = document.getElementById("sg-act");
  var summary   = document.getElementById("sg-summary");
  var summaryH  = document.getElementById("sg-summary-h");

  /* the heading only makes sense when the row underneath it is showing */
  function showSummary() {
    if (summary)  summary.hidden  = false;
    if (summaryH) summaryH.hidden = false;
  }
  var ret     = document.getElementById("sg-return");

  /* ---------- layer 1: whatever is already logged ---------- */
  if (last) {
    setText("sg-ath", usd(last.high, 2));
    setText("sg-price", usd(last.price, 2));
    setText("sg-price-sub", last.label + " \u00b7 " +
      (Math.abs(last.drawdown) < 0.0005 ? "at the high" : ddPct(last.drawdown) + " below the high"));

    setText("sg-deploy", pct(last.deployPct, 0));
    setText("sg-deploy-sub", last.tier.label + " \u00b7 " +
      usd(last.spent) + " of " + usd(last.available) + " available \u00b7 " +
      last.bought + " share" + (last.bought === 1 ? "" : "s"));
    if (act) act.className = "sig-card act t" + last.tier.n;

    if (summary) {
      showSummary();
      setText("sg-reserve", usd(last.reserve));
      setText("sg-invested", usd(last.portfolio - last.reserve));
      setText("sg-invested-sub", last.shares + " share" + (last.shares === 1 ? "" : "s") +
        " at " + usd(last.avgCost, 2) + " average");
      setText("sg-portfolio", usd(last.portfolio));
      if (ret) {
        ret.textContent = (last.ret >= 0 ? "+" : "\u2212") + pct(Math.abs(last.ret));
        ret.className = "sg-return " + (last.ret >= 0 ? "pos" : "neg");
      }
    }
  }

  /* ---------- layer 2: the live market, whether or not anything is logged ---------- */
  if (!window.TTF_LIVE) return;

  window.TTF_LIVE.get().then(function (live) {
    if (!live) return;

    // Yahoo's all-time high replaces the hardcoded reference where it is higher
    var liveCfg = {
      HIGH_WATER_MARK: (live.ath && live.ath > cfg.HIGH_WATER_MARK) ? live.ath : cfg.HIGH_WATER_MARK,
      CONTRIBUTION:    cfg.CONTRIBUTION,
      CASH_RATE:       cfg.CASH_RATE,
      BROKERAGE:       cfg.BROKERAGE,
      EXPENSE_RATIO:   cfg.EXPENSE_RATIO
    };
    var hist = (live.ath && live.ath > cfg.HIGH_WATER_MARK)
      ? E.run(window.TTF_DATA || [], liveCfg)
      : history;

    // what the rules would call for at today's price, from wherever we stand
    var n = E.next(hist, liveCfg, live.price);
    if (!n) return;

    setText("sg-ath", usd(n.high, 2));

    var athNote = document.getElementById("sg-ath-sub");
    if (athNote && live.ath) {
      var d = live.athDate ? new Date(live.athDate) : null;
      athNote.textContent = "TQQQ record high" +
        (d && !isNaN(d.getTime())
          ? ", " + d.toLocaleDateString("en-AU", { month: "long", year: "numeric" })
          : "") +
        ", from " + live.source + ". Every tier is measured from this one number.";
    }

    setText("sg-price", usd(n.price, 2));
    setText("sg-price-sub", "Live \u00b7 " +
      (Math.abs(n.drawdown) < 0.0005 ? "at the high" : ddPct(n.drawdown) + " below the high"));

    setText("sg-deploy", pct(n.tier.pct, 0));
    setText("sg-deploy-sub", hist.length
      ? n.tier.label + " \u00b7 what the rules would call for today"
      : n.tier.label + " \u00b7 what the rules would call for on the first buy");
    if (act) act.className = "sig-card act t" + n.tier.n;

    // portfolio figures only exist once something has been bought
    if (hist.length) {
      var r = E.revalue(hist, live.price);
      if (r && summary) {
        showSummary();
        setText("sg-reserve", usd(r.reserve));
        setText("sg-invested", usd(r.etfValue));
        setText("sg-invested-sub", r.shares + " share" + (r.shares === 1 ? "" : "s") +
          " at " + usd(r.avgCost, 2) + " average \u00b7 cost " + usd(r.invested));
        setText("sg-portfolio", usd(r.portfolio));
        if (ret) {
          ret.textContent = (r.ret >= 0 ? "+" : "\u2212") + pct(Math.abs(r.ret));
          ret.className = "sg-return " + (r.ret >= 0 ? "pos" : "neg");
        }
      }
    }

    var stamp = document.getElementById("sg-live");
    if (stamp) {
      stamp.textContent = "Live TQQQ price from " + live.source +
        (live.asOf ? ", " + window.TTF_LIVE.asOfLabel(live.asOf) + " Sydney time" : "") + ".";
    }
  });
})();
