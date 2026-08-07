# The monthly update

Ten minutes, once a month. Two buys, QLD and SSO. Only two files ever change:
`js/data.js` and `js/journal.js`. Everything else on the site is calculated from them.

---

## The one rule that keeps the record safe

**GitHub is the truth. Always start from GitHub, never from an old download.**

An assistant in a new chat has no access to your files and no memory of what
is in them. If you paste last month's zip, or describe the entry from memory,
you risk losing months of work. Download fresh every time and the problem
cannot happen.

---

## Each month

**1. Download the current site from GitHub**

On the repository page: the green **Code** button, then **Download ZIP**.
That zip is exactly what is deployed, including every entry you have ever
logged.

**2. Start a new chat and upload that zip**

Say what it is:

> Monthly update for October 2026. Current site attached.

**3. Send the buy details, for both funds**

There are two buys a month now: QLD and SSO. They go in two arrays in the
same file, `TTF_DATA` and `TTF_DATA_SSO`. For each one:

- the month
- the price the tier was measured against
- the price you were actually filled at, if it differed
- the date you placed the order
- the number of shares, only if it differed from what the rules said
- the brokerage, only if it was not $3

If you only bought one of them, say so. A missing month in one fund is fine;
the two are independent and neither waits for the other.

**4. Send the words for the journal**

Rough notes are fine. A title, what happened, how it felt, and what was going
on in the market and the wider economy that month. The macro section is not
decoration: the point of it is that in twenty years the entries read as a
record of what happened and what it did to the position, not just a column of
prices. The figures are pulled from `data.js` automatically, so never retype
a number into the journal.

**5. Check the confirmation before you accept the zip**

You should be told, before anything is written:

> Found N QLD entries and P SSO entries in data.js, and M in journal.js.
> Adding October 2026. Nothing else touched.

If N and M do not match what you expect, stop. Something is wrong with the
starting zip.

**6. Upload to GitHub**

Two ways, both fine:

- **Just the two files.** Open `js/data.js` on GitHub, click the pencil,
  paste the new contents, commit. Same for `js/journal.js`. Smallest blast
  radius, and the one to use if you have edited anything on GitHub since the
  zip was downloaded.
- **The whole folder.** On the repository page, **Add file → Upload files**,
  then drag the unzipped folder in. Uploading never deletes a file that is
  missing from the upload, so nothing is lost, but it will overwrite anything
  you changed on GitHub since you downloaded.

Netlify deploys on the commit. Check the site a minute later.

---

## What must never happen

- Rebuilding `data.js` or `journal.js` from scratch. New months are **added**
  to the existing arrays. Existing lines are never rewritten.
- Typing a figure into a journal entry that the engine already calculates.
- Editing a past month to make the record look better. If a past entry was
  wrong, correct it and say so in that month's entry.

---

## If something looks wrong on the live site

The Progress page recalculates everything from `data.js` on every load, so a
bad number is almost always a bad row rather than a broken site. Open the
browser console: a missing comma or a stray quote in either file will name
its own line number.
