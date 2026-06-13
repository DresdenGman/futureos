# Manual Test Cases

Test cases for verifying the FutureOS MVP core loop.

---

## A. Happy Path

### A1. Create and Settle a Forecast

**Preconditions:**
- PostgreSQL running, migration + seed applied
- OPENAI_API_KEY and TAVILY_API_KEY configured
- Dev server running at `http://localhost:3000`

**Steps:**
1. Open `http://localhost:3000`
2. Click "Start a Forecast"
3. Enter: "Will OpenAI release a new flagship model by December 2026?"
4. Select domain: Technology
5. Click "Structure Question"
6. Review structured question, deadline, resolution criteria
7. Click "Confirm and Gather Evidence"
8. Review evidence cards (SUPPORT/OPPOSE/NEUTRAL)
9. Click "Continue to Probability Estimate"
10. Review probability %, confidence, key drivers, counter arguments
11. Click "Save Forecast Draft"
12. Verify redirect to `/forecast/[id]`
13. Scroll to settlement card
14. Click "Mark as Occurred" and confirm
15. Verify outcome (green check), Brier Score, status "SETTLED"

**Expected Result:** Full flow completes without errors. Probability and Brier Score displayed.

**Notes:** If AI rate-limits, wait and retry. Evidence quality varies by Tavily results.

---

## B. API Error Path

### B1. OpenAI Key Missing

**Preconditions:** OPENAI_API_KEY removed from `.env`

**Steps:**
1. Visit `/create`
2. Enter a question and submit structure
3. Observe error message

**Expected Result:** Clear error: "AI service is not configured. Please set the OPENAI_API_KEY..."

### B2. Tavily Key Missing

**Preconditions:** TAVILY_API_KEY removed from `.env`, OpenAI key present

**Steps:**
1. Complete step A (structure question)
2. Click "Confirm and Gather Evidence"
3. Observe error message

**Expected Result:** Clear error: "Search service is not configured. Please set the TAVILY_API_KEY..."

### B3. Invalid Structure API Input

**Steps:**
1. Send `POST /api/ai/structure` with `{ originalQuestion: "", domain: "technology" }`
2. Observe response

**Expected Result:** 400, error: "Validation error: originalQuestion: Question cannot be empty"

### B4. Invalid Evidence API Input

**Steps:**
1. Send `POST /api/ai/evidence` with `{ structuredQuestion: "", domain: "" }`
2. Observe response

**Expected Result:** 400 with validation error details

### B5. Invalid Forecast Save API Input

**Steps:**
1. Send `POST /api/forecasts` with empty body or missing required fields
2. Observe response

**Expected Result:** 400 with descriptive validation error

### B6. Invalid Settle Outcome

**Steps:**
1. Send `POST /api/forecasts/[existing-id]/settle` with `{ outcome: "MAYBE" }`
2. Observe response

**Expected Result:** 400 with validation error

---

## C. Permission Path

### C1. Creator Settles Own Forecast

**Preconditions:** Logged in as user who created the forecast

**Steps:**
1. Open forecast detail page
2. Click "Mark as Occurred"
3. Confirm

**Expected Result:** Settlement succeeds. Status = SETTLED.

### C2. Unauthenticated User Cannot Settle

**Preconditions:** Forecast created by a logged-in user

**Steps:**
1. Open detail page in incognito/not logged in
2. Observe settlement card

**Expected Result:** "Sign in as the creator to settle this forecast" message. No settlement buttons.

### C3. Non-Creator Cannot Settle

**Preconditions:** Forecast created by user A; logged in as user B

**Steps:**
1. Open detail page as user B
2. Attempt API settlement via curl/fetch

**Expected Result:** 403 "Only the creator can settle this forecast."

### C4. Anonymous Forecast Settle

**Preconditions:** Forecast created without logging in (creatorId = null)

**Steps:**
1. Open detail page
2. Settlement buttons visible with "Anyone with the link can settle it" warning
3. Click "Mark as Occurred" and confirm

**Expected Result:** Settlement succeeds.

### C5. Duplicate Settlement Rejected

**Preconditions:** Forecast already settled

**Steps:**
1. Attempt to settle again via API

**Expected Result:** 409 "already been settled"

---

## D. UI State Path

### D1. Empty Home Page

**Preconditions:** No forecasts in database

**Steps:**
1. Open `http://localhost:3000`

**Expected Result:** EmptyState with "No forecasts yet" and "Start a Forecast" button.

### D2. Forecast 404

**Steps:**
1. Open `http://localhost:3000/forecast/nonexistent-id`

**Expected Result:** "Forecast Not Found" page with "Back to Home" and "Create a Forecast" links.

### D3. Global 404

**Steps:**
1. Open `http://localhost:3000/not-a-real-page`

**Expected Result:** 404 page with "Back to Home" button.

### D4. Loading States

**Steps:**
1. Visit `/create`
2. Click "Structure Question"
3. Observe spinner during API call

**Expected Result:** Button shows spinner + "Structuring..." text. Button is disabled.

### D5. Input Preservation on Error

**Steps:**
1. Visit `/create`
2. Enter a question
3. Trigger an API error (e.g., remove API key)
4. Observe form state

**Expected Result:** Question text remains in textarea. Domain selection preserved.

---

## E. Smoke Test

### E1. Health Check

**Steps:**
1. Run `npm run smoke` (or manual: `curl /api/health`)

**Expected Result:** `{ "ok": true, "service": "futureos", ... }`

### E2. Home Page

**Steps:**
1. `curl http://localhost:3000`

**Expected Result:** 200, HTML contains "FutureOS"

### E3. 404 Page

**Steps:**
1. `curl http://localhost:3000/nonexistent`

**Expected Result:** Returns HTML (404 page content)
