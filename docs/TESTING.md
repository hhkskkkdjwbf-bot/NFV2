# Tests and quality assurance

NameForge uses a layered quality gate. Run `npm install` once before using the commands below.

## Local commands

| Command | Purpose |
|---|---|
| `npm run lint` | TypeScript type-check (`tsc --noEmit`). |
| `npm test` | Unit, integration, regression, data-contract and SEO metadata tests. |
| `npm run build:gh-pages` | Production build with relative asset paths for a GitHub Pages project site. |
| `npm run test:browser` | Playwright Chromium checks, screenshots and a JSON QA report in `artifacts/visual-qa/`. |
| `npm run audit:i18n` | Audit translated generator titles, descriptions and editorial-content coverage across 28 priority locales. |
| `npm run audit:lighthouse` | Lighthouse desktop/mobile audit; writes HTML and JSON reports to `artifacts/lighthouse/`. |
| `npm run audit:pages` | Smoke-test the published GitHub Pages URL, built assets, tool routes and Arabic mobile RTL rendering. |
| `npm run quality` | Sequential local quality command: type-check, tests, build, Playwright and Lighthouse. |

## Automated coverage

### Code and data
- TypeScript type-check across the application.
- Regression coverage for Unicode graphemes, joined emoji, style transformations, username validation, bio/caption templates, symbol search and favorites, CSS generation, storage and generator-language rules.
- Dataset manifests, corpus-import contracts and generated site metadata.
- SEO-page generation is included in the GitHub Pages build.

### Playwright browser QA
The Chromium suite checks:
- Desktop and mobile layouts, including 320px narrow screens and 390px mobile screens.
- Light and dark themes on the main application routes.
- Home, generator catalogue, generator detail, saved names and typography studio.
- Username Designer, Bio & Caption Studio, and Symbols & Text Art routes.
- JavaScript runtime errors, missing images, horizontal overflow, accessible selector labels and key interactive controls.
- Localized home/catalogue/detail pages across the 28 priority locales.
- Exact French, English and Arabic headings for the three newer studios.
- Arabic RTL direction and responsive rendering on narrow mobile screens.
- Symbol insertion, favorites, generated CSS preview and PNG download in Text Art Studio.

Screenshots and machine-readable results are saved in `artifacts/visual-qa/`.

### Translation verification
The localization coverage audit reports missing or unverified generator-specific titles, descriptions and editorial fields. Category-level description fallbacks are reported separately from missing source-language fallbacks. The audit is diagnostic: a reported gap is not silently treated as a completed translation.

Playwright also verifies the document language/direction and exact key studio labels in French, English and Arabic. The current product has 28 priority interface locales; the language selector exposes additional languages that may use the documented English fallback. See [I18N.md](./I18N.md).

### Production and GitHub Pages
The development workflow runs type-check, regression tests, localization audit, GitHub Pages build, Playwright and Lighthouse on the development branch and pull requests. It does not deploy production.

The production workflow runs the same build and browser quality checks before uploading the Pages artifact. After deployment it:
1. Requests the public GitHub Pages URL.
2. Checks that JavaScript and CSS assets return successful HTTP responses.
3. Opens the three studio routes in a real browser in French, English and Arabic.
4. Checks Arabic RTL at 320px mobile width.
5. Runs Lighthouse against the published site.

A failed pre-deployment check blocks the deployment job. A failed post-deployment smoke test or Lighthouse audit is reported as a release verification failure; it cannot retroactively undo a deployment already completed.

## Reports
GitHub Actions uploads QA, localization and Lighthouse reports as workflow artifacts for 14 days. Review both the report summaries and screenshots when a test fails; a passing automated check does not replace human linguistic or visual review.
