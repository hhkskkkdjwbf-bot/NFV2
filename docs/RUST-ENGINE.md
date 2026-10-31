# NameForge Rust engine

## Objective

Add a native, high-throughput processing core without replacing the existing
TypeScript application or changing its generation behavior prematurely.

## Responsibilities

Rust is intended for measured CPU-heavy workloads:

- Unicode-aware normalization and comparison keys.
- Large-batch deduplication while preserving first-seen order.
- Similarity/distance calculations.
- Future streaming audits and large dataset processing.
- Specialized engines only when a benchmark and quality test demonstrate a benefit.

## Architecture

1. TypeScript remains the UI, orchestration layer, and compatibility baseline.
2. Rust is an isolated library under `rust/`.
3. The first implementation provides deterministic primitives and unit tests.
4. A later WebAssembly adapter may expose these functions to the browser.
5. TypeScript and Rust must run the same golden test corpus before any production
   workload is switched to Rust.
6. Native Rust may later power offline report generation or server-side batch jobs.

## Safety and correctness rules

- Never use a speed optimization that changes language-specific generation semantics.
- Unicode handling must be tested with Arabic, Hebrew, CJK, Indic, Thai and Latin data.
- Structural similarity is not linguistic validity.
- Keep the TypeScript fallback available.
- Do not add network calls, paid APIs, or runtime AI dependencies.
- Do not claim a performance improvement until benchmark results compare the same
  workload, hardware, input corpus and output correctness.

## Current status

The Rust core is an initial, independently testable foundation. It is **not yet
connected to the browser application**. WebAssembly integration, TypeScript parity,
representative benchmarks, and production routing remain subsequent gates.
