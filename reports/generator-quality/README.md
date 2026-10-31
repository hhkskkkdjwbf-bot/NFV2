# NameForge quality audit

This folder contains the technical quality matrix and a human-review protocol derived from the successful audit of 234 generators × 28 languages (6,552 scenarios; 233,184 generated outputs).

## Files
- `quality-matrix-6552.csv`: all scenario-level metrics.
- `priority-review.csv`: scenarios sorted by heuristic review priority.
- `linguistic-validation-samples.csv`: real generated names from 30 priority generator/language pairs, with empty columns for human ratings.
- `LINGUISTIC-VALIDATION.md`: reviewer instructions and scoring rubric.
- `README-matrice.md`: methodology and interpretation of the matrix.
- `nameforge-quality-matrix.xlsx`: formatted workbook version of the matrix (kept as a downloadable local artifact when binary upload is unavailable).

## Important
Metrics are diagnostic signals, not linguistic verdicts. Prefixes and suffixes are structural fingerprints, not validated morphemes. No generator engine code was changed for this audit.
