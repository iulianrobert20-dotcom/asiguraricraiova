# Migrarea măsurării Analytics — 21 octombrie 2026

Acest document stabilește contractul și setările GA4 necesare pentru prioritatea 2. Nu confirmă publicarea codului și nu confirmă executarea setărilor administrative. `T0` este momentul publicării versiunii noi și trebuie completat în jurnalul de publicare, cu ora Europe/Bucharest și commitul efectiv.

## Stare verificată, fără extrageri repetate

Windsor.ai `get_connectors`, recitit read-only în această revizie, confirmă `googleanalytics4`, proprietatea **539569423**, nume **asiguraricraiova.ro**. S-au reutilizat exporturile din `../audit-complet-2026-10-20/evidence/ga4/`, aflate în directorul părinte al acestui checkout: `current.json`, `previous.json`, `events.json`, `fields.json`, `options.json`, `summary.json`. Nu s-a rulat o nouă extragere de performanță și nu s-a transmis niciun hit de test.

Baseline, **20.09–17.10.2026** vs **23.08–19.09.2026**, Europe/Bucharest, hostname `asiguraricraiova.ro`: **114 vs 71 sesiuni**, **35 vs 27 utilizatori**, **3 vs 8 key events**, toate key events raportate fiind `whatsapp_click`. În prezent există și `contact_whatsapp_click` 2 apariții și `quick_quote_whatsapp` 1 apariție, fără key events; acestea pot descrie acțiuni suprapuse și nu se adună drept persoane sau cereri unice. În perioada precedentă, 9 apariții `whatsapp_click` au produs 8 key events. Datele se încheie înaintea acestei implementări și nu o pot valida.

Schema Windsor expune metrici specifice pentru `whatsapp_click`, `generate_lead`, `qualify_lead`, `close_convert_lead`, `purchase`. Aceasta oferă indicii despre metadatele de raportare, dar nu este exportul administrativ complet: nu dovedește metoda de numărare, valorile implicite, regulile de creare/modificare, importurile Ads sau definițiile complete ale dimensiunilor. Lipsa unei dimensiuni custom din lista returnată nu certifică absența ei în Admin.

## Contractul canonic

| Nume exact | Momentul emiterii | Parametri | Interpretare și key event |
|---|---|---|---|
| `contact_click` | O acțiune reală pe CTA de contact; un eveniment pentru acțiunea respectivă | `method=whatsapp/phone/email`, `product_id`, `cta_location`, `page_path` | Intenție de contact. **Nu este key event principal** și nu dovedește mesaj/apel/email primit. |
| `whatsapp_handoff` | Formular WhatsApp valid; aplicația solicită deschiderea mesajului pregătit | `method=whatsapp`, `product_id`, `form_id`, `cta_location`, `page_path` | Continuare către WhatsApp, fără dovada că aplicația s-a deschis sau mesajul a fost trimis. **Nu este key event principal.** |
| `generate_lead` | Numai după răspunsul de succes **HTTP 2xx Formspree** (`response.ok`), pentru formularul trimis | `method=formspree`, `product_id`, `form_id`, `cta_location`, `page_path` | Procesatorul a acceptat formularul. **Singurul key event principal din această migrare.** Nu înseamnă lead calificat sau poliță. |

Pentru 4xx/5xx, timeout, excepție de rețea, formular invalid sau doar începerea POST-ului, `generate_lead` nu se emite. Pentru WhatsApp nu se emite niciodată `generate_lead`, inclusiv atunci când formularul conține deja date complete. Consimțământul Analytics este verificat în momentul emiterii; trimiterea formularului comercial poate funcționa și când măsurarea este refuzată.

`quote_start`, selecțiile de produs, deschiderea calculatorului și clickurile de produs rămân evenimente de diagnostic, fără statut de lead. `qualify_lead` și `close_convert_lead` pot reprezenta ulterior rezultate dintr-un registru operațional, numai printr-o integrare separată, autorizată și deduplicată; această implementare nu le inventează și nu transmite rezultate comerciale inexistente.

## Eliminarea aliasurilor din colectarea nouă

