/* Home page: the two indexes the funds are built on.

   One chart each for the S&P 500 and the Nasdaq-100: $10,000 at the close of
   31 December 1999, distributions reinvested, to the close of 31 December
   2025, on a log scale, with the four big falls of those years shaded from
   each high to its low and labelled at the low.

   THE NUMBERS ARE HELD IN THIS FILE. They are SPY's and QQQ's adjusted closes
   from Yahoo Finance (the funds that track the two indexes), at each month's
   last close, plus the day of each fall's high, its low and the day it was
   back, so the line reaches the true extremes. History does not go stale,
   but the right-hand end does: add a year each January, with the growth
   chart in js/compare.js, and change the words and the table in index.html
   that quote these figures. They are worked out from these points, so they
   move together:

     the end value in each figure's caption        last value below
     the falls in the table and on the chart       low / high - 1
     the years to get back in the table            back day - high day

   Blue, the colour of the plain index everywhere on this page. Shading and
   the names of the falls are neutral. A fall printed as a figure is the
   site's loss colour, as on every other page.

   Pure SVG through js/chartkit.js, drawn at the width it is shown at. Moving
   a pointer or a finger across a chart reads out the month under it. */
(function () {
  "use strict";

  var CK = window.TTF_CHART;
  if (!CK) return;

  var DAY0 = Date.UTC(1999, 11, 31), MS = 86400000, START = 10000;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var LOSS = "#A33220";

  /* d: days after 31 Dec 1999.  v: what $10,000 had become, in dollars.
     falls: [name, the day of the high, the day of the low, the day it closed
     above that high again]. */
  var SERIES = {
    spx: {
      name: "S&P 500",
      falls: [["2000–02", 84, 1013, 2491], ["2007–09", 2839, 3356, 4612],
              ["2020", 7355, 7388, 7528], ["2022", 8039, 8321, 8748]],
      d: [
        0,31,60,84,91,119,152,182,213,244,273,305,335,364,397,425,455,486,
        517,546,578,609,637,670,700,731,762,790,818,851,882,910,943,973,1004,1013,
        1035,1064,1096,1127,1155,1186,1216,1246,1277,1308,1337,1369,1400,1428,1461,1491,1519,1552,
        1582,1610,1643,1673,1705,1735,1764,1796,1827,1858,1886,1917,1946,1978,2008,2037,2070,2100,
        2131,2161,2191,2223,2251,2282,2310,2343,2373,2404,2435,2464,2491,2496,2526,2555,2588,2616,
        2646,2677,2708,2737,2769,2800,2828,2839,2861,2891,2922,2953,2982,3013,3043,3073,3104,3135,
        3164,3196,3227,3255,3288,3318,3346,3356,3378,3408,3437,3469,3500,3531,3561,3591,3622,3653,
        3682,3710,3743,3773,3801,3834,3864,3896,3926,3955,3987,4018,4049,4077,4108,4137,4169,4199,
        4228,4261,4291,4322,4352,4382,4414,4443,4473,4504,4535,4564,4596,4612,4627,4655,4688,4718,
        4749,4780,4808,4836,4869,4900,4928,4961,4991,5022,5053,5082,5114,5145,5173,5204,5234,5264,
        5295,5326,5355,5387,5418,5446,5479,5509,5537,5569,5599,5628,5660,5691,5722,5752,5782,5813,
        5844,5873,5904,5935,5964,5996,6026,6055,6088,6118,6149,6179,6209,6241,6269,6300,6328,6361,
        6391,6422,6453,6482,6514,6544,6573,6606,6634,6663,6695,6726,6755,6787,6818,6846,6879,6909,
        6940,6971,6999,7028,7060,7091,7119,7152,7182,7213,7244,7273,7305,7336,7355,7364,7388,7396,
        7426,7455,7487,7518,7528,7549,7579,7609,7640,7671,7700,7728,7761,7791,7819,7852,7882,7914,
        7944,7973,8005,8036,8039,8067,8095,8126,8155,8187,8217,8246,8279,8309,8321,8340,8370,8400,
        8432,8460,8491,8519,8552,8582,8613,8644,8673,8705,8735,8748,8764,8797,8826,8854,8887,8918,
        8946,8979,9009,9040,9071,9100,9132,9163,9191,9222,9252,9282,9313,9344,9373,9405,9436,9464,
        9497],
      v: [
        10000,9502,9357,10482,10264,9904,9748,9940,9784,10423,9851,9805,9073,9026,9427,8528,8050,8738,
        8689,8482,8395,7897,7253,7347,7920,7965,7887,7745,8003,7537,7493,6940,6393,6436,5761,5501,
        6235,6620,6245,6092,6010,6023,6532,6890,6964,7089,7235,7157,7540,7622,8005,8164,8275,8165,
        8010,8148,8298,8031,8051,8131,8236,8603,8862,8663,8844,8683,8520,8794,8808,9145,9059,9132,
        8916,9308,9290,9513,9567,9725,9848,9551,9576,9619,9829,10095,10488,10413,10620,10762,10924,10709,
        10833,11313,11697,11526,11165,11308,11746,12046,11906,11444,11316,10631,10357,10264,10753,10916,10004,9914,
        10067,9119,7613,7083,7152,6565,5859,5398,6348,6978,7386,7381,7932,8225,8516,8353,8867,9037,
        8708,8980,9527,9674,8905,8445,9021,8616,9387,9746,9746,10397,10640,11009,11010,11329,11202,11013,
        10793,10200,9492,10528,10485,10594,11086,11567,11939,11859,11147,11599,11736,12101,12031,12335,12111,12180,
        12288,12917,13082,13579,13840,14167,13978,14700,14259,14710,15391,15848,16258,15685,16399,16535,16650,17037,
        17388,17155,17832,17586,18000,18494,18447,17901,18907,18610,18793,19035,18648,19069,17907,17450,18934,19004,
        18675,17745,17731,18923,18998,19321,19388,20095,20120,20121,19772,20500,20916,21290,22127,22154,22374,22690,
        22835,23304,23372,23843,24405,25151,25456,26890,25913,25202,25333,25948,26098,27064,27928,28094,26153,26638,
        24293,26238,27088,27578,28705,26875,28745,29179,28691,29249,29895,30978,31878,31865,33510,29342,22211,25678,
        28939,30318,30855,32673,33578,34953,33644,32805,36374,37721,37337,38375,40117,42240,42517,43471,44532,45857,
        43720,46788,46412,48558,48839,45997,44640,46318,42252,42348,38856,42434,40702,36940,36876,39942,42162,39733,
        42231,41170,42696,43378,43578,46402,47921,47142,44906,43931,47944,49425,50133,50931,53589,55342,53110,55797,
        57765,58465,59831,61088,60542,64153,62609,64291,63475,59938,59418,63152,66397,67927,69321,71790,73501,73644,
        73703]
    },
    ndx: {
      name: "Nasdaq-100",
      falls: [["2000–02", 87, 1013, 5530], ["2007–08", 2861, 3247, 3995],
              ["2020", 7355, 7381, 7460], ["2022", 8032, 8343, 8748]],
      d: [
        0,31,60,87,91,119,152,182,213,244,273,305,335,364,397,425,455,486,
        517,546,578,609,637,670,700,731,762,790,818,851,882,910,943,973,1004,1013,
        1035,1064,1096,1127,1155,1186,1216,1246,1277,1308,1337,1369,1400,1428,1461,1491,1519,1552,
        1582,1610,1643,1673,1705,1735,1764,1796,1827,1858,1886,1917,1946,1978,2008,2037,2070,2100,
        2131,2161,2191,2223,2251,2282,2310,2343,2373,2404,2435,2464,2496,2526,2555,2588,2616,2646,
        2677,2708,2737,2769,2800,2828,2861,2891,2922,2953,2982,3013,3043,3073,3104,3135,3164,3196,
        3227,3247,3255,3288,3318,3346,3378,3408,3437,3469,3500,3531,3561,3591,3622,3653,3682,3710,
        3743,3773,3801,3834,3864,3896,3926,3955,3987,3995,4018,4049,4077,4108,4137,4169,4199,4228,
        4261,4291,4322,4352,4382,4414,4443,4473,4504,4535,4564,4596,4627,4655,4688,4718,4749,4780,
        4808,4836,4869,4900,4928,4961,4991,5022,5053,5082,5114,5145,5173,5204,5234,5264,5295,5326,
        5355,5387,5418,5446,5479,5509,5530,5537,5569,5599,5628,5660,5691,5722,5752,5782,5813,5844,
        5873,5904,5935,5964,5996,6026,6055,6088,6118,6149,6179,6209,6241,6269,6300,6328,6361,6391,
        6422,6453,6482,6514,6544,6573,6606,6634,6663,6695,6726,6755,6787,6818,6846,6879,6909,6940,
        6971,6999,7028,7060,7091,7119,7152,7182,7213,7244,7273,7305,7336,7355,7364,7381,7396,7426,
        7455,7460,7487,7518,7549,7579,7609,7640,7671,7700,7728,7761,7791,7819,7852,7882,7914,7944,
        7973,8005,8032,8036,8067,8095,8126,8155,8187,8217,8246,8279,8309,8340,8343,8370,8400,8432,
        8460,8491,8519,8552,8582,8613,8644,8673,8705,8735,8748,8764,8797,8826,8854,8887,8918,8946,
        8979,9009,9040,9071,9100,9132,9163,9191,9222,9252,9282,9313,9344,9373,9405,9436,9464,9497],
      v: [
        10000,9815,11683,12886,11984,10369,9097,10226,9788,11122,9713,8942,6893,6389,7037,5193,4285,5051,
        4895,5001,4570,4009,3172,3710,4339,4258,4214,3697,3946,3473,3288,2856,2610,2571,2268,2195,
        2687,3034,2667,2675,2753,2763,3004,3260,3278,3480,3654,3548,3850,3872,3992,4058,4004,3924,
        3807,4002,4132,3820,3725,3847,4040,4283,4412,4134,4114,4042,3866,4209,4069,4379,4312,4366,
        4300,4562,4481,4658,4558,4653,4644,4308,4305,4120,4317,4517,4731,4894,4802,4903,4821,4846,
        5116,5278,5303,5295,5445,5730,6134,5719,5715,5036,4792,4882,5272,5585,5048,5080,5154,4351,
        3678,2858,3256,3330,3254,3083,3401,3845,3969,4086,4431,4496,4750,4605,4897,5152,4818,5040,
        5429,5551,5140,4833,5184,4918,5566,5919,5908,6134,6189,6364,6566,6536,6724,6642,6507,6616,
        6280,5998,6622,6444,6405,6944,7389,7762,7671,7131,7390,7463,7850,7920,7502,7600,7565,7767,
        7793,8029,8233,8527,8323,8849,8814,9239,9697,10042,10336,10137,10660,10368,10335,10799,11136,11268,
        11832,11742,12053,12601,12318,12062,12934,12933,12628,12870,13160,12833,13418,12502,12226,13616,13699,13481,
        12549,12353,13199,12779,13337,13033,13965,14112,14424,14214,14276,14438,15180,15844,16165,16606,17253,16853,
        17537,17901,17848,18670,19038,19153,20831,20561,19723,19822,20947,21187,21779,23038,22973,20999,20943,19129,
        20853,21477,22319,23547,21610,23250,23793,23341,23555,24587,25588,26582,27390,29629,25731,21167,23856,27428,
        29239,29656,31077,33360,37011,34872,33810,37606,39450,39553,39500,40178,42552,42041,44674,45952,47891,45169,
        48721,49694,50978,50266,45870,43817,45862,39627,38998,35524,39983,37931,33935,35292,33075,37249,33891,37498,
        37363,40910,41118,44360,47156,48976,48250,45799,44853,49705,51611,52482,53437,56260,56978,54486,57837,61580,
        60546,61215,62819,62276,65609,65906,67332,65512,60542,61388,67022,71302,73030,73727,77691,81405,80134,79597]
    }
  };

  function commas(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function usd(v) { return "$" + commas(v); }
  function short(v) {
    if (v >= 100000) return "$" + Math.round(v / 1000) + "k";
    if (v >= 1000) return "$" + (v / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return "$" + Math.round(v);
  }
  function pct(r) { return (r < 0 ? "−" : "+") + (Math.abs(r) * 100).toFixed(1) + "%"; }
  function monthOf(d) { var t = new Date(DAY0 + d * MS); return MONTHS[t.getUTCMonth()] + " " + t.getUTCFullYear(); }
  function dayOfYear(y) { return (Date.UTC(y, 0, 1) - DAY0) / MS; }
  function at(S, day) { return S.v[S.d.indexOf(day)]; }

  /* What each chart says before a pointer is on it, and what the page prints
     if this file never runs. Keep the two the same. */
  function resting(S) {
    return usd(START) + " at the end of 1999 was " + usd(S.v[S.v.length - 1]) + " at the end of 2025";
  }

  function paint(host, read, S) {
    var n = S.d.length, x0 = S.d[0], x1 = S.d[n - 1];
    var LO = 1300, HI = 110000, GRID = [2500, 5000, 10000, 20000, 40000, 80000];

    // the highest value so far at each point, for "below its high"
    var peak = [], top = 0;
    for (var i = 0; i < n; i++) { top = Math.max(top, S.v[i]); peak.push(top); }

    CK.fit(host, 560, function (W) {
      var H = Math.round(Math.max(250, Math.min(340, W * 0.64)));
      var L = 42, R = 56, T = 12, B = 30;
      var el = CK.el;
      var xf = function (d) { return L + (W - L - R) * (d - x0) / (x1 - x0); };
      var lg = function (v) { return Math.log(v) / Math.LN10; };
      var yf = function (v) { return T + (H - T - B) * (1 - (lg(v) - lg(LO)) / (lg(HI) - lg(LO))); };

      var falls = S.falls.map(function (f) {
        var hi = at(S, f[1]), lo = at(S, f[2]);
        return { name: f[0], hiDay: f[1], loDay: f[2], drop: lo / hi - 1, x: xf(f[2]), y: yf(lo) };
      });

      var s = CK.svg(host, W, H, S.name + ": growth of $10,000 from the end of 1999 to the end of 2025, log scale. " +
        "Falls from a high to a low: " + falls.map(function (f) { return f.name + " " + pct(f.drop); }).join(", ") + ".");

      // the falls, shaded from each high to its low
      falls.forEach(function (f) {
        var a = xf(f.hiDay), w = Math.max(2, f.x - a);
        s.appendChild(el("rect", { x: (f.x - w).toFixed(1), y: T, width: w.toFixed(1), height: H - T - B,
          fill: CK.K.ink, "fill-opacity": ".08" }));
      });

      // the grid, with the starting $10k a little firmer than the rest
      GRID.forEach(function (v) {
        var gy = yf(v);
        s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: CK.K.ink,
          "stroke-opacity": v === START ? ".22" : ".09" }));
        CK.text(s, L - 8, gy + 4, short(v), { "text-anchor": "end" });
      });

      CK.thin([2000, 2005, 2010, 2015, 2020, 2025].map(function (y) {
        var d = Math.max(x0, dayOfYear(y)), frac = (d - x0) / (x1 - x0);
        return CK.text(s, xf(d), H - 10, y, { "text-anchor": frac < 0.03 ? "start" : (frac > 0.97 ? "end" : "middle") });
      }), 8);

      // the line
      var pts = S.d.map(function (d, k) { return [xf(d), yf(S.v[k])]; });
      s.appendChild(el("path", { d: pts.map(function (p, k) { return (k ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "),
        fill: "none", stroke: CK.K.blue, "stroke-width": "2", "stroke-linejoin": "round", "stroke-linecap": "round" }));

      // where it starts and where it ends
      s.appendChild(el("circle", { cx: pts[0][0], cy: pts[0][1], r: "3.5", fill: CK.K.ink, stroke: CK.K.card, "stroke-width": "1.5" }));
      var last = pts[n - 1];
      s.appendChild(el("circle", { cx: last[0], cy: last[1], r: "4", fill: CK.K.blue, stroke: CK.K.card, "stroke-width": "2" }));
      var endLabel = CK.text(s, W - R + 9, last[1] + 4, short(S.v[n - 1]), { "font-size": "12.5", "font-weight": "600", fill: CK.txt(CK.K.blue) });

      // each low, marked, and named where neither the line nor another label is.
      // A name may run into the right-hand gutter, which only holds the end value.
      var placed = [], endBox = CK.box(endLabel);
      if (endBox) placed.push(endBox);
      falls.forEach(function (f) {
        s.appendChild(el("circle", { cx: f.x.toFixed(1), cy: f.y.toFixed(1), r: "4", fill: LOSS, stroke: CK.K.card, "stroke-width": "2" }));
        var a = CK.text(s, f.x, f.y, f.name, { "font-size": "11" });
        var b = CK.text(s, f.x, f.y, pct(f.drop), { "font-size": "12", "font-weight": "600", fill: LOSS });
        var tries = [["middle", 0, 19], ["start", 7, 19], ["end", -7, 19], ["start", 10, 4], ["end", -10, 4],
                     ["start", 12, 12], ["end", -12, 12], ["start", 15, 6], ["end", -15, 6], ["start", 17, 16], ["end", -17, 16],
                     ["start", 7, -32], ["end", -7, -32], ["middle", 0, -32]];
        var best = null;
        for (var k = 0; k < tries.length; k++) {
          var t = tries[k];
          [a, b].forEach(function (node, j) {
            node.setAttribute("text-anchor", t[0]);
            node.setAttribute("x", (f.x + t[1]).toFixed(1));
            node.setAttribute("y", (f.y + t[2] + j * 14).toFixed(1));
          });
          var bx = CK.bounds([a, b]);
          if (!bx) break;
          var bad = (bx.x < L + 2 || bx.x + bx.width > W - 3 || bx.y < T + 1 || bx.y + bx.height > H - B - 1 ? 5 : 0) +
                    (placed.some(function (o) { return CK.overlap(bx, o); }) ? 4 : 0) +
                    (CK.crosses(bx, [pts]) ? 3 : 0);
          if (best === null || bad < best.bad) best = { k: k, bad: bad };
          if (!bad) break;
        }
        if (best) {
          var u = tries[best.k];
          [a, b].forEach(function (node, j) {
            node.setAttribute("text-anchor", u[0]);
            node.setAttribute("x", (f.x + u[1]).toFixed(1));
            node.setAttribute("y", (f.y + u[2] + j * 14).toFixed(1));
          });
          CK.keepIn([a, b], L + 2, W - 3);
        }
        CK.plate(s, [a, b], 2);
        var fin = CK.bounds([a, b]);
        if (fin) placed.push(fin);
      });

      // the month under a pointer or a finger
      var hair = el("line", { x1: 0, y1: T, x2: 0, y2: H - B, stroke: CK.K.ink, "stroke-opacity": ".45", "stroke-width": "1", visibility: "hidden" });
      var dot = el("circle", { r: "4.5", fill: CK.K.blue, stroke: CK.K.card, "stroke-width": "2", visibility: "hidden" });
      s.appendChild(hair); s.appendChild(dot);
      var pad = el("rect", { x: L, y: T, width: W - L - R, height: H - T - B, fill: "#fff", "fill-opacity": "0" });
      s.appendChild(pad);

      function show(clientX) {
        var box = s.getBoundingClientRect();
        if (!box.width) return;
        var px = (clientX - box.left) * W / box.width;
        var day = x0 + (x1 - x0) * Math.max(0, Math.min(1, (px - L) / (W - L - R)));
        var lo = 0, hi = n - 1;
        while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (S.d[mid] <= day) lo = mid; else hi = mid; }
        var k = day - S.d[lo] <= S.d[hi] - day ? lo : hi;
        hair.setAttribute("x1", pts[k][0].toFixed(1)); hair.setAttribute("x2", pts[k][0].toFixed(1)); hair.setAttribute("visibility", "visible");
        dot.setAttribute("cx", pts[k][0].toFixed(1)); dot.setAttribute("cy", pts[k][1].toFixed(1)); dot.setAttribute("visibility", "visible");
        if (read) {
          var under = S.v[k] / peak[k] - 1;
          read.textContent = monthOf(S.d[k]) + ": " + usd(S.v[k]) + (under < -0.0005 ? ", " + (Math.abs(under) * 100).toFixed(1) + "% below its high" : ", at a new high");
        }
      }
      function hide() {
        hair.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden");
        if (read) read.textContent = resting(S);
      }
      pad.addEventListener("pointermove", function (e) { show(e.clientX); });
      pad.addEventListener("pointerdown", function (e) { show(e.clientX); });
      pad.addEventListener("pointerleave", hide);
      pad.addEventListener("pointercancel", hide);
    });

    if (read) read.textContent = resting(S);
  }

  function start() {
    [["spx", "ix-spx"], ["ndx", "ix-ndx"]].forEach(function (p) {
      var host = document.getElementById(p[1]);
      if (host) paint(host, document.getElementById(p[1] + "-read"), SERIES[p[0]]);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
