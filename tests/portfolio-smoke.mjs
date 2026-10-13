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
  await page.waitForTimeout(200);

  record('page title', (await page.title()).includes('Mahi'));
  record('all project cards present', await expectCount(page.locator('.project-card'), 7));
  record('navigation targets exist', await page.locator('#home').count() === 1 && await page.locator('#contact').count() === 1);

  await page.locator('[data-filter="ai"]').click();
  record('AI filter shows three projects', await expectCount(page.locator('.project-card:visible'), 3));
  await page.locator('[data-filter="web"]').click();
  record('web filter shows two projects', await expectCount(page.locator('.project-card:visible'), 2));
  await page.locator('[data-filter="data"]').click();
  record('data filter shows two projects', await expectCount(page.locator('.project-card:visible'), 2));
  await page.locator('[data-filter="all"]').click();
  record('all filter restores seven projects', await expectCount(page.locator('.project-card:visible'), 7));

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

  await page.locator('#themeToggle').click();
  record('theme toggles on', await page.locator('body').evaluate(node => node.classList.contains('light-theme')));
  await page.locator('#themeToggle').click();
  record('theme toggles back off', !(await page.locator('body').evaluate(node => node.classList.contains('light-theme'))));

  await page.locator('#commandOpen').click();
  await page.locator('#commandDialog[open]').waitFor({ state: 'visible' });
  await page.locator('#commandInput').fill('LastMileIQ');
  await page.locator('.command-result').filter({ hasText: 'LastMileIQ-SQL' }).click();
  await page.locator('#projectDialog[open]').waitFor({ state: 'visible' });
  record('command palette finds and opens a project', (await page.locator('#dialogTitle').innerText()).includes('LastMileIQ'));
  await page.locator('#dialogClose').click();

  await page.locator('#spotNext').click();
  record('spotlight advances', await page.locator('#spotlightNumber').innerText() === '02');
  await page.locator('#spotlightOpen').click();
  record('spotlight opens case file', await page.locator('#dialogTitle').innerText() === 'CYRUS');
  await page.locator('#dialogClose').click();
  await page.locator('#resumeOpen').click();
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
  record('mobile layout does not overflow horizontally', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  record('no uncaught browser JavaScript errors', pageErrors.length === 0, pageErrors.join(' | '));
  await context.close();
} finally {
  await browser.close();
}
console.log(JSON.stringify({ baseURL, checks, failures }, null, 2));
if (failures.length) process.exitCode = 1;
