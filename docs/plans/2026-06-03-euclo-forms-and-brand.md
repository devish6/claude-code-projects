# EuClo Forms & Brand Profile Picture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert two static print-only fit survey HTML files into digital fillable forms that submit to Google Sheets, host them on GitHub Pages for Linktree sharing, and generate an EuClo brand profile picture.

**Architecture:** Both HTML files are standalone vanilla HTML/CSS/JS — no build step, no dependencies. Static `.line` divs become real `<input>`/`<textarea>` elements; `.box` divs become `<input type="checkbox">` or `<input type="radio">`. A `fetch()` call with `Content-Type: text/plain` POSTs JSON to a Google Apps Script Web App URL (avoids CORS preflight), which appends a row to the correct tab in a Google Sheet.

**Tech Stack:** HTML5 form elements, vanilla JS `fetch()`, Google Apps Script, GitHub Pages, Higgsfield `gpt_image_2`

---

## Files

| File | Action |
|---|---|
| `fit-survey-measurement-sheet.html` | Modify — add input CSS, replace all `.line` divs with inputs, add submit JS |
| `fit-survey-interview-notes.html` | Modify — add input CSS, replace all `.line`/`.box` divs, add submit JS |
| `euclo-profile.png` | Create — generated brand profile picture |

---

## Task 1: Convert measurement sheet to digital fillable form

**Files:**
- Modify: `fit-survey-measurement-sheet.html`

- [ ] **Step 1: Add input field CSS to the `<style>` block**

  Add this entire block immediately before `@media print {`:

  ```css
  input[type="text"],
  input[type="number"],
  input[type="date"] {
    border: none;
    border-bottom: 1.5px solid #999;
    background: transparent;
    font-family: 'Georgia', serif;
    font-size: 13px;
    padding: 2px 0 4px 0;
    width: 100%;
    color: #1a1a1a;
    outline: none;
  }
  input[type="text"]:focus,
  input[type="number"]:focus,
  input[type="date"]:focus { border-bottom-color: #1a1a1a; }
  .measure-row input[type="number"] { width: 64px; text-align: right; }
  textarea {
    width: 100%;
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    font-family: 'Georgia', serif;
    font-size: 13px;
    padding: 4px 0;
    resize: vertical;
    color: #1a1a1a;
    outline: none;
    min-height: 52px;
  }
  textarea:focus { border-bottom-color: #1a1a1a; }
  .submit-btn {
    background: #1a1a1a;
    color: #fff;
    border: none;
    padding: 10px 28px;
    font-family: 'Georgia', serif;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 24px;
    display: block;
  }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-msg {
    display: none;
    color: #c0392b;
    font-size: 12px;
    margin-top: 8px;
    font-style: italic;
  }
  @media (max-width: 600px) {
    body { padding: 16px; }
    .meta-row { grid-template-columns: 1fr; }
    .measure-row { grid-template-columns: 1fr; gap: 4px; }
  }
  ```

- [ ] **Step 2: Convert Participant # line in header**

  Replace:
  ```html
  <div style="border-bottom:1.5px solid #999; width:60px; height:28px; margin-top:4px;"></div>
  ```
  With:
  ```html
  <input type="text" id="participant-num" name="participant_num" style="width:60px; margin-top:4px;" placeholder="01">
  ```

- [ ] **Step 3: Replace first meta row (Date / Age / Ethnicity)**

  Replace the first `<div class="meta-row">` block entirely:
  ```html
  <div class="meta-row">
    <div class="field">
      <label for="date">Date</label>
      <input type="date" id="date" name="date">
    </div>
    <div class="field">
      <label for="age">Age</label>
      <input type="number" id="age" name="age" min="16" max="80" placeholder="—">
    </div>
    <div class="field">
      <label for="ethnicity">Ethnicity / Background</label>
      <input type="text" id="ethnicity" name="ethnicity" placeholder="—">
    </div>
  </div>
  ```

