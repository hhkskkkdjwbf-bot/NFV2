# NameForge local linguistic audit pipeline

The optional adapters run locally and never enter the public browser bundle. Feed one JSON object per line to \`scripts/linguistic-audit.py\`:

\`\`\`jsonl
{"name":"Élodie","language":"fr","description":"A short, elegant French-inspired name."}
{"name":"محمد","language":"ar"}
\`\`\`

\`\`\`bash
python3 scripts/linguistic-audit.py --status
python3 scripts/linguistic-audit.py < names.jsonl > audit.jsonl
\`\`\`

## Adapter configuration

- **Hunspell**: install the executable and a dictionary matching the language. Set \`HUNSPELL_DICT_DIR\` to a directory containing Hunspell \`.dic\` and \`.aff\` files. A dictionary miss is only a review signal: proper names and transliterations are routinely absent.
- **LanguageTool**: run a local server (default \`http://127.0.0.1:8010\`) or set \`LANGUAGETOOL_URL\`. It analyzes descriptions only; isolated names are intentionally skipped.
- **ICU**: install PyICU. Without it, Python's Unicode NFC normalization is reported as a fallback, not ICU.
- **NLTK**: install NLTK. An optional local corpus can be selected with \`NAMEFORGE_NLTK_CORPUS\`; corpus membership is not name validity.
- **fastText**: install the Python package and set \`NAMEFORGE_FASTTEXT_MODEL\` to a local language-identification model. The confidence threshold is configurable; short names are difficult to classify.
- **Hyperscan**: install its Python binding. Optional JSON patterns can be provided through \`NAMEFORGE_HYPERSCAN_PATTERNS\`. A Python-regex fallback is clearly labelled when Hyperscan is absent.

## Output contract

Every JSONL output contains the input, per-adapter status/results, elapsed time, findings with tool/code/severity, and an explicit interpretation warning. Missing optional dependencies do not block the audit. Findings are not aggregated into a naturalness score and do not automatically reject or rewrite names.

## Current integration boundary

This is an offline audit CLI, not a runtime generator dependency. The generator output is not modified. The existing CI availability detector remains lightweight and does not install dictionaries, servers, or model files. Rust/TypeScript benchmarking and WASM integration remain separate work and must use identical input corpora before reporting speedups.
