/* Current TQQQ price AND its all-time high, both from Yahoo Finance.
 *
 * This runs on Netlify's servers, not in the visitor's browser. Yahoo does
 * not send CORS headers, so a browser cannot call it directly. Because this
 * function lives on trantofire.au, the browser request to it is same-origin,
 * which keeps the site's Content-Security-Policy untouched.
 *
 * Yahoo has no "all-time high" field, so we pull the entire monthly history
 * and take the highest value in it. TQQQ listed in Feb 2010, so range=max is
 * the whole life of the fund. Yahoo's history is split-adjusted, which
 * matters: TQQQ split 2:1 in Jan 2022, and an unadjusted figure would put
 * the record roughly twice where it belongs.
 *
 * Returns: { price, ath, athDate, currency, asOf, source } or { error }
 */

const SYMBOL = "TQQQ";
const URL =
  "https://query1.finance.yahoo.com/v8/finance/chart/" +
  SYMBOL +
  "?interval=1mo&range=max";

exports.handler = async function () {
  try {
    const res = await fetch(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/json"
      }
    });

    if (!res.ok) return json(502, { error: "Yahoo returned HTTP " + res.status });

    const data = await res.json();
    const result =
      data && data.chart && data.chart.result && data.chart.result[0];
    if (!result || !result.meta) return json(502, { error: "Unexpected response shape" });

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    if (typeof price !== "number" || !isFinite(price) || price <= 0) {
      return json(502, { error: "No usable price in response" });
    }

    // ---- derive the all-time high from the full monthly history ----
    let ath = null;
    let athDate = null;

    const stamps = result.timestamp || [];
    const quote =
      result.indicators && result.indicators.quote && result.indicators.quote[0];
    const highs = (quote && quote.high) || [];

    for (let i = 0; i < highs.length; i++) {
      const h = highs[i];
      if (typeof h === "number" && isFinite(h) && (ath === null || h > ath)) {
        ath = h;
        athDate = stamps[i] ? new Date(stamps[i] * 1000).toISOString() : null;
      }
    }

    // the current price can itself be the record
    if (ath === null || price > ath) {
      ath = price;
      athDate = new Date().toISOString();
    }

    // ---- sanity checks ----------------------------------------------------
    // Published all-time-high figures for TQQQ are often wrong, usually because
    // the source used raw rather than split-adjusted history. TQQQ split 2:1 in
    // January 2022, so an unadjusted series puts the record roughly twice where
    // it belongs. These guards catch that class of error rather than trusting
    // the number blindly.
    const week52 = meta.fiftyTwoWeekHigh;
    const warnings = [];

    // an all-time high cannot be below the 52-week high
    if (typeof week52 === "number" && isFinite(week52) && ath < week52 - 0.01) {
      warnings.push("derived ATH below 52-week high; using 52-week high");
      ath = week52;
      athDate = null;
    }

    // nor below today's price
    if (ath < price) {
      warnings.push("derived ATH below current price; using current price");
      ath = price;
      athDate = new Date().toISOString();
    }

    // Detect an unadjusted series directly rather than guessing from ratios.
    // Yahoo returns split-adjusted OHLC alongside a separately adjusted close.
    // If the highs were NOT adjusted, they would sit far above the adjusted
    // closes, because TQQQ's pre-2022 prices were roughly double. A drawdown
    // ratio test cannot tell that apart from a genuine 80% crash; this can.
    let maxAdjClose = null;
    const adj =
      result.indicators && result.indicators.adjclose && result.indicators.adjclose[0];
    const adjCloses = (adj && adj.adjclose) || [];
    for (let i = 0; i < adjCloses.length; i++) {
      const c = adjCloses[i];
      if (typeof c === "number" && isFinite(c) && (maxAdjClose === null || c > maxAdjClose)) {
        maxAdjClose = c;
      }
    }

    // highs sit a little above closes normally; 1.5x apart means a mismatch
    const suspect =
      maxAdjClose !== null && ath > maxAdjClose * 1.5;
    if (suspect) {
      warnings.push(
        "highs sit far above adjusted closes; series may be unadjusted for the 2022 split"
      );
    }

    return json(
      200,
      {
        price: price,
        ath: round2(ath),
        athDate: athDate,
        fiftyTwoWeekHigh: (typeof week52 === "number" && isFinite(week52)) ? round2(week52) : null,
        maxAdjClose: maxAdjClose !== null ? round2(maxAdjClose) : null,
        suspect: suspect,
        warnings: warnings,
        currency: meta.currency || "USD",
        asOf: meta.regularMarketTime
          ? new Date(meta.regularMarketTime * 1000).toISOString()
          : new Date().toISOString(),
        source: "Yahoo Finance"
      },
      // this is a monthly-cadence site; no reason to hammer Yahoo per page view
      "public, max-age=600"
    );
  } catch (err) {
    return json(502, { error: String((err && err.message) || err) });
  }
};

function round2(v) {
  return Math.round(v * 100) / 100;
}

function json(status, body, cache) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cache || "no-store"
    },
    body: JSON.stringify(body)
  };
}
