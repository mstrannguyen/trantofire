/* Home-page "engine" chart: QQQ vs 3x QQQ vs TQQQ, all-time by price,
   matching the shape of the Google Finance max charts.
   Pure SVG, no library, log scale, defensive against a missing host. */
(function () {
  "use strict";

  function draw() {
    var host = document.getElementById("cmp-chart");
    if (!host) return;

    var q0 = 52.9;
    var qqq = [[2010,q0],[2011,54],[2012,66],[2013,88],[2014,105],[2015,112],
               [2016,120],[2017,158],[2018,155],[2019,210],[2020,315],[2021,400],
               [2022,268],[2023,405],[2024,515],[2025,600],[2026,684]];
    var tqqq = [[2010,0.22],[2011,0.20],[2012,0.31],[2013,0.75],[2014,1.9],[2015,2.3],
                [2016,3.3],[2017,7.5],[2018,9],[2019,21],[2020,44],[2021,84],
                [2022,17],[2023,50],[2024,79],[2025,88],[2026,64]];
    var trip = qqq.map(function (p) { return [p[0], q0 * (1 + 3 * (p[1] / q0 - 1))]; });

    var W = 900, H = 430, L = 58, R = 20, T = 20, B = 46;
    var x0 = 2010, x1 = 2026;
    var loMin = 0.2, loMax = 3000;

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

    var s = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "All-time price growth of QQQ, 3x QQQ and TQQQ since 2010, log scale" });
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");

    [1, 10, 100, 1000].forEach(function (v) {
      var gy = yf(v);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: "#3A2B31", "stroke-opacity": ".10" }));
      var t = el("text", { x: L - 12, y: gy + 4, "text-anchor": "end", "font-family": "Karla,sans-serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = v >= 1000 ? "$" + (v / 1000) + "k" : "$" + v;
      s.appendChild(t);
    });
    [2010, 2014, 2018, 2022, 2026].forEach(function (yr) {
      var t = el("text", { x: xf(yr), y: H - 16, "text-anchor": yr === 2010 ? "start" : (yr === 2026 ? "end" : "middle"), "font-family": "Karla,sans-serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = yr;
      s.appendChild(t);
    });

    s.appendChild(line(qqq, "#8D9C86", "2.4"));
    s.appendChild(line(trip, "#7BA0C4", "2", "6 5"));
    s.appendChild(line(tqqq, "#B0894F", "3"));

    function label(pts, txt, color, dy) {
      var last = pts[pts.length - 1];
      var t = el("text", { x: xf(last[0]) - 6, y: yf(last[1]) + (dy || -8), "text-anchor": "end", "font-family": "Karla,sans-serif", "font-size": "12.5", "font-weight": "600", fill: color });
      t.textContent = txt;
      s.appendChild(t);
    }
    label(tqqq, "TQQQ  +28,990%", "#8A6A2E", 20);
    label(trip, "3\u00d7 QQQ  +3,580%", "#5B7C9E", -10);
    label(qqq, "QQQ  +1,192%", "#5E7350", -10);

    host.innerHTML = "";
    host.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", draw);
  } else {
    draw();
  }
})();
