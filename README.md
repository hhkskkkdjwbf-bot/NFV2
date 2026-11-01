# NameForge — Complete Product, Technical and Legal Documentation

> A multilingual creative naming workspace for brands, businesses, characters, stories, games, fictional worlds and personal projects.

**Live website:** https://hhkskkkdjwbf-bot.github.io/NFV2/  
**Source repository:** https://github.com/hhkskkkdjwbf-bot/NFV2  
**Default interface language:** English  
**Application type:** client-side React web application with a limited installable/offline-capable shell  
**Hosting:** GitHub Pages

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Verified project metrics](#2-verified-project-metrics)
3. [Main pages and user journeys](#3-main-pages-and-user-journeys)
4. [Generator controls and naming engine](#4-generator-controls-and-naming-engine)
5. [Generator catalogue and styles](#5-generator-catalogue-and-styles)
6. [My Names workspace](#6-my-names-workspace)
7. [Style Studio](#7-style-studio)
8. [Settings and preferences](#8-settings-and-preferences)
9. [Languages and localization](#9-languages-and-localization)
10. [Privacy, storage and data portability](#10-privacy-storage-and-data-portability)
11. [Architecture and source tree](#11-architecture-and-source-tree)
12. [Technology stack and tools](#12-technology-stack-and-tools)
13. [SEO, PWA and performance](#13-seo-pwa-and-performance)
14. [Accessibility](#14-accessibility)
15. [Testing, quality assurance and CI/CD](#15-testing-quality-assurance-and-cicd)
16. [Rust engine and benchmarks](#16-rust-engine-and-benchmarks)
17. [Linguistic datasets and provenance](#17-linguistic-datasets-and-provenance)
18. [Legal rights, licences and permitted use](#18-legal-rights-licences-and-permitted-use)
19. [Known limitations and unimplemented features](#19-known-limitations-and-unimplemented-features)
20. [Install and run locally](#20-install-and-run-locally)
21. [Build and deployment](#21-build-and-deployment)
22. [Contributing and development conventions](#22-contributing-and-development-conventions)
23. [Security and responsible disclosure](#23-security-and-responsible-disclosure)
24. [Roadmap](#24-roadmap)
25. [Documentation index](#25-documentation-index)

---

## 1. Project overview

**NameForge** is a browser-based naming toolkit. It helps people explore and create candidate names for creative, fictional, professional and personal projects. Instead of using one generic random-word generator, the application provides a catalogue of specialized generators, each with its own subject, vocabulary, styles, editorial guidance and FAQ content.

Typical use cases:

- Business, product, company and brand brainstorming.
- Fiction writing, novels, comics, manga and screenplays.
- Fantasy, science-fiction, mythology and worldbuilding.
- Characters, heroes, rivals, creatures, factions and locations.
- Role-playing games, clans, guilds, servers and gaming identities.
- Creative studios, media projects, events and communities.
- Educational, scientific and technology projects.
- Baby-name inspiration, with a distinction between attested names and invented suggestions.

NameForge is an **idea-generation and organization tool**. It is not a company-registration service, trademark database, domain registrar, legal adviser, linguistic authority or guarantee that a proposed name is unique.

### Product principles

1. **Specialized generation:** match the generator to the intended use rather than applying one vocabulary to every situation.
2. **Language-aware output:** keep interface language separate from the language or phonetic profile used to create names.
3. **User control:** allow people to adjust style, length, format, gender nuance, quantity and optional inspiration keywords.
4. **Local-first organization:** keep saved names and private notes in the user's browser.
5. **Reproducibility:** support deterministic generation when a seed is supplied.
6. **Honest quality claims:** automated checks are diagnostics; they do not replace native-speaker, cultural, trademark or legal review.
7. **No mandatory account:** the current application does not require registration.

---

## 2. Verified project metrics

The figures below describe the current source tree and its documented configuration. They are not estimates of linguistic quality.

| Metric | Current value | Meaning |
|---|---:|---|
| Generator catalogue | **234** | Generator entries declared by the project |
| Style / subcategory entries | **351** | Style definitions available across generators |
| Interface languages in selector | **82** | Language choices exposed by Settings |
| Fully translated interface languages | **28** | Languages with the project's full translation layer |
| Interface languages using English fallback | **54** | Listed choices without full translation coverage |
| Fully translated share of selector | **34.1%** | 28 divided by 82 |
| Fallback share of selector | **65.9%** | 54 divided by 82 |
| Generation-language selector entries | **32** | 28 language-coded choices, 3 phonetic profiles and Auto |
| Native phrase-bank generators | **19** | Sentence-like generators with curated phrase banks |
| Generator/language audit scenarios | **6,552** | 234 generators multiplied by 28 fully translated languages |
| Static generator SEO pages | **6,552** | 234 generators multiplied by 28 SEO languages |
| Generated sitemap entries | **6,553** | Generator pages plus the home page |
| Human-review sample package | **840 rows** | 30 sample outputs per language across 28 languages; review pending |

### How to interpret the percentages

The 34.1% figure is a **translation-coverage ratio**, not a statement that 34.1% of the world's languages are supported, nor a measure of translation accuracy. The remaining 65.9% of the selector currently falls back to English text. The 28 fully translated interface languages have not all received independent native-speaker sign-off.

Likewise, 6,552 generator/language scenarios means that the automated audit can exercise that many combinations. It does not mean every generated name in every combination has been reviewed by a human.

The source of truth for these counts is the language registry, generator metadata, translation modules and SEO generation script. Recalculate the counts after changing those files.

---

## 3. Main pages and user journeys

The application uses hash-based navigation.

| Area | Route / hash | Purpose |
|---|---|---|
| Home | **#/** | Product introduction, featured generators, category discovery and FAQ |
| Generator catalogue | **#/generators** | Browse, search, filter and sort the generator collection |
| Generator detail | **#/generator/<id>** | Configure a generator and create candidate names |
| My Names | **#/my-names** | Save, organize, compare, rate, annotate and export names |
| Style Studio | **#/style-studio** | Transform text into decorative Unicode styles |

Selected legacy aliases are retained to reduce disruption to existing links.

### Catalogue discovery

The catalogue currently supports:

- Search by generator title and identifier.
- Optional search in descriptions and supporting editorial text.
- Generator-family/category filtering.
- Relevance-oriented ordering.
- Alphabetical ordering.
- Random generator selection.
- Empty-state feedback and filter reset.

Search normalization is handled by a dedicated service. It is intended to make discovery more tolerant of common text variations; it is not a full semantic search engine.

### Generator detail pages

A generator detail page can contain:

- A generator-specific title and description.
- Style or archetype choices.
- Generation controls.
- Generated name cards.
- Explanations and editorial guidance.
- Advantages and limitations where provided.
- Frequently asked questions.
- Name-detail information such as suggested pronunciation, strengths, watch-outs and disclaimers when available.

The amount of detail varies by generator and by the underlying metadata. A field being part of the shared data model does not mean every generated result has a verified value for that field.

---

## 4. Generator controls and naming engine

The main generation entry point is **generateNames(options)** in **src/services/generatorEngine.ts**.

### Generation parameters

| Parameter | Choices / behaviour |
|---|---|
| Generator | The selected generator ID |
| Style | Generator-specific style or archetype |
| Length | Short, medium or long |
| Format | Title, full name, group, minimal or compound, where supported |
| Gender nuance | Any, female, male or neutral, where supported |
| Generation language | Auto or an explicit language/profile |
| Quantity | Selectable output batch size |
| Keyword | Optional inspiration keyword or root |
| Seed | Optional reproducibility value |

Not every generator uses every parameter in exactly the same way. A venue or slogan generator relies on phrase construction, while a fantasy character generator may use syllable and phonetic rules.

### Generation language is independent from interface language

The **interface language** controls labels, navigation, settings and help text. The **generation language** controls the language or phonetic profile used for the proposed name.

Changing the interface to French does not automatically mean every generated name must be French. The user can select a generation language independently. In Auto mode, the engine resolves the current interface language to a supported generation profile and uses a documented fallback when a suitable profile is unavailable.

### Generation strategies

The engine combines several approaches:

1. **Syllable-based construction** for suitable fictional and fantasy-style generators.
2. **Whole-word selection** for vocabularies that must remain intact, including proper-name-like entries and non-Latin forms.
3. **Curated phrase banks** for 19 sentence-like generators, where joining random syllables would produce poor phrases.
4. **Language-specific roots and phonetic profiles** for other supported generation-language choices.
5. **Attested-name lookup** for the baby-name category, where the data distinguishes sourced names from invented names.

The engine also includes normalization, candidate scoring, duplicate filtering, assembly rules and a rolling recent-name window. Whole-word vocabularies must not be cut into arbitrary syllables. Rules also preserve selected uppercase tags and Roman numerals and handle certain French contractions and agreement cases.

### Reproducible generation

A non-empty seed makes a generation batch reproducible for the same generator and options. This is useful for reproducing a bug report, reviewing the same candidate batch and comparing engine changes.

A seed does not certify that the output is unique, natural, culturally suitable or legally available. Deterministic runs are designed not to depend on the recent-name history window.

### Attested names versus invented names

- **Attested name:** a record supported by a traceable source, with source-specific spelling and metadata.
- **Invented suggestion:** a generated construction intended for inspiration. Its pronunciation or apparent meaning must not be presented as a documented etymology.
- **Variant or transliteration:** a separate form that must not silently replace the native-script spelling or be described as a verified transliteration unless the source supports that claim.

The engine does not check trademark registries, company registries, domain availability or social-media handles.

---

## 5. Generator catalogue and styles

The catalogue contains **234 generator entries** and **351 style/subcategory definitions**. Generator metadata is assembled from files under **src/data/**, including the main catalogue and its batches.

The product's generator families include:

- Fantasy and mythology.
- Business and professional projects.
- Creative work and media.
- Innovation and technology.
- Science fiction.
- Characters and personalities.
- Places and locations.
- Creatures and species.
- Writing and publishing.
- Lifestyle and services.
- Culture and community.
- Technical and scientific concepts.

Examples of generator subjects include fantasy characters, anime characters, RPG identities, dragons, elves, kingdoms, science-fiction concepts, vampires, warriors, wizards, brands, restaurants, cafés, studios, online projects, software tools, scientific concepts, teams and fictional places.

The list above is illustrative, not a substitute for the complete generator registry in **src/data/generators.ts**.

### Generator content model

A generator metadata record may include:

- Stable generator ID.
- Full and short titles.
- Icon and category.
- Hero headings.
- Description and subtitle.
- Advantages and limitations.
- Usage guide.
- Informational cards.
- FAQ entries.
- Footer copy.
- Legal disclaimer.

Stable IDs are important because they are used in hash routes, metadata lookups, saved-name records and SEO pages. Avoid renaming an ID without a migration plan.

---

## 6. My Names workspace

The My Names area is a local personal workspace. It is not an online account or cloud drive.

### Name actions

Users can save a generated name, mark it as liked/favourite, add or edit a private note, assign a name to a collection, rate a name from 1 to 5 stars, search and filter the local library, copy a name and delete a name.

A saved entry can include its generator, style, saved/liked flags, note, collection reference, rating and creation date.

### Collections

Collections help organize candidates by a theme or project, such as a novel, game campaign, fictional faction, business idea, product family, team or community.

A collection has a name, description, optional colour and creation timestamp.

### History

The application stores a local generation history so that recent candidate names can be revisited. The engine also uses recent-name memory to reduce immediate repetition in ordinary, unseeded sessions. History is stored in the current browser, not on a server.

### Comparison

The workspace includes a comparison interface for selected names. Text normalization and edit-distance calculations can support spelling comparisons. Such measurements are **technical similarity signals only**; they do not establish pronunciation quality, cultural fit, trademark risk or linguistic correctness.

### Saved projects and snapshots

A named project snapshot can preserve a project name and description, saved-name entries, collections, generation history and creation/update timestamps.

Restoring a snapshot merges its data into the current workspace. It is designed not to erase unrelated current data.

The current snapshot model does not constitute a cloud-synchronized project and does not promise to preserve every generator control or seed as a complete reproducible project recipe.

### Import and export

The current data service provides:

- JSON export using schema version **3**.
- JSON import with validation and normalization.
- Compatibility handling for earlier supported schema versions.
- CSV export for saved names.
- Duplicate-aware merging.
- Collection-ID remapping to avoid attaching imported names to unrelated local collections.
- Rejection of unsupported backup versions.
- Rollback protection for failed imports.

Keep a backup before clearing browser data or moving to another device. JSON backups can contain private notes, project names and other personal information. Do not share them publicly unless you have checked their contents.

---

## 7. Style Studio

The Style Studio provides decorative text transformations using Unicode characters. Potential uses include profile names, headings, labels and creative text decoration.

### Important Unicode limitations

- The audited implementation contains 22 transformations.
- Most transformations target Latin letters and digits.
- Other scripts may pass through unchanged.
- Rendering depends on the fonts and Unicode support available on the recipient's device.
- Some decorative characters may be harder for screen readers, search engines or assistive technologies to interpret.
- Styled Unicode is not a replacement for semantic HTML, accessible headings or proper typography.

Use ordinary text for essential instructions, contact details, legal notices and other content that must remain easy to read and search.

---

## 8. Settings and preferences

The settings model is defined in **src/types/index.ts** and persisted under the browser storage key **nameforge_settings**.

| Setting | Options | Effect |
|---|---|---|
| Interface language | 82 listed choices | Changes interface text where translations exist; otherwise English fallback is used |
| Theme | Dark, Light, System | Changes the colour theme; System follows the operating-system preference |
| Text size | Normal, Large, Compact | Adjusts the interface text-size mode |
| Reduced motion | On / Off | Reduces interface motion where implemented |
| Default generation language | Auto or an explicit language/profile | Sets the initial generation-language choice |

Other settings behaviour:

- The first visit can use browser-language detection.
- A saved language preference takes precedence on later visits.
- The document's language attribute is synchronized with the selected interface language.
- Right-to-left direction is applied for Arabic and Hebrew.
- The theme is applied early to reduce a visible theme flash.
- A reset action is available for local application data.

**Reset warning:** clearing local data is destructive. Export a backup first if the information matters. Clearing browser storage, private browsing sessions or site data can also remove local information outside the application's own reset flow.

---

## 9. Languages and localization

### Interface languages with full translation coverage

The current full-translation set contains 28 language codes:

**ar, bn, cs, da, de, el, en, es, fi, fr, he, hi, id, it, ja, ko, nb, nl, pl, pt, ro, ru, sv, th, tr, uk, vi, zh.**

The selector contains 82 choices. The other 54 currently fall back to English for interface text. The presence of a language in the selector must not be interpreted as full translation coverage.

### Right-to-left languages

Arabic and Hebrew are configured as right-to-left interface languages. The page direction and language metadata are updated when the user changes the interface language. This does not mean every third-party font or every generated name has been linguistically reviewed for RTL display.

### Generation-language profiles

The generation-language selector has 32 entries in total:

- Auto.
- 28 language-coded generation choices.
- Three additional phonetic profiles: Latin, Nordic and Tech.

A phonetic profile is not a natural language and must not be counted as one of the 28 fully translated interface languages.

### Translation quality status

The project has automated checks for translation-key coverage, placeholders and selected localization structures. The additions described in the language documentation were machine-written and have not all been reviewed by qualified native speakers.

Before claiming native-level quality, arrange human review for grammar and idiom, pronunciation and syllable boundaries, cultural associations, gender and regional nuance, offensive or ambiguous meanings, native-script spelling and transliteration, and suitability for the intended category.

---

## 10. Privacy, storage and data portability

### Local-first design

The current application has no application backend, user-account database or cloud synchronization service. Saved names, notes, collections, ratings, history, project snapshots and settings are stored in browser storage.

Consequences:

- Data is tied to the browser profile and device.
- Data is not automatically synchronized between devices.
- Clearing site data can remove saved information.
- Private browsing or restrictive browser settings may limit persistence.
- Browser storage is not an encrypted password vault.
- A person with access to the same unlocked browser profile may be able to inspect local data.
- Exported backup files are readable data files and should be handled carefully.

### Network behaviour

The app is delivered as static assets through GitHub Pages. The application architecture does not require a remote generation API or user-data backend. The browser still needs network access for the initial site download, updates and uncached resources.

Hosting infrastructure may process ordinary HTTP request information such as IP address, user agent and requested resource as part of serving a website. Do not interpret “local-first” as a promise that the hosting provider receives no technical access logs.

### Data deletion

Users can use the application's local reset controls and browser site-data controls. A backup should be exported before deletion if the user wants to retain their work.

There is currently no account deletion workflow because there are no application accounts.

---

## 11. Architecture and source tree

NameForge is a client-rendered React application with a hash-based navigation layer.

~~~text
NFV2/
├── .github/workflows/          # CI, quality audits, deployment and Rust workflows
├── docs/                       # Architecture, audits, quality and data-rights notes
├── public/
│   ├── images/                 # Icons, logo and social preview image
│   ├── 404.html                # GitHub Pages not-found handling
│   ├── manifest.webmanifest    # Web app manifest
│   ├── robots.txt              # Crawler policy
│   └── sw.js                   # Static asset and navigation cache
├── reports/generator-quality/  # Quality reports and human-review instructions
├── rust/                       # Native Rust text-processing implementation
├── scripts/                    # SEO, import, benchmark, audit and QA scripts
├── src/
│   ├── components/             # Reusable interface components and dialogs
│   ├── data/                   # Generator metadata, vocabularies and phrase banks
│   ├── hooks/                  # React hooks
│   ├── i18n/                   # Interface and generator translations
│   ├── services/               # Engine, storage, settings and linguistic services
│   ├── tests/                  # Automated tests
│   ├── types/                  # Shared TypeScript types
│   ├── views/                  # Home, catalogue, detail, library and style views
│   ├── App.tsx                 # Main application and navigation
│   └── main.tsx                # Browser entry point and service-worker registration
├── index.html                  # HTML shell, metadata and early theme/language setup
├── package.json                # Scripts and dependency declarations
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite, React, Tailwind and chunk configuration
~~~

### Important modules

| File / directory | Responsibility |
|---|---|
| **src/App.tsx** | Application shell, hash routes, page selection, metadata and settings synchronization |
| **src/views/** | Main user-facing pages |
| **src/components/** | Navigation, cards, controls, modals and project workspace |
| **src/data/generators.ts** and generator batches | Generator catalogue and metadata |
| **src/data/subcategories.ts** | Styles, roots and vocabulary structures |
| **src/data/phraseBanks.ts** | Curated multi-word phrases for selected generators |
| **src/data/syllableEnrichment.ts** | Additional syllable families |
| **src/services/generatorEngine.ts** | Name-generation orchestration |
| **src/services/languageMorphology.ts** | Language-aware construction support |
| **src/services/linguisticRules.ts** | Assembly and language rules |
| **src/services/orthographicUnits.ts** | Orthographic handling |
| **src/services/phoneticUnits.ts** | Phonetic building blocks |
| **src/services/phoneticReadiness.ts** | Language/profile readiness support |
| **src/services/diversity.ts** | Diversity and repetition signals |
| **src/services/semanticSafety.ts** | Defensive semantic-risk interface; coverage is incomplete |
| **src/services/search.ts** | Search normalization |
| **src/services/settings.ts** | Preferences and language registry |
| **src/services/storage.ts** | Local persistence, import/export and project snapshots |
| **src/services/textStyler.ts** | Unicode text transformations |
| **src/i18n/** | Translation dictionaries and localized generator content |
| **scripts/** | Build-time generation, audits, benchmarks and QA |
| **rust/** | Native text-processing primitives, not the production browser generator |

---

## 12. Technology stack and tools

### Browser application

| Technology | Version range in package/config | Role |
|---|---|---|
| React | 18.3.x | Component-based UI |
| React DOM | 18.3.x | Browser rendering |
| TypeScript | 5.7.x | Static typing and application source |
| Vite | 6.x | Development server and production bundler |
| Tailwind CSS | 4.x | Utility-first styling |
| @tailwindcss/vite | 4.x | Tailwind integration with Vite |
| Lucide React | 0.475.x | Interface icon library |

### Development and QA

| Tool | Role |
|---|---|
| Node.js 20 in deployment CI | JavaScript runtime for scripts and build |
| npm | Dependency installation and project scripts |
| Playwright 1.56.x | Chromium-based browser automation and responsive checks |
| Lighthouse 12.8.x | Performance, accessibility, best-practice and SEO audits |
| Python 3 | Corpus preparation and linguistic/toolchain audit scripts |
| Rust / Cargo | Native deterministic text-processing experiments and benchmarks |
| Git and GitHub | Version control, review and repository hosting |
| GitHub Actions | Automated checks and deployment |
| GitHub Pages | Static production hosting |
| Markdown | Maintained project documentation |

### Rust dependencies

The native Rust package declares:

- unicode-normalization for Unicode normalization.
- unicode_categories for Unicode character-category handling.
- serde_json for JSON processing.

The Rust package currently declares **UNLICENSED**. This is deliberate and must not be mistaken for an open-source licence.

### Build architecture

Vite splits selected dependencies and large translation/data modules into separate chunks. This helps caching and prevents the entire application from being bundled into one monolithic JavaScript file.

The production application remains a TypeScript/React browser application. Rust is not currently wired into the browser generation path through WebAssembly.

---

## 13. SEO, PWA and performance

### Search-engine pages

The SEO generation script creates one static landing page for each generator and each of the 28 fully translated interface languages:

**234 × 28 = 6,552 generator landing pages.**

The generated sitemap contains those 6,552 pages plus the home page, for 6,553 URLs.

The generated pages include localized titles and descriptions, canonical URLs, language/direction metadata, Open Graph information, JSON-LD structured data and alternate-language links (hreflang, including x-default).

The interactive application itself uses hash-based navigation. The static SEO pages are separate landing pages that link into the relevant application generator.

### Metadata

The HTML shell includes page title and description, canonical URL, robots directive, theme colour and colour-scheme declaration, web app manifest, favicon and touch icon references, Open Graph metadata, Twitter card metadata and WebApplication JSON-LD.

Keep the deployment origin consistent across the HTML shell, generated SEO pages, sitemap and GitHub Pages configuration.

### PWA and offline behaviour

The project includes a web app manifest and a service worker.

The current service worker:

- Uses a network-first strategy for HTML navigation.
- Stores the last successful navigation response as an offline fallback.
- Uses cache-first behaviour for matching content-hashed same-origin assets.
- Does not cache arbitrary external requests.
- Replaces old versioned NameForge caches during activation.

This is **offline resilience**, not a guarantee that every page and every resource is available offline. A first visit still requires a network connection, and uncached assets may be unavailable without one. The service worker is not a full offline database or background synchronization system.

### Performance measurement

The repository contains Playwright and Lighthouse scripts. CI runs browser QA and Lighthouse before deployment, then performs a live Lighthouse audit after deployment.

Lighthouse scores vary with runner load, network conditions, browser version and hosting response. Treat them as measurements from a particular run, not permanent guarantees.

---

## 14. Accessibility

The application includes accessibility-related implementation work such as dialog semantics for modals, Escape-key closing, focus movement into dialogs, Tab / Shift+Tab focus management, focus restoration, accessible close-button labels, visible keyboard focus styling, reduced-motion handling, language and direction attributes, and static colour-contrast checks for selected theme text colours.

### Known accessibility limits

- Static colour calculations are not a complete WCAG audit.
- White text on the documented cyan button colour has a measured contrast ratio of approximately 3.7:1; this is suitable only for sufficiently large/bold text under the documented measurement, not ordinary small body text.
- Screen-reader testing by people using assistive technology is not documented as complete.
- Real-device testing at every zoom level and viewport is not complete.
- Decorative Unicode output can be less accessible than ordinary text.
- A passing browser test does not certify WCAG conformance.

The project's accessibility target is to improve toward WCAG 2.2 AA. Do not claim full certification without a complete audit.

---

## 15. Testing, quality assurance and CI/CD

### Local commands

| Command | Purpose |
|---|---|
| **npm install** | Install declared dependencies |
| **npm run dev** | Start the Vite development server on port 3000 |
| **npm run lint** | Run TypeScript checking with no emit |
| **npm test** | Run the project's regression and data-contract test sequence |
| **npm run build** | Type-check, create the Vite production build and generate SEO pages |
| **npm run build:gh-pages** | Build using relative asset paths for GitHub Pages |
| **npm run preview** | Preview the built site locally |
| **npm run test:browser** | Run Playwright browser QA |
| **npm run test:visual** | Alias for the visual QA suite |
| **npm run audit:lighthouse** | Run desktop and mobile Lighthouse audits |
| **npm run audit:i18n** | Audit localization coverage |
| **npm run audit:generators** | Generate the generator quality baseline |
| **npm run audit:generators:deep** | Run deeper generator analysis |
| **npm run review:linguistic** | Build the human linguistic-review package |
| **npm run audit:toolchain** | Inspect optional local linguistic tools |
| **npm run audit:linguistic** | Run the Python linguistic audit |
| **npm run quality** | Sequential lint, test, build, browser QA and Lighthouse workflow |

The repository currently has no committed package-lock.json; use **npm install** rather than **npm ci** until a lockfile is deliberately added and maintained.

### Automated test sequence

The **npm test** script currently runs:

1. Saved-project storage tests.
2. Diversity tests.
3. Comprehensive suite.
4. Generator regression-quality checks.
5. Linguistic-quality tests.
6. Linguistic-rule tests.
7. Generator-language integration tests.
8. Dataset-manifest tests.
9. Corpus-import contract tests.
10. Site metadata and feature regression assertions.

These tests cover data handling, deterministic output, language rules, source-manifest policy, import validation, saved projects, selected Unicode cases and site metadata.

### Browser QA

The Playwright visual QA script uses Chromium and checks:

- Desktop viewport: 1440 × 1000.
- Mobile viewport: 390 × 844.
- Dark and light themes.
- Home, catalogue, generator detail, My Names and Style Studio.
- Page errors and selected interface states.
- Settings and generation-language controls.
- FAQ rendering and screenshots.

This produces a useful set of browser checks, but it does not represent every browser, operating system, device, screen reader or viewport.

### Lighthouse

The Lighthouse script audits Performance, Accessibility, Best Practices and SEO. It creates desktop and mobile reports. The deployment workflow also audits the live published site after the deploy job succeeds.

### GitHub Actions workflows

The repository contains dedicated workflows for GitHub Pages deployment and post-deployment audit, generator diversity selector baseline, generator quality audit, generator quality comparison, native-bank preproduction, official-corpus preproduction, and Rust engine tests and benchmarks.

### Deployment release gate

The current Pages workflow is designed to check out the repository, install Node.js 20 and dependencies, install Chromium, run TypeScript checking, run regression tests, build the GitHub Pages site, run Playwright browser QA, run Lighthouse, upload QA reports, upload the Pages artifact, close stale in-progress Pages deployments, publish the artifact and audit the live published website.

### Latest verified deployment at the time this README was updated

- Workflow: **Deploy NameForge to GitHub Pages**
- Run: **#202**
- Commit: **5e04b8422f946fa0ae8c02041d234157c6f0b6f2**
- Result: **success**
- Build, type-check, regression tests, Playwright, pre-deploy Lighthouse, deployment and live Lighthouse jobs: **all successful**.

Run details: https://github.com/hhkskkkdjwbf-bot/NFV2/actions/runs/41293810277

This is a record of that specific run, not a promise that future commits will pass.

---

## 16. Rust engine and benchmarks

The Rust package is a separate native implementation of selected text-processing primitives. It is not the production name-generation engine used by the browser UI.

### Current Rust responsibilities

- Unicode-aware normalization for comparison keys.
- Stable de-duplication.
- Levenshtein edit distance.
- Unique-ratio calculation.
- Deterministic benchmark workloads.

### Recorded native benchmark

The repository's Rust documentation records the following run:

| Batch | TypeScript | Rust native |
|---:|---:|---:|
| 10,000 | 96.07 ms | 10.55 ms |
| 100,000 | 309.56 ms | 78.98 ms |
| 1,000,000 | 2,689.16 ms | 783.91 ms |

These are historical **native benchmark timings** for the documented workload. They are not page-load timings, browser timings, mobile timings or a guarantee of equivalent performance on another machine.

### Production boundary

- TypeScript remains the browser application and generation path.
- Rust is built and tested natively.
- A WebAssembly adapter is not implemented.
- Browser production routing to Rust is not implemented.
- A Rust speed result does not prove that mobile LCP or browser interaction latency will improve.
- Any future switch must preserve output parity and keep a TypeScript fallback.

---

## 17. Linguistic datasets and provenance

Linguistic data is a major quality and legal responsibility for a multilingual naming product.

### Internal and editorial data

Some vocabulary and phrase-bank entries are project-maintained or editorially assembled. The current source register labels a number of these banks as **editorial-unverified**. Their presence in the current application is not proof that every entry has an independently documented author, source or redistribution licence.

Do not label an entry public domain, CC0 or freely reusable unless its rights have been checked.

### External source candidates

The project documentation discusses possible sources such as Open English WordNet, Wiktionary/Kaikki, Tatoeba and CMU Pronouncing Dictionary. These are candidates with different licences and attribution/share-alike conditions. They are not all approved or imported into the public runtime corpus.

Each imported dataset should record its source name and stable URL, exact release/revision, licence and required attribution, source record identifier, original spelling and script, language and locale, transformation history, download date and checksum, human-review status, and reason for inclusion or exclusion.

A source licence does not automatically validate the linguistic correctness or cultural suitability of every entry.

### Russian NEN dataset — preproduction only

A Russian native-script dataset is stored in the preproduction documentation area:

- Upstream: **mdanina/nen-imena-dataset**.
- Pinned revision: **38b3cad3aa123326be8bb97b0e9a3c0e5c7f54e6**.
- Licence recorded by the project: **CC BY 4.0**.
- Raw source records: **1,551**.
- Distinct native spellings: **1,548**.
- Source gender rows: **809 male / 742 female**.
- Human linguistic review: **pending**.
- Runtime/public generator status: **not enabled**.

Required attribution recorded with the source: **Данные: НЭН — сервис «Имена»**, with a link to https://n-e-n.ru/imena/.

The original Cyrillic spelling, short forms and international forms are kept separate. This dataset must not be described as a fully reviewed or public NameForge baby-name bank.

### Human linguistic review

A review package is generated with 840 sample rows: 30 outputs for each of 28 languages. The review package is a sampling aid, not proof that review has been completed. Qualified reviewers should score naturalness, category fit, language correctness and readability, and record cultural or semantic concerns.

---

## 18. Legal rights, licences and permitted use

> **Important legal status:** the repository currently has no root-level LICENSE file. The earlier README contained both an MIT claim and a statement that no licence file existed. The MIT claim is not supported by the repository and must not be relied upon.

This section is a project documentation notice, not legal advice.

### 18.1 Repository code licence

At the time of this audit:

- No root LICENSE file is present.
- The root README does not establish a valid MIT licence.
- The Rust package declares **UNLICENSED** in rust/Cargo.toml.
- No general permission to copy, modify, redistribute, sublicense or commercially exploit the complete repository should be inferred from its public availability on GitHub.

In jurisdictions where copyright applies automatically, public visibility of source code is not the same thing as granting an open-source licence.

**Until the rights holder chooses and adds a licence, treat original project code and project-authored assets as copyrighted and all rights reserved, except where a separate licence or permission clearly applies.**

Before adding an open-source licence:

1. Confirm who owns the project and each contribution.
2. Confirm that every contributor has authority to license their work.
3. Review all copied or adapted code.
4. Review fonts, icons, images, datasets and generated assets.
5. Preserve third-party notices.
6. Choose a licence that matches the intended permissions.
7. Add the complete licence text to a root-level LICENSE file.
8. Update the README and dependency notices consistently.

Do not add an MIT badge or claim MIT licensing until this work is complete.

### 18.2 Third-party dependencies

The project depends on third-party packages. Their licences are separate from the project's own code licence.

Examples include React, React DOM, TypeScript, Vite, Tailwind CSS, Lucide React, Playwright, Lighthouse and the Rust crates listed in rust/Cargo.toml.

Before redistribution, deployment as a commercial product or release of a packaged copy:

- Generate and review a dependency licence inventory.
- Preserve notices required by each dependency.
- Check transitive dependencies, not only direct dependencies.
- Recheck licences when dependency versions change.
- Keep a software bill of materials (SBOM) for formal releases if required.

This README does not declare that every dependency is MIT-licensed. Consult the licence shipped with each exact package version.

### 18.3 Dataset rights

Dataset rights are independent of software rights.

- A CC BY dataset requires attribution and compliance with its conditions.
- A CC BY-SA dataset may impose share-alike obligations on adapted database material, depending on the applicable legal analysis.
- A database may contain third-party records whose rights differ from the repository's own code.
- A source website's terms may impose conditions beyond the copyright licence.
- A public URL does not mean the data is public domain.
- A transformed or normalized dataset may still be an adaptation of the source.

Keep raw snapshots, transformation scripts, source manifests, checksums and attribution notices together. Never remove required attribution during import or export.

### 18.4 Russian dataset attribution

If the staged Russian NEN dataset is ever enabled publicly, preserve the source attribution recorded in its source documentation:

**Данные: НЭН — сервис «Имена»** — https://n-e-n.ru/imena/

The current dataset documentation records CC BY 4.0 and a pinned upstream revision. Human review is still pending and the dataset is not currently part of public generation.

### 18.5 User-generated output and name ownership

NameForge generates suggestions. It does not provide a legal opinion about ownership or exclusivity.

Users should not assume that a generated name is automatically original in the legal sense, free of third-party rights, available as a trademark, company name, domain or social handle, registrable in every jurisdiction, or culturally appropriate merely because the engine produced it.

Before commercial use, users should independently check relevant company registers, trademark databases, domain registrars and local legal requirements. A search result is not legal clearance.

The application currently does not perform live trademark or domain availability checks.

### 18.6 Brand names, third-party marks and fictional universes

Generator categories may refer to genres, common fictional archetypes or familiar media concepts. Such references are descriptive and do not imply sponsorship, endorsement, affiliation or permission from the owners of any third-party franchise or trademark.

Users are responsible for avoiding confusingly similar marks and unauthorized use of protected characters, logos, fictional settings or other protected material.

### 18.7 Images, icons and fonts

Before adding an image, icon set, font or illustration:

- Record its source and exact licence.
- Confirm commercial-use and modification permissions if relevant.
- Preserve attribution and notices.
- Avoid copying protected logos or artwork without permission.
- Do not assume that an image generated or found online is automatically free to redistribute.

The icon package is a third-party dependency and must be reviewed under its own licence terms.

### 18.8 Privacy and data protection

The current application is local-first and does not provide accounts or a remote user-data database. Nevertheless, website hosting can involve technical access logs, and users can create local notes or export backups containing personal information.

A future account, analytics, advertising, payment or cloud-sync feature would require a new privacy and security review, clear user-facing notices, data-retention rules and applicable legal compliance before release.

### 18.9 No warranty and limitation of purpose

The software and generated suggestions are provided for creative assistance. The project does not warrant that generated names are accurate, unique, safe, culturally appropriate, registrable or fit for a particular commercial purpose. Users should review outputs before relying on them.

Nothing in this section excludes rights that cannot legally be excluded under applicable law.

---

## 19. Known limitations and unimplemented features

| Area | Current status |
|---|---|
| User accounts and authentication | Not implemented |
| Cloud synchronization | Not implemented |
| Cross-device saved-name sync | Not implemented |
| Backend API / application database | Not implemented |
| Live domain availability check | Not implemented |
| Live trademark search / clearance | Not implemented |
| Company-name registry integration | Not implemented |
| Social-handle availability checks | Not implemented |
| Browser production use of Rust/WASM | Not implemented |
| Full offline-first application shell | Not implemented; current service worker provides limited caching |
| Native-speaker sign-off for all 28 languages | Pending |
| Complete human review of all generator outputs | Not completed |
| Complete, reviewed offensive-name lexicons for all languages | Not available |
| Complete screen-reader and assistive-technology certification | Not documented as complete |
| Formal WCAG 2.2 AA certification | Not claimed |
| Root project licence | Not present; rights status must be resolved |
| Complete licence inventory / SBOM | Not documented as complete |

### Linguistic quality limitations

- An invented name can sound plausible without having a real etymology.
- Short strings are difficult to classify reliably by language.
- A word-frequency score does not prove that a name is natural.
- A spelling checker may reject valid proper names or invented words.
- A similarity score does not measure brand quality.
- A phrase bank can be limited in size and may repeat.
- A language can be fully represented in the UI while its generated names still need native review.

### Phrase-bank limitations

The project has 19 curated phrase-bank generators. The generator documentation records that bank size is limited and repetition can occur in larger batches. Some other phrase-style generators still use roots or vocabularies rather than a full native phrase bank. Do not claim that every generator has a complete native phrase corpus in every language.

### Linguistic tools not integrated into runtime generation

Hunspell, LanguageTool, ICU, NLTK, fastText and Hyperscan are discussed as possible local audit tools in the toolchain documentation. Their presence in an architecture plan or readiness audit does not mean all of them are integrated into the production application. The browser generator must remain usable without these optional tools.

---

## 20. Install and run locally

### Requirements

- Node.js 20 recommended for parity with the deployment workflow.
- npm.
- Git.
- Chromium for browser QA and Lighthouse.
- Python 3 only for Python-based audit scripts.
- Rust toolchain only for native Rust tests and benchmarks.

### Setup

~~~bash
git clone https://github.com/hhkskkkdjwbf-bot/NFV2.git
cd NFV2
npm install
npm run dev
~~~

The Vite development server is configured for port 3000:

http://localhost:3000/

### Type-check, tests and production build

~~~bash
npm run lint
npm test
npm run build:gh-pages
npm run preview
~~~

### Browser QA and Lighthouse

Install Chromium once:

~~~bash
npx playwright install chromium
~~~

Then run:

~~~bash
npm run test:browser
npm run audit:lighthouse
~~~

The browser QA and Lighthouse scripts create local artifact folders. Do not commit generated reports unless they are intentionally being retained as release evidence.

### Rust checks

From the Rust package directory:

~~~bash
cd rust
cargo test
cargo run --release --bin nameforge-bench
~~~

The exact benchmark workload and parity harness are maintained in the repository scripts and workflow. Record the commit, machine, compiler and run conditions when publishing performance results.

---

## 21. Build and deployment

### GitHub Pages

The production site is hosted at:

https://hhkskkkdjwbf-bot.github.io/NFV2/

The deployment workflow builds the app using relative asset paths so it works under a GitHub Pages project subpath.

### Deployment trigger

The Pages workflow runs on pushes to **main** and manual **workflow_dispatch** execution.

The release workflow uses GitHub Actions permissions for Pages publishing, deployment status updates and the OIDC token required by the deployment action. Do not place secrets in the public frontend bundle.

### Production checklist

- [ ] TypeScript check passes.
- [ ] All regression tests pass.
- [ ] Production build succeeds.
- [ ] SEO pages and sitemap are generated.
- [ ] Playwright browser QA passes.
- [ ] Lighthouse reports are reviewed.
- [ ] No unexpected browser console errors are present.
- [ ] The Pages artifact contains the expected files.
- [ ] The deployment job succeeds.
- [ ] The live site responds correctly.
- [ ] The post-deployment Lighthouse audit succeeds.
- [ ] The README and release notes reflect the actual state.

The GitHub Actions workflow is the authoritative source for whether a particular commit passed these checks.

---

## 22. Contributing and development conventions

### General rules

- Preserve the existing application architecture unless a migration is explicitly planned.
- Keep stable generator IDs stable.
- Do not silently change the meaning of an existing generator.
- Keep interface language and generation language separate.
- Add tests for changes to storage, generation, import/export, localization and routing.
- Do not claim a feature is complete because a component or button exists; verify the complete user flow.
- Do not put private keys, API tokens or credentials in source code.
- Do not introduce an external service dependency without documenting its privacy, reliability, cost and legal implications.
- Keep large dictionaries and corpora out of the public web bundle unless there is a documented reason.
- Keep third-party dataset provenance attached to imported records.
- Avoid changing output quality merely to improve an automated numeric score.

### Adding a generator

1. Add generator metadata in the appropriate generator data file.
2. Add style and vocabulary data in the subcategory data or an appropriate batch.
3. Add localized titles, descriptions, guides and FAQ content.
4. Decide whether the generator uses syllables, whole words, phrase banks or attested records.
5. Add a phrase bank only when the content is genuinely sentence-like and the source/authoring rights are documented.
6. Add regression tests for the new generator and its supported languages.
7. Run the complete test and build workflow.
8. Check its generated SEO page and real browser interface.

### Adding a language

1. Add the language to the language registry.
2. Add the main interface dictionary and all shared UI module translations.
3. Add generator titles, descriptions, FAQs and SEO metadata.
4. Add RTL handling only if the script and language direction require it.
5. Decide whether a generation-language profile is supported separately from interface translation.
6. Add native phrase banks only with reviewed content and documented provenance.
7. Run localization coverage and regression audits.
8. Arrange qualified human review before making native-quality claims.

### Adding external data

Do not import a dataset directly into production because it is downloadable. First pin the source revision, inspect the licence, preserve attribution, calculate a checksum, record transformation steps, run the import contract, review the linguistic content and obtain the necessary approvals.

---

## 23. Security and responsible disclosure

NameForge is a static client-side application. There is no application login system or server-side account database in the current architecture.

Security expectations:

- Never commit secrets, access tokens or private credentials.
- Treat imported JSON files as untrusted input.
- Keep import validation and rollback protections.
- Avoid unsafe HTML injection when rendering user-controlled names or notes.
- Keep dependencies updated and review security advisories.
- Review GitHub Actions permissions and third-party action versions.
- Do not claim that localStorage is encrypted.
- Do not store passwords or authentication secrets in localStorage.
- Reassess the threat model before adding accounts, cloud sync, payments or third-party APIs.

If you discover a security issue, avoid publishing exploit details or private user data in a public issue. Contact the repository maintainer through the repository's available private contact channel.

---

## 24. Roadmap

The roadmap is subject to testing, provenance checks and implementation capacity.

### Product and usability

- Continue improving catalogue filters and shareable search state.
- Improve the comparison workspace with clearly explained heuristic dimensions.
- Persist full generation recipes, including seed and settings, in project snapshots.
- Improve project duplication, organization and restore workflows.
- Add safer import previews and clearer conflict summaries.

### Linguistic quality

- Expand native phrase banks only when source rights and human review are documented.
- Improve language-specific morphology and orthography.
- Review the 840-row human sample package with qualified reviewers.
- Resolve missing or weak language/generator combinations.
- Keep attested data separate from invented output.

### Legal and data governance

- Decide and publish the root project licence only after ownership review.
- Produce a dependency licence inventory and SBOM.
- Maintain source manifests and attribution notices for every imported corpus.
- Define user-facing terms and privacy notices before adding accounts or analytics.

### Technical

- Continue performance profiling on real mobile devices.
- Improve image delivery and caching based on measured results.
- Evaluate a Rust/WASM adapter only after output parity and browser fallback tests.
- Expand offline tests before claiming full offline support.
- Improve automated accessibility testing and conduct manual assistive-technology review.

No roadmap item should be presented as available until it is implemented, tested and documented in the current production release.

---

## 25. Documentation index

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Application structure, data ownership and source-of-truth map |
| [Generators](docs/GENERATORS.md) | Generator parameters, engine strategies and limitations |
| [Internationalization](docs/I18N.md) | Translation layers, supported languages and fallback behaviour |
| [Accessibility](docs/ACCESSIBILITY.md) | Contrast measurements, modal behaviour and known limits |
| [SEO](docs/SEO.md) | Static pages, canonical URLs, sitemap and hreflang |
| [Testing](docs/TESTING.md) | Automated tests and QA commands |
| [Quality workflow](docs/QUALITY.md) | Browser QA, Lighthouse and release quality gates |
| [Deployment](docs/DEPLOYMENT.md) | GitHub Pages build and release process |
| [Audit](docs/AUDIT.md) | Historical audit findings and verification boundaries |
| [Changelog](docs/CHANGELOG.md) | Changes and feature history |
| [Linguistic pipeline](docs/LINGUISTIC-PIPELINE.md) | Linguistic processing principles |
| [Linguistic toolchain](docs/LINGUISTIC-TOOLCHAIN.md) | Optional local analysis tools and integration policy |
| [Phase 3 data sources](docs/PHASE3-DATA-SOURCES.md) | Dataset provenance and licence gates |
| [Official corpus preproduction](docs/OFFICIAL-CORPUS-PREPRODUCTION.md) | External corpus preparation policy |
| [Rust engine](docs/RUST-ENGINE.md) | Native implementation, benchmarks and production boundary |
| [Performance and caching](docs/PERFORMANCE-CACHING.md) | Caching and performance notes |
| [Phase 4 roadmap](docs/PHASE-4-ROADMAP.md) | Product feature roadmap and acceptance criteria |
| [Generator quality reports](reports/generator-quality/README.md) | Automated quality metrics and human-review status |
| [Linguistic review guide](docs/audits/LINGUISTIC-REVIEW-GUIDE.md) | Reviewer rubric and instructions |
| [Native-bank source register](docs/corpus-preproduction/native-bank-source-register.md) | Dataset source and rights register |

---

## Project status summary

NameForge currently provides a broad catalogue of creative generators, a multilingual interface, a configurable naming engine, local organization tools, export/import, a typography workshop, localized SEO landing pages, a limited offline cache and automated release checks.

Its main boundaries are equally important: no account system, no cloud synchronization, no live trademark/domain verification, no browser-integrated Rust engine, incomplete native-speaker review and no root-level project licence.

**The most important next governance step is to resolve the project's software and dataset licensing clearly. The most important quality step is to complete qualified human linguistic review before making stronger claims about naturalness or cultural authenticity.**
