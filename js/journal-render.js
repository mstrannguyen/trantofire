/* Renders the journal as a list of monthly cards.
 *
 * Each card leads with the figures for that month, pulled from js/data.js
 * through the engine, so a headline can never disagree with the log. The
 * words come from js/journal.js. "Read more" expands in place, and each
 * entry gets its own comment thread, loaded only when it is opened so a
 * page of twenty entries does not fetch twenty comment widgets.
 */
(function () {
  "use strict";
  var E = window.TTF_ENGINE, cfg = window.TTF;
  var usd = E.usd, pct = E.pct, ddPct = E.ddPct;
  var host  = document.getElementById("entries");
  var empty = document.getElementById("empty");
  if (!host) return;

  var entries = (window.TTF_JOURNAL || []).slice().sort(function (a, b) {
    return String(a.month) < String(b.month) ? 1 : -1;      // newest first
  });

  if (!entries.length) { if (empty) empty.classList.remove("hidden"); return; }
  if (empty) empty.classList.add("hidden");

  /* One run per sleeve. A month that only one of them logged still shows the
     other's standing position in the headline, carried forward, so the
     portfolio figure on a card matches the Progress page rather than dropping
     a fund that happened to be logged a day late. */
  var runs = (cfg.SLEEVES || []).map(function (s) { return cfg.sleeve(s.sym); })
    .filter(function (sl) { return sl; })
    .map(function (sl) { return { sl: sl, hist: E.run(sl.rows || [], sl) }; })
    .filter(function (r) { return r.hist.length; });

  var known = {};
  runs.forEach(function (r) { r.hist.forEach(function (d) { known[d.month] = 1; }); });

  /* Every sleeve's latest row at or before this month, flagged with whether it
     was logged in this month or carried in from an earlier one. */
  function rowsAt(month) {
    return runs.map(function (r) {
      var found = null;
      r.hist.forEach(function (d) { if (d.month <= month) found = d; });
      return found ? { sym: r.sl.sym, d: found, own: found.month === month } : null;
    }).filter(function (x) { return x; });
  }

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function shortMonth(ym) {
    var p = String(ym).split("-");
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, 1);
    if (isNaN(d.getTime())) return String(ym);
    return d.toLocaleDateString("en-AU", { month: "short", year: "numeric" }).toUpperCase();
  }

  /* --- the parts you can put in a journal entry ------------------------- */

  function toParas(v) {
    if (!v) return [];
    return Object.prototype.toString.call(v) === "[object Array]" ? v : [v];
  }
  function paras(v) {
    return toParas(v).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  }
  function cap(t)  { return t ? '<p class="entry-cap">' + esc(t) + "</p>" : ""; }
  function note(t) { return t ? '<p class="entry-note">' + esc(t) + "</p>" : ""; }

  function barValue(v, c) {
    var d    = (c && typeof c.decimals === "number") ? c.decimals : 2;
    var sign = v < 0 ? "\u2212" : ((c && c.plus && v > 0) ? "+" : "");
    return sign + ((c && c.prefix) || "") +
           Math.abs(v).toFixed(d) + ((c && c.suffix) || "");
  }

  function tableHTML(t) {
    if (!t || !t.rows || !t.rows.length) return "";
    var head = (t.head || []).map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("");
    var body = t.rows.map(function (r) {
      return "<tr>" + toParas(r).map(function (cell, i) {
        return "<td" + (i === 0 ? ' class="k"' : "") + ">" + esc(cell) + "</td>";
      }).join("") + "</tr>";
    }).join("");
    return '<div class="entry-table">' + cap(t.caption) +
      '<div class="entry-table-scroll"><table>' +
      (head ? "<thead><tr>" + head + "</tr></thead>" : "") +
      "<tbody>" + body + "</tbody></table></div>" + note(t.note) + "</div>";
  }

  function chartHTML(c) {
    if (!c) return "";
    var bars = (c.bars || []).filter(function (b) {
      return b && isFinite(Number(b.value));
    }).map(function (b) {
      return { label: b.label, value: Number(b.value) };
    });
    if (!bars.length) return "";

    var max = 0, hasNeg = false;
    bars.forEach(function (b) {
      if (Math.abs(b.value) > max) max = Math.abs(b.value);
      if (b.value < 0) hasNeg = true;
    });
    if (!max) max = 1;
    var zero = hasNeg ? 50 : 0, span = hasNeg ? 50 : 100;

    var rows = bars.map(function (b) {
      var w    = Math.abs(b.value) / max * span;
      var left = b.value >= 0 ? zero : zero - w;
      return '<div class="bar-row">' +
        '<span class="bar-label">' + esc(b.label) + "</span>" +
        '<span class="bar-track"><span class="bar' + (b.value < 0 ? " neg" : "") +
          '" style="left:' + left.toFixed(2) + "%;width:" + w.toFixed(2) + '%"></span></span>' +
        '<span class="bar-val">' + esc(barValue(b.value, c)) + "</span>" +
      "</div>";
    }).join("");

    return '<div class="entry-chart">' + cap(c.title) +
      '<div class="bars' + (hasNeg ? " has-zero" : "") + '">' + rows + "</div>" +
      note(c.note) + "</div>";
  }

  function macroHTML(mx) {
    if (!mx) return "";
    var inner = paras(mx.body) + tableHTML(mx.table) + chartHTML(mx.chart) + note(mx.note);
    if (!inner) return "";
    return '<section class="entry-macro">' +
      "<h3>" + esc(mx.heading || "Markets and macro") + "</h3>" + inner + "</section>";
  }

  function headline(month) {
    var at = rowsAt(month);
    if (!at.length) return "";
    var portfolio = 0, pl = 0;
    at.forEach(function (x) { portfolio += x.d.portfolio; pl += x.d.pl; });
    var sign = pl >= 0 ? "+" : "\u2212";
    return shortMonth(month) + " \u00b7 Portfolio " + usd(portfolio) +
           " (" + sign + usd(Math.abs(pl)) + ")";
  }

  /* A block per fund. Price paid, tier and share count belong to one ticker, so
     they are never added together. Only sleeves actually bought in this month
     get a block. */
  function figures(month) {
    return rowsAt(month).filter(function (x) { return x.own; }).map(function (x) {
      var m = x.d;
      var cells = [
        ["Price paid",  usd(m.fill, 2)],
        ["From high",   ddPct(m.drawdown)],
        ["Tier",        m.tier.label + " \u00b7 " + pct(m.deployPct, 0)],
        ["Bought",      m.bought + " share" + (m.bought === 1 ? "" : "s")],
        ["Spent",       usd(m.spent)],
        ["Reserve",     usd(m.reserve)]
      ];
      return '<p class="entry-figs-sym">' + esc(x.sym) + "</p>" +
        '<dl class="entry-figs">' + cells.map(function (c) {
          return "<div><dt>" + c[0] + "</dt><dd>" + c[1] + "</dd></div>";
        }).join("") + "</dl>";
    }).join("");
  }

  host.innerHTML = entries.map(function (e) {
    var has    = known[e.month];
    var body   = toParas(e.body);
    var teaser = body.length ? body[0] : "";
    var rest   = body.slice(1);
    var id     = "e-" + String(e.month);

    var dev = rowsAt(e.month).filter(function (x) { return x.own && x.d.deviated; })
      .map(function (x) {
        return '<p class="entry-dev">The rules said ' + x.d.ruleBought + " " + x.sym +
          " share" + (x.d.ruleBought === 1 ? "" : "s") + ". I bought " + x.d.bought + ".</p>";
      }).join("");

    return '' +
      '<article class="card" id="' + esc(id) + '">' +
        '<div class="card-head">' +
          (has ? '<p class="card-figs">' + esc(headline(e.month)) + "</p>" : "") +
          "<h2>" + esc(e.title || shortMonth(e.month)) + "</h2>" +
          (e.mood ? '<p class="card-mood">' + esc(e.mood) + "</p>" : "") +
        "</div>" +
        '<div class="card-teaser"><p>' + esc(teaser) + "</p></div>" +
        '<div class="card-full" id="' + esc(id) + '-full" hidden>' +
          (has ? figures(e.month) : "") + dev +
          rest.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
          macroHTML(e.macro) +
          '<div class="card-comments" data-month="' + esc(e.month) +
            '" data-title="' + esc(e.title || shortMonth(e.month)) + '">' +
            "<h3>Comments</h3>" +
            '<div class="fc-slot"></div>' +
          "</div>" +
        "</div>" +
        '<button class="card-more" type="button" aria-expanded="false" aria-controls="' + esc(id) + '-full">' +
          "<span>read more</span>" +
        "</button>" +
      "</article>";
  }).join("");

  host.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest(".card-more") : null;
    if (!btn) return;

    var card = btn.closest("article");
    var full = card.querySelector(".card-full");
    var opening = full.hasAttribute("hidden");

    if (opening) {
      full.removeAttribute("hidden");
      card.classList.add("open");
      btn.querySelector("span").textContent = "show less";
      btn.setAttribute("aria-expanded", "true");
      mountComments(card);
    } else {
      full.setAttribute("hidden", "");
      card.classList.remove("open");
      btn.querySelector("span").textContent = "read more";
      btn.setAttribute("aria-expanded", "false");
    }
  });

  /* Each entry gets its own thread, filed under journal-YYYY-MM. The widget
     is only fetched when the entry is opened. See js/comments.js. */
  function mountComments(card) {
    var wrap = card.querySelector(".card-comments");
    var slot = card.querySelector(".fc-slot");
    if (!wrap || !slot) return;

    if (!window.TTFComments) {
      slot.innerHTML = '<p class="fc-note">Comments could not load.</p>';
      return;
    }

    var month = wrap.getAttribute("data-month");
    window.TTFComments.mount(slot, {
      urlId:     "journal-" + month,
      url:       "https://trantofire.au/updates/#e-" + month,
      pageTitle: wrap.getAttribute("data-title")
    });
  }

  if (location.hash && location.hash.indexOf("#e-") === 0) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) {
      var b = target.querySelector(".card-more");
      if (b) b.click();
      target.scrollIntoView({ block: "start" });
    }
  }
})();
