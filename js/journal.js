/* ===========================================================================
   Tran to Fire — the monthly journal.

   THIS IS THE FILE YOU WRITE IN. One entry per month.

   The figures (price paid, tier, shares, reserve) are pulled from js/data.js
   automatically and printed at the top of every entry, so you never retype a
   number. You only write the words.

   ---------------------------------------------------------------------------
   HOW TO ADD A MONTH

       1. copy the TEMPLATE at the bottom of this file
       2. paste it inside the square brackets below
       3. delete the // from the front of every line
       4. fill it in, keep the comma at the end, commit

   Order does not matter. The page sorts newest first on its own.

   ---------------------------------------------------------------------------
   THE FIELDS

       month    "2026-08"   REQUIRED. Ties the entry to that month's figures.
       title    the heading on the card
       mood     one short line under the title, e.g. "Quiet month"
       body     the words. An array of paragraphs, or a single string.
                The FIRST paragraph shows on the closed card as the teaser.

       macro    the monthly markets and macro section. Optional, and it can
                hold paragraphs, a table, a chart, or any mix of the three.
                See below.

   ---------------------------------------------------------------------------
   THE MARKETS AND MACRO SECTION

   It appears under your words, behind "read more", with its own heading and a
   rule above it. Every part is optional. Leave out what you do not need.

       macro: {
         heading: "Markets and macro",     // optional, this is the default
         body:    [ "A paragraph.", "Another." ],
         table:   { ... },                 // see below
         chart:   { ... },                 // see below
         note:    "One small grey line at the very bottom, e.g. a source."
       }

   TABLE. Plain text in, table out. The first column is set in the serif face,
   the rest are right-aligned numbers. Every cell is text, so write "+12.8%"
   or "-3.3%" or "$64.00" exactly as you want it to appear.

       table: {
         caption: "Where the majors finished the month.",
         head:    [ "Index", "Month", "Year to date" ],
         rows: [
           [ "Nasdaq-100", "-3.3%", "+12.8%" ],
           [ "S&P 500",    "-1.5%",  "+9.6%" ]
         ],
         note: "Source: whoever you got it from."
       }

   CHART. A simple horizontal bar chart, drawn from numbers. Use it for a run
   of month-end prices, or for monthly returns. NUMBERS ONLY here, no quotes
   and no % or $ inside the value. Negative values are drawn to the left of a
   zero line automatically and coloured red.

       chart: {
         title:    "TQQQ, month-end close",
         bars: [
           { label: "May", value: 84.10 },
           { label: "Jun", value: 79.40 },
           { label: "Jul", value: 64.00 }
         ],
         prefix:   "$",     // optional, printed before each value
         suffix:   "",      // optional, printed after each value, e.g. "%"
         decimals: 2,       // optional, default 2
         plus:     false,   // optional, true puts a + in front of gains
         note:     "Close on the last trading day of each month."
       }

   Bars are scaled against the biggest value in the set, so a chart of prices
   and a chart of percentages both look sensible without any setting.

   ---------------------------------------------------------------------------
   RULES OF THE FILE

   - keep the comma at the end of every entry
   - use straight quotes "  not curly quotes  “ ”
   - a quote mark inside your text needs a backslash:  "he said \"no\""
   - anything you type is printed as plain text, HTML tags will not work
   - if the page goes blank, you have a missing comma or bracket. Open the
     browser console and it will name the line.
   =========================================================================== */

