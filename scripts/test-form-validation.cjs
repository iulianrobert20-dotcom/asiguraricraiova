const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const bundledPlaywright = path.join(require('node:os').homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || process.env.PLAYWRIGHT_MODULE || bundledPlaywright)); }

const root = path.resolve(__dirname, '..');
const origin = 'https://asiguraricraiova.ro';
const pages = ['index.html', 'asigurari.html', 'rca.html', 'rca-in-rate.html', 'contact.html', 'locuinta.html', 'calatorie.html', 'multitravel.html', 'asigurare-viata-karma-buna.html', 'raspundere-civila-profesionala.html', 'asigurare-sanatate-expati.html', 'alatura-te-echipei.html', 'calculator-rca.html'];
const evidence = process.env.FORM_VALIDATION_EVIDENCE_DIR;
if (evidence) fs.mkdirSync(evidence, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.jpeg': 'image/jpeg' };

async function harness(browser, url, width = 390) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const posts = [], external = [], errors = [];
  let responseStatus = 500;
  // Every request is fulfilled from disk or simulated; the browser never reaches the network.
  await context.route('**/*', async route => {
    const request = route.request();
    const address = new URL(request.url());
    if (address.origin === origin && request.method() === 'GET') {
      const pathname = decodeURIComponent(address.pathname === '/' ? '/index.html' : address.pathname);
      const file = path.resolve(root, '.' + pathname);
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        return route.fulfill({ status: 404, body: 'Local test resource unavailable' });
      }
      return route.fulfill({ status: 200, contentType: mime[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
    }
    external.push({ url: request.url(), method: request.method() });
    if (address.hostname === 'formspree.io' && request.method() === 'POST') {
      posts.push({ body: request.postData() });
      return route.fulfill({ status: responseStatus, contentType: 'application/json', body: responseStatus === 200 ? '{"ok":true}' : '{"error":"simulated"}' });
    }
    return route.fulfill({ status: 200, contentType: 'text/plain', body: '' });
  });
  await context.addInitScript(() => {
    localStorage.setItem('ac_cookie_consent_v2', 'rejected');
    window.__handoffs = [];
    window.open = function (url) { window.__handoffs.push(url); return { closed: false }; };
    document.addEventListener('click', function (event) {
      const anchor = event.target.closest('a[href]');
      if (anchor && /wa\.me|whatsapp\.com/.test(anchor.href)) {
        event.preventDefault(); event.stopImmediatePropagation(); window.__handoffs.push(anchor.href);
      }
    }, true);
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin + '/' + url, { waitUntil: 'load' });
  if (url.startsWith('calculator-rca.html')) await page.evaluate(() => showStep(4));
  return { context, page, posts, external, errors, succeed() { responseStatus = 200; } };
}

async function fillRequired(page) {
  await page.locator('form').evaluate(form => {
    for (const field of form.querySelectorAll('input, select, textarea')) {
      if (!field.required) continue;
      if (field.type === 'checkbox') field.checked = true;
      else if (field.tagName === 'SELECT') field.value = [...field.options].find(o => o.value)?.value || '';
      else if (field.type === 'email') field.value = 'test@example.test';
      else if (field.type === 'tel') field.value = '+44 (20) 7946-0958';
      else if (field.type === 'date') field.value = '2026-11-01';
      else field.value = 'Ion Popescu';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}
const submit = page => page.locator('form').evaluate(form => form.requestSubmit());
async function noDelivery(h, expectedPosts = 0) {
  await h.page.waitForTimeout(40);
  assert.equal(h.posts.length, expectedPosts, 'Invalid request must not reach even the simulated processor.');
  assert.equal(await h.page.evaluate(() => window.__handoffs.length), 0, 'Invalid request must not open WhatsApp.');
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    for (const file of pages) {
      const html = fs.readFileSync(path.join(root, file), 'utf8');
      assert.ok(html.indexOf('/form-validation.js') < html.indexOf('/site.js'), file + ': validation loads before site.js');
      const h = await harness(browser, file);
      const { page } = h;
      assert.equal(await page.locator('form').count(), 1, file + ': one complete form');
      assert.equal(await page.locator('form').evaluate(f => f.noValidate), false);
      await fillRequired(page);
      assert.equal(await page.locator('form').evaluate(f => f.checkValidity()), true, file + ': valid initial fixture');

      const textFields = await page.locator('form input[required][type="text"], form textarea[required]').all();
      for (const field of textFields) {
        const prior = await field.inputValue();
        await field.fill('   ');
        await submit(page);
        await noDelivery(h);
        assert.equal(await field.evaluate(e => e.validity.customError), true, file + ': trim required text');
        assert.equal(await field.getAttribute('aria-invalid'), 'true');
        const error = await field.getAttribute('aria-describedby');
        assert.ok(await page.locator('#' + error.split(' ').at(-1)).innerText(), file + ': field error is readable');
        assert.equal(await field.inputValue(), '   ', file + ': rejected data stays available to correct');
        await field.fill(prior);
        assert.equal(await field.evaluate(e => e.validity.customError), false, file + ': correction clears stale custom validity');
      }
      const phone = page.locator('form input[type="tel"]');
      if (await phone.count()) {
        for (const bad of ['abc', '+40 77abc1971', '123', '123456789012345678']) {
          await phone.fill(bad); await submit(page); await noDelivery(h);
          assert.equal(await phone.evaluate(e => e.validity.valid), false, file + ': bad phone ' + bad);
        }
        for (const good of ['0774 171 971', '+44 (20) 7946-0958', '0049 30 12345678']) {
          await phone.fill(good);
          assert.equal(await phone.evaluate(e => e.validity.valid), true, file + ': international phone ' + good);
        }
      }
      const email = page.locator('form input[type="email"]');
      if (await email.count()) {
        await email.fill('invalid-email'); await submit(page); await noDelivery(h);
        assert.equal(await email.evaluate(e => e.validity.typeMismatch), true, file + ': preserve native email validation');
        await email.fill('test@example.test');
      }
      const select = page.locator('form select[required]').first();
      if (await select.count()) {
        const value = await select.inputValue();
        if (await select.locator('option[value=""]').count()) await select.selectOption('');
        else await select.evaluate(e => { e.value = ''; e.dispatchEvent(new Event('change', { bubbles: true })); });
        await submit(page); await noDelivery(h);
        assert.equal(await select.evaluate(e => e.validity.valueMissing), true, file + ': preserve native select validation');
        await select.selectOption(value);
      }
      const consent = page.locator('form input[type="checkbox"][required]').first();
      if (await consent.count()) {
        await consent.uncheck(); await submit(page); await noDelivery(h);
        assert.equal(await consent.evaluate(e => e.validity.valueMissing), true, file + ': consent still required');
        await consent.check();
      }
      if (file === 'locuinta.html') {
        await page.locator('#homeQuoteArea').fill('68.5');
        assert.equal(await page.locator('#homeQuoteArea').evaluate(e => e.validity.valid), true, 'Decimal home area accepted');
        await page.locator('#homeQuoteArea').fill('0'); await submit(page); await noDelivery(h);
        assert.equal(await page.locator('#homeQuoteArea').evaluate(e => e.validity.rangeUnderflow), true);
        await page.locator('#homeQuoteArea').fill('68.5');
        assert.equal(await page.locator('#homeQuoteYear').inputValue(), '', 'Optional construction year may stay blank');
      }
      // A synthetic submit bypasses HTML's pre-submit pass; capture must still stop target handlers.
      const requiredText = textFields[0];
      if (requiredText) {
        await requiredText.evaluate(e => { e.value = '   '; });
        const prevented = await page.locator('form').evaluate(f => !f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
        assert.equal(prevented, true); await noDelivery(h);
        await requiredText.fill('Ion Popescu');
      }
      assert.equal(await page.locator('form').evaluate(f => f.checkValidity()), true, file + ': corrections allow valid submit');
      const valuesBefore = await page.locator('form').evaluate(f => [...f.querySelectorAll('input,textarea,select')].map(e => [e.id || e.name, e.value]));
      await submit(page);
      await page.waitForTimeout(120);
      const handoffs = await page.evaluate(() => window.__handoffs);
      if (['index.html', 'rca.html', 'rca-in-rate.html', 'contact.html', 'asigurare-sanatate-expati.html', 'alatura-te-echipei.html', 'calculator-rca.html'].includes(file)) {
        assert.equal(h.posts.length, 1, file + ': valid form reaches simulated processor once');
        assert.deepEqual(await page.locator('form').evaluate(f => [...f.querySelectorAll('input,textarea,select')].map(e => [e.id || e.name, e.value])), valuesBefore, file + ': processor error keeps all values');
      } else {
        assert.equal(handoffs.length, 1, file + ': valid form prepares one simulated WhatsApp handoff');
        if (file === 'locuinta.html') assert.ok(decodeURIComponent(handoffs[0]).includes('68.5'), 'Decimal area remains in the request');
      }
      assert.deepEqual(h.errors, [], file + ': no runtime errors');
      assert.ok(h.external.every(x => x.url.startsWith('https://formspree.io/')), file + ': no Analytics/WhatsApp network requests');
      results.push({ file, textFields: textFields.length, simulatedPosts: h.posts.length, simulatedHandoffs: handoffs.length, errors: h.errors });
      await h.context.close();
    }

    for (const [query, product, source] of [
      ['asigurare=locuinta&sursa=locuinta', 'Locuință + PAD (soluție coordonată)', '/locuinta.html'],
      ['asigurare=rca&sursa=rca-in-rate', 'RCA', '/rca-in-rate.html'],
      ['asigurare=bogus&sursa=https%3A%2F%2Fevil.test%2F', '', '/contact.html'],
      ['asigurare=__proto__&sursa=constructor', '', '/contact.html']
    ]) {
      const h = await harness(browser, 'contact.html?' + query, 1440);
      assert.equal(await h.page.locator('#contact-produs').inputValue(), product, 'Only recognized product is preselected');
      assert.equal(await h.page.locator('[name="pagina_sursa"]').inputValue(), source, 'Only recognized source is preserved');
      await fillRequired(h.page);
      await h.page.locator('[name="pagina_sursa"]').evaluate(e => { e.value = 'https://evil.test/'; });
      await submit(h.page); await h.page.waitForTimeout(120);
      assert.equal(await h.page.locator('[name="pagina_sursa"]').inputValue(), source, 'Source is restored before payload serialization');
      assert.ok(h.posts[0].body.includes(source), 'Simulated payload keeps validated source');
      h.succeed(); await submit(h.page); await h.page.waitForTimeout(120);
      assert.equal(h.posts.length, 2, 'Retry works after simulated processor error');
      assert.equal(await h.page.locator('#contact-produs').inputValue(), product, 'Product context survives successful form reset');
      assert.equal(await h.page.locator('[name="pagina_sursa"]').inputValue(), source);
      await h.context.close();
    }

    for (const file of ['rca.html', 'rca-in-rate.html', 'locuinta.html']) {
      const h = await harness(browser, file);
      const links = await h.page.locator('a[href*="contact.html?asigurare="]').evaluateAll(nodes => nodes.map(n => n.href));
      assert.ok(links.length > 0, file + ': commercial links carry context');
      const target = new URL(links[0]);
      await h.page.goto(target.href, { waitUntil: 'load' });
      assert.ok(await h.page.locator('#contact-produs').inputValue(), file + ': product selected after navigation');
      assert.equal(await h.page.locator('[name="pagina_sursa"]').inputValue(), '/' + file);
      await h.context.close();
    }

    if (evidence) {
      for (const width of [390, 1440]) {
        const h = await harness(browser, 'locuinta.html', width);
        await fillRequired(h.page);
        await h.page.locator('#homeQuoteLocation').fill('   ');
        await submit(h.page);
        await h.page.keyboard.press('Escape');
        await h.page.locator('#homeInsuranceQuoteForm').screenshot({ path: path.join(evidence, 'locuinta-error-' + width + '.png') });
        assert.equal(await h.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await h.context.close();
      }
      fs.writeFileSync(path.join(evidence, 'form-validation-results.json'), JSON.stringify({ timestamp: new Date().toISOString(), method: 'All requests intercepted; disk fixtures, simulated Formspree and WhatsApp; no real network.', results }, null, 2));
    }
    console.log(JSON.stringify({ passed: true, pages: results.length, contextCases: 4, navigationCases: 3, results }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
