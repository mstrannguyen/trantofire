/* Home-page "engine" chart: growth of $10,000 in QQQ, QLD, 3x QQQ and TQQQ,
   all-time. One shared axis, every line starting from the same point, so TQQQ
   ends unmistakably highest without any axis trickery.
   Pure SVG, no library, log scale, defensive against a missing host. */
(function () {
  "use strict";

  function draw() {
    var host = document.getElementById("cmp-chart");
    if (!host) return;

    // Growth of $10,000, dividends reinvested. Anchored to the compounded
    // Yahoo Finance annual totals: QQQ +1,229% -> ~$133k over 2011 to 2025,
    // TQQQ +14,255% -> ~$1.44M. The series stops at the end of 2025 because
    // 2026 is not a complete year and nobody publishes an annual total return
    // for it. These are the same figures as the table below the chart.
    var START = 10000;
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

    var W = 900, H = 430, L = 66, R = 120, T = 20, B = 46;
    var x0 = 2010, x1 = 2025;
    var loMin = 8000, loMax = 2000000;

    var xf = function (yr) { return L + (W - L - R) * (yr - x0) / (x1 - x0); };
    var lg = function (v) { return Math.log10(v); };
    var yf = function (v) { return T + (H - T - B) * (1 - (lg(v) - lg(loMin)) / (lg(loMax) - lg(loMin))); };

    function el(tag, a) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (var k in a) e.setAttribute(k, a[k]);
      return e;
    }
    function line(pts, stroke, w, dash) {
      var d = pts.map(function (p, i) { return (i ? "L" : "M") + xf(p[0]).toFixed(1) + "," + yf(p[1]).toFixed(1); }).join(" ");
      return el("path", { d: d, fill: "none", stroke: stroke, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": dash || "" });
    }
    function money(v) {
      if (v >= 1000000) {
        var m = v / 1000000;
        return "$" + (m >= 10 || m === Math.round(m) ? Math.round(m) : m.toFixed(2)) + "M";
      }
      if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
      return "$" + v;
    }

    var s = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Growth of $10,000 in QQQ, QLD, 3x QQQ and TQQQ from 2010 to 2025, log scale" });
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");

    [10000, 100000, 1000000].forEach(function (v) {
      var gy = yf(v);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: "#3A2B31", "stroke-opacity": ".10" }));
      var t = el("text", { x: L - 12, y: gy + 4, "text-anchor": "end", "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = money(v);
      s.appendChild(t);
    });
    [2010, 2014, 2018, 2022, 2025].forEach(function (yr) {
      var t = el("text", { x: xf(yr), y: H - 16, "text-anchor": yr === 2010 ? "start" : (yr === 2025 ? "end" : "middle"), "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = yr;
      s.appendChild(t);
    });

    // shared starting dot, so it's clear all four begin at $10k. The label sits
    // below it: all four lines climb out of the dot to the right, and above it
    // they cut straight through the text.
    s.appendChild(el("circle", { cx: xf(2010), cy: yf(START), r: "4", fill: "#3A2B31" }));
    var st = el("text", { x: xf(2010) + 8, y: yf(START) + 24, "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
    st.textContent = "$10k in 2010";
    s.appendChild(st);

    // Colours match the legend swatches in index.html.
    s.appendChild(line(qqq,  "#2E7D32", "2.2", "2 4"));
    s.appendChild(line(trip, "#8A7A7E", "1.8", "7 5"));
    s.appendChild(line(qld,  "#B4532E", "2.2"));
    s.appendChild(line(tqqq, "#B0894F", "3"));

    /* End labels sit in the right-hand gutter, outside the plotting area, so
       no line can run through the text. They are then pushed apart vertically
       in case two funds finish close together.

       Each label is a darker relative of its own line, dark enough to read at
       12.5px: 5.0, 5.1, 6.1 and 7.3 to one against the white card, where the
       line colours themselves run from 3.2 to 5.1 and only have to clear the
       3:1 that non-text needs.

       Separated by measuring RGB distance rather than by eye. The two warm
       lines were the problem: brass and the old #C4703C sat 37 apart, and
       their labels 38, which is close enough to be read as one colour in the
       gutter. Deepening QLD to #B4532E puts the closest pair of lines 62
       apart and the closest pair of labels 47. */
    var ends = [
      { pts: tqqq, name: "TQQQ",        fill: "#8A6A2E" },
      { pts: qld,  name: "QLD",         fill: "#8F3F1C" },
      { pts: trip, name: "3\u00d7 QQQ", fill: "#6B5F62" },
      { pts: qqq,  name: "QQQ",         fill: "#2E7D32" }
    ].map(function (e) {
      var last = e.pts[e.pts.length - 1];
      e.value = last[1];
      e.y = yf(last[1]) + 4;
      return e;
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", draw);
  } else {
    draw();
  }
})();
