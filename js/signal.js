/* Home page signal cards — high-water mark, latest price, what the rules say. */
(function () {
  "use strict";
  var E = window.TTF_ENGINE, cfg = window.TTF, usd = E.usd, pct = E.pct, ddPct = E.ddPct;
  var $ = function (id) { return document.getElementById(id) || { style:{} }; };
  function setText(id, v){ var e = document.getElementById(id); if (e) e.textContent = v; }

  var history = E.run(window.TTF_DATA || [], cfg);
  if (!history.length) return;            // leave the placeholders alone

  var last = history[history.length - 1];

  setText("sg-ath", usd(last.high, 2));

  setText("sg-price", usd(last.price, 2));
  setText("sg-price-sub", last.label + " \u00b7 " +
    (Math.abs(last.drawdown) < 0.0005 ? "at the high" : ddPct(last.drawdown) + " below the high"));

  // what the rules called for that month
  setText("sg-deploy", pct(last.deployPct, 0));
  setText("sg-deploy-sub", last.tier.label + " \u00b7 " +
    usd(last.spent) + " of " + usd(last.available) + " available \u00b7 " +
    last.bought + " share" + (last.bought === 1 ? "" : "s"));

  var act = document.getElementById("sg-act");
  if (act) act.className = "sig-card act t" + last.tier.n;

  // second row: reserve, invested, portfolio value + return
  var summary = document.getElementById("sg-summary");
  if (summary) {
    summary.hidden = false;
    setText("sg-reserve", usd(last.reserve));
    setText("sg-invested", usd(last.spent === null ? 0 : (last.portfolio - last.reserve)));
    // invested = current market value of shares held = portfolio - reserve
    var etfValue = last.portfolio - last.reserve;
    setText("sg-invested", usd(etfValue));
    setText("sg-invested-sub", last.shares + " share" + (last.shares === 1 ? "" : "s") + " at " + usd(last.avgCost, 2) + " average");
    setText("sg-portfolio", usd(last.portfolio));
    var ret = document.getElementById("sg-return");
    if (ret) {
      ret.textContent = (last.ret >= 0 ? "+" : "\u2212") + pct(Math.abs(last.ret));
      ret.className = "sg-return " + (last.ret >= 0 ? "pos" : "neg");
    }
  }
})();
