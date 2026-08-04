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
    month: "2026-08",
    title: "The first buy",
    mood:  "Starting a long way under the high",

    body: [
      "TQQQ was well below its June record when the order went in, so the dip tier applied and a third of the available cash went to work instead of the usual fifth. That came to 4 shares. SSO was barely off its own high, so it stayed on the baseline fifth and took 2. The $1,218 left across the two reserves waits, earning interest while it does nothing, ready for a month that is worse than this one.",

      "Two funds from the start, US$800 into each, same ladder, measured separately. TQQQ was 32% under its record and SSO was under 4% under its own, so on the same afternoon one bought at a heavy discount and the other bought at close to full price. Neither reserve knows the other exists, which is the whole reason for running them apart.",

      "SSO is the quieter half and it is meant to be. A 2x fund on the S&P 500 does not fall the way a 3x fund on the Nasdaq does, and I expect to hold it long after the mix has started tilting away from the Nasdaq side. This month it did almost nothing, which is what a baseline month looks like."
    ],

    macro: {
      heading: "Markets and macro",

      body: [
        "The Fed held at 3.50 to 3.75% on 29 July, a fifth meeting in a row without a move. Citadel Securities had gone public days earlier arguing for a surprise hike, a call Bloomberg said was adding to the angst in the bond market, and the odds of a rise had climbed to roughly a third by the morning of the meeting. It did not happen. Three voters dissented and all three wanted a hike, the most one-sided dissent since 2016. Kevin Warsh has stopped issuing forward guidance, so nobody walked out of that room knowing much more than they walked in with. The Dow gave up more than 800 points that afternoon.",

        "The bigger story was semiconductors. CXMT, a Chinese memory maker, listed in Shanghai on 27 July and raised a domestic record of $8.6 billion. The next day The Information reported that a Chinese state-backed firm had begun mass-producing deep ultraviolet lithography equipment, which is the link in the chain the export controls were meant to hold. Chip stocks shed more than a trillion dollars of value in two sessions and fell into a bear market, over 20% below their June record.",

        "Underneath it sat forced selling, and the professionals got caught too. Situational Awareness, Leopold Aschenbrenner\'s AI infrastructure fund, was up around 439% after fees through June and running leverage as high as four times. When its holdings fell, the margin calls came from Goldman Sachs, JPMorgan and Bank of America, and on Wednesday it sold its entire public equity book to Citadel. Bloomberg puts what is left of the fund at about $10 billion, down by more than half. Six days earlier its investor letter had called the selloff one of the most attractive buying opportunities since early 2025 and invited fresh money in by 1 August. The money did not arrive in time.",

        "The retail version of the same thing has been running in Korea for weeks. Investors there spent the first half of the year building margin positions, a lot of it through single-stock leveraged ETFs, and on the Financial Supervisory Service numbers more than a million accounts reached margin-call thresholds, with somewhere between three and four hundred thousand closed out by their brokers. The regulator has stopped approving new leveraged ETF listings. Forced selling is not an opinion about value. A good share of what moved this fortnight was people being sold out rather than people deciding to sell.",

        "Then the earnings landed and argued the other way. Microsoft did $90.0 billion of revenue against $87.6 billion expected, grew Azure 43%, and held its capital spending guidance instead of raising it. Amazon followed a day later with AWS up 37%, its fastest since 2021, and lifted 2026 capex to $220 billion anyway. Samsung reported semiconductor operating profit more than 250 times what it earned a year ago, then told analysts the memory shortage will be worse in 2027 than in 2026 and will run into 2028.",

        "So the month closes with the market selling the companies that make the chips while the companies that buy them post record demand and sign multi-year supply deals. One of those two groups is wrong. I do not know which, and I do not need to.",

        "Aschenbrenner held ordinary shares with four times leverage borrowed on top, from three prime brokers who could ask for it back. They did, and he was sold out near the bottom on their schedule. I hold a leveraged fund bought outright with cash, so nobody can force me out of it. That is the only real edge I have over him. The drawdown put TQQQ in the dip tier this month and left SSO on the baseline. The ladder never asked my opinion on lithography."
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
