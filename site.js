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

  function enableQuickQuote() {
    var form = document.getElementById('quickQuoteForm');
    if (!form) return;

    var productSelect = document.getElementById('quoteProduct');
    var assistant = document.getElementById('quoteAssistant');
    var assistantIntro = document.getElementById('quoteAssistantIntro');
    var assistantFields = document.getElementById('quoteAssistantFields');
    var detailsField = document.getElementById('quoteDetails');
    var presets = {
      'RCA': {
        intro: 'Pentru RCA, aceste răspunsuri mă ajută să pregătesc cererea și opțiunea de plată potrivită.',
        placeholder: 'Ex.: marca și modelul, data expirării poliței actuale...',
        fields: [
          { id: 'quoteVehicle', label: 'Tip vehicul', message: 'Vehicul', options: ['Autoturism', 'Autoutilitară', 'Motocicletă / scuter', 'Alt tip'] },
          { id: 'quotePayment', label: 'Cum vrei să plătești?', message: 'Plată preferată', options: ['Integral', 'În rate prin TBI Bank', 'În rate cu un card de credit', 'Vreau să aflu opțiunile'] }
        ]
      },
      'Călătorie': {
        intro: 'Pentru călătorie, destinația și numărul de persoane influențează ofertele care pot fi comparate.',
        placeholder: 'Ex.: perioada călătoriei, vârstele, sporturi sau alte activități...',
        fields: [
          { id: 'quoteDestination', label: 'Destinația', message: 'Destinație', options: ['Europa', 'Turcia / Egipt', 'SUA / Canada', 'Lume întreagă', 'Încă nu este stabilită'] },
          { id: 'quoteTravelers', label: 'Cine călătorește?', message: 'Călători', options: ['1 persoană', '2 persoane', 'Familie / 3+ persoane', 'Grup'] }
        ]
      },
      'Locuință și PAD': {
        intro: 'Pentru locuință, tipul proprietății și protecția dorită sunt suficiente pentru primul răspuns.',
        placeholder: 'Ex.: localitatea, anul construcției sau ce bunuri vrei să protejezi...',
        fields: [
          { id: 'quoteHomeType', label: 'Tipul proprietății', message: 'Proprietate', options: ['Apartament', 'Casă', 'Casă de vacanță', 'Alt tip'] },
          { id: 'quoteHomeCover', label: 'Ce dorești?', message: 'Protecție dorită', options: ['PAD obligatorie', 'Asigurare facultativă', 'PAD + facultativă', 'Vreau o recomandare'] }
        ]
      },
      'Malpraxis': {
        intro: 'Pentru malpraxis, profesia și situația cererii ajută la identificarea rapidă a unei polițe potrivite.',
        placeholder: 'Ex.: specialitatea, suma asigurată cerută sau o condiție din contract...',
        fields: [
          { id: 'quoteProfession', label: 'Profesia', message: 'Profesie', options: ['Medic', 'Asistent medical', 'Medic stomatolog', 'Farmacist', 'Altă profesie'] },
          { id: 'quoteMalpracticeNeed', label: 'Pentru ce ai nevoie?', message: 'Situație', options: ['Poliță nouă', 'Reînnoire', 'Angajare / contract', 'Vreau o recomandare'] }
        ]
      }
    };

    function renderAssistant(product) {
      var preset = presets[product];
      assistantFields.replaceChildren();
      assistant.hidden = !preset;
      detailsField.placeholder = preset ? preset.placeholder : 'Ex.: mașină nouă, apartament, destinația călătoriei...';
      if (!preset) return;

      assistantIntro.textContent = preset.intro;
      preset.fields.forEach(function (field) {
        var wrapper = document.createElement('div');
        wrapper.className = 'quote-field';

        var label = document.createElement('label');
        label.htmlFor = field.id;
        label.textContent = field.label;

        var select = document.createElement('select');
        select.id = field.id;
        select.name = field.id;
        select.required = true;
        select.dataset.quoteExtra = '';
        select.dataset.messageLabel = field.message;

        var emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Alege';
        select.appendChild(emptyOption);
        field.options.forEach(function (optionText) {
          var option = document.createElement('option');
          option.textContent = optionText;
          select.appendChild(option);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        assistantFields.appendChild(wrapper);
      });
    }

    productSelect.addEventListener('change', function () {
      renderAssistant(productSelect.value);
      if (productSelect.value && window.__analyticsAllowed && typeof window.gtag === 'function') {
        window.gtag('event', 'quote_product_select', {
          product: productSelect.value.slice(0, 60),
          quote_variant: 'smart_assistant_v1'
        });
      }
    });

    var requestedProduct = new URLSearchParams(window.location.search).get('asigurare');
    var requestedProducts = {
      rca: 'RCA',
      calatorie: 'Călătorie',
      locuinta: 'Locuință și PAD',
      malpraxis: 'Malpraxis'
    };
    if (requestedProduct && requestedProducts[requestedProduct.toLowerCase()]) {
      productSelect.value = requestedProducts[requestedProduct.toLowerCase()];
    }
    renderAssistant(productSelect.value);

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

      form.querySelectorAll('[data-quote-extra]').forEach(function (field) {
        if (field.value) lines.push(field.dataset.messageLabel + ': ' + field.value);
      });
      if (details) lines.push('Alte detalii: ' + details);
      lines.push('', 'Mesaj trimis din formularul AsigurăriCraiova.ro.');

      if (window.__analyticsAllowed && typeof window.gtag === 'function') {
        window.gtag('event', 'quick_quote_whatsapp', {
          event_category: 'Contact',
          event_label: product.slice(0, 60),
          product: product.slice(0, 60),
          quote_variant: 'smart_assistant_v1'
        });
      }

      var url = 'https://wa.me/40774171971?text=' + encodeURIComponent(lines.join('\n'));
      var link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  function trackContactClicks() {
    document.addEventListener('click', function (event) {
      if (!window.__analyticsAllowed || typeof window.gtag !== 'function') return;
      var whatsapp = event.target.closest('a[href*="wa.me/"]');
      var phone = event.target.closest('a[href^="tel:"]');
      if (whatsapp) window.gtag('event', 'whatsapp_click', { event_category: 'Contact', event_label: document.title.slice(0, 90) });
      if (phone) window.gtag('event', 'phone_click', { event_category: 'Contact', event_label: document.title.slice(0, 90) });
    }, true);
  }

  document.addEventListener('DOMContentLoaded', function () {
    addSkipLink();
    enhanceNavigation();
    enhanceAccessibleNames();
    enableMaps();
    enableHomeMenu();
    enableQuickQuote();
    addPrivacyControl();
    trackContactClicks();

    var consent = getConsent();
    if (consent === 'accepted') loadAnalytics();
    else if (consent !== 'rejected') showConsent();
  });
})();