- [ ] **Step 4: Replace second meta row (Heights / Clothing size)**

  Replace the second `<div class="meta-row">` block:
  ```html
  <div class="meta-row">
    <div class="field">
      <label for="height-reported">Height (self-reported)</label>
      <input type="text" id="height-reported" name="height_reported" placeholder="e.g. 5'4&quot;">
    </div>
    <div class="field">
      <label for="height-measured">Height (measured)</label>
      <input type="text" id="height-measured" name="height_measured" placeholder="—">
    </div>
    <div class="field">
      <label for="clothing-size">Usual clothing size</label>
      <input type="text" id="clothing-size" name="clothing_size" placeholder="e.g. XS, 0, 2">
    </div>
  </div>
  ```

- [ ] **Step 5: Replace consent signature and date**

  Replace the `<div class="consent-sign">` block:
  ```html
  <div class="consent-sign">
    <div class="field">
      <label for="signature">Signature</label>
      <input type="text" id="signature" name="signature" placeholder="Type full name">
    </div>
    <div class="field">
      <label for="consent-date">Date</label>
      <input type="date" id="consent-date" name="consent_date">
    </div>
  </div>
  ```

- [ ] **Step 6: Replace all 8 measurement rows**

  Replace the entire `<div style="margin-bottom: 28px;">` block that contains all 8 `.measure-row` elements:
  ```html
  <div style="margin-bottom: 28px;">

    <div class="measure-row">
      <div>
        <div class="measure-label">Bust</div>
        <div class="measure-note">Fullest point, tape parallel to floor</div>
      </div>
      <input type="number" id="bust" name="bust" step="0.25" min="0" max="100" placeholder="—">
      <div class="unit-label">in</div>
    </div>

    <div class="measure-row">
      <div>
        <div class="measure-label">Waist</div>
        <div class="measure-note">Natural waist (~1" above navel), tape snug not tight</div>
      </div>
      <input type="number" id="waist" name="waist" step="0.25" min="0" max="100" placeholder="—">
      <div class="unit-label">in</div>
    </div>

    <div class="measure-row">
      <div>
        <div class="measure-label">Hip</div>
        <div class="measure-note">Fullest point, usually 7–9" below natural waist</div>
      </div>
      <input type="number" id="hip" name="hip" step="0.25" min="0" max="100" placeholder="—">
      <div class="unit-label">in</div>
    </div>

    <div class="measure-row">
      <div>
        <div class="measure-label">Inseam</div>
        <div class="measure-note">Crotch to floor, standing, feet together</div>
      </div>
      <input type="number" id="inseam" name="inseam" step="0.25" min="0" max="60" placeholder="—">
      <div class="unit-label">in</div>
    </div>

    <div class="measure-row">
      <div>
        <div class="measure-label">Torso Length</div>
        <div class="measure-note">Nape of neck (base of skull) to natural waist</div>
      </div>
      <input type="number" id="torso" name="torso" step="0.25" min="0" max="60" placeholder="—">
      <div class="unit-label">in</div>
    </div>

    <div class="measure-row">
      <div>
        <div class="measure-label">Shoulder Width</div>
        <div class="measure-note">Shoulder point to shoulder point across back</div>
      </div>
      <input type="number" id="shoulder" name="shoulder" step="0.25" min="0" max="40" placeholder="—">
      <div class="unit-label">in</div>
    </div>

    <div class="measure-row">
      <div>
        <div class="measure-label">Arm Length</div>
        <div class="measure-note">Shoulder point to wrist, arm slightly bent</div>
      </div>
      <input type="number" id="arm" name="arm" step="0.25" min="0" max="40" placeholder="—">
      <div class="unit-label">in</div>
    </div>

    <div class="measure-row">
      <div>
        <div class="measure-label">Thigh Circumference</div>
        <div class="measure-note">Fullest point, 1" below crotch seam</div>
      </div>
      <input type="number" id="thigh" name="thigh" step="0.25" min="0" max="60" placeholder="—">
      <div class="unit-label">in</div>
    </div>

  </div>
  ```

