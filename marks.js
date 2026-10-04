/* Record highs printed in the page text, filled from Yahoo Finance.
 *
 * Any element carrying data-hwm="QLD" (or SSO) has its text replaced with that
 * fund's record high once the live figure arrives. No number is stored in the
 * markup: what sits there is a placeholder, so a dead feed or JavaScript off
 * leaves a sentence that reads without one rather than a figure that has gone
 * stale in the file.
 *
 * The high comes from live.js, derived from the full split-adjusted monthly
 * history rather than any published all-time-high field, because several data
 * sites publish figures for these funds that ignore the November 2025 splits.
 */
(function () {
  "use strict";
  if (!window.TTF_LIVE || !window.TTF_LIVE.quoteFor) return;

  var nodes = document.querySelectorAll("[data-hwm]");
  if (!nodes.length) return;

  var wanted = {};
  for (var i = 0; i < nodes.length; i++) wanted[nodes[i].getAttribute("data-hwm")] = 1;

  function paint(sym, ath) {
    var text = "$" + ath.toFixed(2);
    var list = document.querySelectorAll('[data-hwm="' + sym + '"]');
    for (var j = 0; j < list.length; j++) list[j].textContent = text;
  }

  Object.keys(wanted).forEach(function (sym) {
    // the last figure Yahoo gave, so the sentence reads before the network does
    var kept = window.TTF_LIVE.storedHigh && window.TTF_LIVE.storedHigh(sym);
    if (kept) paint(sym, kept.ath);

    window.TTF_LIVE.quoteFor(sym).then(function (live) {
      if (!live || !(live.ath > 0)) return;   // the remembered figure stays
      paint(sym, live.ath);
    }).catch(function () { /* the remembered figure stays */ });
  });
})();