Maparea este destinată documentării și rapoartelor. **Nu se creează reguli GA4 „Create event” care clonează aliasuri în numele canonice**: noul cod emite deja canonicul și o asemenea regulă ar putea dubla acțiunea. Nu se rescrie retrospectiv istoricul.

| Nume vechi / condiție | Înlocuitor de la T0 | Tratamentul istoricului |
|---|---|---|
| `whatsapp_click`, `contact_whatsapp_click`, `home_offer_click` pentru același CTA | Un singur `contact_click`, `method=whatsapp` | Rânduri separate; nu le însuma ca acțiuni unice fără identificator verificabil. |
| `phone_click`, `contact_phone_click` pentru același CTA | Un singur `contact_click`, `method=phone` | Aceeași precauție. |
| `quick_quote_whatsapp` | `whatsapp_handoff`, `form_id=quick_quote` | Microacțiune WhatsApp istorică. |
| `generate_lead` cu vechiul `lead_method=whatsapp_form` | `whatsapp_handoff`, formularul real | Nu reinterpreta această istorie drept formular primit. Dacă parametrul nu poate fi citit istoric, marchează istoricul `generate_lead` ca semantic mixt. |
| `generate_lead` cu vechiul `lead_method=formspree` | `generate_lead`, `method=formspree`, numai succes 2xx | Păstrează numele recomandat, dar separă seriile înainte/după T0. |
| `rca_lead` și `form_submit` emise manual după același succes Formspree | Se oprește emiterea manuală; `generate_lead` rămâne rezultatul canonic | `form_submit` automat, dacă este activ Enhanced Measurement, rămâne diagnostic și nu este lead. |
| `insurance_product`, `product_category`, `product` | `product_id` enum stabil | Fără unirea valorilor libere/variante H1 prin simplă concatenare. |
| `lead_location`, `click_location` | `cta_location` enum stabil | Mapare explicită în raportul de tranziție. |
| `form_name` | `form_id` enum stabil | Identifică fluxul, nu persoana. |

Nu arhiva și nu șterge imediat definițiile vechi: unele pot fi folosite de rapoarte existente. Oprește mai întâi colectarea aliasurilor în cod, inventariază dependențele și păstrează un dicționar de migrare. Nu emite aliasurile „pentru continuitate”; continuitatea se păstrează prin rapoarte și prin marcajul T0.

## Setările GA4 necesare la publicare

Acestea sunt **de executat separat în cont** după verificarea implementării; nu au fost aplicate prin această revizie.

1. Selectează explicit proprietatea **539569423** și streamul web cu Measurement ID **G-Q023X256PZ**; verifică hostname și fusul Europe/Bucharest. Inventariază key events, regulile create/modify events, Enhanced Measurement și eventualele importuri în Ads. Salvează starea înaintea modificării.
2. La T0, asigură existența key event **`generate_lead`**, cu **Counting method: Once per event**. Nu adăuga o valoare monetară inventată. Numărarea o dată per eveniment nu este deduplicare a cererilor comerciale; prevenirea trimiterilor duble rămâne responsabilitatea fluxului.
3. Scoate statutul key event pentru aliasurile de contact/handoff dacă sunt marcate: `whatsapp_click`, `contact_whatsapp_click`, `home_offer_click`, `phone_click`, `contact_phone_click`, `quick_quote_whatsapp`, `form_submit`, `rca_lead`. `contact_click` și `whatsapp_handoff` rămân evenimente obișnuite. Nu dezactiva în masă `purchase`, `qualify_lead` sau `close_convert_lead` fără a verifica fluxurile care le folosesc.
4. Creează/reutilizează definițiile event-scoped din tabelul următor, fără duplicate. Verifică exact numele parametrului emis în cod înainte de salvare.
5. Dacă există reguli server-side GA4 care produc `generate_lead` din clickuri WhatsApp sau clonează aliasuri, acestea trebuie oprite/înlocuite la T0. Nu se configurează o regulă care produce un lead din simpla vizitare a unei pagini sau apăsarea butonului.
6. Dacă un eveniment vechi este importat ca conversie în Google Ads, documentează dependența înainte de schimbare și planifică separat obiectivul Ads. Această revizie nu a verificat sau modificat conturi/campanii Ads.

