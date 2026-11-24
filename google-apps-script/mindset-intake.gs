/**
 * FROG EMPIRE - Mindset Training intake
 *
 * Paste this whole file into Extensions > Apps Script inside the Google Sheet.
 * Then run setupSheet once, and deploy as a web app.
 *
 * This file is in a public repo. Never put emails, Sheet IDs, or passwords here.
 * Alert emails are stored privately in Project Settings > Script Properties:
 *   NOTIFY_EMAILS = one or more addresses separated by commas (blank = no alerts)
 */

const INTAKE_TAB = 'Intake';
const INTAKE_HEADERS = [
  'Timestamp', 'Athlete Name', 'Age', 'Weight', 'Grade', 'Years Wrestling',
  'Program Interest', 'Group Members', 'Parent Name', 'Parent Phone',
  'Parent Email', 'Notes', 'Status'
];
const STATUSES = ['New', 'Contacted', 'Enrolled', 'Not a fit'];
const PROGRAMS = ['PEAK', 'Individual Mindset', 'Group Mindset'];

const SESSION_TABS = ['PEAK Sessions', 'Individual Sessions', 'Group Sessions'];
const SESSION_HEADERS = ['Date', 'Athlete Name(s)', 'Session #', 'Notes', 'Next Steps'];

const ROSTER_TAB = 'Roster';
const ROSTER_HEADERS = ['Athlete', 'Program', 'Start Date', 'Sessions Logged', 'Last Seen'];

/* ------------------------------------------------------------------ */
/* Setup: safe to run more than once. It never deletes your data.      */
/* ------------------------------------------------------------------ */

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupIntake_(ss);
  SESSION_TABS.forEach(function (name) { setupSessionTab_(ss, name); });
  setupRoster_(ss);
}

function setupIntake_(ss) {
  const existing = ss.getSheetByName(INTAKE_TAB);
  const sheet = existing || ss.insertSheet(INTAKE_TAB);
  const headers = ensureHeaders_(sheet, INTAKE_HEADERS);
  if (!existing) {
    sheet.setColumnWidth(columnOf_(headers, 'Timestamp'), 150);
    sheet.setColumnWidth(columnOf_(headers, 'Parent Email'), 200);
    sheet.setColumnWidth(columnOf_(headers, 'Notes'), 300);
  }
  const rows = sheet.getMaxRows() - 1;
  if (rows > 0) {
    sheet.getRange(2, columnOf_(headers, 'Timestamp'), rows, 1).setNumberFormat('m/d/yyyy h:mm am/pm');
    sheet.getRange(2, columnOf_(headers, 'Status'), rows, 1).setDataValidation(listRule_(STATUSES));
  }
  return sheet;
}

function setupSessionTab_(ss, name) {
  const existing = ss.getSheetByName(name);
  const sheet = existing || ss.insertSheet(name);
  const headers = ensureHeaders_(sheet, SESSION_HEADERS);
  if (!existing) {
    sheet.setColumnWidth(columnOf_(headers, 'Athlete Name(s)'), 220);
    sheet.setColumnWidth(columnOf_(headers, 'Notes'), 360);
    sheet.setColumnWidth(columnOf_(headers, 'Next Steps'), 260);
  }
  const rows = sheet.getMaxRows() - 1;
  if (rows > 0) {
    const dates = sheet.getRange(2, columnOf_(headers, 'Date'), rows, 1);
    dates.setNumberFormat('m/d/yyyy');
    // Double-clicking a date cell opens a calendar picker.
    dates.setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());
    ['Notes', 'Next Steps'].forEach(function (h) {
      sheet.getRange(2, columnOf_(headers, h), rows, 1).setWrap(true);
    });
  }
}

function setupRoster_(ss) {
  const sheet = ss.getSheetByName(ROSTER_TAB) || ss.insertSheet(ROSTER_TAB);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ROSTER_HEADERS.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 3).setValues([ROSTER_HEADERS.slice(0, 3)]);
    // One formula in D1 fills both the Sessions Logged and Last Seen columns.
    sheet.getRange(1, 4).setFormula('=ROSTER_STATS(A:A, ' + SESSION_TABS.map(function (t) {
      return "'" + t + "'!A:B";
    }).join(', ') + ')');
    sheet.getRange(1, 4).setNote('Columns D and E fill in automatically. Please do not type in them.');
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 160);
  }
  sheet.setFrozenRows(1);
  const rows = sheet.getMaxRows() - 1;
  if (rows > 0) {
    sheet.getRange(2, 2, rows, 1).setDataValidation(listRule_(PROGRAMS));
    sheet.getRange(2, 3, rows, 1).setNumberFormat('m/d/yyyy');
    sheet.getRange(2, 5, rows, 1).setNumberFormat('m/d/yyyy');
  }
  return sheet;
}

