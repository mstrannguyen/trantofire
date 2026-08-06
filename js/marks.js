/* Record highs printed in the page text, filled from Yahoo Finance.
 *
 * Any element carrying data-hwm="QLD" (or SSO) has its text replaced with that
 * fund's record high once the live figure arrives. The number already in the
 * markup is the fallback: it shows immediately, it shows if Yahoo cannot be
 * reached, and it shows with JavaScript off.
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

  Object.keys(wanted).forEach(function (sym) {
    window.TTF_LIVE.quoteFor(sym).then(function (live) {
      if (!live || !(live.ath > 0)) return;          // leave the fallback showing
      var text = "$" + live.ath.toFixed(2);
      var list = document.querySelectorAll('[data-hwm="' + sym + '"]');
      for (var j = 0; j < list.length; j++) list[j].textContent = text;
    }).catch(function () { /* fallback stays */ });
  });
})();
