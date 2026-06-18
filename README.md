# 🃏 TCG Inventory & Value Tracker

A static web app that reads a public Google Sheet (one tab per friend) and shows
each friend's **cards in inventory**, **cards sold**, and **total sale value** —
with a searchable, sortable table. No backend, no API key, no build step.

**Live site:** https://clpsys-dev.github.io/Personal-Cardtracker/

## Files
- `index.html` — page shell
- `styles.css` — styling
- `app.js` — fetches each tab as CSV and renders everything
- `config.js` — **the only file you normally edit** (sheet id, friends, columns)

---

## How it reads the data
The sheet is shared as **"Anyone with the link can view,"** so the app reads each
tab directly from Google's public CSV endpoint
(`/gviz/tq?tqx=out:csv&gid=…`). No Google Cloud project or API key is involved.

Each **friend = one tab**, listed in `config.js` under `FRIENDS` as
`{ name, gid }`. The `gid` is the number in a tab's URL: open the tab in the
sheet and copy the digits after `#gid=`.

### Adding a new friend
1. Add their tab to the Google Sheet (same column headers).
2. Open that tab; copy the `gid` from the URL (`…/edit#gid=THIS_NUMBER`).
3. Add a line to `FRIENDS` in `config.js`, commit, and push (see below).

## Columns
Headers are matched by name (case/spacing-insensitive), so tabs can vary. The app
understands both layouts in use:
`Product Name`, `Game` **or** `Set Code`, `Set`, `Product Number` **or**
`Card Number`, `Inventory Date`, `Value Sold`, `Sold Date`. Add more aliases in
`config.js → COLUMNS` if a tab uses different wording.

- A card counts as **Sold** when its `Sold Date` is filled in (`SOLD_FIELD`).
- **In Inventory** = rows with no Sold Date. **Total Sale Value** = sum of `Value Sold`.
  (There's no market-value column for unsold cards; add one and ask if you want a
  live inventory valuation.)

## Preview without the real sheet
`config.js` has `USE_SAMPLE`. Set it to `true` to show built-in fake data, or
`false` (current) to read the real sheet.

## Run locally
The app uses `fetch`, so serve it over http (not `file://`):
```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Deploy / update the live site
This repo is already deployed via **GitHub Pages** (Settings → Pages → `main`/root).
To push changes:
```bash
cd "E:\Price and Inventory Tracker"
git add -A
git commit -m "Update tracker"
git push
```
The site rebuilds automatically in 1–2 minutes.