Marcarea/demarcarea unui key event afectează datele din momentul configurării și nu schimbă istoricul; cele 3 key events WhatsApp istorice rămân vizibile. Nu compara „All key events” peste T0 ca și cum ar avea aceeași definiție. [Google — key events](https://support.google.com/analytics/answer/13128484).

### Dimensiuni exacte

În **Admin → Data display → Custom definitions → Create custom dimension**:

| Dimension name | Scope | Event parameter | Valori permise / scop |
|---|---|---|---|
| `Insurance product` | Event | `product_id` | Identificator stabil din mapa de produse: de exemplu `rca`, `locuinta`, `calatorie`; fallback `consultanta`. Niciodată H1 sau text introdus de utilizator. |
| `Quote form` | Event | `form_id` | Dintr-un allowlist al fluxurilor implementate: de exemplu `quick_quote`, `rca_short_lead`, `travel_quote`. Nu nume, email ori identificator personal. |
| `CTA location` | Event | `cta_location` | `navigation`, `hero`, `content`, `footer`, `floating_button`, `mobile_bar`, `final_cta`, conform codului. |

Nu crea dimensiuni custom suplimentare pentru `method`, `page_path`, hostname sau event name: dimensiunile predefinite sunt deja disponibile în schema GA4/Windsor. Nu înregistra ID-uri unice de cerere ca dimensiune custom: cresc cardinalitatea și nu sunt necesare pentru rapoartele curente.

Parametrii noi nu reconstruiesc retroactiv valorile istorice. Disponibilitatea în rapoarte după definire și colectare poate necesita 24–48 ore. Verifică definițiile existente înainte de a crea altele; nu folosi scope User pentru produsul/contactul unei singure acțiuni. [Google — event-scoped custom dimensions](https://support.google.com/analytics/answer/14239696). `method` și `pagePath` sunt predefinite, iar o dimensiune event-scoped în Data API se cere ulterior ca `customEvent:product_id`, nu printr-un nume ghicit de câmp Windsor. [Google — schema Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema).

## Riscuri de payload, consimțământ și deduplicare

### Date personale și colectare automată

Payloadul custom folosește un allowlist: `method`, `product_id`, `form_id`, `cta_location`, `page_path`. Nu se transmit text liber, nume, telefon, email, CNP, VIN/număr auto, date medicale, localitate/adresă liberă, documente, rezultatul JSON complet Formspree sau mesajul WhatsApp. Nu deriva un ID Analytics prin hash din telefon/email; hashingul nu transformă aceste date într-un parametru necesar măsurării.

**Riscul principal din fluxul WhatsApp:** un `<a href="https://wa.me/...?...text=mesaj">` construit cu valorile formularului poate fi citit de Enhanced Measurement și trimis ca `link_url`, chiar dacă listenerul custom ignoră ancora. Atributul nostru de skip nu controlează tagul Google. Remedierea aleasă în codul acestei implementări este deschiderea URL-ului construit într-o closure prin `window.open`, cu fallback prin buton cu handler direct, fără URL-ul cu text în `href`, `data-*`, atribute sau DOM. Aceasta evită acea ancoră din formular; nu reprezintă o citire ori schimbare a setărilor streamului și nu garantează toate payloadurile automate. API-ul Google descrie `linkUrl` drept URL complet, inclusiv query. [Schema Google](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema).

`page_location`, `page_referrer`, titlurile și parametrii UTM trebuie de asemenea păstrați fără date personale. Curățarea numai a `page_path` custom nu curăță automat contextul standard al tagului. Data redaction din stream poate fi apărare suplimentară; nu înlocuiește eliminarea datelor la sursă și nu a fost configurată aici. [Google — evitarea PII](https://support.google.com/analytics/answer/6366371).

### Consimțământ

- Analytics nu se încarcă înainte de acordul explicit conform contractului site-ului; formularele comerciale și contactul funcționează independent de acest acord.
- Fiecare emitere verifică acordul actual, inclusiv după răspunsul async Formspree. Acord la submit urmat de retragere înainte de răspuns înseamnă **niciun eveniment custom la răspuns**.
- Nu se pune în coadă comportamentul preconsimțământ pentru a fi trimis retroactiv după acceptare. Un gard de „first interaction” nu trebuie să confunde o acțiune refuzată cu un eveniment trimis; o interacțiune nouă după acord poate iniția măsurarea.
- Retragerea trebuie să oprească toate evenimentele custom. Un simplu flag intern nu dovedește absența traficului automat când gtag a fost deja încărcat; verificarea de rețea este distinctă și trebuie să includă retragere/revenire/reload.

Google distinge implementări basic și advanced și cere configurarea stării înaintea comenzilor de măsurare. Nu se deduce comportamentul efectiv al rețelei numai din existența unei comenzi `consent update`. [Documentație Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent).

### Dubluri și succes

- Listener delegat pentru un CTA real: un singur `contact_click`; nu se mai emite și aliasul. Pornirea programatică a WhatsApp după formular produce numai `whatsapp_handoff`, fără al doilea `contact_click` pentru un element artificial.
- Submitul are gardă `inFlight` și buton blocat cât timp este activ; eroarea reactivează retry. Succesul este tratat o dată pentru cererea respectivă. O nouă cerere deliberată nu se elimină printr-un timeout global arbitrar.
- Nu se folosesc simultan emiterea manuală `form_submit` și `generate_lead` ca două conversii. `form_submit` automat, dacă există, este diagnostic și poate apărea înaintea confirmării serverului.
- Un ID opac poate ajuta deduplicarea operațională, dar GA4 nu garantează deduplicarea tuturor evenimentelor custom pe baza unui parametru `event_id`. Nu transforma un mecanism de browser într-o promisiune de lead comercial unic, mai ales după reload, alt dispozitiv sau retry după timeout.

## Ce poate și ce nu poate valida această conexiune

**Citit:** inventarul conturilor, câmpuri/opțiuni Windsor și rapoarte GA4 pe perioade/hostname/nume eveniment/metrice. În acest pas s-a recitit numai inventarul; datele brute existente au fost suficiente.

**Nu a fost citit prin Windsor:** inventarul Admin complet al key events și `countingMethod`, definițiile custom cu scope/parameter, regulile create/modify events, setările Enhanced Measurement, filtre interne/developer, retenția și legăturile/importurile Ads. Instrumentul `create_custom_field` Windsor creează o formulă de raportare Windsor, nu o dimensiune în GA4 Admin; nu este un substitut.

Google are endpointuri read-only separate pentru aceste inventare, de exemplu `GET properties/539569423/keyEvents` și `GET properties/539569423/customDimensions`, cu autentificare și permisiunile adecvate. Aceste endpointuri nu au fost apelate: un conector de rapoarte autorizat nu înseamnă automat acces la instrumentele Admin API. Nu s-au căutat tokenuri/credenciale locale și nu se pretinde că setările sunt deja aplicate. [Admin API key events](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties.keyEvents/list), [Admin API custom dimensions](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties.customDimensions/list).

## Acceptare și citirea rezultatelor după T0

În verificările locale se interceptează rețeaua astfel încât testele să nu ajungă la GA4, Formspree sau WhatsApp. Scenariile minime: fără acord/refuz/retragere, acord, formular invalid, dublu submit, Formspree 200, 422, 500 și timeout; plus produs/locație corecte și un marker sintetic în text care nu apare în niciun payload Analytics.

După publicare, o verificare cu tagul real și contul Analytics este un pas separat: se documentează exact ce este test și unde se verifică, fără a trimite evenimente în proprietatea de producție din acest pas read-only. Rapoartele istorice până la 17.10 nu validează codul nou, iar lipsa numelor noi în ele este normală.

În raportul de tranziție afișează separat: **interes contact (`contact_click`)**, **continuare WhatsApp (`whatsapp_handoff`)**, **formular acceptat (`generate_lead`)** și **cereri operaționale primite/calificate**. KPI-ul de formulare acceptate se filtrează pe `event_name=generate_lead`, `method=formspree` și data ≥ T0; nu se folosește suma tuturor key events istorice. Nu transforma clickurile fără acord, mesajele nepornite sau retragerile de consimțământ în „pierderi de lead” estimate.
