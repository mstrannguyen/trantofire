/* ===========================================================================
   Tran to Fire — the fund family table.

   The static columns (what it tracks, the multiple, the fee, the start date)
   are written into the HTML, because they almost never change. The three
   return columns are worked out here from Yahoo's monthly history, so they
   are never a number I typed in and forgot to update.

   Returns use adjusted closes, which treat distributions as reinvested, and
   are therefore total returns rather than price returns. The five year and
   since-start columns are annualised. Monthly data means the periods land on
   month boundaries rather than exact anniversaries, so these will sit a
   little away from the issuer's own published figures.

   If Yahoo does not answer for a fund, its cells stay as dashes and nothing
   else on the page is affected.
   =========================================================================== */
(function () {
  "use strict";

  var FUNDS = ["TQQQ", "QLD", "UPRO", "SSO"];

  function back(key, months) {
    var y = parseInt(key.slice(0, 4), 10);
    var m = parseInt(key.slice(5, 7), 10) - months;
    while (m <= 0) { m += 12; y -= 1; }
    return y + "-" + ("0" + m).slice(-2);
  }

  function monthsBetween(a, b) {
    return (parseInt(b.slice(0, 4), 10) - parseInt(a.slice(0, 4), 10)) * 12 +
           (parseInt(b.slice(5, 7), 10) - parseInt(a.slice(5, 7), 10));
  }

  /* Nearest available month at or before a target key. */
  function priceAt(series, key) {
    for (var i = 0; i < 4; i++) {
      var v = series.total[key];
      if (typeof v === "number" && v > 0) return v;
      key = back(key, 1);
    }
    return null;
  }

  function annualised(from, to, years) {
    if (!from || !to || years <= 0) return null;
    return Math.pow(to / from, 1 / years) - 1;
  }

  function fill(sym, series) {
    var E = window.TTF_ENGINE;
    var now = series.totalLast;
    var set = function (period, value) {
      var el = document.getElementById("f-" + sym + "-" + period);
      if (!el) return;
      el.textContent = (value === null || !isFinite(value)) ? "\u2014" : E.pct(value, 1);
      el.className = value === null ? "" : (value < 0 ? "neg" : "pos");
    };

    var oneYearAgo = priceAt(series, back(series.newest, 12));
    set("1y", oneYearAgo ? (now / oneYearAgo - 1) : null);

    var fiveYearsAgo = priceAt(series, back(series.newest, 60));
    set("5y", annualised(fiveYearsAgo, now, 5));

    var first = series.total[series.oldest];
    var years = monthsBetween(series.oldest, series.newest) / 12;
    set("all", annualised(first, now, years));
  }

  function start() {
    if (!document.getElementById("f-TQQQ-1y") ||
        !window.TTF_LIVE || !window.TTF_LIVE.series || !window.TTF_ENGINE) return;

    FUNDS.forEach(function (sym) {
      window.TTF_LIVE.series(sym).then(function (series) {
        if (!series || !series.totalLast) return;
        fill(sym, series);

        if (sym === "TQQQ") {
          var stamp = document.getElementById("f-asof");
          if (stamp) {
            stamp.textContent = "Returns to " +
              window.TTF_LIVE.asOfLabel(series.asOf) + ", from Yahoo Finance.";
          }
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
