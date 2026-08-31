# FutureOS Longitudinal Decision-Memory Pilot

**Draft version:** 0.1

**Drafted:** 2026-08-31

**Registration status:** Not submitted

**Planned observation window:** 2026-09-07 through 2026-10-12

**Study type:** Exploratory, prospective product-method pilot

## Registration boundary

This document is a preregistration draft, not an approved study and not evidence of an outcome. Before collecting identifiable participant data or presenting findings as generalizable human-subject research, the founder will determine what adult supervision, institutional review, consent, parental permission, or competition documentation is required.

The first public pilot should avoid medical, legal, investment, crisis, disciplinary, and other high-stakes decisions.

## Research question

Can a versioned decision record make a small set of real decisions more resolvable, evidence-sensitive, and mathematically inspectable over repeated forecast → update → resolution cycles?

## Prior hypotheses

### H1 — Resolvability

Writing an observable outcome criterion and review date before acting will increase the share of eligible decisions that can later be resolved without redefining success.

- Primary measure: resolved eligible decisions / eligible decisions reaching their review date.
- Failure condition: participants repeatedly reach review dates but cannot resolve decisions using the original criterion.

### H2 — Evidence-linked updating

Writing a reversal trigger will increase the share of material belief updates that name the evidence responsible for the change.

- Primary measure: evidence-linked updates / all recorded probability updates.
- Failure condition: reversal triggers are recorded but later updates remain unsupported or overwrite the prior state.

### H3 — Calibration

Repeated resolved forecasts may improve within-person binary Brier score.

- Primary measure: each participant’s chronological sequence of binary Brier scores.
- Failure condition: scores remain flat or worsen after enough resolved forecasts to make a within-person description meaningful.
- Constraint: no population-level improvement claim will be made from a small, self-selected exploratory cohort.

## Design

### Phase A — Instrument clarity

Observe completion and abandonment of the no-login decision-quality and calibration instruments. Do not retain users’ free-text answers. Treat completion as evidence of usability only, not learning.

### Phase B — Consented longitudinal cohort

Prospectively recruit up to 10 participants who each have a real, low-risk decision with an observable review date. Ask participants to:

1. frame the decision and outcome criterion;
2. record an initial probability;
3. name a reversal trigger;
4. return when material evidence changes;
5. resolve the decision when the predeclared date or criterion arrives;
6. optionally provide a reflection in their own words.

The target is operational and not a power calculation.

## Inclusion rules

A decision is eligible when it:

- concerns the participant or a team they are authorized to represent;
- is not in an excluded high-stakes category;
- has at least two plausible actions;
- has an observable outcome criterion;
- has a review date within the pilot window or an explicitly documented later date;
- includes an initial forecast before the outcome is known.

## Exclusion rules

Exclude a record from calibration analysis when:

- its initial probability was entered after the outcome became known;
- its outcome is not binary and no binary resolution rule was predeclared;
- the outcome criterion was materially rewritten after observation without preserving the original;
- it is a demonstration or synthetic example;
- the participant withdraws permission for analysis.

Retain the count and reason for exclusions without retaining sensitive decision text.

## Outcomes

### Primary descriptive outcomes

- activation: participant creates one eligible real decision;
- return: participant records an update or resolution after the first session;
- resolvability: eligible records resolved using their original criterion;
- evidence linkage: updates naming a material evidence item;
- feedback-led release: a shipped change linked to observed behavior or participant feedback.

### Secondary descriptive outcomes

- time from frame to first update;
- time from frame to resolution;
- participant-reported clarity, captured in the participant’s own words;
- attrition at each funnel stage.

## Analysis plan

1. Report invited → activated → updated → resolved counts with denominators.
2. Report reasons for ineligibility, exclusion, and missing resolution.
3. Plot each participant’s Brier scores chronologically only after they have at least three resolved forecasts; do not average unrelated participants into a causal claim.
4. Report median and range for time-to-update and time-to-resolution when the denominator is nonzero.
5. List every feedback-led release with its triggering evidence.
6. Preserve null and negative findings.
7. Label all post-registration changes as deviations, with date and rationale.

No significance test is planned for this exploratory pilot. Any later confirmatory study requires a new preregistration and an appropriate sample-size rationale.

## Missing data

An unresolved record remains unresolved; it is not imputed as a success or failure. Report records not yet due separately from overdue, withdrawn, or lost-to-follow-up records.

## Stopping and reporting rules

- End the planned observation window on 2026-10-12.
- Do not stop early because initial results look favorable.
- Pause recruitment if a privacy, consent, or safety concern appears.
- Publish a learning report even if activation is zero or all hypotheses remain unsupported.

## Privacy and consent

- Keep raw participant content private by default.
- Use internal participant and decision IDs in analysis files.
- Do not publish quotes without explicit quote-level consent.
- Do not collect passwords, payment data, health data, legal details, or protected school records.
- Allow participants to withdraw from analysis.
- Publish only aggregate counts and consented excerpts.

## Planned public artifacts

- frozen preregistration or registration URL;
- versioned software release;
- Decision Quality Benchmark version used during the pilot;
- aggregate evidence ledger;
- final methods-and-limitations report;
- deviations log.

## Known limitations

- small convenience sample;
- founder-led recruitment and onboarding;
- self-selection;
- heterogeneous decision domains;
- possible reminder effects;
- short observation window;
- measurement changes during active product development.

## Before submission checklist

- [ ] Confirm founder eligibility and adult/institutional oversight requirements.
- [ ] Confirm consent and privacy language.
- [ ] Freeze the benchmark version.
- [ ] Confirm event definitions against the production implementation.
- [ ] Remove any private paths or participant identifiers.
- [ ] Review every target/result distinction.
- [ ] Submit before Phase B data collection or analysis begins.

## Official reference

OSF defines preregistration as a time-stamped, read-only study plan posted before data collection or analysis: https://help.osf.io/article/330-welcome-to-registrations
