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

  // Your first entry goes here, after the August buy.

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
