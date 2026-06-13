# Environment Readiness Checklist

This checklist must be completed before Beta manual acceptance testing can proceed. The automated checks (lint, typecheck, build, test, smoke) all pass, but the full end-to-end prediction flow requires a live environment.

---

## Required for Full Beta Validation

| Variable | Purpose | How to Obtain |
|----------|---------|---------------|
| PostgreSQL | Persistence layer | Install locally or use a hosted service (Supabase, Neon, Railway) |
| `DATABASE_URL` | Connection string | Provided by your PostgreSQL host |
| `DEEPSEEK_API_KEY` | AI question structuring, evidence analysis, probability estimation | https://platform.deepseek.com |
| `TAVILY_API_KEY` | Web evidence search | https://tavily.com |
| `AUTH_SECRET` | Session cookie encryption | Generate: `openssl rand -base64 32` |

## Required for Auth / Permission Validation

| Variable | Purpose | How to Obtain |
|----------|---------|---------------|
| `AUTH_GITHUB_ID` | GitHub OAuth client ID | https://github.com/settings/developers |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret | https://github.com/settings/developers |
| GitHub OAuth Callback URL | Redirect after login | `http://localhost:3000/api/auth/callback/github` (local) or `https://your-domain.com/api/auth/callback/github` (production) |

## Optional

| Variable | Purpose | Default |
|----------|---------|---------|
| `AI_MODEL` | DeepSeek model to use | `deepseek-v4-flash` |
| `DEEPSEEK_BASE_URL` | DeepSeek API base URL | `https://api.deepseek.com/v1` |
| `AUTH_URL` | Canonical site URL | `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key (for future multi-provider support) | — |

---

## Local Setup Checklist

- [ ] Install PostgreSQL or provision a hosted Postgres database
- [ ] Create a database (e.g., `futureos`)
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all required variables in `.env`
- [ ] Run `npx prisma migrate dev` to apply migrations
- [ ] Run `npm run db:seed` to populate domains and sample data
- [ ] Run `npm run dev` to start the development server
- [ ] Run `npm run smoke` to verify the server is healthy
- [ ] Execute manual test cases from `docs/manual-test-cases.md`

### Quick Local Commands

```bash
# 1. Create .env from template
cp .env.example .env

# 2. Edit .env with real values
#    - DATABASE_URL
#    - DEEPSEEK_API_KEY
#    - TAVILY_API_KEY
#    - AUTH_SECRET
#    (GitHub OAuth is optional for MVP validation)

# 3. Setup database
npx prisma migrate dev
npm run db:seed

# 4. Start and verify
npm run dev
npm run smoke
```

---

## Hosted / Production Setup Checklist

- [ ] Create a production PostgreSQL database
- [ ] Configure all required environment variables in your hosting platform (Vercel, Railway, etc.)
- [ ] Run `npx prisma migrate deploy` to apply migrations to production
- [ ] Run `npm run db:seed` against the production database
- [ ] Configure GitHub OAuth App with the production callback URL
- [ ] Run smoke test against the production URL:
  ```bash
  SMOKE_BASE_URL=https://your-domain.com npm run smoke
  ```

---

## Verification Commands

After configuring the environment, run these to confirm readiness:

```bash
# Validate environment variables
npm run typecheck

# Verify database connection
npx prisma migrate status

# Run all automated checks
npm run lint
npm run typecheck
npm run build
npm run test
npm run smoke
```

All 6 commands must pass with zero errors before starting manual acceptance testing.

---

## Notes

- **No real keys in this document.** Substitute placeholder values with your actual credentials.
- GitHub OAuth is **optional for MVP validation**. Anonymous prediction flow can be tested without it. Permission-related tests (steps 11-14 in manual-test-cases.md) require OAuth.
- If using a free-tier hosted PostgreSQL, check the connection limit before running parallel tests.
- The `smoke` script points to `http://localhost:3000` by default. Override with `SMOKE_BASE_URL` for production testing.
