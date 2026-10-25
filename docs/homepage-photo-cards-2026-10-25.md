# Carduri fotografice în homepage — 25 octombrie 2026

Secțiunea „Ce vrei să asiguri?” urmează macheta aprobată: două rânduri de cinci carduri pe desktop pentru persoane fizice. Primul rând păstrează RCA, CASCO, Locuință + PAD, Călătorie, Viață și sănătate. Al doilea adaugă Asistență rutieră, Accidente persoane, Pensie Pilon III, Economisire pentru copii și Animale de companie. Fiecare card are fotografie, titlu, descriere și legătură către pagina existentă a produsului.

Cele patru produse existente din segmentul „Firme” primesc același format fotografic. Nu sunt create pagini sau produse fictive. Directorul complet, ghidurile și legăturile către Despre, Contact și Alătură-te echipei se păstrează.

## Fotografii și livrare

Fotografiile sunt ilustrative. Trei imagini noi — RCA, CASCO și locuință — au fost generate cu instrumentul integrat ImageGen pentru a păstra aspectul machetei și a diferenția vizual produsele auto. Celelalte unsprezece folosesc fotografii tematice deja publicate pe site; detaliile generației lor sunt documentate în `thematic-photos-2026-10-23.md` și jurnalele de implementare precedente.

| Card | Sursa fotografiei |
|---|---|
| RCA | Fotografie nouă: autoturism alb într-un oraș european |
| CASCO | Fotografie nouă: SUV bleumarin |
| Locuință + PAD | Fotografie nouă: casă cu grădină |
| Călătorie | `interior-travel-20261023.webp` |
| Viață și sănătate | `home-karma-family-v1.webp` |
| Asistență rutieră | `thematic-road-assistance-20261023.webp` |
| Accidente persoane | `thematic-personal-accident-20261023.webp` |
| Pensie Pilon III | `thematic-pension-20261023.webp` |
| Economisire pentru copii | `thematic-child-savings-20261023.webp` |
| Animale de companie | `home-pet-love-v1.webp` |
| Firme | `thematic-small-business-20261023.webp` |
| Răspundere profesională | `thematic-professional-liability-20261023.webp` |
| Malpraxis | `interior-health-20261023.webp` |
| Transport | `hero-freight-transport-v1.webp` |

Fișierele livrate sunt în `images/home-cards/`, în trei dimensiuni: 320, 640 și 960 px lățime. Optimizarea WebP păstrează compoziția sursei; încadrarea vizibilă este realizată de CSS. `srcset` și `sizes` permit browserului să aleagă dimensiunea potrivită. Dimensiunile rezervate și proporția comună evită repoziționarea cardurilor la încărcare; fotografiile sunt încărcate lazy.

Originalele noilor imagini, prompturile exacte și manifestul variantelor sunt păstrate în directorul de lucru `homepage-cards-implementation-2026-10-25`, separat de fișierele publice. Cele 14 variante de 640 px însumează aproximativ 523 KB; browserul descarcă varianta selectată, nu toate cele 42 de fișiere.

## Navigare și verificare

Verificarea grafului include cele 48 de pagini canonice din sitemap, excluzând pagina 404. O pagină orfană este una fără legătură HTML de la o altă pagină canonică; simpla includere în sitemap nu este considerată legătură. Sunt verificate accesul din homepage, revenirea la homepage, legăturile directe către cele 47 de pagini interioare și fragmentele adreselor interne.

Testele browser folosesc numai conținut local sau GET-uri către site, blochează terții și trimiterea formularelor și verifică destinațiile cardurilor, încărcarea fotografiilor, segmentele, navigarea cu tastatura și lipsa depășirii orizontale. Evenimentele cardurilor sunt verificate în coada locală cu Google blocat; nu se trimit evenimente Analytics sau solicitări comerciale reale în timpul QA.

Validatorul static recunoaște acum clasa `insurance-card` ca token din lista claselor unei ancore, inclusiv când există și `insurance-card--photo`. Pragul minim existent nu este redus. Verificarea browser separată cere exact cele zece destinații personale și cele patru pentru firme.
