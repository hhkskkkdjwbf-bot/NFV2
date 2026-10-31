# NameForge — local linguistic toolchain

This toolchain is an **offline-capable audit layer**, not a name-validity oracle.
The browser generator must remain usable without Python, Java, a network service,
or any of these optional analyzers. Do not put large dictionaries or ML models in
the GitHub Pages bundle.

## Responsibilities and limits

| Component | Intended use | Important limitation |
|---|---|---|
| Hunspell | Flag spelling candidates against an explicitly selected local dictionary | Proper names, transliterations, dialect forms and invented names are often absent |
| LanguageTool | Review prose, descriptions, labels and multi-word text using a locally hosted server | Grammar rules are not proof that a standalone name is natural |
| ICU / ICU4C or ICU4X | Unicode normalization, locale-aware casing, collation, segmentation and script handling | Locale-aware text processing does not establish cultural authenticity |
| NLTK | Offline corpus tokenization, frequency and n-gram statistics | Corpus coverage and licensing must be documented; frequency is not a quality verdict |
| fastText | Optional local language identification and subword similarity signals | Short names are difficult to classify; model output is probabilistic |
| Hyperscan | High-throughput matching of suspicious patterns in large audit corpora | Patterns must be reviewed; matching is not semantic or linguistic validation |
| Rust | Deterministic high-throughput primitives and, after parity, WebAssembly | Never replace the TypeScript path before parity and benchmark gates pass |

## Integration policy

1. Keep generation deterministic and available without remote APIs.
2. Apply checks by content type. Hunspell and LanguageTool are primarily for
   descriptions and longer text; do not reject a name solely because a dictionary
   or grammar checker does not recognize it.
3. Treat fastText, corpus frequency, n-grams and Hyperscan matches as review
   signals. Preserve the raw output and record tool/version/dictionary/model.
4. Store source, script, locale, transliteration and reviewer status separately.
   A name may be marked attested only with a traceable source. A model score is
   never an attestation.
5. Do not silently mix scripts or rewrite spelling. Suggest a correction only
   when the user can inspect and accept it.
6. Keep large dictionaries/models outside the public web bundle. Pin versions,
   document licenses, and download them only in an explicit local/CI setup step.

## Current implementation status

- Rust native library: implemented and unit-tested in GitHub Actions; not yet
  wired into browser generation.
- WebAssembly adapter: not yet implemented.
- Hunspell, LanguageTool, ICU, NLTK, fastText and Hyperscan: architecture
  specified; the readiness audit detects local installations but does not claim
  that their analyzers are integrated into generation.
- Benchmarks and TypeScript/Rust parity corpus: pending.
- Human linguistic review: still required for cultural and naturalness claims.

Run `npm run audit:toolchain` to inspect which optional local tools are present.
The audit is intentionally non-failing when an optional tool is absent.
