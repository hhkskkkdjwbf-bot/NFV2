import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.VISUAL_QA_BASE_URL || 'http://127.0.0.1:4173/';
const outputDir = 'artifacts/visual-qa';
await mkdir(outputDir, { recursive: true });

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
  stdio: 'ignore',
  shell: process.platform === 'win32',
});

let browser;
const failures = [];
const results = [];
const localizationFindings = [];
const visualComparisons = [];
async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Vite preview did not become available at ' + baseUrl);
}

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'tablet', width: 1024, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'mobile-narrow', width: 320, height: 740 },
  ];
  const themes = ['light', 'dark'];
  const pages = [
    { name: 'home', hash: '' },
    { name: 'catalog', hash: '#/generators' },
    { name: 'generator-detail', hash: '#/generator/fantasy' },
    { name: 'my-names', hash: '#/my-names' },
    { name: 'creative-studio', hash: '#/creative-studio' },
    { name: 'style-studio', hash: '#/style-studio' },
    { name: 'username-designer', hash: '#/username-designer' },
    { name: 'bio-caption-studio', hash: '#/bio-caption-studio' },
    { name: 'text-art-studio', hash: '#/text-art-studio' },
  ];

  for (const viewport of viewports) {
    for (const theme of themes) {
      for (const view of pages) {
        const page = await browser.newPage({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
        });
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));
        await page.addInitScript((selectedTheme) => {
          localStorage.setItem('nameforge_settings', JSON.stringify({
            language: 'en',
            theme: selectedTheme,
            defaultGenLanguage: 'auto',
            textSize: 'normal',
          }));
        }, theme);

        const response = await page.goto(baseUrl + view.hash, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(500);

        const state = await page.evaluate(() => {
          const rootStyle = getComputedStyle(document.documentElement);
          const color = (value) => {
            const parts = value.match(/[\d.]+/g)?.map(Number) || [];
            if (parts.length < 3) return null;
            const channels = parts.slice(0, 3).map((part) => part / 255).map((part) =>
              part <= 0.04045 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4
            );
            return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
          };
          const contrast = (foreground, background) => {
            const a = color(foreground), b = color(background);
            if (a === null || b === null) return null;
            return Number(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2));
          };
          const selectors = ['header', 'main', 'footer', '.nf-container', '.nf-page-header', '.nf-generator-grid', '.nf-studio-workspace'];
          const geometry = selectors.flatMap((selector) => [...document.querySelectorAll(selector)].slice(0, 4).map((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              selector, x: Math.round(rect.x), y: Math.round(rect.y),
              width: Math.round(rect.width), height: Math.round(rect.height),
              display: style.display, position: style.position,
              visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
            };
          })).filter((item) => item.visible);
          const tokens = ['--nf-page-bg', '--nf-surface', '--nf-ink', '--nf-muted', '--nf-accent', '--nf-border', '--nf-motion-fast', '--nf-motion-normal', '--nf-motion-slow'];
          const colors = Object.fromEntries(tokens.map((token) => [token, rootStyle.getPropertyValue(token).trim()]));
          const inkColor = getComputedStyle(document.querySelector('main') || document.body).color;
          const pageBackground = getComputedStyle(document.body).backgroundColor;
          const isVisible = (element) => {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
          };
          const paletteHeading = [...document.querySelectorAll('main h1, main h2')].find(isVisible);
          const paletteButton = [...document.querySelectorAll(
            'main button:not(:disabled):not([aria-disabled="true"]):not([class*="bg-red-"]):not([class*="bg-rose-"]), main [role="button"]:not([aria-disabled="true"]):not([class*="bg-red-"]):not([class*="bg-rose-"])'
          )].find(isVisible);
          const paletteField = [...document.querySelectorAll(
            'main input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]), main select, main textarea'
          )].find(isVisible);
          const palette = {
            heading: paletteHeading ? {
              color: getComputedStyle(paletteHeading).color,
              textFill: getComputedStyle(paletteHeading).webkitTextFillColor,
            } : null,
            button: paletteButton ? {
              color: getComputedStyle(paletteButton).color,
              background: getComputedStyle(paletteButton).backgroundColor,
              label: (paletteButton.innerText || paletteButton.getAttribute('aria-label') || '').trim().slice(0, 80),
              disabled: paletteButton.matches(':disabled,[aria-disabled="true"]'),
            } : null,
            field: paletteField ? {
              color: getComputedStyle(paletteField).color,
              background: getComputedStyle(paletteField).backgroundColor,
              type: paletteField.tagName.toLowerCase() === 'input' ? paletteField.type : paletteField.tagName.toLowerCase(),
            } : null,
          };
          const motionNodes = [...document.querySelectorAll('main button, main a, main article')].slice(0, 80);
          const catalogCardHeights = [...document.querySelectorAll('.nf-generator-card')].map((element) => Math.round(element.getBoundingClientRect().height));
          const motionDurations = motionNodes.map((element) => getComputedStyle(element).transitionDuration.split(',').map((value) => parseFloat(value) || 0));
          return {
          title: document.title,
          bodyTextLength: (document.body?.innerText || '').trim().length,
          htmlClass: document.documentElement.className,
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          mainCount: document.querySelectorAll('main').length,
          articleCount: document.querySelectorAll('article').length,
          selects: [...document.querySelectorAll('select')].map((select) => {
            const rect = select.getBoundingClientRect();
            const style = getComputedStyle(select);
            return {
              id: select.id,
              label: select.labels?.[0]?.innerText?.trim() || select.getAttribute('aria-label') || '',
              optionCount: select.options.length,
              visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              backgroundImage: style.backgroundImage,
              value: select.value,
            };
          }).filter((select) => select.visible),
          pressedChoiceCount: document.querySelectorAll('button[aria-pressed], button[aria-selected]').length,
          visiblePressedChoiceCount: [...document.querySelectorAll('button[aria-pressed], button[aria-selected]')].filter((button) => {
            const rect = button.getBoundingClientRect();
            const style = getComputedStyle(button);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
          }).length,
          images: [...document.images].map((img) => ({
            src: img.currentSrc || img.src,
            loaded: img.complete && img.naturalWidth > 0,
          })),
          geometry,
          colors,
          palette,
          inkContrast: contrast(inkColor, pageBackground),
          reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          maxTransitionSeconds: motionDurations.flat().reduce((max, value) => Math.max(max, value), 0),
          catalogCardHeights,
          };
        });

        const label = viewport.name + '-' + theme + '-' + view.name;
        const screenshotPath = outputDir + '/' + label + '.png';

        await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });

        // Audit layout geometry, design tokens, contrast and reduced-motion behavior.
        if (!state.colors['--nf-page-bg'] || !state.colors['--nf-surface'] || !state.colors['--nf-ink'] || !state.colors['--nf-accent']) {
          failures.push(label + ': one or more core design color tokens are missing');
        }
        if (state.inkContrast !== null && state.inkContrast < 4.5) {
          failures.push(label + ': primary text contrast is below WCAG AA (ratio ' + state.inkContrast + ')');
        }
        if (theme === 'light') {
          const isBlack = (value) => value === 'rgb(0, 0, 0)';
          if (!state.palette.heading || !(isBlack(state.palette.heading.textFill) || isBlack(state.palette.heading.color))) {
            failures.push(label + ': visible page heading is not black in light mode');
          }
          if (!state.palette.button || !isBlack(state.palette.button.color) || !state.palette.button.background.includes('0, 191, 255')) {
            failures.push(label + ': visible action button does not use the blue background with black text');
          }
          if (!state.palette.field || !isBlack(state.palette.field.color) || state.palette.field.background !== 'rgb(255, 255, 255)') {
            failures.push(label + ': visible form field is not white with black text in light mode');
          }
        }
        if (!state.reducedMotion) failures.push(label + ': reduced-motion preference was not applied in the browser context');
        if (state.maxTransitionSeconds > 0.02) failures.push(label + ': reduced-motion leaves a long transition (' + state.maxTransitionSeconds + 's)');
        for (const box of state.geometry) {
          if (box.width < 0 || box.height < 0) failures.push(label + ': invalid geometry for ' + box.selector);
          if (box.x + box.width > state.viewportWidth + 3 && box.selector !== 'footer') {
            failures.push(label + ': ' + box.selector + ' exceeds the viewport width');
          }
        }
        const primaryContainer = state.geometry.find((box) => box.selector === '.nf-container');
        if (primaryContainer && viewport.name === 'desktop') {
          const centerOffset = Math.abs((primaryContainer.x + primaryContainer.width / 2) - viewport.width / 2);
          if (centerOffset > 28) failures.push(label + ': main container is visibly off-center (' + Math.round(centerOffset) + 'px)');
        }

        // Compare repeat captures at pixel level on stable desktop routes. The report
        // records the changed-pixel ratio so later commits can be reviewed consistently.
        if (viewport.name === 'desktop' && ['home', 'catalog', 'creative-studio'].includes(view.name)) {
          const firstCapture = await page.screenshot({ fullPage: false, animations: 'disabled' });
          await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
          await page.waitForTimeout(350);
          const secondCapture = await page.screenshot({ fullPage: false, animations: 'disabled' });
          const comparison = await page.evaluate(async ({ first, second }) => {
            const decode = (base64) => new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => resolve(image);
              image.onerror = reject;
              image.src = 'data:image/png;base64,' + base64;
            });
            const [a, b] = await Promise.all([decode(first), decode(second)]);
            if (a.width !== b.width || a.height !== b.height) return { width: a.width, height: a.height, changedPixels: -1, changedRatio: 1 };
            const canvas = document.createElement('canvas');
            canvas.width = a.width; canvas.height = a.height;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            context.drawImage(a, 0, 0);
            const pixelsA = context.getImageData(0, 0, canvas.width, canvas.height).data;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(b, 0, 0);
            const pixelsB = context.getImageData(0, 0, canvas.width, canvas.height).data;
            let changedPixels = 0;
            for (let index = 0; index < pixelsA.length; index += 4) {
              if (Math.abs(pixelsA[index] - pixelsB[index]) > 8 ||
                  Math.abs(pixelsA[index + 1] - pixelsB[index + 1]) > 8 ||
                  Math.abs(pixelsA[index + 2] - pixelsB[index + 2]) > 8 ||
                  Math.abs(pixelsA[index + 3] - pixelsB[index + 3]) > 8) changedPixels += 1;
            }
            const totalPixels = canvas.width * canvas.height;
            return { width: canvas.width, height: canvas.height, changedPixels, changedRatio: Number((changedPixels / totalPixels).toFixed(5)) };
          }, { first: firstCapture.toString('base64'), second: secondCapture.toString('base64') });
          visualComparisons.push({ label, ...comparison });
          if (comparison.changedRatio > 0.08) failures.push(label + ': repeated screenshot comparison changed more than 8% of pixels (' + comparison.changedRatio + ')');
        }

        // Expand every FAQ answer so each accordion's content and light/dark styling
        // is actually rendered, not only represented by its collapsed heading.
        if (view.name === 'home') {
          // Settings is a second entry point for generation-language choices.
          const settingsButton = page.locator('button[aria-label="Settings"]:visible').first();
          if (await settingsButton.count()) {
            await settingsButton.click();
            const settingsDialog = page.locator('[role="dialog"][aria-labelledby="settings-title"]');
            const defaultLanguage = settingsDialog.locator('#settings-default-generation-language');
            if (!(await defaultLanguage.isVisible())) failures.push(label + ': default generation-language selector is missing or hidden in Settings');
            const selectedSettings = await settingsDialog.locator('button[aria-pressed="true"]').count();
            if (selectedSettings < 3) failures.push(label + ': language, theme, and text-size settings do not expose their selected state');
            if (await defaultLanguage.count()) {
              if (await defaultLanguage.locator('option').count() < 20) failures.push(label + ': Settings language selector has fewer than 20 language choices');
              const indicator = await defaultLanguage.evaluate((select) => getComputedStyle(select).backgroundImage);
              if (indicator === 'none') failures.push(label + ': Settings language selector has no visible dropdown indicator');
            }
            await settingsDialog.locator('button[aria-label]').first().click();
          } else {
            failures.push(label + ': Settings button is not discoverable by its accessible name');
          }

          const faqSection = page.getByTestId('home-faq-section');
          // The FAQ is intentionally deferred until it approaches the viewport.
          // Bring it into view before asserting its contents so this QA check
          // validates the lazy-loading contract instead of expecting eager rendering.
          await faqSection.scrollIntoViewIfNeeded();
          await page.waitForTimeout(150);
          const faqItems = faqSection.locator('.nf-faq-list > .nf-faq-item');
          const faqButtons = faqItems.locator('button');
          const faqCount = await faqButtons.count();
          if (faqCount < 10) failures.push(label + ': expected a substantial FAQ list, found ' + faqCount + ' items');
          for (let index = 0; index < faqCount; index++) {
            const item = faqItems.nth(index);
            const button = item.locator('button');
            const answer = item.locator('.nf-faq-answer');
            await button.scrollIntoViewIfNeeded();
            if (!(await answer.isVisible())) await button.click();
            if (!(await answer.isVisible())) {
              failures.push(label + ': FAQ answer ' + (index + 1) + ' did not open');
              continue;
            }
            const answerText = (await answer.innerText()).trim();
            if (answerText.length < 10) failures.push(label + ': FAQ answer ' + (index + 1) + ' is empty or too short');
            if (viewport.name === 'desktop') {
              const faqShot = outputDir + '/faq-' + theme + '-' + String(index + 1).padStart(2, '0') + '.png';
              await item.screenshot({ path: faqShot, animations: 'disabled' });
            }
          }
          const familyChoices = page.locator('button[aria-pressed]');
          if (await familyChoices.count() > 1) {
            await familyChoices.nth(1).click();
            if (await familyChoices.nth(1).getAttribute('aria-pressed') !== 'true') {
              failures.push(label + ': home category choice did not expose its selected state after interaction');
            }
          } else {
            failures.push(label + ': home category choice buttons are missing');
          }
        }

        if (!response || response.status() >= 400) failures.push(label + ': HTTP response failed (' + (response?.status() ?? 'none') + ')');
        if (state.bodyTextLength < 100) failures.push(label + ': likely blank/incomplete page (' + state.bodyTextLength + ' text characters)');
        if (!state.htmlClass.includes(theme === 'light' ? 'light' : 'dark')) failures.push(label + ': requested theme class missing; html class=' + state.htmlClass);
        if (state.documentWidth > state.viewportWidth + 2) failures.push(label + ': horizontal overflow (' + state.documentWidth + 'px content vs ' + state.viewportWidth + 'px viewport)');
        for (const select of state.selects) {
          if (!select.visible) failures.push(label + ': selector ' + (select.id || select.label || '(unlabelled)') + ' is not visible');
          if (select.optionCount < 2) failures.push(label + ': selector ' + (select.id || select.label || '(unlabelled)') + ' has fewer than 2 options');
          if (select.backgroundImage === 'none') failures.push(label + ': selector ' + (select.id || select.label || '(unlabelled)') + ' has no visible dropdown indicator');
          if (!select.label) failures.push(label + ': selector ' + (select.id || '(unlabelled)') + ' has no accessible label');
        }
        if (view.name === 'home' && state.visiblePressedChoiceCount < 5) failures.push(label + ': home-page multi-choice filters are missing selected-state semantics or are not visible');
        if (view.name === 'catalog' && state.articleCount !== 234) failures.push(label + ': expected 234 generator cards, found ' + state.articleCount);
        if (view.name === 'catalog' && state.catalogCardHeights.length > 1) {
          const spread = Math.max(...state.catalogCardHeights) - Math.min(...state.catalogCardHeights);
          if (spread > 3) failures.push(label + ': catalogue card heights are inconsistent (' + spread + 'px spread)');
        }
        if (view.name === 'catalog' && state.visiblePressedChoiceCount < 2) failures.push(label + ': category choice buttons are missing or not visible');
        if (view.name === 'style-studio' && state.visiblePressedChoiceCount < 4) failures.push(label + ': expected the four visible Style Studio tab choices');
        if (view.name === 'generator-detail') {
          if (state.selects.length < 6) failures.push(label + ': expected 6 generator selectors, found ' + state.selects.length);
          // Exercise each control to verify the choice is functional, not just decorative.
          for (const id of ['generator-style', 'generator-language', 'generator-length', 'generator-format', 'generator-gender', 'generator-quantity']) {
            const control = page.locator('#' + id);
            if (await control.count()) {
              const optionCount = await control.locator('option').count();
              const oldValue = await control.inputValue();
              if (optionCount > 1) {
                const secondValue = await control.locator('option').nth(1).getAttribute('value');
                const nextIndex = oldValue === secondValue ? 0 : 1;
                const nextValue = await control.locator('option').nth(nextIndex).getAttribute('value');
                if (nextValue !== oldValue) {
                  await control.selectOption({ index: nextIndex });
                  const selectedValue = await control.inputValue();
                  if (selectedValue !== nextValue) failures.push(label + ': ' + id + ' did not accept a new selection');
                } else {
                  failures.push(label + ': ' + id + ' has no distinct selectable value');
                }
              }
            }
          }
        }
        if (pageErrors.length) failures.push(label + ': JavaScript page errors: ' + pageErrors.join(' | '));
        const brokenImages = state.images.filter((img) => !img.loaded && !img.src.startsWith('data:'));
        if (brokenImages.length) failures.push(label + ': broken images: ' + brokenImages.map((img) => img.src).join(', '));

        results.push({
          view: view.name,
          theme,
          viewport: viewport.name,
          status: response?.status() ?? null,
          title: state.title,
          textCharacters: state.bodyTextLength,
          htmlClass: state.htmlClass,
          viewportWidth: state.viewportWidth,
          documentWidth: state.documentWidth,
          paletteDiagnostics: {
            heading: state.palette.heading,
            button: state.palette.button,
            field: state.palette.field,
          },
          articleCount: state.articleCount,
          imageCount: state.images.length,
          brokenImageCount: brokenImages.length,
          pageErrors,
          screenshot: screenshotPath,
        });
        await page.close();
      }
    }
  }

  const primaryLanguages = ['fr','en','ar','tr','es','de','it','pt','ja','ko','zh','ru','hi','nl','pl','sv','vi','id','th','el','he','cs','ro','da','fi','uk','bn','nb'];
  for (const language of primaryLanguages) {
    for (const theme of themes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.addInitScript(({ selectedLanguage, selectedTheme }) => {
      localStorage.setItem('nameforge_settings', JSON.stringify({ language: selectedLanguage, theme: selectedTheme, defaultGenLanguage: 'auto', textSize: 'normal' }));
    }, { selectedLanguage: language, selectedTheme: theme });
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(300);
    const state = await page.evaluate(() => ({ text: (document.body?.innerText || '').trim(), width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    const label = 'locale-' + language + '-' + theme;
    const screenshotPath = outputDir + '/' + label + '.png';
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
    if (!response || response.status() >= 400) failures.push(label + ': HTTP response failed');
    if (state.text.length < 100) failures.push(label + ': likely blank Home page');
    if (state.width > state.viewport + 2) failures.push(label + ': horizontal overflow');
    if (pageErrors.length) failures.push(label + ': JavaScript page errors: ' + pageErrors.join(' | '));
    if (!(await page.getByTestId('home-faq-section').count())) failures.push(label + ': FAQ section missing');
    results.push({ view: 'home-localization', language, theme, viewport: 'desktop', status: response?.status() ?? null, textCharacters: state.text.length, documentWidth: state.width, viewportWidth: state.viewport, pageErrors, screenshot: screenshotPath });
    await page.close();
    }
  }

  // Expand locale coverage beyond the home page: verify the catalogue and a
  // generator detail page in every supported priority locale and both themes.
  // Keep this matrix desktop-only; the full responsive matrix above covers both viewports.
  const localizationPages = [
    { name: 'catalog-localization', hash: '#/generators' },
    { name: 'detail-localization', hash: '#/generator/fantasy' },
  ];
  const expectedRtlLanguages = new Set(['ar', 'he']);
    for (const language of primaryLanguages) {
    for (const theme of themes) {
      for (const view of localizationPages) {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));
        await page.addInitScript(({ selectedLanguage, selectedTheme }) => {
          localStorage.setItem('nameforge_settings', JSON.stringify({
            language: selectedLanguage, theme: selectedTheme,
            defaultGenLanguage: 'auto', textSize: 'normal',
          }));
        }, { selectedLanguage: language, selectedTheme: theme });
        const response = await page.goto(baseUrl + view.hash, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(300);
        const state = await page.evaluate(() => ({
          text: (document.body?.innerText || '').trim(),
          title: document.title,
          htmlLang: document.documentElement.lang,
          htmlDir: document.documentElement.dir,
          width: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
          headings: [...document.querySelectorAll('h1,h2')].slice(0, 12).map((el) => (el.textContent || '').trim()),
          cards: [...document.querySelectorAll('article h2')].map((el) => (el.textContent || '').trim()),
          frenchMarkers: [
            'Générateur de Noms', 'Comment choisir', 'Avantages clés',
            'Points de vigilance', 'Applications & Univers Recommandés',
            'Explorer d’autres catégories', 'Générateur de noms',
          ].filter((marker) => (document.body?.innerText || '').includes(marker)),
        }));
        const label = view.name + '-' + language + '-' + theme;
        const screenshotPath = outputDir + '/' + label + '.png';
        await page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled' });
        if (!response || response.status() >= 400) failures.push(label + ': HTTP response failed');
        if (state.text.length < 100) failures.push(label + ': likely blank or incomplete page');
        if (state.width > state.viewport + 2) failures.push(label + ': horizontal overflow');
        if (state.htmlLang !== language) failures.push(label + ': html lang mismatch (' + state.htmlLang + ')');
        const expectedDir = expectedRtlLanguages.has(language) ? 'rtl' : 'ltr';
        if (state.htmlDir !== expectedDir) failures.push(label + ': expected dir=' + expectedDir + ', got ' + state.htmlDir);
        if (pageErrors.length) failures.push(label + ': JavaScript page errors: ' + pageErrors.join(' | '));
        if (view.name === 'catalog-localization' && await page.locator('article').count() !== 234) {
          failures.push(label + ': expected 234 generator cards, found ' + await page.locator('article').count());
        }
        // Preserve visible text samples in the report for language-by-language review.
        // These are diagnostic findings, not automatic failures: proper nouns and
        // intentionally source-language name examples must not be translated blindly.
        localizationFindings.push({
          language, theme, view: view.name, title: state.title,
          headings: state.headings, generatorCardTitles: state.cards,
          potentialFrenchFallbackMarkers: language === 'fr' ? [] : state.frenchMarkers,
          htmlLang: state.htmlLang, htmlDir: state.htmlDir,
        });
        results.push({
          view: view.name, language, theme, viewport: 'desktop',
          status: response?.status() ?? null, textCharacters: state.text.length,
          documentWidth: state.width, viewportWidth: state.viewport,
          pageErrors, screenshot: screenshotPath,
        });
        await page.close();
      }
    }
  }

  // Focused responsive and translation coverage for the three newly added studios.
  const studioPages = [
    { name: 'username-designer', hash: '#/username-designer', titles: { fr: 'Studio de création de noms', en: 'Name Designer Studio', ar: 'استوديو تصميم الأسماء' } },
    { name: 'bio-caption-studio', hash: '#/bio-caption-studio', titles: { fr: 'Studio de création de noms', en: 'Name Designer Studio', ar: 'استوديو تصميم الأسماء' } },
    { name: 'text-art-studio', hash: '#/text-art-studio', titles: { fr: 'Studio de création de noms', en: 'Name Designer Studio', ar: 'استوديو تصميم الأسماء' } },
  ];
  for (const language of ['fr', 'en', 'ar']) {
    for (const viewport of [{ name: 'mobile-320', width: 320, height: 740 }, { name: 'mobile-390', width: 390, height: 844 }]) {
      for (const view of studioPages) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));
        await page.addInitScript((selectedLanguage) => {
          localStorage.setItem('nameforge_settings', JSON.stringify({ language: selectedLanguage, theme: 'dark', defaultGenLanguage: 'auto', textSize: 'normal' }));
        }, language);
        const response = await page.goto(baseUrl + view.hash, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(250);
        const heading = (await page.getByRole('heading', { name: view.titles[language] }).first().innerText().catch(() => '')).trim();
        const state = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          width: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
          text: (document.body?.innerText || '').trim(),
          overflowElements: [...document.querySelectorAll('body *')].map((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return { tag: el.tagName.toLowerCase(), id: el.id, className: typeof el.className === 'string' ? el.className : '', text: (el.textContent || '').trim().slice(0, 70), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, overflowX: style.overflowX };
          }).filter((item) => item.right > window.innerWidth + 1 || item.left < -1 || item.scrollWidth > item.clientWidth + 2).slice(0, 12),
        }));
        const label = 'studio-' + view.name + '-' + language + '-' + viewport.name;
        const screenshot = outputDir + '/' + label + '.png';
        await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
        if (!response || response.status() >= 400) failures.push(label + ': HTTP response failed');
        if (heading !== view.titles[language]) failures.push(label + ': translated h1 mismatch; expected "' + view.titles[language] + '", got "' + heading + '"');
        if (state.lang !== language) failures.push(label + ': html lang mismatch (' + state.lang + ')');
        const expectedDir = language === 'ar' ? 'rtl' : 'ltr';
        if (state.dir !== expectedDir) failures.push(label + ': expected document direction ' + expectedDir + ', got ' + state.dir);
        if (state.width > state.viewport + 2) failures.push(label + ': horizontal overflow (' + state.width + 'px vs ' + state.viewport + 'px); elements=' + JSON.stringify(state.overflowElements));
        if (state.text.length < 100) failures.push(label + ': incomplete studio content');
        if (pageErrors.length) failures.push(label + ': JavaScript page errors: ' + pageErrors.join(' | '));
        results.push({ view: view.name, language, viewport: viewport.name, status: response?.status() ?? null, heading, htmlLang: state.lang, htmlDir: state.dir, documentWidth: state.width, viewportWidth: state.viewport, pageErrors, screenshot });
        await page.close();
      }
    }
  }

  // Verify the single-canvas workspace and real cross-tool interactions.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('nameforge_settings', JSON.stringify({ language: 'en', theme: 'dark', defaultGenLanguage: 'auto', textSize: 'normal' })));
    const response = await page.goto(baseUrl + '#/creative-studio', { waitUntil: 'networkidle', timeout: 45000 });
    if (!response || response.status() >= 400) failures.push('creative-studio: workspace failed to load');
    const nameInput = page.getByTestId('unified-name-input');
    const preview = page.getByTestId('designer-live-preview');
    if (!(await nameInput.count())) failures.push('creative-studio: shared name input is missing');
    if (!(await preview.count())) failures.push('creative-studio: live canvas is missing');
    if (await preview.count() && await preview.getAttribute('aria-live') !== 'polite') failures.push('creative-studio: live canvas does not announce preview updates politely');
    if (await nameInput.count() && await preview.count()) {
      // The Studio theme switch must update the shared site preference, not a local-only palette.
      const lightThemeButton = page.getByRole('button', { name: 'Light', exact: true });
      if (!(await lightThemeButton.count())) failures.push('creative-studio: global light-theme control is missing');
      else {
        await lightThemeButton.click();
        const lightApplied = await page.evaluate(() => document.documentElement.classList.contains('light'));
        if (!lightApplied) failures.push('creative-studio: light-theme action did not update the global document theme');
        const darkThemeButton = page.getByRole('button', { name: 'Dark', exact: true });
        if (await darkThemeButton.count()) {
          await darkThemeButton.click();
          const darkApplied = await page.evaluate(() => document.documentElement.classList.contains('dark'));
          if (!darkApplied) failures.push('creative-studio: dark-theme action did not restore the global document theme');
        } else failures.push('creative-studio: dark-theme control was not available after switching to light');
      }
      await nameInput.fill('Nova');
      const initialPreview = (await preview.innerText()).trim();
      if (!initialPreview) failures.push('creative-studio: live canvas did not render the shared name');
      const initialEffectSelect = page.locator('aside').last().locator('select').first();
      await initialEffectSelect.selectOption('cyber-neon');
      await page.waitForFunction(() => {
        const select = [...document.querySelectorAll('aside select')].find((item) => item.value === 'cyber-neon');
        const canvas = document.querySelector('[data-testid="designer-live-preview"]');
        return Boolean(select && canvas && getComputedStyle(canvas).backgroundColor === 'rgb(5, 7, 20)');
      }, null, { timeout: 5000 }).catch(() => {});
      const selectedEffect = await initialEffectSelect.inputValue();
      const effectBackground = await preview.evaluate((el) => getComputedStyle(el).backgroundColor);
      if (selectedEffect !== 'cyber-neon') failures.push('creative-studio: visual effect selector did not retain cyber-neon (' + selectedEffect + ')');
      if (effectBackground !== 'rgb(5, 7, 20)') failures.push('creative-studio: selected visual effect did not apply its background color (' + effectBackground + ')');
      await page.getByRole('button', { name: 'Symbols & art' }).click();
      const symbolSearch = page.locator('aside').last().locator('input').first();
      if (!(await symbolSearch.getAttribute('aria-label'))?.trim()) failures.push('creative-studio: symbol search input has no accessible name');
      const symbol = page.locator('aside').last().locator('button[title]:visible').first();
      if (!(await symbol.count())) failures.push('creative-studio: searchable symbol library is missing');
      else {
        await symbol.click();
        const withSymbol = (await preview.innerText()).trim();
        if (withSymbol === initialPreview) failures.push('creative-studio: selecting a symbol did not update the shared canvas');
        const favoriteButton = page.getByRole('button', { name: 'Add to favorites' }).first();
        if (!(await favoriteButton.count())) failures.push('creative-studio: symbol favorite control is missing');
        else {
          await favoriteButton.click();
          const favoriteStored = await page.evaluate(() => JSON.parse(localStorage.getItem('nameforge.text-art.favorites.v1') || '[]'));
          if (!Array.isArray(favoriteStored) || favoriteStored.length !== 1) failures.push('creative-studio: favorite was not persisted');
          const favoritesFilter = page.getByRole('button', { name: /Favorites only/ });
          await favoritesFilter.click();
          if (!(await page.getByRole('button', { name: 'Remove from favorites' }).count())) failures.push('creative-studio: favorites-only filter did not show the saved symbol');
          await favoritesFilter.click();
          await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
          await page.getByRole('button', { name: 'Symbols & art' }).click();
          if (!(await page.getByRole('button', { name: 'Remove from favorites' }).count())) failures.push('creative-studio: favorite did not survive a page reload');
        }
      }
      await page.getByRole('button', { name: 'Nicknames' }).click();
      await page.getByRole('button', { name: 'Generate suggestions' }).click();
      const applyButton = page.getByRole('button', { name: 'Apply' }).first();
      if (!(await applyButton.count())) failures.push('creative-studio: nickname generation returned no applicable result');
      else {
        await applyButton.click();
        if (!(await preview.innerText()).trim()) failures.push('creative-studio: applying a nickname emptied the canvas');
      }
      await page.getByRole('button', { name: 'Typography' }).click();
      const stylePanel = page.locator('aside').last();
      await stylePanel.getByRole('button', { name: /Bold Serif Classic/ }).click();
      const effectSelect = stylePanel.locator('select').first();
      await effectSelect.selectOption('pure-gold');
      const styleInputs = stylePanel.locator('input');
      await styleInputs.nth(0).fill('★ ');
      await styleInputs.nth(1).fill(' ★');
      await page.getByRole('button', { name: 'Bio & captions' }).click();
      const template = page.locator('main').getByRole('button').filter({ hasText: /Personal intro|Content creator|Small business/ }).first();
      if (await template.count()) {
        await template.click();
        if (!(await preview.innerText()).trim()) failures.push('creative-studio: selecting a bio template did not populate the live canvas');
        const bioEditor = page.locator('textarea').first();
        await bioEditor.fill('My saved bio\\nLine two');
        await page.getByRole('button', { name: 'Save design' }).click();
        await page.getByRole('button', { name: 'Reset' }).click();
        if ((await preview.innerText()).trim() !== 'Enter a name to start.') failures.push('creative-studio: reset left stale bio content or did not restore the empty-state preview');
        const savedBio = page.getByRole('button', { name: /My saved bio/ }).first();
        if (!(await savedBio.count())) failures.push('creative-studio: saved bio snapshot is missing');
        else {
          await savedBio.click();
          if ((await preview.innerText()).trim() !== 'My saved bio\\nLine two') failures.push('creative-studio: restoring a saved design did not restore its bio content');
          await page.getByRole('button', { name: 'Typography' }).click();
          const restoredPanel = page.locator('aside').last();
          if (await restoredPanel.locator('select').first().inputValue() !== 'pure-gold') failures.push('creative-studio: saved visual effect was not restored');
          if (await restoredPanel.locator('input').nth(0).inputValue() !== '★ ' || await restoredPanel.locator('input').nth(1).inputValue() !== ' ★') failures.push('creative-studio: saved prefix or suffix was not restored');
          if (!(await restoredPanel.getByRole('button', { name: /Bold Serif Classic/ }).getAttribute('aria-pressed') === 'true')) failures.push('creative-studio: saved Unicode style was not restored');
        }
      } else failures.push('creative-studio: bio templates are missing');
    }
    if (pageErrors.length) failures.push('creative-studio: JavaScript errors: ' + pageErrors.join(' | '));
    await page.close();

    for (const viewport of [{ name: 'mobile-320', width: 320, height: 740 }, { name: 'mobile-390', width: 390, height: 844 }]) {
      const mobile = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
      await mobile.addInitScript(() => localStorage.setItem('nameforge_settings', JSON.stringify({ language: 'en', theme: 'dark', defaultGenLanguage: 'auto', textSize: 'normal' })));
      await mobile.goto(baseUrl + '#/creative-studio', { waitUntil: 'networkidle', timeout: 45000 });
      const width = await mobile.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
      if (width.document > width.viewport + 2) failures.push('creative-studio-' + viewport.name + ': horizontal overflow');
      if (!(await mobile.getByTestId('unified-name-input').isVisible())) failures.push('creative-studio-' + viewport.name + ': shared name input is not visible');
      if (!(await mobile.getByTestId('designer-live-preview').isVisible())) failures.push('creative-studio-' + viewport.name + ': live canvas is not visible');
      await mobile.close();
    }
  }


  // Validate normal motion separately from the reduced-motion matrix.
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'no-preference',
    });
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('nameforge_settings', JSON.stringify({
        language: 'en', theme: selectedTheme, defaultGenLanguage: 'auto', textSize: 'normal',
      }));
    }, theme);
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 45000 });
    const motion = await page.evaluate(() => ({
      headingAnimation: getComputedStyle(document.querySelector('main h1.nf-animated-heading') || document.querySelector('main h1')).animationName,
      headingDuration: getComputedStyle(document.querySelector('main h1.nf-animated-heading') || document.querySelector('main h1')).animationDuration,
      interactiveTransition: getComputedStyle(document.querySelector('main button') || document.querySelector('main a')).transitionDuration,
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }));
    if (motion.reduced) failures.push('normal-motion-' + theme + ': browser unexpectedly requested reduced motion');
    if (motion.headingAnimation !== 'none') failures.push('normal-motion-' + theme + ': section/hero heading still animates continuously');
    if (Math.max(...motion.interactiveTransition.split(',').map((value) => parseFloat(value) || 0)) < 0.08) failures.push('normal-motion-' + theme + ': interactive transitions are not active');
    await page.close();

    const reducedPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    await reducedPage.addInitScript((selectedTheme) => {
      localStorage.setItem('nameforge_settings', JSON.stringify({
        language: 'en', theme: selectedTheme, defaultGenLanguage: 'auto', textSize: 'normal',
      }));
    }, theme);
    await reducedPage.goto(baseUrl, { waitUntil: 'networkidle', timeout: 45000 });
    const reducedDuration = await reducedPage.locator('main button').first().evaluate((element) => getComputedStyle(element).transitionDuration).catch(() => '0s');
    if (Math.max(...reducedDuration.split(',').map((value) => parseFloat(value) || 0)) > 0.02) failures.push('reduced-motion-' + theme + ': interactive transition remains active (' + reducedDuration + ')');
    await reducedPage.close();
  }

} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

const report = { baseUrl, testedCombinations: results.length, failures, localizationFindings, visualComparisons, results };
await (await import('node:fs/promises')).writeFile(outputDir + '/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
