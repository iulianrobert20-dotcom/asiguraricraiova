# Homepage după macheta aprobată — 23 octombrie 2026

Homepage-ul folosește logo-ul furnizat de titular și compoziția aprobată pentru desktop și mobil: antet cu date de contact și program, fotografie ilustrativă, formular de ofertă, produse, prezentare personală, trei pași, FAQ și reînnoire. Pe mobil sunt disponibile meniul compact și bara de contact. Brandingul din navigarea comună folosește același logo.

## Comportament

- Formularul din homepage are patru câmpuri vizibile: produs, nume, telefon și expirarea opțională a poliței; acordul pentru contactare este obligatoriu. Folosește endpointul Formspree deja utilizat pentru Contact. Explică procesatorul și nu solicită acte sau CNP.
- Validarea existentă a numelui/telefonului rămâne activă. Stările în curs, succes, eroare și reîncercare sunt anunțate accesibil; datele sunt păstrate la eroare. Butonul nu retrimite cât timp o cerere este în curs sau după succesul ei.
- `generate_lead` se trimite numai după HTTP 2xx, cu acord Analytics. Parametrii sunt clasificați prin contractul existent; numele, telefonul și data expirării nu ajung în GA4. Succesul procesatorului nu dovedește primirea în inbox sau emiterea poliței.
- Formularul din catalogul Asigurări păstrează continuarea WhatsApp și evenimentul distinct `whatsapp_handoff`.
- Preferințele cookies ale homepage-ului permit refuz, acceptare și alegerea Analytics în panoul Setări. Nu se încarcă Analytics înainte de acord. Butonul din footer redeschide preferințele.
- Segmentele Persoane fizice / Firme afișează produsele corespunzătoare. Linkurile către paginile existente rămân crawlable în HTML; există și cale pentru firme fără JavaScript.

## Date și prezentare

Nu au fost inventate recenzii, ratinguri, cod ASF, CUI, rezultate sau promisiuni de preț. Certificatul de pregătire ISF este prezentat distinct de verificarea înregistrării ASF; linkul de verificare folosește RIS. Destinațiile pentru Petiții ASF și SAL-Fin sunt externe, iar termenii Destine sunt etichetați explicit ca atare.

Logo-ul JPEG original este păstrat ca `brand-logo.jpeg`; `brand-logo.webp` este un derivat redimensionat, fără redesenarea identității. Fotografia de prezentare a fost generată cu instrumentul integrat ImageGen și este etichetată „Fotografie ilustrativă”; nu este un portret al titularului. Asseturi: desktop 1440×810, circa 76,5 KB; mobil 800×600, circa 42,6 KB; logo WebP 384×384, circa 76,3 KB. Nu sunt necesare fonturi sau imagini externe pentru homepage.

Noile reguli CSS sunt limitate la `.homepage.home-redesign`; stilurile comune din `home.css`, folosite de alte pagini, sunt păstrate. Referințele către activele comune au primit versiunea `20261023-1` pentru a evita încărcarea din cache a codului anterior. Canonical-ul și cele 48 de URL-uri existente sunt păstrate.

## Verificare

- Verificări Node de sintaxă, validatorul site-ului: 48 de pagini și sitemap; verificarea CSP a paginii Locuință.
- `node scripts/test-homepage.cjs`: 21 de scenarii, inclusiv răspunsuri 200/202/204/422/500, eroare de rețea, timeout, reîncercare, trimitere dublă, acord/refuz/retragere Analytics, meniuri, segmente și preferințe cookies.
- `node scripts/test-analytics.cjs`: regresia contractului GA4, fără aliasuri și fără date personale.
- `node scripts/test-form-validation.cjs`: 13 pagini cu formulare și traseele de context existente.
- Verificare responsive la 320, 390, 768, 900, 1024 și 1440 px; fără overflow orizontal sau erori JavaScript. Capturile desktop/mobil au fost inspectate vizual.

Toate formularele și cererile externe sunt interceptate în testele automate. Nu se trimit leaduri, mesaje WhatsApp sau hituri Analytics reale. Core Web Vitals de teren și livrarea emailului de către Formspree nu sunt certificate de aceste verificări.
