/* ===========================================================================
   Tran to Fire — the benchmark comparison.

   THE QUESTION: the tier rules decide how much cash leaves the account each
   month. What if that same cash had gone into a fund with less leverage?

   HOW IT IS CALCULATED

   Every month the log records exactly what was spent on TQQQ, brokerage
   included. The benchmark spends that identical figure on QQQ and on QLD at
   the price each was trading at that month, paying the same brokerage. The
   tier ladder, the reserve and the deployment percentages are not re-run for
   the other funds. The cash outlay is the only thing carried across.

   Two prices are needed per fund, which is exactly what the page fetches:
     - the price that month, which sets how many shares that cash buys
     - the live price now, which sets what those shares are worth

   Return is measured against what was spent, so the three funds are compared
   on identical money in and the only variable is which fund it bought.

   FOUR THINGS TO BE HONEST ABOUT, all stated on the page itself:

   1. The benchmark buys fractional shares. It has to: at QQQ's price a
      month's deployment often would not buy a single whole share. The real
      portfolio buys whole shares only, which strands cash, so this flatters
      the benchmarks a little.

   2. Prices are each month's closing price, for all three funds including
      TQQQ. The real portfolio pays whatever the market was at on the buy day,
      so the TQQQ column here will not match the headline figure above it.

   3. Closing prices are corrected for splits but not for distributions, the
      same as everywhere else on this site. QQQ pays out the most of the
      three, so QQQ is the one understated by the most.

   4. The tier ladder is driven by TQQQ's drawdown. A portfolio genuinely
      built on QQQ would have had its own high-water mark and deployed on
      different months. Holding the schedule fixed is what isolates the fund
      choice, and it is not a claim about what would have been done instead.

   Nothing here can break the page. If Yahoo does not answer, the section
   removes itself and the rest of the Progress page is unaffected.
   =========================================================================== */
