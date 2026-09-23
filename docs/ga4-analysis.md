# GA4 — bază pentru redesign (23 septembrie 2026)

Proprietate GA4 `asiguraricraiova.ro`, citită din Google Analytics. Consent mode-ul site-ului încarcă Analytics după acceptarea cookie-urilor; cifrele GA4 nu reprezintă neapărat întreg traficul.

## Ultimele 90 de zile față de perioada precedentă

Interval curent: 25 iun. – 22 sept. 2026. Comparație: 27 mar. – 24 iun. 2026.

| Indicator | Curent | Schimbare afișată de GA4 |
| --- | ---: | ---: |
| Utilizatori activi | 101 | +173,0% |
| Utilizatori noi | 98 | +172,2% |
| Timp mediu de interacțiune / utilizator activ | 1 min. 41 sec. | +8,6% |
| Evenimente | ~1.800 | +136,9% |

În raportul instantaneu pe 90 zile, sesiunile pe surse includ Google organic 115, direct 79, ChatGPT 19 și Facebook 6. Topul este un rezumat GA4, nu o atribuire a lead-urilor. Paginile vechi și noi ale aceluiași URL apar separat când titlul s-a schimbat, deci analiza pe `page_title` poate dubla conceptual aceeași pagină; pentru decizii folosim ulterior `page_path` / landing page.

## Verificare rapidă pe 28 de zile (26 aug. – 22 sept.)

34 utilizatori activi, 31 noi, 937 evenimente, 10 evenimente importante. Homepage: 119 afișări; hub-ul asigurări: 31; calculatorul RCA: 21; pagina expați: 19; locuință: 17; RCA în rate: 16. Google organic: 51 sesiuni, direct: 26, Facebook: 6. Cifrele sunt din „Instantaneu cu rapoarte”; nu reprezintă încă raportul detaliat de landing pages.

## Consecințe pentru implementare

- Prioritizăm traseul homepage → categorie → pagină comercială → WhatsApp/telefon. Homepage, hub-ul și calculatorul au utilizare măsurabilă.
- Nu atribuim cele 10 evenimente importante din 28 zile unor cereri reale fără auditarea definițiilor evenimentelor.
- Codul actual trimite `generate_lead` și `contact_whatsapp_click`/`contact_phone_click` doar după consimțământ. Trebuie verificat dacă acestea sunt marcate ca evenimente importante și dacă noile denumiri propuse nu dublează conversiile.
- Următoarea extragere GA4 necesară: landing page și sesiuni pe canal, dispozitiv, engagement/exit, apoi evenimente după nume și pagină pentru ultimele 90 zile. Nu raportăm încă rate de conversie pe produs.