- [ ] **Step 7: Replace fit notes lines with textarea**

  Replace the `<div class="notes-lines">` block:
  ```html
  <div class="notes-lines">
    <textarea id="fit-notes" name="fit_notes" rows="5" placeholder="Fit problems observed or mentioned during measurement. Note any asymmetry, posture, or unusual proportions."></textarea>
  </div>
  ```

- [ ] **Step 8: Update footer branding**

  Replace:
  ```html
  <span>Fit Survey · South Asian Sizing Research · Ontario, Canada</span>
  ```
  With:
  ```html
  <span>EuClo · Fit Survey · Ontario, Canada</span>
  ```

- [ ] **Step 9: Add submit button + JS before `</body>`**

  Add this entire block just before `</body>`:
  ```html
  <div id="form-actions" style="margin-top: 24px;">
    <button class="submit-btn" id="submit-btn" onclick="submitForm()">Submit to Sheet →</button>
    <div class="error-msg" id="error-msg">Something went wrong — please try again.</div>
  </div>

  <script>
  const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';

  function submitForm() {
    const btn = document.getElementById('submit-btn');
    const errMsg = document.getElementById('error-msg');
    errMsg.style.display = 'none';
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    const data = {
      form_type: 'measurement',
      participant_num: document.getElementById('participant-num').value,
      date: document.getElementById('date').value,
      age: document.getElementById('age').value,
      ethnicity: document.getElementById('ethnicity').value,
      height_reported: document.getElementById('height-reported').value,
      height_measured: document.getElementById('height-measured').value,
      clothing_size: document.getElementById('clothing-size').value,
      signature: document.getElementById('signature').value,
      consent_date: document.getElementById('consent-date').value,
      bust: document.getElementById('bust').value,
      waist: document.getElementById('waist').value,
      hip: document.getElementById('hip').value,
      inseam: document.getElementById('inseam').value,
      torso: document.getElementById('torso').value,
      shoulder: document.getElementById('shoulder').value,
      arm: document.getElementById('arm').value,
      thigh: document.getElementById('thigh').value,
      fit_notes: document.getElementById('fit-notes').value
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    })
    .then(() => {
      document.body.innerHTML = '<div style="text-align:center; padding:80px 32px; font-family:Georgia,serif;"><p style="font-size:18px; letter-spacing:0.04em;">Submitted.</p><p style="font-size:13px; color:#888; margin-top:8px;">Thank you.</p></div>';
    })
    .catch(() => {
      btn.textContent = 'Submit to Sheet →';
      btn.disabled = false;
      errMsg.style.display = 'block';
    });
  }
  </script>
  ```

- [ ] **Step 10: Manual test**

  ```bash
  open fit-survey-measurement-sheet.html
  ```
  Expected: all blank lines are now input fields, number inputs on measurement rows, submit button visible at bottom.

- [ ] **Step 11: Commit**

  ```bash
  git add fit-survey-measurement-sheet.html
  git commit -m "feat: convert measurement sheet to digital fillable form

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  ```

---

## Task 2: Convert interview notes to digital fillable form

**Files:**
- Modify: `fit-survey-interview-notes.html`

