#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const puppeteer = require('puppeteer');
const axe = require('axe-core');

async function htmlRoutes(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? htmlRoutes(path.join(directory, entry.name), `${prefix}${entry.name}/`)
    : entry.name === 'index.html' ? [prefix] : []))).flat();
}

async function ready(page, url) {
  const response = await page.goto(url, { waitUntil: 'load' });
  assert.equal(response.status(), 200, url);
  await page.waitForFunction(() => [...document.querySelectorAll('astro-island[client="load"]')].every(island => !island.hasAttribute('ssr')));
  await page.evaluate(() => document.fonts.ready);
}

async function runBrowserChecks({ interactions = true } = {}) {
  const dist = path.resolve('dist');
  const manifest = JSON.parse(await fs.readFile(path.join(dist, 'manifest.webmanifest'), 'utf8'));
  const base = manifest.scope;
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' };
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith(base)) { response.writeHead(404).end(); return; }
      let filename = path.resolve(dist, pathname.slice(base.length));
      if (filename !== dist && !filename.startsWith(`${dist}${path.sep}`)) { response.writeHead(403).end(); return; }
      if ((await fs.stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
      response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' });
      response.end(await fs.readFile(filename));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  let browser;
  const failures = [];
  try {
    browser = await puppeteer.launch({ headless: 'new', executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const origin = `http://127.0.0.1:${server.address().port}${base}`;
    const routes = await htmlRoutes(dist);
    const screenshotDir = process.env.BROWSER_SCREENSHOTS;
    if (screenshotDir) await fs.mkdir(screenshotDir, { recursive: true });
    const reports = [];
    for (const width of [390, 1440]) {
      const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
        await ready(page, origin);
        await page.evaluate(value => localStorage.setItem('theme', value), theme);
        for (const route of routes) {
          const pageErrors = [];
          const errorListener = error => pageErrors.push(error.message);
          page.on('pageerror', errorListener);
          await ready(page, origin + route);
          await page.evaluate(axe.source);
          const audit = await page.evaluate(async () => {
            const result = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
            const heading = document.querySelector('main h1');
            const header = document.querySelector('.site-header');
            return {
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
              h1s: document.querySelectorAll('h1').length,
              headingTop: heading?.getBoundingClientRect().top,
              headerBottom: header.getBoundingClientRect().bottom,
              violations: result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })),
            };
          });
          const label = `${width}px ${theme} /${route}`;
          if (audit.overflow) failures.push(`${label}: horizontal overflow`);
          if (audit.h1s !== 1) failures.push(`${label}: expected one h1`);
          if (audit.headingTop < audit.headerBottom) failures.push(`${label}: heading overlaps fixed header`);
          if (audit.violations.length) failures.push(`${label}: ${audit.violations.map(v => v.id).join(', ')}`);
          if (pageErrors.length) failures.push(`${label}: ${pageErrors.join('; ')}`);
          reports.push({ width, theme, route, ...audit, pageErrors });
          if (screenshotDir && ['', 'recept/klassisk-pour-over/', 'verktyg/4-6-metoden/', 'verktyg/kaffe-till-vatten-kalkylator/'].includes(route)) {
            await page.screenshot({ path: path.join(screenshotDir, `${width}-${theme}-${route.replaceAll('/', '-') || 'home'}.png`) });
          }
          page.off('pageerror', errorListener);
        }
      }
      await context.close();
    }
    await fs.mkdir('reports', { recursive: true });
    await fs.writeFile('reports/browser-checks.json', JSON.stringify(reports, null, 2));
    console.log(`Audited ${routes.length} routes at two widths in both themes.`);
    if (interactions) await checkInteractions(browser, origin);
    for (const failure of failures) console.error(failure);
    assert.equal(failures.length, 0, 'Browser or accessibility regressions found; see reports/browser-checks.json');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

async function checkInteractions(browser, origin) {
  const context = await browser.createIncognitoBrowserContext();
  try {
    const page = await context.newPage();
    await page.setViewport({ width: 390, height: 844 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.evaluateOnNewDocument(() => {
      const now = Date.now.bind(Date);
      let offset = 0;
      Date.now = () => now() + offset;
      window.advanceBrewClock = milliseconds => { offset += milliseconds; document.dispatchEvent(new Event('visibilitychange')); };
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async url => window.copiedRecipeUrl = url } });
    });
    const setNumber = async (selector, value) => page.$eval(selector, (element, next) => {
      element.value = next; element.dispatchEvent(new Event('input', { bubbles: true }));
    }, String(value));
    const valueOf = selector => page.$eval(selector, element => element.value);
    await ready(page, origin + 'recept/klassisk-pour-over/');
    assert.equal(await page.$eval('.article-content ol', element => getComputedStyle(element).listStyleType), 'decimal');
    await page.click('.menu-toggle');
    await page.waitForFunction(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true');
    assert.equal(await page.$eval('#primary-navigation a', element => element.innerText), 'Recept');
    assert.equal(await page.$eval('#primary-navigation', element => element.getBoundingClientRect().right <= innerWidth), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('.menu-toggle', element => element.getAttribute('aria-expanded')), 'false');
    await page.focus('.menu-toggle');
    await page.keyboard.press('Enter');
    await page.click('#primary-navigation details summary');
    await page.evaluate(axe.source);
    const menuAudit = await page.evaluate(async () => (await axe.run(document)).violations.map(violation => violation.id));
    assert.deepEqual(menuAudit, [], 'Expanded navigation accessibility');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#primary-navigation details', element => element.open), false);
    await page.keyboard.press('Escape');
    await page.click('button[aria-label*="färgtema"]');
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), true);
    await page.reload({ waitUntil: 'load' });
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), true);

    await ready(page, origin + 'verktyg/4-6-metoden/');
    assert.equal(await valueOf('#coffeeWeightGrams'), '20');
    assert.equal(await valueOf('#waterToCoffeeRatio'), '15');
    await setNumber('#coffeeWeightGrams', '');
    assert.equal(await page.$eval('button[aria-label="Starta bryggning"]', element => element.disabled), true);
    assert.equal(await page.$eval('#coffeeWeightGrams', element => element.getAttribute('aria-invalid')), 'true');
    await setNumber('#coffeeWeightGrams', 20.5);
    await page.select('#waterToCoffeeRatio', '16');
    await page.click('input[name="roast"][value="Dark"]');
    await page.click('.share-control button');
    await page.waitForFunction(() => !!window.copiedRecipeUrl);
    const sharedUrl = await page.evaluate(() => window.copiedRecipeUrl);
    const recipient = await context.newPage();
    await ready(recipient, sharedUrl);
    assert.equal(await recipient.$eval('#coffeeWeightGrams', element => element.value), '20.5');
    assert.equal(await recipient.$eval('#waterToCoffeeRatio', element => element.value), '16');
    assert.match(await recipient.$eval('.summary-grid--metrics', element => element.innerText), /90°C/);
    await recipient.close();
    await page.click('button[aria-label="Starta bryggning"]');
    assert.equal(await page.$eval('.tools-container', element => element.disabled), true);
    await page.evaluate(() => window.advanceBrewClock(96000));
    await page.waitForFunction(() => document.querySelector('.brew-timer').innerText.includes('Steg 3'));
    await page.$eval('.skip-link', element => element.click());
    assert.equal(await valueOf('#coffeeWeightGrams'), '20.5');
    assert.match(await page.$eval('.brew-timer', element => element.innerText), /Steg 3/);
    await page.click('button.secondary');
    await page.waitForFunction(() => !document.querySelector('.tools-container').disabled);
    await setNumber('#coffeeWeightGrams', 25);
    await page.$eval('.skip-link', element => element.click());
    assert.equal(await valueOf('#coffeeWeightGrams'), '25');
    await page.goBack({ waitUntil: 'load' });
    assert.equal(await valueOf('#coffeeWeightGrams'), '25');
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('#coffeeWeightGrams').value === '20.5');
    await ready(page, origin + 'verktyg/4-6-metoden/#bzwp2');
    assert.equal(await valueOf('#coffeeWeightGrams'), '20');
    assert.ok(new URL(page.url()).searchParams.has('recipe'));
    assert.equal(new URL(page.url()).hash, '');
    await ready(page, origin + 'verktyg/4-6-metoden/?recipe=broken#main-content');
    assert.equal(await valueOf('#coffeeWeightGrams'), '20');
    assert.match(await page.$eval('.notice', element => element.innerText), /ogiltiga/);

    await ready(page, origin + 'verktyg/kaffe-till-vatten-kalkylator/');
    await setNumber('#water', 320);
    await setNumber('#ratio', 20);
    assert.equal(await valueOf('#coffee'), '16');
    assert.equal(await valueOf('#strength'), '20');
    await setNumber('#coffee', 20);
    await setNumber('#ratio', 15);
    assert.equal(await valueOf('#water'), '300');
    await setNumber('#strength', 16);
    assert.equal(await valueOf('#water'), '320');
    await setNumber('#ratio', 0);
    assert.equal(await page.$eval('#ratio', element => element.getAttribute('aria-invalid')), 'true');
    assert.equal(await page.$('output'), null);
    await setNumber('#ratio', 16);
    await setNumber('#coffee', -1);
    assert.equal(await page.$('output'), null);
    await setNumber('#coffee', '');
    assert.equal(await page.$('output'), null);
    await setNumber('#coffee', '1e308');
    assert.equal(await page.$('output'), null);
    await setNumber('#coffee', 20);
    assert.ok(await page.$('output'));
    assert.equal(errors.length, 0, errors.join('; '));
    await page.setViewport({ width: 320, height: 844 });
    await ready(page, origin + 'verktyg/4-6-metoden/');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const blockedPage = await context.newPage();
    await blockedPage.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });
    });
    const blockedErrors = [];
    blockedPage.on('pageerror', error => blockedErrors.push(error.message));
    await ready(blockedPage, origin + 'verktyg/4-6-metoden/');
    assert.equal(await blockedPage.$eval('#coffeeWeightGrams', element => element.value), '20');
    await blockedPage.click('button[aria-label*="färgtema"]');
    assert.equal(blockedErrors.length, 0, blockedErrors.join('; '));
    await blockedPage.close();
    const noScriptPage = await context.newPage();
    await noScriptPage.setViewport({ width: 390, height: 844 });
    await noScriptPage.setJavaScriptEnabled(false);
    await noScriptPage.goto(origin + 'recept/klassisk-pour-over/', { waitUntil: 'load' });
    const staticRecipe = await noScriptPage.evaluate(() => ({
      steps: document.querySelectorAll('.article-content ol li').length,
      numbered: getComputedStyle(document.querySelector('.article-content ol')).listStyleType,
      headingBelowHeader: document.querySelector('h1').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom,
      navigationVisible: document.querySelector('#primary-navigation').getBoundingClientRect().width > 0,
    }));
    assert.deepEqual(staticRecipe, { steps: 4, numbered: 'decimal', headingBelowHeader: true, navigationVisible: true });
    await noScriptPage.close();
    console.log('Passed navigation, theme, sharing, timer, storage, and calculator interactions.');
  } finally { await context.close(); }
}

module.exports = { runBrowserChecks };
if (require.main === module) runBrowserChecks().catch(error => { console.error(error); process.exitCode = 1; });
