/* Home page, "How it works": dollar-cost averaging and the ladder, both run
   through QLD's fall of 2022.

   Two charts of the same 29 months. QLD closed 2021 at $44.51, was $17.52 a
   year later, and on 31 May 2024 closed a month above where it started for
   the first time, at $44.56. Each chart starts with nothing and puts in $800
   on the first trading day of every month from January 2022.

     Dollar-cost averaging   all $800 is spent, whatever the price. The bars
                             under the chart are the shares it bought.
     Buying the dips         the same $800 goes into the cash on hand, and the
                             ladder decides how much of that cash is spent.
                             The bars are the dollars spent, in the colour of
                             the rung.

   THE RULES ARE NOT WRITTEN HERE. The share of the cash comes from
   TTF_ENGINE.tierFor, the same function the Progress page runs, so these
   charts cannot drift from the ladder printed above them.

   THE PRICES ARE HELD IN THIS FILE: QLD's last close of each month as it
   traded then, from Digrin's price history. They agree with ChartRow's
   year-end prices for 2021, 2022 and 2023, and the same source agrees with
   Yahoo Finance to the cent on the twelve month-ends from October 2025 that
   were checked. QLD split two for one in November 2025, so each close is
   halved to put it on today's share count (SPLIT).

   HIGH is the highest price QLD had traded before the fall, on 22 November
   2021, on today's share count. Month-end closes cannot show it, so it is
   worked out from QQQ's high that day: QLD's close the day before, moved by
   twice QQQ's move to its high. The same sum gives Yahoo's daily highs for
   2025 and 2026 to within a few cents. No month in these charts sits within
   half a percent of a rung, so a few cents either way changes nothing.

   Each buy is sized and filled at the last close before it. Fractions of a
   share are allowed. Distributions, interest on the reserve, brokerage,
   currency and tax are left out. This is history and does not go stale: the
   only reason to edit this file is another split, which changes SPLIT and
   HIGH and every price the page prints.

   The page prints figures these charts work out: the two captions, the table
   under the charts and the paragraphs after it. Change a price here and
   those change too.

   Orange is the fund, as everywhere on the site. Blue is the record high.
   The rung colours are the tier colours. Pure SVG through js/chartkit.js,
   drawn at the width it is shown at. Moving a pointer or a finger across a
   chart reads out the month under it. */
