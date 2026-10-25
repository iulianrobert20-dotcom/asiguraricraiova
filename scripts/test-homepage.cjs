const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || path.join(require('node:os').homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))); }
const root = path.resolve(__dirname, '..');
const origin = 'https://asiguraricraiova.ro';
const records = [];
const viewports = [];
const aliases = ['whatsapp_click', 'phone_click', 'contact_whatsapp_click', 'contact_phone_click', 'quick_quote_whatsapp', 'home_offer_click', 'rca_lead', 'form_submit'];
const output = process.env.HOMEPAGE_TEST_OUTPUT;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

async function open(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: options.width || 390, height: options.height || 900 }, locale: 'ro-RO', serviceWorkers: 'block' });
  const record = { scenario: options.scenario, posts: [], blocked: [], errors: [] };
  records.push(record);
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const transport = { mode: options.mode || 'normal', status: options.status || 200, release };
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.hostname === 'formspree.io') {
      record.posts.push({ method: request.method(), body: request.postData() });
      if (transport.mode === 'network') return route.abort('failed');
      if (transport.mode === 'pending') await pending;
      if (transport.mode === 'timeout') await new Promise(resolve => setTimeout(resolve, 200));
      try {
        return await route.fulfill({ status: transport.status, contentType: 'application/json', body: transport.status === 204 ? '' : transport.status < 300 ? '{"ok":true}' : '{"error":"simulated"}' });
      } catch (error) { /* A simulated client timeout can cancel this intercepted request. */ return; }
    }
    if (url.origin !== origin || request.method() !== 'GET') {
      record.blocked.push({ url: request.url(), method: request.method() });
      return route.abort();
    }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ status: 200, contentType: mime[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  await context.addInitScript(({ choice, fastTimeout }) => {
    if (choice !== null) localStorage.setItem('ac_cookie_consent_v2', choice);
    window.__testOpens = [];
    window.open = url => { window.__testOpens.push(url); return null; };
    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (link) event.preventDefault();
    }, true);
    if (fastTimeout) {
      window.__testFastTimeout = true;
      const timer = window.setTimeout.bind(window);
      window.setTimeout = (callback, delay, ...args) => timer(callback, window.__testFastTimeout && delay === 15000 ? 25 : delay, ...args);
    }
  }, { choice: options.choice === undefined ? 'accepted' : options.choice, fastTimeout: options.mode === 'timeout' });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => record.errors.push(error.message));
  await page.goto(origin + '/' + (options.file || ''), { waitUntil: 'load' });
  console.log('Homepage scenario:', options.scenario);
  return { context, page, record, transport, events: () => page.evaluate(() => (window.dataLayer || []).map(row => Array.from(row)).filter(row => row[0] === 'event')) };
}
async function fill(page) {
  await page.locator('#quoteProduct').selectOption({ label: 'RCA' });
  await page.locator('#quoteName').fill('  PRIVATE_HOME_NAME  ');
  await page.locator('#quotePhone').fill('+44 (20) 7946-0958');
  await page.locator('#quoteConsent').check();
}
async function submit(page) {
  await page.locator('#quickQuoteForm button[type="submit"]').click();
}
async function waitState(page, state) {
  await page.locator('#quickQuoteForm[data-home-lead-state="' + state + '"]').waitFor();
}
function checkEvents(events, expectedLeads) {
  const leads = events.filter(row => row[1] === 'generate_lead');
  assert.equal(leads.length, expectedLeads);
  assert.equal(events.filter(row => row[1] === 'whatsapp_handoff').length, 0);
  assert.ok(!events.some(row => aliases.includes(row[1])));
  assert.ok(!JSON.stringify(events).includes('PRIVATE_HOME'));
  assert.ok(!JSON.stringify(events).includes('7946'));
  assert.ok(!JSON.stringify(events).includes('2026-12-15'));
  for (const row of leads) {
    assert.equal(row[2].product_id, 'rca');
    assert.equal(row[2].form_id, 'quick_quote');
    assert.equal(row[2].method, 'formspree');
    assert.equal(row[2].cta_location, 'quick_quote');
  }
}