- [ ] **Step 1: Add input field CSS to the `<style>` block**

  Add this entire block immediately before `@media print {`:
  ```css
  input[type="text"],
  input[type="number"],
  input[type="date"] {
    border: none;
    border-bottom: 1.5px solid #999;
    background: transparent;
    font-family: 'Georgia', serif;
    font-size: 13px;
    padding: 2px 0 4px 0;
    width: 100%;
    color: #1a1a1a;
    outline: none;
  }
  input[type="text"]:focus,
  input[type="number"]:focus,
  input[type="date"]:focus { border-bottom-color: #1a1a1a; }
  textarea {
    width: 100%;
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    font-family: 'Georgia', serif;
    font-size: 13px;
    padding: 4px 0;
    resize: vertical;
    color: #1a1a1a;
    outline: none;
    min-height: 52px;
  }
  textarea:focus { border-bottom-color: #1a1a1a; }
  input[type="checkbox"],
  input[type="radio"] {
    accent-color: #1a1a1a;
    width: 13px;
    height: 13px;
    cursor: pointer;
    flex-shrink: 0;
    vertical-align: middle;
  }
  .tag { cursor: pointer; }
  .verdict-option { cursor: pointer; }
  .submit-btn {
    background: #1a1a1a;
    color: #fff;
    border: none;
    padding: 10px 28px;
    font-family: 'Georgia', serif;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 24px;
    display: block;
  }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-msg {
    display: none;
    color: #c0392b;
    font-size: 12px;
    margin-top: 8px;
    font-style: italic;
  }
  @media (max-width: 600px) {
    body { padding: 16px; }
    .meta-row { grid-template-columns: 1fr; }
  }
  ```

- [ ] **Step 2: Convert Participant # line in header**

  Replace:
  ```html
  <div style="border-bottom:1.5px solid #999; width:60px; height:28px; margin-top:4px;"></div>
  ```
  With:
  ```html
  <input type="text" id="participant-num" name="participant_num" style="width:60px; margin-top:4px;" placeholder="01">
  ```

- [ ] **Step 3: Replace first meta row (Date / Location / How recruited)**

  Replace the first `<div class="meta-row">`:
  ```html
  <div class="meta-row">
    <div class="field">
      <label for="date">Date</label>
      <input type="date" id="date" name="date">
    </div>
    <div class="field">
      <label for="location">Location</label>
      <input type="text" id="location" name="location" placeholder="—">
    </div>
    <div class="field">
      <label for="recruited">How recruited</label>
      <input type="text" id="recruited" name="recruited" placeholder="—">
    </div>
  </div>
  ```

- [ ] **Step 4: Replace second meta row (Age / Occupation / City)**

  Replace the second `<div class="meta-row">`:
  ```html
  <div class="meta-row">
    <div class="field">
      <label for="age">Age</label>
      <input type="number" id="age" name="age" min="16" max="80" placeholder="—">
    </div>
    <div class="field">
      <label for="occupation">Occupation</label>
      <input type="text" id="occupation" name="occupation" placeholder="—">
    </div>
    <div class="field">
      <label for="city">City / Neighbourhood</label>
      <input type="text" id="city" name="city" placeholder="—">
    </div>
  </div>
  ```

- [ ] **Step 5: Replace Q1 answer lines**

  Replace the `<div class="answer-lines">` inside the Q1 block:
  ```html
  <div class="answer-lines">
    <textarea id="q1" name="q1" rows="3" placeholder="Notes…"></textarea>
  </div>
  ```

- [ ] **Step 6: Replace Q2 answer lines**

  Replace the `<div class="answer-lines">` inside the Q2 block:
  ```html
  <div class="answer-lines">
    <textarea id="q2" name="q2" rows="3" placeholder="Notes…"></textarea>
  </div>
  ```

- [ ] **Step 7: Replace Q3 answer lines**

  Replace the `<div class="answer-lines">` inside the Q3 block:
  ```html
  <div class="answer-lines">
    <textarea id="q3" name="q3" rows="2" placeholder="Notes…"></textarea>
  </div>
  ```

- [ ] **Step 8: Replace Q4 answer lines + workaround checkboxes**

  Replace the `<div class="answer-lines">` inside Q4:
  ```html
  <div class="answer-lines">
    <textarea id="q4" name="q4" rows="2" placeholder="Notes…"></textarea>
  </div>
  ```

  Replace the Q4 `.tag-row`:
  ```html
  <div class="tag-row">
    <label class="tag"><input type="checkbox" name="workaround" value="custom_tailor"> Custom tailor</label>
    <label class="tag"><input type="checkbox" name="workaround" value="returns_frequently"> Returns frequently</label>
    <label class="tag"><input type="checkbox" name="workaround" value="lives_with_poor_fit"> Lives with poor fit</label>
    <label class="tag"><input type="checkbox" name="workaround" value="avoids_category"> Avoids category</label>
    <label class="tag"><input type="checkbox" name="workaround" value="buys_petite"> Buys petite line</label>
    <label class="tag"><input type="checkbox" name="workaround" value="orders_from_india"> Orders from India</label>
  </div>
  ```

