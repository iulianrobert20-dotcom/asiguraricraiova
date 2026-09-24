import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const localFile = (url) => {
  const pathname = new URL(url).pathname;
  return pathname === '/' ? 'index.html' : pathname.replace(/^\//, '').replace(/\/$/, '/index.html');
};
const match = (html, pattern) => (html.match(pattern) || [])[1] || '';
const clean = (value) => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const cell = (value) => String(value || '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const rows = [];
const issues = [];

for (const url of urls) {
  const file = localFile(url);
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const title = clean(match(html, /<title>([\s\S]*?)<\/title>/i));
  const description = clean(match(html, /<meta\s+name="description"\s+content="([^"]*)"/i));
  const h1 = clean(match(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i));
  const canonical = match(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const robots = match(html, /<meta\s+name="robots"\s+content="([^"]+)"/i) || 'nespecificat';
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((item) => {
      try {
        const data = JSON.parse(item[1]);
        return (data['@graph'] || [data]).map((node) => node['@type']).filter(Boolean);
      } catch {
        issues.push(`${file}: JSON-LD invalid`);
        return ['JSON-LD invalid'];
      }
    });
  const internal = [...html.matchAll(/\bhref="(\/[^"]*)"/gi)]
    .map((item) => item[1].split(/[?#]/)[0]).filter((target) => target && target !== '/');
  const cta = clean(match(html, /<a\b[^>]*class="[^"]*(?:home-btn|btn|cta)[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
    || match(html, /<button\b[^>]*type="submit"[^>]*>([\s\S]*?)<\/button>/i));
  const pageIssues = [];
  if (!title) pageIssues.push('fără title');
  if (!description) pageIssues.push('fără meta description');
  if (!h1) pageIssues.push('fără H1');
  if (canonical !== url) pageIssues.push('canonical diferit de URL');
  if (internal.length < 2) pageIssues.push('puține linkuri interne în HTML');
  if (!cta) pageIssues.push('CTA principal neidentificat automat');
  if (pageIssues.length) issues.push(`${file}: ${pageIssues.join(', ')}`);
  rows.push([file, title, description, h1, canonical, robots, [...new Set(schemas)].join(', '),
    `${new Set(internal).size} destinații`, cta, pageIssues.join('; ') || '—']);
}

const header = ['URL local', 'Title', 'Meta description', 'H1', 'Canonical', 'Robots', 'Schema', 'Linkuri interne', 'CTA detectat', 'Observații'];
const lines = [
  '# Baseline SEO + CRO — 23 septembrie 2026',
  '',
  'Inventar generat din cele 47 de URL-uri ale `sitemap.xml` și din HTML-ul versiunii de bază. Valorile reflectă sursa locală; nu confirmă indexarea sau performanța în Google. Numărul de linkuri interne cuprinde doar destinații absolute locale din HTML, fără meniul creat din JavaScript. CTA și observațiile sunt verificări automate preliminare.',
  '',
  `| ${header.join(' | ')} |`,
  `| ${header.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
  '',
  '## Semnale care cer verificare manuală',
  '',
  ...issues.map((issue) => `- ${issue}`),
  '',
  '## Stack și protecția versiunilor',
  '',
  'Site static HTML/CSS/JavaScript, construit și publicat cu GitHub Pages; `npm test` rulează validarea locală și pe PR. Nu se schimbă framework-ul, URL-urile sau calculatorul RCA în această etapă.',
  ''
];
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/seo-cro-baseline.md'), lines.join('\n'));
console.log(`Inventar: ${rows.length} URL-uri, ${issues.length} observații automate.`);
