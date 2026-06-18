# 🃏 TCG Inventory & Value Tracker

A static web app that reads a Google Sheet (one tab per friend) and shows each
friend's **cards in inventory**, **cards sold**, and **total sale value** — with
a searchable, sortable table. No backend, no build step. Hosts free on GitHub Pages.

## Files
- `index.html` — page shell
- `styles.css` — styling
- `app.js` — fetches the sheet and renders everything
- `config.js` — **the only file you normally edit** (IDs, key, column names)

---

## 1. Prepare your Google Sheet
- One **tab per friend** (the tab name becomes the friend's tab in the app).
- First row = headers. Recognized headers (case/spacing don't matter):
  `Product Name`, `Set`, `Card Number`, `Set Code`, `Inventory Date`,
  `Value Sold`, `Date Sold`, `Transaction Complete Date`.
- A card is counted as **Sold** when its `Date Sold` cell is filled in.
- Share the sheet: **Share → General access → "Anyone with the link" → Viewer.**
  (An API key can only read link-shared / public sheets.)

Copy the **Spreadsheet ID** from the URL:
`https://docs.google.com/spreadsheets/d/`**`THIS_LONG_ID`**`/edit`

## 2. Get a Google API key
1. Go to <https://console.cloud.google.com/> → create (or pick) a project.
2. **APIs & Services → Library →** search **"Google Sheets API" → Enable**.
3. **APIs & Services → Credentials → Create credentials → API key.**
4. Click the new key → **Edit**:
   - **API restrictions:** "Restrict key" → select **Google Sheets API**.
   - **Application restrictions:** "Websites (HTTP referrers)" → add your site,
     e.g. `https://YOURNAME.github.io/*` (and `http://localhost:*/*` for local testing).
5. Copy the key.

> The key will be visible in `config.js` on a public site. That's expected for
> this pattern — the referrer + API restrictions above are what keep it safe.

## 3. Configure
Open `config.js` and paste your `SPREADSHEET_ID` and `API_KEY`. Optionally:
- `HIDE_TABS` — tab names to ignore (e.g. a `Summary` tab).
- `INCLUDE_TABS` — if set, show *only* these tabs.
- `COLUMNS` — add aliases if your headers differ from the defaults.
- `SOLD_FIELD` — which column marks a card as sold (`dateSold` by default).

## 4. Run locally
Because the app uses `fetch`, open it through a tiny web server (not `file://`):
```bash
# from this folder
python -m http.server 8000
# then visit http://localhost:8000
```

## 5. Deploy to GitHub Pages
1. Create a GitHub repo and push these files.
2. Repo **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**,
   pick `main` / `root`, **Save**.
3. Your site appears at `https://YOURNAME.github.io/REPO/`.
4. Add that exact URL (with `/*`) to your API key's HTTP-referrer restrictions.

Share the link with your friends — it's read-only; edits happen in the sheet.

---

## Notes
- There's **no "current market value"** column in the schema, so "Total value" is
  the **sum of `Value Sold`** (realized sale value). Add a `Market Value` column
  and tell me if you want a live inventory valuation for unsold cards too.
- Want to try the look before wiring up Google? `config.js` ships with
  `USE_SAMPLE: true`, so opening the page shows fake friends/cards immediately.
  Set it to `false` after you've added your real `SPREADSHEET_ID` and `API_KEY`.
