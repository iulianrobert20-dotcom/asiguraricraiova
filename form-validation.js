(function () {
  'use strict';

  var errorSequence = 0;
  var sourcePages = {
    rca: '/rca.html',
    'rca-in-rate': '/rca-in-rate.html',
    locuinta: '/locuinta.html',
    'calculator-rca': '/calculator-rca.html',
    contact: '/contact.html'
  };

  function english() {
    return document.documentElement.lang === 'en';
  }

  function message(ro, en) {
    return english() ? en : ro;
  }

  function contactContext() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var requested = (params.get('asigurare') || '').toLowerCase();
    var products = { rca: 'RCA', locuinta: 'Locuință + PAD (soluție coordonată)' };
    var select = document.getElementById('contact-produs');
    if (Object.prototype.hasOwnProperty.call(products, requested) && select) {
      Array.prototype.forEach.call(select.options, function (option) {
        option.selected = option.defaultSelected = option.value === products[requested];
      });
    }

    // Accept only known local pages; query strings cannot inject an external URL or free text.
    var requestedSource = params.get('sursa') || '';
    var sourceKey = Object.keys(sourcePages).find(function (key) {
      return requestedSource === key || requestedSource === sourcePages[key];
    });
    var source = sourcePages[sourceKey] ||
      (Object.prototype.hasOwnProperty.call(sourcePages, requested) ? sourcePages[requested] : sourcePages.contact);
    var field = form.querySelector('input[name="pagina_sursa"]');
    if (field) field.value = field.defaultValue = source;
    form.addEventListener('submit', function () {
      if (field) field.value = source;
    }, true);
  }

  function eligible(field) {
    return field.willValidate && !field.hidden && field.type !== 'hidden' &&
      !field.closest('[hidden]');
  }

  function plausiblePhone(value) {
    if (!/^\+?[\d\s().-]+$/.test(value)) return false;
    var digits = value.replace(/\D/g, '');
    if (digits.indexOf('00') === 0) digits = digits.slice(2);
    return digits.length >= 7 && digits.length <= 15;
  }

  function errorElement(field) {
    if (field.__validationError) return field.__validationError;
    var error = document.createElement('span');
    error.id = 'form-field-error-' + (++errorSequence);
    error.className = 'form-field-error';
    error.hidden = true;
    error.setAttribute('aria-live', 'polite');
    var label = field.closest('label');
    if (label && field.type !== 'checkbox' && field.type !== 'radio') {
      label.appendChild(error);
    } else {
      (label || field).insertAdjacentElement('afterend', error);
      if (label) error.classList.add('form-field-error--choice');
    }
    var describedBy = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    describedBy.push(error.id);
    field.setAttribute('aria-describedby', describedBy.join(' '));
    field.__validationError = error;
    return error;
  }

  function validateField(field, reveal) {
    if (!eligible(field)) return true;
    var value = field.value || '';
    var text = field.tagName === 'TEXTAREA' || ['text', 'search', 'tel', 'email', 'url'].indexOf(field.type) !== -1;
    var custom = '';
    if (field.required && text && !value.trim()) {
      custom = message('Completează acest câmp cu informații, nu doar cu spații.', 'Enter a value, not only spaces.');
    } else if (field.type === 'tel' && value.trim() && !plausiblePhone(value.trim())) {
      custom = message('Introdu un telefon cu 7–15 cifre, fără litere. Poți folosi +, spații, paranteze sau cratime.', 'Enter a phone number with 7–15 digits and no letters. You can use +, spaces, parentheses or hyphens.');
    }
    field.setCustomValidity(custom);
    var valid = field.validity.valid;
    var error = field.__validationError;
    if (reveal || error) {
      if (!valid) {
        error = errorElement(field);
        error.textContent = custom || field.validationMessage;
        error.hidden = false;
        field.setAttribute('aria-invalid', 'true');
      } else {
        if (error) { error.textContent = ''; error.hidden = true; }
        field.removeAttribute('aria-invalid');
      }
    }
    return valid;
  }

  function install(form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
    fields.forEach(function (field) {
      validateField(field, false);
      ['input', 'change'].forEach(function (name) {
        field.addEventListener(name, function () { validateField(field, false); });
      });
      field.addEventListener('blur', function () { validateField(field, true); });
      field.addEventListener('invalid', function () { validateField(field, true); });
    });

    // Capture precedes existing Formspree/WhatsApp handlers, including target listeners.
    // Keep native constraint validation enabled for required/select/email/number fields.
    form.addEventListener('submit', function (event) {
      var submitter = event.submitter || form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitter && submitter.disabled) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      var valid = true;
      fields.forEach(function (field) { if (!validateField(field, true)) valid = false; });
      if (!valid) {
        event.preventDefault();
        event.stopImmediatePropagation();
        form.reportValidity();
      }
    }, true);

    form.addEventListener('reset', function () {
      // Reset's default action restores values after listeners have run.
      window.setTimeout(function () {
        fields.forEach(function (field) {
          field.setCustomValidity('');
          field.removeAttribute('aria-invalid');
          if (field.__validationError) {
            field.__validationError.hidden = true;
            field.__validationError.textContent = '';
          }
        });
      }, 0);
    });
  }

  function init() {
    contactContext();
    document.querySelectorAll('form').forEach(install);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
