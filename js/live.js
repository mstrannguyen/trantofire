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

  /* ---------------------------------------------------------------------
     Monthly closing history for a fund, used by the benchmark comparison.

     Same proxy trick as above, one route per symbol.

     The plain close is preferred over the adjusted close. Yahoo's close is
     already corrected for splits, which is what a comparison spanning years
     needs, but it is NOT corrected for distributions. That is deliberate: it
     is the price you would actually have paid that month, and it can be
     checked against any price history. It also means distributions are
     ignored for all three funds, the same way the rest of this site ignores
     them. QQQ pays out the most of the three, so QQQ is the one that
     understates by the most.
     --------------------------------------------------------------------- */

  var ROUTES = { TQQQ: PROXY, QQQ: "/api/price-qqq", QLD: "/api/price-qld",
                 UPRO: "/api/price-upro", SSO: "/api/price-sso" };
  var seriesCache = {};

  function monthKey(unixSeconds) {
    var d = new Date(unixSeconds * 1000);
    return d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2);
  }

  function parseSeries(data) {
    var result = data && data.chart && data.chart.result && data.chart.result[0];
    if (!result) throw new Error("unexpected shape");

    var stamps = result.timestamp || [];
    var adj    = result.indicators && result.indicators.adjclose && result.indicators.adjclose[0];
    var adjArr = (adj && adj.adjclose) || [];
    var quote  = result.indicators && result.indicators.quote && result.indicators.quote[0];
    var rawArr = (quote && quote.close) || [];

    var months = {}, total = {}, last = null, totalLast = null, count = 0, newest = "", oldest = "";
    for (var i = 0; i < stamps.length; i++) {
      var v = rawArr[i];
      if (typeof v !== "number" || !isFinite(v) || v <= 0) v = adjArr[i];
      if (typeof v !== "number" || !isFinite(v) || v <= 0) continue;
      var key = monthKey(stamps[i]);
      months[key] = v;
      if (key > newest) newest = key;
      if (!oldest || key < oldest) oldest = key;
      last = v;

      // adjusted close as well: dividends reinvested, for total-return figures
      var t = adjArr[i];
      if (typeof t !== "number" || !isFinite(t) || t <= 0) t = v;
      total[key] = t;
      totalLast = t;
      count++;
    }
    if (!count) throw new Error("no usable history");

    var meta = result.meta || {};
    return {
      months:    months,
      total:     total,
      newest:    newest,
      oldest:    oldest,
      last:      last,
      totalLast: totalLast,
      asOf:   meta.regularMarketTime
                ? new Date(meta.regularMarketTime * 1000).toISOString()
                : new Date().toISOString()
    };
  }

  /* Resolves to null on any failure. The caller must cope with that: the
     benchmark is an extra, never a dependency. */
  function series(symbol) {
    var route = ROUTES[symbol];
    if (!route) return Promise.resolve(null);
    if (seriesCache[symbol]) return seriesCache[symbol];

    seriesCache[symbol] = withTimeout(route)
      .then(parseSeries)
      .then(function (r) { r.symbol = symbol; return r; })
      .catch(function (e) {
        if (window.console) {
          console.info("[Tran to Fire] history unavailable for " + symbol + ":", e.message);
        }
        seriesCache[symbol] = null;
        return null;
      });

    return seriesCache[symbol];
  }

  /* ---------------------------------------------------------------------
     Daily closes, for pricing a buy on the day it happened.

     A monthly bar only exists once the month has ended, so a fresh buy has
     nothing to price against. Daily closes are there the next morning.
     --------------------------------------------------------------------- */

  var DAILY = { TQQQ: "/api/daily-tqqq", QQQ: "/api/daily-qqq", QLD: "/api/daily-qld" };
  var dailyCache = {};

  function dayKey(unixSeconds) {
    var d = new Date(unixSeconds * 1000);
    return d.getUTCFullYear() + "-" +
           ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" +
           ("0" + d.getUTCDate()).slice(-2);
  }

  function parseDaily(data) {
    var result = data && data.chart && data.chart.result && data.chart.result[0];
    if (!result) throw new Error("unexpected shape");

    var stamps = result.timestamp || [];
    var quote  = result.indicators && result.indicators.quote && result.indicators.quote[0];
    var closes = (quote && quote.close) || [];

    var days = {}, dates = [], n = 0;
    for (var i = 0; i < stamps.length; i++) {
      var v = closes[i];
      if (typeof v !== "number" || !isFinite(v) || v <= 0) continue;
      var k = dayKey(stamps[i]);
      days[k] = v;
      dates.push(k);
      n++;
    }
    if (!n) throw new Error("no usable daily history");
    dates.sort();
    return { days: days, dates: dates };
  }

  /* Resolves to null on any failure. Callers fall back to monthly closes. */
  function daily(symbol) {
    var route = DAILY[symbol];
    if (!route) return Promise.resolve(null);
    if (dailyCache[symbol]) return dailyCache[symbol];

    dailyCache[symbol] = withTimeout(route)
      .then(parseDaily)
      .then(function (r) { r.symbol = symbol; return r; })
      .catch(function (e) {
        if (window.console) {
          console.info("[Tran to Fire] daily history unavailable for " + symbol + ":", e.message);
        }
        dailyCache[symbol] = null;
        return null;
      });

    return dailyCache[symbol];
  }

  window.TTF_LIVE = { get: get, series: series, daily: daily, asOfLabel: asOfLabel };
})();
