/* Home-page "engine" chart: growth of $10,000 in QQQ vs 3x QQQ vs TQQQ,
   all-time. One shared axis, all three lines starting from the same point,
   so TQQQ ends unmistakably highest without any axis trickery.
   Pure SVG, no library, log scale, defensive against a missing host. */
(function () {
  "use strict";

  function draw() {
    var host = document.getElementById("cmp-chart");
    if (!host) return;

    // Growth of $10,000, all-time, dividends reinvested. Anchored to the
    // compounded Yahoo Finance annual totals: QQQ +1,229% -> ~$133k,
    // TQQQ +14,255% -> ~$1.44M. "3x QQQ" is QQQ's growth tripled, for scale.
    var START = 10000;
    var qqq = [[2010,10000],[2011,10270],[2012,12131],[2013,16574],[2014,19753],
               [2015,21620],[2016,23155],[2017,30718],[2018,30675],[2019,42626],
               [2020,63342],[2021,80710],[2022,54415],[2023,84261],[2024,105815],
               [2025,132903],[2026,140000]];
    var tqqq = [[2010,10000],[2011,9195],[2012,14003],[2013,33570],[2014,52734],
                [2015,61821],[2016,68856],[2017,150147],[2018,120403],[2019,281538],
                [2020,591370],[2021,1082089],[2022,226373],[2023,675180],[2024,1068337],
                [2025,1435525],[2026,1500000]];
    var trip = qqq.map(function (p) { return [p[0], START * (1 + 3 * (p[1] / START - 1))]; });

    var W = 900, H = 430, L = 66, R = 20, T = 20, B = 46;
    var x0 = 2010, x1 = 2026;
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
      if (v >= 1000000) return "$" + (v / 1000000).toFixed(v % 1000000 ? 1 : 0) + "M";
      if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
      return "$" + v;
    }

    var s = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Growth of $10,000 in QQQ, 3x QQQ and TQQQ since 2010, log scale" });
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");

    [10000, 100000, 1000000].forEach(function (v) {
      var gy = yf(v);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: "#3A2B31", "stroke-opacity": ".10" }));
      var t = el("text", { x: L - 12, y: gy + 4, "text-anchor": "end", "font-family": "Karla,sans-serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = money(v);
      s.appendChild(t);
    });
    [2010, 2014, 2018, 2022, 2026].forEach(function (yr) {
      var t = el("text", { x: xf(yr), y: H - 16, "text-anchor": yr === 2010 ? "start" : (yr === 2026 ? "end" : "middle"), "font-family": "Karla,sans-serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = yr;
      s.appendChild(t);
    });

    // shared starting dot, so it's clear all three begin at $10k
    s.appendChild(el("circle", { cx: xf(2010), cy: yf(START), r: "4", fill: "#3A2B31" }));
    var st = el("text", { x: xf(2010) + 8, y: yf(START) - 8, "font-family": "Karla,sans-serif", "font-size": "11.5", fill: "#8A7A7E" });
    st.textContent = "$10k in 2010";
    s.appendChild(st);

    s.appendChild(line(qqq, "#8D9C86", "2.4"));
    s.appendChild(line(trip, "#7BA0C4", "2", "6 5"));
    s.appendChild(line(tqqq, "#B0894F", "3"));

    function label(pts, txt, color, dy) {
      var last = pts[pts.length - 1];
      var t = el("text", { x: xf(last[0]) - 6, y: yf(last[1]) + (dy || -8), "text-anchor": "end", "font-family": "Karla,sans-serif", "font-size": "12.5", "font-weight": "600", fill: color });
      t.textContent = txt;
      s.appendChild(t);
    }
    label(tqqq, "TQQQ  $1.44M", "#8A6A2E", -10);
    label(trip, "3\u00d7 QQQ  $379k", "#5B7C9E", -10);
    label(qqq, "QQQ  $133k", "#5E7350", 20);

    host.innerHTML = "";
    host.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", draw);
  } else {
    draw();
  }
})();
