# Phase 2 — language, script and generator-family rules

## Implemented policy layer

`src/services/linguisticRules.ts` separates three concerns:

1. **Language and writing system:** maps the 28 generated languages plus the three pseudo-profiles (`latin`, `nordic`, `tech`) to their expected scripts. Arabic, Hebrew, Cyrillic, Greek, Devanagari, Bengali, Thai, Hangul and CJK are whole-token profiles.
2. **Generator family:** business, innovation and technology use a shorter brand-oriented strategy set; writing, culture, lifestyle and places use whole-word/story-oriented strategies; fantasy, character, creature and science-fiction families retain broader creative strategies.
3. **Input compatibility:** mixed-script keywords are not combined with language affixes. Latin transliterations can be entered, but they remain unchanged rather than being joined to native-script material.

## Engine changes

- Strategy selection now comes from the generator family's policy instead of applying all six strategies to every category.
- Complex writing systems avoid Latin-oriented blending and arbitrary syllable slicing.
- Non-Latin gender suffix rules are disabled; Latin gender morphology is limited to suitable fantasy/character/creature families.
- Localized titles are limited to appropriate narrative families. An English title fallback is no longer injected into an explicitly selected non-English language.
- Group labels use the selected language's group vocabulary before any category fallback. When no localized group label exists, the engine omits the group prefix instead of injecting French.
- The compound format now passes the selected language into its secondary-name generator.
- A Latin transliteration such as `Nour` for Arabic input is preserved without adding Arabic suffixes or titles.

## Scope and limitations

These rules improve consistency of script and strategy selection; they do **not** prove that a generated word is idiomatic, culturally appropriate, or semantically suitable. The existing root lists are still generic per-language material, not fully category-specific lexicons. Their provenance and native-speaker validation belong to the data-enrichment and human-review phases. Do not describe every generated output as native or linguistically certified.

## Verification

Run:

- `npx tsx src/tests/linguisticRules.test.ts`
- `npx tsx src/tests/generatorLanguageRules.integration.test.ts`
- `npm test`, `npm run lint`, and `npm run build:gh-pages`