- [ ] **Step 9: Replace Q5 answer lines + category checkboxes**

  Replace the `<div class="answer-lines">` inside Q5:
  ```html
  <div class="answer-lines">
    <textarea id="q5" name="q5" rows="2" placeholder="Notes…"></textarea>
  </div>
  ```

  Replace the Q5 `.tag-row`:
  ```html
  <div class="tag-row">
    <label class="tag"><input type="checkbox" name="category" value="jeans"> Jeans</label>
    <label class="tag"><input type="checkbox" name="category" value="blazers"> Blazers / Jackets</label>
    <label class="tag"><input type="checkbox" name="category" value="trousers"> Trousers</label>
    <label class="tag"><input type="checkbox" name="category" value="button_down"> Button-down shirts</label>
    <label class="tag"><input type="checkbox" name="category" value="dresses"> Dresses</label>
    <label class="tag"><input type="checkbox" name="category" value="other"> Other: <input type="text" name="category_other" style="width:80px; display:inline-block;"></label>
  </div>
  ```

- [ ] **Step 10: Replace Q6 answer lines**

  Replace the `<div class="answer-lines">` inside Q6:
  ```html
  <div class="answer-lines">
    <textarea id="q6" name="q6" rows="2" placeholder="Notes…"></textarea>
  </div>
  ```

- [ ] **Step 11: Replace Q7 answer lines**

  Replace the `<div class="answer-lines">` inside Q7:
  ```html
  <div class="answer-lines">
    <textarea id="q7" name="q7" rows="2" placeholder="Notes…"></textarea>
  </div>
  ```

- [ ] **Step 12: Replace The Closer answer lines (highlight-box)**

  Replace the `<div class="answer-lines">` inside `.highlight-box`:
  ```html
  <div class="answer-lines">
    <textarea id="closer" name="closer" rows="3" placeholder="Verbatim answer…"></textarea>
  </div>
  ```

- [ ] **Step 13: Replace "Would buy?" verdict options with radio buttons**

  Replace the first `.verdict` div (under "Would this person buy from this brand?"):
  ```html
  <div class="verdict">
    <label class="verdict-option"><input type="radio" name="verdict_buy" value="yes"> Yes — said so directly</label>
    <label class="verdict-option"><input type="radio" name="verdict_buy" value="maybe"> Maybe — interested, hesitant</label>
    <label class="verdict-option"><input type="radio" name="verdict_buy" value="no"> No — not the target customer</label>
  </div>
  ```

- [ ] **Step 14: Replace "Would refer?" verdict options with radio buttons**

  Replace the second `.verdict` div (under "Would they refer others or join a community?"):
  ```html
  <div class="verdict">
    <label class="verdict-option"><input type="radio" name="verdict_refer" value="yes"> Yes</label>
    <label class="verdict-option"><input type="radio" name="verdict_refer" value="maybe"> Maybe</label>
    <label class="verdict-option"><input type="radio" name="verdict_refer" value="no"> No</label>
  </div>
  ```

