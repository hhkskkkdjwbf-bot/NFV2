# Phase 1 — quality scoring and execution boundaries

## What the automatic score measures

`src/services/linguisticQuality.ts` provides conservative, explainable checks:
- script-family compatibility (25 points of weight);
- text hygiene and Unicode control characters (15);
- a length-based readability proxy (10);
- duplicates in a supplied comparison batch (15);
- human naturalness rating (15);
- human category-fit rating (20).

The score is normalized over measured dimensions only. `coverage` reports the percentage of total weight actually measured. Pending dimensions are not silently treated as passing. Naturalness and category fit remain pending until a competent reviewer supplies ratings. Script mixing is a review signal, not an automatic rejection; Japanese Han/Hiragana/Katakana combinations are supported.

## Important limits

- This score is not a language model and does not prove grammaticality, cultural appropriateness, pronunciation, trademark availability, or semantic fit.
- The length score is only a heuristic proxy.
- A transliteration or borrowed name may be valid. The script detector therefore flags rather than rejects non-primary scripts.
- Category fit should be human-rated until generator-specific, language-reviewed validators exist.
- Do not bulk-add phrase-bank entries without traceable source, license/permission, language, region, and reviewer sign-off.

## Human review

The existing review artifact contains 840 rows (30 per language). It is a queue, not completed review. Qualified reviewers must fill naturalness, category fit, language fit, readability, issue notes, reviewer qualification, and date. No human review can be honestly claimed until these fields are completed and signed off.

## Test

Run `npx tsx src/tests/linguisticQuality.test.ts`. The test is also included in `npm test`.
