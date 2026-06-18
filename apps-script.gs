/* =============================================================================
 *  Withdrawals web app  —  Google Apps Script
 * =============================================================================
 *  Stores ONE "amount withdrawn" number per friend and lets the website
 *  overwrite it. (The site itself is read-only; this is what writes back.)
 *  No API key involved.
 *
 *  SETUP (one time):
 *    1. Open your Google Sheet → Extensions → Apps Script.
 *    2. Delete any sample code, paste THIS whole file, and Save.
 *    3. Deploy → New deployment → type "Web app".
 *         - Execute as: Me
 *         - Who has access: Anyone
 *       Click Deploy, authorize when prompted, and COPY the Web app URL
 *       (it ends with /exec).
 *    4. Paste that URL into config.js → WITHDRAWALS.WEBAPP_URL, then push.
 *
 *  To change the code later: edit here → Deploy → Manage deployments →
 *  edit the existing one → Version: New version (keeps the same URL).
 * ===========================================================================*/

var SHEET_NAME = "Withdrawals";

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["Friend", "Withdrawn", "Updated"]);
  }
  return sh;
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var friend = String(body.friend || "").trim();
    var amount = Number(body.amount);

    if (!friend) return json({ ok: false, error: "Missing friend." });
    if (!isFinite(amount) || amount < 0) {
      return json({ ok: false, error: "Amount must be 0 or more." });
    }

    var sh = getSheet_();
    var data = sh.getDataRange().getValues();
    var key = friend.toLowerCase();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === key) { rowIndex = i + 1; break; }
    }
    if (rowIndex === -1) {
      sh.appendRow([friend, amount, new Date()]);   // first time for this friend
    } else {
      sh.getRange(rowIndex, 2).setValue(amount);     // overwrite existing value
      sh.getRange(rowIndex, 3).setValue(new Date());
    }

    return json({ ok: true, friend: friend, total: amount });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var sh = getSheet_();
  var data = sh.getDataRange().getValues();
  var totals = {};
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0]).trim();
    if (name) totals[name] = Number(data[i][1]) || 0;
  }
  return json({ ok: true, totals: totals });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
