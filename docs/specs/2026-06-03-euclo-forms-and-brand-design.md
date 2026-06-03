# EuClo — Fillable Forms, Google Sheets Integration & Brand Profile Picture

**Date:** 2026-06-03  
**Status:** Approved

---

## Overview

Two deliverables:

1. Convert the existing static fit survey HTML files into digital fillable forms that submit to a Google Sheet, hosted on GitHub Pages and linked from Linktree.
2. Generate an EuClo brand profile picture (Option C aesthetic: off-white, geometric mark, serif wordmark).

---

## Section 1 — Updated Fillable Forms

### What changes

Both `fit-survey-measurement-sheet.html` and `fit-survey-interview-notes.html` are currently print-only documents. Every blank line is a `<div class="line">` and every checkbox is a `<div class="box">`. These get replaced with real form elements:

| Current element | Replaced with |
|---|---|
| `<div class="line">` (single-line field) | `<input type="text">` or `<input type="number">` or `<input type="date">` |
| `<div class="line">` (multi-line / notes) | `<textarea>` |
| `<div class="box">` (checkbox) | `<input type="checkbox">` |
| Verdict `.box` divs (single-select) | `<input type="radio">` |
| Participant # line in header | `<input type="text">` |

### Visual style preservation

- Keep all existing CSS (Georgia serif, `#f9f7f4` background, uppercase labels, `#1a1a1a` borders)
- Input fields: `border: none; border-bottom: 1.5px solid #999; background: transparent; font-family: Georgia, serif` — visually identical to the existing lines
- Checkboxes: styled with `accent-color: #1a1a1a`
- Textarea: `border: 1px solid #ddd; background: #fff; resize: vertical`
- Submit button: `background: #1a1a1a; color: #fff; font-family: Georgia, serif; letter-spacing: 0.1em; text-transform: uppercase`

### Mobile responsiveness

Add a `@media (max-width: 600px)` breakpoint:
- `.meta-row` grid → single column (`grid-template-columns: 1fr`)
- `.measure-row` grid → single column
- Body padding reduced to `16px`

### Footer branding

Update both footers from `Fit Survey · South Asian Sizing Research · Ontario, Canada` to `EuClo · Fit Survey · Ontario, Canada`.

### Submit behaviour

On button click:
1. Collect all field values into a JSON object
2. Add `form_type: "measurement"` (or `"interview"`) to route to correct sheet tab
3. `fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain' } })` — `text/plain` avoids CORS preflight; Apps Script still receives the body in `e.postData.contents`
4. On success: replace form with a thank-you message ("Submitted. Thank you.")
5. On error: show inline error ("Something went wrong — please try again.")
6. Button shows "Submitting…" while in-flight

---

## Section 2 — Google Apps Script Integration

### Google Sheet structure

One spreadsheet: **"EuClo Fit Survey"**  
Two tabs:
- `Measurements` — one row per measurement sheet submission
- `Interview Notes` — one row per interview notes submission

Column headers are auto-written on first submission if the sheet is empty.

### Apps Script

A single script deployed as a Web App (execute as owner, access: anyone).

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = data.form_type === 'measurement' ? 'Measurements' : 'Interview Notes';
  const sheet = ss.getSheetByName(sheetName);
  
  // Write headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(Object.keys(data));
  }
  sheet.appendRow(Object.values(data));
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({ 'Access-Control-Allow-Origin': '*' });
}
```

### One-time setup steps (for user)

1. Go to [sheets.google.com](https://sheets.google.com) → create new spreadsheet → name it **"EuClo Fit Survey"**
2. Create two tabs: rename "Sheet1" to `Measurements`, add a second tab named `Interview Notes`
3. Click **Extensions → Apps Script**
4. Delete the default code, paste the script above
5. Click **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click Deploy, copy the URL
6. In both HTML files, replace `YOUR_APPS_SCRIPT_URL` with the copied URL

---

## Section 3 — GitHub Pages Hosting

### Enabling Pages

1. Go to `github.com/devish6/claude-code-projects` → **Settings → Pages**
2. Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)` → Save

Pages builds within ~1 minute. Forms will be live at:
- `https://devish6.github.io/claude-code-projects/fit-survey-measurement-sheet.html`
- `https://devish6.github.io/claude-code-projects/fit-survey-interview-notes.html`

### Linktree

Add two link buttons on Linktree:
- "EuClo Fit Survey — Measurements" → measurement sheet URL
- "EuClo Fit Survey — Interview Notes" → interview notes URL

---

## Section 4 — EuClo Profile Picture

### Brand direction

Option C: Heritage & Symbol

- **Background:** Off-white / cream (`#F4F1EC`)
- **Mark:** Geometric square-within-square motif in `#1a1a1a`
- **Wordmark:** `EUCLO` in uppercase serif, letter-spacing 0.15em, `#1a1a1a`
- **Tagline:** `Est. Ontario · Sized for South Asia` — small caps, `#888`
- **Format:** Square (1:1), suitable for Linktree + Instagram profile picture

### Generation

Use Higgsfield `gpt_image_2` (image generation) with a detailed prompt describing the above. Output: PNG, square crop, high resolution.

---

## Out of Scope

- Backend data storage beyond Google Sheets (no database)
- User accounts or authentication
- Multi-page form wizard
- Email notifications on submission
- Analytics or tracking
