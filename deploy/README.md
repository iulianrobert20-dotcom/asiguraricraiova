# Antete Cloudflare pentru pagina Locuință

Fișierul `cloudflare-response-header-rules.json` conține două definiții de reguli Cloudflare **Response Header Transform Rules**. Este un șablon pentru configurare manuală; publicarea lui în GitHub Pages nu activează antetele. Nu conține tokenuri sau identificatori de cont și nu aplică automat schimbări.

La verificarea din 20.10.2026, domeniul folosea deja nameserverele Cloudflare `jo.ns.cloudflare.com` și `hassan.ns.cloudflare.com`, cu înregistrări web către GitHub Pages. GitHub Pages publica din `main` și avea `https_enforced=true`.

## Pregătire în Cloudflare

1. Selectează zona `asiguraricraiova.ro`. Verifică în **SSL/TLS → Edge Certificates** că Universal SSL are certificat activ pentru apex și `www`.
2. Folosește **SSL/TLS → Overview → Full (strict)**. Originea GitHub Pages are deja HTTPS valid. Păstrează **Enforce HTTPS** activ în GitHub Pages. În **Edge Certificates**, setează **Minimum TLS Version: TLS 1.2** pentru conexiunile vizitatorilor; păstrează TLS 1.3 activ.
3. În **DNS → Records**, activează **Proxied** numai pentru înregistrările web ale `asiguraricraiova.ro` și `www`. Păstrează destinațiile actuale către GitHub Pages. Nu modifica MX, înregistrările pentru email sau nameserverele.
4. Verifică HTTPS pe apex și `www` înainte de activarea HSTS. Regulile Cloudflare pentru antete funcționează numai pentru trafic trecut prin proxy. Vezi [Proxy status](https://developers.cloudflare.com/dns/proxy-status/) și [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/).

## Adăugarea regulilor în interfață

În **Rules → Transform Rules → Modify Response Header** sau în pagina echivalentă din **Rules → Overview**, creează separat cele două reguli. Copiază `expression` din JSON în editorul de expresii, fără ghilimelele și escape-urile JSON. Pentru fiecare antet alege **Set static** și valoarea de mai jos. Păstrează regulile existente; verifică dacă o regulă ulterioară suprascrie aceleași antete.

Condiția HTTPS folosește câmpul boolean [`ssl`](https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/ssl/), care este adevărat când conexiunea clientului este criptată. `http.request.scheme` nu este un identificator acceptat aici. Parsarea locală a JSON-ului nu validează limbajul expresiilor: confirmă acceptarea expresiilor în editor/API înainte de activare.

| Regulă | Domeniu de aplicare | Antete și valori |
|---|---|---|
| `asiguraricraiova_hsts_300` | HTTPS, apex și `www`, orice cale | `Strict-Transport-Security`: `max-age=300` |
| `asiguraricraiova_locuinta_frame_protection` | HTTPS, apex și `www`, exact `/locuinta.html` sau `/locuinta` | `Content-Security-Policy`: `frame-ancestors 'none'`; `X-Frame-Options`: `DENY` |

Headerul CSP adaugă protecția iframe și se aplică împreună cu meta CSP strictă din pagină. Nu trebuie copiată aici întreaga politică din HTML. `frame-ancestors` necesită header HTTP; adăugarea lui doar în meta nu oferă această protecție. [W3C CSP — meta](https://www.w3.org/TR/CSP3/#meta-element)

HSTS începe cu 300 secunde, fără `includeSubDomains` și fără `preload`. Nu activa simultan o altă setare HSTS cu durată mai mare. După verificări, durata poate fi mărită deliberat. [Documentația HSTS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)

## Folosire prin API, dacă este necesar

JSON-ul este o listă de **două corpuri individuale de regulă**, pentru faza de zonă `http_response_headers_transform`, nu un payload pentru înlocuirea întregului ruleset. Adaugă fiecare obiect separat la rulesetul existent folosind operația **Add a rule**, care păstrează celelalte reguli. Dacă faza nu are încă ruleset, creează un ruleset cu `kind: zone` și faza de mai sus, apoi adaugă regulile. Înainte de adăugare verifică dacă aceleași `ref` există deja și actualizează-le, evitând duplicatele.

Nu trimite lista ca `PUT` peste întregul ruleset. Documentație: [parametrii Transform Rules](https://developers.cloudflare.com/rules/transform/response-header-modification/create-api/), [adăugarea unei reguli](https://developers.cloudflare.com/ruleset-engine/rulesets-api/add-rule/), [configurarea în interfață](https://developers.cloudflare.com/rules/transform/response-header-modification/create-dashboard/).

## Verificare și revenire

După activare, verifică răspunsurile GET/HEAD pentru `https://asiguraricraiova.ro/locuinta.html` și `https://asiguraricraiova.ro/locuinta`: trebuie să includă cele trei antete de mai sus. Pe altă cale, de exemplu `/contact.html`, se aplică doar regula HSTS din acest șablon. Verifică și redirecționările HTTP/`www`, meniul și formularul fără a trimite mesaje. HSTS nu este trimis pe HTTP.

Pentru revenire, dezactivează regula anti-iframe. Dezactivarea regulii HSTS oprește antetul nou, dar nu șterge HSTS deja memorat de browsere. Dacă vrei anularea lui înainte de scoaterea proxyului, schimbă întâi valoarea în `max-age=0`, păstrând HTTPS și proxyul active; confirmă antetul pentru apex și `www`. Așteaptă cel puțin durata maximă livrată anterior de la ultimul răspuns cu acea durată (inițial 300 secunde), apoi dezactivează regula. Păstrează HTTPS funcțional inclusiv dacă revii la DNS only. Nu schimba nameserverele pentru acest rollback.
