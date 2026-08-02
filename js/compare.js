/* Home-page chart: growth of $10,000 in five funds, all-time, log scale.

   Everything is computed from Yahoo's monthly history through the same proxy
   routes the rest of the site uses, rather than typed in from a comparison
   site. Third-party figures for these funds disagree with each other by
   several points a year depending on the day they were captured, so the only
   honest version is one that recalculates itself.

   Adjusted closes are used, so distributions count as reinvested.

   All five start at $10,000 in the first month every one of them has data
   for, which is TQQQ's inception in February 2010. QLD and SSO both date from
   2006 and UPRO from 2009; their earlier history is outside the window.

   If the fetch fails the chart removes itself rather than showing stale
   hardcoded numbers.
   =========================================================================== */
(function () {
  "use strict";

  var FUNDS = [
    { sym: "TQQQ", name: "TQQQ", mult: "3\u00d7 Nasdaq-100", colour: "#B0894F", w: "3",   dash: "" },
    { sym: "QLD",  name: "QLD",  mult: "2\u00d7 Nasdaq-100", colour: "#C4703C", w: "2.2", dash: "" },
    { sym: "QQQ",  name: "QQQ",  mult: "the index itself",   colour: "#2E7D32", w: "2.2", dash: "2 4" }
  ];

  /* QQQ's growth multiplied by three, arithmetically. Not a fund and not
     buyable: it is what "triple the Nasdaq" sounds like it should produce, so
     the gap between this line and TQQQ is the daily reset doing its work. */
  var SYNTH = { name: "3\u00d7 QQQ", mult: "not a real fund", colour: "#8A7A7E", w: "1.8", dash: "7 5" };
  var START = 10000, ANCHOR = "2010-02";

  function el(tag, a) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }
  function money(v) {
    if (v >= 1000000) {
      var m = v / 1000000;
      return "$" + (m >= 10 || m === Math.round(m) ? Math.round(m) : m.toFixed(2)) + "M";
    }
    if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
    return "$" + Math.round(v);
  }

  function draw(paths) {
    var host = document.getElementById("cmp-chart");
    if (!host) return;

    var W = 900, H = 460, L = 66, R = 128, T = 22, B = 46;
    var years = [], lo = START, hi = START;
    paths.forEach(function (p) {
      p.pts.forEach(function (q) {
        if (q[1] < lo) lo = q[1];
        if (q[1] > hi) hi = q[1];
      });
      if (p.pts.length) {
        years.push(p.pts[0][0]);
        years.push(p.pts[p.pts.length - 1][0]);
      }
    });
    var x0 = Math.min.apply(null, years), x1 = Math.max.apply(null, years);
    lo = Math.pow(10, Math.floor(Math.log10(lo * 0.85)));
    hi = Math.pow(10, Math.ceil(Math.log10(hi * 1.15)));

    var xf = function (t) { return L + (W - L - R) * (t - x0) / (x1 - x0 || 1); };
    var lg = Math.log10;
    var yf = function (v) { return T + (H - T - B) * (1 - (lg(v) - lg(lo)) / (lg(hi) - lg(lo))); };

    var s = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img",
      "aria-label": "Growth of $10,000 in TQQQ, UPRO, QLD, SSO and QQQ since February 2010, log scale" });
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");

    for (var g = lo; g <= hi; g *= 10) {
      var gy = yf(g);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: "#3A2B31", "stroke-opacity": ".10" }));
      var t = el("text", { x: L - 12, y: gy + 4, "text-anchor": "end",
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = money(g);
      s.appendChild(t);
    }
    var span = Math.ceil(x1) - Math.floor(x0);
    var stepY = span > 12 ? 4 : (span > 6 ? 2 : 1);
    for (var yr = Math.ceil(x0); yr <= x1; yr += stepY) {
      var xt = el("text", { x: xf(yr), y: H - 16, "text-anchor": "middle",
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      xt.textContent = yr;
      s.appendChild(xt);
    }

    s.appendChild(el("circle", { cx: xf(x0), cy: yf(START), r: "4", fill: "#3A2B31" }));
    var st = el("text", { x: xf(x0) + 8, y: yf(START) + 18, "font-family": "EB Garamond,Georgia,serif",
      "font-size": "11.5", fill: "#8A7A7E" });
    st.textContent = "$10k, February 2010";
    s.appendChild(st);

    paths.forEach(function (p) {
      var d = p.pts.map(function (q, i) {
        return (i ? "L" : "M") + xf(q[0]).toFixed(1) + "," + yf(q[1]).toFixed(1);
      }).join(" ");
      s.appendChild(el("path", { d: d, fill: "none", stroke: p.colour, "stroke-width": p.w,
        "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": p.dash }));
    });

    // end labels, nudged apart so none of them collide
    var ends = paths.map(function (p) {
      return { y: yf(p.pts[p.pts.length - 1][1]), p: p, v: p.pts[p.pts.length - 1][1] };
    }).sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < ends.length; i++) {
      if (ends[i].y - ends[i - 1].y < 30) ends[i].y = ends[i - 1].y + 30;
    }
    ends.forEach(function (e) {
      var t1 = el("text", { x: W - R + 10, y: e.y, "font-family": "EB Garamond,Georgia,serif",
        "font-size": "13", "font-weight": "700", fill: e.p.colour });
      t1.textContent = e.p.name + "  " + money(e.v);
      s.appendChild(t1);
      var t2 = el("text", { x: W - R + 10, y: e.y + 14, "font-family": "EB Garamond,Georgia,serif",
        "font-size": "11", fill: "#8A7A7E" });
      t2.textContent = e.p.mult;
      s.appendChild(t2);
    });

    host.innerHTML = "";
    host.appendChild(s);
  }

  function monthToDecimal(key) {
    return parseInt(key.slice(0, 4), 10) + (parseInt(key.slice(5, 7), 10) - 1) / 12;
  }

  function start() {
    var host = document.getElementById("cmp-chart");
    if (!host || !window.TTF_LIVE || !window.TTF_LIVE.series) return;

    Promise.all(FUNDS.map(function (f) { return window.TTF_LIVE.series(f.sym); }))
      .then(function (results) {
        var paths = [];
        results.forEach(function (r, i) {
          if (!r || !r.total || !(r.total[ANCHOR] > 0)) return;
          var base = r.total[ANCHOR];
          var keys = Object.keys(r.total).filter(function (k) { return k >= ANCHOR; }).sort();
          var pts = keys.map(function (k) { return [monthToDecimal(k), START * r.total[k] / base]; });
          if (pts.length > 12) {
            paths.push({ sym: FUNDS[i].sym, name: FUNDS[i].name, mult: FUNDS[i].mult,
              colour: FUNDS[i].colour, w: FUNDS[i].w, dash: FUNDS[i].dash, pts: pts });
          }
        });
        var qqq = paths.filter(function (p) { return p.sym === "QQQ"; })[0];
        if (qqq) {
          paths.push({
            sym: "SYNTH", name: SYNTH.name, mult: SYNTH.mult, colour: SYNTH.colour,
            w: SYNTH.w, dash: SYNTH.dash,
            pts: qqq.pts.map(function (q) { return [q[0], START * (1 + 3 * (q[1] / START - 1))]; })
          });
        }
        if (paths.length < 2) { host.innerHTML = ""; return; }
        draw(paths);
      })
      .catch(function () { host.innerHTML = ""; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
