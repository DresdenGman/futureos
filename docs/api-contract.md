# API Contract

All APIs follow the same response envelope: `{ success: boolean, data? | error? }`.

---

## `POST /api/ai/structure`

**Purpose:** Transform a user's vague question into a verifiable binary forecast question.

**Request:**
```json
{
  "originalQuestion": "Will OpenAI release a new model in 2026?",
  "domain": "technology"
}
```

**Success (200):**
```json
{
  "success": true,
  "data": {
    "structuredQuestion": "Will OpenAI release a new flagship AI model before December 31, 2026?",
    "forecastType": "BINARY",
    "deadlineSuggestion": "2026-12-31",
    "resolutionCriteria": "Official announcement from OpenAI blog...",
    "requiredClarifications": [],
    "isForecastable": true
  }
}
```

**Errors:**
- `400` — Invalid input (empty question, empty domain, question > 500 chars)
- `503` — `OPENAI_API_KEY` not configured
- `500` — AI service error

**External services:** OpenAI (GPT-4o-mini or AI_MODEL)
**Writes database:** No
**Auth required:** No

---

## `POST /api/ai/evidence`

**Purpose:** Search for and classify evidence for/against a structured forecast question.

**Request:**
```json
{
  "structuredQuestion": "Will OpenAI release a new flagship AI model before December 31, 2026?",
  "domain": "technology",
  "deadlineSuggestion": "2026-12-31",
  "resolutionCriteria": "Official announcement from OpenAI blog..."
}
```

**Success (200):**
```json
{
  "success": true,
  "data": {
    "evidence": [
      {
        "title": "OpenAI hints at 2026 release",
        "url": "https://techcrunch.com/...",
        "source": "techcrunch.com",
        "publishedDate": "2026-05-01",
        "summary": "Sources indicate...",
        "direction": "SUPPORT",
        "credibility": "HIGH",
        "relevance": "HIGH",
        "reasoning": "Directly addresses release timeline"
      }
    ],
    "searchSummary": "Found X relevant results...",
    "limitations": ["Limited date range", "Some sources low credibility"]
  }
}
```

**Errors:**
- `400` — Invalid input (empty structuredQuestion or domain)
- `503` — `TAVILY_API_KEY` or `OPENAI_API_KEY` not configured
- `500` — Search or AI error

**External services:** Tavily Search + OpenAI
**Writes database:** No
**Auth required:** No

---

## `POST /api/ai/probability`

**Purpose:** Estimate a calibrated probability for a forecast based on collected evidence.

**Request:**
```json
{
  "structuredQuestion": "Will OpenAI release...?",
  "domain": "technology",
  "deadlineSuggestion": "2026-12-31",
  "resolutionCriteria": "Official announcement...",
  "evidence": [
    { "title": "...", "url": "https://...", "direction": "SUPPORT", ... }
  ],
  "limitations": ["Limited date range"]
}
```

**Success (200):**
```json
{
  "success": true,
  "data": {
    "probability": 0.64,
    "confidence": "MEDIUM",
    "summary": "Moderate likelihood based on mixed evidence.",
    "reasoning": "Supporting evidence shows active development...",
    "keyDrivers": ["Reported development activity", "Past release patterns"],
    "counterArguments": ["No official announcement", "Regulatory uncertainty"],
    "assumptions": ["Current development pace continues"],
    "uncertaintyFactors": ["Lack of official confirmation", "Supply chain risks"],
    "recommendedResolutionCriteria": "Official OpenAI blog post or press release"
  }
}
```

**Errors:**
- `400` — Invalid input (empty question, empty evidence array, probability out of range)
- `503` — `OPENAI_API_KEY` not configured
- `500` — AI service error

**External services:** OpenAI
**Writes database:** No
**Auth required:** No

---

## `POST /api/forecasts`

**Purpose:** Save a forecast draft to the database.

**Request:**
```json
{
  "structuredQuestion": "Will OpenAI release...?",
  "originalQuestion": "Will OpenAI release a new model?",
  "domain": "technology",
  "forecastType": "BINARY",
  "deadlineSuggestion": "2026-12-31",
  "resolutionCriteria": "Official announcement...",
  "probability": 0.64,
  "confidence": "MEDIUM",
  "probabilitySummary": "Moderate likelihood.",
  "probabilityReasoning": "Based on evidence.",
  "keyDrivers": ["Driver 1"],
  "counterArguments": ["Counter 1"],
  "assumptions": ["Assumption 1"],
  "uncertaintyFactors": ["Uncertainty 1"],
  "evidence": [
    { "title": "...", "url": "https://...", "direction": "SUPPORT", ... }
  ],
  "limitations": ["Limited date range"]
}
```

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "cm_xxxxxxxxxx"
  }
}
```

**Errors:**
- `400` — Invalid input (missing fields, empty evidence, probability out of range, domain not found)
- `500` — Database error

**External services:** None
**Writes database:** Yes (Forecast + Evidence + ProbabilityHistory via Prisma transaction)
**Auth required:** No (anonymous: creatorId = null; logged in: creatorId = user.id)

---

## `POST /api/forecasts/[id]/settle`

**Purpose:** Settle a forecast by marking the final outcome (occurred/not occurred). Calculates Brier Score.

**Request:**
```json
{
  "outcome": "YES"
}
```

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "cm_xxxxxxxxxx",
    "status": "SETTLED",
    "outcome": "YES",
    "resolvedAt": "2026-06-13T08:00:00.000Z",
    "brierScore": 0.1296
  }
}
```

**Errors:**
- `400` — Invalid outcome (not YES/NO)
- `401` — Unauthorized: forecast has a creator but user is not logged in
- `403` — Forbidden: current user is not the creator
- `404` — Forecast not found
- `409` — Forecast already settled
- `500` — Server error

**External services:** None
**Writes database:** Yes (updates Forecast: status, outcome, resolvedAt, brierScore, settlementResult)
**Auth required:** For forecasts with creatorId: yes (must be creator). Anonymous forecasts: no.

---

## `GET /api/health`

**Purpose:** Lightweight health check.

**Request:** `GET /api/health`

**Success (200):**
```json
{
  "ok": true,
  "service": "futureos",
  "timestamp": "2026-06-13T08:00:00.000Z"
}
```

**External services:** None
**Writes database:** No
**Auth required:** No

---

## Auth Routes (NextAuth)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/signin` | GET | Sign in page |
| `/api/auth/signout` | POST | Sign out |
| `/api/auth/callback/github` | GET | GitHub OAuth callback |
| `/api/auth/session` | GET | Get current session |

Auth provider: NextAuth v5 (GitHub OAuth).
