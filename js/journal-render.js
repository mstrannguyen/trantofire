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

  var CUSDIS_APP_ID = host.getAttribute("data-cusdis-app-id") || "";

  var entries = (window.TTF_JOURNAL || []).slice().sort(function (a, b) {
    return String(a.month) < String(b.month) ? 1 : -1;      // newest first
  });

  if (!entries.length) { if (empty) empty.classList.remove("hidden"); return; }
  if (empty) empty.classList.add("hidden");

  var history = E.run(window.TTF_DATA || [], cfg);
  var byMonth = {};
  history.forEach(function (m) { byMonth[m.month] = m; });

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function shortMonth(ym) {
    var p = String(ym).split("-");
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, 1);
    if (isNaN(d.getTime())) return String(ym);
    return d.toLocaleDateString("en-AU", { month: "short", year: "numeric" }).toUpperCase();
  }

  function headline(m) {
    if (!m) return "";
    var sign = m.pl >= 0 ? "+" : "\u2212";
    return shortMonth(m.month) + " \u00b7 Portfolio " + usd(m.portfolio) +
           " (" + sign + usd(Math.abs(m.pl)) + ")";
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
    var m      = byMonth[e.month];
    var body   = e.body || [];
    var teaser = body.length ? body[0] : "";
    var rest   = body.slice(1);
    var id     = "e-" + String(e.month);

    var dev = m && m.deviated
      ? '<p class="entry-dev">The rules said ' + m.ruleBought + " share" +
        (m.ruleBought === 1 ? "" : "s") + ". I bought " + m.bought + ".</p>"
      : "";

    return '' +
      '<article class="card" id="' + esc(id) + '">' +
        '<div class="card-head">' +
          (m ? '<p class="card-figs">' + esc(headline(m)) + "</p>" : "") +
          "<h2>" + esc(e.title || shortMonth(e.month)) + "</h2>" +
          (e.mood ? '<p class="card-mood">' + esc(e.mood) + "</p>" : "") +
        "</div>" +
        '<div class="card-teaser"><p>' + esc(teaser) + "</p></div>" +
        '<div class="card-full" id="' + esc(id) + '-full" hidden>' +
          (m ? figures(m) : "") + dev +
          rest.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
          '<div class="card-comments" data-month="' + esc(e.month) +
            '" data-title="' + esc(e.title || shortMonth(e.month)) + '">' +
            "<h3>Comments</h3>" +
            '<div class="cusdis-slot"></div>' +
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

  var cusdisScriptLoaded = false;
  function mountComments(card) {
    var wrap = card.querySelector(".card-comments");
    var slot = card.querySelector(".cusdis-slot");
    if (!wrap || !slot || slot.getAttribute("data-mounted")) return;

    if (!CUSDIS_APP_ID || CUSDIS_APP_ID.indexOf("YOUR_") === 0) {
      slot.innerHTML = '<p class="note">Comments are not switched on yet. ' +
        "Add a Cusdis App ID to the journal page to enable them.</p>";
      slot.setAttribute("data-mounted", "1");
      return;
    }

    var month = wrap.getAttribute("data-month");
    var thread = document.createElement("div");
    thread.id = "cusdis_thread_" + month;
    thread.setAttribute("data-host", "https://cusdis.com");
    thread.setAttribute("data-app-id", CUSDIS_APP_ID);
    thread.setAttribute("data-page-id", month);
    thread.setAttribute("data-page-url", "https://trantofire.au/updates/#e-" + month);
    thread.setAttribute("data-page-title", wrap.getAttribute("data-title"));
    slot.appendChild(thread);
    slot.setAttribute("data-mounted", "1");

    if (!cusdisScriptLoaded) {
      var sc = document.createElement("script");
      sc.async = true; sc.defer = true;
      sc.src = "https://cusdis.com/js/cusdis.es.js";
      document.body.appendChild(sc);
      cusdisScriptLoaded = true;
    } else if (window.CUSDIS && window.CUSDIS.renderTo) {
      window.CUSDIS.renderTo(thread);
    }
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
