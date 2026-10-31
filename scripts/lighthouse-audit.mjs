import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.LIGHTHOUSE_BASE_URL || 'http://127.0.0.1:4173/';
// Reuse Playwright's pinned Chromium so Lighthouse works consistently in CI and locally.
process.env.CHROME_PATH ||= chromium.executablePath();
const outputDir = 'artifacts/lighthouse';
await mkdir(outputDir, { recursive: true });

const isLocalPreview = new URL(baseUrl).hostname === '127.0.0.1' || new URL(baseUrl).hostname === 'localhost';
const server = isLocalPreview
  ? spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
      stdio: 'ignore',
      shell: process.platform === 'win32',
    })
  : null;

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Audit target did not become available at ' + baseUrl);

  const args = [
    'lighthouse', baseUrl,
    '--chrome-flags=--headless --no-sandbox',
    '--output=json', '--output=html',
    '--output-path=' + outputDir + '/home',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--quiet',
  ];
  const audit = spawn('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  const code = await new Promise((resolve, reject) => {
    audit.on('error', reject);
    audit.on('close', resolve);
  });
  if (code !== 0) throw new Error('Lighthouse exited with code ' + code);
  console.log('Lighthouse reports written to ' + outputDir + '/home.report.html and .report.json');
} finally {
  server?.kill('SIGTERM');
}
