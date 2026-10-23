const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || path.join(require('node:os').homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))); }
const root = path.resolve(__dirname, '..');
const output = process.env.AUDIT_TEST_OUTPUT;
const records = [];
const aliases = ['whatsapp_click','phone_click','contact_whatsapp_click','contact_phone_click','rca_lead','form_submit','quick_quote_whatsapp','home_offer_click'];
(async () => {
 const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'msedge', headless: true });
 try {
  async function open(file, accepted = true, status = 200, width = 390) {
   const context = await browser.newContext({viewport:{width,height:900},locale:'ro-RO',serviceWorkers:'block'});
   const rec={file,width,mockedPosts:[],blocked:[],errors:[]}; records.push(rec);
   await context.route('**/*', async route => {
    const req=route.request(), u=new URL(req.url());
    if(u.hostname==='formspree.io'){rec.mockedPosts.push({method:req.method(),status,body:req.postData()});return route.fulfill({status,contentType:'application/json',body:status>=200&&status<300?'{"ok":true}':'{"error":"test failure"}'});}
    if(u.hostname!=='asiguraricraiova.ro'){rec.blocked.push(u.hostname);return route.abort();}
    const local=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
    if(!local.startsWith(root+path.sep)||!fs.existsSync(local)||!fs.statSync(local).isFile())return route.fulfill({status:404,body:''});
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'}[path.extname(local)]||'application/octet-stream';
    return route.fulfill({status:200,contentType:type,body:fs.readFileSync(local)});
   });
   await context.addInitScript(()=>{window.__testOpens=[];window.open=(url,target,features)=>{window.__testOpens.push({url,target,features});return null;};document.addEventListener('click',e=>{const a=e.target.closest?.('a');if(a&&/^(tel:|mailto:|https:\/\/wa\.me\/)/.test(a.href))e.preventDefault();},true);});
   const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>rec.errors.push(e.message));
   await page.goto('https://asiguraricraiova.ro/'+file,{waitUntil:'load'});
   if(accepted)await page.locator('[data-consent=accepted]').click();
   console.log('Analytics scenario:',file||'/',width,status);
   return {page,context,rec,events:()=>page.evaluate(()=>(window.dataLayer||[]).map(x=>Array.from(x)).filter(x=>x[0]==='event'))};
  }
  const consent=await open('',false);
  assert.deepEqual(await consent.events(),[]);assert(!consent.rec.blocked.some(h=>h.includes('googletagmanager')));
  await consent.page.locator('[data-consent=rejected]').click();await consent.page.locator('.mobile-contact-bar a[href^="tel:"]').click();assert.deepEqual(await consent.events(),[]);
  await consent.page.locator('#cookie-settings').click();await consent.page.locator('[data-consent=accepted]').click();await consent.page.locator('.mobile-contact-bar a[href^="tel:"]').click();
  let ev=await consent.events();assert.equal(ev.length,1);assert.equal(ev[0][1],'contact_click');assert.equal(ev[0][2].method,'phone');
  await consent.page.locator('#cookie-settings').click();await consent.page.locator('[data-consent=rejected]').click();await consent.page.locator('.mobile-contact-bar a[href^="tel:"]').click();assert.equal((await consent.events()).length,1);
  await consent.page.reload();assert.deepEqual(await consent.events(),[]);consent.rec.result='consent/refusal/withdrawal pass';await consent.context.close();
  for(const width of [390,1440]){
   const quote=await open('',true,200,width);
   assert.equal(await quote.page.locator('#quickQuoteForm').evaluate(form=>form.hasAttribute('data-home-lead-form')),true);
   await quote.page.locator('#quoteProduct').selectOption({label:'RCA'});await quote.page.locator('#quoteName').fill('PRIVATE_TEST_MARKER_DO_NOT_COLLECT');await quote.page.locator('#quotePhone').fill('+40 774 123 456');
   await quote.page.locator('#quoteExpiry').fill('2026-11-23');await quote.page.locator('#quoteConsent').check();
   await quote.page.locator('#quickQuoteForm button[type=submit]').click();await quote.page.locator('#quickQuoteForm[data-home-lead-state=success]').waitFor();
   await quote.page.locator('#quickQuoteForm').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
   ev=await quote.events();assert.equal(ev.filter(x=>x[1]==='generate_lead').length,1);assert.equal(ev.filter(x=>['whatsapp_handoff','contact_click'].includes(x[1])).length,0);assert.equal(ev.filter(x=>x[1]==='quote_start').length,1);
   assert(!ev.some(x=>aliases.includes(x[1])));assert(!JSON.stringify(ev).includes('PRIVATE_TEST_MARKER'));assert.equal(await quote.page.locator('a[href*="PRIVATE_TEST_MARKER"]').count(),0);
   assert(!JSON.stringify(ev).includes('774'));assert(!JSON.stringify(ev).includes('2026-11-23'));
   const opens=await quote.page.evaluate(()=>window.__testOpens);assert.equal(opens.length,0);assert.equal(quote.rec.mockedPosts.length,1);assert(quote.rec.mockedPosts[0].body.includes('PRIVATE_TEST_MARKER'));
   assert.equal(ev.find(x=>x[1]==='generate_lead')[2].product_id,'rca');assert.equal(ev.find(x=>x[1]==='generate_lead')[2].form_id,'quick_quote');assert.equal(ev.find(x=>x[1]==='generate_lead')[2].method,'formspree');
   quote.rec.result='one accepted homepage lead, zero handoffs/aliases, no PII in Analytics';
   if(output){fs.mkdirSync(output,{recursive:true});await quote.page.screenshot({path:path.join(output,`quote-${width}.png`)});}await quote.context.close();
  }
  const legacy=await open('asigurari.html',true,200);
  await legacy.page.locator('#quoteProduct').selectOption({label:'RCA'});await legacy.page.locator('#quoteProfile').selectOption({index:1});await legacy.page.locator('#quoteWhen').selectOption({index:1});
  await legacy.page.locator('#quoteDetails').fill('PRIVATE_TEST_MARKER_LEGACY');await legacy.page.locator('#quoteConsent').check();
  await legacy.page.locator('#quickQuoteForm button[type=submit]').click();await legacy.page.locator('#quickQuoteForm button[type=submit]').click();
  ev=await legacy.events();assert.equal(ev.filter(x=>x[1]==='whatsapp_handoff').length,1);assert.equal(ev.filter(x=>x[1]==='generate_lead').length,0);assert.equal(legacy.rec.mockedPosts.length,0);
  assert(!JSON.stringify(ev).includes('PRIVATE_TEST_MARKER'));assert(!ev.some(x=>aliases.includes(x[1])));assert.equal(await legacy.page.locator('a[href*="PRIVATE_TEST_MARKER"]').count(),0);
  legacy.rec.result='legacy catalog retains one WhatsApp handoff, zero lead/aliases, no free text in Analytics';await legacy.context.close();
  for(const status of [200,202,422]){
   const lead=await open('rca.html',true,status),form=lead.page.locator('[data-rca-lead-form]');
   await form.locator('input[name=nume]').fill('PRIVATE_TEST_NAME');await form.locator('input[name=telefon]').fill('+40 774 123 456');await form.locator('input[type=checkbox]').check();await form.locator('button[type=submit]').click();
   await lead.page.locator('[data-rca-lead-status]').filter({hasText:status<300?'Cererea a fost trimisă':'Cererea nu a putut fi trimisă'}).waitFor();
   ev=await lead.events();const generated=ev.filter(x=>x[1]==='generate_lead');assert.equal(generated.length,status<300?1:0);assert.equal(lead.rec.mockedPosts.length,1);
   assert(!ev.some(x=>aliases.includes(x[1])));assert(!JSON.stringify(ev).includes('PRIVATE_TEST_NAME'));assert(!JSON.stringify(ev).includes('774'));
   if(status<300){assert.equal(generated[0][2].product_id,'rca');assert.equal(generated[0][2].form_id,'rca_short_lead');await form.evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));assert.equal(lead.rec.mockedPosts.length,1,'completed form cannot be reentered');}
   lead.rec.result=status<300?'one lead after success':'zero leads after error';await lead.context.close();
  }
  const contact=await open('contact.html?asigurare=locuinta&sursa=locuinta');assert.equal(await contact.page.locator('#contact-produs').inputValue(),'Locuință + PAD (soluție coordonată)');
  await contact.page.locator('#contact-nume').fill('PRIVATE_TEST_CONTACT');await contact.page.locator('#contact-telefon').fill('0774 123 456');await contact.page.locator('#contactForm input[type=checkbox]').check();await contact.page.locator('#contactForm button[type=submit]').click();
  await contact.page.locator('#contactStatus').filter({hasText:'Cererea a fost trimisă'}).waitFor();ev=await contact.events();assert.equal(ev.filter(x=>x[1]==='generate_lead').length,1);assert.equal(ev.find(x=>x[1]==='generate_lead')[2].product_id,'locuinta');assert(!JSON.stringify(ev).includes('PRIVATE_TEST_CONTACT'));
  contact.rec.result='Contact product preserved, one classified lead';await contact.context.close();
  const footer=await open('rca.html');await footer.page.locator('.global-site-footer__cta').click();ev=await footer.events();assert.equal(ev.filter(x=>x[1]==='contact_click').length,1);assert.equal(ev.find(x=>x[1]==='contact_click')[2].cta_location,'footer');
  footer.rec.result='one direct contact click, footer classified';await footer.context.close();
  for(const [file,expected] of [['blog-rca-craiova-2026.html','rca'],['blog-restituire-rca-rovinieta.html','rca'],['blog-pad-locuinta.html','locuinta'],['blog-pensie-pilon3.html','pensie']]){
   const article=await open(file);await article.page.locator('.mobile-contact-bar a[href^="https://wa.me/"]').click();ev=await article.events();assert.equal(ev.find(x=>x[1]==='contact_click')[2].product_id,expected);article.rec.result='article CTA product '+expected;await article.context.close();
  }
  for(const r of records)assert.deepEqual(r.errors,[],'JavaScript error in '+r.file);
  if(output)fs.writeFileSync(path.join(output,'analytics-results.json'),JSON.stringify(records,null,2));
  console.log(`Analytics checks passed: ${records.length} browser scenarios, all external requests intercepted.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
