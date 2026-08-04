# AsigurăriCraiova.ro

Site static multipagină pentru activitatea de intermediere în asigurări a lui Robert Iulian Stoica.

## Structură

- pagini HTML separate pentru produse, articole, contact, GDPR și calculatorul RCA;
- `site.css` și `site.js` conțin stilurile și funcționalitățile comune;
- `sitemap.xml` și `robots.txt` controlează indexarea;
- imaginile Open Graph și faviconurile sunt păstrate în rădăcina site-ului;
- `scripts/validate-site.mjs` verifică automat principalele cerințe SEO, accesibilitate, confidențialitate și integritate.

## Validare locală

Este necesar Node.js 20 sau mai nou.

```bash
npm test
```

Aceeași validare rulează automat în GitHub Actions la fiecare push și Pull Request.

## Publicare

Site-ul este pregătit pentru GitHub Pages, cu domeniul personalizat definit în `CNAME`. Publicarea se face din ramura configurată în **Settings → Pages**, cu opțiunea **Enforce HTTPS** activă.

Google Analytics este încărcat numai după acceptarea explicită a cookie-urilor Analytics. Harta Google este încărcată numai după acțiunea vizitatorului.

## Surse pentru calculatorul RCA

- [Tarifele de referință ASF aplicabile din 30 mai 2026](https://www.baar.ro/wp-content/uploads/2026/06/Copy-of-Tarife-RCA-de-referinta-ASF-MAI-2026.pdf)
- [Procedura BAAR pentru asigurații cu risc ridicat](https://www.baar.ro/asigurati-cu-risc-ridicat/)

Calculatorul are caracter orientativ. Ofertele comerciale sunt emise de asigurători, iar eligibilitatea pentru mecanismul de risc ridicat este decisă de BAAR.

## Configurări care nu pot fi făcute doar în cod

- antete HTTP precum HSTS și `X-Content-Type-Options` necesită configurare la nivel de hosting, CDN sau reverse proxy; GitHub Pages nu permite antete HTTP personalizate;
- adresa publică exactă, coordonatele hărții, fotografiile și testimonialele trebuie publicate numai după confirmarea și furnizarea materialelor autentice de către titular;
- formularele și măsurarea Analytics trebuie reverificate după fiecare schimbare a identificatorilor externi Formspree sau GA4.

## Date de contact

- Telefon: 0774 171 971
- E-mail: asiguraricraiova@yahoo.com
- Certificat ISF: seria PPIi nr. 256558
- Partener: Destine Broker de Asigurare
