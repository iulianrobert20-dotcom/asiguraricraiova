import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'locuinta.html'), 'utf8');
const policy = html.match(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*content="([^"]+)"/i)?.[1];
assert.ok(policy, 'Pagina Locuință trebuie să declare CSP înainte de resurse.');
const directives = new Map(policy.split(';').map(part => part.trim().split(/\s+/)).filter(([name]) => name).map(([name, ...values]) => [name, values]));
for (const [name, values] of directives) {
  if (/^(?:script|style)-src/.test(name)) {
    assert.ok(!values.some(value => ["'unsafe-inline'", "'unsafe-eval'", '*', 'https:'].includes(value)), `${name} nu trebuie să redeschidă execuția generală sau inline.`);
  }
}
for (const name of ['default-src', 'script-src', 'style-src']) {
  assert.ok(directives.get(name)?.includes("'self'"), `${name} trebuie să permită resursele proprii.`);
  assert.ok(!directives.get(name).some(value => ["'unsafe-inline'", "'unsafe-eval'", '*', 'https:'].includes(value)), `${name} nu trebuie să permită cod inline, eval sau surse generale.`);
}
for (const name of ['script-src-attr', 'style-src-attr', 'object-src', 'frame-src']) {
  assert.deepEqual(directives.get(name), ["'none'"], `${name} trebuie să rămână blocat.`);
}
assert.deepEqual(directives.get('base-uri'), ["'self'"]);
assert.deepEqual(directives.get('form-action'), ["'self'"]);
assert.ok(!directives.has('frame-ancestors'), 'frame-ancestors trebuie livrat prin HTTP, nu prin meta.');
assert.ok(!/<style\b|\sstyle\s*=|\son[a-z]+\s*=/i.test(html), 'Nu reintroduce stiluri sau event handlers inline în pagina protejată.');
for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\btype="application\/ld\+json"/i.test(attrs)) {
    JSON.parse(body);
    continue;
  }
  assert.match(attrs, /\bsrc="\//, 'Scripturile executabile trebuie să fie fișiere proprii, fără cod inline.');
  assert.equal(body.trim(), '');
}
assert.match(html, /<link rel="stylesheet" href="\/locuinta\.css\?v=[^"]+">/);
assert.ok(fs.statSync(path.join(root, 'locuinta.css')).size > 0);
for (const directive of ['script-src', 'img-src', 'connect-src']) {
  assert.ok(directives.get(directive)?.includes('https://www.googletagmanager.com'), `${directive} trebuie să păstreze funcționarea Analytics după acord.`);
}
const rules = JSON.parse(fs.readFileSync(path.join(root, 'deploy/cloudflare-response-header-rules.json'), 'utf8'));
const frameRule = rules.find(rule => rule.action_parameters?.headers?.['content-security-policy']);
const hstsRule = rules.find(rule => rule.action_parameters?.headers?.['strict-transport-security']);
assert.equal(frameRule?.action_parameters.headers['content-security-policy'].value, "frame-ancestors 'none'");
assert.equal(frameRule?.action_parameters.headers['x-frame-options'].value, 'DENY');
assert.ok(frameRule.expression.includes('"/locuinta.html"') && frameRule.expression.includes('"/locuinta"'), 'Protecția iframe trebuie să includă aliasul fără extensie.');
assert.equal(hstsRule?.action_parameters.headers['strict-transport-security'].value, 'max-age=300');
console.log('Locuință: CSP fără cod inline, resurse proprii, Analytics permis după acord și șabloane HTTP verificate. Activarea Cloudflare se verifică separat pe live.');
