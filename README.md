# FutureOS

**A decision operating system for people working under genuine uncertainty.**

[Live product](https://futureos.space) · [Open decision tools](https://futureos.space/tools) · [Privacy](https://futureos.space/privacy)

![FutureOS — Make the future answerable](public/og.png)

Most software stores what happened. FutureOS preserves the decision contract that existed **before** anyone knew the answer: what you believed, why you acted, what changed, and what reality eventually proved.

## The operating loop

1. **Frame** — turn an ambiguous choice into a question reality can answer.
2. **Forecast** — expose probability, value, downside, and reversibility before acting.
3. **Update** — let new evidence change the belief without erasing its history.
4. **Resolve** — separate process quality from luck and keep the lesson reusable.

## Why it is different

FutureOS treats a decision as a versioned object rather than a note or a chat transcript. Each record can retain a forecast, assumptions, evidence updates, an outcome, and a calibration signal. The goal is not to pretend uncertainty disappears; it is to make uncertainty inspectable and learning cumulative.

The product also includes two no-login public instruments:

- **Decision Quality Score** — a seven-dimension pre-mortem for a decision process.
- **Probability Calibration Test** — ten stable questions scored with the Brier rule.

Answers and scores for these open instruments are computed in the browser and are not stored.

## Applied mathematics

The mathematical layer is part of the product logic, not visual decoration:

- **Expected utility** compares actions across possible futures: `EU(a) = Σ p(s) · u(a,s)`.
- **Bayesian revision** makes belief changes accountable: `P(H|E) = P(E|H)P(H) / P(E)`.
- **Brier scoring** measures probabilistic accuracy: `(p − o)²`.
- **Option value** treats reversibility and preserved future choices as assets.

See [Mathematical foundations](docs/MATHEMATICAL_FOUNDATIONS.md) for the implemented models, design boundaries, and roadmap.

## Product surfaces

- Public editorial landing page and interactive demo
- Authenticated decision workspace
- Decision creation, evidence updates, resolution, and memory
- Decision map and aggregate insight views
- Anonymous, privacy-minimized usage measurement for open instruments
- Responsive layout, accessible focus states, metadata, sitemap, and security headers

## Technology

- React 19 + TypeScript
- Vinext + Vite
- Tailwind CSS
- Drizzle ORM + SQLite-compatible D1 storage
- Sites authentication (`Sign in with ChatGPT`)
- Zod validation and server-side ownership checks

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Then open the local URL printed by the development server. Authenticated and database-backed flows depend on a compatible Sites runtime; the landing page, demo, and open instruments can still be reviewed locally.

Quality checks:

```bash
npm run lint
npm run build
```

## Privacy and security

Decision records are scoped to the authenticated Sites user identifier, and server-side ownership checks protect reads and writes. Public-instrument answers, confidence values, and scores are not transmitted or stored. The measurement endpoint records only coarse source attribution and start/completion/share events using a rotating one-way visitor key.

Please read the live [privacy note](https://futureos.space/privacy) and report vulnerabilities according to [SECURITY.md](SECURITY.md). Do not submit sensitive personal decisions to a development environment.

## Project status

FutureOS is a working public product under active development. The current focus is validating whether versioned decision memory improves calibration and reduces hindsight bias over repeated real decisions. Roadmap claims are intentionally separated from implemented behavior.

Earlier forecasting prototypes remain preserved in the repository history and existing beta tags.

## Contributing

Constructive issues and small, testable pull requests are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](LICENSE).
