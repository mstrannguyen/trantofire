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

  // ---- upgrade to a live market price if one is available ----
  if (window.TTF_LIVE) {
    window.TTF_LIVE.get().then(function (live) {
      if (!live) return;                       // stay on the logged price

      // Yahoo's all-time high replaces the hardcoded reference. The high-water
      // mark only ever ratchets up, so take whichever is larger.
      var hist = history;
      if (live.ath && live.ath > cfg.HIGH_WATER_MARK) {
        var liveCfg = {
          HIGH_WATER_MARK: live.ath,
          CONTRIBUTION:    cfg.CONTRIBUTION,
          CASH_RATE:       cfg.CASH_RATE
        };
        hist = E.run(window.TTF_DATA || [], liveCfg);
      }

      var r = E.revalue(hist, live.price);
      if (!r) return;

      setText("sg-ath", usd(r.high, 2));
      setText("sg-price", usd(r.price, 2));
      setText("sg-price-sub", "Live \u00b7 " +
        (Math.abs(r.drawdown) < 0.0005 ? "at the high" : ddPct(r.drawdown) + " below the high"));

      setText("sg-deploy", pct(r.tier.pct, 0));
      setText("sg-deploy-sub", r.tier.label + " \u00b7 what the rules would call for today");
      if (act) act.className = "sig-card act t" + r.tier.n;

      if (summary) {
        setText("sg-invested", usd(r.etfValue));
        setText("sg-invested-sub", r.shares + " share" + (r.shares === 1 ? "" : "s") +
          " at " + usd(r.avgCost, 2) + " average \u00b7 cost " + usd(r.invested));
        setText("sg-portfolio", usd(r.portfolio));
        if (ret) {
          ret.textContent = (r.ret >= 0 ? "+" : "\u2212") + pct(Math.abs(r.ret));
          ret.className = "sg-return " + (r.ret >= 0 ? "pos" : "neg");
        }
      }

      var athNote = document.getElementById("sg-ath-sub");
      if (athNote && live.ath) {
        var d = live.athDate ? new Date(live.athDate) : null;
        athNote.textContent = "TQQQ record high" +
          (d && !isNaN(d.getTime())
            ? ", " + d.toLocaleDateString("en-AU", { month: "long", year: "numeric" })
            : "") +
          ", from " + live.source + ". Every tier is measured from this one number.";
      }

      var stamp = document.getElementById("sg-live");
      if (stamp) {
        stamp.textContent = "Live TQQQ price from " + live.source +
          (live.asOf ? ", " + window.TTF_LIVE.asOfLabel(live.asOf) + " Sydney time" : "") + ".";
      }
    });
  }
})();
