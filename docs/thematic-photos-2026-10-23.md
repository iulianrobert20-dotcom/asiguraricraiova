# Fotografii tematice — 23 octombrie 2026

Revizia vizuală a găsit fotografii prea generale sau nepotrivite pentru unele pagini: de exemplu, o plantă lângă monede pe pagina de pensie și documente administrative pe pagini despre asistență. Auditul tehnic al versiunii anterioare a confirmat că imaginile se încărcau; prezența unui fișier nu demonstra relevanța lui pentru subiect.

## Modificări

- 14 fotografii ilustrative noi, generate cu instrumentul integrat ImageGen, exportate local în WebP la 1200 × 675 px. Numele fișierelor încep cu `thematic-` și se termină cu `-20261023.webp`.
- 23 de pagini canonice interioare primesc fotografii mai specifice. Pagini înrudite pot folosi aceeași fotografie; nu sunt 47 de fotografii distincte.
- Pagina 404 primește separat o fotografie despre orientare și drum. Ea nu intră în numărul celor 47 de pagini interioare.
- La pagina pentru expați, fotografia apare după titlu și înaintea detaliilor pe mobil, unde anterior era complet sub primul ecran. Ordinea desktop rămâne titlu și detalii în stânga, fotografie în dreapta.
- Toate cele 48 de pagini care folosesc tema interioară, inclusiv 404, cer versiunea `20261023-3` a fișierului CSS comun. Culorile și navigarea comune rămân consecvente cu homepage-ul.

## Subiecte înlocuite

| Pagini | Fotografie |
| --- | --- |
| RCA în rate, GAP | Documente și consiliere într-un showroom auto |
| Asistență rutieră | Șofer și mecanic lângă o mașină oprită în siguranță |
| Asistență la domiciliu | Instalator verificând o instalație casnică |
| Storno | Rezervare de călătorie și bagaje |
| Accidente personale | Recuperare acasă, cu brațul în eșarfă |
| Răspundere civilă, generală și de familie | Discuție despre o pagubă produsă de o infiltrație |
| Răspundere profesională | Specialist și client analizând un proiect |
| Pensie și ghid Pilon III | Cuplu de seniori analizând documente |
| Economisire | Părinți și copil planificând educația |
| Unit-linked, Leu Forte, Leu Dinamic | Consultant și client analizând documente financiare |
| IMM și firme | Proprietară și angajată într-un atelier de ceramică |
| Despre și contact | Mâini folosind telefonul la birou, fără portret fictiv al titularului |
| Alătură-te echipei | Mentorat și colaborare |
| Confidențialitate | Laptop, dosar și lacăt |
| Ghid restituire RCA/rovinietă | Acte și chei auto |

Fotografiile rămân marcate „Fotografie ilustrativă”. Ele ilustrează subiectul și nu reprezintă persoane reale din echipă, recenzii sau confirmări ale unor acoperiri contractuale.

## Verificare

Validarea statică verifică structura, legăturile și resursele locale. Suita de design parcurge paginile pe desktop și mobil, cu și fără JavaScript, și verifică imaginile, contrastul linkurilor, lipsa depășirii orizontale și comenzile paginii bilingve. Un control separat cere ca minimum jumătate din fotografia paginii pentru expați să fie vizibilă la încărcare pe mobil, excluzând bara fixă de contact.

După publicare, auditul LIVE verifică toate cele 47 de pagini interioare pe desktop și mobil, cu adresă normală și parametru unic de cache. Compară și pixeli efectiv redați ai fotografiei, nu doar existența unui element `img`. Capturile, inventarul complet, prompturile și proveniența imaginilor sunt păstrate în directorul de lucru `site-photo-audit-2026-10-23`, separat de site.
