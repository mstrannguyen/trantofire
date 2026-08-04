/* Home-page growth chart: QQQ, QLD, a synthetic 3x QQQ line and TQQQ, from the
   end of 2010. Compounded Yahoo Finance annual total returns, held in this
   file, stopping at the last complete year.

   Colour carries the multiple: green is the plain index, terracotta is 2x,
   brass is 3x.

   Pure SVG, no library, log scale, defensive against a missing host. */
(function () {
  "use strict";

  var START = 10000;

  function money(v) {
    if (v >= 1000000) {
      var m = v / 1000000;
      return "$" + (m >= 10 || m === Math.round(m) ? Math.round(m) : m.toFixed(2)) + "M";
    }
    if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
    return "$" + Math.round(v);
  }

  function el(tag, a) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }

  /* ---------------------------------------------------------------------
     The painter, shared by both charts.

     Label colours are darker relatives of the line colours, dark enough to
     read at this size: 5.0 to 7.3 to one against the card, where the lines
     themselves only have to clear the 3:1 that non-text needs. Separated by
     measuring RGB distance rather than by eye, the closest pair of lines
     sitting 62 apart and the closest pair of labels 47.
     --------------------------------------------------------------------- */
  function paint(host, o) {
    var W = 900, H = 430, L = 66, R = 120, T = 20, B = 46;

    var xf = function (x) { return L + (W - L - R) * (x - o.x0) / (o.x1 - o.x0); };
    var lg = function (v) { return Math.log10(v); };
    var yf = function (v) { return T + (H - T - B) * (1 - (lg(v) - lg(o.lo)) / (lg(o.hi) - lg(o.lo))); };

    var s = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img",
      "aria-label": "Growth of $10,000 in " +
        o.series.map(function (p) { return p.name; }).join(", ") +
        " from " + o.startLabel + ", log scale" });
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");

    o.grid.forEach(function (v) {
      var gy = yf(v);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy,
        stroke: "#3A2B31", "stroke-opacity": ".10" }));
      var t = el("text", { x: L - 12, y: gy + 4, "text-anchor": "end",
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = money(v);
      s.appendChild(t);
    });

    o.ticks.forEach(function (tk) {
      var frac = (tk.x - o.x0) / (o.x1 - o.x0);
      var t = el("text", { x: xf(tk.x), y: H - 16,
        "text-anchor": frac < 0.02 ? "start" : (frac > 0.98 ? "end" : "middle"),
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = tk.label;
      s.appendChild(t);
    });

    // shared starting dot. Its label sits below it: every line climbs out of
    // the dot to the right, and above it they cut through the text.
    s.appendChild(el("circle", { cx: xf(o.x0), cy: yf(START), r: "4", fill: "#3A2B31" }));
    var st = el("text", { x: xf(o.x0) + 8, y: yf(START) + 24,
      "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
    st.textContent = "$10k, " + o.startLabel;
    s.appendChild(st);

    o.series.forEach(function (p) {
      var d = p.pts.map(function (q, i) {
        return (i ? "L" : "M") + xf(q[0]).toFixed(1) + "," + yf(q[1]).toFixed(1);
      }).join(" ");
      s.appendChild(el("path", { d: d, fill: "none", stroke: p.colour, "stroke-width": p.w,
        "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": p.dash || "" }));
    });

    /* End labels sit in the right-hand gutter, outside the plotting area, so
       no line can run through the text, then get pushed apart in case two
       funds finish close together. */
    var ends = o.series.map(function (p) {
      var last = p.pts[p.pts.length - 1];
      return { name: p.name, value: last[1], y: yf(last[1]) + 4, fill: p.labelColour };
    }).sort(function (a, b) { return a.y - b.y; });

    for (var i = 1; i < ends.length; i++) {
      if (ends[i].y - ends[i - 1].y < 26) ends[i].y = ends[i - 1].y + 26;
    }

    ends.forEach(function (e) {
      var t = el("text", { x: W - R + 12, y: e.y, "font-family": "EB Garamond,Georgia,serif",
        "font-size": "12.5", "font-weight": "600", fill: e.fill });
      t.textContent = e.name + "  " + money(e.value);
      s.appendChild(t);
    });

    host.innerHTML = "";
    host.appendChild(s);
  }

  /* ---------------------------------------------------------------------
     Left: the Nasdaq family, held here as annual balances.
     --------------------------------------------------------------------- */
  function nasdaq() {
    var host = document.getElementById("cmp-chart");
    if (!host) return;

    // Growth of $10,000, dividends reinvested. Anchored to the compounded
    // Yahoo Finance annual totals: QQQ +1,229% -> ~$133k over 2011 to 2025,
    // TQQQ +14,255% -> ~$1.44M. The series stops at the end of 2025 because
    // 2026 is not a complete year and nobody publishes an annual total return
    // for it. Same figures as the table below the chart.
    var qqq = [[2010,10000],[2011,10270],[2012,12131],[2013,16574],[2014,19753],
               [2015,21620],[2016,23155],[2017,30718],[2018,30675],[2019,42626],
               [2020,63342],[2021,80710],[2022,54415],[2023,84261],[2024,105815],
               [2025,132903]];
    var tqqq = [[2010,10000],[2011,9195],[2012,14003],[2013,33570],[2014,52734],
                [2015,61821],[2016,68856],[2017,150147],[2018,120403],[2019,281538],
                [2020,591370],[2021,1082089],[2022,226373],[2023,675180],[2024,1068337],
                [2025,1435525]];

    /* QLD is worked out from the two series above rather than typed in.

       Over a year, a fund tracking k times the index's daily move satisfies

           ln(1 + r_k) = k * ln(1 + r_1) - ((k * k - k) / 2) * D

       where D covers the variance drag, the financing cost on the borrowed
       part and the fee. Both r_1 and r_3 are known for every year here, so D
       falls out of the 3x line and the 2x line follows from it. A 2x fund
       carries a third of the drag a 3x fund does.

       Two checks on it. Year by year it lands on QLD's real calendar returns
       within a point or two: -60.0% for 2022, +90.3% for 2020, +82.9% for
       2013. Over the whole window it puts QLD at 5.3 times QQQ, against 5.5
       times when the same period is priced straight off Yahoo's daily closes.

       Computed here rather than pasted in, so it can never drift from the two
       lines it is derived from. */
    var qld = (function () {
      var out = [[qqq[0][0], START]], bal = START;
      for (var i = 1; i < qqq.length; i++) {
        var r1 = qqq[i][1] / qqq[i - 1][1] - 1;
        var r3 = tqqq[i][1] / tqqq[i - 1][1] - 1;
        var D  = (3 * Math.log(1 + r1) - Math.log(1 + r3)) / 3;
        bal *= Math.exp(2 * Math.log(1 + r1) - D);
        out.push([qqq[i][0], Math.round(bal)]);
      }
      return out;
    })();

    // QQQ's growth multiplied by three, arithmetically. Not a fund and not
    // buyable: it is what "triple the Nasdaq" sounds like it should produce.
    var trip = qqq.map(function (p) { return [p[0], START * (1 + 3 * (p[1] / START - 1))]; });

    paint(host, {
      x0: 2010, x1: 2025, lo: 8000, hi: 2000000,
      grid: [10000, 100000, 1000000],
      ticks: [2010, 2014, 2018, 2022, 2025].map(function (y) { return { x: y, label: y }; }),
      startLabel: "end of 2010",
      series: [
        { name: "QQQ",         pts: qqq,  colour: "#2E7D32", labelColour: "#2E7D32", w: "2.2", dash: "2 4" },
        { name: "3\u00d7 QQQ", pts: trip, colour: "#8A7A7E", labelColour: "#6B5F62", w: "1.8", dash: "7 5" },
        { name: "QLD",         pts: qld,  colour: "#B4532E", labelColour: "#8F3F1C", w: "2.2" },
        { name: "TQQQ",        pts: tqqq, colour: "#B0894F", labelColour: "#8A6A2E", w: "3" }
      ]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", nasdaq);
  } else {
    nasdaq();
  }
})();
