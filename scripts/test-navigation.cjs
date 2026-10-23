const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))); }

const root = path.resolve(__dirname, '..');
const origin = 'https://asiguraricraiova.ro';
const output = process.env.NAVIGATION_EVIDENCE_DIR;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const canonical = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
const information = new Set(['/despre.html', '/alatura-te-echipei.html', '/contact.html', '/gdpr.html', '/blog.html']);
const products = canonical.filter(url => url !== '/' && url !== '/asigurari.html' && !information.has(url) && !url.startsWith('/blog-'));
const targets = canonical.filter(url => url !== '/');
const report = { timestamp: new Date().toISOString(), method: 'Browser network fully intercepted. GET fixtures from local disk; external requests and all non-GET requests aborted. No real Analytics, WhatsApp or form delivery.', canonicalPages: canonical.length, productPages: products.length, runs: [], failures: [] };

function fileFor(pathname) {
  const file = path.resolve(root, '.' + decodeURIComponent(pathname === '/' ? '/index.html' : pathname));
  return file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}
function check(condition, message) {
  if (!condition) report.failures.push(message);
}
function targetSelector(target) {
  return [target, origin + target].flatMap(href => ['a[href="' + href + '"]', 'a[href^="' + href + '#"]', 'a[href^="' + href + '?"]']).join(',');
}
async function firstVisible(locator) {
  for (let i = 0, count = await locator.count(); i < count; i++) {
    if (await locator.nth(i).isVisible()) return locator.nth(i);
  }
  return null;
}
async function openDirectory(page, label) {
  const directory = page.locator('details#toate-asigurarile.home-directory');
  assert.equal(await directory.count(), 1, label + ': one static complete directory');
  assert.match((await directory.locator('summary').innerText()).trim(), /Toate asigurările și serviciile/i);
  if (!await directory.evaluate(element => element.open)) await directory.locator('summary').click();
  return directory;
}
async function dimensions(page, label) {
  const size = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  check(size.document <= size.viewport && size.body <= size.viewport, label + ': horizontal overflow ' + JSON.stringify(size));
  return size;
}
async function explicitHome(page, label) {
  const home = await firstVisible(page.locator('a[data-nav-home]'));
  check(Boolean(home), label + ': missing visible explicit Acasă link');
  if (!home) return null;
  const details = await home.evaluate(element => ({
    href: new URL(element.href).pathname,
    text: element.textContent.trim(),
    inNavigation: Boolean(element.closest('nav, header, .bc, .product-breadcrumb, [role="navigation"]'))
  }));
  check(details.href === '/' && /Acasă|Home/i.test(details.text) && details.inNavigation, label + ': invalid home link ' + JSON.stringify(details));
  return home;
}
async function navigationGraph(page, source) {
  return page.evaluate(html => {
    const before = new DOMParser().parseFromString(html, 'text/html');
    function links(doc, selector) {
      return [...new Set([...doc.querySelectorAll(selector)].map(link => link.getAttribute('href')).filter(Boolean))];
    }
    const selector = 'nav.snav a[href], header a[href]';
    const original = links(before, selector), current = links(document, selector);
    return { originalHeader: original, runtimeHeader: current, removedFromHeader: original.filter(href => !current.includes(href)), allRuntimeLinks: links(document, 'a[href]') };
  }, source);
}
async function longProductMenu(harness, widths) {
  const { page, run } = harness;
  run.longMenus = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(origin + '/rca.html', { waitUntil: 'load' });
    const toggle = page.locator('.global-site-menu-toggle');
    const productToggle = page.locator('.global-site-products__toggle');
    const panel = page.locator('.global-site-product-panel');
    if (await toggle.isVisible()) await toggle.click();
    await productToggle.click();
    check(await panel.isVisible(), 'Product menu @' + width + ': cannot open');
    const paths = await panel.locator('a[href]').evaluateAll(anchors => [...new Set(anchors.map(link => new URL(link.href).pathname))]);
    check(products.every(url => paths.includes(url)), 'Product menu @' + width + ': incomplete product links');
    const size = await dimensions(page, 'Open product menu @' + width);
    const last = panel.locator('a[href="/asigurari.html"]').last();
    await last.scrollIntoViewIfNeeded();
    const box = await last.boundingBox();
    check(Boolean(box) && box.y >= 0 && box.y + box.height <= 845 && box.x >= 0 && box.x + box.width <= width + 1, 'Product menu @' + width + ': final catalog link cannot be brought into viewport');
    await Promise.all([page.waitForURL(url => url.pathname === '/asigurari.html'), last.click()]);
    check(await page.locator('h1').isVisible(), 'Product menu @' + width + ': catalog navigation failed');
    await page.goto(origin + '/rca.html', { waitUntil: 'load' });
    if (await toggle.isVisible()) await toggle.click();
    await productToggle.click();
    await page.keyboard.press('Escape');
    check(await productToggle.getAttribute('aria-expanded') === 'false', 'Product menu @' + width + ': Escape does not close');
    if (await toggle.isVisible()) await toggle.click();
    await productToggle.click();
    await page.locator('h1').evaluate(element => element.click());
    check(await productToggle.getAttribute('aria-expanded') === 'false', 'Product menu @' + width + ': outside click does not close');
    run.longMenus.push({ width, links: paths.length, size, finalLinkBox: box });
  }
}
async function fixture(browser, width, javaScriptEnabled) {
  const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, javaScriptEnabled, locale: 'ro-RO', serviceWorkers: 'block' });
  const run = { width, javaScriptEnabled, visits: [], blocked: [], errors: [], windowOpens: [], documentResponses: [], missingResources: [] };
  report.runs.push(run);
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== origin || request.method() !== 'GET') {
      run.blocked.push({ url: request.url(), method: request.method() });
      return route.abort('blockedbyclient');
    }
    const file = fileFor(url.pathname);
    if (!file) {
      run.missingResources.push(url.pathname);
      return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Missing local fixture' });
    }
    if (request.isNavigationRequest()) run.documentResponses.push({ pathname: url.pathname, status: 200 });
    return route.fulfill({ status: 200, contentType: mime[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  if (javaScriptEnabled) await context.addInitScript(() => {
    localStorage.setItem('ac_cookie_consent_v2', 'rejected');
    window.__navigationTestOpens = [];
    window.open = url => { window.__navigationTestOpens.push(String(url)); return null; };
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (link && new URL(link.href).origin !== location.origin) event.preventDefault();
    }, true);
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => run.errors.push({ pathname: new URL(page.url()).pathname, message: error.message }));
  return { context, page, run };
}
async function assessPage(harness, target, originalWidth, source) {
  const { page, run } = harness, label = target + ' @' + originalWidth + (run.javaScriptEnabled ? ' JS' : ' no-JS');
  const headings = await page.locator('h1').count();
  check(headings === 1 && await page.locator('h1').isVisible(), label + ': missing unique visible H1');
  const home = target === '/' ? null : await explicitHome(page, label);
  const sizes = [await dimensions(page, label)];
  if (run.javaScriptEnabled) {
    const narrow = originalWidth === 390 ? 320 : 1024;
    await page.setViewportSize({ width: narrow, height: 844 });
    sizes.push(await dimensions(page, target + ' @' + narrow));
    await page.setViewportSize({ width: originalWidth, height: originalWidth === 1440 ? 1000 : 844 });
  }
  const graph = run.javaScriptEnabled ? await navigationGraph(page, source) : undefined;
  const openAttempts = run.javaScriptEnabled ? await page.evaluate(() => window.__navigationTestOpens || []) : [];
  run.windowOpens.push(...openAttempts);
  run.visits.push({ target, headings, sizes, graph });
  return home;
}
async function clickThrough(browser, width) {
  const h = await fixture(browser, width, true), { page, run } = h;
  try {
    await page.goto(origin + '/', { waitUntil: 'load' });
    await assessPage(h, '/', width, fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
    let directory = await openDirectory(page, 'homepage @' + width);
    const paths = await directory.locator('a[href]').evaluateAll(anchors => [...new Set(anchors.map(link => new URL(link.href).pathname))]);
    check(products.every(url => paths.includes(url)), 'homepage @' + width + ': directory missing products ' + products.filter(url => !paths.includes(url)).join(', '));
    if (output) await page.screenshot({ path: path.join(output, 'directory-' + width + '.png'), fullPage: true });
    for (const target of targets) {
      // Click the real anchor, then the explicit home anchor; goto is only used to start the journey.
      directory = await openDirectory(page, 'homepage @' + width);
      let link = await firstVisible(directory.locator(targetSelector(target)));
      if (!link) link = await firstVisible(page.locator(targetSelector(target)));
      check(Boolean(link), 'homepage @' + width + ': target lacks visible direct anchor: ' + target);
      if (!link) continue;
      const [response] = await Promise.all([
        page.waitForResponse(response => response.request().isNavigationRequest() && new URL(response.url()).pathname === target),
        page.waitForURL(url => url.pathname === target),
        link.click()
      ]);
      check(response.status() === 200, width + ': directory/footer target ' + target + ' did not return 200');
      await page.waitForLoadState('load');
      const source = fs.readFileSync(fileFor(target), 'utf8');
      const home = await assessPage(h, target, width, source);
      if (home) {
        await Promise.all([page.waitForURL(url => url.pathname === '/'), home.click()]);
        await page.waitForLoadState('load');
      } else await page.goto(origin + '/', { waitUntil: 'load' });
    }
    await longProductMenu(h, [width, width === 390 ? 320 : 1024]);
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.goto(origin + '/404.html', { waitUntil: 'load' });
    const home = await assessPage(h, '/404.html', width, fs.readFileSync(path.join(root, '404.html'), 'utf8'));
    if (home) {
      await Promise.all([page.waitForURL(url => url.pathname === '/'), home.click()]);
      await page.waitForLoadState('load');
    }
    check(run.visits.length === canonical.length + 1, width + ': all canonical pages and 404 must be visited');
    check(run.errors.length === 0, width + ': JavaScript errors ' + JSON.stringify(run.errors));
    check(run.windowOpens.length === 0, width + ': unexpected window.open');
    check(!run.blocked.some(item => item.method !== 'GET' || /google-analytics|googletagmanager|formspree|wa\.me|whatsapp/i.test(item.url)), width + ': forbidden delivery/measurement attempt ' + JSON.stringify(run.blocked));
    console.log('Navigation click-through completed:', width, run.visits.length, 'pages.');
  } finally { await h.context.close(); }
}
async function withoutJavaScript(browser, width) {
  const h = await fixture(browser, width, false), { page, run } = h;
  try {
    await page.goto(origin + '/', { waitUntil: 'load' });
    const directory = await openDirectory(page, 'no-JS homepage @' + width);
    for (const target of products) check(Boolean(await firstVisible(directory.locator(targetSelector(target)))), 'no-JS directory @' + width + ': hidden/absent ' + target);
    await assessPage(h, '/', width);
    for (const target of [...targets, '/404.html']) {
      const response = await page.goto(origin + target, { waitUntil: 'load' });
      check(response.status() === 200, 'no-JS local fixture ' + target + ' did not return 200');
      await assessPage(h, target, width);
    }
    check(run.blocked.every(item => item.method === 'GET'), 'no-JS: unexpected non-GET');
    console.log('Navigation without JavaScript completed:', width, run.visits.length, 'pages.');
  } finally { await h.context.close(); }
}

(async () => {
  assert.equal(canonical.length, 48, 'Sitemap scope changed: review this navigation regression test');
  assert.equal(products.length, 35, 'Product directory scope changed: review classification (catalog linked separately)');
  if (output) fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    await Promise.all([clickThrough(browser, 1440), clickThrough(browser, 390)]);
    await Promise.all([withoutJavaScript(browser, 1440), withoutJavaScript(browser, 390)]);
  } finally {
    await browser.close();
    if (output) fs.writeFileSync(path.join(output, 'navigation-results.json'), JSON.stringify(report, null, 2));
  }
  assert.deepEqual(report.failures, [], 'Navigation regressions:\n' + report.failures.join('\n'));
  console.log('Navigation checks passed: 48 canonical pages + 404, 35 product links plus catalog, desktop/mobile click-through, static no-JS home links, long dropdown and overflow at 320/390/1024/1440. All network intercepted.');
})().catch(error => { console.error(error); process.exitCode = 1; });
