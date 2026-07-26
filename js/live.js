/* Live TQQQ price and all-time high.
 *
 * Two routes, tried in order:
 *   1. /api/price          — a Netlify proxy rule. No build step, no function,
 *                            works on a plain drag-and-drop deploy. Returns
 *                            Yahoo's raw JSON, which we parse here.
 *   2. /.netlify/functions/price — the serverless version, if it exists.
 *
 * Both are same-origin, so the site's connect-src 'self' policy is untouched.
 *
 * Design rule: the page must already be correct BEFORE this runs. This only
 * ever upgrades a stale valuation to a live one. Any failure changes nothing.
 */
(function () {
  "use strict";

  var PROXY    = "/api/price";
  var FUNCTION = "/.netlify/functions/price";
  var TIMEOUT_MS = 7000;
  var cached = null, pending = null;

  function withTimeout(url) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function (e) { clearTimeout(timer); throw e; });
  }

  /* Turn Yahoo's chart payload into { price, ath, athDate }.
     Yahoo has no all-time-high field, so we take the highest value in the
     full monthly history. Yahoo's history is split-adjusted, which matters:
     TQQQ split 2:1 in Jan 2022 and a raw series would put the record at
     roughly twice where it belongs. */
  function parseYahoo(data) {
    var result = data && data.chart && data.chart.result && data.chart.result[0];
    if (!result || !result.meta) throw new Error("unexpected shape");

    var meta  = result.meta;
    var price = meta.regularMarketPrice;
    if (typeof price !== "number" || !isFinite(price) || price <= 0) {
      throw new Error("no usable price");
    }

    var ath = null, athDate = null;
    var stamps = result.timestamp || [];
    var quote  = result.indicators && result.indicators.quote && result.indicators.quote[0];
    var highs  = (quote && quote.high) || [];
    for (var i = 0; i < highs.length; i++) {
      var h = highs[i];
      if (typeof h === "number" && isFinite(h) && (ath === null || h > ath)) {
        ath = h;
        athDate = stamps[i] ? new Date(stamps[i] * 1000).toISOString() : null;
      }
    }
    if (ath === null || price > ath) { ath = price; athDate = new Date().toISOString(); }

    // sanity: an all-time high cannot sit below the 52-week high or today's price
    var week52 = meta.fiftyTwoWeekHigh;
    if (typeof week52 === "number" && isFinite(week52) && ath < week52 - 0.01) {
      ath = week52; athDate = null;
    }
    if (ath < price) { ath = price; athDate = new Date().toISOString(); }

    // detect an unadjusted series: highs far above the adjusted closes
    var maxAdj = null;
    var adj = result.indicators && result.indicators.adjclose && result.indicators.adjclose[0];
    var closes = (adj && adj.adjclose) || [];
    for (var j = 0; j < closes.length; j++) {
      var c = closes[j];
      if (typeof c === "number" && isFinite(c) && (maxAdj === null || c > maxAdj)) maxAdj = c;
    }
    var suspect = maxAdj !== null && ath > maxAdj * 1.5;

    return {
      price:   Math.round(price * 100) / 100,
      ath:     suspect ? null : Math.round(ath * 100) / 100,
      athDate: suspect ? null : athDate,
      asOf:    meta.regularMarketTime
                 ? new Date(meta.regularMarketTime * 1000).toISOString()
                 : new Date().toISOString(),
      source:  "Yahoo Finance",
      suspect: suspect
    };
  }

  function get() {
    if (cached) return Promise.resolve(cached);
    if (pending) return pending;

    pending = withTimeout(PROXY)
      .then(parseYahoo)
      .catch(function (e1) {
        if (window.console) console.info("[Tran to Fire] proxy route failed:", e1.message);
        // fall back to the serverless function, which returns a ready-made shape
        return withTimeout(FUNCTION).then(function (d) {
          if (!d || typeof d.price !== "number") throw new Error(d && d.error ? d.error : "no price");
          return {
            price: d.price,
            ath: (!d.suspect && typeof d.ath === "number") ? d.ath : null,
            athDate: d.athDate || null,
            asOf: d.asOf,
            source: d.source || "Yahoo Finance",
            suspect: !!d.suspect
          };
        });
      })
      .then(function (r) {
        if (r.suspect && window.console) {
          console.warn("[Tran to Fire] all-time high looked unadjusted; ignoring it");
        }
        cached = r;
        return r;
      })
      .catch(function (e) {
        if (window.console) {
          console.info("[Tran to Fire] live price unavailable:", e.message,
            "\u2014 the site is using the last logged price instead.");
        }
        return null;
      });

    return pending;
  }

  function asOfLabel(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    try {
      return d.toLocaleString("en-AU", {
        day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
        timeZone: "Australia/Sydney"
      });
    } catch (e) { return d.toLocaleString("en-AU"); }
  }

  window.TTF_LIVE = { get: get, asOfLabel: asOfLabel };
})();
