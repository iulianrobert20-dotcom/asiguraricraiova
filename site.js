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
    addPrivacyControl();
    trackContactClicks();

    var consent = getConsent();
    if (consent === 'accepted') loadAnalytics();
    else if (consent !== 'rejected') showConsent();
  });
})();
