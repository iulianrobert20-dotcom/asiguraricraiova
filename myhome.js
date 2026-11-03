(function () {
  'use strict';

  // The campaign ends after 30 November in Romania, regardless of the visitor's time zone.
  var campaignEnd = Date.parse('2026-12-01T00:00:00+02:00');
  var campaignEnded = false;
  var campaignTimer;

  function scheduleCampaignUpdate() {
    window.clearTimeout(campaignTimer);
    var remaining = campaignEnd - Date.now();
    if (remaining <= 0) return;
    // Daily chunks stay below the browser's maximum timer delay even weeks before expiry.
    campaignTimer = window.setTimeout(function () {
      updateCampaign();
      scheduleCampaignUpdate();
    }, Math.min(remaining, 24 * 60 * 60 * 1000));
  }

  function updateCampaign() {
    campaignEnded = Date.now() >= campaignEnd;
    document.querySelectorAll('[data-myhome-active]').forEach(function (element) {
      element.hidden = campaignEnded;
    });
    document.querySelectorAll('[data-myhome-expired]').forEach(function (element) {
      element.hidden = !campaignEnded;
    });
    document.querySelectorAll('[data-myhome-title]').forEach(function (heading) {
      if (!heading.dataset.activeText) heading.dataset.activeText = heading.textContent;
      if (campaignEnded) heading.textContent = heading.dataset.expiredText;
    });
    var form = document.getElementById('myHomeQuoteForm');
    if (form) form.dataset.analyticsCampaign = campaignEnded ? '' : 'myhome_pad_2026';
    if (campaignEnded && document.body.classList.contains('myhome-page')) {
      document.title = 'Allianz-Țiriac My Home | Asigurare locuință în Craiova';
      var description = 'Solicită informații despre asigurarea de locuință My Home de la Allianz-Țiriac. Disponibilitatea și condițiile se confirmă la ofertare.';
      ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].forEach(function (selector) {
        var meta = document.querySelector(selector);
        if (meta) meta.content = description;
      });
      ['meta[property="og:title"]', 'meta[name="twitter:title"]'].forEach(function (selector) {
        var meta = document.querySelector(selector);
        if (meta) meta.content = document.title;
      });
    }
  }

  function enableMyHomeQuote() {
    var form = document.getElementById('myHomeQuoteForm');
    if (!form) return;
    var button = form.querySelector('[data-myhome-submit]');
    var type = document.getElementById('myHomeQuoteType');
    var location = document.getElementById('myHomeQuoteLocation');
    var year = document.getElementById('myHomeQuoteYear');
    var area = document.getElementById('myHomeQuoteArea');
    var policy = document.getElementById('myHomeQuotePolicy');
    if (!type || !location || !year || !area || !policy || !window.asigurariQuotes) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      updateCampaign();
      var lines = [
        'Bună ziua! Doresc informații și o ofertă pentru asigurarea de locuință My Home de la Allianz-Țiriac.',
        ''
      ];
      if (!campaignEnded) {
        lines.push('Vă rog să verificați disponibilitatea și eligibilitatea pentru campania PAD gratuit (1 septembrie–30 noiembrie 2026).', '');
      }
      lines.push('Tip locuință: ' + type.value, 'Localitate / județ: ' + location.value.trim());
      if (year.value) lines.push('Anul construcției: ' + year.value);
      if (area.value) lines.push('Suprafață aproximativă: ' + area.value + ' m²');
      lines.push('Poliță Allianz-Țiriac pentru locuință: ' + policy.value);
      lines.push('', 'Cerere pregătită pe AsigurăriCraiova.ro/allianz-tiriac-my-home-pad.html.');
      window.asigurariQuotes.openWhatsApp(form, lines.join('\n'), { product: 'locuinta' });
    });
    if (button) button.disabled = false;
  }

  function init() {
    updateCampaign();
    enableMyHomeQuote();
    scheduleCampaignUpdate();
    // Re-evaluate when a visitor returns to a tab left open across the campaign deadline.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        updateCampaign();
        scheduleCampaignUpdate();
      }
    });
    window.addEventListener('pageshow', function () {
      updateCampaign();
      scheduleCampaignUpdate();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
