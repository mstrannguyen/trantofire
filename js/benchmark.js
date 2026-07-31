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
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function hide() {
    var sec = $("bench");
    if (sec && sec.parentNode) sec.parentNode.removeChild(sec);
  }

  /* The close on a given day, or the nearest trading day before it. */
  function closeOn(d, dateKey) {
    if (!d || !dateKey) return null;
    if (d.days[dateKey] > 0) return d.days[dateKey];
    for (var i = d.dates.length - 1; i >= 0; i--) {
      if (d.dates[i] <= dateKey) return d.days[d.dates[i]];
    }
    return null;
  }

  /* Which day was this month's buy made on?

     If the log records a date, that is the answer. If it does not, the price
     in the log is still a fact, so the closest TQQQ close inside that month
     is used as the anchor. It is an inference and it is stated on the page,
     but it beats pricing a September buy at an August close. */
  function buyDate(month, row, tqqqDaily) {
    if (row && typeof row.date === "string" && row.date.length === 10) return row.date;
    if (!tqqqDaily || !(row && row.price > 0)) return null;

    var best = null, bestGap = Infinity;
    for (var i = 0; i < tqqqDaily.dates.length; i++) {
      var k = tqqqDaily.dates[i];
      if (k.slice(0, 7) !== month) continue;
      var gap = Math.abs(tqqqDaily.days[k] - row.price);
      if (gap < bestGap) { bestGap = gap; best = k; }
    }
    return best;
  }

  /* Walk the log once, spending the same cash in every fund. */
  function build(history, series, dailies, rawByMonth) {
    var state = {}, missing = {}, usedLive = {};
    FUNDS.forEach(function (f) {
      state[f.sym]   = { shares: 0, cost: 0, lastPrice: null };
      missing[f.sym] = 0;
      usedLive[f.sym] = false;
    });

    var rows = history.map(function (h) {
      var row = { month: h.month, label: h.label, spent: h.spent, on: null, px: {}, ret: {} };

      var when = buyDate(h.month, rawByMonth[h.month], dailies.TQQQ);
      row.on = when;

      FUNDS.forEach(function (f) {
        var s  = state[f.sym];

        // the close on the day of the buy, else the month's close if the
        // daily window does not reach back that far
        var px = closeOn(dailies[f.sym], when);
        if (!(px > 0)) px = series[f.sym] ? series[f.sym].months[h.month] : null;

        // No live-price stand-in here. Pricing a month at today's price makes
        // every fund show the same return, because the only difference from
        // cost is the brokerage. A month without a published close is simply
        // not comparable yet, so it waits.

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
        missing:  missing[f.sym],
        usedLive: usedLive[f.sym]
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
      var down = t.ret === null ? "" : (t.ret < 0 ? " down" : " up");
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
        '<td class="mth">' + r.label +
          (r.on ? '<span class="bpx">' + esc(r.on) + "</span>" : "") + "</td>" +
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

    var cfg = window.TTF;
    if (!cfg || !isFinite(cfg.CONTRIBUTION) || !isFinite(cfg.HIGH_WATER_MARK)) return hide();

    var history = E.run(window.TTF_DATA || [], cfg);
    if (!history.length) return hide();

    // A month that produced no usable outlay means the engine could not run.
    // Better to show nothing than a grid of dashes that looks like a result.
    var usable = history.some(function (h) { return isFinite(h.spent) && h.spent > 0; });
    if (!usable) return hide();

    var rawByMonth = {};
    (window.TTF_DATA || []).forEach(function (r) { if (r && r.month) rawByMonth[r.month] = r; });

    Promise.all(
      FUNDS.map(function (f) { return window.TTF_LIVE.series(f.sym); }).concat(
      FUNDS.map(function (f) {
        return window.TTF_LIVE.daily ? window.TTF_LIVE.daily(f.sym) : null;
      }))
    )
      .then(function (results) {
        var series = {}, dailies = {}, ok = 0;
        FUNDS.forEach(function (f, i) {
          series[f.sym]  = results[i];
          dailies[f.sym] = results[i + FUNDS.length] || null;
          if (results[i]) ok++;
        });
        if (ok < FUNDS.length) return hide();   // a partial comparison is a misleading one

        var out   = build(history, series, dailies, rawByMonth);
        var stamp = window.TTF_LIVE.asOfLabel(series.TQQQ.asOf);
        var table = sec.querySelector(".table-scroll");

        /* A month needs a published monthly close before it can be compared.
           Pricing an unclosed month at today\'s price makes all three funds
           show the same return, because the only difference from cost is the
           brokerage. So the section stays on the page and says what it is
           waiting for, rather than vanishing or inventing a number. */
        var priced = out.totals.some(function (t) { return t.shares > 0; });
        if (!priced) {
          $("bench-cards").innerHTML = "";
          $("bench-rows").innerHTML  = "";
          if (table) table.style.display = "none";
          $("bench-state").innerHTML =
            "Waiting on a published monthly close for " + history[history.length - 1].label +
            ". Until a month has closed, all three funds would price at today\'s price and " +
            "show the same return, which compares nothing. This fills in on its own once " +
            "Yahoo publishes the close.";
          sec.classList.remove("hidden");
          return;
        }

        if (table) table.style.display = "";
        $("bench-cards").innerHTML = renderCards(out.totals);
        $("bench-rows").innerHTML  = renderRows(out.rows);

        var gaps  = out.totals.reduce(function (n, t) { return n + t.missing; }, 0);
        var dated = out.rows.filter(function (r) { return r.on; }).length;
        $("bench-state").innerHTML =
          "Prices from Yahoo Finance" + (stamp ? ", live as at " + stamp : "") + ". " +
          (dated
            ? "Each month is priced on the day the buy was made, using every fund's close that day."
            : "Months are priced at their closing price.") +
          (gaps ? " Months with no price available are left out until they have one." : "");

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