- [ ] **Step 15: Replace top complaint, memorable quote, and interviewer notes fields**

  Replace the "Top fit complaint" field:
  ```html
  <div class="field" style="margin-bottom:24px;">
    <label for="top-complaint">Top fit complaint — 5 words or fewer</label>
    <input type="text" id="top-complaint" name="top_complaint" placeholder="—">
  </div>
  ```

  Replace the "One memorable quote" field (two `.line` divs → one textarea):
  ```html
  <div class="field" style="margin-bottom:24px;">
    <label for="memorable-quote">One memorable quote from this session</label>
    <textarea id="memorable-quote" name="memorable_quote" rows="2" placeholder="—"></textarea>
  </div>
  ```

  Replace the "Interviewer notes" field (three `.line` divs → one textarea):
  ```html
  <div class="field">
    <label for="interviewer-notes">Interviewer notes / follow-up</label>
    <textarea id="interviewer-notes" name="interviewer_notes" rows="3" placeholder="—"></textarea>
  </div>
  ```

- [ ] **Step 16: Update footer branding**

  Replace:
  ```html
  <span>Fit Survey · South Asian Sizing Research · Ontario, Canada</span>
  ```
  With:
  ```html
  <span>EuClo · Fit Survey · Ontario, Canada</span>
  ```

- [ ] **Step 17: Add submit button + JS before `</body>`**

  Add this entire block just before `</body>`:
  ```html
  <div id="form-actions" style="margin-top: 24px;">
    <button class="submit-btn" id="submit-btn" onclick="submitForm()">Submit to Sheet →</button>
    <div class="error-msg" id="error-msg">Something went wrong — please try again.</div>
  </div>

  <script>
  const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';

  function getChecked(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
      .map(el => el.value).join(', ');
  }

  function submitForm() {
    const btn = document.getElementById('submit-btn');
    const errMsg = document.getElementById('error-msg');
    errMsg.style.display = 'none';
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    const data = {
      form_type: 'interview',
      participant_num: document.getElementById('participant-num').value,
      date: document.getElementById('date').value,
      location: document.getElementById('location').value,
      recruited: document.getElementById('recruited').value,
      age: document.getElementById('age').value,
      occupation: document.getElementById('occupation').value,
      city: document.getElementById('city').value,
      q1: document.getElementById('q1').value,
      q2: document.getElementById('q2').value,
      q3: document.getElementById('q3').value,
      q4: document.getElementById('q4').value,
      workarounds: getChecked('workaround'),
      q5: document.getElementById('q5').value,
      categories: getChecked('category'),
      category_other: document.querySelector('input[name="category_other"]').value,
      q6: document.getElementById('q6').value,
      q7: document.getElementById('q7').value,
      closer: document.getElementById('closer').value,
      verdict_buy: getChecked('verdict_buy'),
      verdict_refer: getChecked('verdict_refer'),
      top_complaint: document.getElementById('top-complaint').value,
      memorable_quote: document.getElementById('memorable-quote').value,
      interviewer_notes: document.getElementById('interviewer-notes').value
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    })
    .then(() => {
      document.body.innerHTML = '<div style="text-align:center; padding:80px 32px; font-family:Georgia,serif;"><p style="font-size:18px; letter-spacing:0.04em;">Submitted.</p><p style="font-size:13px; color:#888; margin-top:8px;">Thank you.</p></div>';
    })
    .catch(() => {
      btn.textContent = 'Submit to Sheet →';
      btn.disabled = false;
      errMsg.style.display = 'block';
    });
  }
  </script>
  ```

- [ ] **Step 18: Manual test**

  ```bash
  open fit-survey-interview-notes.html
  ```
  Expected: all answer lines are textareas, checkboxes clickable, radio buttons single-select, submit button visible.

- [ ] **Step 19: Commit**

  ```bash
  git add fit-survey-interview-notes.html
  git commit -m "feat: convert interview notes to digital fillable form

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  ```

---

## Task 3: Set up Google Apps Script

**Files:** None in repo — this runs inside Google Sheets.