(function () {
  "use strict";

  var FUNDS = [
    { sym: "QQQ",  mult: "1\u00d7", note: "Nasdaq-100, unleveraged" },
    { sym: "QLD",  mult: "2\u00d7", note: "twice the daily move" },
    { sym: "TQQQ", mult: "3\u00d7", note: "what I actually buy" }
  ];

  function $(id) { return document.getElementById(id); }

  function hide() {
    var sec = $("bench");
    if (sec && sec.parentNode) sec.parentNode.removeChild(sec);
  }

  /* Walk the log once, spending the same cash in every fund. */
  function build(history, series) {
    var state = {}, missing = {};
    FUNDS.forEach(function (f) {
      state[f.sym]   = { shares: 0, cost: 0, lastPrice: null };
      missing[f.sym] = 0;
    });

    var rows = history.map(function (h) {
      var row = { month: h.month, label: h.label, spent: h.spent, px: {}, ret: {} };

      FUNDS.forEach(function (f) {
        var s  = state[f.sym];
        var px = series[f.sym] ? series[f.sym].months[h.month] : null;

        if (typeof px !== "number" || !(px > 0)) {
          missing[f.sym]++;
          row.px[f.sym]  = null;
          row.ret[f.sym] = (s.cost && s.lastPrice)
            ? (s.shares * s.lastPrice - s.cost) / s.cost
            : null;
          return;
        }

        if (h.spent > 0) {
          var cash = h.spent - h.fee;            // brokerage first, then shares
          if (cash > 0) s.shares += cash / px;
          s.cost += h.spent;                     // identical outlay, every fund
        }
        s.lastPrice    = px;
        row.px[f.sym]  = px;
        row.ret[f.sym] = s.cost ? (s.shares * px - s.cost) / s.cost : null;
      });

      return row;
    });

    var totals = FUNDS.map(function (f) {
      var s     = state[f.sym];
      var price = (series[f.sym] && series[f.sym].last) || s.lastPrice;
      var value = price ? s.shares * price : null;
      return {
        sym:     f.sym,
        mult:    f.mult,
        note:    f.note,
        price:   price,
        shares:  s.shares,
        cost:    s.cost,
        avgCost: s.shares ? s.cost / s.shares : null,
        value:   value,
        pl:      value === null ? null : value - s.cost,
        ret:     (value === null || !s.cost) ? null : (value - s.cost) / s.cost,
        missing: missing[f.sym]
      };
    });

    return { rows: rows, totals: totals };
  }

  function renderCards(totals) {
    var E = window.TTF_ENGINE;
    var best = null;
    totals.forEach(function (t) {
      if (t.ret !== null && (best === null || t.ret > best)) best = t.ret;
    });

    return totals.map(function (t) {
      var lead = (t.ret !== null && t.ret === best) ? " lead" : "";
      var down = (t.ret !== null && t.ret < 0) ? " down" : "";
      return '<div class="bcard' + lead + '">' +
        '<p class="bsym">' + t.sym + ' <span>' + t.mult + '</span></p>' +
        '<p class="bnote">' + t.note + '</p>' +
        '<p class="bval' + down + '">' + (t.ret === null ? "\u2014" : E.pct(t.ret)) + '</p>' +
        '<dl class="bstats">' +
          '<div><dt>Shares</dt><dd>' + (t.shares ? t.shares.toFixed(3) : "\u2014") + '</dd></div>' +
          '<div><dt>They cost</dt><dd>' + E.usd(t.cost) + '</dd></div>' +
          '<div><dt>Worth now</dt><dd>' + E.usd(t.value) + '</dd></div>' +
          '<div><dt>Profit</dt><dd>' + E.usd(t.pl) + '</dd></div>' +
          '<div><dt>Average cost</dt><dd>' + E.usd(t.avgCost, 2) + '</dd></div>' +
          '<div><dt>Price now</dt><dd>' + E.usd(t.price, 2) + '</dd></div>' +
        '</dl></div>';
    }).join("");
  }

  function renderRows(rows) {
    var E = window.TTF_ENGINE;
    return rows.map(function (r) {
      var best = null;
      FUNDS.forEach(function (f) {
        var v = r.ret[f.sym];
        if (typeof v === "number" && (best === null || v > best)) best = v;
      });

      return "<tr>" +
        '<td class="mth">' + r.label + "</td>" +
        "<td>" + (r.spent ? E.usd(r.spent, 2) : "\u2014") + "</td>" +
        FUNDS.map(function (f) {
          var ret = r.ret[f.sym];
          var px  = r.px[f.sym];
          var cls = (typeof ret === "number" && ret === best) ? ' class="best"' : "";
          return "<td" + cls + ">" +
            (ret === null ? "\u2014" : E.pct(ret)) +
            '<span class="bpx">' + (px === null ? "" : "at " + E.usd(px, 2)) + "</span>" +
          "</td>";
        }).join("") +
      "</tr>";
    }).join("");
  }

  function start() {
    var E = window.TTF_ENGINE;
    var sec = $("bench");
    if (!sec || !E || !window.TTF_LIVE || !window.TTF_LIVE.series) return hide();

    var history = E.run(window.TTF_DATA || [], window.TTF_CONFIG || {});
    if (!history.length) return hide();

    Promise.all(FUNDS.map(function (f) { return window.TTF_LIVE.series(f.sym); }))
      .then(function (results) {
        var series = {}, ok = 0;
        results.forEach(function (r, i) {
          series[FUNDS[i].sym] = r;
          if (r) ok++;
        });
        if (ok < FUNDS.length) return hide();   // a partial comparison is a misleading one

        var out = build(history, series);

        $("bench-cards").innerHTML = renderCards(out.totals);
        $("bench-rows").innerHTML  = renderRows(out.rows);

        var stamp = window.TTF_LIVE.asOfLabel(series.TQQQ.asOf);
        var gaps  = out.totals.reduce(function (n, t) { return n + t.missing; }, 0);
        $("bench-state").innerHTML =
          "Monthly and live prices from Yahoo Finance" + (stamp ? ", live as at " + stamp : "") +
          (gaps ? ". Some months had no published close and are carried forward." : ".");

        sec.classList.remove("hidden");
      })
      .catch(hide);
  }

  /* exposed for testing and for poking at in the browser console */
  window.TTF_BENCH = { build: build, FUNDS: FUNDS };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
