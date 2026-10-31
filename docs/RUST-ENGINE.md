# NameForge Rust engine

## Objective

Provide a native, high-throughput processing core for deterministic batch workloads without replacing the browser application's TypeScript generation path prematurely.

## Responsibilities

Rust currently provides an independently testable native implementation for:
- Unicode-aware normalization and comparison keys.
- Large-batch deduplication while preserving deterministic order.
- Similarity/distance calculations.
- Reproducible benchmark workloads shared with TypeScript.

Future candidates include streaming corpus audits and a WebAssembly adapter, but neither is considered production-integrated until separately implemented and tested.

## Architecture and production boundary

1. TypeScript remains the UI, browser orchestration layer and compatibility baseline.
2. Rust lives under `rust/` and is compiled natively in CI.
3. The Rust test suite and the TypeScript/Rust parity benchmark run on the same deterministic input corpus.
4. A WebAssembly adapter and browser routing are separate future deliverables.
5. No browser workload is switched to Rust until the WASM adapter, cross-browser parity, fallback behavior and real-device performance have all been verified.

## Verified benchmark baseline

The latest recorded benchmark run for the same generated-name workload reported:

| Batch | TypeScript | Rust native |
|---:|---:|---:|
| 10,000 | 96.07 ms | 10.55 ms |
| 100,000 | 309.56 ms | 78.98 ms |
| 1,000,000 | 2,689.16 ms | 783.91 ms |

These are native benchmark timings, not browser or end-to-end page timings. They demonstrate a faster native batch path for this workload; they do not prove that adding WASM will improve mobile LCP or browser responsiveness. Re-run the workflow on the target commit before using these numbers as a current release claim.

## Safety and correctness rules

- Never use a speed optimization that changes language-specific generation semantics.
- Unicode handling must be tested with Arabic, Hebrew, CJK, Indic, Thai and Latin data.
- Structural similarity is not linguistic validity.
- Keep the TypeScript fallback available.
- Do not add network calls, paid APIs or runtime AI dependencies.
- Do not claim a performance improvement unless output parity is confirmed for the exact benchmark input.

## Current status

- Rust native implementation: **implemented and benchmarked**.
- TypeScript/Rust parity: **passed for the 10k, 100k and 1m benchmark batches** in the recorded run.
- Native batch performance: **measured**; see the table above.
- WebAssembly adapter: **not implemented**.
- Browser production routing: **not implemented**.
- Mobile LCP, image optimization and cache improvements: **separate web-performance work; not certified by the Rust benchmark**.
