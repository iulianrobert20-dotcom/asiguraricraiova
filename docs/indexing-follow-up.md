# Verificarea indexării după publicare

Corecțiile din 20 octombrie 2026 întăresc descoperirea paginilor prin linkuri HTML, clarifică legătura către pagina de asigurare a locuinței și completează explicațiile practice pentru GAP, ROTR, biciclete și pagina Despre.

## Publicare și verificare

1. Rulează `npm test` și publică modificările în GitHub Pages.
2. Verifică pagina principală și destinațiile linkurilor noi pe domeniul public.
3. În Search Console, folosește inspecția URL și testul live pentru paginile importante de mai jos. Verifică preluarea, permisiunea de indexare și canonicalul declarat. Canonicalul selectat de Google trebuie citit din rezultatul din index, nu dedus din testul live.
4. Solicită indexarea URL-urilor importante după publicare, în limita disponibilă în Search Console. Solicitarea nu garantează includerea în index.
5. Urmărește data ultimei accesări și starea URL-ului după noua accesare Google. Pentru pagina de locuință, compară interogările și URL-urile pe o perioadă nouă de 28 de zile; nu amesteca pozițiile generale ale paginii cu poziția unei interogări specifice.

Paginile din grupul „Descoperită – nu este indexată” verificat pe 13 octombrie:

- https://asiguraricraiova.ro/bike.html
- https://asiguraricraiova.ro/despre.html
- https://asiguraricraiova.ro/gap.html
- https://asiguraricraiova.ro/leu-dinamic.html
- https://asiguraricraiova.ro/raspundere-civila-profesionala.html
- https://asiguraricraiova.ro/rotr.html
- https://asiguraricraiova.ro/unitlinked.html

Verifică separat https://asiguraricraiova.ro/locuinta.html și interogările despre asigurarea locuinței în Craiova.

## Adrese vechi și limitele găzduirii

GitHub Pages servește conținut static și nu permite configurarea unor reguli HTTP 301 personalizate în acest repository. Cele trei adrese vechi din raportul 404 au pagini de mutare cu `meta refresh` instant, canonical către destinația finală și link HTML. Google recunoaște refresh-ul instant ca semnal de redirecționare permanentă. Aceste pagini nu folosesc `noindex`, pentru a evita amestecarea semnalului de mutare cu eliminarea din index.

Fallback-ul din `404.html` recunoaște acum și un slash final. Acesta ajută vizitatorii care folosesc alte adrese vechi; răspunsul HTTP al fallback-ului rămâne 404. Aliasurile cunoscute care au o pagină statică de mutare nu depind de executarea lui.

Un 301 direct necesită configurare la un CDN/server care îl suportă. Nu sunt incluse modificări de DNS, hosting sau servicii plătite. Nu adăuga `.htaccess` ori `_redirects` presupunând că GitHub Pages le aplică.

Totalul „Neindexate” nu trebuie să ajungă neapărat la zero: variantele HTTP/`www`, aliasurile vechi și fișierul XML pot fi excluse corect. În sitemap rămân numai cele 48 de pagini canonice. `lastmod` este actualizat numai pentru paginile al căror conținut s-a modificat.

## Surse

- [Google: redirecturi și meta refresh](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google: linkuri interne și texte descriptive](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: raportul de indexare](https://support.google.com/webmasters/answer/7440203)
