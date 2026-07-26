/* Fetches the current TQQQ price and hands it to whoever asked.
 *
 * Design rule: the page must be complete and correct BEFORE this runs.
 * This only ever upgrades a stale valuation to a live one. If the request
 * fails, times out, or returns nonsense, nothing changes and nothing breaks.
 */
(function () {
  "use strict";

  var ENDPOINT = "/.netlify/functions/price";
  var TIMEOUT_MS = 6000;
  var cached = null;      // resolved result, so two pages of scripts share one call
  var pending = null;

  function fetchPrice() {
    if (cached) return Promise.resolve(cached);
    if (pending) return pending;

    // AbortController so a hanging request can't leave the page waiting
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);

    pending = fetch(ENDPOINT, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || typeof data.price !== "number" || !isFinite(data.price) || data.price <= 0) {
          throw new Error(data && data.error ? data.error : "no price");
        }
        cached = {
          price:   data.price,
          // a flagged ATH is dropped rather than used: better to fall back to the
          // known-good figure in config than to mis-tier every month from a bad one
          ath:     (!data.suspect && typeof data.ath === "number" && isFinite(data.ath) && data.ath > 0) ? data.ath : null,
          athWarnings: data.warnings || [],
          athDate: data.athDate || null,
          asOf:    data.asOf,
          source:  data.source || "Yahoo Finance"
        };
        if (cached.athWarnings && cached.athWarnings.length && window.console) {
          console.warn("[Tran to Fire] all-time-high checks:", cached.athWarnings.join("; "));
        }
        return cached;
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (window.console) console.info("[Tran to Fire] live price unavailable:", err.message);
        return null;                       // resolve with null, never reject
      });

    return pending;
  }

  /* Formats "as of" into something a human reads, in Sydney time. */
  function asOfLabel(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    try {
      return d.toLocaleString("en-AU", {
        day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
        timeZone: "Australia/Sydney"
      });
    } catch (e) {
      return d.toLocaleString("en-AU");
    }
  }

  window.TTF_LIVE = { get: fetchPrice, asOfLabel: asOfLabel };
})();
