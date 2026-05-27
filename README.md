# AsigurăriCraiova.ro 🛡️

Site-ul oficial al **Robert Iulian Stoica** — Intermediar autorizat în asigurări și/sau reasigurări.

**📞 0774 171 971** | **✉️ asiguraricraiova@yahoo.com**

---

## 🗂️ Structura repository-ului

```
asiguraricraiova/
├── index.html        ← Site-ul complet (single-page)
├── sitemap.xml       ← SEO sitemap pentru Google
├── robots.txt        ← Instrucțiuni pentru crawlere
├── CNAME             ← Domeniu custom pentru GitHub Pages
└── README.md         ← Acest fișier
```

---

## 🚀 Cum publici pe GitHub Pages

### Pasul 1 — Creează repository-ul
1. Mergi pe [github.com](https://github.com) și autentifică-te
2. Click **"New repository"**
3. Numele repository-ului: `asiguraricraiova` (sau orice nume)
4. Setează-l ca **Public**
5. Click **"Create repository"**

### Pasul 2 — Încarcă fișierele
1. În repository-ul nou, click **"uploading an existing file"**
2. Trage toate fișierele din acest folder (`index.html`, `sitemap.xml`, `robots.txt`, `CNAME`, `README.md`)
3. Click **"Commit changes"**

### Pasul 3 — Activează GitHub Pages
1. Mergi la **Settings** → **Pages**
2. La **Source** selectează: `Deploy from a branch`
3. La **Branch** selectează: `main` → `/ (root)`
4. Click **Save**
5. Așteaptă 2-3 minute → site-ul apare la `https://[username].github.io/asiguraricraiova/`

### Pasul 4 — Configurează domeniul custom
1. Tot în **Settings → Pages**, la **Custom domain** scrie: `asiguraricraiova.ro`
2. Click **Save**
3. Bifează **"Enforce HTTPS"**

---

## 🌐 Configurare DNS (la registrar — RoTLD)

Adaugă aceste înregistrări DNS în panoul de control al domeniului:

### Înregistrări A (pentru domeniu principal)
```
Tip: A    Nume: @    Valoare: 185.199.108.153    TTL: 3600
Tip: A    Nume: @    Valoare: 185.199.109.153    TTL: 3600
Tip: A    Nume: @    Valoare: 185.199.110.153    TTL: 3600
Tip: A    Nume: @    Valoare: 185.199.111.153    TTL: 3600
```

### Înregistrare CNAME (pentru www)
```
Tip: CNAME    Nume: www    Valoare: [username].github.io    TTL: 3600
```

> ⏱️ Propagarea DNS durează 24–48 ore. Verifică statusul pe [dnschecker.org](https://dnschecker.org)

---

## ☁️ Configurare Cloudflare (opțional, recomandat)

Dacă folosești Cloudflare ca nameserver:
1. Adaugă site-ul pe Cloudflare
2. Schimbă nameservere-le la RoTLD cu cele date de Cloudflare
3. Adaugă înregistrările DNS de mai sus în Cloudflare
4. Activează **SSL/TLS → Full (strict)**
5. Activează **Auto Minify** (HTML, CSS, JS)
6. Activează **Brotli compression**

---

## 📊 Google Search Console

După publicare, înregistrează site-ul:
1. Mergi la [search.google.com/search-console](https://search.google.com/search-console)
2. Adaugă proprietatea: `https://asiguraricraiova.ro`
3. Verifică proprietatea prin fișier HTML sau DNS
4. Submit sitemap: `https://asiguraricraiova.ro/sitemap.xml`

---

## 📱 Google Business Profile (gratuit, esențial pentru SEO local)

1. Mergi la [business.google.com](https://business.google.com)
2. Adaugă afacerea: **AsigurăriCraiova.ro — Robert Iulian Stoica**
3. Categoria: **Broker de asigurări**
4. Adaugă adresa din Craiova, numărul de telefon și site-ul
5. Verifică prin carte poștală sau telefon

---

## 📧 Email profesional (opțional)

Înlocuiește `asiguraricraiova@yahoo.com` cu `contact@asiguraricraiova.ro`:
1. Creează cont pe [Zoho Mail](https://zoho.com/mail) (gratuit) sau Google Workspace
2. Adaugă înregistrările MX în DNS
3. Actualizează adresa de email în `index.html`

---

## ✅ Checklist după publicare

- [ ] Site-ul se deschide la `https://asiguraricraiova.ro`
- [ ] HTTPS funcționează (lacăt verde în browser)
- [ ] Butonul WhatsApp deschide conversația cu mesaj pre-completat
- [ ] Formularul de contact funcționează (integrează cu Formspree)
- [ ] Sitemap trimis în Google Search Console
- [ ] Google Business Profile activ
- [ ] Înregistrare Google Analytics (GA4) pentru statistici

---

## 🔗 Integrare formular cu Formspree (gratuit)

1. Mergi pe [formspree.io](https://formspree.io) și creează un cont
2. Creează un nou form → copiază endpoint-ul (ex: `https://formspree.io/f/xabc123`)
3. În `index.html`, caută funcția `submitForm` și înlocuiește cu:

```javascript
async function submitForm(btn) {
  const form = btn.closest('.cform');
  const data = new FormData();
  data.append('name', form.querySelector('input[type="text"]').value);
  data.append('phone', form.querySelector('input[type="tel"]').value);
  data.append('email', form.querySelector('input[type="email"]').value || '');
  // ... adaugă restul câmpurilor

  const res = await fetch('https://formspree.io/f/CODUL_TAU', {
    method: 'POST', body: data, headers: {'Accept': 'application/json'}
  });

  if (res.ok) {
    btn.textContent = '✅ Trimis! Te contactez în curând.';
    btn.style.background = '#065f46';
    btn.disabled = true;
  }
}
```

---

## ⚖️ Informații legale

- **Titular:** Robert Iulian Stoica
- **Certificat ISF:** Seria PPIi NR: 256558
- **Valabilitate:** 31.03.2026 – 31.03.2029
- **Categoria:** Intermediar în asigurări și/sau reasigurări
- **Baza legală:** Legea nr. 236/2018 + Norma ASF nr. 23/2021
- **Partener:** Destine Broker de Asigurare (înscris în Registrul ASF)

---

*Ultima actualizare: Mai 2026*
