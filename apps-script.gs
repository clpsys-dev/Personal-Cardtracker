/* =============================================================================
 *  Withdrawals web app  —  Google Apps Script
 * =============================================================================
 *  This lets the website record "money withdrawn" entries back into your
 *  spreadsheet (the site itself is read-only). No API key involved.
 *
 *  SETUP (one time):
 *    1. Open your Google Sheet → Extensions → Apps Script.
 *    2. Delete any sample code, paste THIS whole file, and Save.
 *    3. Deploy → New deployment → type "Web app".
 *         - Description: anything
 *         - Execute as: Me
 *         - Who has access: Anyone
 *       Click Deploy, authorize when prompted, and COPY the Web app URL
 *       (it ends with /exec).
 *    4. Paste that URL into config.js → WITHDRAWALS.WEBAPP_URL, then push.
 *
 *  To change the code later, edit here and Deploy → Manage deployments →
 *  edit the existing one → Version: New version (keeps the same URL).
 * ===========================================================================*/

var SHEET_NAME = "Withdrawals";

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var friend = String(body.friend || "").trim();
    var amount = Number(body.amount);
    var note = String(body.note || "").trim();

    if (!friend) return json({ ok: false, error: "Missing friend." });
    if (!isFinite(amount) || amount <= 0) {
      return json({ ok: false, error: "Amount must be a positive number." });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(["Timestamp", "Friend", "Amount", "Note"]);
    }
    sh.appendRow([new Date(), friend, amount, note]);

    return json({ ok: true, friend: friend, total: totalFor(sh, friend) });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  // Optional: return current withdrawn totals per friend as JSON.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  var totals = {};
  if (sh) {
    var data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var name = String(data[i][1]).trim();
      if (!name) continue;
      totals[name] = (totals[name] || 0) + (Number(data[i][2]) || 0);
    }
  }
  return json({ ok: true, totals: totals });
}

function totalFor(sh, friend) {
  var data = sh.getDataRange().getValues();
  var key = friend.toLowerCase();
  var total = 0;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === key) {
      total += Number(data[i][2]) || 0;
    }
  }
  return total;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
