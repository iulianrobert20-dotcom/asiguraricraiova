# Design comun pentru toate paginile — 23 octombrie 2026

Paginile interioare foloseau mai multe generații de șabloane: titluri serif, accente aurii și antete fără fotografii sau cu fundaluri întunecate. Homepage-ul aprobat folosește albastru, bleumarin, alb și fotografii naturale. Noul sistem comun adaptează toate cele 47 de pagini interioare și pagina 404 la această direcție.

## Sistem vizual

`site-interior.css`, încărcat la finalul fiecărei pagini interioare, definește culorile, fonturile sans serif, butoanele, cardurile, formularele, tabelele și footer-ele. Nuanțele principale sunt `#072a50`, `#133b5b`, `#135eac`, `#edf4fa` și alb. WhatsApp păstrează verdele distinct. Culorile relevante semantic și identitatea partenerilor sunt păstrate.

Fiecare pagină are un antet `.page-hero` cu text în stânga și imagine în dreapta pe desktop; pe mobil, imaginea urmează textului. Fotografiile sunt elemente HTML cu text alternativ, dimensiuni reale și prioritate de încărcare. Eticheta „Fotografie ilustrativă” evită prezentarea persoanelor din fotografii drept titular sau clienți reali. Informațiile suplimentare din antetele vechi sunt păstrate în `.page-hero__support`.

Pagina pentru expați folosește navigarea comună; meniul local și controalele originale de limbă rămân într-o bară secundară. Funcțiile EN/RO, planurile VISA/Residence și selectorul de pachete rămân disponibile. Selectorul Analytics recunoaște noul antet și păstrează clasificarea CTA-urilor ca `hero`.

## Fotografii

Imaginile tematice locale existente sunt reutilizate pentru familie, casă, firme, transport, animale, economisire, fotovoltaice, biciclete și consultanță. Trei imagini noi au fost generate cu instrumentul integrat ImageGen și exportate WebP la 1200×675, quality 82:

- `interior-auto-20261023.webp` — aproximativ 95 KB. Prompt: fotografie editorială realistă cu un cuplu adult lângă o mașină parcată într-un cartier european, lumină naturală, tonuri alb/albastru, fără text sau logo.
- `interior-travel-20261023.webp` — aproximativ 66 KB. Prompt: cuplu adult cu bagaje într-un aeroport luminos, fotografie naturală, tonuri alb/albastru, fără text, logo sau marcaje identificabile.
- `interior-health-20261023.webp` — aproximativ 51 KB. Prompt: medic femeie discutând cu o pacientă adultă într-un cabinet luminos, fotografie editorială naturală, fără proceduri medicale, text sau logo.

Prompturile exacte și proveniența sunt păstrate în dosarul de lucru `site-design-2026-10-23/image-generation-provenance.json`; originalele PNG sunt în `generated/`. Fotografiile nu reprezintă persoane identificate sau mărturii ale unor clienți.

## Integritate și verificări

Comparația independentă cu versiunea publicată anterior a confirmat păstrarea textelor, H1, titlurilor, canonical, schemelor, ID-urilor originale, linkurilor și formularelor. Nu au fost introduse stiluri inline în pagina Locuință, care păstrează CSP strict.

Validatorul CI cere tema comună și fotografia accesibilă pe fiecare pagină interioară. `test:design` verifică 49 documente inclusiv 404, imaginile decodate, contrastul metadatelor articolelor, meniurile, controalele pentru expați și afișarea la 320/390/1024/1440, inclusiv fără JavaScript. `test:navigation`, `test:forms` și `test:analytics` verifică legăturile și comportamentul existent. Testele automate blochează cererile reale către formulare, Analytics și WhatsApp.
