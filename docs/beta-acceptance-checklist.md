# Beta Acceptance Checklist

Use this checklist before tagging a beta release.

## Environment Preparation

- [ ] PostgreSQL database is provisioned and accessible
- [ ] `DATABASE_URL` set in `.env`
- [ ] `OPENAI_API_KEY` set in `.env`
- [ ] `TAVILY_API_KEY` set in `.env`
- [ ] `AUTH_SECRET` set in `.env`
- [ ] `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` set (login-dependent)
- [ ] Node.js 18+ installed
- [ ] `npm install` completed without errors

## Database

- [ ] `npx prisma migrate dev --name init` succeeds
- [ ] `npm run db:seed` succeeds (5 domains seeded)
- [ ] `npx prisma studio` opens and shows tables
- [ ] Tables: Account, Session, User, VerificationToken, Domain, Forecast, Evidence, ProbabilityHistory

## Build & Quality

- [ ] `npm run build` passes (no errors)
- [ ] `npm run lint` passes (0 warnings)
- [ ] `npm run typecheck` passes (no errors)
- [ ] `npm run test` passes (all tests green)
- [ ] `npx prisma format` passes
- [ ] `npx prisma generate` passes

## Create Forecast Flow (Happy Path)

- [ ] Home page loads at `http://localhost:3000`
- [ ] "Start a Forecast" button navigates to `/create`
- [ ] Step indicator shows 4 steps
- [ ] Enter a question and select a domain
- [ ] "Structure Question" returns a structured question
- [ ] Structured result shows: question, type, deadline, criteria
- [ ] "Confirm and Gather Evidence" calls evidence API
- [ ] Evidence cards appear with SUPPORT/OPPOSE/NEUTRAL directions
- [ ] "Continue to Probability Estimate" calls probability API
- [ ] Probability percentage shows (e.g., 64%)
- [ ] Key drivers and counter arguments displayed
- [ ] "Save Forecast Draft" succeeds
- [ ] Redirected to `/forecast/[id]`

## Forecast Detail Page

- [ ] Detail page shows title + status badge
- [ ] Domain, deadline, creator/Anonymous shown
- [ ] Probability displayed as percentage (e.g., 64%)
- [ ] Resolution criteria displayed
- [ ] Evidence cards listed
- [ ] Probability history entry shown
- [ ] Original question shown (if provided)
- [ ] Limitations listed (if any)

## Manual Settlement

- [ ] Settlement card appears at bottom of detail page
- [ ] Creator sees "Mark as Occurred" / "Mark as Not Occurred" buttons
- [ ] Non-creator sees "Only the creator can settle" message
- [ ] Anonymous forecast shows settlement buttons + warning
- [ ] Settlement updates status to SETTLED
- [ ] Outcome displayed (green check / red X)
- [ ] Brier Score displayed with interpretation text
- [ ] Settled forecast cannot be re-settled (409 error)

## Permission Tests

- [ ] Creator can settle their own forecast
- [ ] Non-creator sees 403 error when attempting API settlement
- [ ] Unauthenticated user sees 401 error for owned forecast
- [ ] Anonymous forecast allows settlement
- [ ] Home page shows creator name or "Anonymous"

## Error Pages

- [ ] `http://localhost:3000/nonexistent` shows 404 page with "Back to Home"
- [ ] `http://localhost:3000/forecast/invalid-id` shows "Forecast Not Found"
- [ ] Error page (if triggered) shows "Try Again" and "Back to Home"
- [ ] Loading pages show spinner with descriptive text

## API Health

- [ ] `GET /api/health` returns `{ ok: true, service: "futureos", timestamp }`
- [ ] API health is static (no database dependency)

## API Error Handling

- [ ] Missing API key returns clear error (503)
- [ ] Invalid input returns 400 with descriptive message
- [ ] Missing required fields returns 400

## Vercel Deployment

- [ ] All required env vars configured in Vercel dashboard
- [ ] Production database migrated (`prisma migrate deploy`)
- [ ] `AUTH_URL` set to production domain
- [ ] GitHub OAuth callback URL updated
- [ ] Build succeeds on Vercel

## Known Limitations

- No automatic settlement at deadline
- No settlement review or undo
- No private forecasts (all publicly viewable)
- No forecast edit or delete
- No user probability predictions
- No leaderboards, comments, or forecast square
- No pagination or search
- No chart library

## Beta Go / No-Go Decision

- [ ] All critical path items above pass
- [ ] No blocking bugs in create → save → settle flow
- [ ] Build and tests are green
- [ ] Documentation is accurate

**Decision:**
- [ ] GO — proceed to beta release
- [ ] NO-GO — fix blocking issues before release
