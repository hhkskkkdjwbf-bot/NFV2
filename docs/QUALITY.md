# Quality workflow

This project uses three complementary tools:

- **Playwright** runs real-browser functional and responsive checks. The existing
  `scripts/visual-qa.mjs` suite exercises routes, UI states, themes, locales,
  generator controls, images and JavaScript errors.
- **Lighthouse** audits the production build for Performance, Accessibility,
  Best Practices and SEO. Reports are written to `artifacts/lighthouse/`.
- **Markdown** is the documentation format for project guides, architecture,
  test plans, release notes and audit reports. Keep documentation in `README.md`
  and `docs/*.md`; use fenced code blocks for commands and configuration.

## Local workflow

```bash
npm install
npx playwright install chromium
npm run lint
npm test
npm run build:gh-pages
npm run test:browser
npm run audit:lighthouse
```

Run browser and Lighthouse audits against the built production preview, not the
development server. Lighthouse requires a compatible Chrome/Chromium installation.

## Reports and interpretation

- Playwright screenshots and JSON summary: `artifacts/visual-qa/`.
- Lighthouse HTML and JSON reports: `artifacts/lighthouse/`.
- Treat Lighthouse scores as diagnostic signals, not absolute pass/fail truth.
  Investigate regressions in LCP, CLS, accessibility violations, SEO metadata,
  and console/network errors before release.
- Do not commit generated reports unless they are intentionally being used as
  release evidence; CI should upload them as workflow artifacts.

## Recommended release gate

Run type-checking, the existing unit/regression suite, a production build,
Playwright browser QA and Lighthouse. Fix critical failures before deploying.
