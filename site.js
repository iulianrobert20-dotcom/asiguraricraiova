(function () {
  'use strict';

  var GA_ID = 'G-Q023X256PZ';
  var CONSENT_KEY = 'ac_cookie_consent_v2';

  function loadAnalytics() {
    window.__analyticsAllowed = true;
    if (window.__analyticsLoaded) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    window.__analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (error) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (error) { /* private mode */ }
    var banner = document.getElementById('cookie-consent');
    var returnFocus = banner && banner.__homeReturnFocus;
    if (banner) banner.remove();
    document.body.classList.remove('has-pending-cookie-consent');
    if (value === 'accepted') {
      loadAnalytics();
    } else {
      window.__analyticsAllowed = false;
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
    }
    if (returnFocus && returnFocus.isConnected && returnFocus !== document.body) returnFocus.focus();
  }

  function showConsent() {
    if (document.getElementById('cookie-consent')) return;
    var homePreferences = document.body.classList.contains('home-redesign');
    var banner = document.createElement('section');
    if (homePreferences) banner.__homeReturnFocus = document.activeElement;
    banner.id = 'cookie-consent';
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', homePreferences ? 'false' : 'true');
    banner.setAttribute('aria-labelledby', 'cookie-title');
    banner.innerHTML =
      '<div class="cookie-consent__body">' +
        '<h2 id="cookie-title">Preferințe cookies</h2>' +
        '<p>Folosim cookie-uri Analytics doar cu acordul tău, pentru statistici. Cele necesare funcționării site-ului rămân active. <a href="/gdpr.html#cookies">Detalii</a></p>' +
      '</div>' +
      (homePreferences ?
        '<div class="home-cookie-options" id="home-cookie-options" hidden>' +
          '<p>Cookie-uri necesare: mereu active pentru funcționarea site-ului.</p>' +
          '<label for="home-cookie-analytics"><input id="home-cookie-analytics" type="checkbox"> Permite Analytics pentru statistici opționale</label>' +
          '<button type="button" class="cookie-btn cookie-btn--secondary" data-home-cookie-save>Salvează preferințele</button>' +
        '</div>' : '') +
      '<div class="cookie-consent__actions">' +
        '<button type="button" class="cookie-btn cookie-btn--secondary" data-consent="rejected">Refuz Analytics</button>' +
        (homePreferences ? '<button type="button" class="cookie-btn home-cookie-settings" aria-expanded="false" aria-controls="home-cookie-options">Setări</button>' : '') +
        '<button type="button" class="cookie-btn cookie-btn--primary" data-consent="accepted">Accept Analytics</button>' +
      '</div>';
    document.body.appendChild(banner);
    document.body.classList.add('has-pending-cookie-consent');
    banner.querySelectorAll('[data-consent]').forEach(function (button) {
      button.addEventListener('click', function () { setConsent(button.dataset.consent); });
    });
    if (homePreferences) {
      var settings = banner.querySelector('.home-cookie-settings');
      var options = banner.querySelector('#home-cookie-options');
      var analytics = banner.querySelector('#home-cookie-analytics');
      analytics.checked = getConsent() === 'accepted';
      settings.addEventListener('click', function () {
        var open = options.hidden;
        options.hidden = !open;
        settings.setAttribute('aria-expanded', String(open));
        if (open) analytics.focus();
      });
      banner.querySelector('[data-home-cookie-save]').addEventListener('click', function () {
        setConsent(analytics.checked ? 'accepted' : 'rejected');
      });
      banner.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !options.hidden) {
          options.hidden = true;
          settings.setAttribute('aria-expanded', 'false');
          settings.focus();
        }
      });
    }
    if (!homePreferences || (banner.__homeReturnFocus && banner.__homeReturnFocus !== document.body)) {
      banner.querySelector('[data-consent="rejected"]').focus();
    }
  }

  function addPrivacyControl() {
    if (document.getElementById('cookie-settings')) return;
    var button = document.createElement('button');
    button.id = 'cookie-settings';
    button.className = 'cookie-settings';
    button.type = 'button';
    button.textContent = 'Preferințe cookies';
    button.addEventListener('click', showConsent);
    document.body.appendChild(button);
  }

  function installGlobalNavigation() {
    var legacyHeader = document.querySelector('nav.snav, header.home-header, header.expat-header');
    if (!legacyHeader || document.querySelector('.global-site-header')) return;
    if (document.body.classList.contains('home-redesign')) return;
    var isRecruitPage = document.body.classList.contains('recruit-page');

    if (legacyHeader.classList.contains('expat-header')) {
      var pageTools = document.createElement('div');
      pageTools.className = 'site-page-tools';
      while (legacyHeader.firstChild) pageTools.appendChild(legacyHeader.firstChild);
      legacyHeader.insertAdjacentElement('afterend', pageTools);
    }
    var header = document.createElement('header');
    header.className = 'global-site-header';
    header.innerHTML =
      '<nav class="global-site-nav" aria-label="Navigare principală">' +
        '<div class="global-site-nav__inner">' +
          '<a class="global-site-brand" href="/" aria-label="AsigurăriCraiova.ro — acasă">' +
            '<img class="global-site-brand__logo" src="/brand-logo.webp" alt="" width="48" height="48">' +
            '<span class="global-site-brand__copy"><strong>asiguraricraiova.ro</strong><small>Prin Destine Broker</small></span>' +
          '</a>' +
          '<button class="global-site-menu-toggle" type="button" aria-expanded="false" aria-controls="globalSiteMenu"><span aria-hidden="true">☰</span><span class="sr-only">Deschide meniul</span></button>' +
          '<div class="global-site-menu" id="globalSiteMenu">' +
            '<a href="/" data-nav-home>Acasă</a>' +
            '<div class="global-site-products">' +
              '<button class="global-site-products__toggle" type="button" aria-expanded="false" aria-controls="globalProductMenu">Asigurări <span aria-hidden="true">▾</span></button>' +
              '<div class="global-site-product-panel" id="globalProductMenu">' +
                "<section><h2>Auto și mobilitate</h2><a href=\"/rca.html\">RCA</a><a href=\"/rca-in-rate.html\">RCA în rate</a><a href=\"/casco.html\">CASCO</a><a href=\"/asistenta-rutiera.html\">Asistență rutieră</a><a href=\"/gap.html\">GAP</a><a href=\"/bike.html\">Biciclete și trotinete</a><a href=\"/calculator-rca.html\">Calculator RCA și BAAR</a><a href=\"/despagubiri-accidente.html\">Despăgubiri după accident</a></section><section><h2>Călătorii</h2><a href=\"/calatorie.html\">Asigurare de călătorie</a><a href=\"/multitravel.html\">MultiTravel</a><a href=\"/storno.html\">Storno</a></section><section><h2>Casă și bunuri</h2><a href=\"/locuinta.html\">Locuință și PAD</a><a href=\"/asistenta-domiciliu.html\">Asistență la domiciliu</a><a href=\"/fotovoltaice.html\">Panouri fotovoltaice</a><a href=\"/animale.html\">Animale de companie</a></section><section><h2>Viață și sănătate</h2><a href=\"/viata.html\">Asigurare de viață</a><a href=\"/asigurare-viata-karma-buna.html\">Karma Bună</a><a href=\"/sanatate.html\">Asigurare de sănătate</a><a href=\"/asigurare-sanatate-expati.html\">Sănătate pentru expați</a><a href=\"/accident.html\">Accidente persoane</a><a href=\"/raspundere-civila-familie.html\">Răspundere individuală și familie</a></section><section><h2>Firme și profesii</h2><a href=\"/firme.html\">Asigurări pentru firme</a><a href=\"/imm.html\">AMM / IMM</a><a href=\"/malpraxis.html\">Malpraxis</a><a href=\"/civile.html\">Răspunderi civile</a><a href=\"/raspundere-civila-generala.html\">Răspundere civilă generală</a><a href=\"/raspundere-civila-profesionala.html\">Răspundere profesională</a><a href=\"/transport.html\">Asigurări de transport</a><a href=\"/cmr.html\">CMR</a><a href=\"/rotr.html\">ROTR</a></section><section><h2>Viitor financiar</h2><a href=\"/pensie.html\">Pensie Pilon III</a><a href=\"/economisire.html\">Economisire pentru copii</a><a href=\"/unitlinked.html\">Unit-Linked: costuri și riscuri</a><a href=\"/leu-forte.html\">Leu Forte</a><a href=\"/leu-dinamic.html\">Leu Dinamic</a></section>" +
                '<a class="global-site-product-panel__all" href="/asigurari.html">Vezi toate asigurările <span aria-hidden="true">→</span></a>' +
              '</div>' +
            '</div>' +
            '<a href="/firme.html">Firme</a>' +
            '<a href="/calculator-rca.html">Calculator RCA</a>' +
            '<a href="/blog.html">Ghiduri</a>' +
            '<a href="/despre.html">Despre mine</a>' +
            '<a href="/contact.html">Contact</a>' +
            '<a class="global-site-phone" href="tel:+40774171971" data-analytics-location="navigation">0774 171 971</a>' +
            (isRecruitPage
              ? '<a class="global-site-cta" href="#aplica">Aplică acum</a>'
              : '<a class="global-site-cta" href="https://wa.me/40774171971" target="_blank" rel="noopener noreferrer" data-analytics-location="navigation">Cere ofertă pe WhatsApp</a>') +
          '</div>' +
        '</div>' +
      '</nav>';
    legacyHeader.replaceWith(header);

    var menuToggle = header.querySelector('.global-site-menu-toggle');
    var menu = header.querySelector('.global-site-menu');
    var productsToggle = header.querySelector('.global-site-products__toggle');
    var productPanel = header.querySelector('.global-site-product-panel');

    function setProductsOpen(open) {
      productPanel.classList.toggle('is-open', open);
      productsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function setMenuOpen(open) {
      menu.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) setProductsOpen(false);
    }

    menuToggle.addEventListener('click', function () {
      setMenuOpen(!menu.classList.contains('is-open'));
    });
    productsToggle.addEventListener('click', function () {
      setProductsOpen(!productPanel.classList.contains('is-open'));
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) {
        setMenuOpen(false);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        var menuWasOpen = menu.classList.contains('is-open');
        setMenuOpen(false);
        if (menuWasOpen) menuToggle.focus();
      }
    });
  }

  function installMobileContactBar() {
    if (document.querySelector('.mobile-contact-bar')) return;
    var bar = document.createElement('nav');
    bar.className = 'mobile-contact-bar';
    bar.setAttribute('aria-label', 'Contact rapid');
    bar.innerHTML = '<a href="tel:+40774171971" data-analytics-location="mobile_bar">Sună</a>' +
      '<a href="https://wa.me/40774171971" target="_blank" rel="noopener noreferrer" data-analytics-location="mobile_bar">WhatsApp</a>';
    document.body.appendChild(bar);
    document.body.classList.add('has-mobile-contact-bar');
  }

  function installGlobalFooter() {
    var legacyFooter = document.querySelector('footer');
    if (!legacyFooter || document.querySelector('.global-site-footer')) return;
    if (legacyFooter.classList.contains('home-footer') && document.body.classList.contains('home-redesign')) return;
    if (legacyFooter.querySelector('.home-footer__grid') || legacyFooter.classList.contains('expat-footer') || legacyFooter.classList.contains('recruit-footer')) return;

    var footer = document.createElement('div');
    footer.className = 'global-site-footer';
    footer.innerHTML =
      '<div class="global-site-footer__inner">' +
        '<div class="global-site-footer__brand"><a href="/"><img class="global-site-footer__logo" src="/brand-logo.webp" alt="" width="48" height="48"><span>asiguraricraiova.ro</span></a><p>Intermediere în asigurări prin Destine Broker. Discuți direct cu Robert Iulian Stoica.</p></div>' +
        '<div><h2>Explorează</h2><a href="/asigurari.html">Asigurări</a><a href="/calculator-rca.html">Calculator RCA</a><a href="/blog.html">Blog</a><a href="/despre.html">Despre</a><a href="/alatura-te-echipei.html">Alătură-te echipei</a></div>' +
        '<div><h2>Informații</h2><a href="/contact.html">Contact</a><a href="/gdpr.html">Confidențialitate</a><a href="/sitemap.xml">Sitemap</a></div>' +
        '<div><h2>Contact direct</h2><a href="tel:+40774171971">0774 171 971</a><a href="mailto:contact@asiguraricraiova.ro">contact@asiguraricraiova.ro</a><p>L–V, 9:00–16:00 · Vizite la birou numai cu programare</p><a class="global-site-footer__cta" href="https://wa.me/40774171971" target="_blank" rel="noopener noreferrer">Cere ofertă pe WhatsApp</a></div>' +
      '</div>';
    legacyFooter.parentNode.insertBefore(footer, legacyFooter);
    legacyFooter.classList.add('legacy-footer-note');
  }

  function enhanceNavigation() {
    var menu = document.getElementById('snavMenu');
    var hamburger = document.getElementById('snavHam');
    if (hamburger && menu) {
      hamburger.setAttribute('aria-controls', 'snavMenu');
      hamburger.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
      hamburger.addEventListener('click', function () {
        window.setTimeout(function () {
          hamburger.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
        }, 0);
      });
    }

    document.querySelectorAll('.drop-trigger').forEach(function (trigger, index) {
      var dropdown = trigger.parentElement && trigger.parentElement.querySelector('.snav-drop');
      if (!dropdown) return;
      if (!dropdown.id) dropdown.id = 'nav-dropdown-' + (index + 1);
      trigger.setAttribute('aria-controls', dropdown.id);
      trigger.setAttribute('aria-expanded', trigger.parentElement.classList.contains('mob-open') ? 'true' : 'false');
      trigger.addEventListener('click', function () {
        window.setTimeout(function () {
          trigger.setAttribute('aria-expanded', trigger.parentElement.classList.contains('mob-open') ? 'true' : 'false');
        }, 0);
      });
    });
  }

  function addSkipLink() {
    if (document.querySelector('.skip-link')) return;
    var main = document.querySelector('main, [role="main"]');
    if (!main) return;
    if (!main.id) main.id = 'continut-principal';
    var link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#' + main.id;
    link.textContent = 'Sari la conținut';
    document.body.insertBefore(link, document.body.firstChild);
  }

  function enhanceAccessibleNames() {
    document.querySelectorAll('a.fwa').forEach(function (link) {
      if (!link.getAttribute('aria-label')) link.setAttribute('aria-label', 'Scrie pe WhatsApp');
    });
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      link.setAttribute('rel', rel.join(' '));
    });
  }

  function enableMaps() {
    document.querySelectorAll('[data-map-src]').forEach(function (container) {
      var button = container.querySelector('[data-load-map]');
      if (!button) return;
      button.addEventListener('click', function () {
        var iframe = document.createElement('iframe');
        iframe.src = container.dataset.mapSrc;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.title = 'Locație AsigurăriCraiova.ro pe Google Maps';
        iframe.setAttribute('allowfullscreen', '');
        container.replaceChildren(iframe);
      });
    });
  }

  function enableHomeMenu() {
    if (document.body.classList.contains('home-redesign')) return;
    var toggle = document.querySelector('[data-home-menu-toggle], .home-menu-toggle');
    var menu = document.querySelector('[data-home-menu], .home-menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('is-open'));
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function sendAnalyticsEvent(name, parameters) {
    if (!window.__analyticsAllowed || typeof window.gtag !== 'function') return;
    window.gtag('event', name, parameters);
  }

  function getContactLocation(element) {
    if (element && element.dataset.analyticsLocation) return element.dataset.analyticsLocation;
    if (element && element.closest('.home-hero, .ph, .product-hero, .expat-hero, .recruit-hero, .page-hero, .page-hero__support')) return 'hero';
    if (element && element.closest('.cta-box, .home-cta, .product-final-cta')) return 'final_cta';
    if (element && element.closest('footer, .global-site-footer')) return 'footer';
    if (element && element.classList.contains('fwa')) return 'floating_button';
    if (element && element.closest('nav')) return 'navigation';
    return 'content';
  }

  // Fixed values prevent headings or free text from becoming Analytics parameters.
  var products = {
    consultanta: ['Consultanță', 'Nu știu — vreau o consultanță'],
    rca: ['RCA'], casco: ['CASCO'], gap: ['GAP'],
    locuinta: ['Locuință și PAD', 'Locuință + PAD (soluție coordonată)', 'Locuință Facultativă', 'PAD — Obligatoriu'],
    calatorie: ['Călătorie', 'Travel — O singură călătorie'],
    multitravel: ['MultiTravel', 'MultiTravel — Abonament anual'], storno: ['Storno'],
    sanatate: ['Sănătate'], expati: ['Sănătate pentru expați'],
    viata: ['Viață', 'Asigurare de Viață'], karma_buna: ['Karma Bună'],
    accident: ['Accidente persoane', 'Accidente Persoane'], malpraxis: ['Malpraxis'],
    civile: ['Civile și profesionale'],
    raspundere_generala: ['Răspundere civilă generală', 'Civile Generale'],
    raspundere_profesionala: ['Răspundere profesională', 'Răspundere civilă profesională', 'Civile Profesionale'],
    raspundere_familie: ['Răspundere civilă familie', 'Civile Individuale & Familie'],
    firme: ['Firme', 'IMM / Firmă', 'AMM / IMM / Firmă'],
    transport: ['Transport CMR / ROTR'], cmr: ['CMR'], rotr: ['ROTR'],
    fotovoltaice: ['Fotovoltaice', 'Panouri Fotovoltaice'], bike: ['Bicicletă', 'Biciclete'],
    animale: ['Animale de companie'],
    asistenta_rutiera: ['Asistență rutieră'], asistenta_domiciliu: ['Asistență la domiciliu'],
    pensie: ['Pensie Pilon III', 'Pensie Privată Pilon III'], economisire: ['Economisire pentru copii', 'Economisire pentru Copii'],
    unitlinked: ['Unit-linked', 'Unit-Linked'],
    leu_forte: ['Leu Forte', 'Unit-linked – Leu Forte Allianz-Țiriac'],
    leu_dinamic: ['Leu Dinamic', 'Unit-linked – Leu Dinamic Allianz-Țiriac'],
    despagubiri: ['Despăgubiri accidente'], altul: ['Alt tip de asigurare']
  };
  var pageProducts = {
    'rca.html': 'rca', 'rca-in-rate.html': 'rca', 'calculator-rca.html': 'rca',
    'locuinta.html': 'locuinta', 'calatorie.html': 'calatorie', 'multitravel.html': 'multitravel',
    'asigurare-sanatate-expati.html': 'expati', 'asigurare-viata-karma-buna.html': 'karma_buna',
    'raspundere-civila-generala.html': 'raspundere_generala',
    'raspundere-civila-profesionala.html': 'raspundere_profesionala',
    'raspundere-civila-familie.html': 'raspundere_familie',
    'asistenta-rutiera.html': 'asistenta_rutiera', 'asistenta-domiciliu.html': 'asistenta_domiciliu',
    'leu-forte.html': 'leu_forte', 'leu-dinamic.html': 'leu_dinamic',
    'imm.html': 'firme', 'despagubiri-accidente.html': 'despagubiri',
    'blog-rca-craiova-2026.html': 'rca', 'blog-restituire-rca-rovinieta.html': 'rca',
    'blog-pad-locuinta.html': 'locuinta', 'blog-pensie-pilon3.html': 'pensie',
    'blog-animale-companie.html': 'animale', 'blog-viata-easy-life.html': 'viata'
  };
  var formNames = {
    quickQuoteForm: 'quick_quote', travelQuoteForm: 'travel_quote', multiTravelQuoteForm: 'multitravel_quote',
    professionalLiabilityQuoteForm: 'professional_liability_quote', homeInsuranceQuoteForm: 'home_insurance_quote',
    contactForm: 'contact', expatLeadForm: 'expat_health', karmaQuoteForm: 'karma_buna', leadForm: 'rca_calculator'
  };
  var recentHandoffs = new WeakMap();

  function productKey(value) {
    if (!value) return null;
    var text = String(value).trim().toLocaleLowerCase('ro');
    return Object.keys(products).find(function (key) {
      return key === text || products[key].some(function (label) { return label.toLocaleLowerCase('ro') === text; });
    }) || null;
  }

  function getInsuranceProduct(element, fallback) {
    var key = productKey(element && element.dataset.analyticsProduct) || productKey(fallback);
    if (!key && element && element.closest('form')) {
      var selection = element.closest('form').querySelector('#quoteProduct, #contact-produs');
      key = productKey(selection && selection.value);
    }
    var filename = window.location.pathname.split('/').pop();
    var pageProduct = Object.prototype.hasOwnProperty.call(pageProducts, filename) ? pageProducts[filename] : null;
    key = key || pageProduct || productKey(filename.replace(/\.html$/, '')) || 'consultanta';
    return { id: key, label: products[key][0] };
  }

  function getLeadParameters(method, element, details) {
    var product = getInsuranceProduct(element, details && details.product);
    var location = getContactLocation(element);
    var parameters = {
      method: method,
      lead_method: method,
      product_id: product.id,
      insurance_product: product.label,
      cta_location: location,
      lead_location: location,
      page_path: window.location.pathname,
      measurement_version: '20261021'
    };
    var form = element && (element.tagName === 'FORM' ? element : element.closest('form'));
    var name = form && (formNames[form.id] || (form.hasAttribute('data-rca-lead-form') && 'rca_short_lead'));
    if (name) {
      parameters.form_id = name;
      parameters.form_name = name;
    }
    return parameters;
  }

  function isRapidRepeat(cache, element) {
    if (!element) return false;
    var now = Date.now();
    var last = cache.get(element);
    if (last !== undefined && now - last < 1200) return true;
    cache.set(element, now);
    return false;
  }

  window.asigurariAnalytics = {
    trackLead: function (method, element, details) {
      var parameters = getLeadParameters(method, element, details || {});
      if (method === 'whatsapp_form') {
        if (isRapidRepeat(recentHandoffs, element)) return false;
        parameters.method = 'whatsapp';
        sendAnalyticsEvent('whatsapp_handoff', parameters);
        return true;
      }
      // Callers invoke this only after a successful Formspree response.
      if (method !== 'formspree') return false;
      sendAnalyticsEvent('generate_lead', parameters);
      return true;
    },
    trackContactClick: function (method, element) {
      if (!['whatsapp', 'phone', 'email'].includes(method)) return;
      var parameters = getLeadParameters(method, element, {});
      sendAnalyticsEvent('contact_click', parameters);
    }
  };

  function openWhatsAppQuote(form, message, details) {
    if (window.asigurariAnalytics.trackLead('whatsapp_form', form, details) === false) return;
    var url = 'https://wa.me/40774171971?text=' + encodeURIComponent(message);
    // A synthetic anchor could expose its free-text URL to automatic outbound tracking.
    window.open(url, '_blank', 'noopener,noreferrer');
    var feedback = form.querySelector('[data-whatsapp-feedback]');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.setAttribute('data-whatsapp-feedback', '');
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      feedback.className = 'whatsapp-quote-feedback';
      form.appendChild(feedback);
    }
    feedback.replaceChildren(document.createTextNode('Mesajul este pregătit. Continuă în WhatsApp și apasă Trimite. '));
    var retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'whatsapp-quote-retry';
    retry.textContent = 'Deschide WhatsApp';
    retry.addEventListener('click', function () { window.open(url, '_blank', 'noopener,noreferrer'); });
    feedback.appendChild(retry);
    feedback.appendChild(document.createTextNode(' Dacă nu se deschide, sună la 0774 171 971.'));
  }

  window.asigurariQuotes = { openWhatsApp: openWhatsAppQuote };

  function trackQuoteStarts() {
    document.querySelectorAll('form').forEach(function (form) {
      if (!formNames[form.id] && !form.hasAttribute('data-rca-lead-form')) return;
      var started = false;
      form.addEventListener('focusin', function () {
        if (started || !window.__analyticsAllowed) return;
        started = true;
        sendAnalyticsEvent('quote_start', getLeadParameters('form', form, {}));
      });
    });
  }

  function enableQuickQuote() {
    var form = document.getElementById('quickQuoteForm');
    if (!form) return;

    var productSelect = document.getElementById('quoteProduct');
    productSelect.addEventListener('change', function () {
      if (productSelect.value) sendAnalyticsEvent('quote_product_select', getLeadParameters('form', form, { product: productSelect.value }));
    });

    var requestedProduct = new URLSearchParams(window.location.search).get('asigurare');
    var requestedProducts = {
      rca: 'RCA',
      calatorie: 'Călătorie',
      locuinta: 'Locuință și PAD',
      malpraxis: 'Malpraxis',
      expati: 'Sănătate pentru expați'
    };
    if (requestedProduct && requestedProducts[requestedProduct.toLowerCase()]) {
      productSelect.value = requestedProducts[requestedProduct.toLowerCase()];
    }

    if (form.hasAttribute('data-home-lead-form')) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var product = document.getElementById('quoteProduct').value;
      var profile = document.getElementById('quoteProfile').value;
      var when = document.getElementById('quoteWhen').value;
      var details = document.getElementById('quoteDetails').value.trim();
      var lines = [
        'Bună ziua! Doresc o ofertă de asigurare.',
        '',
        'Tip: ' + product,
        'Pentru: ' + profile,
        'Când am nevoie: ' + when
      ];

      if (details) lines.push('Alte detalii: ' + details);
      lines.push('', 'Mesaj trimis din formularul AsigurăriCraiova.ro.');

      openWhatsAppQuote(form, lines.join('\n'), {
        product: product,
        form_name: 'quick_quote'
      });
    });
  }

  function enableTravelQuote() {
    var form = document.getElementById('travelQuoteForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var destination = document.getElementById('travelDestination').value;
      var period = document.getElementById('travelPeriod').value;
      var people = document.getElementById('travelPeople').value;
      var need = document.getElementById('travelNeed').value;
      var details = document.getElementById('travelDetails').value.trim();
      var lines = [
        'Bună ziua! Doresc o ofertă de asigurare de călătorie.',
        '',
        'Destinație: ' + destination,
        'Perioada: ' + period,
        'Călători: ' + people,
        'Interes: ' + need
      ];

      if (details) lines.push('Detalii: ' + details);
      lines.push('', 'Mesaj trimis din formularul de călătorie AsigurăriCraiova.ro.');

      openWhatsAppQuote(form, lines.join('\n'), {
        product: 'Călătorie',
        form_name: 'travel_quote'
      });
    });
  }

  function enableMultiTravelQuote() {
    var form = document.getElementById('multiTravelQuoteForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var frequency = document.getElementById('multiTravelFrequency').value;
      var duration = document.getElementById('multiTravelDuration').value;
      var territory = document.getElementById('multiTravelTerritory').value;
      var travellers = document.getElementById('multiTravelTravellers').value;
      var details = document.getElementById('multiTravelDetails').value.trim();
      var lines = [
        'Bună ziua! Doresc o ofertă pentru asigurare MultiTravel.',
        '',
        'Număr aproximativ de călătorii într-un an: ' + frequency,
        'Durata celei mai lungi călătorii: ' + duration,
        'Destinații / zonă: ' + territory,
        'Persoane asigurate: ' + travellers
      ];
      if (details) lines.push('Detalii: ' + details);
      lines.push('', 'Cerere pregătită pe AsigurăriCraiova.ro/multitravel.html.');

      openWhatsAppQuote(form, lines.join('\n'), {
        product: 'MultiTravel',
        form_name: 'multitravel_quote'
      });
    });
  }

  function enableProfessionalLiabilityQuote() {
    var form = document.getElementById('professionalLiabilityQuoteForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var activity = document.getElementById('professionalQuoteActivity').value.trim();
      var client = document.getElementById('professionalQuoteClient').value;
      var territory = document.getElementById('professionalQuoteTerritory').value;
      var limit = document.getElementById('professionalQuoteLimit').value;
      var history = document.getElementById('professionalQuoteHistory').value;
      var details = document.getElementById('professionalQuoteDetails').value.trim();
      var lines = [
        'Bună ziua! Doresc o ofertă pentru asigurare de răspundere civilă profesională.',
        '',
        'Profesie și servicii: ' + activity,
        'Clienți: ' + client,
        'Teritoriul activității: ' + territory,
        'Limită de răspundere: ' + limit,
        'Pretenții sau daune anterioare: ' + history
      ];
      if (details) lines.push('Detalii: ' + details);
      lines.push('', 'Cerere pregătită pe AsigurăriCraiova.ro/raspundere-civila-profesionala.html.');

      openWhatsAppQuote(form, lines.join('\n'), {
        product: 'Răspundere civilă profesională',
        form_name: 'professional_liability_quote'
      });
    });
  }

  function enableHomeInsuranceQuote() {
    var form = document.getElementById('homeInsuranceQuoteForm');
    if (!form) return;

    var cover = document.getElementById('homeQuoteCover');
    document.querySelectorAll('[data-home-cover]').forEach(function (link) {
      link.addEventListener('click', function () {
        var options = {
          'PAD': 'Doar PAD',
          'Facultativă': 'Asigurare facultativă',
          'Nu sunt sigur(ă)': 'Nu sunt sigur(ă)'
        };
        cover.value = options[link.dataset.homeCover] || link.dataset.homeCover;
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var type = document.getElementById('homeQuoteType').value;
      var location = document.getElementById('homeQuoteLocation').value.trim();
      var year = document.getElementById('homeQuoteYear').value;
      var area = document.getElementById('homeQuoteArea').value;
      var lines = [
        'Bună ziua! Doresc o ofertă pentru asigurarea locuinței.',
        '',
        'Interes: ' + cover.value,
        'Tip locuință: ' + type,
        'Localitate / județ: ' + location
      ];
      if (year) lines.push('Anul construcției: ' + year);
      if (area) lines.push('Suprafață aproximativă: ' + area + ' m²');
      lines.push('', 'Mesaj trimis din pagina Asigurare locuință AsigurăriCraiova.ro.');

      openWhatsAppQuote(form, lines.join('\n'), {
        product: 'Locuință și PAD',
        form_name: 'home_insurance_quote'
      });
    });
  }

  function enableRcaLeadForms() {
    document.querySelectorAll('[data-rca-lead-form]').forEach(function (form) {
      var inFlight = false;
      var completed = false;
      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (inFlight || completed) return;
        if (!form.reportValidity()) return;
        inFlight = true;

        var button = form.querySelector('button[type="submit"]');
        var status = form.querySelector('[data-rca-lead-status]');
        button.disabled = true;
        status.textContent = 'Cererea se trimite…';

        try {
          var response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) throw new Error('Formspree error');
          completed = true;
          status.textContent = 'Cererea a fost trimisă. Te contactez în programul de lucru.';
          button.textContent = 'Cerere trimisă ✓';
          form.reset();
          window.asigurariAnalytics.trackLead('formspree', form, {
            product: 'RCA',
            form_name: 'rca_short_lead'
          });
        } catch (error) {
          status.textContent = 'Cererea nu a putut fi trimisă. Scrie-mi pe WhatsApp sau sună la 0774 171 971.';
        } finally {
          inFlight = false;
          button.disabled = completed;
        }
      });
    });
  }

  function trackContactClicks() {
    document.addEventListener('click', function (event) {
      var whatsapp = event.target.closest('a[href^="https://wa.me/"]');
      var phone = event.target.closest('a[href^="tel:"]');
      var email = event.target.closest('a[href^="mailto:"]');
      if (whatsapp && !whatsapp.dataset.analyticsSkipContact) window.asigurariAnalytics.trackContactClick('whatsapp', whatsapp);
      if (phone) window.asigurariAnalytics.trackContactClick('phone', phone);
      if (email) window.asigurariAnalytics.trackContactClick('email', email);
      var productLink = event.target.closest('.insurance-card, .home-feature-card');
      if (productLink) {
        sendAnalyticsEvent('product_page_click', {
          page_path: window.location.pathname,
          destination_path: new URL(productLink.href, window.location.origin).pathname
        });
      }
    }, true);
  }

  document.addEventListener('DOMContentLoaded', function () {
    installGlobalNavigation();
    installMobileContactBar();
    installGlobalFooter();
    addSkipLink();
    enhanceNavigation();
    enhanceAccessibleNames();
    enableMaps();
    enableHomeMenu();
    enableQuickQuote();
    enableTravelQuote();
    enableMultiTravelQuote();
    enableProfessionalLiabilityQuote();
    enableHomeInsuranceQuote();
    enableRcaLeadForms();
    trackQuoteStarts();
    addPrivacyControl();
    trackContactClicks();

    var consent = getConsent();
    if (consent === 'accepted') loadAnalytics();
    else if (consent !== 'rejected') showConsent();
  });
})();
