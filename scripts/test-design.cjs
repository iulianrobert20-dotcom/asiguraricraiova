const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))); }

const root = path.resolve(__dirname, '..');
const origin = 'https://asiguraricraiova.ro';
const themePath = '/site-interior.css';
const themeVersion = '20261023-1';
const output = process.env.DESIGN_EVIDENCE_DIR;
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const canonical = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
const targets = [...canonical, '/404.html'];
const capturePages = new Set(['/rca.html', '/locuinta.html', '/asigurare-sanatate-expati.html', '/blog-animale-companie.html', '/contact.html']);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const report = {
  timestamp: new Date().toISOString(),
  method: 'Local browser fixtures only. All requests intercepted; same-origin GET files fulfilled from disk, external requests and all non-GET requests aborted. Analytics refused, window.open stubbed. No real form, Analytics or WhatsApp delivery.',
  scope: { canonical: canonical.length, extra: '/404.html', widths: [320, 390, 1024, 1440], noJavaScript: 'All 49 documents at 390 and 320; static source contract checked on every page.' },
  theme: { pathname: themePath, version: themeVersion }, runs: [], failures: []
};

function check(condition, message) { if (!condition) report.failures.push(message); }
function fileFor(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  const file = path.resolve(root, '.' + (decoded === '/' ? '/index.html' : decoded));
  return file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}
