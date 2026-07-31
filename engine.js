/* ===========================================================================
   TranToFire — the rules, in code.

   Given a list of months and a price for each, this works out everything else
   exactly the way the strategy says it should. It is the same arithmetic that
   is written out in plain English on /strategy/, so if the two ever disagree,
   one of them is a bug and I want to know.
   =========================================================================== */
(function () {
  "use strict";

  var TIERS = [
    { at: 0.60, pct: 1.00, label: "Crash",    n: 3 },
    { at: 0.40, pct: 0.67, label: "Deep dip", n: 2 },
    { at: 0.20, pct: 0.33, label: "Dip",      n: 1 },
    { at: 0.00, pct: 0.20, label: "Baseline", n: 0 }
  ];

  function tierFor(drawdown) {
    var d = Math.abs(drawdown);
    for (var i = 0; i < TIERS.length; i++) {
      if (d >= TIERS[i].at) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  function monthLabel(ym) {
    var parts = String(ym).split("-");
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    if (isNaN(d.getTime())) return String(ym);
    return d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
  }

  /* Walks the months in order, applying the rules month by month. */
  function run(rows, cfg) {
    var high     = cfg.HIGH_WATER_MARK;
    var reserve  = 0;
    var shares   = 0;
    var invested = 0;    // total spent on shares
    var moneyIn  = 0;    // total contributed
    var interest = 0;    // cumulative interest earned on the reserve
    var feesPaid = 0;    // cumulative brokerage actually paid
    var mgmtDrag = 0;    // ESTIMATE of the fund's expense ratio, not deducted
    var out      = [];

    // Interest on the idle reserve. An Australian saver or offset account
    // accrues daily and pays monthly, so a twelfth of the annual rate each
    // month is the honest approximation. Interest is a RETURN, not a
    // contribution, so it lifts the portfolio without lifting money-in.
    var monthlyRate = (isFinite(cfg.CASH_RATE) ? Number(cfg.CASH_RATE) : 0) / 12;
    var firstMonth  = true;

    rows.slice().sort(function (a, b) {
      return String(a.month) < String(b.month) ? -1 : 1;
    }).forEach(function (r) {
      var price = Number(r.price);
      if (!isFinite(price) || price <= 0) return;

      var contribution = isFinite(r.contribution) ? Number(r.contribution) : cfg.CONTRIBUTION;
      var fill         = isFinite(r.fill) ? Number(r.fill) : price;

      // the reserve earns interest for the month before the new money lands.
      // Nothing accrues in the very first month: there was no reserve yet.
      var monthInterest = 0;
      if (!firstMonth && monthlyRate > 0 && reserve > 0) {
        monthInterest = reserve * monthlyRate;
        reserve  += monthInterest;
        interest += monthInterest;
      }
      firstMonth = false;

      // The high-water mark only ever ratchets upward. It normally rises from
      // the prices logged here, but the site only ever sees one price a month
      // — the day you bought. If TQQQ set a record BETWEEN buy days, say so
      // with `high:` on that month's line or every later drawdown is wrong.
      if (isFinite(r.high) && Number(r.high) > high) high = Number(r.high);
      if (price > high) high = price;

      var drawdown  = (price - high) / high;          // 0 or negative
      var tier      = tierFor(drawdown);
      var available = reserve + contribution;
      var target    = available * tier.pct;

      // The rules decide the share count on the tier amount alone. Brokerage is
      // then taken out of the cash afterwards, so the fee reduces the reserve
      // rather than the size of the buy.
      var brokerage = isFinite(r.fee) ? Number(r.fee)
                    : (isFinite(cfg.BROKERAGE) ? Number(cfg.BROKERAGE) : 0);

      var ruleBought = Math.floor(target / fill);
      var bought     = isFinite(r.shares) ? Number(r.shares) : ruleBought;
      var deviated   = bought !== ruleBought;

      var fee   = bought > 0 ? brokerage : 0;         // no trade, no brokerage
      var spent = bought * fill + fee;
      feesPaid += fee;

      reserve  = available - spent;
      shares  += bought;
      invested += spent;
      moneyIn += contribution;

      var etfValue  = shares * price;
      var portfolio = etfValue + reserve;

      // Estimate of the expense ratio borne this month. NOT subtracted from
      // portfolio: the market price is already net of it. This exists so the
      // cost is visible rather than silently buried in the price.
      var monthMgmt = etfValue * ((isFinite(cfg.EXPENSE_RATIO) ? Number(cfg.EXPENSE_RATIO) : 0) / 12);
      mgmtDrag += monthMgmt;
      var pl        = portfolio - moneyIn;

      out.push({
        month:      r.month,
        label:      monthLabel(r.month),
        note:       r.note || "",
        price:      price,
        fill:       fill,
        high:       high,
        drawdown:   drawdown,
        tier:       tier,
        available:  available,
        deployPct:  tier.pct,
        target:     target,
        ruleBought: ruleBought,
        bought:     bought,
        deviated:   deviated,
        fee:        fee,
        spent:      spent,
        reserve:    reserve,
        interest:       monthInterest,   // earned this month
        interestTotal:  interest,        // earned to date
        brokerage:      fee,             // paid this month
        brokerageTotal: feesPaid,        // paid to date
        mgmtMonth:      monthMgmt,       // estimated fund fee this month
        mgmtTotal:      mgmtDrag,        // estimated fund fee to date
        shares:     shares,
        avgCost:    shares ? invested / shares : null,
        etfValue:   etfValue,
        portfolio:  portfolio,
        moneyIn:    moneyIn,
        pl:         pl,
        ret:        moneyIn ? pl / moneyIn : 0,
        pctEtf:     portfolio ? etfValue / portfolio : 0,
        pctCash:    portfolio ? reserve / portfolio : 0
      });
    });

    return out;
  }

  /* What the rules say to do next month, given where things stand. */
  function next(history, cfg, priceNow) {
    var last      = history.length ? history[history.length - 1] : null;
    var high      = last ? last.high : cfg.HIGH_WATER_MARK;
    var reserve   = last ? last.reserve : 0;
    var price     = isFinite(priceNow) ? Number(priceNow) : (last ? last.price : null);
    if (price === null) return null;
    if (price > high) high = price;

    var drawdown  = (price - high) / high;
    var tier      = tierFor(drawdown);
    var available = reserve + cfg.CONTRIBUTION;
    var target    = available * tier.pct;
    var bought    = Math.floor(target / price);

    return {
      price: price, high: high, drawdown: drawdown, tier: tier,
      available: available, target: target, bought: bought,
      spend: bought * price
    };
  }


  /* Re-price the holdings at a live market price without altering the
     historical record. The monthly rows keep the prices actually paid; this
     only answers "what is the position worth right now?".

     Returns null if there is no history or no usable price. */
  function revalue(history, livePrice) {
    if (!history || !history.length) return null;
    var price = Number(livePrice);
    if (!isFinite(price) || price <= 0) return null;

    var last     = history[history.length - 1];
    var shares   = last.shares;
    var reserve  = last.reserve;          // already includes interest accrued to date
    var moneyIn  = last.moneyIn;
    var interest = last.interestTotal || 0;
    var feesPaid = last.brokerageTotal || 0;
    var mgmtDrag = last.mgmtTotal || 0;
    var invested = shares ? last.avgCost * shares : 0;   // total spent on shares

    var etfValue  = shares * price;
    var portfolio = etfValue + reserve;
    var pl        = portfolio - moneyIn;

    // high-water mark ratchets on live price too
    var high = price > last.high ? price : last.high;
    var drawdown = (price - high) / high;
    var tier = tierFor(drawdown);

    return {
      price:      price,
      shares:     shares,
      reserve:    reserve,
      moneyIn:    moneyIn,
      invested:   invested,
      etfValue:   etfValue,
      etfPl:      etfValue - invested,          // gain on the shares alone
      etfRet:     invested ? (etfValue - invested) / invested : 0,
      portfolio:  portfolio,
      pl:         pl,
      ret:        moneyIn ? pl / moneyIn : 0,
      interestTotal:  interest,
      plExInterest:   pl - interest,      // gain excluding the cash interest
      brokerageTotal: feesPaid,
      mgmtTotal:      mgmtDrag,
      costsTotal:     feesPaid + mgmtDrag,
      avgCost:    last.avgCost,
      high:       high,
      drawdown:   drawdown,
      tier:       tier,
      pctEtf:     portfolio ? etfValue / portfolio : 0,
      pctCash:    portfolio ? reserve / portfolio : 0
    };
  }

  /* ---- shared formatting ---- */
  /* U+2212 rather than a hyphen: it is the real minus sign, drawn straight and
     to the same width as the figures. The sign goes before the $, because
     "$-3" is not how anyone writes minus three dollars. */
  function usd(v, dp) {
    if (v === null || v === undefined || !isFinite(v)) return "\u2014";
    dp = dp === undefined ? 0 : dp;
    var neg = v < 0;
    return (neg ? "\u2212" : "") + "$" + Math.abs(Number(v)).toLocaleString("en-US",
      { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function pct(v, dp) {
    if (v === null || v === undefined || !isFinite(v)) return "\u2014";
    dp = dp === undefined ? 1 : dp;
    var n = v * 100;
    return (n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(dp) + "%";
  }
  /* Round normally — EXCEPT where rounding up would announce a tier boundary
     the rules have not actually crossed. 19.997% must not display as "20.0%"
     next to a Baseline tier, or the page looks like it contradicts itself. */
  function ddPct(v) {
    if (v === null || v === undefined || !isFinite(v)) return "\u2014";
    var d = Math.abs(v) * 100;
    var rounded = Math.round(d * 10) / 10;
    for (var i = 0; i < TIERS.length; i++) {
      var edge = TIERS[i].at * 100;
      if (edge > 0 && d < edge && rounded >= edge) {
        return (Math.floor(d * 10) / 10).toFixed(1) + "%";   // floor instead
      }
    }
    return rounded.toFixed(1) + "%";
  }

  window.TTF_ENGINE = {
    run: run, next: next, revalue: revalue, tierFor: tierFor, monthLabel: monthLabel,
    usd: usd, pct: pct, ddPct: ddPct
  };
})();
