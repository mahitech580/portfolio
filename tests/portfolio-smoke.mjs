import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseURL = process.env.SITE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const failures = [];
const checks = [];
const record = (name, ok, detail = '') => {
  checks.push({ name, ok, detail });
  if (!ok) failures.push(name + (detail ? ': ' + detail : ''));
};
const expectCount = async (locator, count) => {
  await locator.first().waitFor({ state: 'attached' });
  return (await locator.count()) === count;
};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    window.print = () => document.documentElement.setAttribute('data-print-called', 'yes');
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.locator('#work').waitFor({ state: 'attached' });
  await page.waitForTimeout(250);
  record('centered hero structure exists', await page.locator('.hero-greeting').count() === 1 && await page.locator('#heroAvatar').count() === 1 && await page.locator('#heroAskForm').count() === 1);
  record('five glass shortcut tiles exist', await page.locator('.hero-shortcut').count() === 5);
  await page.locator('#heroAskInput').fill('skills');
  await page.locator('#heroAskForm button').click();
  await page.waitForFunction(() => document.querySelector('#toolkit').getBoundingClientRect().top < window.innerHeight, null, { timeout: 3000 });
  record('hero asks route to skills', await page.locator('#skillTitle').count() === 1 && (await page.locator('#toolkit').evaluate(node => node.getBoundingClientRect().top < window.innerHeight)));
  record('liquid canvas is initialized', await page.evaluate(() => {
    const canvas = document.querySelector('#smokeCanvas');
    return Boolean(canvas && typeof window.__mahiSetSmoke === 'function' && (canvas.width > 0 || document.body.classList.contains('liquid-static')));
  }));
  record('cursor smoke layer is initialized', await page.evaluate(() => Boolean(document.querySelector('#cursorSmokeCanvas') && typeof window.__mahiCursorSmokeStats === 'function')));
  await page.mouse.move(180, 200);
  await page.mouse.move(620, 315, { steps: 14 });
  await page.waitForTimeout(180);
  const smokeStats = await page.evaluate(() => window.__mahiCursorSmokeStats?.());
  record('moving the cursor emits visible smoke', Boolean(smokeStats?.available && smokeStats.enabled && smokeStats.emitted >= 20 && smokeStats.active >= 10), JSON.stringify(smokeStats));
  await page.evaluate(() => window.__mahiCursorSmokeSet?.(false));
  record('smoke off disables cursor trail', await page.evaluate(() => window.__mahiCursorSmokeStats?.().enabled === false));
  await page.evaluate(() => window.__mahiCursorSmokeSet?.(true));
  await page.mouse.move(625, 320, { steps: 4 });
  await page.waitForTimeout(100);
  record('smoke on re-enables cursor trail', await page.evaluate(() => window.__mahiCursorSmokeStats?.().enabled === true && window.__mahiCursorSmokeStats?.().emitted > 0));
  await page.locator('#experienceToolsOpen').click();
  await page.locator('#experienceDialog[open]').waitFor({ state: 'visible' });
  record('settings smoke toggle starts on', await page.locator('#smokeToggle').getAttribute('aria-pressed') === 'true');
  await page.locator('#smokeToggle').click();
  record('visible smoke toggle disables both layers', await page.locator('#smokeToggle').getAttribute('aria-pressed') === 'false' && await page.evaluate(() => window.__mahiCursorSmokeStats?.().enabled === false));
  await page.locator('#smokeToggle').click();
  record('visible smoke toggle re-enables both layers', await page.locator('#smokeToggle').getAttribute('aria-pressed') === 'true' && await page.evaluate(() => window.__mahiCursorSmokeStats?.().enabled === true));
  await page.locator('[data-close-dialog="experienceDialog"]').click();
  record('settings closes after smoke toggle test', !(await page.locator('#experienceDialog').evaluate(node => node.open)));
  record('boot percentage control is present', await page.locator('#bootPercent').count() === 1);

  record('page title', (await page.title()).includes('Mahi'));
  record('all project cards present', await expectCount(page.locator('.project-card'), 8));
  record('navigation targets exist', await page.locator('#home').count() === 1 && await page.locator('#contact').count() === 1);

  await page.locator('[data-filter="ai"]').click();
  record('AI filter shows four projects', await expectCount(page.locator('.project-card:visible'), 4));
  await page.locator('[data-filter="web"]').click();
  record('web filter shows two projects', await expectCount(page.locator('.project-card:visible'), 2));
  await page.locator('[data-filter="data"]').click();
  record('data filter shows two projects', await expectCount(page.locator('.project-card:visible'), 2));
  await page.locator('[data-filter="all"]').click();
  record('all filter restores eight projects', await expectCount(page.locator('.project-card:visible'), 8));

  await page.locator('[data-open-project="cropYield"]').click();
  await page.locator('#projectDialog[open]').waitFor({ state: 'visible' });
  record('Crop Yield Predictor case file opens', await page.locator('#dialogTitle').innerText() === 'Crop Yield Predictor' && (await page.locator('#dialogSource').getAttribute('href')).includes('crop-yield-predictor'));
  await page.locator('#dialogClose').click();
  await page.locator('#projectDialog').waitFor({ state: 'hidden' });
  await page.locator('[data-filter="all"]').click();
  await page.locator('[data-open-project="cyrus"]').click();
  await page.locator('#projectDialog[open]').waitFor({ state: 'visible' });
  record('case file opens with correct title', (await page.locator('#dialogTitle').innerText()) === 'CYRUS');
  record('case file source URL is correct', (await page.locator('#dialogSource').getAttribute('href')).includes('CYRUS-Autonomous-Agentic-Intelligence-System'));
  record('missing live demo is not shown', await page.locator('#dialogLive').isHidden());
  await page.locator('#dialogClose').click();
  await page.locator('#projectDialog').waitFor({ state: 'hidden' });
  record('case file closes', !(await page.locator('#projectDialog').evaluate(node => node.open)));

  await page.locator('[data-skill="ai"]').click();
  record('skill tab updates its panel', await page.locator('#skillTitle').innerText() === 'AI / ML / GenAI');
  record('skill tab selected state updates', await page.locator('[data-skill="ai"]').getAttribute('aria-selected') === 'true');
  await page.locator('[data-node="backend"]').click();
  record('system-map node switches skill panel', await page.locator('#skillTitle').innerText() === 'Backend & APIs');

  const themeInitiallyLight = await page.locator('body').evaluate(node => node.classList.contains('light-theme'));
  record('light theme is default', themeInitiallyLight);
  await page.locator('#themeToggle').click();
  record('theme toggles to dark', !(await page.locator('body').evaluate(node => node.classList.contains('light-theme'))));
  record('dark theme preference persists', await page.evaluate(() => localStorage.getItem('mahi-theme') === 'dark'));
  await page.locator('#themeToggle').click();
  record('theme toggles back to light', await page.locator('body').evaluate(node => node.classList.contains('light-theme')));
  record('light theme preference persists', await page.evaluate(() => localStorage.getItem('mahi-theme') === 'light'));

  await page.locator('#commandOpen').click();
  await page.locator('#commandDialog[open]').waitFor({ state: 'visible' });
  await page.locator('#commandInput').fill('LastMileIQ');
  await page.locator('.command-result').filter({ hasText: 'LastMileIQ-SQL' }).click();
  await page.locator('#projectDialog[open]').waitFor({ state: 'visible' });
  record('command palette finds and opens a project', (await page.locator('#dialogTitle').innerText()).includes('LastMileIQ'));
  await page.locator('#dialogClose').click();

  const featuredBefore = await page.locator('#spotlightTitle').innerText();
  await page.locator('#spotNext').click();
  const featuredAfter = await page.locator('#spotlightTitle').innerText();
  record('spotlight advances', featuredAfter !== featuredBefore);
  await page.locator('#spotlightOpen').click();
  record('spotlight opens current case file', (await page.locator('#dialogTitle').innerText()) === featuredAfter);
  await page.locator('#dialogClose').click();
  record('résumé action opens browser-viewable page', (await page.locator('#resumeOpen').getAttribute('href')) === './resume.html' && (await page.locator('#resumeOpen').getAttribute('target')) === '_blank');
  record('experience and certification sections exist', await page.locator('#experience .experience-card').count() === 2 && await page.locator('#credentials .credential-card').count() === 5);
  const resumeProbe = await page.evaluate(async () => { const response = await fetch('./resume.html'); const content = await response.text(); return { ok: response.ok, type: response.headers.get('content-type'), name: content.includes('Kondaveeti Sai Mahendra'), print: content.includes('resumePrint') }; });
  record('résumé page is served with source content', resumeProbe.ok && resumeProbe.type.includes('text/html') && resumeProbe.name && resumeProbe.print, JSON.stringify(resumeProbe));
  await page.locator('#profileBookOpen').click();
  await page.locator('#resumeDialog[open]').waitFor({ state: 'visible' });
  await page.locator('#resumeNext').click();
  record('profile book advances', await page.locator('#resumeCount').innerText() === '02 / 03');
  await page.locator('[data-resume-goto="2"]').click();
  record('profile page dots work', await page.locator('#resumeCount').innerText() === '03 / 03');
  await page.locator('[data-close-dialog="resumeDialog"]').click();
  await page.locator('#experienceToolsOpen').click();
  await page.locator('#experienceDialog[open]').waitFor({ state: 'visible' });
  await page.locator('[data-view="recruiter"]').click();
  record('profile preset works', await page.locator('body').getAttribute('data-profile') === 'recruiter');
  await page.locator('#experienceToolsOpen').click();
  await page.locator('[data-language="te"]').click();
  record('Telugu UI switch works', await page.locator('[data-i18n="navWork"]').first().innerText() === 'ప్రాజెక్టులు');
  await page.locator('[data-language="en"]').click();
  await page.locator('[data-close-dialog="experienceDialog"]').click();
  record('settings dialog closes before returning to page', !(await page.locator('#experienceDialog').evaluate(node => node.open)));
  await page.locator('[data-terminal-command="projects"]').click();
  record('terminal shortcut works', (await page.locator('#terminalOutput').innerText()).includes('Averis'));
  await page.locator('#terminalInput').fill('help');
  await page.locator('#terminalForm button[type="submit"]').click();
  record('terminal input works', (await page.locator('#terminalOutput').innerText()).includes('Commands: help'));
  await page.locator('[data-contact-intent="Project discussion"]').click();
  record('contact intent sets topic', await page.locator('#contactTopic').inputValue() === 'Project discussion');
  await page.locator('#copyEmail').click();
  await page.locator('#toast.show').waitFor({ state: 'visible' });
  record('copy-email control responds', (await page.locator('#toast').innerText()).length > 0);
  await page.locator('#printResume').click();
  record('print profile action is wired', await page.locator('html').getAttribute('data-print-called') === 'yes');

  const contactFields = await page.locator('#contactForm input[required], #contactForm textarea[required]').count();
  record('contact form has required fields', contactFields === 3);
  record('static-host contact behavior is documented', (await page.locator('.form-submit > span').innerText()).includes('opens your email app'));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobileMenu').click();
  record('mobile navigation opens', await page.locator('#mobileMenu').getAttribute('aria-expanded') === 'true' && await page.locator('#mobileNav').evaluate(node => node.classList.contains('open')));
  await page.locator('#mobileNav a[href="#journey"]').click();
  record('mobile navigation closes after selection', await page.locator('#mobileMenu').getAttribute('aria-expanded') === 'false');
  record('390px mobile layout does not overflow', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), await page.evaluate(() => ({viewport:window.innerWidth,root:document.documentElement.scrollWidth})));
  for (const width of [320, 360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(40);
    record('responsive width '+width+'px has no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), await page.evaluate(() => ({viewport:window.innerWidth,root:document.documentElement.scrollWidth})));
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#work').waitFor({ state: 'attached' });
  await page.waitForTimeout(100);
  record('reduced-motion mode uses static shader fallback', await page.locator('body').evaluate(node => node.classList.contains('liquid-static')));
  record('reduced-motion mode hides animated canvases', await page.locator('#smokeCanvas').evaluate(node => getComputedStyle(node).display === 'none') && await page.locator('#cursorSmokeCanvas').evaluate(node => getComputedStyle(node).display === 'none'));

  const resumePage = await context.newPage();
  const resumeErrors = [];
  resumePage.on('pageerror', error => resumeErrors.push(error.message));
  const resumeResponse = await resumePage.goto(new URL('./resume.html', baseURL).href, { waitUntil: 'domcontentloaded' });
  record('résumé page navigates successfully', Boolean(resumeResponse && resumeResponse.ok()));
  record('résumé shows internship and education details', (await resumePage.locator('body').innerText()).includes('SkillDzire') && (await resumePage.locator('body').innerText()).includes('CGPA: 8.20'));
  await resumePage.locator('#resumePrint').click();
  record('résumé print/save action responds', await resumePage.locator('html').getAttribute('data-print-called') === 'yes');
  record('résumé page has no browser JavaScript errors', resumeErrors.length === 0, resumeErrors.join(' | '));
  await resumePage.close();
  record('no uncaught browser JavaScript errors', pageErrors.length === 0, pageErrors.join(' | '));
  await context.close();
} finally {
  await browser.close();
}
console.log(JSON.stringify({ baseURL, checks, failures }, null, 2));
if (failures.length) process.exitCode = 1;
