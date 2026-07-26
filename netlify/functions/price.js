/* Fetches the current TQQQ price from Yahoo Finance.
 *
 * This runs on Netlify's servers, not in the visitor's browser. That matters:
 * Yahoo does not send CORS headers, so a browser cannot call it directly.
 * Because this function sits on trantofire.au, the browser request to it is
 * same-origin, which keeps the site's Content-Security-Policy untouched.
 *
 * Returns: { price, currency, asOf, source }  or  { error }
 */

const SYMBOL = "TQQQ";
const URL =
  "https://query1.finance.yahoo.com/v8/finance/chart/" +
  SYMBOL +
  "?interval=1d&range=1d";

exports.handler = async function () {
  try {
    const res = await fetch(URL, {
      headers: {
        // Yahoo rejects requests without a browser-like agent
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      return json(502, { error: "Yahoo returned HTTP " + res.status });
    }

    const data = await res.json();
    const meta =
      data &&
      data.chart &&
      data.chart.result &&
      data.chart.result[0] &&
      data.chart.result[0].meta;

    if (!meta) return json(502, { error: "Unexpected response shape" });

    const price = meta.regularMarketPrice;
    if (typeof price !== "number" || !isFinite(price) || price <= 0) {
      return json(502, { error: "No usable price in response" });
    }

    return json(
      200,
      {
        price: price,
        currency: meta.currency || "USD",
        asOf: meta.regularMarketTime
          ? new Date(meta.regularMarketTime * 1000).toISOString()
          : new Date().toISOString(),
        source: "Yahoo Finance"
      },
      // cache at the edge for 10 minutes; this is a monthly-cadence site,
      // there is no reason to hammer Yahoo on every page view
      "public, max-age=600"
    );
  } catch (err) {
    return json(502, { error: String((err && err.message) || err) });
  }
};

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