window.TTF_JOURNAL = [

  {
    month: "2026-09",
    title: "One index at a record, the other still short of one",
    mood:  "Baseline on both, for a second month",

    body: [
      "Baseline again on both funds, which is the tier that releases a fifth of the available cash and nothing more. QLD sits a good deal further under its record than SSO does, and neither is close to the rung where the ladder opens up. Whole shares only, so the target buys what it buys and the remainder stays as cash.",

      "The reserve earned its first interest this month. It is small enough to ignore and it will not be small in ten years."
    ],

    macro: {
      heading: "Markets and macro",

      body: [
        "August finished with the S&P 500 up 2.5%, the Nasdaq-100 up 3.8% and the Dow up 1.4%. The headline hides the thing that matters to these two funds. The S&P closed out the summer selloff about a month ago and went back to setting records. The Nasdaq-100 ended the month around 4% below its 2 June peak, the last of the big American gauges yet to reclaim its high. Doubled, that gap is most of why one of these funds is much further from its record than the other.",

        "Bonds set the tone. The ten-year Treasury finished August near 4.72%, up about four basis points on the month and roughly 46 higher than a year ago, with the two-year at 4.34%. Kevin Warsh used his first Jackson Hole speech as chair to say inflation has not meaningfully slowed and that policymakers may have work to do, that 2% is a fixed objective, and that financial conditions are not currently restrictive. He called interest rates the Fed's predominant tool. By the end of the month futures were pricing somewhere between a half and a 57% chance of a rate rise in September, up from about 40% a week earlier. Markets spent the year expecting cuts and are now pricing a hike.",

        "Gold rose 9.76% over the month and is up about 28% on the year. It reached roughly $4,674 an ounce on 24 August and then fell back below $4,450 as Warsh's remarks revived the case for higher rates. Bitcoin sat near $76,700 in late August, about $35,800 below where it traded a year earlier. Two assets that get sold together as a hedge against currency debasement, and over twelve months one is up 28% while the other has lost roughly a third. Whatever gold is pricing this year, bitcoin is not pricing it.",

        "Inside tech the rotation carried on. Since 22 June the equal-weight S&P Software and Services ETF has gained around 24% while the equal-weight S&P Semiconductor ETF has lost around 24%. That is software's biggest two-month run against chips since at least 2001, and it is a straight reversal of early 2026, when chips led by the widest margin on record. The Philadelphia Semiconductor Index fell 2.3% in the week to 28 August even though Nvidia and Marvell both beat expectations, and fibre optics and power names went with it. Over the full month the chip index managed a 2.2% bounce after falling nearly 19% in July, and Nvidia rose 8.6%.",

        "The Nasdaq-100 holds both sides of that trade, so at the index level the fight mostly cancels out and the drawdown I buy against is the residue of it. Ten months of the two halves of tech pulling apart is why the index has not got its record back while the S&P has. Nothing in the ladder cares which half is winning."
      ],

      table: {
        caption: "Two months of the same market, measured four ways.",
        head: [ "", "August", "Past 12 months" ],
        rows: [
          [ "S&P 500",        "+2.5%",  "at record highs" ],
          [ "Nasdaq-100",     "+3.8%",  "4% below its June peak" ],
          [ "Gold",           "+9.8%",  "+28%" ],
          [ "Bitcoin",        "",       "about $35,800 lower" ]
        ],
        note: "Index moves are calendar August. The buys happen on their own day, so the fund prices logged here will not line up with these figures."
      },

      chart: {
        title: "Software against semiconductors, equal weight, since 22 June",
        bars: [
          { label: "Software",   value: 24 },
          { label: "Chips",      value: -24 }
        ],
        suffix: "%",
        decimals: 0,
        note: "The widest two-month gap in software's favour since at least 2001, and the mirror image of how 2026 started."
      },

      note: "Sources: Trading Economics for index and commodity levels, Advisor Perspectives for Treasury yields, CME FedWatch pricing as reported at month end, Fortune for daily gold and bitcoin prices, Bloomberg on the Nasdaq-100's distance from its record, and TradeStation and GuruFocus on the software and semiconductor spread."
    }
  },

  {
    month: "2026-08",
    title: "The first buy",
    mood:  "Starting a long way under the high",

    body: [
      "Both funds went in on the baseline tier, which releases a fifth of the available cash and not a share more. QLD was about 11% under its record and SSO under 6%, and neither is far enough down for the ladder to open up. That came to one share of QLD and two of SSO. The $1,369 left across the two reserves waits, earning interest while it does nothing, ready for a month that is worse than this one."
    ],

    macro: {
      heading: "Markets and macro",

      body: [
        "The Fed held at 3.50 to 3.75% on 29 July, a fifth meeting in a row without a move. Citadel Securities had gone public days earlier arguing for a surprise hike, a call Bloomberg said was adding to the angst in the bond market, and the odds of a rise had climbed to roughly a third by the morning of the meeting. It did not happen. Three voters dissented and all three wanted a hike, the most one-sided dissent since 2016. Kevin Warsh has stopped issuing forward guidance, so nobody walked out of that room knowing much more than they walked in with. The Dow gave up more than 800 points that afternoon.",

        "The bigger story was semiconductors. CXMT, a Chinese memory maker, listed in Shanghai on 27 July and raised a domestic record of $8.6 billion. The next day The Information reported that a Chinese state-backed firm had begun mass-producing deep ultraviolet lithography equipment, which is the link in the chain the export controls were meant to hold. Chip stocks shed more than a trillion dollars of value in two sessions and fell into a bear market, over 20% below their June record.",

        "Underneath it sat forced selling, and the professionals got caught too. Situational Awareness, Leopold Aschenbrenner\'s AI infrastructure fund, was up around 439% after fees through June and running leverage as high as four times. When its holdings fell, the margin calls came from Goldman Sachs, JPMorgan and Bank of America, and on Wednesday it sold its entire public equity book to Citadel. Bloomberg puts what is left of the fund at about $10 billion, down by more than half. Six days earlier its investor letter had called the selloff one of the most attractive buying opportunities since early 2025 and invited fresh money in by 1 August. The money did not arrive in time.",

        "The retail version of the same thing has been running in Korea for weeks. Investors there spent the first half of the year building margin positions, a lot of it through single-stock leveraged ETFs, and on the Financial Supervisory Service numbers more than a million accounts reached margin-call thresholds, with somewhere between three and four hundred thousand closed out by their brokers. The regulator has stopped approving new leveraged ETF listings. Forced selling is not an opinion about value. A good share of what moved this fortnight was people being sold out rather than people deciding to sell.",

        "Then the earnings landed and argued the other way. Microsoft did $90.0 billion of revenue against $87.6 billion expected, grew Azure 43%, and held its capital spending guidance instead of raising it. Amazon followed a day later with AWS up 37%, its fastest since 2021, and lifted 2026 capex to $220 billion anyway. Samsung reported semiconductor operating profit more than 250 times what it earned a year ago, then told analysts the memory shortage will be worse in 2027 than in 2026 and will run into 2028.",

        "So the month closes with the market selling the companies that make the chips while the companies that buy them post record demand and sign multi-year supply deals.",

        "Aschenbrenner held ordinary shares with four times leverage borrowed on top, from three prime brokers who could ask for it back. They did, and he was sold out near the bottom on their schedule. I hold a leveraged fund bought outright with cash, so nobody can force me out of it. That is the only real edge I have over him. For all that noise, the drawdown left both funds on the baseline tier this month. The ladder never asked my opinion on lithography."
      ],

      table: {
        caption: "The two sessions that did the damage, 27 and 28 July.",
        head: [ "", "One-day fall" ],
        rows: [
          [ "SK Hynix",       "-14.7%" ],
          [ "Sandisk",        "-14%"   ],
          [ "Samsung Elec.",  "-13%"   ],
          [ "AMD",            "-8%"    ],
          [ "Micron",         "-8%"    ],
          [ "Western Digital","-7%"    ],
          [ "Intel",          "-6%"    ]
        ],
        note: "Nvidia closed the second session roughly flat, which is its own kind of signal."
      },

      chart: {
        title: "What the cloud actually reported, against what was expected",
        bars: [
          { label: "Azure",     value: 43 },
          { label: "expected",  value: 40 },
          { label: "AWS",       value: 37 },
          { label: "expected",  value: 31 }
        ],
        suffix: "%",
        decimals: 0,
        note: "Year on year growth. Alphabet's Google Cloud grew 82% the week before and the stock fell 7% on the capex guide that came with it."
      },

      note: "Sources: the FOMC statement and press conference, company earnings releases, Korea's Financial Supervisory Service, and contemporaneous reporting from CNBC, Reuters and The Information."
    }
  },


];


