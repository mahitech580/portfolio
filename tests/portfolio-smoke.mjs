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

  // The resume is a real static page that opens in a new tab and can be printed/saved as PDF.
  const resumeUrl = new URL('./resume.html', baseURL).href;
  const resumeResponse = await context.request.get(resumeUrl);
  const resumeHtml = await resumeResponse.text();
  record('resume page is served successfully', resumeResponse.ok() && resumeHtml.includes('Kondaveeti Sai Mahendra') && resumeHtml.includes('SkillDzire'), JSON.stringify({ status: resumeResponse.status(), bytes: resumeHtml.length }));
  record('hero resume link opens the resume page', (await page.locator('.cta a[href="./resume.html"]').getAttribute('target')) === '_blank');
  record('resume card link opens the resume page', (await page.locator('.c-resume a[href="./resume.html"]').getAttribute('target')) === '_blank');
  const resumePopupPromise = page.waitForEvent('popup');
  await page.locator('.c-resume a[href="./resume.html"]').click();
  const resumePopup = await resumePopupPromise;
  await resumePopup.waitForLoadState('domcontentloaded');
  record('resume opens in a separate browser tab', resumePopup.url().endsWith('/resume.html') && (await resumePopup.title()).includes('Résumé'));
  record('resume page contains internship and education details', (await resumePopup.locator('body').innerText()).includes('SkillDzire') && (await resumePopup.locator('body').innerText()).includes('CGPA: 8.20'));
  record('resume page offers print/save as PDF', await resumePopup.locator('#resumePrint').count() === 1);
  record('resume page links to the original PDF for inline viewing', (await resumePopup.locator('a[href="./Mahendra_Resume_Python_Updated_v6.pdf"]').first().getAttribute('target')) === '_blank');
  record('resume page exposes an original-PDF download', (await resumePopup.locator('a[download="Mahendra_Resume_Python_Updated_v6.pdf"]').count()) === 1);
  const originalPdf = await context.request.get(new URL('./Mahendra_Resume_Python_Updated_v6.pdf', baseURL).href);
  const originalPdfBytes = await originalPdf.body();
  record('original résumé PDF returns valid PDF content', originalPdf.ok() && (originalPdf.headers()['content-type'] || '').includes('application/pdf') && originalPdfBytes.subarray(0, 5).toString() === '%PDF-', JSON.stringify({status:originalPdf.status(),contentType:originalPdf.headers()['content-type'],bytes:originalPdfBytes.length,magic:originalPdfBytes.subarray(0,5).toString()}));
  await resumePopup.close();

  // Back-to-top and responsive layouts, including pages/viewports with little or no overflow.
  const scrollMetrics = await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo(0, max);
    return { max, y: window.scrollY };
  });
  if (scrollMetrics.max > 0) {
    await page.waitForFunction(() => document.querySelector('#toTop').classList.contains('show'), null, { timeout: 4000 });
    record('back-to-top button becomes available after scrolling', await page.locator('#toTop').evaluate(el => el.classList.contains('show')), JSON.stringify(scrollMetrics));
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'smooth'; });
    await page.locator('#toTop').evaluate(el => el.click());
    await page.waitForFunction(() => window.scrollY < 100, null, { timeout: 4000 });
    record('back-to-top returns close to the page start', await page.evaluate(() => window.scrollY < 100));
  } else {
    record('back-to-top stays hidden when the page has no vertical overflow', !(await page.locator('#toTop').evaluate(el => el.classList.contains('show'))));
  }
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