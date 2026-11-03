const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))); }

const root = path.resolve(__dirname, '..');
const origin = 'https://asiguraricraiova.ro';
const target = '/allianz-tiriac-my-home-pad.html';
const output = process.env.AUDIT_TEST_OUTPUT;
const cutoff = Date.parse('2026-12-01T00:00:00+02:00');
const baseline = Date.parse('2026-11-03T12:00:00+02:00');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const report = { timestamp: new Date().toISOString(), method: 'All browser requests intercepted: GET fixtures from local disk; external and non-GET requests aborted. window.open stubbed. No real form, WhatsApp or Analytics delivery.', checks: [], runs: [], passed: false };
function pass(label) { report.checks.push(label); console.log('My Home:', label); }
async function fixture(browser, { width = 390, js = true, now = baseline, consent = 'rejected' } = {}) {
  const context = await browser.newContext({ viewport: { width, height: width >= 768 ? 1000 : 844 }, javaScriptEnabled: js, locale: 'ro-RO', timezoneId: 'Europe/Bucharest', serviceWorkers: 'block' });
  const run = { width, js, now: new Date(now).toISOString(), consent, blocked: [], missing: [], errors: [], navigations: [] };
  report.runs.push(run);
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.origin !== origin || req.method() !== 'GET') {
      run.blocked.push({ method: req.method(), url: req.url() });
      return route.abort('blockedbyclient');
    }
    const local = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!local.startsWith(root + path.sep) || !fs.existsSync(local) || !fs.statSync(local).isFile()) {
      run.missing.push(url.pathname);
      return route.fulfill({ status: 404, body: 'Missing test fixture' });
    }
    if (req.isNavigationRequest()) run.navigations.push(url.pathname);
    return route.fulfill({ status: 200, contentType: mime[path.extname(local)] || 'application/octet-stream', body: fs.readFileSync(local) });
  });
  if (js) await context.addInitScript(({ now, consent }) => {
    const NativeDate = Date;
    window.__myhomeTestNow = now;
    class TestDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [window.__myhomeTestNow])); }
      static now() { return window.__myhomeTestNow; }
    }
    window.Date = TestDate;
    if (consent === null) localStorage.removeItem('ac_cookie_consent_v2');
    else localStorage.setItem('ac_cookie_consent_v2', consent);
    window.__myhomeTestOpens = [];
    window.open = (url, target, features) => { window.__myhomeTestOpens.push({ url: String(url), target, features }); return null; };
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (link && /^(tel:|mailto:|https:\/\/wa\.me\/)/.test(link.href)) event.preventDefault();
    }, true);
  }, { now, consent });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => run.errors.push(error.message));
  return { context, page, run };
}
const opens = page => page.evaluate(() => window.__myhomeTestOpens || []);
const events = page => page.evaluate(() => (window.dataLayer || []).map(args => Array.from(args)).filter(args => args[0] === 'event'));
async function fill(page) {
  await page.locator('#myHomeQuoteType').selectOption('Apartament');
  await page.locator('#myHomeQuoteLocation').fill('PRIVATE_TEST_LOCATION_DOLJ');
  await page.locator('#myHomeQuoteYear').fill('1997');
  await page.locator('#myHomeQuoteArea').fill('137');
  await page.locator('#myHomeQuotePolicy').selectOption('Nu');
}
function decodedMessage(open) {
  const url = new URL(open.url);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/40774171971');
  assert.equal(open.target, '_blank');
  assert.match(open.features, /noopener/);
  assert.match(open.features, /noreferrer/);
  return url.searchParams.get('text');
}
function privacyAndClassification(ev, campaignActive = true) {
  const handoffs = ev.filter(item => item[1] === 'whatsapp_handoff');
  assert.equal(handoffs.length, 1, 'one handoff per accepted request');
  assert.equal(ev.filter(item => item[1] === 'generate_lead').length, 0, 'a handoff is not a received lead');
  const data = handoffs[0][2];
  assert.equal(data.product_id, 'locuinta');
  assert.equal(data.form_id, 'allianz_myhome_quote');
  assert.equal(data.form_name, 'allianz_myhome_quote');
  if (campaignActive) assert.equal(data.campaign_id, 'myhome_pad_2026');
  else assert(!Object.prototype.hasOwnProperty.call(data, 'campaign_id'), 'expired requests must not be attributed to the past campaign');
  assert.equal(data.method, 'whatsapp');
  const allowed = new Set(['method', 'lead_method', 'product_id', 'insurance_product', 'cta_location', 'lead_location', 'page_path', 'measurement_version', 'form_id', 'form_name', 'campaign_id']);
  for (const event of ev) for (const key of Object.keys(event[2])) assert(allowed.has(key), 'unexpected Analytics field: ' + key);
  assert(!/PRIVATE_TEST|1997|137/.test(JSON.stringify(ev)), 'form values must not reach Analytics');
}
async function responsiveAndImages(page, js, label) {
  const size = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert(size.document <= size.viewport && size.body <= size.viewport, label + ' has horizontal overflow: ' + JSON.stringify(size));
  const controls = page.locator('#myHomeQuoteForm input, #myHomeQuoteForm select, #myHomeQuoteForm button, #homeInsuranceQuoteForm input, #homeInsuranceQuoteForm select, #homeInsuranceQuoteForm button');
  for (let i = 0; i < await controls.count(); i++) {
    const field = controls.nth(i);
    if (!await field.isVisible()) continue;
    const box = await field.boundingBox();
    assert(box && box.x >= -1 && box.x + box.width <= size.viewport + 1, label + ' clips a form control');
    assert(box.height >= 44, label + ' has a form target under 44px');
  }
  const images = page.locator('img');
  const checked = [];
  for (let i = 0; i < await images.count(); i++) {
    const img = images.nth(i);
    if (!await img.isVisible()) continue;
    await img.scrollIntoViewIfNeeded();
    await page.waitForFunction(el => el.complete && el.naturalWidth > 0, await img.elementHandle(), { timeout: 8000 });
    checked.push(await img.evaluate(el => ({ src: new URL(el.currentSrc || el.src).pathname, width: el.naturalWidth, reserved: Boolean(el.getAttribute('width') && el.getAttribute('height')) })));
  }
  assert(checked.length > 0 && checked.every(img => img.reserved), label + ' has missing or unsized images');
  await page.evaluate(() => scrollTo(0, 0));
  if (output && js && [390, 1440].includes(size.viewport)) {
    const slug = new URL(page.url()).pathname === target ? 'myhome' : 'locuinta';
    await page.screenshot({ path: path.join(output, slug + '-' + size.viewport + '-viewport.png'), animations: 'disabled' });
    await page.screenshot({ path: path.join(output, slug + '-' + size.viewport + '-full.png'), fullPage: true, animations: 'disabled' });
  }
  return { ...size, images: checked };
}
async function consentAndSubmission(browser) {
  const h = await fixture(browser, { consent: null });
  try {
    const { page, run } = h;
    await page.goto(origin + target, { waitUntil: 'load' });
    assert.deepEqual(await events(page), []);
    assert(!run.blocked.some(req => /google|analytics/i.test(req.url)), 'Analytics attempted before consent');
    await page.locator('[data-consent="rejected"]').click();
    const submit = page.locator('[data-myhome-submit]');
    assert(await submit.isEnabled(), 'JS must enable the safe submit button');
    await submit.click();
    assert.equal((await opens(page)).length, 0, 'invalid form must not open WhatsApp');
    await fill(page);
    await page.locator('#myHomeQuoteLocation').fill('   ');
    await submit.click();
    assert.equal((await opens(page)).length, 0, 'spaces are not a valid location');
    await fill(page);
    await submit.click();
    assert.equal((await opens(page)).length, 1, 'valid form still works after consent refusal');
    assert.deepEqual(await events(page), [], 'refusal must produce no Analytics events');
    assert(!run.blocked.some(req => /google|analytics/i.test(req.url)), 'refusal must not load Analytics');
    await page.locator('#cookie-settings').click();
    await page.locator('[data-consent="accepted"]').click();
    await page.evaluate(() => { window.__myhomeTestNow += 2000; });
    await submit.click();
    assert.equal((await opens(page)).length, 2);
    const message = decodedMessage((await opens(page))[1]);
    for (const expected of ['My Home', 'Allianz-Țiriac', 'PAD gratuit', 'PRIVATE_TEST_LOCATION_DOLJ', '1997', '137 m²', 'Poliță Allianz-Țiriac pentru locuință: Nu']) assert(message.includes(expected), 'missing WhatsApp detail: ' + expected);
    privacyAndClassification(await events(page));
    await submit.click();
    assert.equal((await opens(page)).length, 2, 'rapid repeat must not reopen WhatsApp');
    privacyAndClassification(await events(page));
    run.result = 'PASS invalid, refusal, accepted one handoff, rapid-repeat suppression, classification and privacy';
    pass('valid and invalid form; consent refusal/acceptance; one classified private WhatsApp handoff');
  } finally { await h.context.close(); }
}
async function expiry(browser, now, ended) {
  const h = await fixture(browser, { now, consent: 'accepted' });
  try {
    const { page, run } = h;
    await page.goto(origin + target, { waitUntil: 'load' });
    const title = await page.locator('h1').innerText();
    assert.equal(/PAD gratuit/i.test(title), !ended, 'H1 must follow the Romanian campaign cutoff');
    assert.equal(await page.locator('[data-myhome-active]:visible').count() > 0, !ended);
    assert.equal(await page.locator('[data-myhome-expired]:visible').count() > 0, ended);
    if (ended) assert.match(await page.locator('.myhome-expired-message').innerText(), /s-a încheiat/);
    await fill(page);
    await page.locator('[data-myhome-submit]').click();
    const message = decodedMessage((await opens(page))[0]);
    assert.equal(/PAD gratuit/i.test(message), !ended, 'expired requests cannot claim the past benefit');
    privacyAndClassification(await events(page), !ended);
    await page.goto(origin + '/locuinta.html', { waitUntil: 'load' });
    const activeTeaser = page.locator('[data-myhome-teaser] [data-myhome-active]:visible');
    assert.equal(await activeTeaser.count() > 0, !ended, 'parent teaser must follow the same cutoff');
    const expiredTeaser = page.locator('[data-myhome-teaser] [data-myhome-expired]:visible');
    assert.equal(await expiredTeaser.count() > 0, ended, 'parent must retain a useful expired-state product link');
    const link = page.locator('[data-myhome-teaser] a[href="' + target + '"]:visible').first();
    assert(await link.isVisible());
    run.result = 'PASS cutoff ' + (ended ? 'at exact Romanian expiry' : '2ms before Romanian expiry');
    pass(run.result);
  } finally { await h.context.close(); }
}
async function visibleTabDeadline(browser) {
  const h = await fixture(browser, { now: cutoff - 100, consent: 'accepted' });
  try {
    const { page, run } = h;
    await page.goto(origin + target, { waitUntil: 'load' });
    assert.match(await page.locator('h1').innerText(), /PAD gratuit/);
    // Advance only Date.now; no navigation or visibility event triggers the UI update.
    // The real browser timer scheduled by production code must perform the transition.
    await page.evaluate(now => { window.__myhomeTestNow = now; }, cutoff);
    await page.locator('.myhome-expired-message').waitFor({ state: 'visible', timeout: 3000 });
    assert.equal(await page.locator('[data-myhome-active]:visible').count(), 0);
    assert(!/PAD gratuit/.test(await page.locator('h1').innerText()));
    await fill(page);
    await page.locator('[data-myhome-submit]').click();
    assert(!/PAD gratuit/i.test(decodedMessage((await opens(page))[0])));
    privacyAndClassification(await events(page), false);
    run.result = 'PASS visible tab crosses cutoff via browser timer; no expired campaign attribution';
    pass('visible tab deadline timer updates copy, request and Analytics attribution');
  } finally { await h.context.close(); }
}
async function navigateAndLayout(browser, width, js) {
  const h = await fixture(browser, { width, js });
  try {
    const { page, run } = h;
    await page.goto(origin + '/locuinta.html', { waitUntil: 'load' });
    run.parent = await responsiveAndImages(page, js, 'Locuință @' + width + (js ? ' JS' : ' no-JS'));
    const link = page.locator('[data-myhome-teaser] a[href="' + target + '"]:visible').first();
    await Promise.all([page.waitForURL(origin + target), link.click()]);
    await page.waitForLoadState('load');
    run.myhome = await responsiveAndImages(page, js, 'My Home @' + width + (js ? ' JS' : ' no-JS'));
    assert.equal(await page.locator('h1').count(), 1);
    if (!js) {
      assert(await page.locator('[data-myhome-submit]').isDisabled());
      assert(await page.locator('noscript a[href^="https://wa.me/"]').isVisible(), 'no-JS needs a direct WhatsApp fallback');
    }
    await Promise.all([page.waitForURL(origin + '/locuinta.html'), page.locator('.myhome-return').click()]);
    await page.waitForLoadState('load');
    await page.goto(origin + target, { waitUntil: 'load' });
    await Promise.all([page.waitForURL(origin + '/'), page.locator('.myhome-breadcrumb a[href="/"]').click()]);
    run.result = 'PASS actual parent/product/return/home anchors, images and layout';
    pass('two-page navigation and responsive images @' + width + (js ? ' JS' : ' no-JS'));
  } finally { await h.context.close(); }
}

