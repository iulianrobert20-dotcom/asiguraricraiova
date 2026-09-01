import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const canonicalPages = [];

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function count(source, pattern) {
  return (source.match(pattern) || []).length;
}

function localPathFromUrl(value) {
  if (!value || /^(?:mailto:|tel:|javascript:|data:|#)/i.test(value)) return null;
  let url;
  try { url = new URL(value, 'https://asiguraricraiova.ro/'); } catch { return null; }
  if (url.hostname !== 'asiguraricraiova.ro' && url.hostname !== 'www.asiguraricraiova.ro') return null;
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') return 'index.html';
  return pathname.replace(/^\//, '').replace(/\/$/, '/index.html');
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapLastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
const today = new Date().toISOString().slice(0, 10);
if (sitemapLastmods.length !== sitemapUrls.length) {
  fail('sitemap.xml', 'fiecare URL trebuie să aibă lastmod');
}
if (sitemapLastmods.some((value) => !/^\d{4}-\d{2}-\d{2}$/.test(value) || value > today)) {
  fail('sitemap.xml', 'lastmod trebuie să fie o dată ISO validă, care nu este în viitor');
}

for (const url of sitemapUrls) {
  const local = localPathFromUrl(url);
  if (!local || !fs.existsSync(path.join(root, local))) fail('sitemap.xml', `lipsește fișierul pentru ${url}`);
}

for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const canonical = (source.match(/<link rel="canonical" href="([^"]+)">/i) || [])[1];
  if (!canonical) {
    if (file !== '404.html') fail(file, 'lipsește canonical');
    continue;
  }
  canonicalPages.push({ file, canonical });

  const title = (source.match(/<title>([^<]+)<\/title>/i) || [])[1] || '';
  const description = (source.match(/<meta name="description" content="([^"]+)">/i) || [])[1] || '';
  if (!title || title.length > 60) fail(file, `titlu invalid (${title.length} caractere)`);
  if (!description || description.length > 160) fail(file, `descriere invalidă (${description.length} caractere)`);
  if (count(source, /<h1\b/gi) !== 1) fail(file, `număr H1 diferit de 1`);
  if (!/<main\b|role="main"/i.test(source)) fail(file, 'lipsește reperul main');
  if (count(source, /property="og:title"/gi) !== 1) fail(file, 'og:title lipsește sau este duplicat');
  if (count(source, /property="og:description"/gi) !== 1) fail(file, 'og:description lipsește sau este duplicat');
  if (count(source, /property="og:image"/gi) !== 1) fail(file, 'og:image lipsește sau este duplicat');
  if (count(source, /name="twitter:card"/gi) !== 1) fail(file, 'twitter:card lipsește sau este duplicat');
  if (count(source, /name="twitter:image"/gi) !== 1) fail(file, 'twitter:image lipsește sau este duplicat');
  if (!/Content-Security-Policy/i.test(source)) fail(file, 'lipsește politica CSP');
  if (/googletagmanager\.com\/gtag\/js|gtag\(['"]config['"]/i.test(source)) fail(file, 'Analytics este încărcat direct');
  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(source)) fail(file, 'fonturile externe Google se încarcă înainte de consimțământ');
  if (/javascript:void/i.test(source)) fail(file, 'link javascript:void ne-crawlabil');
  if (/<div\b[^>]*onclick="window\.location/i.test(source)) fail(file, 'card div cu navigare inline');

  const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) fail(file, `ID-uri duplicate: ${duplicateIds.join(', ')}`);

  for (const match of source.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const local = localPathFromUrl(match[1]);
    if (!local || /\{/.test(local)) continue;
    if (!fs.existsSync(path.join(root, local))) fail(file, `resursă locală lipsă: ${match[1]}`);
  }
}

const canonicalValues = canonicalPages.map((entry) => entry.canonical);
for (const duplicate of canonicalValues.filter((value, index) => canonicalValues.indexOf(value) !== index)) {
  fail('canonical', `valoare duplicată: ${duplicate}`);
}
for (const canonical of canonicalValues) {
  if (!sitemapUrls.includes(canonical)) fail('sitemap.xml', `lipsește pagina canonică ${canonical}`);
}
for (const url of sitemapUrls) {
  if (!canonicalValues.includes(url)) fail('sitemap.xml', `URL fără canonical corespondent: ${url}`);
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/page-despre|function showPage/i.test(index)) fail('index.html', 'conține încă paginile SPA ascunse');
if (!/<form\b[^>]*id="quickQuoteForm"/i.test(index)) fail('index.html', 'formularul rapid de ofertă lipsește');
if (!/id="quoteConsent"[^>]*required/i.test(index)) fail('index.html', 'acordul pentru trimiterea cererii rapide lipsește');
if (count(index, /class="insurance-card"/g) < 6) fail('index.html', 'alegerile principale de asigurare sunt incomplete');
if (/SearchAction|"sameAs"\s*:\s*\[\]|"geo"\s*:/i.test(index)) fail('index.html', 'schema conține semnale nevalidate sau nefuncționale');

const calculator = fs.readFileSync(path.join(root, 'calculator-rca.html'), 'utf8');
for (const required of [
  '[2156, 2490, 2206, 2150, 2196, 2756, 2689, 2695]',
  '[1476, 1719, 1495, 1499, 1569, 1825, 1925, 1868]',
  '[2215, 2417, 2693, 2959, 3088, 4077, 4186, 3978]',
  '[1359, 1471, 1665, 1758, 1891, 2500, 2499, 2416]',
  "{ id:'B7', coef:0.60",
  "{ id:'B6', coef:0.70",
  "{ id:'M8', coef:1.80"
]) {
  if (!calculator.includes(required)) fail('calculator-rca.html', `valoare oficială absentă: ${required}`);
}
if (/const N\s*=|Prima recomandată BAAR \(estimat\)|M8 → 400%/i.test(calculator)) {
  fail('calculator-rca.html', 'conține vechea estimare BAAR sau vechiul M8');
}

const contact = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
if (!/<form\b[^>]*id="contactForm"/i.test(contact)) fail('contact.html', 'formularul semantic lipsește');
if (!/name="acord_contact"[^>]*required/i.test(contact)) fail('contact.html', 'consimțământul de contact lipsește');
if (/<iframe\b[^>]*src=/i.test(contact)) fail('contact.html', 'Google Maps se încarcă înainte de acțiunea utilizatorului');

for (const asset of ['site.js', 'site.css', 'home.css', 'products.css', 'hero-asigurari-craiova.webp', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og-image.png']) {
  const assetPath = path.join(root, asset);
  if (!fs.existsSync(assetPath) || fs.statSync(assetPath).size === 0) fail(asset, 'activ absent sau gol');
}

const forbiddenClaims = [
  /înlocuiește PAD/i,
  /deduci până la 400 EUR\/an din impozit/i,
  /același preț ca direct/i,
  /compar ofertele tuturor asigurătorilor/i,
  /îți (?:ofer|găsesc|trimit) cel mai bun preț/i
];
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const pattern of forbiddenClaims) if (pattern.test(source)) fail(file, `afirmație comercială/juridică nepermisă: ${pattern}`);
}

for (const file of ['unitlinked.html', 'leu-forte.html', 'leu-dinamic.html']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (!/allianztiriac\.ro\/ro_RO\/documente-utile\.html/i.test(source)) {
    fail(file, 'lipsește legătura către documentele oficiale curente');
  }
  if (!/mai puțin decât/i.test(source)) {
    fail(file, 'lipsește avertizarea privind posibilitatea pierderii');
  }
  if (!/performanț/i.test(source) || !/(?:nu garantează|nu sunt o garanție)/i.test(source)) {
    fail(file, 'lipsește avertizarea privind performanța istorică');
  }
  if (/randament (?:sigur|garantat)|profit garantat|capital garantat|fără risc/i.test(source)) {
    fail(file, 'conține o promisiune investițională nepermisă');
  }
}

if (errors.length) {
  console.error(`Validarea a eșuat (${errors.length} probleme):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Validare reușită: ${canonicalPages.length} pagini canonice, ${sitemapUrls.length} URL-uri în sitemap, fără regresiile critice din audit.`);
