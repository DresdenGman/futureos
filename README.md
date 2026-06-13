# FutureOS

**AI-powered probabilistic forecasting platform.**

FutureOS helps you transform vague questions about the future into verifiable prediction questions, gather evidence from the web, estimate probabilities, and track outcomes over time. Built with a focus on calibration, evidence, and verifiability — not fortune-telling.

## MVP Features

| Feature | Description |
|---------|-------------|
| **Question Structuring** | AI rewrites vague questions into verifiable binary (yes/no) predictions with clear resolution criteria and deadlines |
| **Evidence Search** | Searches the web via Tavily, then AI classifies results as supporting, opposing, or neutral evidence with credibility scores |
| **Probability Estimation** | AI estimates a calibrated probability (0–100%) with confidence level, key drivers, counter-arguments, and uncertainty factors |
| **Save & View** | Saves forecasts to PostgreSQL with full evidence trails and probability history |
| **Manual Settlement** | Mark forecasts as occurred / not occurred at deadline |
| **Brier Score** | Calculate calibration accuracy — lower score = better prediction |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| AI | Vercel AI SDK + OpenAI (GPT-4o-mini) |
| Search | Tavily Search API |
| Validation | Zod |
| Testing | Vitest + React Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)
- GitHub OAuth App (for login)
- OpenAI API key
- Tavily API key

### 1. Clone and install

```bash
git clone <repo-url> futureos
cd futureos
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — from GitHub OAuth App
- `OPENAI_API_KEY` — from platform.openai.com
- `TAVILY_API_KEY` — from tavily.com

### 3. Database setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed domain data
npm run db:seed
```

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `prisma:generate` | Regenerate Prisma client |
| `db:migrate` | Run Prisma migrations |
| `db:seed` | Seed domain data |
| `db:studio` | Open Prisma Studio (DB GUI) |

## Deployment

### Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Configure **Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` — your production PostgreSQL URL
   - `AUTH_SECRET` — generate a new secret
   - `AUTH_URL` — your production URL (e.g., `https://futureos.vercel.app`)
   - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth credentials (update callback URL to production domain)
   - `OPENAI_API_KEY` — your OpenAI key
   - `TAVILY_API_KEY` — your Tavily key
   - `AI_MODEL` — optional, defaults to `gpt-4o-mini`
4. **Before first deploy**, run migrations against your production database:
   ```bash
   npx prisma migrate deploy
   ```
5. Deploy — the `postinstall` script automatically runs `prisma generate`

> Note: Migrations are NOT run automatically during Vercel build. Run `npx prisma migrate deploy` manually against your production database before deploying.

### Database

Use a managed PostgreSQL provider:
- [Neon](https://neon.tech) — free tier available
- [Supabase](https://supabase.com) — free tier available
- [Railway](https://railway.app)

## Architecture

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── page.tsx            # Home page (recent forecasts)
│   ├── create/             # 3-step forecast creation flow
│   ├── forecast/[id]/      # Forecast detail + settlement
│   └── api/                # API routes
│       ├── ai/structure/   # Question structuring
│       ├── ai/evidence/    # Evidence search & analysis
│       ├── ai/probability/ # Probability estimation
│       ├── forecasts/      # Create + list forecasts
│       └── health/         # Health check
├── lib/
│   ├── ai/                 # AI pipeline modules
│   ├── auth/               # Auth utilities
│   ├── config/             # Env validation
│   ├── db.ts               # Prisma client singleton
│   ├── forecasts/          # Forecast save + settle logic
│   ├── scoring/            # Brier Score calculation
│   └── search/             # Tavily search client
└── components/             # UI components
    ├── ui/                 # shadcn/ui primitives
    ├── create/             # Create flow components
    ├── evidence/           # Evidence display cards
    ├── forecasts/          # Settlement card
    ├── probability/        # Probability display
    └── shared/             # Loading, Empty, Error states
```

## Current Limitations

- **Manual settlement only** — no automatic settlement at deadline
- **No settlement review/undo** — settlement cannot be reversed
- **No private forecasts** — all forecasts are publicly viewable
- **No edit/delete** — forecasts cannot be modified after creation
- **No user probability predictions** — only AI-generated probabilities
- **No leaderboards/comments/forecast square** — single-user focused MVP
- **No chart library** — probability history shown as a simple list

## Development Stages

| Stage | Feature | Status |
|-------|---------|--------|
| 1 | Project scaffolding, auth, database | ✅ |
| 2 | AI question structuring | ✅ |
| 3 | Evidence search & analysis | ✅ |
| 4 | Probability estimation | ✅ |
| 5 | Save forecasts to database | ✅ |
| 6 | Manual settlement + Brier Score | ✅ |
| 7 | UX polish & error states | ✅ |
| 8 | Permission & ownership | ✅ |
| 9 | Production readiness | ✅ |

## License

MIT
