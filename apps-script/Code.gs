/**
 * MLBB Pendidikan Khas Negeri Johor — Pangkalan Data Google Sheet
 *
 * Sheet ini ialah SUMBER UTAMA. Semua user (daerah/host/admin) baca & tulis
 * ke Sheet yang sama supaya semua nampak data yang sama.
 *
 * Sheet ID: 1KFwkaFP1F956Hjv89UL-KiaFK_Bnme75jdbRsLGCpaA
 *
 * CARA PASANG:
 * 1. Buka Google Sheet di atas.
 * 2. Menu Extensions > Apps Script.
 * 3. Padam kod sedia ada, tampal SEMUA kod ini. Tekan Save.
 * 4. Deploy > New deployment > jenis "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Salin "Web app URL".
 * 6. Tampal URL itu dalam .env.local website:
 *      NEXT_PUBLIC_SHEET_SYNC_URL=https://script.google.com/macros/s/XXXX/exec
 *    (atau Environment Variable dalam Vercel).
 *
 * NOTA: Setiap kali awak ubah kod ini, kena Deploy > Manage deployments >
 *       Edit > Version: New version, supaya perubahan naik.
 */

var SHEET_ID = "1KFwkaFP1F956Hjv89UL-KiaFK_Bnme75jdbRsLGCpaA";
var STORE_SHEET = "_DATA";   // simpan keseluruhan state sebagai JSON
var LOCK_WAIT_MS = 10000;

/** GET = website minta data terkini dari Sheet */
function doGet() {
  var data = readStore();
  return json({ ok: true, store: data });
}

/** POST = website hantar state terkini untuk disimpan ke Sheet */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_WAIT_MS);
    var body = JSON.parse(e.postData.contents);
    var store = body.store || body; // sokong dua format
    writeStore(store);
    writeReadableTabs(store);
    return json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Simpanan JSON (sumber sebenar) ---------- */

function readStore() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(STORE_SHEET);
  if (!sh) return null;
  var val = sh.getRange("A1").getValue();
  if (!val) return null;
  try { return JSON.parse(val); } catch (e) { return null; }
}

function writeStore(store) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(STORE_SHEET);
  if (!sh) { sh = ss.insertSheet(STORE_SHEET); sh.hideSheet(); }
  sh.getRange("A1").setValue(JSON.stringify(store));
}

/* ---------- Tab mudah dibaca manusia (untuk awak lihat) ---------- */

function writeReadableTabs(store) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var teams = store.teams || [];
  var matches = store.matches || [];

  var t = sheetFor(ss, "Pasukan",
    ["Daerah","Kategori","Kumpulan","Nama Pasukan","Nama Sekolah","Pengurus","Telefon","Bil Peserta","Status"]);
  writeRows(t, teams.map(function(x){
    return [x.district,x.category,x.group,x.teamName,x.school||"",x.managerName||"",x.phone||"",
      (x.players||[]).length, x.registered?"Disahkan":"Belum"];
  }));

  var p = sheetFor(ss, "Peserta",
    ["Daerah","Kategori","Nama Penuh","IGN","ID"]);
  var prows = [];
  teams.forEach(function(x){ (x.players||[]).forEach(function(pl){
    prows.push([x.district,x.category,pl.fullName||"",pl.ign||"",pl.mlId||""]);
  });});
  writeRows(p, prows);

  var m = sheetFor(ss, "Keputusan",
    ["Match ID","Kategori","Kumpulan","Pasukan A","Pasukan B","Pemenang","Status","Catatan"]);
  writeRows(m, matches.map(function(x){
    return [x.matchId,x.category,x.group,x.teamA,x.teamB,x.winner||"",x.status,x.note||""];
  }));
}

function sheetFor(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight("bold");
  sh.setFrozenRows(1);
  return sh;
}
function writeRows(sh, rows) {
  if (rows.length) sh.getRange(2,1,rows.length,rows[0].length).setValues(rows);
}
