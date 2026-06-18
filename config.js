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
  // false = read the real Google Sheet (no API key needed; sheet must be
  //         shared as "Anyone with the link can view").
  USE_SAMPLE: false,

  // ---- The sheet ----------------------------------------------------------
  SPREADSHEET_ID: "1s3VJIHGDOZSrwL0tDzmH0SsuDn4Z7LwahijQIttEWyA",

  // ---- Friends (one tab each) --------------------------------------------
  // name = the label shown on the tab; gid = the tab's id from its URL
  // (…/edit#gid=THIS_NUMBER). To add a friend later: open their tab in the
  // sheet, copy the gid from the URL, and add a line here.
  FRIENDS: [
    { name: "CLP",        gid: "1761858357" },
    { name: "Chaos",      gid: "0" },
    { name: "Ishmel",     gid: "696229348" },
    { name: "Mczbi",      gid: "1448113652" },
    { name: "Beau",       gid: "2082684462" },
    { name: "Slaycir",    gid: "795749473" },
    { name: "Midknight",  gid: "1642462824" },
    { name: "PlaidStorm", gid: "366805686" },
  ],

  // ---- Column mapping -----------------------------------------------------
  // The app matches your header row by these names (case-insensitive,
  // punctuation/spaces ignored). Add aliases if your headers differ.
  COLUMNS: {
    productName:   ["Product Name", "Product", "Card", "Card Name", "Name"],
    game:          ["Game", "TCG", "Category"],
    set:           ["Set", "Set Name"],
    cardNumber:    ["Product Number", "Card Number", "Card #", "Number", "No", "No."],
    setCode:       ["Set Code", "Code"],
    inventoryDate: ["Inventory Date", "Date In", "Acquired", "Date Added"],
    valueSold:     ["Value Sold", "Sold Value", "Sale Price", "Sold Price", "Sold For", "Price"],
    dateSold:      ["Sold Date", "Date Sold", "Sale Date"],
    txnComplete:   ["Transcation Complete", "Transaction Complete Date", "Transaction Complete", "Completed", "Complete Date"],
  },

  // A row counts as SOLD if this field has a value. Choose "dateSold" or
  // "valueSold" or "txnComplete".
  SOLD_FIELD: "dateSold",

  // Currency formatting
  CURRENCY: "USD",
  LOCALE: "en-US",

  // ---- Sample data (used only when USE_SAMPLE is true) --------------------
  // Each key is a friend (tab); rows mirror the real column order:
  // [Product Name, Game, Set, Product Number, Inventory Date, Value Sold, Sold Date, Transcation Complete]
  SAMPLE: {
    Alex: [
      ["Charizard ex", "Pokemon", "Obsidian Flames", "125", "2025-01-12", "", "", ""],
      ["Pikachu VMAX", "Pokemon", "Vivid Voltage", "044", "2025-02-03", "180.00", "2025-05-20", "2025-05-22"],
      ["Booster Box", "Pokemon", "Surging Sparks", "—", "2025-03-01", "", "", ""],
      ["Mew ex", "Pokemon", "151", "151", "2025-03-18", "42.50", "2025-06-01", "2025-06-03"],
      ["Iono", "Pokemon", "Paldea Evolved", "185", "2025-04-02", "", "", ""],
    ],
    Sam: [
      ["Black Lotus", "Magic", "Alpha", "—", "2025-01-05", "", "", ""],
      ["Lightning Bolt", "Magic", "Modern Horizons 2", "121", "2025-02-10", "3.25", "2025-04-15", "2025-04-16"],
      ["Booster Pack", "Magic", "Bloomburrow", "—", "2025-03-22", "5.00", "2025-05-30", "2025-06-02"],
      ["Sheoldred", "Magic", "Dominaria United", "107", "2025-04-11", "", "", ""],
    ],
    Jordan: [
      ["Blue-Eyes White Dragon", "Yu-Gi-Oh", "LOB", "001", "2025-01-20", "120.00", "2025-03-12", "2025-03-15"],
      ["Dark Magician", "Yu-Gi-Oh", "LOB", "005", "2025-02-14", "", "", ""],
      ["Zephyrmon", "Digimon", "BT7", "BT7-036", "2025-03-30", "", "", ""],
    ],
  },
};
