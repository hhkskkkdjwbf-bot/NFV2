import { chromium } from 'playwright';

const baseUrl = process.env.PAGES_BASE_URL || 'https://hhkskkkdjwbf-bot.github.io/NFV2/';
const failures = [];
const checks = [];

const response = await fetch(baseUrl, { redirect: 'follow' });
if (!response.ok) throw new Error('GitHub Pages returned HTTP ' + response.status + ' for ' + baseUrl);
const html = await response.text();
if (!/<title>[^<]+<\/title>/i.test(html)) failures.push('Published HTML has no document title');
if (!/nameforge/i.test(html)) failures.push('Published HTML does not contain the expected NameForge identity');

const assetPaths = [
  ...[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((match) => match[1]),
  ...[...html.matchAll(/<link[^>]+href=["']([^"']+\.css(?:\?[^"']*)?)["']/gi)].map((match) => match[1]),
];
if (assetPaths.length === 0) failures.push('No JavaScript or CSS assets were found in the published HTML');
for (const assetPath of assetPaths) {
  const assetUrl = new URL(assetPath, baseUrl);
  const assetResponse = await fetch(assetUrl);
  checks.push({ type: 'asset', url: assetUrl.href, status: assetResponse.status });
  if (!assetResponse.ok) failures.push('Published asset failed: ' + assetUrl.href + ' (HTTP ' + assetResponse.status + ')');
}

const browser = await chromium.launch({ headless: true });
try {
  const routes = [
    { hash: '#/username-designer' },
    { hash: '#/bio-caption-studio' },
    { hash: '#/text-art-studio' },
  ];
  for (const language of ['en', 'fr', 'ar']) {
    for (const route of routes) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      await page.addInitScript((selectedLanguage) => {
        localStorage.setItem('nameforge_settings', JSON.stringify({
          language: selectedLanguage, theme: 'dark', defaultGenLanguage: 'auto', textSize: 'normal',
        }));
      }, language);
      const pageResponse = await page.goto(baseUrl + route.hash, { waitUntil: 'networkidle', timeout: 60000 });
      const heading = (await page.locator('h1').first().innerText().catch(() => '')).trim();
      const studioTools = await page.locator('button[aria-pressed]').allInnerTexts();
      const state = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        width: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        textLength: (document.body?.innerText || '').trim().length,
      }));
      const label = language + ' ' + route.hash;
      if (!pageResponse || pageResponse.status() >= 400) failures.push(label + ': route failed to load');
      if (heading !== ({ en: 'Name Designer Studio', fr: 'Studio de création de noms', ar: 'استوديو تصميم الأسماء' })[language]) failures.push(label + ': incorrect Name Designer Studio heading "' + heading + '"');
      for (const toolLabel of ({ en: ['Typography', 'Nicknames', 'Symbols & art', 'Bio & captions'], fr: ['Typographie', 'Pseudos', 'Symboles & art', 'Bios & légendes'], ar: ['الخطوط', 'الألقاب', 'الرموز والفن', 'النبذات والتعليقات'] })[language]) {
        if (!studioTools.some((value) => value.includes(toolLabel))) failures.push(label + ': unified studio tool missing: ' + toolLabel);
      }
      if (state.lang !== language) failures.push(label + ': html lang is ' + state.lang);
      if (state.dir !== (language === 'ar' ? 'rtl' : 'ltr')) failures.push(label + ': incorrect document direction ' + state.dir);
      if (state.width > state.viewport + 2) failures.push(label + ': horizontal overflow at 390px');
      if (state.textLength < 100) failures.push(label + ': page content appears incomplete');
      if (pageErrors.length) failures.push(label + ': JavaScript errors: ' + pageErrors.join(' | '));
      checks.push({ type: 'route', language, route: route.hash, status: pageResponse?.status() ?? null, heading, ...state, pageErrors });
      await page.close();
    }
  }

  const rtlPage = await browser.newPage({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' });
  await rtlPage.addInitScript(() => localStorage.setItem('nameforge_settings', JSON.stringify({
    language: 'ar', theme: 'dark', defaultGenLanguage: 'auto', textSize: 'normal',
  })));
  await rtlPage.goto(baseUrl + '#/text-art-studio', { waitUntil: 'networkidle', timeout: 60000 });
  const rtlState = await rtlPage.evaluate(() => ({
    dir: document.documentElement.dir,
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    heading: document.querySelector('h1')?.textContent?.trim() || '',
    toolLabels: [...document.querySelectorAll('button[aria-pressed]')].map((button) => button.innerText.trim()),
  }));
  if (rtlState.dir !== 'rtl') failures.push('Arabic narrow-mobile page is not RTL');
  if (rtlState.width > rtlState.viewport + 2) failures.push('Arabic Text Art page overflows at 320px');
  if (rtlState.heading !== 'استوديو تصميم الأسماء') failures.push('Arabic Name Designer Studio heading is not translated on the published site');
  for (const toolLabel of ['الخطوط', 'الألقاب', 'الرموز والفن', 'النبذات والتعليقات']) {
    if (!rtlState.toolLabels.some((value) => value.includes(toolLabel))) failures.push('Arabic unified studio tool is missing: ' + toolLabel);
  }
  checks.push({ type: 'rtl-mobile', ...rtlState });
  await rtlPage.close();
} finally {
  await browser.close();
}

const report = { baseUrl, checkedAt: new Date().toISOString(), checkCount: checks.length, failures, checks };
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