(async () => {
  if (output) fs.mkdirSync(output, { recursive: true });
  for (const file of ['locuinta.html', target.slice(1), 'myhome.js']) assert(fs.existsSync(path.join(root, file)), 'Missing implementation fixture ' + file);
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    await consentAndSubmission(browser);
    await expiry(browser, cutoff - 2, false);
    await expiry(browser, cutoff, true);
    await visibleTabDeadline(browser);
    for (const width of [320, 390, 768, 1440]) {
      await navigateAndLayout(browser, width, true);
      await navigateAndLayout(browser, width, false);
    }
    for (const run of report.runs) {
      assert.deepEqual(run.errors, [], 'JavaScript error: ' + JSON.stringify(run));
      assert.deepEqual(run.missing, [], 'Missing local resource: ' + JSON.stringify(run));
      assert(run.blocked.every(req => req.method === 'GET' && /www\.googletagmanager\.com/.test(req.url)), 'Unexpected network attempt: ' + JSON.stringify(run.blocked));
    }
    report.passed = true;
    console.log('My Home checks passed: ' + report.checks.length + ' scenarios; all requests intercepted, no live delivery.');
  } finally {
    await browser.close();
    if (output) fs.writeFileSync(path.join(output, 'myhome-results.json'), JSON.stringify(report, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
