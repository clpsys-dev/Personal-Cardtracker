/* =============================================================================
 *  CONFIGURATION  —  edit this file, then refresh the page.
 * =============================================================================
 *  1. SPREADSHEET_ID  : the long id in your Google Sheet URL, e.g.
 *       https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
 *  2. API_KEY         : a Google Cloud API key restricted to the
 *                       "Google Sheets API" and to your site's referrer.
 *                       See README.md → "Getting your API key".
 *
 *  Remember: the sheet must be shared as "Anyone with the link can VIEW"
 *  for an API key to read it.
 * ===========================================================================*/

const CONFIG = {
  // ---- Preview mode -------------------------------------------------------
  // true  = show built-in fake data so you can see the UI with no setup.
  // false = read your real Google Sheet (set this once you've added your key).
  USE_SAMPLE: true,

  // ---- Required (when USE_SAMPLE is false) --------------------------------
  SPREADSHEET_ID: "PASTE_YOUR_SPREADSHEET_ID_HERE",
  API_KEY: "PASTE_YOUR_API_KEY_HERE",

  // ---- Optional: which tabs to show --------------------------------------
  // Leave both empty to show every tab as a friend.
  // To show only specific tabs, list their exact names in INCLUDE_TABS.
  // To hide helper tabs (e.g. a totals/summary sheet), list them in HIDE_TABS.
  INCLUDE_TABS: [],                 // e.g. ["Alex", "Sam", "Jordan"]
  HIDE_TABS: ["Summary", "Totals"], // tab names to never show as a friend

  // ---- Column mapping -----------------------------------------------------
  // The app matches your header row by these names (case-insensitive,
  // punctuation/spaces ignored). Add aliases if your headers differ.
  COLUMNS: {
    productName:   ["Product Name", "Product", "Card", "Card Name", "Name"],
    set:           ["Set", "Set Name"],
    cardNumber:    ["Card Number", "Card #", "Number", "No", "No."],
    setCode:       ["Set Code", "Code"],
    inventoryDate: ["Inventory Date", "Date In", "Acquired", "Date Added"],
    valueSold:     ["Value Sold", "Sold Value", "Sale Price", "Sold Price", "Sold For", "Price"],
    dateSold:      ["Date Sold", "Sold Date", "Sale Date"],
    txnComplete:   ["Transaction Complete Date", "Transaction Complete", "Completed", "Complete Date"],
  },

  // A row counts as SOLD if this field has a value. Choose "dateSold" or
  // "valueSold" or "txnComplete".
  SOLD_FIELD: "dateSold",

  // Currency formatting
  CURRENCY: "USD",
  LOCALE: "en-US",

  // ---- Sample data (used only when USE_SAMPLE is true) --------------------
  // Each key is a friend (tab); rows mirror the real column order:
  // [Product Name, Set, Card Number, Set Code, Inventory Date, Value Sold, Date Sold, Transaction Complete Date]
  SAMPLE: {
    Alex: [
      ["Charizard ex", "Obsidian Flames", "125", "OBF", "2025-01-12", "", "", ""],
      ["Pikachu VMAX", "Vivid Voltage", "044", "VIV", "2025-02-03", "180.00", "2025-05-20", "2025-05-22"],
      ["Booster Box", "Surging Sparks", "—", "SSP", "2025-03-01", "", "", ""],
      ["Mew ex", "151", "151", "MEW", "2025-03-18", "42.50", "2025-06-01", "2025-06-03"],
      ["Iono", "Paldea Evolved", "185", "PAL", "2025-04-02", "", "", ""],
    ],
    Sam: [
      ["Black Lotus (Proxy)", "Alpha", "—", "LEA", "2025-01-05", "", "", ""],
      ["Lightning Bolt", "Modern Horizons 2", "121", "MH2", "2025-02-10", "3.25", "2025-04-15", "2025-04-16"],
      ["Booster Pack", "Bloomburrow", "—", "BLB", "2025-03-22", "5.00", "2025-05-30", "2025-06-02"],
      ["Sheoldred", "Dominaria United", "107", "DMU", "2025-04-11", "", "", ""],
    ],
    Jordan: [
      ["Blue-Eyes White Dragon", "LOB", "001", "LOB", "2025-01-20", "120.00", "2025-03-12", "2025-03-15"],
      ["Dark Magician", "LOB", "005", "LOB", "2025-02-14", "", "", ""],
      ["Booster Box", "25th Anniversary", "—", "RA02", "2025-03-30", "", "", ""],
    ],
  },
};
