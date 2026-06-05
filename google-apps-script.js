const SHEET_NAME = "Blessings";

function doPost(e) {
  const sheet = getBlessingsSheet();
  const data = parsePayload(e);

  sheet.appendRow([
    new Date(),
    data.couple || "",
    data.name || "",
    data.message || "",
    data.createdAt || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "Wedding Blessings" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getBlessingsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Received At", "Couple", "Name", "Blessing", "Guest Created At"]);
  }

  return sheet;
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}