(async () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.indexOf('/form-validation.js') < html.indexOf('/site.js'));
  assert.ok(html.indexOf('/site.js') < html.indexOf('/homepage.js'));
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    const navigation = await open(browser, { scenario: 'native header/footer, responsive menu, product segments', choice: 'rejected' });
    const page = navigation.page;
    assert.equal(await page.locator('.home-header').count(), 1);
    assert.equal(await page.locator('.global-site-header, .global-site-footer').count(), 0);
    assert.equal(await page.locator('footer.home-footer').count(), 1);
    assert.equal(await page.locator('.mobile-contact-bar').count(), 1);
    assert.equal(await page.locator('#quickQuoteForm').getAttribute('method'), 'post');
    assert.equal(await page.locator('#quickQuoteForm').getAttribute('action'), 'https://formspree.io/f/xnjrwnvg');
    for (const [id, name] of [['quoteProduct', 'product'], ['quoteName', 'name'], ['quotePhone', 'phone'], ['quoteExpiry', 'expiry'], ['quoteConsent', 'acord_contact']]) {
      assert.equal(await page.locator('#' + id).getAttribute('name'), name);
    }
    assert.equal(await page.locator('#quoteExpiry').evaluate(e => e.required), false);
    const menu = page.locator('[data-home-menu]'), toggle = page.locator('[data-home-menu-toggle]');
    assert.equal(await menu.isVisible(), false);
    await toggle.click(); assert.equal(await menu.isVisible(), true); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await menu.locator('a').first().focus(); await page.keyboard.press('Escape');
    assert.equal(await toggle.evaluate(e => e === document.activeElement), true); assert.equal(await menu.isVisible(), false);
    await toggle.click(); await page.locator('h1').evaluate(e => e.click()); assert.equal(await menu.isVisible(), false);
    await toggle.click(); await menu.locator('a').first().click(); assert.equal(await menu.isVisible(), false);
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.waitForFunction(() => !document.querySelector('[data-home-menu]').hidden);
    assert.equal(await menu.isVisible(), true);
    await page.setViewportSize({ width: 390, height: 900 }); await page.waitForFunction(() => document.querySelector('[data-home-menu]').hidden);
    const business = page.locator('[data-home-segment="business"]'), personal = page.locator('[data-home-segment="personal"]');
    assert.equal(await page.locator('#personal-products').isVisible(), true); assert.equal(await page.locator('#business-products').isVisible(), false);
    await business.click(); assert.equal(await business.getAttribute('aria-pressed'), 'true'); assert.equal(await personal.getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('#personal-products').isVisible(), false); assert.equal(await page.locator('#business-products').isVisible(), true);
    await personal.focus(); await page.keyboard.press('Space'); assert.equal(await page.locator('#personal-products').isVisible(), true);
    await business.click(); await toggle.click(); await page.locator('[data-home-segment-link="personal"]').click(); assert.equal(await personal.getAttribute('aria-pressed'), 'true');
    await page.locator('#quoteProduct').selectOption({ label: 'CASCO' }); await page.locator('[data-home-renewal]').click();
    assert.equal(await page.locator('#quoteProduct').inputValue(), 'RCA'); await page.waitForFunction(() => document.activeElement.id === 'quoteExpiry');
    await navigation.context.close();

    const cookies = await open(browser, { scenario: 'homepage cookie settings save/refuse/accept/revoke', choice: null });
    assert.equal(cookies.record.blocked.length, 0, 'No Analytics script before choice');
    assert.equal(await cookies.page.locator('#cookie-consent').getAttribute('aria-modal'), 'false');
    await cookies.page.locator('#quoteName').focus();
    assert.equal(await cookies.page.locator('#quoteName').evaluate(e => e === document.activeElement), true, 'Nonmodal banner leaves page controls available');
    await cookies.page.locator('.home-cookie-settings').click();
    assert.equal(await cookies.page.locator('#home-cookie-options').isVisible(), true);
    assert.equal(await cookies.page.locator('#home-cookie-analytics').isChecked(), false);
    await cookies.page.locator('[data-home-cookie-save]').click();
    assert.equal(await cookies.page.evaluate(() => localStorage.getItem('ac_cookie_consent_v2')), 'rejected');
    assert.equal(cookies.record.blocked.length, 0);
    await cookies.page.locator('[data-cookie-preferences]').click(); await cookies.page.locator('.home-cookie-settings').click();
    await cookies.page.locator('#home-cookie-analytics').check(); await cookies.page.locator('[data-home-cookie-save]').click();
    assert.equal(await cookies.page.evaluate(() => window.__analyticsAllowed), true);
    await cookies.page.locator('[data-cookie-preferences]').click(); await cookies.page.locator('.home-cookie-settings').click();
    assert.equal(await cookies.page.locator('#home-cookie-analytics').isChecked(), true);
    await cookies.page.locator('#home-cookie-analytics').uncheck(); await cookies.page.locator('[data-home-cookie-save]').click();
    assert.equal(await cookies.page.evaluate(() => window.__analyticsAllowed), false);
    assert.equal(await cookies.page.locator('[data-cookie-preferences]').evaluate(e => e === document.activeElement), true, 'Preferences return focus to the footer control');
    await cookies.context.close();

    for (const file of ['rca.html', 'asigurari.html']) {
      const interior = await open(browser, { scenario: file + ' shared navigation/footer and cookie controls retained', choice: null, file });
      assert.equal(await interior.page.locator('.global-site-header').count(), 1);
      assert.equal(await interior.page.locator('.global-site-footer').count(), 1);
      assert.equal(await interior.page.locator('.global-site-brand__logo').getAttribute('src'), '/brand-logo.webp');
      assert.equal(await interior.page.locator('.home-cookie-settings, #home-cookie-options').count(), 0);
      await interior.page.locator('[data-consent="rejected"]').click();
      const toggle = interior.page.locator('.global-site-menu-toggle');
      await toggle.click(); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      assert.equal(await interior.page.locator('#globalSiteMenu').isVisible(), true);
      await interior.page.keyboard.press('Escape'); assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await toggle.evaluate(e => e === document.activeElement), true);
      await interior.context.close();
    }

    const invalid = await open(browser, { scenario: 'invalid name/phone/consent blocked before processor' });
    await fill(invalid.page); await invalid.page.locator('#quoteName').fill('   '); await invalid.page.locator('#quotePhone').fill('abc');
    await submit(invalid.page); assert.equal(invalid.record.posts.length, 0);
    assert.equal(await invalid.page.locator('#quoteName').evaluate(e => e.validity.customError), true);
    await fill(invalid.page); await invalid.page.locator('#quoteConsent').uncheck(); await submit(invalid.page); assert.equal(invalid.record.posts.length, 0);
    checkEvents(await invalid.events(), 0); await invalid.context.close();

    for (const status of [200, 202, 204]) {
      const success = await open(browser, { scenario: 'processor ' + status + ' success + completed guard', status });
      await fill(success.page);
      if (status === 200) await success.page.locator('#quoteExpiry').fill('2026-12-15');
      await submit(success.page); await waitState(success.page, 'success');
      assert.equal(success.record.posts.length, 1);
      assert.ok(success.record.posts[0].body.includes('PRIVATE_HOME_NAME'));
      assert.equal(await success.page.locator('#quickQuoteForm button[type="submit"]').isDisabled(), true);
      await success.page.locator('#quickQuoteForm').evaluate(form => { form.querySelector('button[type="submit"]').disabled = false; form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
      assert.equal(success.record.posts.length, 1);
      checkEvents(await success.events(), 1);
      assert.equal(await success.page.evaluate(() => window.__testOpens.length), 0);
      await success.context.close();
    }
    for (const [mode, status] of [['normal', 422], ['normal', 500], ['network', 200], ['timeout', 200]]) {
      const failure = await open(browser, { scenario: 'processor ' + mode + '/' + status + ' error + retry', mode, status });
      await fill(failure.page); await submit(failure.page); await waitState(failure.page, 'error');
      assert.equal(await failure.page.locator('#quoteName').inputValue(), '  PRIVATE_HOME_NAME  ');
      assert.equal(await failure.page.locator('#quotePhone').inputValue(), '+44 (20) 7946-0958');
      assert.equal(await failure.page.locator('#quoteConsent').isChecked(), true);
      assert.equal(await failure.page.locator('#quickQuoteForm button[type="submit"]').isDisabled(), false);
      checkEvents(await failure.events(), 0);
      failure.transport.mode = 'normal'; failure.transport.status = 200;
      if (mode === 'timeout') await failure.page.evaluate(() => { window.__testFastTimeout = false; });
      await submit(failure.page); await waitState(failure.page, 'success');
      assert.equal(failure.record.posts.length, 2); checkEvents(await failure.events(), 1);
      await failure.context.close();
    }

    const refused = await open(browser, { scenario: 'commercial request works with Analytics refused', choice: 'rejected' });
    await fill(refused.page); await submit(refused.page); await waitState(refused.page, 'success');
    assert.equal(refused.record.posts.length, 1); checkEvents(await refused.events(), 0); assert.equal(refused.record.blocked.length, 0);
    await refused.context.close();

    const pending = await open(browser, { scenario: 'in-flight duplicate guard and Analytics consent withdrawn before success', mode: 'pending' });
    await fill(pending.page); await submit(pending.page); await waitState(pending.page, 'sending');
    await pending.page.locator('#quickQuoteForm').evaluate(form => {
      const button = form.querySelector('button[type="submit"]'); button.disabled = false;
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); button.disabled = true;
    });
    await pending.page.locator('#cookie-settings').click(); await pending.page.locator('[data-consent="rejected"]').click();
    pending.transport.status = 200; pending.transport.release(); await waitState(pending.page, 'success');
    assert.equal(pending.record.posts.length, 1); checkEvents(await pending.events(), 0);
    await pending.context.close();

    const optionalMeasurement = await open(browser, { scenario: 'accepted request stays successful if optional measurement fails' });
    await fill(optionalMeasurement.page); await optionalMeasurement.page.evaluate(() => { window.asigurariAnalytics.trackLead = () => { throw new Error('simulated optional measurement failure'); }; });
    await submit(optionalMeasurement.page); await waitState(optionalMeasurement.page, 'success'); assert.equal(optionalMeasurement.record.posts.length, 1);
    await optionalMeasurement.context.close();

    for (const width of [320, 390, 768, 900, 1024, 1440]) {
      const capture = width === 390 || width === 1440;
      const height = width === 1440 ? 1000 : 844;
      const viewport = await open(browser, { scenario: 'viewport ' + width + 'x' + height, width, height, choice: capture ? null : 'rejected' });
      await viewport.page.waitForTimeout(100);
      const dimensions = await viewport.page.evaluate(() => ({ width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth }));
      viewports.push(dimensions);
      assert.ok(dimensions.documentWidth <= width, 'Horizontal document overflow at ' + width);
      if (output && capture) {
        fs.mkdirSync(output, { recursive: true });
        await viewport.page.screenshot({ path: path.join(output, 'homepage-' + width + 'x' + height + '-viewport.png'), fullPage: false });
        await viewport.page.screenshot({ path: path.join(output, 'homepage-' + width + 'x' + height + '-full.png'), fullPage: true });
      }
      await viewport.context.close();
    }

    for (const record of records) assert.deepEqual(record.errors, [], record.scenario + ': no JavaScript errors');
    if (output) { fs.mkdirSync(output, { recursive: true }); fs.writeFileSync(path.join(output, 'homepage-results.json'), JSON.stringify({ timestamp: new Date().toISOString(), method: 'All network intercepted; local resources from disk, processor simulated, Analytics/WhatsApp blocked.', records, viewports }, null, 2)); }
    console.log('Homepage checks passed:', records.length, 'scenarios; all network intercepted.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