/* ===========================================================================
   TEMPLATE — copy everything between the two lines, paste it above, and
   delete the // from the front of each line.
   ---------------------------------------------------------------------------

  {
    month: "2026-08",
    title: "The first buy",
    mood:  "Quiet month",

    body: [
      "What the rules said, and whether I followed them.",
      "How it felt. Short in the quiet months, longer in the ugly ones."
    ],

    macro: {
      heading: "Markets and macro",

      body: [
        "What the month did, in a paragraph or two. Rates, inflation, the",
        "oil price, the dollar, whatever actually mattered to this position."
      ],

      table: {
        caption: "Where things finished the month.",
        head: [ "", "Month", "Year to date" ],
        rows: [
          [ "Nasdaq-100", "0.0%", "0.0%" ],
          [ "S&P 500",    "0.0%", "0.0%" ],
          [ "AUD/USD",    "0.0%", "0.0%" ]
        ]
      },

      chart: {
        title: "TQQQ, month-end close",
        bars: [
          { label: "Jun", value: 0 },
          { label: "Jul", value: 0 },
          { label: "Aug", value: 0 }
        ],
        prefix: "$",
        decimals: 2
      },

      note: "Sources, if you used any."
    }
  },

   ---------------------------------------------------------------------------
   =========================================================================== */