async function fixture(browser, width, javaScriptEnabled) {
  const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, javaScriptEnabled, locale: 'ro-RO', serviceWorkers: 'block' });
  const run = { width, javaScriptEnabled, pages: [], blocked: [], errors: [], missingResources: [], windowOpens: [] };
  report.runs.push(run);
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== origin || request.method() !== 'GET') {
      run.blocked.push({ url: request.url(), method: request.method() });
      return route.abort('blockedbyclient');
    }
    const file = fileFor(url.pathname);
    if (!file) {
      run.missingResources.push({ pathname: url.pathname, resource: request.resourceType() });
      return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Missing local design fixture' });
    }
    return route.fulfill({ status: 200, contentType: mime[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  if (javaScriptEnabled) await context.addInitScript(() => {
    localStorage.setItem('ac_cookie_consent_v2', 'rejected');
    window.__designTestOpens = [];
    window.open = url => { window.__designTestOpens.push(String(url)); return null; };
    document.addEventListener('submit', event => { event.preventDefault(); event.stopImmediatePropagation(); }, true);
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (link && new URL(link.href).origin !== location.origin) event.preventDefault();
    }, true);
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(30000);
  page.on('pageerror', error => run.errors.push({ pathname: new URL(page.url()).pathname, message: error.message }));
  return { context, page, run };
}
async function inspect(page, pathname, source, width) {
  return page.evaluate(({ pathname, source, width, themePath }) => {
    const nonhome = pathname !== '/';
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const sourceHero = doc.querySelector('.page-hero');
    const sourceStyles = [...doc.head.querySelectorAll('style, link[rel="stylesheet"]')];
    const lastStyle = sourceStyles[sourceStyles.length - 1];
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => ({ href: link.href, loaded: Boolean(link.sheet && link.sheet.cssRules.length) }));
    const hero = document.querySelector(nonhome ? '.page-hero' : '.home-hero');
    const visible = element => {
      const style = getComputedStyle(element), rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    };
    const images = hero ? [...hero.querySelectorAll('img')].map(image => ({
      src: image.getAttribute('src'), currentSrc: image.currentSrc || image.src,
      alt: image.getAttribute('alt'), width: Number(image.getAttribute('width')), height: Number(image.getAttribute('height')),
      loaded: image.complete && image.naturalWidth > 0, naturalWidth: image.naturalWidth, visible: visible(image)
    })) : [];
    const homeLinks = [...document.querySelectorAll('a[data-nav-home]')].filter(visible).map(link => ({ href: new URL(link.href).pathname, text: link.textContent.trim(), navigation: Boolean(link.closest('nav, header, .bc, .product-breadcrumb, [role="navigation"]')) }));
    const legacyGold = new Set(['201,168,76', '232,201,122', '214,184,92', '241,218,145']);
    function containsGold(value) {
      return [...value.matchAll(/rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)(?:\s*[,/]\s*([\d.]+))?\s*\)/g)].some(match =>
        (match[4] === undefined || Number(match[4]) > 0) && legacyGold.has([match[1], match[2], match[3]].join(','))
      );
    }
    const primarySelector = 'h1, h1 *, .page-hero .cat, .page-hero .eyebrow, .page-hero a[class*="btn"], .page-hero button, button[type="submit"], input[type="submit"], .btn-g, .btn-gold, .btn-primary, .btn--primary, .cta-primary, .global-site-cta';
    const primary = [...document.querySelectorAll(primarySelector)].filter(visible).map(element => {
      const style = getComputedStyle(element);
      const colors = { color: style.color, background: style.backgroundColor, gradient: style.backgroundImage, border: style.borderColor };
      return { tag: element.tagName, class: element.className, text: element.textContent.trim().slice(0, 90), colors, legacyGold: Object.values(colors).some(containsGold) };
    });
    function rgba(value) {
      const parts = value.match(/[\d.]+/g)?.map(Number);
      return parts && parts.length >= 3 ? [...parts.slice(0, 3), parts.length > 3 ? parts[3] : 1] : [0, 0, 0, 0];
    }
    function luminance(color) {
      return color.slice(0, 3).map(channel => { const v = channel / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
    }
    const metadata = hero ? [...hero.querySelectorAll('.art-meta span, .article-meta span, .hero-meta span, .ameta span, .meta span')].filter(visible).map(element => {
      let ancestor = element, background = [255, 255, 255, 1];
      while (ancestor) {
        const candidate = rgba(getComputedStyle(ancestor).backgroundColor);
        if (candidate[3] >= .99) { background = candidate; break; }
        ancestor = ancestor.parentElement;
      }
      const foreground = rgba(getComputedStyle(element).color);
      const blended = foreground.slice(0, 3).map((channel, index) => channel * foreground[3] + background[index] * (1 - foreground[3]));
      const a = luminance(blended), b = luminance(background);
      return { text: element.textContent.trim().slice(0, 90), color: getComputedStyle(element).color, background, contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
    }) : [];
    const bounds = { viewport: width, document: document.documentElement.scrollWidth, body: document.body.scrollWidth };
    const overflowElements = bounds.document > width || bounds.body > width ? [...document.body.querySelectorAll('*')].map(element => {
      const rect = element.getBoundingClientRect();
      return { tag: element.tagName, class: typeof element.className === 'string' ? element.className : '', right: rect.right, width: rect.width };
    }).filter(element => element.width > 0 && element.right > width + 1).slice(0, 8) : [];
    return {
      bodyUnified: document.body.classList.contains('site-unified'),
      source: nonhome ? { bodyUnified: doc.body.classList.contains('site-unified'), heroes: doc.querySelectorAll('.page-hero').length, images: sourceHero ? sourceHero.querySelectorAll('img').length : 0, h1Inside: Boolean(sourceHero && sourceHero.querySelector('h1')), caption: sourceHero && sourceHero.querySelector('figcaption')?.textContent.trim(), themeLast: Boolean(lastStyle && new URL(lastStyle.getAttribute('href') || '', location.origin).pathname === themePath) } : null,
      heroes: document.querySelectorAll(nonhome ? '.page-hero' : '.home-hero').length,
      h1: [...document.querySelectorAll('h1')].map(element => ({ text: element.textContent.trim(), visible: visible(element), insideHero: Boolean(hero && hero.contains(element)) })),
      images, homeLinks, styles, primary, metadata, bounds, overflowElements,
      heroVisible: Boolean(hero && visible(hero)),
      caption: hero && hero.querySelector('figcaption')?.textContent.trim()
    };
  }, { pathname, source, width, themePath });
}
function verify(record, pathname, width, javaScriptEnabled) {
  const label = pathname + ' @' + width + (javaScriptEnabled ? ' JS' : ' no-JS');
  check(record.h1.length === 1 && record.h1[0].visible, label + ': expected one visible H1');
  check(record.bounds.document <= width && record.bounds.body <= width, label + ': horizontal overflow ' + JSON.stringify(record.bounds) + ' ' + JSON.stringify(record.overflowElements));
  check(!record.primary.some(element => element.legacyGold), label + ': legacy gold in primary UI ' + JSON.stringify(record.primary.filter(element => element.legacyGold)));
  check(record.metadata.every(element => element.contrast >= 4.5), label + ': unreadable hero metadata ' + JSON.stringify(record.metadata.filter(element => element.contrast < 4.5)));
  if (pathname === '/') return;
  check(record.bodyUnified && record.source.bodyUnified, label + ': site-unified must exist in static source and rendered body');
  check(record.heroes === 1 && record.source.heroes === 1 && record.heroVisible, label + ': expected one static visible .page-hero');
  check(record.h1[0]?.insideHero && record.source.h1Inside, label + ': H1 must belong to the common static hero');
  check(record.source.images > 0 && record.images.length > 0, label + ': missing static hero image');
  check(record.images.some(image => image.visible), label + ': hero image is hidden');
  check(/Fotografie ilustrativă/i.test(record.caption || '') && /Fotografie ilustrativă/i.test(record.source.caption || ''), label + ': missing illustrative photo figcaption');
  for (const image of record.images) {
    let url;
    try { url = new URL(image.currentSrc, origin); } catch { /* reported below */ }
    check(Boolean(url && url.origin === origin && fileFor(url.pathname)), label + ': image is not an existing local file ' + image.currentSrc);
    check(Boolean(image.alt && image.alt.trim()), label + ': hero image requires descriptive alt');
    check(image.width > 0 && image.height > 0, label + ': hero image needs intrinsic width/height attributes');
    check(image.loaded && image.naturalWidth > 0, label + ': hero image failed to decode ' + image.currentSrc);
  }
  check(record.homeLinks.some(link => link.href === '/' && /Acasă|Home/i.test(link.text) && link.navigation), label + ': missing visible explicit home navigation');
  const theme = record.styles.find(style => new URL(style.href).pathname === themePath);
  check(Boolean(theme && theme.loaded && new URL(theme.href).searchParams.get('v') === themeVersion), label + ': common theme stylesheet missing, unloaded or wrong version');
  check(record.source.themeLast, label + ': common theme must be the final stylesheet in head');
}
async function expatControls(page, width) {
  const record = { width, languages: [], plans: [] };
  const ro = page.locator('[data-set-lang="ro"]'), en = page.locator('[data-set-lang="en"]');
  check(await ro.isVisible() && await en.isVisible(), 'Expat @' + width + ': language controls are hidden after moving the header');
  if (!await ro.isVisible() || !await en.isVisible()) return record;
  for (const [language, button, other, heading] of [['ro', ro, en, /Asigurare medicală pentru străini/i], ['en', en, ro, /Health insurance for expats/i]]) {
    await button.click();
    const selected = await page.locator('html').getAttribute('lang');
    check(selected === language && await button.getAttribute('aria-pressed') === 'true' && await other.getAttribute('aria-pressed') === 'false', 'Expat @' + width + ': language state failed for ' + language);
    check(heading.test(await page.locator('h1').innerText()), 'Expat @' + width + ': heading did not switch to ' + language);
    const planLabel = await page.locator('[data-mobile-output="visa"] dt').first().textContent();
    check(language === 'ro' ? /Acoperire maximă/.test(planLabel) : /Maximum coverage/.test(planLabel), 'Expat @' + width + ': plan labels did not switch to ' + language);
    record.languages.push({ selected, heading: await page.locator('h1').innerText(), planLabel });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [plan, lastOption] of [['visa', '1'], ['residence', '5']]) {
    const tab = page.locator('[data-plan-tab="' + plan + '"]');
    await tab.click();
    const panel = page.locator('[data-plan-panel="' + plan + '"]');
    check(await tab.getAttribute('aria-selected') === 'true' && await panel.isVisible(), 'Expat: ' + plan + ' tab is inactive');
    const other = plan === 'visa' ? 'residence' : 'visa';
    check(await page.locator('[data-plan-panel="' + other + '"]').evaluate(element => element.hidden), 'Expat: inactive plan is not hidden');
    const select = page.locator('[data-mobile-select="' + plan + '"]');
    check(await select.isVisible(), 'Expat: mobile package selector is hidden for ' + plan);
    await select.selectOption('0');
    const first = await page.locator('[data-mobile-output="' + plan + '"] dd').first().textContent();
    await select.selectOption(lastOption);
    const last = await page.locator('[data-mobile-output="' + plan + '"] dd').first().textContent();
    check(Boolean(first && last && first !== last), 'Expat: package selection does not update ' + plan + ' coverage');
    record.plans.push({ plan, first, last });
  }
  await page.locator('[data-plan-tab="visa"]').click();
  await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
  return record;
}
async function exercise(browser, width, javaScriptEnabled) {
  const h = await fixture(browser, width, javaScriptEnabled), { page, run } = h;
  try {
    for (const pathname of targets) {
      const response = await page.goto(origin + pathname, { waitUntil: 'load' });
      check(response.status() === 200, pathname + ': local fixture did not return 200');
      const source = fs.readFileSync(fileFor(pathname), 'utf8');
      const record = { pathname, viewports: [] };
      for (const currentWidth of [width, width === 1440 ? 1024 : 320]) {
        await page.setViewportSize({ width: currentWidth, height: currentWidth === 1440 ? 1000 : 844 });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => Promise.all([...document.querySelectorAll('.page-hero img, .home-hero img')].map(image => image.decode().catch(() => {}))));
        const result = await inspect(page, pathname, source, currentWidth);
        verify(result, pathname, currentWidth, javaScriptEnabled);
        record.viewports.push({ width: currentWidth, ...result });
      }
      if (javaScriptEnabled) run.windowOpens.push(...await page.evaluate(() => window.__designTestOpens || []));
      if (output && javaScriptEnabled && capturePages.has(pathname)) {
        await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
        await page.evaluate(() => scrollTo(0, 0));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const name = pathname.slice(1, -5) + '-' + width;
        await page.screenshot({ path: path.join(output, name + '.png'), fullPage: false });
        await page.screenshot({ path: path.join(output, name + '-full.png'), fullPage: true });
      }
      if (javaScriptEnabled && pathname === '/asigurare-sanatate-expati.html') record.controls = await expatControls(page, width);
      run.pages.push(record);
      if (run.pages.length % 10 === 0) console.log('Design progress:', width, javaScriptEnabled ? 'JS' : 'no-JS', run.pages.length + '/' + targets.length);
    }
    check(run.pages.length === targets.length, width + ': incomplete design coverage');
    check(run.errors.length === 0, width + ': JavaScript errors ' + JSON.stringify(run.errors));
    check(run.missingResources.length === 0, width + ': missing resources ' + JSON.stringify(run.missingResources));
    check(run.windowOpens.length === 0, width + ': unexpected window.open');
    check(!run.blocked.some(item => item.method !== 'GET' || /google-analytics|googletagmanager|formspree|wa\.me|whatsapp/i.test(item.url)), width + ': forbidden measurement/delivery attempted ' + JSON.stringify(run.blocked));
    console.log('Design run completed:', width, javaScriptEnabled ? 'JS' : 'no-JS', run.pages.length, 'pages.');
  } finally { await h.context.close(); }
}

(async () => {
  assert.equal(canonical.length, 48, 'Canonical scope changed; review design test');
  if (output) fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    await Promise.all([exercise(browser, 1440, true), exercise(browser, 390, true)]);
    await exercise(browser, 390, false);
  } finally {
    await browser.close();
    report.completedAt = new Date().toISOString();
    if (output) fs.writeFileSync(path.join(output, 'design-results.json'), JSON.stringify(report, null, 2));
  }
  assert.deepEqual(report.failures, [], 'Design regressions:\n' + report.failures.join('\n'));
  console.log('Design checks passed: 48 canonical pages + 404, common static heroes/images/theme, explicit home links, one H1, no legacy gold in primary UI, no overflow at 320/390/1024/1440, no-JS at 320/390. All network intercepted.');
})().catch(error => { console.error(error); process.exitCode = 1; });
