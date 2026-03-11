#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axe = require('axe-core');

async function waitForServer(url, attempts = 30, delay = 500) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
}

const run = async () => {
  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.error('Built site not found in ./dist. Run `pnpm build` first.');
    process.exit(1);
  }

  console.log('Starting static server at http://127.0.0.1:8080 ...');
  const server = spawn('npx', ['http-server', './dist', '-p', '8080', '-c-1'], { stdio: 'inherit' });
  await new Promise((r) => setTimeout(r, 1000));

  const base = 'http://127.0.0.1:8080';
  const routes = ['/', '/verktyg/4-6-metoden/', '/verktyg/bryggfelsokning/', '/verktyg/kaffe-till-vatten-kalkylator/'];

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const results = {};

    for (const route of routes) {
      const url = new URL(route, base).toString();
      console.log('Visiting', url);
      await page.goto(url, { waitUntil: 'networkidle0' });

      // inject axe
      await page.evaluate(axe.source);
      const res = await page.evaluate(async () => {
        return await axe.run(document);
      });

      results[route] = res;
      const outDir = path.resolve(process.cwd(), 'reports');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, `axe-${route.replace(/\W+/g, '_')}.json`), JSON.stringify(res, null, 2));
      console.log(`Saved axe results for ${route}`);
    }

    await browser.close();
    fs.writeFileSync(path.resolve('reports', 'axe-results.json'), JSON.stringify(results, null, 2));
    console.log('Axe run complete. Reports written to /reports');
  } catch (err) {
    console.error('Error running axe checks:', err);
    process.exitCode = 1;
  } finally {
    try {
      server.kill('SIGTERM');
    } catch (e) {
      // ignore
    }
  }
};

run();