/** Writes any missing headers, then returns the header row as it is now. */
function ensureHeaders_(sheet, wanted) {
  const lastCol = sheet.getLastColumn();
  const current = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];
  const missing = wanted.filter(function (h) { return current.indexOf(h) === -1; });
  if (missing.length) {
    const extra = current.length + missing.length - sheet.getMaxColumns();
    if (extra > 0) sheet.insertColumnsAfter(sheet.getMaxColumns(), extra);
    sheet.getRange(1, current.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold');
  }
  if (sheet.getFrozenRows() !== 1) sheet.setFrozenRows(1);
  return current.concat(missing);
}

function columnOf_(headers, name) {
  return headers.indexOf(name) + 1;
}

function listRule_(values) {
  return SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
}

/* ------------------------------------------------------------------ */
/* Web app: receives the website form                                  */
/* ------------------------------------------------------------------ */

/** Open the web app URL in a browser to check that it is live. */
function doGet() {
  return json_({ ok: true, message: 'Mindset intake is running.' });
}

function doPost(e) {
  try {
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return json_({ ok: false, error: 'Bad request' });
    }
    if (!data || typeof data !== 'object') return json_({ ok: false, error: 'Bad request' });

    // Honeypot: people never see this field, so only bots fill it in.
    if (clean_(data.confirm_topic, 200)) return json_({ ok: true });

    const lead = readLead_(data);
    const problem = validate_(lead);
    if (problem) return json_({ ok: false, error: problem });

    const isNew = saveLead_(lead, clean_(data.submissionId, 60));
    if (isNew) notify_(lead);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Server error' });
  }
}

function readLead_(d) {
  const program = clean_(d.program, 60);
  return {
    athleteName: clean_(d.athleteName, 100),
    age: clean_(d.age, 10),
    weight: clean_(d.weight, 10),
    grade: clean_(d.grade, 30),
    years: clean_(d.years, 10),
    program: program,
    groupMembers: program === 'Group Mindset' ? clean_(d.groupMembers, 500) : '',
    parentName: clean_(d.parentName, 100),
    parentPhone: clean_(d.parentPhone, 30),
    parentEmail: clean_(d.parentEmail, 150),
    notes: String(d.notes == null ? '' : d.notes).trim().slice(0, 3000)
  };
}

function clean_(value, max) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
}

function validate_(lead) {
  if (!lead.athleteName) return 'Athlete name is required';
  if (!inRange_(lead.age, 4, 99)) return 'Age must be a number';
  if (lead.weight && !inRange_(lead.weight, 20, 500)) return 'Weight must be a number';
  if (lead.years && !inRange_(lead.years, 0, 60)) return 'Years wrestling must be a number';
  if (PROGRAMS.indexOf(lead.program) === -1) return 'Please choose a program';
  if (!lead.parentName) return 'Parent/guardian name is required';
  if (!validPhone_(lead.parentPhone)) return 'Parent phone is not valid';
  if (!validEmail_(lead.parentEmail)) return 'Parent email is not valid';
  return '';
}

function inRange_(text, min, max) {
  return /^\d+(\.\d+)?$/.test(text) && Number(text) >= min && Number(text) <= max;
}

function validPhone_(phone) {
  if (!/^\+?[\d\s().-]+$/.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  if (phone.charAt(0) === '+') return digits.length >= 8 && digits.length <= 15;
  return digits.length === 10 || (digits.length === 11 && digits.charAt(0) === '1');
}

function validEmail_(email) {
  return /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/.test(email);
}

/** Saves the row. Returns false if this exact submission was already saved. */
function saveLead_(lead, submissionId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const cache = CacheService.getScriptCache();
    if (submissionId && cache.get('lead-' + submissionId)) return false;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INTAKE_TAB) || setupIntake_(ss);
    const headers = ensureHeaders_(sheet, INTAKE_HEADERS);
    const values = {
      'Timestamp': new Date(),
      'Athlete Name': text_(lead.athleteName),
      'Age': Number(lead.age),
      'Weight': lead.weight ? Number(lead.weight) : '',
      'Grade': text_(lead.grade),
      'Years Wrestling': lead.years ? Number(lead.years) : '',
      'Program Interest': lead.program,
      'Group Members': text_(lead.groupMembers),
      'Parent Name': text_(lead.parentName),
      'Parent Phone': text_(lead.parentPhone),
      'Parent Email': text_(lead.parentEmail),
      'Notes': text_(lead.notes),
      'Status': 'New'
    };
    // Matched by header name, so moving columns around will not break it.
    sheet.appendRow(headers.map(function (h) { return h in values ? values[h] : ''; }));
    const row = sheet.getLastRow();
    sheet.getRange(row, columnOf_(headers, 'Timestamp')).setNumberFormat('m/d/yyyy h:mm am/pm');
    sheet.getRange(row, columnOf_(headers, 'Status')).setDataValidation(listRule_(STATUSES));
    SpreadsheetApp.flush();

    if (submissionId) cache.put('lead-' + submissionId, '1', 21600);
    return true;
  } finally {
    lock.releaseLock();
  }
}

