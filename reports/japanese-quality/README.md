# Japanese quality validation

This directory documents three independent controls for the restricted experimental Anime romaji-to-katakana pipeline.

## 1. Conversion correctness

- Regression fixtures live in `src/data/japaneseKatakanaReference.ts`.
- Run `npm run test:japanese:conversion`.
- Fixtures cover common Hepburn-style inputs, moraic `n`, apostrophe disambiguation, gemination and contracted sounds.
- The fixtures are conversion examples, not an attested-name dictionary or a complete Japanese pronunciation lexicon.
- Ambiguous long-vowel romanizations are deliberately excluded unless their source spelling makes the intended length explicit.

## 2. Diversity

- Run `npm run audit:japanese:diversity`.
- The audit measures batches of 100, 500, 1,000 and 5,000 real seeded outputs.
- Exact normalized duplicates are counted separately from near-spelling similarity.
- Similarity uses Unicode code-point Levenshtein distance against a bounded window of the previous 25 outputs. It is a scalable diagnostic, not exhaustive all-pairs phonetic analysis.
- The JSON report and CSV sample are written to `artifacts/japanese-quality/`.

## 3. Naturalness and category fit

- Run `npm run review:japanese`.
- The script prepares a sample across every Anime archetype in the current data registry.
- A qualified Japanese reviewer must score naturalness, Japanese-language fit, category fit and readability from 1 to 5 and record cultural or unintended associations.
- Ratings remain blank until a human completes the review. Automated checks must never mark this control as passed.

## Interpretation

A conversion pass means only that a supported romanized input matched its expected Katakana fixture. A diversity result describes repetition and surface similarity. Neither result proves that a generated name is idiomatic, authentic, culturally appropriate or suitable for a character.

The general Japanese phonetic engine remains outside the scope of this experimental Anime pipeline.