(function () {
  "use strict";

  var CK = window.TTF_CHART, E = window.TTF_ENGINE;
  if (!CK || !E || !E.tierFor) return;

  var MONTHLY = 800;
  var SPLIT = 2;         // two for one, November 2025
  var HIGH = 47.26;      // 22 November 2021, on today's share count
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* One row a buy: the day of the close it was sized on, that close as it
     traded then, and the day of the buy (the next trading day). */
  var ROWS = [
    ["2021-12-31", 89.02, "2022-01-03"],
    ["2022-01-31", 73.71, "2022-02-01"],
    ["2022-02-28", 66.67, "2022-03-01"],
    ["2022-03-31", 71.92, "2022-04-01"],
    ["2022-04-29", 53.20, "2022-05-02"],
    ["2022-05-31", 50.67, "2022-06-01"],
    ["2022-06-30", 41.41, "2022-07-01"],
    ["2022-07-29", 52.02, "2022-08-01"],
    ["2022-08-31", 46.37, "2022-09-01"],
    ["2022-09-30", 36.66, "2022-10-03"],
    ["2022-10-31", 39.08, "2022-11-01"],
    ["2022-11-30", 42.90, "2022-12-01"],
    ["2022-12-30", 35.04, "2023-01-03"],
    ["2023-01-31", 42.47, "2023-02-01"],
    ["2023-02-28", 41.73, "2023-03-01"],
    ["2023-03-31", 49.57, "2023-04-03"],
    ["2023-04-28", 49.74, "2023-05-01"],
    ["2023-05-31", 57.32, "2023-06-01"],
    ["2023-06-30", 64.38, "2023-07-03"],
    ["2023-07-31", 69.03, "2023-08-01"],
    ["2023-08-31", 66.28, "2023-09-01"],
    ["2023-09-29", 59.35, "2023-10-02"],
    ["2023-10-31", 56.42, "2023-11-01"],
    ["2023-11-30", 68.71, "2023-12-01"],
    ["2023-12-29", 76.00, "2024-01-02"],
    ["2024-01-31", 78.20, "2024-02-01"],
    ["2024-02-29", 86.04, "2024-03-01"],
    ["2024-03-28", 87.48, "2024-04-01"],
    ["2024-04-30", 79.32, "2024-05-01"]
  ];
  var END = ["2024-05-31", 89.12];     // the close both holdings are valued at

  function ms(d) { var p = d.split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function dayStr(d) { var p = d.split("-"); return (+p[2]) + " " + MONTHS[+p[1] - 1] + " " + p[0]; }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function cents(v) { var c = Math.round(v * 100 + 1e-7); return commas(Math.floor(c / 100)) + "." + ("0" + (c % 100)).slice(-2); }
  function usd(v) { return "US$" + cents(v); }
  function usd0(v) { return "US$" + commas(Math.round(v)); }

  /* Both buyers, month by month. */
  var B = (function () {
    var dS = 0, lS = 0, cash = 0, put = 0, rows = [];
    ROWS.forEach(function (r) {
      var p = r[1] / SPLIT, dd = p / HIGH - 1, tier = E.tierFor(dd);
      put += MONTHLY; cash += MONTHLY;
      var had = cash, spend = tier.pct * had;
      cash -= spend; dS += MONTHLY / p; lS += spend / p;
      rows.push({ t: ms(r[0]), buy: r[2], p: p, dd: dd, tier: tier, had: had, spend: spend, shares: MONTHLY / p });
    });
    var pe = END[1] / SPLIT, spent = put - cash;
    return { rows: rows, end: { t: ms(END[0]), day: END[0], p: pe }, put: put, cash: cash,
             dS: dS, lS: lS, dAvg: put / dS, lAvg: spent / lS,
             lo: Math.min.apply(null, rows.map(function (x) { return x.spend; })),
             hi: Math.max.apply(null, rows.map(function (x) { return x.spend; })) };
  })();

  function rungColour(tier) { return [CK.K.up, CK.K.h1, CK.K.h2, CK.K.h3][tier.n] || CK.K.up; }

  var CHARTS = {
    dca: {
      name: "Dollar-cost averaging", avg: B.dAvg,
      bar: function (r) { return r.shares; }, barMax: 52, barGrid: [20, 40],
      barFmt: function (v) { return String(v); }, barNote: "shares each US$800 bought"
    },
    ladder: {
      name: "Buying the dips", avg: B.lAvg, rungs: true,
      bar: function (r) { return r.spend; }, barMax: 1750, barGrid: [800, 1600],
      barFmt: function (v) { return "$" + commas(v); }, barNote: "dollars the ladder spent"
    }
  };

  /* What each chart says before a pointer is on it, and what the page prints
     if this file never runs. Keep the two the same. */
  function resting(C) {
    var n = B.rows.length;
    return C.rungs
      ? n + " buys from " + usd0(B.lo) + " to " + usd0(B.hi) + " at an average of " + usd(B.lAvg) + " a share"
      : n + " buys of " + usd0(MONTHLY) + " at an average of " + usd(B.dAvg) + " a share";
  }

  /* One month, in words. */
  function month(C, k) {
    var n = B.rows.length;
    if (k >= n) {
      return C.rungs
        ? dayStr(B.end.day) + ": " + B.lS.toFixed(1) + " shares worth " + usd0(B.lS * B.end.p) + ", and " + usd0(B.cash) + " in reserve"
        : dayStr(B.end.day) + ": " + B.dS.toFixed(1) + " shares worth " + usd0(B.dS * B.end.p) + " at " + usd(B.end.p);
    }
    var r = B.rows[k];
    if (!C.rungs) return dayStr(r.buy) + ": " + usd0(MONTHLY) + " bought " + r.shares.toFixed(1) + " shares at " + usd(r.p);
    var under = (-r.dd * 100).toFixed(1) + "% under the high";
    return dayStr(r.buy) + ": " + usd(r.p) + " is " + under + ". Spent " +
      (r.tier.pct >= 1 ? "all " + usd(r.spend) : Math.round(r.tier.pct * 100) + "% of " + usd(r.had) + ": " + usd(r.spend));
  }

  function paint(host, read, C) {
    var rows = B.rows, n = rows.length, x0 = rows[0].t, x1 = B.end.t;

    CK.fit(host, 560, function (W) {
      var H = Math.round(Math.max(330, Math.min(400, W * 0.74)));
      var L = 46, R = 54, T = 14, BT = 28, GAP = 34, IN = 7;   // IN: room for half a bar inside the left edge
      var barH = Math.round((H - T - BT - GAP) * 0.3), topH = H - T - BT - GAP - barH;
      var yT1 = T + topH, yB0 = yT1 + GAP, yB1 = H - BT;
      var PLO = 13, PHI = 50;
      var el = CK.el;
      var xf = function (t) { return L + IN + (W - L - R - IN) * (t - x0) / (x1 - x0); };
      var yf = function (p) { return T + topH * (1 - (p - PLO) / (PHI - PLO)); };
      var bf = function (v) { return yB1 - barH * v / C.barMax; };
      var d2 = function (pts) { return pts.map(function (p, k) { return (k ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); };

      var low = rows.reduce(function (m, r) { return r.p < m.p ? r : m; });
      var s = CK.svg(host, W, H, C.name + ": QLD's month-end closes from " + dayStr(ROWS[0][0]) + " to " + dayStr(B.end.day) +
        ", from " + usd(rows[0].p) + " down to " + usd(low.p) + " and back to " + usd(B.end.p) + ". " + resting(C) + ". " +
        (C.rungs ? "Bars under the chart show the dollars spent each month, by rung."
                 : "Bars under the chart show the shares each purchase bought, from " + rows[0].shares.toFixed(1) + " to " + (MONTHLY / low.p).toFixed(1) + "."));

      var pts = rows.map(function (r) { return [xf(r.t), yf(r.p)]; });
      pts.push([xf(B.end.t), yf(B.end.p)]);
      var placed = [], levels = [];

      // the price panel: dollars on one chart, the rungs on the other
      if (C.rungs) {
        var hy = yf(HIGH);
        s.appendChild(el("line", { x1: L, y1: hy.toFixed(1), x2: W - R, y2: hy.toFixed(1), stroke: CK.K.blue, "stroke-width": "1.5", "stroke-dasharray": "5 4" }));
        levels.push(hy);
        CK.text(s, L - 8, hy + 4, "high", { "text-anchor": "end", fill: CK.txt(CK.K.blue) });
        E.TIERS.forEach(function (t) {
          if (!t.at) return;
          var gy = yf(HIGH * (1 - t.at)), c = rungColour(t);
          s.appendChild(el("line", { x1: L, y1: gy.toFixed(1), x2: W - R, y2: gy.toFixed(1), stroke: c, "stroke-opacity": ".55" }));
          levels.push(gy);
          CK.text(s, L - 8, gy + 4, "−" + Math.round(t.at * 100) + "%", { "text-anchor": "end", fill: CK.txt(c) });
        });
      } else {
        [20, 30, 40].forEach(function (v) {
          var gy = yf(v);
          s.appendChild(el("line", { x1: L, y1: gy.toFixed(1), x2: W - R, y2: gy.toFixed(1), stroke: CK.K.ink, "stroke-opacity": ".09" }));
          CK.text(s, L - 8, gy + 4, "$" + v, { "text-anchor": "end" });
        });
      }

      // the bar panel
      s.appendChild(el("line", { x1: L, y1: yB1, x2: W - R, y2: yB1, stroke: CK.K.ink, "stroke-opacity": ".3" }));
      C.barGrid.forEach(function (v) {
        var gy = bf(v);
        s.appendChild(el("line", { x1: L, y1: gy.toFixed(1), x2: W - R, y2: gy.toFixed(1), stroke: CK.K.ink, "stroke-opacity": ".09" }));
        CK.text(s, L - 8, gy + 4, C.barFmt(v), { "text-anchor": "end" });
      });
      CK.text(s, L, yB0 - 9, C.barNote, { "font-size": "11", fill: CK.K.greyText });
      var step = (W - L - R - IN) / n, bw = Math.max(2, Math.min(11, step * 0.62));
      rows.forEach(function (r, k) {
        var v = C.bar(r), by = bf(v);
        s.appendChild(el("rect", { x: (pts[k][0] - bw / 2).toFixed(1), y: by.toFixed(1), width: bw.toFixed(1), height: Math.max(1, yB1 - by).toFixed(1),
          rx: Math.min(1.5, bw / 3).toFixed(1), fill: C.rungs ? rungColour(r.tier) : CK.K.ink, "fill-opacity": C.rungs ? "1" : ".55" }));
      });

      CK.thin([2022, 2023, 2024].map(function (y) {
        var t = Math.max(x0, Date.UTC(y, 0, 1));
        return CK.text(s, xf(t), H - 9, y, { "text-anchor": t === x0 ? "start" : "middle" });
      }), 8);

      // the average price paid, the price, and each purchase on it
      var ay = yf(C.avg);
      s.appendChild(el("line", { x1: L, y1: ay.toFixed(1), x2: W - R, y2: ay.toFixed(1), stroke: CK.K.ink, "stroke-width": "1.5", "stroke-dasharray": "5 4", "stroke-opacity": ".8" }));
      s.appendChild(el("path", { d: d2(pts), fill: "none", stroke: CK.K.orange, "stroke-width": "2", "stroke-linejoin": "round", "stroke-linecap": "round" }));
      rows.forEach(function (r, k) {
        s.appendChild(el("circle", { cx: pts[k][0].toFixed(1), cy: pts[k][1].toFixed(1), r: W < 420 ? "2.2" : "2.8",
          fill: C.rungs ? rungColour(r.tier) : CK.K.ink, stroke: CK.K.card, "stroke-width": "1" }));
      });
      var last = pts[n];
      s.appendChild(el("circle", { cx: last[0].toFixed(1), cy: last[1].toFixed(1), r: "4", fill: CK.K.orange, stroke: CK.K.card, "stroke-width": "2" }));

      // the words on the price panel: where it ended, where it began, the low, the average
      var endT = CK.text(s, W - R + 8, last[1] + 4, "$" + cents(B.end.p), { "font-size": "12", "font-weight": "600", fill: CK.txt(CK.K.orange) });
      var eb = CK.box(endT); if (eb) placed.push(eb);
      /* A label on the price panel, put at the first of its places that is
         inside the panel, clear of the labels already there and not crossed by
         the price. Each place is [anchor, x, y]. */
      var note = function (str, places, attrs) {
        var a = { "font-size": "12", "font-weight": "600", fill: CK.K.ink }, k;
        for (k in attrs) a[k] = attrs[k];
        var t = CK.text(s, 0, 0, str, a), best = null;
        for (var q = 0; q < places.length; q++) {
          t.setAttribute("text-anchor", places[q][0]); t.setAttribute("x", places[q][1].toFixed(1)); t.setAttribute("y", places[q][2].toFixed(1));
          var b = CK.box(t); if (!b) break;
          var bad = (b.x < L + 2 || b.x + b.width > W - R - 2 || b.y < T || b.y + b.height > yT1 + 2 ? 5 : 0) +
                    (placed.some(function (o) { return CK.overlap(b, o); }) ? 4 : 0) + (CK.crosses(b, [pts]) ? 3 : 0);
          if (best === null || bad < best.bad) best = { q: q, bad: bad };
          if (!bad) break;
        }
        if (best) { var u = places[best.q]; t.setAttribute("text-anchor", u[0]); t.setAttribute("x", u[1].toFixed(1)); t.setAttribute("y", u[2].toFixed(1)); }
        CK.plate(s, t, 2);
        var fb = CK.box(t); if (fb) placed.push(fb);
      };
      var li = rows.indexOf(low), sx = pts[0][0], sy = pts[0][1], lx = pts[li][0], ly = pts[li][1];
      note("$" + cents(rows[0].p), [["start", sx + 9, sy + 4], ["start", sx + 9, sy + 16], ["start", sx + 12, sy - 8]]);
      note("$" + cents(low.p), [["middle", lx, ly + 17], ["end", lx - 8, ly + 14], ["start", lx + 8, ly + 14], ["middle", lx, ly - 9]]);
      // the average's name keeps clear of the rung lines as well
      levels.forEach(function (gy) { placed.push({ x: L, y: gy - 2, width: W - L - R, height: 4 }); });
      note("average paid $" + cents(C.avg), [["end", W - R - 4, ay + 15], ["end", W - R - 4, ay - 7], ["start", L + 4, ay + 15], ["start", L + 4, ay - 7]],
        { "font-size": "11.5", "font-weight": "400" });

      // the month under a pointer or a finger
      var hair = el("line", { x1: 0, y1: T, x2: 0, y2: yB1, stroke: CK.K.ink, "stroke-opacity": ".45", "stroke-width": "1", visibility: "hidden" });
      var dot = el("circle", { r: "4.5", fill: CK.K.orange, stroke: CK.K.card, "stroke-width": "2", visibility: "hidden" });
      s.appendChild(hair); s.appendChild(dot);
      var pad = el("rect", { x: L, y: T, width: W - L - R, height: yB1 - T, fill: "#fff", "fill-opacity": "0" });
      s.appendChild(pad);

      function show(clientX) {
        var box = s.getBoundingClientRect();
        if (!box.width) return;
        var px = (clientX - box.left) * W / box.width, k = 0, gap = Infinity;
        pts.forEach(function (p, i) { var g = Math.abs(p[0] - px); if (g < gap) { gap = g; k = i; } });
        hair.setAttribute("x1", pts[k][0].toFixed(1)); hair.setAttribute("x2", pts[k][0].toFixed(1)); hair.setAttribute("visibility", "visible");
        dot.setAttribute("cx", pts[k][0].toFixed(1)); dot.setAttribute("cy", pts[k][1].toFixed(1)); dot.setAttribute("visibility", "visible");
        if (read) read.textContent = month(C, k);
      }
      function hide() {
        hair.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden");
        if (read) read.textContent = resting(C);
      }
      pad.addEventListener("pointermove", function (e) { show(e.clientX); });
      pad.addEventListener("pointerdown", function (e) { show(e.clientX); });
      pad.addEventListener("pointerleave", hide);
      pad.addEventListener("pointercancel", hide);
    });

    if (read) read.textContent = resting(C);
  }

  function start() {
    [["dca", "dp-dca"], ["ladder", "dp-ladder"]].forEach(function (p) {
      var host = document.getElementById(p[1]);
      if (host) paint(host, document.getElementById(p[1] + "-read"), CHARTS[p[0]]);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