/**
 * The leading apostrophe tells Sheets "this is plain text" and is not shown.
 * It stops a visitor's text from running as a formula or turning into a date.
 */
function text_(value) {
  return value ? "'" + value : '';
}

/** Email alert. If it fails, the lead is still safely in the Sheet. */
function notify_(lead) {
  try {
    const to = (PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAILS') || '').trim();
    if (!to) return;
    MailApp.sendEmail({
      to: to,
      replyTo: lead.parentEmail,
      subject: 'New mindset lead: ' + lead.athleteName + ' (' + lead.program + ')',
      body: [
        'Athlete: ' + lead.athleteName + ', age ' + lead.age,
        'Program: ' + lead.program,
        'Parent/guardian: ' + lead.parentName,
        'Phone: ' + lead.parentPhone,
        'Email: ' + lead.parentEmail,
        '',
        'Full details: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
      ].join('\n')
    });
  } catch (err) {
    console.error('Alert email failed', err);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

/** Runs on its own: when a Status becomes "Enrolled", adds the athlete to Roster. */
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== INTAKE_TAB) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const statusCol = columnOf_(headers, 'Status');
  const nameCol = columnOf_(headers, 'Athlete Name');
  const programCol = columnOf_(headers, 'Program Interest');
  if (!statusCol || !nameCol || !programCol) return;
  if (statusCol < e.range.getColumn() || statusCol > e.range.getLastColumn()) return;

  const ss = e.source || SpreadsheetApp.getActiveSpreadsheet();
  for (let row = Math.max(2, e.range.getRow()); row <= e.range.getLastRow(); row++) {
    if (sheet.getRange(row, statusCol).getValue() !== 'Enrolled') continue;
    addToRoster_(ss,
      String(sheet.getRange(row, nameCol).getValue()),
      String(sheet.getRange(row, programCol).getValue()));
  }
}

function addToRoster_(ss, athlete, program) {
  if (!athlete.trim()) return;
  const sheet = ss.getSheetByName(ROSTER_TAB) || setupRoster_(ss);
  const rows = sheet.getRange(1, 1, sheet.getMaxRows(), 2).getValues();
  const already = rows.some(function (r) {
    return nameKey_(r[0]) === nameKey_(athlete) && r[1] === program;
  });
  if (already) return;

  // Look for the first empty Athlete cell (the auto columns make getLastRow unreliable).
  let row = rows.findIndex(function (r, i) { return i > 0 && !String(r[0]).trim(); }) + 1;
  if (row === 0) {
    sheet.insertRowAfter(sheet.getMaxRows());
    row = sheet.getMaxRows();
  }
  sheet.getRange(row, 1, 1, 3).setValues([[text_(athlete), program, new Date()]]);
  sheet.getRange(row, 3).setNumberFormat('m/d/yyyy');
  sheet.getRange(row, 5).setNumberFormat('m/d/yyyy');
}

/**
 * Counts sessions and finds the latest session date for each athlete.
 * Used by the formula in Roster!D1. Names must match the Roster spelling
 * (capital letters do not matter).
 * @customfunction
 */
function ROSTER_STATS(athletes, peak, individual, group) {
  const stats = {};
  [peak, individual, group].forEach(function (tab) {
    (Array.isArray(tab) ? tab : []).slice(1).forEach(function (r) {
      const seen = {};
      splitNames_(r[1]).forEach(function (key) {
        if (seen[key]) return;
        seen[key] = true;
        const s = stats[key] || (stats[key] = { count: 0, last: '' });
        s.count++;
        if (r[0] instanceof Date && (!s.last || r[0] > s.last)) s.last = r[0];
      });
    });
  });
  return athletes.map(function (r, i) {
    if (i === 0) return ['Sessions Logged', 'Last Seen'];
    const key = nameKey_(r[0]);
    if (!key) return ['', ''];
    const s = stats[key];
    return s ? [s.count, s.last] : [0, ''];
  });
}

/** "Sam Lee, Jo Park & Al Ruiz" -> three separate names. */
function splitNames_(value) {
  return String(value == null ? '' : value)
    .split(/[,;\/&\n]|\s+and\s+/i)
    .map(nameKey_)
    .filter(String);
}

function nameKey_(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().toLowerCase();
}
