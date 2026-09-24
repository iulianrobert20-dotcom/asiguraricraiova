# Redesign CRO + SEO — raport de etapă

Data: 24 septembrie 2026. Ramură: `codex/redesign-seo-cro-2026`.

## Baza folosită

- 47 URL-uri canonice din sitemap, păstrate. Inventarul title/meta/H1/canonical/schema și legături se află în [seo-cro-baseline.md](seo-cro-baseline.md).
- Search Console: 95 clicuri, aproximativ 6,78 mii de afișări, CTR 1,4% și poziție medie 12,4 în ultimele 3 luni disponibile. Detalii și limitele istoricului în [gsc-analysis.md](gsc-analysis.md).
- GA4: 101 utilizatori activi și aproximativ 1,8 mii de evenimente în 90 de zile; consent mode poate subraporta traficul. Detalii în [ga4-analysis.md](ga4-analysis.md).

## Implementat în această etapă

- Meniu comun pe paginile standard, cu acces rapid la șapte grupe și categoriile comerciale principale. Pagina pentru expați își păstrează antetul bilingv dedicat.
- Bară fixă „Sună / WhatsApp” pe telefon. Subsol comun pentru navigare și contact, care păstrează sub el notele specifice calculatorului, articolelor și produselor. Homepage-ul își păstrează subsolul complet; pagina bilingvă pentru expați își păstrează subsolul în engleză/română.
- Homepage: hero mai clar, șase categorii imediat după hero, formular rapid, RCA & BAAR, RCA în rate, patru produse dedicate și acces la pagina „Despre”. Nu au fost inventate recenzii, beneficii financiare sau randamente.
- După comparația cu macheta, homepage-ul a primit o fotografie originală cu familie și consultant, compoziție desktop/mobil mai apropiată de referință, iconuri SVG coerente, carduri compacte și formular pe un rând la lățimi mari. Imaginile `hero-family-advisor-v1.webp` și `tool-rca-road-v1.webp` au fost generate cu instrumentul built-in imagegen și optimizate WebP; fără logo sau text în fotografie. Prompturile au cerut o scenă de consultanță în locuință, respectiv o mașină pe drum, cu spațiu pentru text HTML.
- Evenimente noi de contact și navigare fără datele introduse de vizitator. Evenimentele vechi sunt păstrate pentru continuitate. Planul de configurare și avertismentul privind dublarea conversiilor sunt în [analytics-tracking.md](analytics-tracking.md).
- Au fost schimbate doar versiunile fișierelor CSS/JS din paginile HTML pentru a evita încărcarea din cache a meniului vechi. Nu au fost schimbate URL-urile canonice, sitemap-ul sau redirecturile.

## Verificări

- Validator local: 47 pagini canonice și 47 intrări sitemap, fără regresii critice.
- Verificare manuală locală în browser la 1280 px și 390 px: antet, meniu, submeniu, hero, carduri, formular, bară mobilă și subsol RCA. Linkurile telefonice folosesc `tel:`; cele WhatsApp folosesc `wa.me`.
- Corecția vizuală a fost verificată local la 1440, 768 și 390 px, plus control de overflow la 320, 375 și 430 px. Deschiderea directă cu `file://` nu poate încărca corect resursele cu căi absolute de site (`/site.css`, `/home.css`, `/imagini`); previzualizarea trebuie făcută printr-un server local sau după publicare.
- Validarea GitHub Actions trebuie confirmată pe PR. Lighthouse înainte/după, Core Web Vitals reale, DebugView GA4 și toate cele șapte dimensiuni responsive cerute rămân de măsurat; nu există încă rezultate pe care să le raportăm ca trecute.

## Următoarea etapă

1. Revizuire și publicare a schimbărilor, apoi verificare live a headerului, subsolului, formularului, calculatorului și Analytics.
2. Pagina hub `asigurari.html`, RCA, calculator RCA și locuință, pe baza termenilor care aduc impresii deja. Evităm rescrierea mecanică a title/H1.
3. Pagini viață, Karma Bună, Unit-Linked, Leu Forte, Leu Dinamic și animale; apoi restul paginilor.
4. Componenta pentru recenzii se populează numai după identificarea unor recenzii Google verificabile. NAP stradal și marcajul local rămân limitate până la confirmarea adresei exacte folosite în Google Business Profile.
