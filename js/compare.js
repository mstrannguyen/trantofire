/* Home-page growth chart: QQQ, QLD, a synthetic 3x QQQ line and TQQQ, from the
   end of 2010. Compounded Yahoo Finance annual total returns for the three
   funds, held in this file, stopping at the last complete year.

   Colour carries the multiple, the same way as on the rest of the site: blue
   is the plain index, orange is 2x, cyan is 3x. The line that is not a fund
   stays grey. The colours themselves are in js/chartkit.js.

   Pure SVG, no library, log scale, defensive against a missing host. */
(function () {
  "use strict";

  var START = 10000;
  var CK = window.TTF_CHART;

  function money(v) {
    if (v >= 1000000) {
      var m = v / 1000000;
      return "$" + (m >= 10 || m === Math.round(m) ? Math.round(m) : m.toFixed(2)) + "M";
    }
    if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
    return "$" + Math.round(v);
  }

  /* ---------------------------------------------------------------------
     The painter.

     A line wears the mark step of its colour and its end label the text
     step, which is dark enough to read at this size. The end labels sit in
     the right-hand gutter, outside the plotting area, so no line can run
     through them, and are moved apart when two funds finish close together.
     On a phone the gutters are narrower and the chart is drawn at the
     phone's width, so the words keep their size.
     --------------------------------------------------------------------- */
  function paint(host, o) {
    CK.fit(host, 900, function (W, narrow) {
      var H = narrow ? 340 : 430, L = narrow ? 44 : 66, R = narrow ? 98 : 120, T = 20, B = 46;
      var el = CK.el;

      var xf = function (x) { return L + (W - L - R) * (x - o.x0) / (o.x1 - o.x0); };
      var lg = function (v) { return Math.log10(v); };
      var yf = function (v) { return T + (H - T - B) * (1 - (lg(v) - lg(o.lo)) / (lg(o.hi) - lg(o.lo))); };

      var s = CK.svg(host, W, H, "Growth of $10,000 in " +
        o.series.map(function (p) { return p.name; }).join(", ") +
        " from " + o.startLabel + ", log scale");

      o.grid.forEach(function (v) {
        var gy = yf(v);
        s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy,
          stroke: CK.K.ink, "stroke-opacity": ".10" }));
        CK.text(s, L - (narrow ? 8 : 12), gy + 4, money(v), { "text-anchor": "end" });
      });

      CK.thin(o.ticks.map(function (tk) {
        var frac = (tk.x - o.x0) / (o.x1 - o.x0);
        return CK.text(s, xf(tk.x), H - 16, tk.label,
          { "text-anchor": frac < 0.02 ? "start" : (frac > 0.98 ? "end" : "middle") });
      }), 8);

      o.series.forEach(function (p) {
        var d = p.pts.map(function (q, i) {
          return (i ? "L" : "M") + xf(q[0]).toFixed(1) + "," + yf(q[1]).toFixed(1);
        }).join(" ");
        s.appendChild(el("path", { d: d, fill: "none", stroke: p.colour, "stroke-width": p.w,
          "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": p.dash || "" }));
      });

      // shared starting dot. Its label sits below it, on a plate: every line
      // climbs out of the dot to the right, and one of them dips under it first.
      s.appendChild(el("circle", { cx: xf(o.x0), cy: yf(START), r: "4", fill: CK.K.ink,
        stroke: CK.K.card, "stroke-width": "1.5" }));
      var st = CK.text(s, xf(o.x0) + 8, yf(START) + 24, "$10k, " + o.startLabel);
      CK.plate(s, st, 2);

      var ends = o.series.map(function (p) {
        var last = p.pts[p.pts.length - 1];
        return { name: p.name, value: last[1], y: yf(last[1]), h: 18, fill: p.labelColour };
      });
      CK.spread(ends, T + 4, H - B, 6);

      ends.forEach(function (e) {
        CK.text(s, W - R + (narrow ? 8 : 12), e.y + 4, e.name + "  " + money(e.value),
          { "font-size": "12.5", "font-weight": "600", fill: e.fill });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Left: the Nasdaq family, held here as annual balances.
     --------------------------------------------------------------------- */
  function nasdaq() {
    var host = document.getElementById("cmp-chart");
    if (!host) return;

    // Growth of $10,000, dividends reinvested: each fund's Yahoo Finance annual
    // total returns, compounded. QQQ +1,188% -> ~$129k over 2011 to 2025, QLD
    // +5,550% -> ~$565k, TQQQ +14,255% -> ~$1.44M. The series stops at the end
    // of 2025 because 2026 is not a complete year and nobody publishes an annual
    // total return for it.
    //
    // The table under the chart prints QQQ and TQQQ for eight of these years.
    // Those cells and these points are the same numbers: change one, change
    // the other.
    //
    // QQQ by year, as published: +3.4, +18.1, +36.6, +19.2, +9.4, +7.1, +32.7,
    // -0.1, +39.0, +48.6, +27.4, -32.6, +54.9, +25.6, +20.8. The points are
    // held to the table's cells, so a year's step can sit a tenth of a point
    // from these.
    var qqq = [[2010,10000],[2011,10340],[2012,12213],[2013,16681],[2014,19880],
               [2015,21757],[2016,23302],[2017,30944],[2018,30904],[2019,42944],
               [2020,63851],[2021,81347],[2022,54828],[2023,84928],[2024,106653],
               [2025,128804]];
    var tqqq = [[2010,10000],[2011,9195],[2012,14003],[2013,33570],[2014,52734],
                [2015,61821],[2016,68856],[2017,150147],[2018,120403],[2019,281538],
                [2020,591370],[2021,1082089],[2022,226373],[2023,675180],[2024,1068337],
                [2025,1435525]];

    // QLD's own record, the same way. By year: +0.0, +34.8, +82.1, +37.6,
    // +14.7, +10.2, +70.3, -8.3, +81.7, +88.9, +54.7, -60.5, +117.1, +42.8,
    // +30.4.
    //
    // Until 22 Nov 2026 this line was worked out from the other two, on the
    // footing that a 2x fund carries a third of a 3x fund's yearly drag. The
    // fee is much the same on both and the financing is half, not a third, so that
    // ran about a point a year high and finished near $696k. Do not derive it.
    var qld = [[2010,10000],[2011,10004],[2012,13482],[2013,24553],[2014,33782],
               [2015,38762],[2016,42704],[2017,72742],[2018,66689],[2019,121168],
               [2020,228886],[2021,354019],[2022,139767],[2023,303475],[2024,433393],
               [2025,564971]];

    // QQQ's growth multiplied by three, arithmetically. Not a fund and not
    // buyable: it is what "triple the Nasdaq" sounds like it should produce.
    var trip = qqq.map(function (p) { return [p[0], START * (1 + 3 * (p[1] / START - 1))]; });

    paint(host, {
      x0: 2010, x1: 2025, lo: 8000, hi: 2000000,
      grid: [10000, 100000, 1000000],
      ticks: [2010, 2014, 2018, 2022, 2025].map(function (y) { return { x: y, label: y }; }),
      startLabel: "end of 2010",
      series: [
        { name: "QQQ",         pts: qqq,  colour: CK.K.blue,   labelColour: CK.txt(CK.K.blue),   w: "2.2", dash: "2 4" },
        { name: "3\u00d7 QQQ", pts: trip, colour: CK.K.grey,   labelColour: CK.K.greyText,       w: "1.8", dash: "7 5" },
        { name: "QLD",         pts: qld,  colour: CK.K.orange, labelColour: CK.txt(CK.K.orange), w: "2.2" },
        { name: "TQQQ",        pts: tqqq, colour: CK.K.cyan, labelColour: CK.txt(CK.K.cyan), w: "3" }
      ]
    });
  }

  if (!CK) return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", nasdaq);
  } else {
    nasdaq();
  }
})();
