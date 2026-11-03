# NameForge — Architecture & Interface Organization

## 1. Application overview

NameForge is a client-side React 18 + TypeScript + Vite application styled with Tailwind CSS.
The public site is deployed on GitHub Pages. There is currently no application backend:
personal content is stored locally in the browser and is not automatically synchronized
between devices.

## 2. Route map

The application uses hash-based navigation so direct links work on GitHub Pages.

| Route | Screen | Main responsibility |
|---|---|---|
| `#/` | Home | Introduction, discovery, featured tools and FAQ |
| `#/generators` | Generator catalogue | Search, filter and browse generator families |
| `#/generator/<id>` | Generator detail | Configure and run one generator; inspect, copy and save results |
| `#/my-names` | Personal workspace | Saved names, favorites, notes, collections, history and projects |
| `#/creative-studio/<tab>` | Creative Studio | One shared canvas for typography, usernames, symbols and bios/captions |

Legacy hashes such as `#/style-studio`, `#/text-art-studio`, `#/bio-caption-studio`
and `#/username-designer` are retained as compatibility entry points and resolve to the
unified Creative Studio.

## 3. Source organization

```
src/
  App.tsx                       Application shell, hash routing, metadata and lazy page loading
  main.tsx                      React bootstrap and global stylesheet imports
  components/
    Navbar.tsx                  Main navigation, language and settings entry points
    Footer.tsx                  Global footer
    GeneratorControl.tsx        Shared generator configuration controls
    NameCard.tsx                Generated result actions and details
    SettingsModal.tsx           Language, theme, text size, motion and data controls
    LanguageSelectorModal.tsx   Searchable language picker
    ProjectWorkspace.tsx        Saved workspace snapshots
    *Modal.tsx                  Focus-managed detail, note, collection and compare dialogs
  views/
    HomeView.tsx                Landing page
    GeneratorsListView.tsx      Searchable generator catalogue
    GeneratorDetailView.tsx     Generator workspace
    MyNamesView.tsx             Saved content workspace
    CreativeStudioView.tsx      Unified creative canvas
    StyleStudioView.tsx         Legacy standalone implementation
    TextArtStudioView.tsx       Legacy standalone implementation
    BioCaptionStudioView.tsx    Legacy standalone implementation
    UsernameDesignerView.tsx    Legacy standalone implementation
  services/
    generatorEngine.ts          Name generation pipeline
    storage.ts                  Saved content, projects, history, import/export and ratings
    settings.ts                 Preference normalization, persistence and DOM synchronization
    diversity.ts                Result diversity and selection
    linguistic*.ts              Linguistic validation and language-specific rules
    textStyler.ts                Unicode styles and visual effects
    textArtStudio.ts             Symbols, favorites and presets
    usernameDesigner.ts          Username suggestions
    bioCaptionStudio.ts          Bio and caption templates
  data/                         Generator metadata, categories, vocabularies and phrase banks
  i18n/                         Interface translations and localized generator content
  styles/
    design-system.css           Shared visual tokens and responsive component rules
    animated-headings.css       Decorative heading effects
  tests/                        Unit, integration and regression tests
scripts/                         Build, SEO, browser QA, smoke and Lighthouse audits
```

## 4. Shared design system

The global stylesheet is loaded once from `src/main.tsx`.

- `src/index.css` contains Tailwind, legacy utility compatibility, theme mappings,
  responsive rules, focus styles and contrast corrections.
- `src/styles/design-system.css` defines the shared NameForge surface, ink, border,
  accent, radius and shadow tokens, plus consistent page, header, footer and control behavior.
- Page roots use `nf-page` plus a page-specific class. This lets global visual changes be
  made without rewriting each feature's internal layout.
- Dark, light and system themes are stored in the shared settings service. The Creative
  Studio theme switch updates the same global preference.

When adding a new component, prefer existing design tokens and shared utility patterns
instead of introducing another unrelated palette of hard-coded colors.

## 5. State and storage boundaries

| Content | Storage | Reset behavior |
|---|---|---|
| Interface preferences | `nameforge_settings` | Preserved |
| Saved names | `nameforge_saved_names` | Cleared |
| Collections | `nameforge_collections` | Cleared |
| Saved workspace projects | `nameforge_saved_projects` | Cleared |
| Generation history | `nameforge_generation_history` | Cleared |
| Recent generation names | `nameforge_recent_names` | Cleared |
| Per-name ratings | `nameforge_rating_*` | Cleared |
| Creative Studio saved designs | `nameforge.unified-designs.v1` | Cleared |
| Text-art symbol favorites | `nameforge.text-art.favorites.v1` | Cleared |

The settings reset intentionally preserves language, theme, text size, reduced-motion and
default generation-language preferences. Import routines validate incoming JSON before
mutating stored content. Saved project restoration is additive and should not silently
overwrite the current workspace.

## 6. Navigation and loading

- `App.tsx` owns the active route and browser hash synchronization.
- The main screens are loaded with React `lazy()` and a shared `Suspense` fallback.
- The generator engine and linguistic/data services remain separate from presentation
  components.
- Generator IDs are stable URL identifiers; do not rename an ID without a compatibility
  mapping for existing links and stored records.
- The shared Creative Studio is the active entry point for the four creative capabilities.
  Keep legacy hashes functional while avoiding duplicate navigation destinations.

## 7. Accessibility and responsive behavior

- Keep a single main landmark and a skip-to-content link.
- Dialogs must expose dialog semantics, a labelled title, Escape handling and focus management.
- Toggle and choice buttons must expose their selected state with `aria-pressed`.
- Every form control needs a visible label or an accessible name.
- Preserve RTL layout for Arabic and Hebrew where supported by the language metadata.
- Check narrow mobile widths (320 px and 390 px), tablet and desktop layouts.
- Respect both the saved reduced-motion preference and the operating-system preference.

## 8. Quality gates

The production workflow runs, in order:

1. Dependency installation and dependency vulnerability audit.
2. TypeScript type-check.
3. Unit, integration and regression tests.
4. GitHub Pages production build.
5. Playwright visual and interaction checks in light/dark themes and desktop/mobile viewports.
6. Lighthouse performance, accessibility, best-practices and SEO audits.
7. Pages artifact deployment.
8. Published-site smoke test and a second Lighthouse audit against the live URL.

A green build alone is not proof that every generated name is linguistically natural.
Technical quality, interface quality and linguistic quality are tracked separately.

## 9. Local commands

- `npm run dev` — start the Vite development server.
- `npm run lint` — TypeScript check.
- `npm test` — unit and regression test suite.
- `npm run build:gh-pages` — production build using relative asset paths.
- `npm run test:browser` — Playwright visual and interaction QA.
- `npm run audit:lighthouse` — Lighthouse audit.
- `npm run audit:pages` — published GitHub Pages smoke test.
- `npm run audit:i18n` — localization coverage audit.
