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
  function xLabels(s, months, x, H, n) {
    [0, Math.floor((n - 1) / 2), n - 1]
      .filter(function (v, i, a) { return a.indexOf(v) === i && v >= 0; })
      .forEach(function (i) {
        var t = el("text", {
          x: x(i), y: H - 16,
          "text-anchor": i === 0 ? "start" : (i === n - 1 ? "end" : "middle"),
          "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E"
        });
        t.textContent = months[i];
        s.appendChild(t);
      });
  }

  function drawValueChart(host, months, values, contribs) {
    var W = 880, H = 340, L = 68, R = 18, T = 18, B = 44, n = months.length;
    var max = Math.max.apply(null, values.concat(contribs).concat([1])) * 1.08;
    var x = function (i) { return n < 2 ? (L + W - R) / 2 : L + (W - L - R) * (i / (n - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - v / max); };
    var s = svgRoot(W, H);
    for (var g = 0; g <= 4; g++) {
      var gv = max * g / 4, gy = y(gv);
      s.appendChild(el("line", { x1: L, y1: gy, x2: W - R, y2: gy, stroke: "#3A2B31", "stroke-opacity": g === 0 ? ".22" : ".08" }));
      var t = el("text", { x: L - 12, y: gy + 4, "text-anchor": "end", "font-family": "EB Garamond,Georgia,serif", "font-size": "11.5", fill: "#8A7A7E" });
      t.textContent = gv >= 1000 ? "$" + Math.round(gv / 1000) + "k" : "$" + Math.round(gv);
      s.appendChild(t);
    }
    var vp = values.map(function (v, i) { return [x(i), y(v)]; });
    var cp = contribs.map(function (v, i) { return [x(i), y(v)]; });
    if (n > 1) {
      s.appendChild(el("path", { d: pathFrom(vp) + " L" + x(n - 1) + "," + y(0) + " L" + x(0) + "," + y(0) + " Z", fill: "#B0894F", "fill-opacity": ".13" }));
      s.appendChild(el("path", { d: pathFrom(cp), fill: "none", stroke: "#8D9C86", "stroke-width": "2", "stroke-dasharray": "5 4", "stroke-linecap": "round" }));
      s.appendChild(el("path", { d: pathFrom(vp), fill: "none", stroke: "#B0894F", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    } else {
      s.appendChild(el("circle", { cx: x(0), cy: y(values[0]), r: "6", fill: "#B0894F" }));
      s.appendChild(el("circle", { cx: x(0), cy: y(contribs[0]), r: "5", fill: "#8D9C86" }));
    }
    xLabels(s, months, x, H, n);
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

  /* ---------- render ---------- */
  var history = E.run(window.TTF_DATA || [], cfg);
  hide("loading");

  if (!history.length) { show("empty"); return; }

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
      " available, because TQQQ was " + ddPct(last.drawdown) + " below its high. " +
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
  drawValueChart($("chart1"), months, history.map(function (d) { return d.portfolio; }), history.map(function (d) { return d.moneyIn; }));
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
    window.TTF_LIVE.get().then(function (live) {
      if (!live) return;

      // Yahoo's all-time high replaces the hardcoded reference where it is higher
      var hist = history;
      if (live.ath && live.ath > cfg.HIGH_WATER_MARK) {
        hist = E.run(window.TTF_DATA || [], {
          HIGH_WATER_MARK: live.ath,
          CONTRIBUTION:    cfg.CONTRIBUTION,
          CASH_RATE:       cfg.CASH_RATE
        });
      }

      var r = E.revalue(hist, live.price);
      if (!r) return;

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
        stamp.textContent = "Valued at the live TQQQ price of " + usd(r.price, 2) +
          " from " + live.source +
          (live.asOf ? ", " + window.TTF_LIVE.asOfLabel(live.asOf) + " Sydney time" : "") +
          ". The table below shows the prices actually paid.";
      }
    });
  }
})();
