#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
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
  const { PRODUCTION_BASE: base } = await import('../site.config.mjs');
  const { default: puppeteer } = await import('puppeteer-core');
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
    browser = await puppeteer.launch({ headless: true, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath('chrome'),
      args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const origin = `http://127.0.0.1:${server.address().port}${base}`;
    const routes = await htmlRoutes(dist);
    const screenshotDir = process.env.BROWSER_SCREENSHOTS;
    if (screenshotDir) await fs.mkdir(screenshotDir, { recursive: true });
    const reports = [];
    for (const width of [390, 1440]) {
      const context = await browser.createBrowserContext();
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
          if (screenshotDir && ['', 'recept/klassisk-pour-over/', 'recept/stark-aeropress/', 'recept/french-press-morgon/', 'recept/vardagskaffe-elbryggare/', 'verktyg/4-6-metoden/', 'verktyg/kaffe-till-vatten-kalkylator/'].includes(route)) {
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
  const context = await browser.createBrowserContext();
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
    assert.equal(await page.$eval('.recipe-steps', element => getComputedStyle(element).listStyleType), 'decimal');
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
    for (const [slug, steps, water] of [['klassisk-pour-over', 5, '320'], ['stark-aeropress', 4, '200'], ['french-press-morgon', 4, '500']]) {
      await noScriptPage.goto(origin + `recept/${slug}/`, { waitUntil: 'load' });
      const staticRecipe = await noScriptPage.evaluate(() => ({
        steps: document.querySelectorAll('.recipe-steps li').length,
        numbered: getComputedStyle(document.querySelector('.recipe-steps')).listStyleType,
        water: document.querySelector('[data-recipe-water]').textContent,
        controlsDisabled: document.querySelector('#recipe-dose').matches(':disabled'),
        headingBelowHeader: document.querySelector('h1').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom,
        navigationVisible: document.querySelector('#primary-navigation').getBoundingClientRect().width > 0,
      }));
      assert.deepEqual(staticRecipe, { steps, numbered: 'decimal', water, controlsDisabled: true, headingBelowHeader: true, navigationVisible: true }, `${slug} without JavaScript`);
    }
    await noScriptPage.goto(origin + 'recept/vardagskaffe-elbryggare/', { waitUntil: 'load' });
    assert.equal(await noScriptPage.$eval('[data-batch-coffee]', element => element.textContent), '60');
    assert.equal(await noScriptPage.$eval('[data-batch-scoops]', element => element.textContent), '10');
    assert.equal(await noScriptPage.$eval('[data-batch-coffee-dl]', element => element.textContent), '1,5');
    assert.equal(await noScriptPage.$$eval('.batch-steps li', elements => elements.length), 3);
    assert.equal(await noScriptPage.$eval('#batch-water', element => element.matches(':disabled')), true);
    await noScriptPage.close();
    await checkRecipeInteractions(page, origin);
    console.log('Passed navigation, theme, sharing, timer, storage, and calculator interactions.');
  } finally { await context.close(); }
}

async function checkRecipeInteractions(page, origin) {
  const setDose = async value => page.$eval('#recipe-dose', (element, next) => {
    element.value = next; element.dispatchEvent(new Event('input', { bubbles: true }));
  }, String(value));
  await page.setViewport({ width: 390, height: 844 });
  await ready(page, origin);
  assert.match(await page.$eval('main a', element => element.getAttribute('href')), /recept\//);
  assert.equal(await page.evaluate(() => !!(document.querySelector('#home-recipes-title').compareDocumentPosition(document.querySelector('#home-tools-title')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
  await ready(page, origin + 'recept/klassisk-pour-over/');
  assert.equal(await page.$eval('#recipe-dose', element => element.value), '20');
  assert.equal(await page.$eval('[data-recipe-water]', element => element.textContent), '320');
  await setDose(40);
  assert.equal(await page.$eval('[data-recipe-water]', element => element.textContent), '640');
  assert.deepEqual(await page.$$eval('.recipe-steps [data-target]', elements => elements.map(element => element.textContent)), ['100 g', '280 g', '460 g', '640 g']);
  assert.deepEqual(await page.$$eval('.recipe-steps .step-time', elements => elements.map(element => element.textContent)), ['0:00', '0:30', '1:15', '2:00', '2:35']);
  await setDose(41);
  assert.equal(await page.$eval('[data-start-recipe]', element => element.disabled), true);
  assert.equal(await page.$eval('#recipe-dose', element => element.getAttribute('aria-invalid')), 'true');
  await setDose(20.55);
  assert.equal(await page.$eval('.print-recipe', element => element.disabled), true);
  await setDose(20.5);
  assert.equal(await page.$eval('[data-recipe-water]', element => element.textContent), '328');
  await setDose(40);
  await page.evaluate(() => window.print = () => window.recipePrinted = true);
  await page.click('.print-recipe');
  assert.equal(await page.evaluate(() => window.recipePrinted), true);
  await page.click('[data-start-recipe]');
  await page.waitForSelector('.active-brew');
  assert.equal(await page.$eval('#recipe-dose', element => element.matches(':disabled')), true);
  assert.equal(await page.$eval('[data-active-target]', element => element.textContent), '100 g');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'active-step-heading');
  await page.evaluate(() => window.advanceBrewClock(80000));
  await page.waitForFunction(() => document.querySelector('[data-active-target]').textContent === '460 g');
  assert.match(await page.$eval('#active-step-heading', element => element.textContent), /Tredje/);
  await page.$eval('.skip-link', element => element.click());
  assert.equal(await page.$eval('#recipe-dose', element => element.value), '40');
  await page.evaluate(axe.source);
  const activeAudit = await page.evaluate(async () => (await axe.run(document)).violations.map(violation => violation.id));
  assert.deepEqual(activeAudit, [], 'Active brewing accessibility');
  await page.emulateMediaType('print');
  const printView = await page.evaluate(() => ({
    scheduleVisible: getComputedStyle(document.querySelector('.full-schedule')).display !== 'none',
    controlsHidden: getComputedStyle(document.querySelector('.print-recipe')).display === 'none',
    coffee: document.querySelector('.print-dose dd').textContent,
    water: document.querySelector('[data-recipe-water]').textContent,
    finalTarget: [...document.querySelectorAll('.recipe-steps [data-target]')].at(-1).textContent,
  }));
  assert.deepEqual(printView, { scheduleVisible: true, controlsHidden: true, coffee: '40 g', water: '640', finalTarget: '640 g' });
  await page.pdf({ path: 'reports/pour-over-40g.pdf', format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
  await page.emulateMediaType('screen');
  await page.evaluate(() => window.advanceBrewClock(200000));
  await page.waitForSelector('[data-complete-recipe]');
  assert.equal(await page.$eval('#recipe-dose', element => element.matches(':disabled')), true);
  await page.click('[data-complete-recipe]');
  await page.waitForFunction(() => document.querySelector('.session-result h3').textContent.includes('Dags att smaka'));
  assert.equal(await page.evaluate(() => document.activeElement.matches('.session-result h3')), true);
  assert.equal(await page.$eval('#recipe-dose', element => element.matches(':disabled')), false);
  await setDose(30);
  assert.equal(await page.$eval('[data-recipe-water]', element => element.textContent), '480');
  await page.click('[data-start-recipe]');
  await page.click('[data-stop-recipe]');
  await page.waitForFunction(() => document.activeElement.matches('.session-result h3'));
  assert.equal(await page.$eval('#recipe-dose', element => element.matches(':disabled')), false);
  await page.click('[data-reset-recipe]');
  await page.waitForFunction(() => document.activeElement.matches('[data-start-recipe]'));
  assert.equal(await page.$('.session-result'), null);
  await page.setViewport({ width: 320, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await checkImmersionInteractions(page, origin);
  await checkBatchInteractions(page, origin);
  console.log('Passed recipe scaling, active brewing, completion, print, no-script, and troubleshooting checks.');
}

async function checkBatchInteractions(page, origin) {
  const set = async (selector, value) => page.$eval(selector, (element, next) => {
    element.value = String(next); element.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  const number = async selector => page.$eval(selector, element => element.textContent.replace(/\s/g, ''));
  await page.setViewport({ width: 390, height: 844 });
  await ready(page, origin + 'recept/vardagskaffe-elbryggare/');
  assert.equal(await number('[data-batch-coffee]'), '60');
  assert.equal(await number('[data-batch-water]'), '1000');
  assert.equal(await number('[data-batch-scoops]'), '10');
  assert.equal(await number('[data-batch-coffee-dl]'), '1,5');
  assert.equal(await number('[data-batch-water-dl]'), '10');
  await page.click('.measure-settings summary');
  await set('#batch-scoop-grams', 10);
  await set('#batch-dl-grams', 50);
  assert.equal(await number('[data-batch-scoops]'), '6');
  assert.equal(await number('[data-batch-coffee-dl]'), '1,2');
  assert.equal(await number('[data-batch-coffee]'), '60');
  await set('#batch-scoop-grams', 0);
  assert.equal(await page.$('[data-batch-scoops]'), null);
  assert.equal(await number('[data-batch-coffee]'), '60');
  assert.equal(await page.$eval('#batch-scoop-grams', element => element.getAttribute('aria-invalid')), 'true');
  await set('#batch-scoop-grams', 6);
  await set('#batch-dl-grams', 40);
  await set('#batch-water', 500);
  assert.equal(await number('[data-batch-coffee]'), '30');
  await set('#batch-water', 1250);
  assert.equal(await number('[data-batch-coffee]'), '75');
  await set('#batch-capacity', 750);
  assert.equal(await page.$('.batch-result'), null);
  assert.equal(await page.$eval('.print-batch', element => element.disabled), true);
  assert.match(await page.$eval('#batch-amount-error', element => element.textContent), /maxvolym/);
  await set('#batch-capacity', 2000);
  await page.click('input[name="batch-mode"][value="cups"]');
  await page.select('#batch-cup-size', '125');
  assert.equal(await number('[data-batch-water]'), '500');
  assert.equal(await number('[data-batch-coffee]'), '30');
  await page.select('#batch-cup-size', '250');
  assert.equal(await number('[data-batch-coffee]'), '60');
  await set('#batch-cups', 6);
  assert.equal(await number('[data-batch-water]'), '1500');
  assert.equal(await number('[data-batch-coffee]'), '90');
  await set('#batch-cups', 2.5);
  assert.equal(await page.$('.batch-result'), null);
  await set('#batch-cups', 4);
  await page.evaluate(axe.source);
  assert.deepEqual(await page.evaluate(async () => (await axe.run(document)).violations.map(v => v.id)), [], 'Batch cup-mode accessibility');
  await page.click('input[name="batch-mode"][value="water"]');
  await set('#batch-strength', 0);
  assert.equal(await page.$('.batch-result'), null);
  await set('#batch-strength', 65);
  await set('#batch-water', 1250);
  await set('#batch-capacity', 1250);
  assert.equal(await number('[data-batch-coffee]'), '81,3');
  await set('#batch-scoop-grams', 7.5);
  await set('#batch-dl-grams', 45);
  assert.equal(await number('[data-batch-scoops]'), '10,8');
  assert.equal(await number('[data-batch-coffee-dl]'), '1,81');
  await page.evaluate(() => window.print = () => window.batchPrinted = true);
  await page.click('.print-batch');
  assert.equal(await page.evaluate(() => window.batchPrinted), true);
  await page.emulateMediaType('print');
  assert.equal(await page.$eval('.batch-panel', element => getComputedStyle(element).display), 'none');
  assert.equal(await number('[data-batch-coffee]'), '81,3');
  assert.equal(await number('[data-batch-water]'), '1250');
  assert.equal(await page.$eval('[data-batch-strength]', element => element.textContent), '65 g/l');
  assert.equal(await number('[data-batch-scoops]'), '10,8');
  assert.equal(await number('[data-batch-coffee-dl]'), '1,81');
  assert.equal(await number('[data-batch-water-dl]'), '12,5');
  assert.match(await page.$eval('[data-measure-assumptions]', element => element.textContent), /7,5 g\/mått och 45 g\/dl/);
  await page.pdf({ path: 'reports/electric-filter-1250ml.pdf', format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
  await page.emulateMediaType('screen');
  await page.setViewport({ width: 320, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Electric recipe at 320px');
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('a[href*="bryggfelsokning/?method=electric-filter"]')]);
  await page.waitForFunction(() => document.querySelector('[aria-label="Välj metod"] button[aria-pressed="true"]').textContent.trim() === 'Elbryggare');
  assert.equal(await page.$('[aria-label="Välj bryggflöde"]'), null);
  assert.match(await page.$eval('main', element => element.textContent), /Bryggaren styr värmen/);
  console.log('Passed electric brewer volume/cup calculations, capacity validation, dosage, printing, no-script, and troubleshooting.');
}

async function checkImmersionInteractions(page, origin) {
  for (const spec of [
    { slug: 'stark-aeropress', method: 'aeropress', label: 'AeroPress', base: '18', baseWater: '200', dose: '15', water: '166,7', min: '12', max: '18', brewer: 'AeroPress Original', steep: 60, times: ['0:00', '0:15', '0:30', '1:30'], pdf: 'aeropress-15g' },
    { slug: 'french-press-morgon', method: 'french-press', label: 'French press', base: '30', baseWater: '500', dose: '45', water: '750', min: '15', max: '45', brewer: 'presskanna på minst 1 liter', steep: 240, times: ['0:00', '0:30', '0:45', '4:45'], pdf: 'french-press-45g' },
  ]) {
    await page.setViewport({ width: 390, height: 844 });
    await ready(page, origin + `recept/${spec.slug}/`);
    assert.equal(await page.$eval('#recipe-dose', element => element.value), spec.base);
    assert.equal(await page.$eval('[data-recipe-water]', element => element.textContent), spec.baseWater);
    assert.equal(await page.$eval('#recipe-dose', element => element.min), spec.min);
    assert.equal(await page.$eval('#recipe-dose', element => element.max), spec.max);
    assert.ok((await page.$eval('#recipe-dose-hint', element => element.textContent)).includes(spec.brewer));
    assert.equal(await page.$eval('.dose-presets [aria-pressed="true"]', element => element.textContent), `${spec.base} g`);
    await page.$eval('#recipe-dose', (element, max) => { element.value = String(Number(max) + .1); element.dispatchEvent(new Event('input', { bubbles: true })); }, spec.max);
    assert.equal(await page.$eval('[data-start-recipe]', element => element.disabled), true);
    await page.$eval('#recipe-dose', (element, dose) => { element.value = dose; element.dispatchEvent(new Event('input', { bubbles: true })); }, spec.dose);
    assert.equal(await page.$eval('[data-recipe-water]', element => element.textContent), spec.water);
    await page.click('[data-start-recipe]');
    assert.equal(await page.$eval('[data-active-target]', element => element.textContent), `${spec.water} g`);
    assert.equal(await page.$eval('#recipe-dose', element => element.matches(':disabled')), true);
    await page.evaluate(() => window.advanceBrewClock(600000));
    await page.waitForSelector('[data-advance-recipe]');
    assert.match(await page.$eval('#active-step-heading', element => element.textContent), /Rör om/);
    assert.equal(await page.$('[data-complete-recipe]'), null);
    assert.equal(await page.$('[data-active-target]'), null);
    await page.evaluate(axe.source);
    assert.deepEqual(await page.evaluate(async () => (await axe.run(document)).violations.map(v => v.id)), [], `${spec.label} stirring accessibility`);
    await page.click('[data-advance-recipe]');
    await page.waitForFunction(() => document.querySelector('#active-step-heading').textContent === 'Låt kaffet dra');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'active-step-heading');
    await page.evaluate(seconds => window.advanceBrewClock(seconds * 1000), spec.steep / 2);
    assert.equal(await page.$eval('#active-step-heading', element => element.textContent), 'Låt kaffet dra');
    assert.equal(await page.$('[data-complete-recipe]'), null);
    await page.evaluate(seconds => window.advanceBrewClock(seconds * 1000), spec.steep / 2 + 1);
    await page.waitForSelector('[data-complete-recipe]');
    assert.match(await page.$eval('#active-step-heading', element => element.textContent), /Pressa/);
    await page.evaluate(() => window.advanceBrewClock(300000));
    assert.equal(await page.$eval('#recipe-dose', element => element.matches(':disabled')), true);
    await page.emulateMediaType('print');
    assert.equal(await page.$eval('.full-schedule', element => getComputedStyle(element).display !== 'none'), true);
    assert.equal(await page.$eval('.active-brew', element => getComputedStyle(element).display), 'none');
    assert.equal(await page.$eval('.print-dose dd', element => element.textContent), `${spec.dose} g`);
    assert.equal(await page.$eval('.recipe-steps [data-target]', element => element.textContent), `${spec.water} g`);
    assert.deepEqual(await page.$$eval('.recipe-steps .step-time', elements => elements.map(element => element.textContent)), spec.times);
    assert.equal(await page.$$eval('.recipe-steps li', elements => elements.length), 4);
    await page.pdf({ path: `reports/${spec.pdf}.pdf`, format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
    await page.emulateMediaType('screen');
    await page.click('[data-complete-recipe]');
    await page.waitForFunction(() => document.activeElement.matches('.session-result h3'));
    assert.equal(await page.$eval('#recipe-dose', element => element.matches(':disabled')), false);
    await page.setViewport({ width: 320, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${spec.label} at 320px`);
    await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click(`a[href*="bryggfelsokning/?method=${spec.method}"]`)]);
    await page.waitForFunction(() => !document.querySelector('astro-island[client="load"]').hasAttribute('ssr'));
    assert.equal(await page.$eval('[aria-label="Välj metod"] button[aria-pressed="true"]', element => element.textContent.trim()), spec.label);
  }
  console.log('Passed AeroPress and French press scaling, manual stirring, full steep timers, pressing, printing, and method links.');
}

module.exports = { runBrowserChecks };
if (require.main === module) runBrowserChecks().catch(error => { console.error(error); process.exitCode = 1; });
