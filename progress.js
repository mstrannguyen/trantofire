/* Renders the Progress page from js/data.js via the engine. No network calls. */
(function () {
  "use strict";
  var E = window.TTF_ENGINE, cfg = window.TTF, usd = E.usd, pct = E.pct, ddPct = E.ddPct;
  var $ = function (id) { return document.getElementById(id); };
  function show(id) { var e = $(id); if (e) e.classList.remove("hidden"); }
  function hide(id) { var e = $(id); if (e) e.classList.add("hidden"); }

  /* ---------- svg helpers ---------- */
  function el(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svgRoot(w, h) {
    var s = el("svg", { viewBox: "0 0 " + w + " " + h, role: "img" });
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
    return s;
  }
  function pathFrom(pts) {
    return pts.map(function (p, i) {
      return (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1);
    }).join(" ");
  }
  /* Label every month when they fit, and step by 2, 3, 4, 6 or 12 when they
     do not. The year is printed only when it changes, which keeps each label
     short enough to fit many more of them. */
  function xLabels(s, months, x, H, n) {
    if (!n) return;

    function put(i, anchor, text) {
      var t = el("text", {
        x: x(i), y: H - 16, "text-anchor": anchor,
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E"
      });
      t.textContent = text;
      s.appendChild(t);
    }

    if (n === 1) { put(0, "middle", months[0]); return; }

    /* Quarterly, then half-yearly, then yearly. Monthly labels crowd and the
       year-bearing ones overlap their neighbour. */
    var per  = Math.abs(x(n - 1) - x(0)) / (n - 1);   // pixels per month
    var step = 12;
    [3, 6, 12].some(function (k) {
      if (per * k >= 52) { step = k; return true; }
      return false;
    });
    if (n <= 4) step = 1;

    var shown = [];
    for (var i = 0; i < n; i += step) shown.push(i);
    if (shown[shown.length - 1] !== n - 1) {
      // always end on the newest month, dropping the one before it if they
      // would sit on top of each other
      if ((n - 1 - shown[shown.length - 1]) * per < 40) shown.pop();
      shown.push(n - 1);
    }

    var lastYear = "";
    shown.forEach(function (i, k) {
      var parts = String(months[i]).split(" ");
      var mon = parts[0], yr = parts[1] || "";
      var text = (yr && yr !== lastYear) ? mon + " " + yr : mon;
      lastYear = yr || lastYear;
      put(i, i === 0 ? "start" : (i === n - 1 ? "end" : "middle"), text);
    });
  }

  /* What TQQQ did with the money actually in it.

     The cash reserve is excluded from both sides. It is not TQQQ, it earns a
     different return, and leaving it in drags the figure toward zero while it
     sits waiting, which tells you about the schedule rather than about the
     fund. The line is dollars, because dollars are what compounds. The
     percentage rides along at the points worth naming.

     A second axis was the obvious way to show both and the wrong one: the
     amount invested grows every month, so a percentage axis fixed to today's
     cost basis would misread every earlier point on the chart. */
  /* Price, the high-water mark, the tier thresholds, and every buy. */
  function drawPriceChart(host, rows) {
    var W = 880, H = 380, L = 58, R = 118, T = 20, B = 46, n = rows.length;
    if (!n) { host.innerHTML = ""; return; }

    var TIER = [
      { at: 0.60, colour: "#8E1414", label: "\u221260% \u00b7 100%" },
      { at: 0.40, colour: "#E05A0C", label: "\u221240% \u00b7 67%" },
      { at: 0.20, colour: "#C9A012", label: "\u221220% \u00b7 33%" }
    ];
    /* Colour and size both carry the tier. Size is the useful half: a bigger
       triangle is a bigger share of the pile going in, so the markers grow as
       the price falls without anyone needing to read the legend. */
    var MARK = {
      "Baseline": { c: "#2E7D32", r: 5.0 },
      "Dip":      { c: "#EFC61E", r: 6.5 },
      "Deep dip": { c: "#E05A0C", r: 8.0 },
      "Crash":    { c: "#8E1414", r: 9.5 }
    };

    var lo = Infinity, hi = 0;
    rows.forEach(function (d) {
      lo = Math.min(lo, d.price, d.high * 0.40);
      hi = Math.max(hi, d.price, d.high);
    });
    var pad = (hi - lo) * 0.10 || 1;
    lo = Math.max(0, lo - pad); hi = hi + pad;

    var x = function (i) { return n < 2 ? (L + W - R) / 2 : L + (W - L - R) * (i / (n - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };
    var s = svgRoot(W, H);

    for (var g = 0; g <= 4; g++) {
      var gv = lo + (hi - lo) * g / 4, gy = y(gv);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy,
        stroke: "#3A2B31", "stroke-opacity": g === 0 ? ".22" : ".07" }));
      var t = el("text", { x: L - 10, y: gy + 4, "text-anchor": "end",
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = usd(gv, 0);
      s.appendChild(t);
    }

    /* The high-water mark only ever rises, and each tier boundary is a fixed
       fraction of it, so all four step together.

       One month is still a line. Without the n === 1 case the path is a bare
       moveto, which SVG draws as nothing, so the record high and all three
       tier boundaries vanished and the chart came up empty with only the
       right-hand labels floating beside it. A flat line across the plot is
       what those levels actually did that month. */
    function step(values) {
      if (n === 1) {
        var only = y(values[0]);
        return "M" + L + "," + only + " L" + (W - R) + "," + only;
      }
      var d = "";
      for (var i = 0; i < n; i++) {
        var px = x(i), py = y(values[i]);
        if (i === 0) { d = "M" + px + "," + py; }
        else { d += " L" + px + "," + y(values[i - 1]) + " L" + px + "," + py; }
      }
      return d;
    }
    s.appendChild(el("path", { d: step(rows.map(function (d) { return d.high; })),
      fill: "none", stroke: "#5A7BA8", "stroke-width": "1.8", "stroke-opacity": ".85" }));
    TIER.forEach(function (tier) {
      var vals = rows.map(function (d) { return d.high * (1 - tier.at); });
      s.appendChild(el("path", { d: step(vals), fill: "none", stroke: tier.colour,
        "stroke-width": "1.4", "stroke-opacity": ".55", "stroke-dasharray": "5 4" }));
      var t = el("text", { x: W - R + 6, y: y(vals[n - 1]) + 4,
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11",
        "font-weight": "600", fill: tier.colour });
      t.textContent = tier.label;
      s.appendChild(t);
    });

    var pts = rows.map(function (d, i) { return [x(i), y(d.price)]; });
    if (n > 1) {
      s.appendChild(el("path", { d: pathFrom(pts), fill: "none", stroke: "#3A2B31",
        "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    } else {
      // no line to draw yet, so the price gets a dot, same as the other charts
      s.appendChild(el("circle", { cx: pts[0][0], cy: pts[0][1], r: "5",
        fill: "#3A2B31", stroke: "#FFFFFF", "stroke-width": "1.5" }));
    }

    rows.forEach(function (d, i) {
      if (!(d.bought > 0)) return;
      var m = MARK[d.tier.label] || MARK.Baseline;
      var px = x(i), py = y(d.price) + 11 + m.r;
      s.appendChild(el("path", {
        d: "M" + px + "," + (py - m.r * 1.25) + " L" + (px + m.r) + "," + (py + m.r * 0.55) +
           " L" + (px - m.r) + "," + (py + m.r * 0.55) + " Z",
        fill: m.c, stroke: "#FFFFFF", "stroke-width": "1"
      }));
    });

    var last = rows[n - 1];
    [[last.high, "#5A7BA8"], [last.price, "#3A2B31"]].forEach(function (r) {
      var ry = y(r[0]);
      s.appendChild(el("rect", { x: W - R + 8, y: ry - 11, width: 84, height: 22, rx: "4", fill: r[1] }));
      var t = el("text", { x: W - R + 50, y: ry + 4, "text-anchor": "middle",
        "font-family": "EB Garamond,Georgia,serif", "font-size": "12.5",
        "font-weight": "600", fill: "#FBF7F1" });
      t.textContent = usd(r[0], 2);
      s.appendChild(t);
    });

    xLabels(s, rows.map(function (d) { return d.label; }), x, H, n);
    host.innerHTML = ""; host.appendChild(s);
  }

  function drawValueChart(host, rows, label) {
    var W = 880, H = 360, L = 74, R = 20, T = 34, B = 48, n = rows.length;
    if (!n) { host.innerHTML = ""; return; }

    var cost = rows.map(function (d) { return d.shares * d.avgCost; });
    var pl   = rows.map(function (d, i) { return d.etfValue - cost[i]; });

    var hi = Math.max.apply(null, pl.concat([0]));
    var lo = Math.min.apply(null, pl.concat([0]));
    var pad = (hi - lo) * 0.16 || 1;
    hi += pad * (n < 3 ? 2.2 : 1); lo -= pad;   // headroom for the callouts

    var x = function (i) { return n < 2 ? (L + W - R) / 2 : L + (W - L - R) * (i / (n - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };
    var s = svgRoot(W, H), z = y(0);

    for (var g = 0; g <= 4; g++) {
      var gv = lo + (hi - lo) * g / 4, gy = y(gv);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: "#3A2B31", "stroke-opacity": ".07" }));
      var t = el("text", { x: L - 10, y: gy + 4, "text-anchor": "end",
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = usd(gv, 0);
      s.appendChild(t);
    }

    var pts = pl.map(function (v, i) { return [x(i), y(v)]; });
    s.appendChild(el("path", { d: pathFrom(pts) + " L" + x(n - 1) + "," + z + " L" + x(0) + "," + z + " Z",
      fill: "#B0894F", "fill-opacity": ".12" }));
    s.appendChild(el("line", { x1: L, y1: z, x2: W - R, y2: z, stroke: "#3A2B31",
      "stroke-opacity": ".5", "stroke-width": "1.4" }));
    var zt = el("text", { x: L + 4, y: z - 7, "font-family": "EB Garamond,Georgia,serif",
      "font-size": "11.5", fill: "#7A6A6F" });
    zt.textContent = "break even";
    s.appendChild(zt);
    if (n > 1) {
      s.appendChild(el("path", { d: pathFrom(pts), fill: "none", stroke: "#B0894F",
        "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    }

    function argmin(a) { var b = 0; for (var i = 1; i < a.length; i++) if (a[i] < a[b]) b = i; return b; }
    function argmax(a) { var b = 0; for (var i = 1; i < a.length; i++) if (a[i] > a[b]) b = i; return b; }
    var marks = [], lowI = argmin(pl), highI = argmax(pl);
    if (pl[lowI] < 0 && lowI !== n - 1) marks.push({ i: lowI, below: true });
    if (pl[highI] > 0 && highI !== n - 1) marks.push({ i: highI, below: false });
    marks.push({ i: n - 1, below: pl[n - 1] < 0 });

    marks.forEach(function (m) {
      var i = m.i, cx = x(i), cy = y(pl[i]);
      var col = pl[i] >= 0 ? "#2E7D32" : "#8E1414";
      s.appendChild(el("circle", { cx: cx, cy: cy, r: "4.5", fill: col, stroke: "#FFFFFF", "stroke-width": "1.5" }));
      /* Two lines of label, clear of the marker in both directions. The old
         spacing put the second line at cy exactly, which is where the dot is. */
      var ty = m.below ? cy + 26 : cy - 34;
      var anchor = n === 1 ? "middle" : (i === 0 ? "start" : (i === n - 1 ? "end" : "middle"));
      var t1 = el("text", { x: cx, y: ty, "text-anchor": anchor, "font-family": "EB Garamond,Georgia,serif",
        "font-size": "15", "font-weight": "700", fill: col });
      t1.textContent = usd(pl[i]);
      s.appendChild(t1);
      var t2 = el("text", { x: cx, y: ty + 16, "text-anchor": anchor, "font-family": "EB Garamond,Georgia,serif",
        "font-size": "12.5", fill: col });
      t2.textContent = (cost[i] > 0 ? pct(pl[i] / cost[i]) : "\u2014") + " on money invested in " + (label || "the funds");
      s.appendChild(t2);
    });

    xLabels(s, rows.map(function (d) { return d.label; }), x, H, n);
    host.innerHTML = ""; host.appendChild(s);
  }

  /* Both returns on one axis.

     The dollar gain behind these two is nearly the same figure. What differs
     is what it is divided by: the money actually spent on shares, or every
     dollar contributed including the cash still waiting. Early on the ladder
     leaves most of the money in cash, so the second line sits close to flat
     while the first swings, and they converge as the reserve gets spent.

     Both series are percentages, so they share one axis. A dual axis here
     would mislead, because the two denominators grow at different rates.

     #8A6428 and #5A7BA8 are both already on the site. Measured rather than
     picked: 139 apart in RGB, 5.3:1 and 4.3:1 on white. */
  var RET_INVESTED = "#8A6428", RET_TOTAL = "#5A7BA8";

  function drawReturnChart(host, rows) {
    var W = 880, H = 360, L = 62, R = 150, T = 26, B = 48, n = rows.length;
    if (!host) return;
    if (!n) { host.innerHTML = ""; return; }

    var inv = [], tot = [];
    rows.forEach(function (d) {
      var cost = d.shares * d.avgCost;
      inv.push(cost > 0 ? (d.etfValue - cost) / cost : 0);
      tot.push(d.moneyIn > 0 ? (d.portfolio - d.moneyIn) / d.moneyIn : 0);
    });

    var all = inv.concat(tot).concat([0]);
    var hi = Math.max.apply(null, all), lo = Math.min.apply(null, all);
    var pad = (hi - lo) * 0.18 || 0.02;
    hi += pad; lo -= pad;

    var x = function (i) { return n < 2 ? (L + W - R) / 2 : L + (W - L - R) * (i / (n - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };
    var s = svgRoot(W, H);

    for (var g = 0; g <= 4; g++) {
      var gv = lo + (hi - lo) * g / 4, gy = y(gv);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy,
        stroke: "#3A2B31", "stroke-opacity": ".07" }));
      var t = el("text", { x: L - 10, y: gy + 4, "text-anchor": "end",
        "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = pct(gv, 0);
      s.appendChild(t);
    }

    var z = y(0);
    s.appendChild(el("line", { x1: L, y1: z, x2: W - R, y2: z,
      stroke: "#3A2B31", "stroke-opacity": ".5", "stroke-width": "1.4" }));
    var zt = el("text", { x: L + 4, y: z - 7, "font-family": "EB Garamond,Georgia,serif",
      "font-size": "11.5", fill: "#7A6A6F" });
    zt.textContent = "break even";
    s.appendChild(zt);

    var ends = [];
    [[inv, RET_INVESTED, "on money invested"], [tot, RET_TOTAL, "on money in"]]
      .forEach(function (line) {
        var vals = line[0], col = line[1];
        var pts = vals.map(function (v, i) { return [x(i), y(v)]; });
        if (n > 1) {
          s.appendChild(el("path", { d: pathFrom(pts), fill: "none", stroke: col,
            "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" }));
        }
        var cx = pts[n - 1][0], cy = pts[n - 1][1];
        s.appendChild(el("circle", { cx: cx, cy: cy, r: "4.5", fill: col,
          stroke: "#FFFFFF", "stroke-width": "1.5" }));
        ends.push({ y: cy, colour: col, name: line[2],
                    text: (vals[n - 1] > 0 ? "+" : "") + pct(vals[n - 1]) });
      });

    /* Two months of similar returns put the end labels on top of each other.
       Both are placed only after both positions are known, and the lower one
       is pushed down until the pair clears. */
    ends.sort(function (a, b) { return a.y - b.y; });
    var GAP = 38;
    if (ends[1].y - ends[0].y < GAP) ends[1].y = ends[0].y + GAP;
    var overflow = ends[1].y + 18 - (H - B);
    if (overflow > 0) { ends[0].y -= overflow; ends[1].y -= overflow; }

    ends.forEach(function (e) {
      var t1 = el("text", { x: W - R + 12, y: e.y - 1,
        "font-family": "EB Garamond,Georgia,serif", "font-size": "16",
        "font-weight": "700", fill: e.colour });
      t1.textContent = e.text;
      s.appendChild(t1);
      var t2 = el("text", { x: W - R + 12, y: e.y + 15,
        "font-family": "EB Garamond,Georgia,serif", "font-size": "12", fill: e.colour });
      t2.textContent = e.name;
      s.appendChild(t2);
    });

    xLabels(s, rows.map(function (d) { return d.label; }), x, H, n);
    host.innerHTML = ""; host.appendChild(s);
  }

  function drawDrawdownChart(host, months, dds) {
    var W = 880, H = 300, L = 52, R = 18, T = 18, B = 44, n = months.length;
    var floor = Math.min(-0.70, Math.min.apply(null, dds.concat([0])) - 0.05);
    var x = function (i) { return n < 2 ? (L + W - R) / 2 : L + (W - L - R) * (i / (n - 1)); };
    var y = function (v) { return T + (H - T - B) * (v / floor); };
    var s = svgRoot(W, H);
    [[0, -0.20, "#FFFFFF"], [-0.20, -0.40, "#EDD9D2"], [-0.40, -0.60, "#E3C7BE"], [-0.60, floor, "#3A2B31"]]
      .forEach(function (b) {
        var y1 = y(b[0]), y2 = y(b[1]);
        s.appendChild(el("rect", { x: L, y: y1, width: W - L - R, height: Math.max(0, y2 - y1), fill: b[2], "fill-opacity": b[2] === "#3A2B31" ? ".14" : ".55" }));
      });
    [0, -0.20, -0.40, -0.60].forEach(function (v) {
      var gy = y(v);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: "#3A2B31", "stroke-opacity": v === 0 ? ".25" : ".14", "stroke-dasharray": v === 0 ? "" : "4 4" }));
      var t = el("text", { x: L - 10, y: gy + 4, "text-anchor": "end", "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = (v * 100) + "%";
      s.appendChild(t);
    });
    var pts = dds.map(function (v, i) { return [x(i), y(v)]; });
    if (n > 1) {
      s.appendChild(el("path", { d: pathFrom(pts), fill: "none", stroke: "#3A2B31", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    } else {
      s.appendChild(el("circle", { cx: x(0), cy: y(dds[0]), r: "6", fill: "#3A2B31" }));
    }
    xLabels(s, months, x, H, n);
    host.innerHTML = ""; host.appendChild(s);
  }

  /* ---------- render one sleeve ----------

     The page holds one set of ids and re-renders them when the tab changes,
     rather than carrying two of everything. renderToken exists because the
     live price arrives from the network: without it a slow reply for the tab
     you just left would land on the tab you just opened. */
  var renderToken = 0;

  function paintTier(row) {
    var pill = $("tier");
    if (!pill) return;
    if (row.highKnown) {
      pill.textContent = row.tier.label + " \u00b7 deploy " + pct(row.deployPct || row.tier.pct, 0);
      pill.className = "tierpill t" + row.tier.n;
    } else {
      pill.textContent = "Tier unknown until the record high loads";
      pill.className = "tierpill";
    }
  }

  /* Tier tally: how many months the ladder has spent on each rung.

     The ladder comes from the engine rather than being written out again here,
     so a change to the rules cannot leave this table describing the old ones.
     Rows with no record high are skipped: without one the engine reads no
     drawdown at all, which would file every month under Baseline and make the
     ladder look untested when it is only unmeasured. */
  function paintTally(history, what) {
    var body = $("tally-rows");
    if (!body) return;
    var head = $("tally-h");
    if (head) head.textContent = "Months at each tier" + (what ? " \u00b7 " + what : "");

    var known = history.filter(function (d) { return d.highKnown; });
    var count = {}, worst = {};
    known.forEach(function (d) {
      var k = d.tier.label;
      count[k] = (count[k] || 0) + 1;
      if (worst[k] === undefined || d.drawdown < worst[k]) worst[k] = d.drawdown;
    });

    var ladder = (E.TIERS || []).slice().reverse();   // Baseline first, Crash last
    body.innerHTML = ladder.map(function (t) {
      var n = count[t.label] || 0;
      return "<tr>" +
        '<td><span class="sig s' + t.n + '">' + t.label + "</span></td>" +
        '<td' + (n ? "" : ' class="none"') + ">" + n + "</td>" +
        "<td>" + pct(t.pct, 0) + "</td>" +
        '<td' + (n ? "" : ' class="none"') + ">" +
          (n ? ddPct(worst[t.label]) : "\u2014") + "</td>" +
        "</tr>";
    }).join("");

    var wrap = $("tally-wrap");
    if (wrap) wrap.classList.toggle("hidden", known.length === 0);
  }

  /* The drawdown and tier columns depend on the record high, which arrives
     from the network after the first paint. The table is rebuilt rather than
     patched in place so both layers go through the same code. */
  function logRows(history) {
    var html = "";
    for (var k = history.length - 1; k >= 0; k--) {
      var d = history[k];
      html += "<tr>" +
        '<td class="mth">' + d.label +
          (d.note ? '<br><span style="font-family:var(--body);font-size:12.5px;color:var(--muted)">' + d.note + "</span>" : "") + "</td>" +
        "<td>" + usd(d.price, 2) + "</td>" +
        "<td>" + (d.highKnown ? ddPct(d.drawdown) : "\u2014") + "</td>" +
        (d.highKnown
          ? '<td><span class="sig s' + d.tier.n + '">' + d.tier.label + "</span></td>"
          : "<td>\u2014</td>") +
        "<td>" + pct(d.deployPct, 0) + "</td>" +
        "<td>" + usd(d.available) + "</td>" +
        "<td>" + usd(d.spent) + "</td>" +
        "<td>" + d.bought + (d.deviated ? '<span class="dev" title="The rules said ' + d.ruleBought + '">\u2260</span>' : "") + "</td>" +
        "<td>" + d.shares + "</td>" +
        "<td>" + usd(d.avgCost, 2) + "</td>" +
        "<td>" + usd(d.reserve) + "</td>" +
        "<td>" + usd(d.portfolio) + "</td>" +
        "<td>" + usd(d.moneyIn) + "</td>" +
        '<td class="' + (d.ret >= 0 ? "pos" : "neg") + '">' + pct(d.ret) + "</td>" +
        "</tr>";
    }
    return html;
  }

  function renderSleeve(sleeve) {
    document.getElementById("data").setAttribute("data-sym", sleeve.sym);
    var grid = $("r-grid"); if (grid) grid.classList.remove("hidden");
    var pill0 = $("tier"); if (pill0) pill0.classList.remove("hidden");
    // cleared rather than left carrying the combined view's wording; the live
    // block below rewrites it, and an empty line beats a wrong one if it cannot
    var stamp0 = document.getElementById("p-live");
    if (stamp0) stamp0.textContent = "";
    /* ---------- render ---------- */
    var history = E.run(sleeve.rows || [], sleeve);
    hide("loading");

    if (!history.length) { show("empty"); hide("data"); return; }

    var last = history[history.length - 1];

    // the latest buy, in plain language
    $("r-month").textContent   = last.label;
    $("r-price").textContent   = usd(last.fill, 2);
    $("r-spend").textContent   = usd(last.spent);
    $("r-shares").textContent  = last.bought;
    $("r-reserve").textContent = usd(last.reserve);
    var deviationNote = last.deviated
      ? " <b>The rules said " + last.ruleBought + " share" + (last.ruleBought === 1 ? "" : "s") +
        "; I bought " + last.bought + ".</b>" + (last.note ? " " + last.note + "." : "")
      : "";
    $("r-line").innerHTML = last.bought > 0
      ? "Bought <b>" + last.bought + " share" + (last.bought === 1 ? "" : "s") + "</b> at " + usd(last.fill, 2) +
        ", spending <b>" + usd(last.spent) + "</b>, " + pct(last.deployPct, 0) + " of the " + usd(last.available) +
        " available, because " + sleeve.sym + " was " + ddPct(last.drawdown) + " below its high. " +
        usd(last.reserve) + " carried into next month." + deviationNote
      : "No shares bought this month. " + usd(last.available) + " was available and the rules deployed " +
        pct(last.deployPct, 0) + ", which wasn't enough for a whole share at " + usd(last.fill, 2) + ". It all carried forward." + deviationNote;

    $("asof").textContent = last.label;

    paintTier(last);

    $("s-value").firstChild.nodeValue = usd(last.portfolio);
    $("s-in").firstChild.nodeValue    = usd(last.moneyIn);
    var plEl = $("s-pl");
    plEl.firstChild.nodeValue = (last.pl < 0 ? "\u2212" : "") + usd(Math.abs(last.pl));
    plEl.className = last.pl >= 0 ? "pos" : "neg";
    $("s-pl-sub").textContent = pct(last.ret) + " on money in";
    $("s-dd").firstChild.nodeValue    = last.highKnown ? ddPct(last.drawdown) : "\u2014";
    $("s-dd-sub").textContent         = last.highKnown
      ? "high-water mark " + usd(last.high, 2)
      : "waiting on the record high from Yahoo Finance";
    $("s-sh").firstChild.nodeValue    = last.shares.toLocaleString("en-US");
    $("s-avg").firstChild.nodeValue   = usd(last.avgCost, 2);
    $("s-cash").firstChild.nodeValue  = usd(last.reserve);
    $("s-alloc").firstChild.nodeValue = Math.round(last.pctEtf * 100) + "% / " + Math.round(last.pctCash * 100) + "%";
    var allocSub = $("s-alloc-sub");
    if (allocSub) allocSub.textContent = "fund / cash \u00b7 never rebalanced";

    hide("block-return");
    var c3 = $("chart3"); if (c3) c3.innerHTML = "";

    var lgPrice = $("lg-price");
    if (lgPrice) lgPrice.textContent = sleeve.sym + " price";
    var hValue = $("h-value");
    if (hValue) hValue.textContent = "What " + sleeve.sym + " has done with the money in it";

    var months = history.map(function (d) { return d.label; });

    /* Both of these draw the record high. Without one the step would sit on
       the price line and the drawdown would be a flat zero, which reads as a
       fund that has never been down rather than as a figure the page does not
       have yet. */
    if (last.highKnown) {
      show("block-price"); show("block-drawdown");
      drawPriceChart($("chart0"), history);
      drawDrawdownChart($("chart2"), months, history.map(function (d) { return -Math.abs(d.drawdown); }));
    } else {
      hide("block-price"); hide("block-drawdown");
      $("chart0").innerHTML = ""; $("chart2").innerHTML = "";
    }
    drawValueChart($("chart1"), history, sleeve.sym);

    $("rows").innerHTML = logRows(history);
    paintTally(history, sleeve.sym);

    show("data");

    // ---- upgrade the valuation to a live market price if available ----
    if (window.TTF_LIVE) {
      var token = ++renderToken;
      window.TTF_LIVE.quoteFor(sleeve.sym).then(function (live) {
        if (token !== renderToken) return;            // a later tab click wins

        /* Feed down. The high on screen is the last one Yahoo gave, kept in
           this browser, so the drawdown and the tier still stand. Only the
           valuation is stale, and it is the last logged price either way. */
        if (!live) {
          var kept = sleeve.HIGH_WATER_MARK_KEPT;
          var st = document.getElementById("p-live");
          if (st && kept) {
            st.textContent = "Yahoo Finance did not answer. The record high of " +
              usd(kept.ath, 2) + " is the last one it gave, saved in this browser on " +
              new Date(kept.savedAt).toLocaleDateString("en-AU",
                { day: "numeric", month: "short", year: "numeric" }) +
              ". Everything else is the last logged price.";
          }
          return;
        }

        // Yahoo's all-time high replaces the hardcoded reference where it is higher
        var hist = history;
        // Yahoo's figure is the record high; config only covers a dead feed
        if (live.ath > 0) {
          var lifted = {};
          for (var ck in sleeve) lifted[ck] = sleeve[ck];
          lifted.HIGH_WATER_MARK = live.ath;
          hist = E.run(sleeve.rows || [], lifted);
        }

        var r = E.revalue(hist, live.price);
        if (!r) return;

        /* The first paint ran without a record high, so the tier pill and the
           drawdown and tier columns were left blank. Now there is one. */
        if (r.highKnown) {
          paintTier(hist[hist.length - 1]);
          $("rows").innerHTML = logRows(hist);
          paintTally(hist, sleeve.sym);
        }

        // the chart's last point should agree with the cards above it
        // the last point moves to the live price, so the chart agrees with the cards
        var live = hist.slice();
        var lastRow = {};
        for (var k in live[live.length - 1]) lastRow[k] = live[live.length - 1][k];
        lastRow.etfValue = r.etfValue;
        live[live.length - 1] = lastRow;
        drawValueChart($("chart1"), live, sleeve.sym);
        if (r.highKnown) {
          show("block-price"); show("block-drawdown");
          drawPriceChart($("chart0"), live);
          drawDrawdownChart($("chart2"), live.map(function (d) { return d.label; }),
            live.map(function (d) { return -Math.abs(d.drawdown); }));
        }

        // only the "what is it worth now" figures move; the log stays as bought
        $("s-value").firstChild.nodeValue = usd(r.portfolio);
        var plEl = $("s-pl");
        plEl.firstChild.nodeValue = (r.pl < 0 ? "\u2212" : "") + usd(Math.abs(r.pl));
        plEl.className = r.pl >= 0 ? "pos" : "neg";
        $("s-pl-sub").textContent = pct(r.ret) + " on money in";
        $("s-dd").firstChild.nodeValue = r.highKnown ? ddPct(r.drawdown) : "\u2014";
        $("s-dd-sub").textContent = r.highKnown
          ? "high-water mark " + usd(r.high, 2)
          : "waiting on the record high from Yahoo Finance";
        $("s-alloc").firstChild.nodeValue =
          Math.round(r.pctEtf * 100) + "% / " + Math.round(r.pctCash * 100) + "%";

        // prepend a live "Today" row so the table reconciles with the summary above
        var rowsEl = $("rows");
        if (rowsEl && !document.getElementById("today-row")) {
          var tr = document.createElement("tr");
          tr.id = "today-row";
          tr.className = "today";
          tr.innerHTML =
            '<td class="mth">Today<br><span class="sub-note">live price</span></td>' +
            "<td>" + usd(r.price, 2) + "</td>" +
            "<td>" + ddPct(r.drawdown) + "</td>" +
            '<td><span class="sig s' + r.tier.n + '">' + r.tier.label + "</span></td>" +
            "<td>" + pct(r.tier.pct, 0) + "</td>" +
            "<td>\u2014</td><td>\u2014</td><td>\u2014</td>" +
            "<td>" + r.shares + "</td>" +
            "<td>" + usd(r.avgCost, 2) + "</td>" +
            "<td>" + usd(r.reserve) + "</td>" +
            "<td>" + usd(r.portfolio) + "</td>" +
            "<td>" + usd(r.moneyIn) + "</td>" +
            '<td class="' + (r.ret >= 0 ? "pos" : "neg") + '">' + pct(r.ret) + "</td>";
          rowsEl.insertBefore(tr, rowsEl.firstChild);
        }

        var stamp = document.getElementById("p-live");
        if (stamp) {
          stamp.textContent = "Valued at the live " + sleeve.sym + " price of " + usd(r.price, 2) +
            " from " + live.source +
            (live.asOf ? ", " + window.TTF_LIVE.asOfLabel(live.asOf) + " Sydney time" : "") +
            ". The table below shows the prices actually paid.";
        }
      });
    }
  }
  /* ---------- the combined view ----------

     Shares, average cost and drawdown belong to one fund, so they are not
     summed here. Money is: two sleeves, two reserves, one total. The value
     chart adds the profit on both, which is why it needs each sleeve's own
     shares and average cost carried into the merged row. */
  /* ---------- the combined view ----------

     Shares, average cost and drawdown belong to one fund, so they are not
     summed. Money is: two sleeves, two reserves, one total.

     Two things this has to get right. The totals are revalued at each fund's
     live price, the same as the single-fund tabs do, or Both sits at the last
     logged prices and quietly disagrees with every other figure on the site.
     And a month that one sleeve has not logged carries that sleeve's previous
     position forward rather than dropping it, which would otherwise wipe a
     whole fund out of any month it happened to skip. */

  function mergeHistories(runs) {
    var labels = {};
    runs.forEach(function (r) {
      r.hist.forEach(function (d) { labels[d.month] = d.label; });
    });
    var keys = Object.keys(labels).sort();
    var at = runs.map(function () { return -1; });

    return keys.map(function (k) {
      var m = { month: k, label: labels[k], etfValue: 0, reserve: 0,
                portfolio: 0, moneyIn: 0, cost: 0 };
      runs.forEach(function (r, i) {
        while (at[i] + 1 < r.hist.length && r.hist[at[i] + 1].month <= k) at[i]++;
        if (at[i] < 0) return;                  // this sleeve had not started yet
        var d = r.hist[at[i]];
        m.etfValue  += d.etfValue;
        m.reserve   += d.reserve;
        m.portfolio += d.portfolio;
        m.moneyIn   += d.moneyIn;
        m.cost      += d.shares * d.avgCost;
      });
      m.shares = 1; m.avgCost = m.cost;         // so shares * avgCost is the cost basis
      return m;
    });
  }

  function paintBoth(runs) {
    var merged = mergeHistories(runs);
    var value = 0, moneyIn = 0, reserve = 0, etfValue = 0;

    runs.forEach(function (r) {
      var v = r.live || r.hist[r.hist.length - 1];
      value    += v.portfolio;
      moneyIn  += v.moneyIn;
      reserve  += v.reserve;
      etfValue += v.etfValue;
    });

    var pl = value - moneyIn;
    var etfShare = value > 0 ? etfValue / value : 0;

    $("s-value").firstChild.nodeValue = usd(value);
    $("s-value-sub").textContent = runs.length === 1
      ? "one fund logged so far" : "across " + runs.length + " funds";
    $("s-in").firstChild.nodeValue = usd(moneyIn);
    $("s-in-sub").textContent = usd(runs.reduce(function (a, r) {
      return a + r.sl.CONTRIBUTION; }, 0)) + " a month, " + runs.map(function (r) {
      return r.sl.sym; }).join(" and ");

    var plEl = $("s-pl");
    plEl.firstChild.nodeValue = (pl < 0 ? "\u2212" : "") + usd(Math.abs(pl));
    plEl.className = pl >= 0 ? "pos" : "neg";
    $("s-pl-sub").textContent = pct(moneyIn ? pl / moneyIn : 0) + " on money in";

    $("s-cash").firstChild.nodeValue = usd(reserve);
    $("s-cash-sub").textContent = "both reserves";
    $("s-alloc").firstChild.nodeValue =
      Math.round(etfShare * 100) + "% / " + Math.round((1 - etfShare) * 100) + "%";
    $("s-alloc-sub").textContent = "funds / cash";

    ["dd", "sh", "avg"].forEach(function (k) {
      var e = $("s-" + k);
      if (e && e.firstChild) e.firstChild.nodeValue = "\u2014";
      var sub = $("s-" + k + "-sub");
      if (sub) sub.textContent = "per fund, use the tabs";
      if (e) e.className = "";
    });

    var hValue = $("h-value");
    if (hValue) hValue.textContent = "What the two funds have done with the money in them";
    drawValueChart($("chart1"), merged, "both funds");

    /* Only on Both. Per fund the cash reserve is one of two, so dividing that
       fund's gain by its own share of the money in answers a question nobody
       asked. Across the whole position it is the return. */
    show("block-return");
    drawReturnChart($("chart3"), merged);

    /* A price line and a drawdown line belong to one fund. Two funds at two
       prices against two record highs cannot share either axis, so both blocks
       come off the page here rather than standing empty above their captions. */
    hide("block-price");
    hide("block-drawdown");
    ["chart0", "chart2"].forEach(function (id) {
      var c = $(id); if (c) c.innerHTML = "";
    });
  }

  /* The receipt is one fund's buy. Under Both it becomes a sentence per fund,
     and the four-figure grid is hidden: a price paid and a share count belong
     to a single ticker and cannot be added together. The tier pill goes too,
     for the same reason. */
  function receiptBoth(runs) {
    var latest = "", label = "";
    runs.forEach(function (r) {
      var d = r.hist[r.hist.length - 1];
      if (d.month > latest) { latest = d.month; label = d.label; }
    });

    var bought = [], spent = 0, reserve = 0, available = 0, notes = [];
    runs.forEach(function (r) {
      var d = r.hist[r.hist.length - 1];
      spent += d.spent; reserve += d.reserve; available += d.available;
      bought.push(d.bought > 0
        ? "<b>" + d.bought + " " + r.sl.sym + "</b> at " + usd(d.fill, 2)
        : "<b>no " + r.sl.sym + "</b>");
      if (d.month !== latest) {
        notes.push(r.sl.sym + " has not been logged since " + d.label + ".");
      }
      if (d.deviated) {
        notes.push("The rules said " + d.ruleBought + " " + r.sl.sym + " share" +
          (d.ruleBought === 1 ? "" : "s") + "; I bought " + d.bought + ".");
      }
    });

    $("r-month").textContent = label;
    $("r-line").innerHTML =
      "Bought " + bought.join(" and ") + ", spending <b>" + usd(spent) + "</b> of the " +
      usd(available) + " available across both. " + usd(reserve) + " carried into next month." +
      (notes.length ? " <b>" + notes.join(" ") + "</b>" : "");

    var grid = $("r-grid"); if (grid) grid.classList.add("hidden");
    var pill = $("tier");   if (pill) pill.classList.add("hidden");
    $("asof").textContent = label;
  }

  function stampBoth(runs, isLive) {
    var stamp = document.getElementById("p-live");
    if (!stamp) return;
    if (!isLive) {
      stamp.textContent = "Both funds at their last logged prices.";
      return;
    }
    var asOf = null;
    runs.forEach(function (r) { if (!asOf && r.asOf) asOf = r.asOf; });
    stamp.textContent = "Both funds at live prices" +
      (asOf && window.TTF_LIVE.asOfLabel
        ? ", " + window.TTF_LIVE.asOfLabel(asOf) + " Sydney time" : "") +
      ". Open a fund's tab for its month-by-month log.";
  }

  function renderBoth(sleeves) {
    var runs = sleeves.map(function (sl) {
      return { sl: sl, hist: E.run(sl.rows || [], sl), live: null, asOf: null };
    }).filter(function (r) { return r.hist.length; });

    if (!runs.length) { show("empty"); hide("data"); return; }
    document.getElementById("data").setAttribute("data-sym", "BOTH");

    paintBoth(runs);
    receiptBoth(runs);
    sleeveRows(runs);
    stampBoth(runs, false);
    hide("loading"); show("data");

    if (!window.TTF_LIVE || !window.TTF_LIVE.quoteFor) return;
    var token = ++renderToken;

    Promise.all(runs.map(function (r) {
      return window.TTF_LIVE.quoteFor(r.sl.sym).then(function (q) {
        if (!q) return r;
        // the record high comes from Yahoo, so the tier column needs it too
        if (q.ath > 0) {
          var lifted = {};
          for (var k in r.sl) lifted[k] = r.sl[k];
          lifted.HIGH_WATER_MARK = q.ath;
          r.hist = E.run(r.sl.rows || [], lifted);
        }
        r.live = E.revalue(r.hist, q.price);
        r.asOf = q.asOf;
        return r;
      }).catch(function () { return r; });
    })).then(function () {
      if (token !== renderToken) return;        // a later tab click wins
      paintBoth(runs);
      receiptBoth(runs);
      sleeveRows(runs);
      stampBoth(runs, true);
    });
  }

  /* One row per sleeve rather than the month-by-month log, which only makes
     sense against a single price. */
  function sleeveRows(runs) {
    $("rows").innerHTML = runs.map(function (r) {
      var d = r.hist[r.hist.length - 1];
      return "<tr>" +
        '<td class="mth">' + r.sl.sym + "<br><span class=\"sub-note\">" + d.label + "</span></td>" +
        "<td>" + usd(d.fill, 2) + "</td>" +
        "<td>" + (d.highKnown ? ddPct(d.drawdown) : "\u2014") + "</td>" +
        (d.highKnown
          ? '<td><span class="sig s' + d.tier.n + '">' + d.tier.label + "</span></td>"
          : "<td>\u2014</td>") +
        "<td>" + pct(d.tier.pct, 0) + "</td>" +
        "<td>" + usd(d.available) + "</td>" +
        "<td>" + usd(d.spent) + "</td>" +
        "<td>" + d.bought + "</td>" +
        "<td>" + d.shares + "</td>" +
        "<td>" + usd(d.avgCost, 2) + "</td>" +
        "<td>" + usd(d.reserve) + "</td>" +
        "<td>" + usd(d.portfolio) + "</td>" +
        "<td>" + usd(d.moneyIn) + "</td>" +
        '<td class="' + (d.ret >= 0 ? "pos" : "neg") + '">' + pct(d.ret) + "</td>" +
        "</tr>";
    }).join("");

    /* Both funds pooled. A month where QLD was on Deep dip and SSO on Dip
       counts once under each, because the ladder ran separately on each. */
    var all = [];
    runs.forEach(function (r) { all = all.concat(r.hist); });
    paintTally(all, "both funds");
  }

  /* ---------- tabs ---------- */
  var sleeves = (cfg.SLEEVES || []).map(function (s) { return cfg.sleeve(s.sym); })
                  .filter(function (s) { return s; });

  function draw(which) {
    hide("empty");
    if (which === "BOTH") renderBoth(sleeves);
    else {
      var one = sleeves.filter(function (s) { return s.sym === which; })[0];
      if (one) renderSleeve(one);
    }
    /* Each fund gets its own comparison, against the pair named in its sleeve:
       QLD against QQQ and TQQQ, SSO against VOO and UPRO. There is nothing
       sensible to compare on the combined tab, since the two schedules run on
       different indexes, so it is hidden there. */
    var bench = document.getElementById("bench");
    if (which === "BOTH") {
      if (window.TTF_BENCH && window.TTF_BENCH.cancel) window.TTF_BENCH.cancel();
      if (bench) bench.classList.add("hidden");
    } else if (window.TTF_BENCH && window.TTF_BENCH.render) {
      var b = sleeves.filter(function (s) { return s.sym === which; })[0];
      if (b) window.TTF_BENCH.render(b);
    }

    var tabs = document.querySelectorAll("#sleeve-tabs button");
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute("data-sym") === which;
      tabs[i].className = on ? "on" : "";
      tabs[i].setAttribute("aria-selected", on ? "true" : "false");
    }
  }

  var host = document.getElementById("sleeve-tabs");
  if (host) {
    host.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button") : null;
      if (b && b.getAttribute("data-sym")) draw(b.getAttribute("data-sym"));
    });
  }
  draw(sleeves.length ? sleeves[0].sym : "QLD");
})();
