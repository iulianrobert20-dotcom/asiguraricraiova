# Măsurarea solicitărilor — versiunea 21 octombrie 2026

Evenimentele sunt trimise numai după acceptarea consimțământului pentru Analytics. Nu trimitem textul introdus în formulare, CNP, nume, număr de telefon, email sau mesajul WhatsApp.

| Eveniment | Declanșare | Parametri fără date personale |
| --- | --- | --- |
| `contact_click` | clic direct WhatsApp, telefon sau email; intenție de contact | `method`, `product_id`, `cta_location`, `page_path` |
| `quote_start` | prima interacțiune măsurabilă cu un formular | `form_id`, `product_id`, `page_path` |
| `whatsapp_handoff` | formular valid care pregătește și încearcă deschiderea WhatsApp | `form_id`, `product_id`, `method`, `cta_location`, `page_path` |
| `generate_lead` | numai după succesul Formspree; procesatorul a acceptat cererea | aceiași parametri de formular |
| `quote_product_select` | alegerea produsului în formularul rapid | `form_id`, `product_id`, `page_path` |
| `product_page_click` | clic pe un card de categorie, instrument sau produs din homepage | `page_path`, `destination_path` |

Un clic, pregătirea mesajului și o cerere acceptată sunt rezultate diferite. Utilizatorul trebuie încă să apese Trimite în WhatsApp. Succesul Formspree nu dovedește livrarea în inbox, calificarea cererii ori emiterea unei polițe; acestea se urmăresc în evidența operațională.

Aliasurile `whatsapp_click`, `phone_click`, `contact_whatsapp_click`, `contact_phone_click`, `rca_lead`, `quick_quote_whatsapp` și `home_offer_click` nu se mai emit. Nu mai emitem manual `form_submit`. Istoria lor rămâne, fără însumare cu evenimentele canonice. Parametrii existenți `lead_method`, `insurance_product`, `lead_location`, `form_name` rămân pe același eveniment canonic pentru rapoartele care îi folosesc. Produsele provin dintr-o listă fixă; nu sunt deduse din H1. `measurement_version=20261021` identifică noua definiție.

O gardă locală de 1,2 secunde evită dublarea accidentală a pregătirii WhatsApp. Formularele Formspree blochează butonul în timpul cererii, iar RCA păstrează explicit stările în curs/finalizat. Fiecare callback de succes emite o singură dată; nu eliminăm două cereri distincte printr-un timeout Analytics. Aceasta nu deduplică persoane ori cereri între dispozitive. Mesajul WhatsApp este deschis prin `window.open`, fără ancoră sintetică cu text liber în href; reîncercarea folosește un buton și URL-ul rămâne în closure. Verifică totuși setările Enhanced Measurement și rețeaua reală după publicare.

Aplică [planul de migrare GA4](analytics-migration-2026-10-21.md) la publicare: un singur rezultat principal `generate_lead`; `contact_click` și `whatsapp_handoff` rămân microconversii separate. Nu crea reguli care clonează aceeași acțiune în mai multe key events. Setările administrative nu sunt schimbate de acest cod.

RCA, Contact, Calculator și Expați folosesc același contract de succes Formspree. Din 23.10.2026, și formularul din homepage folosește Formspree: `form_id=quick_quote`, `method=formspree`, `cta_location=quick_quote`, iar `generate_lead` apare numai după acceptarea HTTP 2xx și cu acord Analytics. Numele, telefonul și data expirării nu sunt parametri Analytics. Formularul rapid din catalogul Asigurări păstrează continuarea WhatsApp (`whatsapp_handoff`); aceste două căi nu se însumează ca formulare acceptate. Formularul de recrutare păstrează rezultatul separat `recruitment_form_submit`, fără a fi asimilat unei solicitări de asigurare. Nu raporta deschiderea calculatorului ca ofertă ori poliță.

Validare locală: `node scripts/test-analytics.cjs`, cu Playwright disponibil. `PLAYWRIGHT_MODULE_PATH` poate indica pachetul local, `PLAYWRIGHT_BROWSER_CHANNEL` browserul instalat (implicit msedge), iar `AUDIT_TEST_OUTPUT` directorul local de rezultate și capturi. Toate cererile externe sunt interceptate, iar Formspree 200/422 este simulat; nu folosi date reale de client.

După publicare: verifică DebugView/Tag Assistant într-un flux autorizat, cu acceptare, refuz și retragere. Codul oprește evenimentele custom la refuz/retragere; comportamentul tagului deja încărcat și eventualele măsurători fără cookies necesită verificare de rețea separată. Nu echivala automat sesiunile măsurate cu toate contactările.
