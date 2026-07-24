/* Renders the monthly journal. Words come from js/journal.js, numbers come
   from js/data.js through the engine, so the two can never disagree. */
(function () {
  "use strict";
  var E = window.TTF_ENGINE, cfg = window.TTF, usd = E.usd, pct = E.pct, ddPct = E.ddPct;
  var host  = document.getElementById("entries");
  var empty = document.getElementById("empty");
  if (!host) return;

  var entries = (window.TTF_JOURNAL || []).slice().sort(function (a, b) {
    return String(a.month) < String(b.month) ? 1 : -1;      // newest first
  });

  if (!entries.length) { if (empty) empty.classList.remove("hidden"); return; }
  if (empty) empty.classList.add("hidden");

  // index the calculated months so an entry can find its own figures
  var byMonth = {};
  E.run(window.TTF_DATA || [], cfg).forEach(function (m) { byMonth[m.month] = m; });

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function figures(m) {
    if (!m) return "";
    var cells = [
      ["Price paid",  usd(m.fill, 2)],
      ["From high",   ddPct(m.drawdown)],
      ["Tier",        m.tier.label + " \u00b7 " + pct(m.deployPct, 0)],
      ["Bought",      m.bought + " share" + (m.bought === 1 ? "" : "s")],
      ["Spent",       usd(m.spent)],
      ["Reserve",     usd(m.reserve)]
    ];
    return '<dl class="entry-figs">' + cells.map(function (c) {
      return "<div><dt>" + c[0] + "</dt><dd>" + c[1] + "</dd></div>";
    }).join("") + "</dl>";
  }

  host.innerHTML = entries.map(function (e) {
    var m = byMonth[e.month];
    var label = E.monthLabel(e.month);
    var body = (e.body || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    var dev = m && m.deviated
      ? '<p class="entry-dev">The rules said ' + m.ruleBought + " share" + (m.ruleBought === 1 ? "" : "s") +
        ". I bought " + m.bought + ".</p>"
      : "";
    return '<article class="entry" id="' + esc(e.month) + '">' +
        '<div class="entry-head">' +
          '<span class="entry-when">' + label + "</span>" +
          "<h2>" + esc(e.title || label) + "</h2>" +
          (e.mood ? '<p class="entry-mood">' + esc(e.mood) + "</p>" : "") +
        "</div>" +
        figures(m) + dev +
        '<div class="entry-body">' + body + "</div>" +
        '<a class="entry-link" href="#' + esc(e.month) + '">Link to this entry</a>' +
      "</article>";
  }).join("");
})();
