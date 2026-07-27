# Tran to Fire — how to run the site

Everything below is done in a web browser. Nothing to install.

---

## PART 1 — Get the current version live (do this once, now)

1. Unzip the package you downloaded.
2. Go to netlify.com and open your site.
3. Click the **Deploys** tab.
4. At the bottom of the page there is a drop zone.
5. Drag the **`site` folder** onto it. The folder itself, not the files inside.
6. Wait about 30 seconds.
7. Visit trantofire.au. The Progress page should say "Nothing logged yet".
   That is correct — your first buy has not happened.

---

## PART 2 — Set up GitHub (do this once, ~15 min)

This is what turns your monthly job into a two-minute edit in a browser.

### Make an account
8.  Go to github.com and click **Sign up**.
9.  Enter an email, password and username. Verify the email.
10. Choose the **Free** plan.

### Create the repository
11. Click the **+** at the top right, then **New repository**.
12. Name it `trantofire`.
13. Choose Private or Public. Either works.
14. Do NOT tick any of the "Initialize" boxes.
15. Click **Create repository**.

### Upload the site
16. On the next page, click the link **uploading an existing file**.
17. On your computer, open the `site` folder so you can see `index.html`.
18. Select everything inside it (Ctrl+A / Cmd+A).
19. Drag it all into the browser window.
    IMPORTANT: drag the CONTENTS. `index.html` must sit at the top level.
20. Scroll down and click the green **Commit changes**.

### Connect Netlify to it
21. In Netlify: **Site configuration** -> **Build & deploy** -> **Continuous deployment**.
22. Click **Link repository** -> **GitHub** -> authorise it.
23. Choose your `trantofire` repository.
24. Build command: leave EMPTY. Publish directory: leave EMPTY.
25. Click **Deploy**.

From now on, never drag a folder onto Netlify again. GitHub is the source of truth.

---

## PART 3 — Every month (2 minutes)

Do this after you place your buy order.

26. Go to github.com and open your `trantofire` repository.
27. Click the **`js`** folder, then click **`data.js`**.
28. Click the **pencil icon** at the top right of the file.
29. Add one line inside the square brackets:

        { month: "2026-08", price: 66.00 },

    - `month` is the year and month, in quotes
    - `price` is what TQQQ cost when you bought
    - the comma at the end is required
    - use straight quotes " and not curly quotes

30. Scroll down, click **Commit changes**, then confirm.
31. Wait 30 seconds. The site has updated itself.

That is the whole job. The site recalculates the drawdown, the tier, how much
to deploy, the shares bought, the reserve, the portfolio value, the return,
both charts, the table and the home page cards.

---

## When reality differs from the rules

Most months the site's maths will match your broker exactly. When it doesn't,
say so. Add any of these to the line:

    { month: "2026-10", price: 52.40, fill: 52.55, fee: 9.50,
      shares: 40, note: "Order partially filled" },

    fill    the price you were actually filled at
    fee     brokerage paid
    shares  how many you ACTUALLY bought, if not what the rules said
    note    a short explanation, shown on the site

If `shares` differs from what the rules called for, the site marks that month
with a "not equal" symbol and publishes both numbers. That is deliberate.

---

## Writing a monthly update post

32. In GitHub, open the `js` folder and click `journal.js`.
33. Click the pencil icon and add an entry inside the square brackets:

        {
          month: "2026-08",
          title: "The first buy",
          body: [
            "First paragraph. This one shows on the card as the teaser.",
            "Second paragraph, hidden until someone clicks read more.",
            "Add as many as you like."
          ]
        },

34. Commit. The card appears with that month's figures in the headline,
    pulled from data.js, so the words and the numbers can never disagree.

Optional fields: `mood:` for a short line under the title.

The first paragraph is always the teaser. Everything after it is behind
"read more", along with the figures strip and that entry's comments.

---

## Still to do before promoting the site

- [ ] Replace `[hello@trantofire.au]` on the My Story page with a real address
- [ ] Set up email forwarding for that address at VentraIP
- [ ] Turn on Force HTTPS in Netlify once the padlock appears
- [ ] Turn on two-factor auth: Netlify, VentraIP, GitHub
- [ ] Turn on the domain transfer lock at VentraIP for both domains
- [ ] Sign up at fastcomments.com (Flex plan, $0.99 a month minimum, first
      site free, 30 day trial with no card). Add trantofire.au as a site in
      the account settings, or the widget loads and then refuses with a domain
      authorisation error. Copy the Tenant ID from
      fastcomments.com/auth/my-account/api-secret and paste it into
      `js/comments.js` — find `YOUR_FASTCOMMENTS_TENANT_ID`. That one line
      switches on every thread: Home, Strategy, Progress, My Story, and one
      per journal entry. Threads only load when a reader scrolls to them.
- [ ] Uncomment the HSTS line in `_headers` once HTTPS is confirmed working

---

Full instructions for writing an entry, including how to edit from a phone
and how to undo a mistake, are in JOURNAL.md.

## Changing the settings

`js/config.js` holds three things you may want to change one day:

    CONTRIBUTION      how much you put in each month, in US dollars
    CASH_RATE         interest earned on the idle cash reserve (0.04 = 4% a year)
    HIGH_WATER_MARK   fallback only

The all-time high is pulled live from Yahoo Finance every time someone loads
the page, so you never update it by hand. HIGH_WATER_MARK is only what shows
if Yahoo cannot be reached.

Both domains point at the same site, and trantofire.com redirects to
trantofire.au so there is only ever one live version.

Interest is credited to the reserve monthly and counts as return, not as
money in, so it lifts the portfolio value without inflating your contributions.

## The Google Sheet

The site no longer reads it. Turn off publishing (File -> Share -> Publish to
web -> Stop publishing) and set sharing back to Restricted. Keep the file as a
private scratchpad if you like, but the site is the published record.

---

## If something breaks

The site went blank
  You probably missed a comma or used curly quotes in data.js.
  In GitHub, click the History of data.js and revert to the previous version.

An old version keeps showing
  Hard refresh: Ctrl+Shift+R, or Cmd+Shift+R on a Mac.

Everything else
  Netlify keeps every deploy. Deploys tab -> pick an older one ->
  Publish deploy. You are back in seconds.
