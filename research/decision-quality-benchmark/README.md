# FutureOS Decision Quality Benchmark v0.1

This is a small, deterministic benchmark for four mathematical mechanisms used by FutureOS:

1. expected utility;
2. Bayesian revision;
3. binary Brier scoring;
4. explicit option value.

The benchmark contains 24 synthetic cases—six per task type. Every case exposes its inputs, answer, and explanation so that the method is inspectable and reproducible.

## Claim boundary

Passing this benchmark shows that an implementation reproduces the declared calculations on these cases. It does **not** show that FutureOS improves human judgment, reduces hindsight bias, or generalizes to consequential real-world decisions.

## Files

- Public dataset: `public/research/decision-quality-benchmark-v0.1.json`
- Baseline predictions: `research/decision-quality-benchmark/predictions.baseline.json`
- Reference predictions: `research/decision-quality-benchmark/predictions.reference.json`
- Scorer: `scripts/score-decision-quality-benchmark.mjs`

## Run

From `sites-app`:

```bash
npm run benchmark:decision-quality
```

To score another prediction file:

```bash
npm run benchmark:decision-quality -- path/to/predictions.json
```

The prediction format is:

```json
{
  "benchmark_version": "0.1.0",
  "predictions": [
    { "id": "eu-01", "value": "pilot" },
    { "id": "bayes-01", "value": 0.631579 }
  ]
}
```

## Baseline

The included baseline intentionally models four common shortcuts:

- selecting the largest possible payoff instead of expected utility;
- keeping the prior instead of applying Bayes’ rule;
- using absolute error instead of squared error for a Brier score;
- maximizing immediate value while ignoring preserved options.

It is a diagnostic baseline, not a claim about how real people decide.

## Versioning

- Patch: corrections that do not change intended difficulty.
- Minor: new cases or task types.
- Major: a changed scoring contract or construct definition.

Future releases should preserve earlier files rather than silently replacing them.

## License

The benchmark dataset is released under CC BY 4.0. Attribution: “FutureOS Decision Quality Benchmark, Dresden Goehner.”
