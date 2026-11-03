# Locuință și Allianz-Țiriac My Home — 3 noiembrie 2026

Pagina generală `/locuinta.html` prezintă oferta My Home într-un bloc cu fotografie, înainte de alegerea PAD / facultativă / ajutor pentru alegere. Butonul duce la `/allianz-tiriac-my-home-pad.html`, care detaliază campania și permite pregătirea unei cereri prin WhatsApp. Culorile, sigla, navigarea și fotografiile urmează machetele aprobate.

## Condițiile folosite

Sursa este [regulamentul oficial Allianz-Țiriac](https://www.allianztiriac.ro/content/dam/onemarketing/cee/azro/documente/regulamente/Regulament_Promo_My_Home.pdf), verificat la 3 noiembrie 2026, prin legătura de pe [pagina produsului My Home](https://www.allianztiriac.ro/ro_RO/persoane-fizice/asigurari-persoane-fizice-locuinta-si-bunuri/my-home.html).

Campania se desfășoară între 1 septembrie și 30 noiembrie 2026 și include distribuția prin brokeri. Cumpărarea My Home poate aduce PAD gratuit pentru un an, în condițiile regulamentului; prima My Home se achită. Eligibilitatea și disponibilitatea prin canalul de distribuție se confirmă la ofertare. Paginile nu promit acceptare sau emitere imediată și nu prezintă întreaga asigurare de locuință drept gratuită.

## Legături și SEO

- Homepage: legătură HTML nativă în directorul „Casă și bunuri”; cele zece carduri cu fotografii sunt păstrate.
- Catalog: card „Allianz-Țiriac My Home” în grupa „Casă și bunuri” și element corespondent în `ItemList` (36 de produse, poziții consecutive).
- Ghid PAD: explicație contextuală despre beneficiul condiționat, cu legături către pagina dedicată și regulament.
- Pagina dedicată: adresă stabilă fără an, canonical propriu, cale de navigare și întoarcere către pagina generală de locuință.
- Sitemap: 49 de pagini canonice; `lastmod` actualizat numai pentru homepage, catalog, pagina generală de locuință, pagina nouă și ghidul PAD, care sunt modificate în acest lot.

## Funcționare

Formularele pregătesc mesajul pentru WhatsApp. Deschiderea WhatsApp nu confirmă trimiterea mesajului și nu este raportată drept cerere primită sau poliță emisă. Nu se colectează CNP sau documente în cererea inițială.

Starea campaniei este tratată separat de pagina permanentă My Home. La 1 decembrie 2026, 00:00, ora României, `myhome.js` înlocuiește mesajele promoționale cu informarea că perioada s-a încheiat, inclusiv într-o filă rămasă deschisă. Legăturile către produs rămân disponibile. Timerul este programat în intervale de maximum 24 de ore, evitând limita browserului pentru întârzieri de mai multe săptămâni. Mesajele WhatsApp ulterioare nu mai cer beneficiul expirat, iar `campaign_id` nu mai este trimis.

În HTML-ul static și fără JavaScript, perioada campaniei este afișată explicit. Actualizarea sursei statice după încheiere rămâne necesară pentru a retrage și această prezentare datată. Titlul, metadatele și schema inițială a paginii My Home sunt permanente, fără promisiunea promoției în rezultatele de căutare.

## Verificări

Validarea finală a paginilor, afișării pe mobil și desktop, formularelor, stării campaniei și resurselor publicate este consemnată în raportul lotului `myhome-implementation-2026-11-03` din workspace.

- Verificările statice ale proiectului: 49 de pagini canonice și sitemap coerent; CSP strictă pentru Locuință și My Home.
- `test:myhome`: 12 scenarii, inclusiv refuz/acceptare Analytics, formular invalid/valid, un singur `whatsapp_handoff` și zero `generate_lead`, deadline și timer, patru lățimi cu/fără JavaScript.
- `test:navigation`: 200 de vizite locale, 49 de pagini canonice + 404, 36 de produse; fără erori sau resurse lipsă.
- Regresii existente: Analytics 16 scenarii, homepage 21 scenarii și validarea formularelor pe 13 pagini, toate trecute cu trimiteri simulate.
