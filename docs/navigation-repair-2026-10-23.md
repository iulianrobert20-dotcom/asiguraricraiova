# Legături între homepage și paginile existente — 23 octombrie 2026

Simplificarea homepage-ului a eliminat accesul direct la 15 pagini, deși fișierele existau și puteau fi găsite prin alte pagini. Meniul comun afișa numai câteva destinații de categorie, iar catalogul nu avea carduri pentru RCA în rate, Calculator RCA și Răspunderi civile.

## Remediere

- Homepage-ul are un director HTML nativ, deschis prin „Toate asigurările și serviciile”, cu 35 de produse și instrumente în șase categorii și șase articole utile. Linkurile din meniu, director și footer acoperă toate cele 47 de pagini interioare canonice.
- Meniul comun include „Acasă”, „Ghiduri” și portofoliul complet. Meniul cu produse poate fi derulat pe ecrane mici. Homepage-ul păstrează șapte opțiuni principale și aspectul aprobat.
- Fiecare pagină interioară are o ancoră HTML explicită „Acasă”, disponibilă și fără JavaScript. Pagina 404 are aceeași întoarcere.
- Catalogul afișează 35 de carduri; ItemList conține aceleași 35 de destinații. Pagina Firme trimite direct spre produsele de business. Cardul „Transport CMR / ROTR” din homepage trimite la pagina care prezintă ambele produse.
- Referințele la CSS și JavaScript comun folosesc versiunea `20261023-2`; sitemap-ul păstrează cele 48 de URL-uri și actualizează data modificării paginilor.
- Verificarea pe mobil a descoperit depășiri de lățime în tabelele Animale, ghidul Animale și Confidențialitate, respectiv indicatorul de pași al Calculatorului RCA. Tabelele au acum containere derulabile accesibile, iar grilele și pașii se adaptează ecranului.

## Verificare și prevenirea regresiilor

Validatorul rulat în CI cere acum o legătură directă din HTML-ul homepage-ului către fiecare pagină canonică și un link explicit de întoarcere pe fiecare pagină interioară. Testul browser `node scripts/test-navigation.cjs` verifică linkurile prin clicuri reale pe desktop/mobil, directorul nativ fără JavaScript, meniul complet și lipsa depășirii orizontale la 320, 390, 1024 și 1440 px. Dovezile pot fi salvate în directorul indicat de `NAVIGATION_EVIDENCE_DIR`.

Verificările de sintaxă, validatorul celor 48 de pagini și verificarea CSP Locuință au trecut. Suita homepage a trecut cele 21 de scenarii, inclusiv formularul, consimțământul Analytics și meniul responsive. Suita de navigare a trecut: 49 de pagini (48 canonice și 404), în patru rulări desktop/mobil cu și fără JavaScript; clicuri din homepage către toate cele 47 de pagini interioare și înapoi, meniul cu 35 de produse plus catalog și verificările la patru lățimi. Fără erori JavaScript, resurse lipsă sau depășiri orizontale. Testele browser interceptează toate cererile și nu livrează formulare, mesaje WhatsApp sau evenimente Analytics reale.
