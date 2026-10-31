# Official corpus preproduction pipeline

The manually triggered workflow downloads the official INSEE national first-name archive and the US Social Security Administration national baby-name archive. It computes SHA-256 checksums, parses the archives, and creates a staging JSONL plus Markdown and JSON reports.

**No records are written to src/, public/, or runtime datasets.** The workflow has read-only repository permissions and runs only on manual dispatch.

## Run
1. Open Actions → Official corpus preproduction audit.
2. Select Run workflow on main.
3. Download the artifact nameforge-official-corpus-preproduction.

The artifact contains archive checksums, report.md, corpus-audit.json, and staging-corpus.jsonl.

## Measurements
Parsed rows, distinct source spellings, repeated observations by spelling/year/sex, accent/Unicode-folded variant groups, exact name-form overlap across sources, and rejected rows. Original source spellings and source row locators are preserved; no duplicate is silently removed.

## Interpretation
- INSEE is French civil-registration data, not proof of French etymology.
- SSA is US Social Security card-application data, not proof of English etymology or complete US birth coverage; privacy suppression applies.
- INSEE counts are checked against the published multiple-of-five rounding convention; SSA values below five are excluded.
- A cross-source match is only a written-form overlap.
- Automated comparison is not legal clearance or native-speaker review.

## Runtime gate
No artifact record is approved for runtime use. Later integration requires source/license review, record-level validation, competent linguistic review, and an explicit reviewed commit.