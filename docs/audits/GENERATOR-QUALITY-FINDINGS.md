# Generator quality audit — baseline findings

## Scope

- 234 generators × 28 languages = **6,552 scenarios**
- **232,992** generated outputs in the recorded audit
- 3 deterministic seeds per scenario; 12 requested outputs per seed
- This is a structural/operational audit, not a human naturalness score.

## Findings

| Signal | Scenarios |
|---|---:|
| High cross-seed repetition (≥20%) | 987 |
| Curated phrase bank below 30 entries | 532 |
| Zero-output scenario | 10 |
| Scenarios with at least one signal | 997 |

The 10 zero-output scenarios are the baby-name generators for Japanese, Korean, Chinese, Russian, Hindi, Thai, Greek, Hebrew, Ukrainian and Bengali. This is intentional protection against presenting unattested or Latin-derived names as native. It remains a product-coverage gap.

The 532 undersized phrase-bank scenarios are 19 phrase-bank generators across 28 languages. Many banks contain only 10 entries; restaurant and tavern banks contain 20, and videogame banks contain 21. The 30-entry threshold is an expansion target, not a linguistic-quality verdict.

Cross-seed repetition measures catalogue overlap across independent seeded sessions. It is different from within-batch duplicate rate and does not mean the same user necessarily sees repeated names when persistent recent-history filtering is active.

## Controlled selector comparison

The paired comparison covered all 6,552 scenarios on the same input protocol. The operational/structural score changed from 96.321 to 96.449 (+0.128 points); structural diversity increased by about 1.59 points, while cross-seed overlap increased by about 1.24 percentage points. This is a mixed result, not proof of a broad quality improvement.

The operational score excludes semantic relevance, idiomatic naturalness, grammar, morphology, cultural suitability and legal/trademark conflicts. It must not be advertised as a linguistic quality score.

## Human review

A balanced review queue contains **840 samples**: 30 per language, with separate ratings for naturalness, category fit, language fit and readability, plus an issue flag and reviewer notes. Use the companion [human review guide](./LINGUISTIC-REVIEW-GUIDE.md). No human review has been completed by the automated audit.

## Priority order

1. Expand high-repeat phrase banks with native-reviewed content, not machine-filled padding.
2. Keep the ten native-script baby-name generators gated until sources and attestations are approved.
3. Tune procedural generators only where paired tests show improvements without reducing script compatibility.
4. Review the 840-sample queue with qualified reviewers; promote only approved language/category slices.
5. Re-run the identical baseline and paired comparison after each substantive change.
