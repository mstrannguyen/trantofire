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

  /* Which funds a sleeve is compared against comes from js/config.js. This is
     only the wording and the multiple for each ticker. The sleeve's own fund
     joins its two comparators and the three are ordered by leverage, which for
     the S&P side puts the fund actually held in the middle rather than at the
     end. */
  var META = {
    QQQ:  { mult: 1, index: "Nasdaq-100" },
    QLD:  { mult: 2, index: "Nasdaq-100" },
    TQQQ: { mult: 3, index: "Nasdaq-100" },
    VOO:  { mult: 1, index: "S&P 500" },
    SSO:  { mult: 2, index: "S&P 500" },
    UPRO: { mult: 3, index: "S&P 500" }
  };

  function fundsFor(sleeve) {
    var syms = (sleeve.bench || []).concat([sleeve.sym]);
    return syms.map(function (sym) {
      var m = META[sym] || { mult: 0, index: "" };
      return {
        sym:  sym,
        mult: m.mult + "\u00d7",
        n:    m.mult,
        index: m.index,
        note: sym === sleeve.sym ? "what I actually buy"
              : m.mult === 1 ? m.index + ", unleveraged"
              : m.mult === 2 ? "twice the daily move"
              : "three times the daily move"
      };
    }).sort(function (a, b) { return a.n - b.n; });
  }

  function $(id) { return document.getElementById(id); }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* This section used to delete itself whenever anything went wrong, which
     meant a broken fetch and a working-but-empty month looked identical: a
     hole in the page. It now stays put and says what it is waiting for. */
  function fail(reason) {
    var sec = $("bench");
    if (!sec) return;
    var cards = $("bench-cards"), rows = $("bench-rows");
    var table = sec.querySelector(".table-scroll");
    if (cards) cards.innerHTML = "";
    if (rows)  rows.innerHTML  = "";
    if (table) table.style.display = "none";
    var state = $("bench-state");
    if (state) state.textContent = reason;
    sec.classList.remove("hidden");
    if (window.console) console.warn("[Tran to Fire] benchmark: " + reason);
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
     in the log is still a fact, so the closest close for the fund actually
     held, inside that month, is used as the anchor. It is an inference and it is stated on the page,
     but it beats pricing a September buy at an August close. */
  function buyDate(month, row, ownDaily) {
    if (row && typeof row.date === "string" && row.date.length === 10) return row.date;

    if (ownDaily && row && row.price > 0) {
      var best = null, bestGap = Infinity;
      for (var i = 0; i < ownDaily.dates.length; i++) {
        var k = ownDaily.dates[i];
        if (k.slice(0, 7) !== month) continue;
        var gap = Math.abs(ownDaily.days[k] - row.price);
        if (gap < bestGap) { bestGap = gap; best = k; }
      }
      if (best) return best;
    }

    /* No trading day inside that month yet. This happens at the start of a
       month, and on any buy logged before the market has opened in it. The
       last day of the month is returned so that closeOn walks back to the
       most recent close available, which is a far better answer than none. */
    return month + "-28";
  }

  /* Walk the log once, spending the same cash in every fund. */
  function build(history, series, dailies, rawByMonth, FUNDS, ownSym) {
    var state = {}, missing = {}, usedLive = {};
    FUNDS.forEach(function (f) {
      state[f.sym]   = { shares: 0, cost: 0, lastPrice: null };
      missing[f.sym] = 0;
      usedLive[f.sym] = false;
    });

    var rows = history.map(function (h) {
      var row = { month: h.month, label: h.label, spent: h.spent, on: null, px: {}, ret: {} };

      var when = buyDate(h.month, rawByMonth[h.month], dailies[ownSym]);
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
      var d     = dailies[f.sym];
      var price = (series[f.sym] && series[f.sym].last) ||
                  (d && d.dates.length ? d.days[d.dates[d.dates.length - 1]] : null) ||
                  s.lastPrice;
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

  function renderRows(rows, FUNDS) {
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

  /* The Progress page calls this on every tab change, so a comparison still in
     flight for the fund you have just left must not paint over the one you have
     just opened. */
  var token = 0;

  function headings(FUNDS, sleeve) {
    var others = FUNDS.filter(function (f) { return f.sym !== sleeve.sym; })
                      .map(function (f) { return f.sym; });
    var title = $("bench-title");
    if (title) title.textContent = "What if it had gone into " + others.join(" or ") + " instead.";

    var howEach = FUNDS.map(function (f) {
      return f.n === 1 ? f.sym + " tracks the " + f.index + " with no leverage"
           : f.n === 2 ? f.sym + " doubles the daily move"
           : f.sym + " triples it";
    }).join(", ");

    var lede = $("bench-lede");
    if (lede) {
      lede.textContent = "The rules decide how much cash leaves the account each month. " +
        "This spends that same amount on two other funds tracking the same index, at the price " +
        "each closed at on the day of the buy, and prices the result at today's market. The money " +
        "going in is the same in all three columns. Only the leverage changes. " + howEach + ".";
    }
    FUNDS.forEach(function (f, i) {
      var th = $("bench-h" + (i + 1));
      if (th) th.innerHTML = f.sym + " " + f.mult;
    });
  }

  function render(sleeve) {
    var mine = ++token;
    var E = window.TTF_ENGINE;
    var sec = $("bench");
    if (!sec || !sleeve) return;
    if (!E || !window.TTF_LIVE || !window.TTF_LIVE.series) {
      return fail("Comparison unavailable: a script did not load. Check that js/engine.js and js/live.js are deployed.");
    }

    if (!window.TTF || !isFinite(sleeve.CONTRIBUTION)) {
      return fail("Comparison unavailable: js/config.js did not load.");
    }

    var FUNDS = fundsFor(sleeve);
    headings(FUNDS, sleeve);

    var history = E.run(sleeve.rows || [], sleeve);
    if (!history.length) {
      return fail("Nothing logged yet. The comparison starts with the first buy.");
    }

    // A month that produced no usable outlay means the engine could not run.
    // Better to show nothing than a grid of dashes that looks like a result.
    var usable = history.some(function (h) { return isFinite(h.spent) && h.spent > 0; });
    if (!usable) {
      return fail("Nothing deployed yet, so there is nothing to compare.");
    }

    var rawByMonth = {};
    (sleeve.rows || []).forEach(function (r) { if (r && r.month) rawByMonth[r.month] = r; });

    Promise.all(
      FUNDS.map(function (f) { return window.TTF_LIVE.series(f.sym); }).concat(
      FUNDS.map(function (f) {
        return window.TTF_LIVE.daily ? window.TTF_LIVE.daily(f.sym) : null;
      }))
    )
      .then(function (results) {
        if (mine !== token) return;                 // a later tab click wins
        var series = {}, dailies = {}, ok = 0;
        FUNDS.forEach(function (f, i) {
          series[f.sym]  = results[i];
          dailies[f.sym] = results[i + FUNDS.length] || null;
          if (results[i]) ok++;
        });
        // A fund needs a price source, but either one will do: daily closes do
        // the pricing and monthly is only the fallback for older months. Only
        // give up when a fund has neither.
        var usable = FUNDS.filter(function (f) {
          return series[f.sym] || dailies[f.sym];
        }).length;
        if (usable < FUNDS.length) {
          var dead = FUNDS.filter(function (f) { return !series[f.sym] && !dailies[f.sym]; })
                          .map(function (f) { return f.sym; }).join(", ");
          return fail("Prices unavailable for " + dead + ". Yahoo did not answer, or the " +
                      "/api routes in _redirects are not deployed.");
        }

        var out   = build(history, series, dailies, rawByMonth, FUNDS, sleeve.sym);
        var own   = series[sleeve.sym];
        var stamp = (own && own.asOf) ? window.TTF_LIVE.asOfLabel(own.asOf) : "";
        var table = sec.querySelector(".table-scroll");

        /* A month needs a published monthly close before it can be compared.
           Pricing an unclosed month at today\'s price makes all three funds
           show the same return, because the only difference from cost is the
           brokerage. So the section stays on the page and says what it is
           waiting for, rather than vanishing or inventing a number. */
        var priced = out.totals.some(function (t) { return t.shares > 0; });
        if (!priced) {
          return fail("No price found yet for " + history[history.length - 1].label +
                      ". The comparison fills in as soon as one is published.");
        }

        if (table) table.style.display = "";
        $("bench-cards").innerHTML = renderCards(out.totals);
        $("bench-rows").innerHTML  = renderRows(out.rows, FUNDS);

        var gaps = out.totals.reduce(function (n, t) { return n + t.missing; }, 0);
        var back = out.rows.some(function (r) {
          return r.on && String(r.on).slice(-2) === "28" && r.month + "-28" === r.on;
        });
        $("bench-state").innerHTML =
          "Prices from Yahoo Finance" + (stamp ? ", live as at " + stamp : "") + ". " +
          "Each month is priced on the day of the buy, using every fund's close that day." +
          (back ? " Where the market has not traded yet in a logged month, the most recent close before it is used instead." : "") +
          (gaps ? " Months with no price at all are left out until they have one." : "");

        sec.classList.remove("hidden");
      })
      .catch(function (e) {
        fail("Comparison could not be built: " + (e && e.message ? e.message : e));
      });
  }

  /* Switching to the combined tab hides this section, but a comparison already
     in flight would finish and show itself again. cancel() retires the token so
     the late reply lands nowhere. */
  function cancel() { token++; }

  /* Driven by the Progress page's tab controller, and exposed for poking at in
     the browser console. */
  window.TTF_BENCH = { render: render, cancel: cancel, build: build, fundsFor: fundsFor };
})();
