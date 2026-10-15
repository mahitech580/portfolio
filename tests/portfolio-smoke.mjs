import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.SITE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const checks = [];
const failures = [];
const record = (name, ok, detail = '') => {
  checks.push({ name, ok: Boolean(ok), detail });
  if (!ok) failures.push(name + (detail ? ': ' + detail : ''));
};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, acceptDownloads: true });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.locator('#content').waitFor({ state: 'attached' });
  await page.waitForTimeout(150);
  record('portfolio root returns HTTP success', Boolean(response && response.ok()));
  record('page title identifies Mahi', (await page.title()).includes('Mahi'));
  record('canonical URL points to portfolio Pages site', await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://mahitech580.github.io/portfolio/');
  const sectionIds = ['home','about','projects','skills','experience','education','achievements','toolkit','journey','contact'];
  record('all portfolio sections exist', await page.evaluate(ids => ids.every(id => document.getElementById(id)), sectionIds), sectionIds.join(', '));
  record('ten section links are present', await page.locator('#nav a').count() === 10);
  record('all sidebar section links resolve', await page.locator('#nav a[href^="#"]').evaluateAll(links => links.every(a => document.querySelector(a.getAttribute('href')))));
  record('embedded images exist in the standalone page', await page.locator('img[src^="data:image/"]').count() >= 20);
  record('seven featured project cards render', await page.locator('#pgrid .proj').count() === 7);

  // Theme toggles and persists.
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await page.locator('.theme-toggle').first().click();
  const nextTheme = await page.locator('html').getAttribute('data-theme');
  record('theme toggle changes theme', nextTheme !== initialTheme && ['light','dark'].includes(nextTheme));
  record('theme choice persists in localStorage', await page.evaluate(() => localStorage.getItem('mahi-theme')) === nextTheme);
  await page.locator('.theme-toggle').nth(1).click();
  record('second theme control restores original theme', await page.locator('html').getAttribute('data-theme') === initialTheme);

  // Project dialogs use the matching source repositories.
  await page.locator('#pgrid .proj[data-i="6"]').click();
  await page.locator('#projOverlay.open').waitFor({ state: 'visible' });
  record('Crop Yield Predictor case file opens', await page.locator('#pTitle').innerText() === 'Crop Yield Predictor');
  record('crop case file links to its own repository', (await page.locator('#projBody a[href="https://github.com/mahitech580/crop-yield-predictor"]').getAttribute('href')) === 'https://github.com/mahitech580/crop-yield-predictor');
  record('crop live link is available in its case file', await page.locator('#projBody a[href="https://crop-yield-predictor-pius.onrender.com"]').count() === 1);
  await page.locator('#projClose').click();
  record('project dialog closes cleanly', !(await page.locator('#projOverlay').evaluate(el => el.classList.contains('open'))));
  await page.locator('#pgrid .proj[data-i="1"]').click();
  await page.locator('#projOverlay.open').waitFor({ state: 'visible' });
  record('CYRUS case file uses its specific repository', (await page.locator('#pTitle').innerText()) === 'CYRUS' && await page.locator('#projBody a[href*="CYRUS-Autonomous-Agentic-Intelligence-System"]').count() === 1);
  await page.keyboard.press('Escape');
  record('Escape closes project dialog', !(await page.locator('#projOverlay').evaluate(el => el.classList.contains('open'))));

  // Command palette: keyboard shortcut, filtering, selecting and dialog navigation.
  await page.keyboard.press('Control+k');
  await page.locator('#palOverlay.open').waitFor({ state: 'visible' });
  await page.locator('#palInput').fill('TripPilot');
  record('command palette filters project results', await page.locator('#palList a').count() === 1 && (await page.locator('#palList').innerText()).includes('TripPilot'));
  await page.locator('#palList a').click();
  await page.locator('#projOverlay.open').waitFor({ state: 'visible' });
  record('command palette opens selected project', await page.locator('#pTitle').innerText() === 'TripPilot');
  await page.keyboard.press('Escape');
  record('Escape closes command palette and project overlay', !(await page.locator('#palOverlay').evaluate(el => el.classList.contains('open'))) && !(await page.locator('#projOverlay').evaluate(el => el.classList.contains('open'))));

  // Optional smoke effect and its stateful toggle.
  await page.locator('#fxToggle').click();
  record('smoke control can switch off', await page.locator('#fxToggle').getAttribute('aria-pressed') === 'false' && (await page.locator('#fxToggle').innerText()).includes('off'));
  record('smoke preference persists', await page.evaluate(() => localStorage.getItem('mahi-fx')) === 'off');
  await page.locator('#fxToggle').click();
  record('smoke control can switch back on', await page.locator('#fxToggle').getAttribute('aria-pressed') === 'true');

  // The served PDF and the open/download controls are both checked.
  const pdfUrl = new URL('./Mahendra_Resume_Python_Updated_v6.pdf', baseURL).href;
  const pdfResponse = await context.request.get(pdfUrl);
  const pdfBytes = await pdfResponse.body();
  record('original resume is served as a PDF', pdfResponse.ok() && (pdfResponse.headers()['content-type'] || '').includes('application/pdf') && pdfBytes.subarray(0,5).toString() === '%PDF-', JSON.stringify({ status: pdfResponse.status(), type: pdfResponse.headers()['content-type'], bytes: pdfBytes.length }));
  record('resume download link targets the hosted PDF', await page.locator('[data-resume="download"]').getAttribute('href') === 'Mahendra_Resume_Python_Updated_v6.pdf');
  record('resume open link targets the hosted PDF', await page.locator('[data-resume="open"]').getAttribute('href') === 'Mahendra_Resume_Python_Updated_v6.pdf');
  await page.evaluate(() => {
    window.__mahiOpenedResume = '';
    window.open = url => { window.__mahiOpenedResume = String(url); return null; };
  });
  await page.locator('[data-resume="open"]').click();
  const blobUrl = await page.evaluate(() => window.__mahiOpenedResume);
  let embeddedPdf = { ok: false };
  if (blobUrl.startsWith('blob:')) {
    embeddedPdf = await page.evaluate(async url => {
      const r = await fetch(url);
      const b = new Uint8Array(await r.arrayBuffer());
      return { ok: r.ok, type: r.headers.get('content-type'), prefix: String.fromCharCode(...b.slice(0,5)), bytes: b.length };
    }, blobUrl);
  }
  record('open resume action creates a browser-viewable PDF', blobUrl.startsWith('blob:') && embeddedPdf.ok && embeddedPdf.type === 'application/pdf' && embeddedPdf.prefix === '%PDF-', JSON.stringify(embeddedPdf));
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-resume="download"]').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const downloadedBytes = downloadPath ? await readFile(downloadPath) : Buffer.alloc(0);
  record('download resume action downloads the actual PDF', download.suggestedFilename() === 'Mahendra_Resume.pdf' && downloadedBytes.subarray(0,5).toString() === '%PDF-' && !await download.failure(), JSON.stringify({ filename: download.suggestedFilename(), bytes: downloadedBytes.length }));

  // Back-to-top and responsive layouts.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(90);
  record('back-to-top button becomes available after scrolling', await page.locator('#toTop').evaluate(el => el.classList.contains('show')));
  await page.locator('#toTop').click();
  await page.waitForTimeout(250);
  record('back-to-top returns close to the page start', await page.evaluate(() => window.scrollY < 100));
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(60);
    const metrics = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    record('responsive width ' + width + 'px has no page-level horizontal overflow', metrics.document <= width + 1, JSON.stringify(metrics));
  }
  await page.evaluate(() => localStorage.removeItem('mahi-fx'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#content').waitFor({ state: 'attached' });
  record('reduced-motion preference defaults the smoke effect to off', await page.locator('#fxToggle').getAttribute('aria-pressed') === 'false');
  record('reduced-motion preference is detected by the browser', await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
  record('no uncaught browser JavaScript errors', pageErrors.length === 0, pageErrors.join(' | '));

  console.log(JSON.stringify({ passed: checks.filter(c => c.ok).length, total: checks.length, failures, checks }, null, 2));
  if (failures.length) process.exitCode = 1;
  await context.close();
} finally {
  await browser.close();
}