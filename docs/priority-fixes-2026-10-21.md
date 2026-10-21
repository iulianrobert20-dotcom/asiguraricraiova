# Prioritățile 1–3 — implementare și verificare

Data: 21 octombrie 2026. Bază: `main` la `6c47ce6`. Ramură: `codex/audit-priorities-1-3`.

## Schimbări

1. **Conținut:** corectate ghidurile RCA, Pilon III și restituiri; cardurile blogului și datele de revizie sunt sincronizate. Sursele, calculele și limitele sunt în [nota editorială](editorial-corrections-2026-10-21.md). Secțiunea rovinietă explică verificarea eligibilității la CNAIR, fără o procedură istorică prezentată drept actuală.
2. **Tracking:** un singur `contact_click` pentru CTA direct, `whatsapp_handoff` pentru formularul WhatsApp și `generate_lead` numai după răspuns HTTP 2xx Formspree. Aliasurile multiple nu mai sunt emise. Produsul, formularul și poziția CTA folosesc valori stabile. Mesajul liber nu este introdus în payloadurile custom sau în ancore sintetice. Instrucțiunile sunt în [contractul de măsurare](analytics-tracking.md) și [migrarea GA4](analytics-migration-2026-10-21.md).
3. **Formulare:** modul comun pe 13 pagini, verificare după trim, telefon plauzibil, erori per câmp, păstrarea datelor la eroare și blocarea retrimiterii în timpul procesării. Contact preia produsul RCA/Locuință și o proveniență locală din allowlist. Suprafața locuinței acceptă zecimale, anul și suprafața sunt marcate opțional. Calculatorul RCA are formular semantic.

Referințele la `site.js` și `site.css` au o versiune comună nouă în 49 HTML-uri, inclusiv 404, pentru a evita reutilizarea codului anterior din cache. `lastmod` a fost actualizat numai pentru cele 17 pagini cu schimbări de conținut/formular; actualizarea tehnică a versiunii unui script nu a fost folosită pentru a redata întreg sitemapul.

## Verificări efectuate

- Sintaxă JavaScript și validatoarele existente: 48 pagini canonice, sitemap și resurse; CSP strictă Locuință păstrată.
- `scripts/test-form-validation.cjs`: 13 pagini, 4 cazuri de context Contact și 3 trasee comerciale; spații, telefoane nevalide/internaționale, validare nativă, eroare simulată 500, retry 200 și reset. Fără erori JavaScript.
- `scripts/test-analytics.cjs`: 12 scenarii; refuz/acceptare/retragere, dublu clic, handoff fără lead, marker de text absent din Analytics/href, succes 200/202 și eroare 422, blocarea retrimiterii formularului finalizat, produsul din Contact, footer și articole. Fără aliasuri sau erori JavaScript.
- Ghidurile și indexul blogului: coeficienți și calcule controlate, H1/schema/date, randare la 390 și 1440 px fără overflow. Capturi editoriale și rezultate în `editorial-evidence-2026-10-21/`.
- Feedbackul WhatsApp și erorile formularului de locuință au fost inspectate vizual pe mobil. Testele au interceptat toate cererile; Formspree și deschiderea WhatsApp au fost simulate. Nu au fost trimise date reale, mesaje sau hituri de test în Analytics.

Browser tests necesită Playwright disponibil. Se poate folosi pachetul instalat în proiect sau `PLAYWRIGHT_MODULE_PATH`; testul formularelor acceptă și aliasul `PLAYWRIGHT_MODULE`. Scriptul Analytics acceptă `PLAYWRIGHT_BROWSER_CHANNEL` (implicit msedge). Comenzile `npm run test:forms` și `npm run test:analytics` sunt disponibile; validarea statică rămâne `npm test`.

## Activare și limite

Codul din această ramură nu modifică setările contului GA4. La publicare trebuie aplicată și verificată migrarea din Admin: un singur key event principal pentru cererea acceptată, retragerea statutului key event al aliasurilor și definițiile custom necesare. Momentul publicării trebuie notat ca T0 în Europe/Bucharest, cu commitul efectiv; seria istorică de clicuri WhatsApp nu se compară direct cu noul număr de formulare acceptate.

Răspunsul de succes Formspree nu dovedește livrarea în inbox, calificarea sau emiterea poliței. Handofful nu dovedește că mesajul a fost trimis în WhatsApp. Deduplicarea comercială între canale/dispozitive și verificarea setărilor administrative GA4 rămân operațiuni distincte. Validarea din browser trebuie completată de regulile procesatorului; nu reprezintă o protecție server împotriva solicitărilor construite în afara paginii.

După publicare se verifică separat codul livrat, CSP, fluxurile comerciale și recepția evenimentelor în Tag Assistant/DebugView într-un flux de test autorizat.
