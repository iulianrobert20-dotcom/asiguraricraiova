(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('recruitForm');
    var interest = document.getElementById('recruit-interest');
    if (!form || !interest) return;

    document.querySelectorAll('[data-interest]').forEach(function (link) {
      link.addEventListener('click', function () {
        interest.value = link.dataset.interest;
      });
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var button = form.querySelector('button[type="submit"]');
      var status = document.getElementById('recruitStatus');
      button.disabled = true;
      button.textContent = 'Se trimite…';
      status.dataset.state = '';
      status.textContent = 'Cererea este în curs de trimitere.';

      try {
        var response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Formspree error');
        status.dataset.state = 'success';
        status.textContent = 'Cererea a fost trimisă. Te voi contacta pentru o discuție.';
        button.textContent = 'Cerere trimisă ✓';
        form.reset();
        if (window.__analyticsAllowed && typeof window.gtag === 'function') {
          window.gtag('event', 'recruitment_form_submit', { event_category: 'Leads' });
        }
      } catch (error) {
        status.dataset.state = 'error';
        status.textContent = 'Cererea nu a putut fi trimisă. Încearcă din nou sau scrie pe WhatsApp la 0774 171 971.';
        button.textContent = 'Încearcă din nou';
        button.disabled = false;
      }
    });
  });
})();
