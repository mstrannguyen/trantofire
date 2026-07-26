# Writing a journal entry

Everything below edits one file: `js/journal.js`.

You never type numbers into it. The price, tier, shares, spend and reserve
are pulled from `js/data.js` and appear in the card headline automatically.
You only write words.

---

## The shape of an entry

```js
  {
    month: "2026-08",
    title: "The first buy",
    body: [
      "First paragraph. This one shows on the card as the teaser.",
      "Second paragraph. Hidden until someone clicks read more.",
      "Third paragraph. Add as many as you like."
    ]
  },
```

Paste it inside the square brackets, under `window.TTF_JOURNAL = [`.

- **month** — year and month in quotes. Must match a month in `data.js`
  for the figures to appear.
- **title** — your headline. Shows under the auto-generated figures.
- **body** — an array of paragraphs. Each string is one paragraph.
  The first is always the teaser; the rest sit behind "read more".

Optional:

```js
    mood: "Quiet month",
```

Newest entries can go anywhere in the list. The site sorts by month itself.

---

## Method 1 — GitHub in a browser (recommended)

1. Go to **github.com** and open your `trantofire` repository
2. Click the **`js`** folder, then click **`journal.js`**
3. Click the **pencil icon**, top right of the file
4. Type your entry inside the square brackets
5. Scroll down, click **Commit changes**, then confirm

Live in about thirty seconds. Nothing to install, works on any computer.

---

## Method 2 — On your phone

Same as above. github.com works in a mobile browser, and the pencil icon
is in the same place. Fiddly for long entries, fine for a quick one.

Two things to watch on a phone:

- **Turn off smart punctuation** before typing quotes, or your phone will
  insert curly quotes and break the file. On iPhone: Settings → General →
  Keyboard → Smart Punctuation → off.
- Easier still: type the entry in a plain notes app first, then paste.

---

## Method 3 — GitHub's full editor

1. Open your repository on github.com
2. Press the **full stop key** ( . )

A complete code editor opens in the browser, no install. Better for long
entries: proper line numbers, and it highlights a missing comma before you
commit. Save with Ctrl+S, then use the source-control panel on the left to
commit.

---

## Method 4 — On your computer, then deploy

Only needed if you are not using GitHub.

1. Open `js/journal.js` in **Notepad** (Windows) or **TextEdit** (Mac)
2. On Mac, first do Format → **Make Plain Text**, or it will corrupt the file
3. Type your entry, save
4. Drag the `site` folder onto Netlify → Deploys

Do NOT use Word, Pages, or Google Docs. They replace straight quotes with
curly ones silently, and the file stops working.

---

## The two things that break it

**1. A missing comma.** Every entry ends with `},` — including the last one.

**2. Curly quotes.** The file needs `"` and not `"` or `"`. Word processors
and phone keyboards insert the curly kind automatically.

If the journal page goes blank, it is almost always one of these.

---

## How to check before you commit

The GitHub editor colours the file. If a whole block suddenly turns one
colour, a quote is unclosed. If the colours look normal, it will parse.

After committing, wait thirty seconds and load the page. If the entries
vanish, open the browser console (F12) and you will see the line number.

---

## How to undo a mistake

In GitHub, open `js/journal.js` and click **History**. Pick the version from
before your edit, then use the **⋯** menu → **Revert**. Back in seconds.

Or in Netlify: **Deploys** → click any earlier deploy → **Publish deploy**.

---

## Writing an apostrophe

Apostrophes inside a paragraph are fine:

```js
      "I didn't feel much about it either way."
```

That is a straight apostrophe and it will not break anything, because the
paragraph is wrapped in double quotes. Only the double quotes matter.

If you want a double quote inside a paragraph, put a backslash in front:

```js
      "He called it \"gambling with extra steps\", which is fair."
```
