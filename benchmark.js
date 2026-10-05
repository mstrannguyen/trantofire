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

   1. The two comparison funds buy fractional shares. They have to: at QQQ's
      price a month's deployment often would not buy a single whole share. The
      fund actually held buys whole shares only, which strands cash, so this
      flatters the comparisons a little.

   2. The comparison funds are bought at their close on the day of the buy.
      The fund actually held is not simulated at all: its card uses the shares
      really bought at the price really paid, so it matches the log and the
      daily chart below the cards.

   3. Closing prices are corrected for splits but not for distributions, the
      same as everywhere else on this site. QQQ pays out the most of the
      three, so QQQ is the one understated by the most.

   4. The tier ladder is driven by the held fund's drawdown. A portfolio genuinely
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
        note: sym === sleeve.sym ? "what I actually hold"
              : m.mult === 1 ? m.index + ", unleveraged"
              : m.mult === 2 ? "twice the daily move"
              : "three times the daily move"
      };
    }).sort(function (a, b) { return a.n - b.n; });
  }

  function $(id) { return document.getElementById(id); }

  function hideCompare() {
    var blk = $("bench-chart-block");
    if (blk) blk.classList.add("hidden");
    var c = $("bench-chart");
    if (c) c.innerHTML = "";
  }

  /* This section used to delete itself whenever anything went wrong, which
     meant a broken fetch and a working-but-empty month looked identical: a
     hole in the page. It now stays put and says what it is waiting for. */
  function fail(reason) {
    var sec = $("bench");
    if (!sec) return;
    var cards = $("bench-cards");
    if (cards) cards.innerHTML = "";
    hideCompare();
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
    // one definition for the whole site, in live.js; this copy is only the fallback
    if (window.TTF_LIVE && window.TTF_LIVE.buyDate) {
      return window.TTF_LIVE.buyDate(row || { month: month }, ownDaily);
    }
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
    var state = {}, missing = {}, usedLive = {}, livePx = {};
    FUNDS.forEach(function (f) {
      state[f.sym]   = { shares: 0, cost: 0, lastPrice: null };
      missing[f.sym] = 0;
      usedLive[f.sym] = false;
      // today's price, needed inside the row loop as well as for the totals
      var d = dailies[f.sym];
      livePx[f.sym] = (series[f.sym] && series[f.sym].last) ||
                      (d && d.dates.length ? d.days[d.dates[d.dates.length - 1]] : null);
    });

    var rows = history.map(function (h) {
      var row = { month: h.month, label: h.label, spent: h.spent, on: null, px: {}, ret: {} };

      var when = buyDate(h.month, rawByMonth[h.month], dailies[ownSym]);
      row.on = when;

      FUNDS.forEach(function (f) {
        var s  = state[f.sym];

        /* The fund actually held is not simulated. It takes the shares the
           rules really bought, at the price really paid, so this card agrees
           with the chart below it and with the log. Valuing it like the
           others, cash divided by the day's close, gave a slightly different
           share count whenever the fill and the close differed, which is most
           days, and put two different returns for the same fund on one page. */
        if (f.sym === ownSym) {
          if (h.spent > 0) { s.shares += h.bought || 0; s.cost += h.spent; }
          var paid = h.fill || h.price;
          s.lastPrice   = paid;
          row.px[f.sym] = paid;
          var nowOwn = livePx[f.sym] || paid;
          row.ret[f.sym] = h.spent > 0 ? ((h.bought || 0) * nowOwn - h.spent) / h.spent : null;
          return;
        }

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
          row.ret[f.sym] = null;
          return;
        }

        var units = 0;
        if (h.spent > 0) {
          var cash = h.spent - h.fee;            // brokerage first, then shares
          if (cash > 0) units = cash / px;
          s.shares += units;
          s.cost += h.spent;                     // identical outlay, every fund
        }
        s.lastPrice    = px;
        row.px[f.sym]  = px;

        /* This month's buy, valued at today's price. Valuing it at the price it
           was bought at, which is what this did before, cancels down to minus
           the brokerage for every fund, so a 1x and a 3x fund showed the same
           figure and neither agreed with the cards above. */
        var now = livePx[f.sym] || px;
        row.ret[f.sym] = h.spent > 0 ? (units * now - h.spent) / h.spent : null;
      });

      return row;
    });

    var totals = FUNDS.map(function (f) {
      var s     = state[f.sym];
      var price = livePx[f.sym] || s.lastPrice;
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
        usedLive: usedLive[f.sym],
        own:      f.sym === ownSym
      };
    });

    return { rows: rows, totals: totals };
  }

  /* ---------- the same comparison, every trading day ----------

     The cards answer one question: where do the two stand today. This answers
     how they got there. On each buy day the real position takes on the shares
     the rules bought, and the unleveraged fund takes on whatever the same cash
     would have bought at that day's close, after the same brokerage. Every
     trading day after that, both are valued at that day's close and measured
     against the same running total of money spent.

     Both lines therefore share one denominator, which is what makes them
     comparable on one axis. The real line uses the shares actually held, whole
     shares only. The other buys fractions, same as the cards. */
  function buildDaily(history, dailies, rawByMonth, ownSym, baseSym) {
    var own = dailies[ownSym], base = dailies[baseSym];
    if (!own || !base || !own.dates.length || !base.dates.length) return null;

    var last = own.dates[own.dates.length - 1];
    var buys = [];
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      if (!(h.spent > 0)) continue;
      var on = buyDate(h.month, rawByMonth[h.month], own);
      if (on > last) on = last;              // a buy logged before its month has traded
      var bpx = closeOn(base, on);
      if (!(bpx > 0)) return null;           // one unpriceable buy spoils the comparison
      buys.push({ on: on, shares: h.shares, cost: h.spent,
                  units: (h.spent - h.fee) / bpx, label: h.label });
    }
    if (!buys.length) return null;
    buys.sort(function (a, b) { return a.on < b.on ? -1 : a.on > b.on ? 1 : 0; });

    var pts = [], j = -1, shares = 0, units = 0, cost = 0;
    own.dates.forEach(function (d) {
      if (d < buys[0].on || !(base.days[d] > 0)) return;
      var bought = false;
      while (j + 1 < buys.length && buys[j + 1].on <= d) {
        j++; shares = buys[j].shares; units += buys[j].units; cost += buys[j].cost; bought = true;
      }
      if (!(cost > 0)) return;
      pts.push({
        d: d, buy: bought, cost: cost,
        own:  (shares * own.days[d] - cost) / cost,
        base: (units * base.days[d] - cost) / cost
      });
    });
    return pts.length ? pts : null;
  }

  /* Every percentage this section prints goes through these two. A figure is
     rounded to one decimal first and everything else, the sign, the colour,
     the gap in the sentence under the chart, is decided from the rounded
     number. Otherwise a fund a hair under break even prints as minus zero,
     and two labels reading 3.5% and 1.2% sit above a sentence saying the gap
     is 2.4 points, which a reader doing the subtraction will not get. */
  function round1(v) { var r = Math.round(v * 1000) / 10; return r === 0 ? 0 : r; }
  function shownPct(v) { return window.TTF_ENGINE.signedPct(v); }

  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  /* Gold for the fund held, cobalt for the unleveraged one. ΔE 125 between
     them, the widest pair tested, and 126 and 118 under simulated
     deuteranopia and protanopia, because blue against yellow is the axis
     red-green colour blindness leaves intact.

     A gold bright enough to read as yellow is too pale for text on white, so
     the fund gets two shades: #B8860B for the line, shading and markers, at
     3.3:1, which clears the 3:1 that graphics need, and #8F6A10 for the
     figures printed in it, at 5.0:1, which clears the 4.5:1 text needs.
     Cobalt is 8.4:1 and does both jobs.

     The gold is 28.7 from the bright dip-tier yellow on the price chart and
     sits in the same family as the brass on the profit chart, which also
     means this fund's money. The cobalt is 41.8 from the record-high blue.
     The benchmark stays dashed, so colour is never the only signal. */
  var C_OWN = "#B8860B", C_OWN_TEXT = "#8F6A10", C_BASE = "#0047AB";

  function drawCompare(host, pts, ownSym, baseSym) {
    var E = window.TTF_ENGINE;
    var W = 880, H = 340, L = 62, R = 132, T = 24, B = 46, n = pts.length;

    var vals = [0];
    pts.forEach(function (p) { vals.push(p.own, p.base); });
    var hi = Math.max.apply(null, vals), lo = Math.min.apply(null, vals);
    var pad = (hi - lo) * 0.15 || 0.01;
    hi += pad; lo -= pad;

    var x = function (i) { return n < 2 ? (L + W - R) / 2 : L + (W - L - R) * (i / (n - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };

    var s = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img",
      "aria-label": ownSym + " against " + baseSym + ", return on the same money, every trading day" });
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
    var txt = function (x0, y0, str, attrs) {
      var a = { x: x0, y: y0, "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" };
      for (var k in attrs) a[k] = attrs[k];
      var t = svgEl("text", a); t.textContent = str; s.appendChild(t); return t;
    };

    var tk = E.ticks(lo, hi, 4);
    tk.values.forEach(function (gv) {
      var gy = y(gv);
      if (gv !== 0) s.appendChild(svgEl("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: "#3A2B31", "stroke-opacity": ".07" }));
      txt(L - 10, gy + 4, E.pct(gv, tk.step < 0.01 ? 1 : 0), { "text-anchor": "end" });
    });
    var z = y(0);
    s.appendChild(svgEl("line", { x1: L, y1: z, x2: W - R, y2: z, stroke: "#3A2B31", "stroke-opacity": ".5", "stroke-width": "1.4" }));
    txt(L + 4, z - 7, "break even", { fill: "#7A6A6F" });

    /* one label per month, on its first trading day, thinned so they never crowd */
    var firsts = [];
    pts.forEach(function (p, i) { if (i === 0 || p.d.slice(0, 7) !== pts[i - 1].d.slice(0, 7)) firsts.push(i); });
    var step = Math.max(1, Math.ceil(firsts.length / 8));
    firsts.forEach(function (i, k) {
      if (k % step) return;
      var d = pts[i].d;
      txt(x(i), H - B + 22, MONTHS[+d.slice(5, 7) - 1] + " " + d.slice(0, 4), { "text-anchor": "middle" });
    });

    var line = function (key) {
      return pts.map(function (p, i) { return (i ? "L" : "M") + x(i).toFixed(1) + "," + y(p[key]).toFixed(1); }).join(" ");
    };
    /* The space between the lines, tinted by whichever is ahead. A segment
       where they cross is split at the crossing so neither tint leaks onto the
       wrong side. */
    if (n > 1) {
      var ahead = "", behind = "";
      var P = function (xx, v) { return xx.toFixed(1) + "," + y(v).toFixed(1); };
      for (var i = 0; i < n - 1; i++) {
        var a = pts[i], b = pts[i + 1], x0 = x(i), x1 = x(i + 1);
        var d0 = a.own - a.base, d1 = b.own - b.base;
        if (d0 * d1 >= 0) {
          var poly = "M" + P(x0, a.own) + " L" + P(x1, b.own) + " L" + P(x1, b.base) + " L" + P(x0, a.base) + " Z ";
          if (d0 + d1 >= 0) ahead += poly; else behind += poly;
        } else {
          var t = d0 / (d0 - d1), xm = x0 + t * (x1 - x0), vm = a.own + t * (b.own - a.own);
          var first  = "M" + P(x0, a.own) + " L" + P(xm, vm) + " L" + P(x0, a.base) + " Z ";
          var second = "M" + P(xm, vm) + " L" + P(x1, b.own) + " L" + P(x1, b.base) + " Z ";
          if (d0 > 0) { ahead += first; behind += second; } else { behind += first; ahead += second; }
        }
      }
      if (ahead)  s.appendChild(svgEl("path", { d: ahead,  fill: C_OWN,  "fill-opacity": ".13", stroke: "none" }));
      if (behind) s.appendChild(svgEl("path", { d: behind, fill: C_BASE, "fill-opacity": ".13", stroke: "none" }));
    }

    if (n > 1) {
      s.appendChild(svgEl("path", { d: line("base"), fill: "none", stroke: C_BASE, "stroke-width": "2.2",
        "stroke-dasharray": "6 5", "stroke-linecap": "round", "stroke-linejoin": "round" }));
      s.appendChild(svgEl("path", { d: line("own"), fill: "none", stroke: C_OWN, "stroke-width": "2.4",
        "stroke-linecap": "round", "stroke-linejoin": "round" }));
    }

    /* each buy day marked on the real line, so a step in the line can be read
       against the money that caused it */
    pts.forEach(function (p, i) {
      if (!p.buy) return;
      s.appendChild(svgEl("circle", { cx: x(i), cy: y(p.own), r: "3.4", fill: "#FFFFFF", stroke: C_OWN, "stroke-width": "1.6" }));
    });

    /* end labels, placed after both are known so they cannot overlap */
    var lp = pts[n - 1];
    var ends = [
      { y: y(lp.own),  v: lp.own,  c: C_OWN,  tc: C_OWN_TEXT, name: ownSym },
      { y: y(lp.base), v: lp.base, c: C_BASE, tc: C_BASE,     name: baseSym }
    ];
    ends.forEach(function (e) {
      s.appendChild(svgEl("circle", { cx: x(n - 1), cy: e.y, r: "4.5", fill: e.c, stroke: "#FFFFFF", "stroke-width": "1.5" }));
    });
    ends.sort(function (a, b) { return a.y - b.y; });
    if (ends[1].y - ends[0].y < 36) ends[1].y = ends[0].y + 36;
    var over = ends[1].y + 16 - (H - B);
    if (over > 0) { ends[0].y -= over; ends[1].y -= over; }
    ends.forEach(function (e) {
      txt(W - R + 12, e.y - 1, shownPct(e.v), { "font-size": "16", "font-weight": "700", fill: e.tc });
      txt(W - R + 12, e.y + 15, e.name, { "font-size": "12", fill: e.tc });
    });

    host.innerHTML = ""; host.appendChild(s);
  }

  /* One sentence under the chart, worked out from the last point rather than
     typed, so it can never disagree with the lines above it. */
  function compareSummary(pts, ownSym, baseSym) {
    var E = window.TTF_ENGINE, lp = pts[pts.length - 1];
    var gap = round1(lp.own) - round1(lp.base);       // the gap between the two labels as shown
    var lead = Math.abs(gap) < 0.05
      ? ownSym + " and " + baseSym + " are level"
      : ownSym + " is " + Math.abs(gap).toFixed(1) + " percentage points " +
        (gap > 0 ? "ahead of " : "behind ") + baseSym;
    return "On the same " + E.usd(lp.cost) + ", " + lead + " as of the latest close.";
  }

  function renderCards(totals) {
    var E = window.TTF_ENGINE;
    var best = null;
    totals.forEach(function (t) {
      if (t.ret !== null && (best === null || t.ret > best)) best = t.ret;
    });

    return totals.map(function (t) {
      var lead = (t.ret !== null && t.ret === best) ? " lead" : "";
      var r1   = t.ret === null ? null : round1(t.ret);
      var down = r1 === null ? "" : (r1 < 0 ? " down" : r1 > 0 ? " up" : "");
      return '<div class="bcard' + lead + '">' +
        '<p class="bsym">' + t.sym + ' <span>' + t.mult + '</span></p>' +
        '<p class="bnote">' + t.note + '</p>' +
        '<p class="bval' + down + '">' + (t.ret === null ? "\u2014" : shownPct(t.ret)) + '</p>' +
        '<dl class="bstats">' +
          '<div><dt>Shares</dt><dd>' + (t.shares ? (t.own ? String(t.shares) : t.shares.toFixed(3)) : "\u2014") + '</dd></div>' +
          '<div><dt>They cost</dt><dd>' + E.usd(t.cost) + '</dd></div>' +
          '<div><dt>Worth now</dt><dd>' + E.usd(t.value) + '</dd></div>' +
          '<div><dt>Profit on shares</dt><dd>' + E.signedUsd(t.pl, 2) + '</dd></div>' +
          '<div><dt>Average cost</dt><dd>' + E.usd(t.avgCost, 2) + '</dd></div>' +
          '<div><dt>Price now</dt><dd>' + E.usd(t.price, 2) + '</dd></div>' +
        '</dl></div>';
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
        "going in is the same in all three. Only the leverage changes. " + howEach + ".";
    }
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
      })).concat([window.TTF_LIVE.withHighs ? window.TTF_LIVE.withHighs(sleeve) : null])
    )
      .then(function (results) {
        if (mine !== token) return;                 // a later tab click wins

        /* The same history the rest of the page uses, each month measured
           against its own record high. Without this the comparison could run
           off a different set of tiers, and so different amounts spent, from
           the log a few inches above it. */
        var withH = results[results.length - 1];
        if (withH && withH.rows) history = E.run(withH.rows, withH);
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

        /* Only the unleveraged fund goes on the chart. The 3x stays in the
           cards: three lines on one axis would bury the comparison that the
           chart exists to make. */
        var baseSym = null;
        (sleeve.bench || []).forEach(function (b) { if (META[b] && META[b].mult === 1) baseSym = b; });
        var pts = baseSym ? buildDaily(history, dailies, rawByMonth, sleeve.sym, baseSym) : null;
        var blk = $("bench-chart-block");
        if (pts && blk) {
          var h = $("bench-chart-h");
          if (h) h.textContent = sleeve.sym + " against " + baseSym + ", day by day";
          var lo = $("bench-lg-own"), lb = $("bench-lg-base");
          if (lo) lo.textContent = sleeve.sym + ", what the rules bought";
          if (lb) lb.textContent = baseSym + ", the same money on the same days";
          drawCompare($("bench-chart"), pts, sleeve.sym, baseSym);
          var sum = $("bench-chart-sum");
          if (sum) sum.textContent = compareSummary(pts, sleeve.sym, baseSym);
          blk.classList.remove("hidden");
        } else {
          hideCompare();
        }
    
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
  function cancel() { token++; hideCompare(); }

  /* Driven by the Progress page's tab controller, and exposed for poking at in
     the browser console. */
  window.TTF_BENCH = { render: render, cancel: cancel, build: build, fundsFor: fundsFor,
                       buildDaily: buildDaily };
})();