- [ ] **Step 1: Create the Google Sheet**

  1. Go to [sheets.google.com](https://sheets.google.com)
  2. Create new spreadsheet → name it **EuClo Fit Survey**
  3. Rename the default "Sheet1" tab to `Measurements`
  4. Click `+` at the bottom → name the new tab `Interview Notes`

- [ ] **Step 2: Open Apps Script and paste the script**

  In the spreadsheet: **Extensions → Apps Script**

  Delete all default code. Paste exactly:
  ```javascript
  function doPost(e) {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.form_type === 'measurement' ? 'Measurements' : 'Interview Notes';
    var sheet = ss.getSheetByName(sheetName);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(Object.keys(data));
    }
    sheet.appendRow(Object.values(data));

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  ```

  Click the floppy disk icon (Save). Name the project **EuClo Fit Survey Script**.

- [ ] **Step 3: Deploy as Web App**

  1. Click **Deploy → New deployment**
  2. Click the gear icon next to "Select type" → choose **Web app**
  3. Set:
     - Execute as: **Me**
     - Who has access: **Anyone**
  4. Click **Deploy**
  5. Click through the Google authorization prompt (allow access to your spreadsheets)
  6. Copy the Web App URL — format: `https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

- [ ] **Step 4: Paste the URL into both HTML files**

  In `fit-survey-measurement-sheet.html`, replace:
  ```javascript
  const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
  ```
  With (your actual URL):
  ```javascript
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXXXXXX/exec';
  ```

  Do the same in `fit-survey-interview-notes.html`.

- [ ] **Step 5: End-to-end test**

  Open `fit-survey-measurement-sheet.html` locally. Fill in a few fields. Click **Submit to Sheet →**.

  Go to the Google Sheet → `Measurements` tab. Expected: row 1 has column headers, row 2 has your test data.

- [ ] **Step 6: Commit and push**

  ```bash
  git add fit-survey-measurement-sheet.html fit-survey-interview-notes.html
  git commit -m "feat: wire Google Apps Script URL into both forms

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  git push
  ```

---

## Task 4: Generate EuClo profile picture

- [ ] **Step 1: Invoke higgsfield-generate skill**

  Use the `higgsfield-generate` skill with model `gpt_image_2` and this prompt:
  ```
  A square brand profile picture for a fashion label called EUCLO.
  Off-white cream background (#F4F1EC).
  A small minimalist geometric mark at the top — a square framing a smaller inner square — in dark charcoal (#1a1a1a).
  Below it, the word EUCLO in uppercase elegant serif font, wide letter-spacing, dark charcoal.
  Below that, small text reading "Est. Ontario · Sized for South Asia" in spaced small caps, grey (#888).
  Minimal, editorial fashion label aesthetic. No photography, no people. Pure typography and geometry.
  Square format, suitable as a social media profile picture.
  ```

- [ ] **Step 2: Save image as `euclo-profile.png` in the project root**

- [ ] **Step 3: Commit and push**

  ```bash
  git add euclo-profile.png
  git commit -m "feat: add EuClo brand profile picture

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  git push
  ```

---

## Task 5: Enable GitHub Pages + add Linktree links

- [ ] **Step 1: Enable GitHub Pages** *(user does this in browser)*

  1. Go to `github.com/devish6/claude-code-projects`
  2. **Settings → Pages**
  3. Source: **Deploy from a branch**
  4. Branch: `main` → Folder: `/ (root)` → **Save**
  5. Wait ~60 seconds for Pages to build

- [ ] **Step 2: Verify both forms load**

  Visit in browser:
  - `https://devish6.github.io/claude-code-projects/fit-survey-measurement-sheet.html`
  - `https://devish6.github.io/claude-code-projects/fit-survey-interview-notes.html`

  Expected: forms load with input fields, submit button visible, no broken styles.

- [ ] **Step 3: Add links on Linktree** *(user does this in browser)*

  Log into Linktree → **Add link** for each:
  - Title: `EuClo — Fit Survey (Measurements)` → URL: `https://devish6.github.io/claude-code-projects/fit-survey-measurement-sheet.html`
  - Title: `EuClo — Fit Survey (Interview Notes)` → URL: `https://devish6.github.io/claude-code-projects/fit-survey-interview-notes.html`
