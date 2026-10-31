# NameForge — quality and linguistic review

The automated baseline covers 234 generators × 28 languages (6,552 scenarios). It measures output availability, duplicates, length and script-family signals. These metrics are diagnostic and do not certify linguistic quality.

## Human review

The GitHub Actions workflow now generates a balanced review package for all 28 supported languages:
- `artifacts/linguistic-human-review/review-queue-28-languages.csv`: 30 real generated names per language (840 rows total), with reviewer scoring columns.
- `artifacts/linguistic-human-review/README.md`: coverage and reviewer instructions.
- The package is uploaded with the `nameforge-generator-quality-baseline` workflow artifact.

The queue is selected from raw outputs across generators, prioritizing diversity of generator IDs and reproducible review signals. It is a targeted sample, not a full review of every generated output or all 6,552 generator-language scenarios.

## Rating rubric

Reviewers competent in the language score each item from 1 to 5 for naturalness, category fit, language correctness and readability, and record cultural, offensive, ambiguous or grammatical concerns. Do not review a language you do not know well. Japanese may legitimately mix Han, Hiragana and Katakana; a script signal is never itself a linguistic verdict.

## Completion status

**Human validation remains pending until qualified people review and sign off.** No human ratings or native-speaker approvals are fabricated or inferred from automated tests. Automated tests can find technical defects and prioritize review; they cannot reliably certify idiom, morphology, semantics or cultural suitability.
