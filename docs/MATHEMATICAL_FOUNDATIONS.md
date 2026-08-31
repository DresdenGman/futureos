# Mathematical foundations

FutureOS uses applied mathematics to make reasoning inspectable. It does not claim that a formula can remove ambiguity, moral judgment, missing evidence, or model risk.

## 1. Expected utility

For an action `a`, possible state `s`, probability `p(s)`, and utility `u(a,s)`:

```text
EU(a) = Σ p(s) · u(a,s)
```

The product uses this idea to separate likelihood from consequence. A low-probability outcome can still matter when its impact is large. Monetary inputs are not treated as complete human utility.

## 2. Bayesian revision

For hypothesis `H` and evidence `E`:

```text
P(H|E) = P(E|H)P(H) / P(E)
```

FutureOS preserves probability updates so a user can see when a belief moved and what evidence was offered. The current interface records the revision history; a future research direction is to elicit likelihood ratios directly and test whether doing so improves forecast quality.

## 3. Calibration and the Brier score

For forecast probability `p` and binary outcome `o ∈ {0,1}`:

```text
Brier = (p - o)²
```

Across resolved decisions, FutureOS uses the mean Brier score. Lower is better: `0` is perfect and `1` is maximally wrong for a binary event. The interface maps this to a legible calibration indicator while retaining the underlying score.

The open calibration instrument uses a set of stable factual questions so confidence can be compared with correctness. A short instrument is educational, not a clinical or psychometric diagnosis.

## 4. Reversibility and option value

Some actions preserve more future choices than others. FutureOS models reversibility as a decision-quality input because experimentation, staged commitments, and exit paths can have real value under uncertainty.

The current decision score combines stated probability, a logarithmically scaled expected-value input, and reversibility:

```text
score = 0.58 · probability
      + 0.24 · scaledExpectedValue
      + 0.18 · reversibility
```

This is a transparent product heuristic, not a universally valid scientific estimator. Its weights should ultimately be evaluated against longitudinal user outcomes and revised when evidence warrants.

## 5. Research discipline

FutureOS separates three layers:

- **Measurement:** what the user stated before the outcome.
- **Model:** how the product transforms those inputs.
- **Judgment:** how the user interprets the result in context.

The product should never hide assumptions behind a single authoritative number. New models should document their variables, units, limits, and validation evidence.
