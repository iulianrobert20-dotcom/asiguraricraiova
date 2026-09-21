# Sistem de design — AsigurăriCraiova.ro

`design-system.css` este baza comună pentru paginile de produs. Clasele `ds-*` nu modifică paginile existente până când acestea nu sunt migrate explicit.

## Ordinea unei pagini de produs

1. `ds-product-hero`: imagine originală, H1, explicație scurtă, un CTA primar și telefon ca acțiune secundară.
2. `ds-benefits`: trei sau patru beneficii, formulate condițional atunci când diferă după asigurător.
3. `ds-choice-grid`: alegeri pornite de la nevoie, nu de la jargonul produsului.
4. `ds-quote`: câmpuri de bază, fără CNP, acte sau adresă completă; cererea se poate deschide în WhatsApp.
5. `ds-coverage`, `ds-steps`, `ds-trust`, `ds-faq` și `ds-final-cta`.

## Reguli de conținut

- CTA-ul principal folosește „Obține oferta” sau „Pregătește cererea”, nu promite un preț înainte de oferta asigurătorului.
- Fiecare pagină precizează rolul: produs emis de asigurătorul identificat în ofertă; solicitare preluată și intermediată de Robert Iulian Stoica prin Destine Broker.
- Beneficiile și limitele sunt menționate ca dependente de produsul ales, dacă nu sunt universale.
- Se folosesc fotografii originale sau licențiate. Nu se reutilizează imagini, texte sau identitatea vizuală a asigurătorilor.

## Migrare

Se migrează întâi paginile cu intenție comercială mare: RCA, CASCO, locuință, călătorie, malpraxis și viață. URL-urile, canonicalurile, meta description-urile, schema și întrebările frecvente se păstrează sau se adaptează fără a pierde intenția SEO existentă.
