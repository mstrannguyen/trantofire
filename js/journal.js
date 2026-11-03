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
    month: "2026-11",
    title: "A record on 6 October, then earnings week",
    mood:  "Baseline on both, QLD near the first rung",

    body: [
      "Baseline on both funds for a fourth month, but QLD is closer to the first rung than it has been since the log began. The Nasdaq-100 set a record on 6 October and spent the rest of the month giving it back, so QLD went in a long way under a fresh high while SSO sits only a little below its own. Another bad stretch for tech and the next QLD buy is a Dip month, which releases a third of the cash instead of a fifth.",

      "SSO came in one share short of what the rules called for, and the log shows both numbers. I sized the order at my limit price, a little above the last close, rather than at the close, and at the limit the baseline fifth came up just short of the last share. The rules size the buy at the last close, and at that price it covered it. The share that was not bought is still in the reserve and waits for December with the rest."
    ],

    macro: {
      heading: "Markets and macro",

      body: [
        "October was the month the market started asking what the AI build-out costs. The Nasdaq-100 finished it 6.7% lower, its worst month since March 2025, while the S&P 500 lost about 1% and the Dow gained 1.5%. Most of that came in the last two sessions, after the biggest spenders reported. Alphabet grew search revenue 12% against the 15% analysts wanted, spent $51.4 billion on capital expenditure in the quarter, more than double a year earlier, and ran negative free cash flow of about $9.1 billion. On 29 October its shares fell 12.6%, the worst day since it listed in 2004, and about $480 billion of value went with them. Amazon kept its capital spending plan at $220 billion and reported a free cash outflow of $42.4 billion over the twelve months to September. Neither Alphabet nor Microsoft raised its spending guidance, and the market read that as caution.",

        "Friday 30 October finished the month. Intel fell 29% on a weak fourth-quarter outlook, its worst day since 1974, and took the chipmakers with it: AMD lost 12% and Nvidia 5%. Reddit fell 29% the same day. The technology sector of the S&P 500 dropped nearly 5%, the Nasdaq Composite had its worst day since June, and the VIX rose by about a third during the session. Over the month CoreWeave lost 37% and Nebius close to 35%. What money left tech went to the defensive end of the market.",

        "The Fed held at 3.75 to 4.00% on 28 October, six days before the midterm elections. The vote was 10 to 2, and both dissenters, Governor Lisa Cook and Cleveland's Beth Hammack, wanted another quarter point. Kevin Warsh said politics played no role in the decision and that inflation remains elevated. September's CPI came in at 3.7%, up from 3.4%, while employers added only 29,000 jobs and unemployment rose to 4.2%. After the meeting, futures put the odds of a December hike above 80%. The bond market moved the other way. The ten-year Treasury went above 5.3% early in the month and finished it at 4.94%, down from 5.29% at the end of September.",

        "The war with Iran is close to eight months old. Brent stayed above $100 a barrel for the whole of October. In the last week tankers in the Strait of Hormuz were hit by attacks and mines, and President Trump said the war is going to end soon, without saying how.",

        "At home, the ABS reported on 28 October that consumer prices rose 4.3% in the year to September, up from 4.0% in August. Housing was the largest contributor, and fuel pushed transport up 8.7%. The RBA lifted the cash rate to 4.60% on 29 September, its fourth rise this year, and all four major banks expect a fifth at the 3 November meeting.",

        "That split is what matters for these two funds. The companies that fell hardest in October are a far bigger share of the Nasdaq-100 than of the S&P 500, which also holds the energy companies and the consumer staples, so the same month left QLD a long way under its record and SSO only a little under its own. The ladder does not care why. It reads the distance from the high, and for QLD that distance is now close to the first rung.",

        "Both funds stayed on the baseline tier."
      ],

      table: {
        caption: "The rates behind the month.",
        head: [ "", "Level", "For context" ],
        rows: [
          [ "Fed funds",       "3.75 to 4.00%", "held, 10 to 2" ],
          [ "US CPI",          "3.7%",          "up from 3.4%" ],
          [ "Ten-year yield",  "4.94%",         "down from 5.29%" ],
          [ "RBA cash rate",   "4.60%",         "fourth rise of 2026" ],
          [ "Australian CPI",  "4.3%",          "up from 4.0%" ]
        ],
        note: "The Fed decision was on 28 October. US CPI is for September and Australian CPI for the year to September, both published in October. The ten-year is the 30 October close against the end of September. The RBA rise was on 29 September."
      },

      chart: {
        title: "October, by index",
        bars: [
          { label: "Nasdaq-100", value: -6.7 },
          { label: "S&P 500",    value: -1.0 },
          { label: "Dow",        value: 1.5 }
        ],
        suffix: "%",
        decimals: 1,
        plus: true,
        note: "Calendar October. The S&P 500 figure is rounded, since sources put it between -0.9% and -1.2%. The buys happen on their own day, so the fund prices logged here will not line up with these figures."
      },

      note: "Sources: Bloomberg via KuCoin on the Nasdaq-100's month, Yahoo Finance on the Dow and the 30 October session, Fortune on Alphabet's results and its fall, Wealth Professional on Amazon, CoreWeave and Nebius, TheStreet on Intel, Reddit, the chipmakers and the Strait of Hormuz, Yahoo Finance and Charles Schwab on the Fed decision and the US data, Forbes on Treasury yields, the ABS on Australian inflation, and Aussie on the RBA."
    }
  },

  {
    month: "2026-10",
    title: "The first rate hike since 2023",
    mood:  "Baseline, third month running",

    body: [
      "Baseline on both funds for the third month in a row. QLD has closed some of the distance to its record since the last buy and SSO has slipped a little further from its own, but both are a long way above the first rung. A fifth of the cash goes in, whole shares only, and the rest waits."
    ],

    macro: {
      heading: "Markets and macro",

      body: [
        "The Fed raised rates on 16 September, a quarter point to 3.75 to 4.00%, its first increase since July 2023. The vote was 12 to 0, two months after three members dissented in favour of a hike. Kevin Warsh said inflation is too high and has been for too long, and described the move as removing a dose of accommodation. Sixteen of eighteen officials now pencil in at least one more hike this year. Futures had it at 92% that morning, so the decision itself surprised nobody. On 3 September JD Vance had said the Fed should cut to make homes more affordable.",

        "The bond market went further than the Fed. The ten-year Treasury reached 5.25% on 29 September, its highest since June 2007, after sitting near 4.77% at the start of the month. That is 48 basis points in four weeks and more than a full point since just before the Iran war began. The thirty-year touched 5.49%, a level last seen in 2004. BMO measured the one-month correlation between US crude and the ten-year at 0.96, which is another way of saying the bond market is trading the oil price. In February the Congressional Budget Office expected the ten-year to average 4.1% this year. By 26 September futures put the odds of a second hike in October at 64%.",

        "The oil comes from the Gulf. The US and Iran fired on each other\'s ships over the first weekend of September and Saudi Aramco facilities were reportedly hit, which sent Brent to about $97.70, its highest since late July. On 28 September President Trump rejected an Iranian proposal to reopen the Strait of Hormuz within seven days and Brent rose more than 3% to near $108. The conflict is close to seven months old. Crude is high but not at a record: Brent peaked at $126 in April and the all-time high is still 2008's. Diesel is the product at a record, at the pump, and the Energy Secretary has reportedly warned the industry to prepare for limits on diesel exports.",

        "The other story came from inside the AI industry. On 12 September Anthropic's chief executive Dario Amodei published an essay proposing that frontier labs slow how quickly they improve their most capable models, with a three-step plan meant to do it without giving up commercial ground or America's lead. Sam Altman and Elon Musk both backed it the same day, Musk in three words: Dario is right. AI stocks fell the following Monday. Trump dismissed the idea, saying a slowdown would hand ground to China. Altman ruled out an OpenAI listing this year, and a lawsuit has since been filed arguing that rival labs agreeing to slow down together is an illegal agreement. Ten days after the essay, OpenAI and Anthropic both released new models and cut prices rather than claiming a jump in capability. Morgan Stanley, one of the banks lined up for Anthropic's listing, said none of it changes how much the industry spends.",

        "The spending is the part that reaches the Nasdaq-100, since chipmakers and cloud companies make up so much of it, and on Morgan Stanley\'s reading the spending has not changed. The hike reaches these funds a second way. A 2x fund gets its second dollar of exposure through swaps priced off short-term rates, so each hike adds a little to what the leverage costs for as long as rates stay there. It never appears as a fee. It shows up in the price, a fraction at a time.",

        "None of it moved either fund off the baseline tier."
      ],

      table: {
        caption: "September in four numbers.",
        head: [ "", "Level", "For context" ],
        rows: [
          [ "Fed funds",        "3.75 to 4.00%", "first hike since July 2023" ],
          [ "Ten-year yield",   "5.25%",         "highest since June 2007" ],
          [ "Thirty-year yield","5.49%",         "highest since 2004" ],
          [ "Brent crude",      "about $107",    "2026 peak was $126 in April" ]
        ],
        note: "Bond yields as of 29 September for the ten-year and 26 September for the thirty-year. Brent is the 28 September level after the Hormuz proposal was rejected."
      },

      chart: {
        title: "How far the ten-year yield rose after 3 September",
        bars: [
          { label: "15 Sep, eve of the hike", value: 23 },
          { label: "26 Sep",                  value: 46 },
          { label: "29 Sep",                  value: 48 }
        ],
        suffix: " bp",
        decimals: 0,
        note: "Basis points above the 4.77% close on 3 September. About half the rise came after the Fed moved."
      },

      note: "Sources: the Federal Reserve and CNBC on the 16 September decision, Charles Schwab and J.P. Morgan Asset Management on the projections, CNBC, Fortune and Trading Economics on Treasury yields, CNBC and Al Jazeera on the Gulf strikes and oil, Bloomberg on diesel, CNBC, CoinDesk and PBS on the AI slowdown essay and the responses to it, and BeInCrypto on the 22 September releases."
    }
  },

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
