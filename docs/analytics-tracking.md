# Măsurarea conversiilor în redesign

Evenimentele sunt trimise numai după acceptarea consimțământului pentru Analytics. Nu trimitem textul introdus în formulare, CNP, nume, număr de telefon, email sau mesajul WhatsApp.

| Eveniment | Declanșare | Parametri fără date personale |
| --- | --- | --- |
| `whatsapp_click` | clic pe un link WhatsApp obișnuit | `page_path`, `product_category`, `click_location` |
| `phone_click` | clic pe un link telefonic | aceiași parametri |
| `quick_quote_start` | prima interacțiune cu formularul rapid | `page_path` |
| `quick_quote_whatsapp` | trimiterea validă a formularului rapid spre WhatsApp | `page_path`, `product_category` |
| `home_offer_click` | clic pe WhatsApp din homepage | `page_path`, `click_location` |
| `product_page_click` | clic pe un card de categorie, instrument sau produs din homepage | `page_path`, `destination_path` |

Evenimentele vechi `contact_whatsapp_click`, `contact_phone_click` și `generate_lead` rămân temporar pentru continuitatea rapoartelor. Nu marcați simultan evenimentele vechi și cele noi drept conversii pentru aceeași interacțiune: ar dubla rezultatele. În GA4 trebuie verificate setările actuale, apoi marcate drept evenimente cheie `whatsapp_click`, `phone_click` și `quick_quote_whatsapp` și dezactivate echivalentele vechi dacă erau marcate.

Calculatorul RCA și celelalte formulare au propriul cod de urmărire. Înainte de a activa `rca_calculator_start`, `rca_calculator_complete`, `rca_offer_click` sau `contact_form_submit`, trebuie verificat exact ce înseamnă succes în fiecare flux și dacă există consimțământ. Nu raportați deschiderea calculatorului ca o ofertă sau o conversie completă.

Control după publicare: acceptați cookies într-o sesiune de test, verificați evenimentele în GA4 DebugView, repetați cu refuz și confirmați că niciun eveniment nu este trimis. Verificați apoi în rapoarte mobile și desktop separat; totalurile GA4 nu reprezintă toate contactările din cauza consimțământului și a apelurilor de pe alte dispozitive.
