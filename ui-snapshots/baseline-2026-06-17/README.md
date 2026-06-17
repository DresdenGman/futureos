# UI Baseline Snapshot — baseline-v1

## What this is

A frozen, complete copy of the FutureOS frontend UI code at commit `ea2f876`.

## Purpose

- **Reference baseline** for comparing future UI changes
- **Rollback target** — every file here is a point-in-time copy of what the UI looked like on 2026-06-17
- **Design audit baseline** — diff against this snapshot to review what changed

## Scope

This snapshot covers:
- All pages (src/app/ page routes)
- All components (src/components/)
- Layouts (root layout + navbar)
- Styles (globals.css, tailwind.config.ts, postcss.config.mjs)

This snapshot does NOT cover:
- API routes (src/app/api/)
- Database schema (prisma/)
- Business logic (lib/)
- Tests
- Configuration files beyond styling

## Rules

- **DO NOT** modify files in this directory
- **DO NOT** delete this directory or its contents
- **DO NOT** commit UI changes without comparing against this baseline
- If you need to capture a new state, create a new snapshot directory (e.g., `baseline-2026-07-01/`)

## How to diff

```bash
# Compare current code against baseline
diff ui-snapshots/baseline-2026-06-17/pages/page.tsx src/app/page.tsx

# Compare entire component directory
diff -r ui-snapshots/baseline-2026-06-17/components/ src/components/
```

## File inventory

```
baseline-2026-06-17/
├── snapshot.json          # Structured metadata
├── README.md              # This file
├── pages/                 # 9 page files
│   ├── page.tsx           # Home (/)
│   ├── login.tsx          # Login (/login)
│   ├── create.tsx         # Create Forecast (/create)
│   ├── forecast-detail.tsx # Forecast Detail (/forecast/[id])
│   ├── forecast-loading.tsx
│   ├── forecast-not-found.tsx
│   ├── loading.tsx        # Global loading
│   ├── error.tsx          # Global error
│   └── not-found.tsx      # Global 404
├── components/            # 18 component files
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── label.tsx
│   ├── form.tsx
│   ├── alert.tsx
│   ├── separator.tsx
│   ├── skeleton.tsx
│   ├── loading-state.tsx
│   ├── error-state.tsx
│   ├── empty-state.tsx
│   ├── create-stepper.tsx
│   ├── settlement-card.tsx
│   ├── probability-card.tsx
│   └── evidence-card.tsx
├── layouts/               # 2 layout files
│   ├── layout.tsx
│   └── navbar.tsx
└── styles/                # 3 style/config files
    ├── globals.css
    ├── tailwind.config.ts
    └── postcss.config.mjs
```

## Snapshot metadata

See `snapshot.json` for structured metadata including routes, component inventory, and layout structure.
