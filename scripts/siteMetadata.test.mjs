import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

assert.ok(sitemap.includes('<urlset'), 'sitemap must contain a urlset root');
assert.ok(sitemap.includes('</urlset>'), 'sitemap must close its urlset root');
assert.deepEqual(
  locations,
  ['https://jjspa4830-hue.github.io/nameforge-V2/'],
  'source fallback sitemap should include the homepage before build-time expansion'
);
assert.ok(
  locations.every((url) => !url.includes('#')),
  'sitemap entries must not use URL fragments as crawlable pages'
);
assert.ok(
  !sitemap.includes('rayanellg.github.io/nameforge'),
  'published sitemap must not point to the previous deployment'
);

console.log('Site metadata checks passed: sitemap URL and crawlable entries are valid.');

const seoMetadata = readFileSync(new URL('../src/i18n/seoMetadata.ts', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const localizedSeoLanguages = [...seoMetadata.matchAll(/^  ([a-z]{2}): \{ home:/gm)].map((match) => match[1]);
assert.equal(localizedSeoLanguages.length, 28, 'SEO descriptions should cover all 28 supported languages');
assert.deepEqual(
  localizedSeoLanguages,
  ['en', 'fr', 'es', 'de', 'it', 'pt', 'ar', 'tr', 'ja', 'ko', 'zh', 'ru', 'hi', 'nl', 'pl', 'sv', 'vi', 'id', 'th', 'el', 'he', 'cs', 'ro', 'da', 'fi', 'uk', 'bn', 'nb'],
  'SEO language coverage should match the supported 28-language list'
);
assert.ok(appSource.includes("setMetaContent('meta[name=\"description\"]', description)"), 'active page should update its description');
assert.ok(appSource.includes("setMetaContent('meta[property=\"og:title\"]', title)"), 'active page should update Open Graph title');
assert.ok(appSource.includes("setMetaContent('meta[name=\"twitter:description\"]', description)"), 'active page should update Twitter description');
assert.ok(seoMetadata.includes("const FALLBACK = COPY.en"), 'unknown languages should safely fall back to English');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
assert.ok(packageJson.includes('npx tsx scripts/generate-seo-pages.ts'), 'both production build scripts should generate static SEO pages');

console.log('Dynamic SEO metadata checks passed: 28 locales and social metadata updates are covered.');

const corpusScript = readFileSync(new URL('./prepare_russian_native_bank.py', import.meta.url), 'utf8');
assert.ok(corpusScript.includes('EXPECTED_SHA256'), 'Russian conversion must pin raw source checksum');
assert.ok(corpusScript.includes('runtimeEligible'), 'Russian staged records must carry runtime gate');
assert.ok(corpusScript.includes('sourceInternationalForms'), 'international forms must remain separate');
const corpusWorkflow = readFileSync(new URL('../.github/workflows/native-bank-preproduction.yml', import.meta.url), 'utf8');
assert.ok(corpusWorkflow.includes('python scripts/prepare_russian_native_bank.py') && corpusWorkflow.includes('git diff --exit-code'), 'CI must verify reproducible conversion');
console.log('Native corpus preproduction checks passed.');

const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const mainEntry = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
assert.ok(mainEntry.includes('navigator.serviceWorker.register'), 'production app should register its offline asset cache');
assert.ok(serviceWorker.includes('nameforge-static-v1'), 'hashed assets should use a versioned cache');
assert.ok(serviceWorker.includes("request.mode === 'navigate'"), 'HTML navigation should use network-first cache strategy');
assert.ok(serviceWorker.includes('HASHED_ASSET.test(url.pathname)'), 'only content-hashed static assets should use cache-first');
console.log('Offline cache checks passed: versioned hashed assets and network-first HTML.');

const generatorDetail = readFileSync(new URL('../src/views/GeneratorDetailView.tsx', import.meta.url), 'utf8');
const generatorEngine = readFileSync(new URL('../src/services/generatorEngine.ts', import.meta.url), 'utf8');
assert.ok(generatorDetail.includes('id="nameforge-seed"'), 'generator page should expose the reproducibility seed');
assert.ok(generatorDetail.includes('seed: seed.trim() || undefined'), 'generator page should pass a non-empty seed to the engine');
assert.ok(generatorDetail.includes('The same seed and settings reproduce the same batch'), 'seed UI should explain reproducibility');
assert.ok(generatorEngine.includes('activeRandom = mulberry32(hashSeed(options.seed))'), 'seeded generation should use the deterministic PRNG');
console.log('Reproducible generation UI checks passed.');

const generatorCatalogue = readFileSync(new URL('../src/views/GeneratorsListView.tsx', import.meta.url), 'utf8');
assert.ok(generatorCatalogue.includes('searchInDescriptions'), 'advanced generator search should allow searching descriptions');
assert.ok(generatorCatalogue.includes("sortMode === 'alphabetical'"), 'generator catalogue should support alphabetical sorting');
assert.ok(generatorCatalogue.includes("useState<'relevance' | 'alphabetical'>"), 'generator catalogue should expose relevance and alphabetical sort modes');

const projectStorage = readFileSync(new URL('../src/services/storage.ts', import.meta.url), 'utf8');
const projectWorkspace = readFileSync(new URL('../src/components/ProjectWorkspace.tsx', import.meta.url), 'utf8');
assert.ok(projectStorage.includes('export function createSavedProject'), 'users should be able to save named project snapshots');
assert.ok(projectStorage.includes('export function restoreSavedProject'), 'saved project snapshots should be restorable');
assert.ok(projectStorage.includes('version: 3'), 'new JSON backups should use schema version 3');
assert.ok(projectStorage.includes('Version de sauvegarde non prise en charge'), 'unsupported backup versions should be rejected');
assert.ok(projectWorkspace.includes('Add to my workspace'), 'saved projects should be accessible from the personal workspace');
console.log('Phase 4 workspace checks passed: multi-criteria search, saved projects, and versioned backups.');
