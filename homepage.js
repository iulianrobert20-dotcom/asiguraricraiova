(function () {
  'use strict';

  function enableMenu() {
    var header = document.querySelector('.home-header');
    var toggle = header && header.querySelector('[data-home-menu-toggle]');
    var menu = header && header.querySelector('[data-home-menu]');
    if (!toggle || !menu) return;
    var mobile = window.matchMedia('(max-width: 900px)');
    if (!menu.id) menu.id = 'homepage-menu';
    toggle.setAttribute('aria-controls', menu.id);

    function setOpen(open, restoreFocus) {
      var expanded = mobile.matches && open;
      menu.hidden = mobile.matches && !expanded;
      menu.classList.toggle('is-open', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      var text = toggle.querySelector('.sr-only');
      if (text) text.textContent = expanded ? 'Închide meniul' : 'Deschide meniul';
      if (restoreFocus || (mobile.matches && !expanded && menu.contains(document.activeElement))) toggle.focus();
    }
    setOpen(false);
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false, true);
      }
    });
    mobile.addEventListener('change', function () { setOpen(false); });
  }

  function enableSegments() {
    var buttons = document.querySelectorAll('[data-home-segment]');
    var panels = {
      personal: document.getElementById('personal-products'),
      business: document.getElementById('business-products')
    };
    if (!buttons.length || !panels.personal || !panels.business) return;

    function selectSegment(value) {
      if (!Object.prototype.hasOwnProperty.call(panels, value)) return;
      buttons.forEach(function (button) {
        var selected = button.dataset.homeSegment === value;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-active', selected);
        var panel = panels[button.dataset.homeSegment];
        if (panel) button.setAttribute('aria-controls', panel.id);
      });
      Object.keys(panels).forEach(function (key) { panels[key].hidden = key !== value; });
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () { selectSegment(button.dataset.homeSegment); });
    });
    document.querySelectorAll('[data-home-segment-link]').forEach(function (link) {
      link.addEventListener('click', function () { selectSegment(link.dataset.homeSegmentLink); });
    });
    selectSegment('personal');
  }

  function enableLeadForm() {
    var form = document.querySelector('#quickQuoteForm[data-home-lead-form]');
    if (!form) return;
    var button = form.querySelector('button[type="submit"]');
    if (!button) return;
    var label = button.querySelector('[data-home-submit-label]') || button;
    var status = form.querySelector('[data-home-lead-status]');
    if (!status) {
      status = document.createElement('p');
      status.setAttribute('data-home-lead-status', '');
      form.appendChild(status);
    }
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    var sending = false;
    var completed = false;
    form.dataset.homeLeadState = 'idle';
    status.dataset.state = 'idle';

    document.querySelectorAll('[data-home-renewal]').forEach(function (link) {
      link.addEventListener('click', function () {
        var selection = form.querySelector('#quoteProduct');
        var rca = Array.prototype.find.call(selection.options, function (option) { return option.value.toLowerCase() === 'rca'; });
        if (rca) {
          selection.value = rca.value;
          selection.dispatchEvent(new Event('change', { bubbles: true }));
        }
        var expiry = form.querySelector('#quoteExpiry');
        if (expiry) window.requestAnimationFrame(function () { expiry.focus({ preventScroll: true }); });
      });
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (sending || completed || !form.reportValidity()) return;
      sending = true;
      form.dataset.homeLeadState = 'sending';
      status.dataset.state = 'sending';
      form.setAttribute('aria-busy', 'true');
      button.disabled = true;
      label.textContent = 'Se trimite…';
      status.textContent = 'Cererea este în curs de trimitere.';
      var product = form.querySelector('#quoteProduct').value;
      var payload = new FormData(form);
      ['name', 'phone'].forEach(function (name) {
        var value = payload.get(name);
        if (typeof value === 'string') payload.set(name, value.trim());
      });
      var controller = new AbortController();
      var timer = window.setTimeout(function () { controller.abort(); }, 15000);

      try {
        var response = await fetch(form.action, {
          method: 'POST',
          body: payload,
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Form processor did not accept the request');
        completed = true;
        form.dataset.homeLeadState = 'success';
        status.dataset.state = 'success';
        label.textContent = 'Cerere trimisă ✓';
        status.textContent = 'Cererea a fost trimisă. Te contactez în programul de lucru.';
        if (window.asigurariAnalytics && typeof window.asigurariAnalytics.trackLead === 'function') {
          try {
            window.asigurariAnalytics.trackLead('formspree', form, { product: product, form_name: 'quick_quote' });
          } catch (error) { /* An accepted request stays successful if optional measurement fails. */ }
        }
      } catch (error) {
        form.dataset.homeLeadState = 'error';
        status.dataset.state = 'error';
        button.disabled = false;
        label.textContent = 'Încearcă din nou';
        status.textContent = 'Cererea nu a putut fi trimisă. Datele sunt păstrate. Încearcă din nou sau sună la 0774 171 971.';
      } finally {
        window.clearTimeout(timer);
        sending = false;
        form.setAttribute('aria-busy', 'false');
      }
    });
  }

  function enableCookieLinks() {
    document.addEventListener('click', function (event) {
      var control = event.target.closest('[data-cookie-preferences]');
      var settings = document.getElementById('cookie-settings');
      if (control && settings) {
        event.preventDefault();
        settings.click();
      }
    });
  }

  function init() {
    if (!document.body.classList.contains('home-redesign')) return;
    enableMenu();
    enableSegments();
    enableLeadForm();
    enableCookieLinks();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
