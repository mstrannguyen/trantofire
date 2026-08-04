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
       fraction of it, so all four step together. */
    function step(values) {
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

  function drawValueChart(host, rows) {
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
      t2.textContent = (cost[i] > 0 ? pct(pl[i] / cost[i]) : "\u2014") + " on money in TQQQ";
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

  function renderSleeve(sleeve) {
    document.getElementById("data").setAttribute("data-sym", sleeve.sym);
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
        ", spending <b>" + usd(last.spent) + "</b> \u2014 " + pct(last.deployPct, 0) + " of the " + usd(last.available) +
        " available, because " + sleeve.sym + " was " + ddPct(last.drawdown) + " below its high. " +
        usd(last.reserve) + " carried into next month." + deviationNote
      : "No shares bought this month. " + usd(last.available) + " was available and the rules deployed " +
        pct(last.deployPct, 0) + ", which wasn't enough for a whole share at " + usd(last.fill, 2) + ". It all carried forward." + deviationNote;

    $("asof").textContent = last.label;
    var pill = $("tier");
    pill.textContent = last.tier.label + " \u00b7 deploy " + pct(last.deployPct, 0);
    pill.className = "tierpill t" + last.tier.n;

    $("s-value").firstChild.nodeValue = usd(last.portfolio);
    $("s-in").firstChild.nodeValue    = usd(last.moneyIn);
    var plEl = $("s-pl");
    plEl.firstChild.nodeValue = (last.pl < 0 ? "\u2212" : "") + usd(Math.abs(last.pl));
    plEl.className = last.pl >= 0 ? "pos" : "neg";
    $("s-pl-sub").textContent = pct(last.ret) + " on money in";
    $("s-dd").firstChild.nodeValue    = ddPct(last.drawdown);
    $("s-dd-sub").textContent         = "high-water mark " + usd(last.high, 2);
    $("s-sh").firstChild.nodeValue    = last.shares.toLocaleString("en-US");
    $("s-avg").firstChild.nodeValue   = usd(last.avgCost, 2);
    $("s-cash").firstChild.nodeValue  = usd(last.reserve);
    $("s-alloc").firstChild.nodeValue = Math.round(last.pctEtf * 100) + "% / " + Math.round(last.pctCash * 100) + "%";

    var months = history.map(function (d) { return d.label; });
    drawPriceChart($("chart0"), history);
    drawValueChart($("chart1"), history);
    drawDrawdownChart($("chart2"), months, history.map(function (d) { return -Math.abs(d.drawdown); }));

    var html = "";
    for (var k = history.length - 1; k >= 0; k--) {
      var d = history[k];
      html += "<tr>" +
        '<td class="mth">' + d.label + (d.note ? '<br><span style="font-family:var(--body);font-size:12.5px;color:var(--muted)">' + d.note + "</span>" : "") + "</td>" +
        "<td>" + usd(d.price, 2) + "</td>" +
        "<td>" + ddPct(d.drawdown) + "</td>" +
        '<td><span class="sig s' + d.tier.n + '">' + d.tier.label + "</span></td>" +
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
    var iEl = document.getElementById("p-interest");
    if (iEl) {
      var bits = [];
      if (last.brokerageTotal > 0)
        bits.push(usd(last.brokerageTotal, 2) + " paid in brokerage");
      if (last.mgmtTotal > 0)
        bits.push("about " + usd(last.mgmtTotal, 2) + " borne in fund fees, already inside the price");
      if (last.interestTotal > 0)
        bits.push(usd(last.interestTotal, 2) + " earned as interest on the reserve");
      if (bits.length) iEl.innerHTML = "So far: " + bits.join(" \u00b7 ") + ".";
    }

    $("rows").innerHTML = html;
    show("data");

    // ---- upgrade the valuation to a live market price if available ----
    if (window.TTF_LIVE) {
      var token = ++renderToken;
      window.TTF_LIVE.quoteFor(sleeve.sym).then(function (live) {
        if (!live || token !== renderToken) return;   // a later tab click wins

        // Yahoo's all-time high replaces the hardcoded reference where it is higher
        var hist = history;
        if (live.ath && live.ath > (sleeve.HIGH_WATER_MARK || 0)) {
          var lifted = {};
          for (var ck in sleeve) lifted[ck] = sleeve[ck];
          lifted.HIGH_WATER_MARK = live.ath;
          hist = E.run(sleeve.rows || [], lifted);
        }

        var r = E.revalue(hist, live.price);
        if (!r) return;

        // the chart's last point should agree with the cards above it
        // the last point moves to the live price, so the chart agrees with the cards
        var live = hist.slice();
        var lastRow = {};
        for (var k in live[live.length - 1]) lastRow[k] = live[live.length - 1][k];
        lastRow.etfValue = r.etfValue;
        live[live.length - 1] = lastRow;
        drawValueChart($("chart1"), live);
        drawPriceChart($("chart0"), live);

        // only the "what is it worth now" figures move; the log stays as bought
        $("s-value").firstChild.nodeValue = usd(r.portfolio);
        var plEl = $("s-pl");
        plEl.firstChild.nodeValue = (r.pl < 0 ? "\u2212" : "") + usd(Math.abs(r.pl));
        plEl.className = r.pl >= 0 ? "pos" : "neg";
        $("s-pl-sub").textContent = pct(r.ret) + " on money in";
        $("s-dd").firstChild.nodeValue = ddPct(r.drawdown);
        $("s-dd-sub").textContent = "high-water mark " + usd(r.high, 2);
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

    drawValueChart($("chart1"), merged);
    ["chart0", "chart2"].forEach(function (id) {
      var c = $(id); if (c) c.innerHTML = "";
    });
  }

  function stampBoth(runs, isLive) {
    var stamp = document.getElementById("p-live");
    if (!stamp) return;
    if (!isLive) {
      stamp.textContent = "Both sleeves at their last logged prices.";
      return;
    }
    var asOf = null;
    runs.forEach(function (r) { if (!asOf && r.asOf) asOf = r.asOf; });
    stamp.textContent = "Both sleeves at live prices" +
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
    sleeveRows(runs);
    stampBoth(runs, false);
    hide("loading"); show("data");

    if (!window.TTF_LIVE || !window.TTF_LIVE.quoteFor) return;
    var token = ++renderToken;

    Promise.all(runs.map(function (r) {
      return window.TTF_LIVE.quoteFor(r.sl.sym).then(function (q) {
        if (!q) return r;
        // the record high comes from Yahoo, so the tier column needs it too
        if (q.ath && q.ath > (r.sl.HIGH_WATER_MARK || 0)) {
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
        "<td>" + ddPct(d.drawdown) + "</td>" +
        '<td><span class="sig s' + d.tier.n + '">' + d.tier.label + "</span></td>" +
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
    // The benchmark still prices the TQQQ schedule against QQQ and QLD, so it
    // is meaningless under any other tab. Hidden rather than left showing the
    // wrong fund's comparison.
    var bench = document.getElementById("bench");
    if (bench) bench.classList[which === "TQQQ" ? "remove" : "add"]("hidden");

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
  draw(sleeves.length ? sleeves[0].sym : "TQQQ");
})();
