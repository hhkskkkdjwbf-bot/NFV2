# Deployment

Production hosting: https://hhkskkkdjwbf-bot.github.io/NFV2/

The deployment workflow is .github/workflows/deploy-pages.yml. It builds and publishes the dist/ directory from the main branch, then runs a Lighthouse audit against the published site.

For a manual build:

~~~bash
npm install
npm test
npm run build:gh-pages
~~~

The build uses relative asset paths for the GitHub Pages project URL. The canonical site origin is defined in index.html and scripts/generate-seo-pages.ts; keep both aligned with the GitHub Pages URL when the deployment address changes.

No application secrets or runtime API keys are required by the current static application. Do not add secrets to frontend source code.

The service worker provides limited caching for content-hashed same-origin assets and a previously loaded navigation response. It is not a guarantee of complete offline operation.

Generated SEO output contains 6,552 localized generator landing pages plus the home page in the sitemap (based on 234 generators and 28 SEO languages). Build output size depends on the current content and assets; measure the artifact rather than relying on an old estimate.
