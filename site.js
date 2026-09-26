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
    if (banner) banner.remove();
    if (value === 'accepted') {
      loadAnalytics();
    } else {
      window.__analyticsAllowed = false;
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
    }
  }

  function showConsent() {
    if (document.getElementById('cookie-consent')) return;
    var banner = document.createElement('section');
    banner.id = 'cookie-consent';
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-labelledby', 'cookie-title');
    banner.innerHTML =
      '<div class="cookie-consent__body">' +
        '<h2 id="cookie-title">Preferințe de confidențialitate</h2>' +
        '<p>Folosim cookie-uri Analytics numai cu acordul tău, pentru statistici anonimizate. Cookie-urile necesare funcționării site-ului nu pot fi dezactivate. <a href="/gdpr.html#cookies">Detalii</a></p>' +
      '</div>' +
      '<div class="cookie-consent__actions">' +
        '<button type="button" class="cookie-btn cookie-btn--secondary" data-consent="rejected">Refuz Analytics</button>' +
        '<button type="button" class="cookie-btn cookie-btn--primary" data-consent="accepted">Accept Analytics</button>' +
      '</div>';
    document.body.appendChild(banner);
    banner.querySelectorAll('[data-consent]').forEach(function (button) {
      button.addEventListener('click', function () { setConsent(button.dataset.consent); });
    });
    banner.querySelector('[data-consent="rejected"]').focus();
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
    var legacyHeader = document.querySelector('nav.snav, header.home-header');
    if (!legacyHeader || document.querySelector('.global-site-header')) return;

    var header = document.createElement('header');
    header.className = 'global-site-header';
    header.innerHTML =
      '<nav class="global-site-nav" aria-label="Navigare principală">' +
        '<div class="global-site-nav__inner">' +
          '<a class="global-site-brand" href="/" aria-label="AsigurăriCraiova.ro — acasă">' +
            '<span class="global-site-brand__mark" aria-hidden="true">AC</span>' +
            '<span class="global-site-brand__copy"><strong>AsigurăriCraiova.ro</strong><small>Intermediar autorizat în asigurări</small></span>' +
          '</a>' +
          '<button class="global-site-menu-toggle" type="button" aria-expanded="false" aria-controls="globalSiteMenu"><span aria-hidden="true">☰</span><span class="sr-only">Deschide meniul</span></button>' +
          '<div class="global-site-menu" id="globalSiteMenu">' +
            '<div class="global-site-products">' +
              '<button class="global-site-products__toggle" type="button" aria-expanded="false" aria-controls="globalProductMenu">Asigurări <span aria-hidden="true">▾</span></button>' +
              '<div class="global-site-product-panel" id="globalProductMenu">' +
                '<section><h2>Auto</h2><a href="/rca.html">RCA, CASCO și opțiuni auto →</a></section>' +
                '<section><h2>Locuință</h2><a href="/locuinta.html">Locuință și PAD →</a></section>' +
                '<section><h2>Viață &amp; sănătate</h2><a href="/viata.html">Protecție pentru familie →</a></section>' +
                '<section><h2>Călătorie</h2><a href="/calatorie.html">Călătorii și Storno →</a></section>' +
                '<section><h2>Firme &amp; profesii</h2><a href="/firme.html">Soluții pentru firme →</a></section>' +
                '<section><h2>Economisire</h2><a href="/unitlinked.html">Unit-linked și programe →</a></section>' +
                '<section><h2>Produse speciale</h2><a href="/asigurari.html">Vezi catalogul complet →</a></section>' +
                '<a class="global-site-product-panel__all" href="/asigurari.html">Vezi toate asigurările <span aria-hidden="true">→</span></a>' +
              '</div>' +
            '</div>' +
            '<a href="/rca.html">RCA</a>' +
            '<a href="/locuinta.html">Locuință</a>' +
            '<a href="/viata.html">Viață &amp; sănătate</a>' +
            '<a href="/calatorie.html">Călătorie</a>' +
            '<a href="/calculator-rca.html">Calculator RCA</a>' +
            '<a href="/contact.html">Contact</a>' +
            '<a class="global-site-phone" href="tel:+40774171971" data-analytics-location="navigation">0774 171 971</a>' +
            '<a class="global-site-cta" href="https://wa.me/40774171971" target="_blank" rel="noopener noreferrer" data-analytics-location="navigation">Cere ofertă pe WhatsApp</a>' +
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
    if (legacyFooter.querySelector('.home-footer__grid') || legacyFooter.classList.contains('expat-footer')) return;

    var footer = document.createElement('div');
    footer.className = 'global-site-footer';
    footer.innerHTML =
      '<div class="global-site-footer__inner">' +
        '<div class="global-site-footer__brand"><a href="/">AsigurăriCraiova.ro</a><p>Intermediere în asigurări prin Destine Broker. Discuți direct cu Robert Iulian Stoica.</p></div>' +
        '<div><h2>Explorează</h2><a href="/asigurari.html">Asigurări</a><a href="/calculator-rca.html">Calculator RCA</a><a href="/blog.html">Blog</a><a href="/despre.html">Despre</a></div>' +
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
    if (element && element.closest('.home-hero, .ph, .product-hero')) return 'hero';
    if (element && element.closest('.cta-box, .home-cta, .product-final-cta')) return 'final_cta';
    if (element && element.closest('footer')) return 'footer';
    if (element && element.classList.contains('fwa')) return 'floating_button';
    if (element && element.closest('nav')) return 'navigation';
    return 'content';
  }

  function getInsuranceProduct(element, fallback) {
    if (element && element.dataset.analyticsProduct) return element.dataset.analyticsProduct.slice(0, 60);
    if (fallback) return String(fallback).slice(0, 60);
    var heading = document.querySelector('main h1, h1');
    return heading ? heading.textContent.trim().slice(0, 60) : 'Nespecificat';
  }

  function getLeadParameters(method, element, details) {
    var parameters = {
      lead_method: method,
      insurance_product: getInsuranceProduct(element, details && details.product),
      lead_location: getContactLocation(element),
      page_path: window.location.pathname
    };
    if (details && details.form_name) parameters.form_name = details.form_name;
    return parameters;
  }

  window.asigurariAnalytics = {
    trackLead: function (method, element, details) {
      var parameters = getLeadParameters(method, element, details || {});
      sendAnalyticsEvent('generate_lead', parameters);
      if (method === 'formspree') {
        sendAnalyticsEvent('form_submit', parameters);
        if (parameters.insurance_product.toLowerCase().includes('rca') || window.location.pathname.includes('rca')) {
          sendAnalyticsEvent('rca_lead', parameters);
        }
      }
    },
    trackContactClick: function (method, element) {
      var parameters = getLeadParameters(method, element, {});
      sendAnalyticsEvent(method === 'whatsapp' ? 'contact_whatsapp_click' : 'contact_phone_click', parameters);
      sendAnalyticsEvent(method === 'whatsapp' ? 'whatsapp_click' : 'phone_click', {
        page_path: parameters.page_path,
        product_category: parameters.insurance_product,
        click_location: parameters.lead_location
      });
    }
  };

  function enableQuickQuote() {
    var form = document.getElementById('quickQuoteForm');
    if (!form) return;

    var productSelect = document.getElementById('quoteProduct');
    var quoteStarted = false;
    form.addEventListener('focusin', function () {
      if (quoteStarted) return;
      quoteStarted = true;
      sendAnalyticsEvent('quick_quote_start', { page_path: window.location.pathname });
    });

    productSelect.addEventListener('change', function () {
      if (productSelect.value && window.__analyticsAllowed && typeof window.gtag === 'function') {
        window.gtag('event', 'quote_product_select', {
          product: productSelect.value.slice(0, 60),
          quote_variant: 'quick_quote_v2'
        });
      }
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

      window.asigurariAnalytics.trackLead('whatsapp_form', form, {
        product: product,
        form_name: 'quick_quote'
      });
      sendAnalyticsEvent('quick_quote_whatsapp', {
        page_path: window.location.pathname,
        product_category: product.slice(0, 60)
      });

      var url = 'https://wa.me/40774171971?text=' + encodeURIComponent(lines.join('\n'));
      var link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.analyticsSkipContact = 'true';
      document.body.appendChild(link);
      link.click();
      link.remove();
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

      window.asigurariAnalytics.trackLead('whatsapp_form', form, {
        product: 'Călătorie',
        form_name: 'travel_quote'
      });

      var url = 'https://wa.me/40774171971?text=' + encodeURIComponent(lines.join('\n'));
      var link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.analyticsSkipContact = 'true';
      document.body.appendChild(link);
      link.click();
      link.remove();
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

      window.asigurariAnalytics.trackLead('whatsapp_form', form, {
        product: 'MultiTravel',
        form_name: 'multitravel_quote'
      });

      var link = document.createElement('a');
      link.href = 'https://wa.me/40774171971?text=' + encodeURIComponent(lines.join('\n'));
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.analyticsSkipContact = 'true';
      document.body.appendChild(link);
      link.click();
      link.remove();
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

      window.asigurariAnalytics.trackLead('whatsapp_form', form, {
        product: 'Răspundere civilă profesională',
        form_name: 'professional_liability_quote'
      });

      var link = document.createElement('a');
      link.href = 'https://wa.me/40774171971?text=' + encodeURIComponent(lines.join('\n'));
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.analyticsSkipContact = 'true';
      document.body.appendChild(link);
      link.click();
      link.remove();
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

      window.asigurariAnalytics.trackLead('whatsapp_form', form, {
        product: 'Locuință și PAD',
        form_name: 'home_insurance_quote'
      });

      var link = document.createElement('a');
      link.href = 'https://wa.me/40774171971?text=' + encodeURIComponent(lines.join('\n'));
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.analyticsSkipContact = 'true';
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  function enableRcaLeadForms() {
    document.querySelectorAll('[data-rca-lead-form]').forEach(function (form) {
      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;

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
          status.textContent = 'Cererea a fost trimisă. Te contactez în programul de lucru.';
          form.reset();
          window.asigurariAnalytics.trackLead('formspree', form, {
            product: 'RCA',
            form_name: 'rca_short_lead'
          });
        } catch (error) {
          status.textContent = 'Cererea nu a putut fi trimisă. Scrie-mi pe WhatsApp sau sună la 0774 171 971.';
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function trackContactClicks() {
    document.addEventListener('click', function (event) {
      var whatsapp = event.target.closest('a[href*="wa.me/"]');
      var phone = event.target.closest('a[href^="tel:"]');
      if (whatsapp && !whatsapp.dataset.analyticsSkipContact) window.asigurariAnalytics.trackContactClick('whatsapp', whatsapp);
      if (phone) window.asigurariAnalytics.trackContactClick('phone', phone);
      if (whatsapp && !whatsapp.dataset.analyticsSkipContact && window.location.pathname === '/') {
        sendAnalyticsEvent('home_offer_click', { page_path: '/', click_location: getContactLocation(whatsapp) });
      }
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
    addPrivacyControl();
    trackContactClicks();

    var consent = getConsent();
    if (consent === 'accepted') loadAnalytics();
    else if (consent !== 'rejected') showConsent();
  });
})();
