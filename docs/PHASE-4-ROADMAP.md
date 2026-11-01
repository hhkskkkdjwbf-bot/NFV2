# Phase 4 — Advanced product features

This phase extends the existing generator catalogue without changing the linguistic corpus eligibility rules. Unverified native-name banks remain excluded from public generation.

## Status verified in the current codebase

| Feature | Current state | Next implementation step |
|---|---|---|
| Advanced generator search | Basic normalized text search and family/category filters exist | Add filters for use case, language support, generator type, and result quality; keep URL/shareable filter state |
| Intelligent name comparison | Unicode-normalized comparison and Levenshtein distance exist in the engine | Build a user-facing comparison workspace with explainable dimensions; do not present edit distance as linguistic quality |
| Domain checks | Not implemented as a reliable availability check | Use a supported registrar/RDAP source or a clearly labelled DNS/RDAP signal; distinguish available, taken, reserved, and unknown |
| Trademark checks | Not implemented | Add jurisdiction-aware official-register links/data only where stable and permitted; show possible matches, never legal clearance |
| Reproducible seed | Engine already supports deterministic seeded generation; a seed control is now exposed on generator pages | Persist seed with project/history records and include it in exports |
| Project history | Generation history exists in local storage | Add named projects, snapshots, settings, and restore/duplicate actions |
| Import/export | Existing JSON import/export merges saved names, collections, and history | Add versioned schema, validation preview, project bundles, CSV/JSON/TXT exports, and safe rollback |
| PWA/offline | Production service worker caches hashed assets and the last successful HTML navigation | Add offline-ready app shell, update notice, offline state, and automated offline browser tests |

## Implementation order

1. **Reproducible seed and project snapshots** — make the seed part of a saved generation record; include all generation settings and timestamp.
2. **Advanced generator search** — add meaningful structured filters and preserve them in query parameters.
3. **Name comparison workspace** — compare spelling, length, script, phonetic heuristics, similarity, category fit metadata, and user ratings separately. Explain that automated scores are indicative.
4. **Import/export v2** — version the schema, validate before mutation, preview merge conflicts, and support project-level export.
5. **Domain and trademark research** — integrate only documented, reliable sources. No scraping that violates terms, no invented availability, and no legal guarantee.
6. **PWA completion** — precache a minimal offline shell, handle updates safely, and test cold-start/offline navigation.

## Acceptance criteria

- Same generator, options, and non-empty seed produce the same ordered batch across reloads.
- Empty seed retains normal random behavior.
- A project restore reproduces its saved settings and seed.
- Search filters can be combined, cleared, shared by URL, and are accessible on mobile.
- Comparison output labels heuristic metrics and never claims that a name is legally or linguistically approved.
- Domain and trademark results include source, checked-at time, jurisdiction where relevant, and an explicit unknown state.
- Imports are validated before writes; malformed files do not partially overwrite existing data.
- Offline mode displays a clear state and does not claim live domain/trademark checks are available offline.
- CI covers type-check, unit/regression tests, browser flows, import/export round trips, seeded reproducibility, and offline behavior.

## Safety and data integrity

- Keep third-party corpus records with unresolved provenance or licensing out of the public generator.
- Treat domain status as time-sensitive and non-reserving.
- Treat trademark matches as research signals, not legal advice or clearance.
- Keep user project history local unless a separately reviewed account/sync architecture is introduced.
