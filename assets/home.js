/* ============================================================
   home.js — Applies Hero content from content/site/home.json
   (portrait, titles, text, status) if filled from the CMS.
   Empty field = keep original page content.
   ============================================================ */
(function () {
  if (!window.fetch) return;
  var hero = document.querySelector('.hero');
  if (!hero) return;

  window.fetch('content/site/home.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (h) {
      if (!h) return;

      /* Portrait */
      if (h.portrait) {
        var img = hero.querySelector('.portrait-frame img');
        if (img) img.src = h.portrait;
      }

      /* Bilingual field: updates an element with only-de / only-en */
      function setBi(sel, de, en) {
        if (!de && !en) return;
        var box = hero.querySelector(sel);
        if (!box) return;
        var d = box.querySelector('.only-de');
        var e = box.querySelector('.only-en');
        if (d && de) d.innerHTML = de;
        if (e && en) e.innerHTML = en;
      }

      /* data-en field: updates German text + data-en/data-de attrs */
      function setDataEn(sel, de, en) {
        if (!de && !en) return;
        var el = hero.querySelector(sel);
        if (!el) return;
        if (de) { el.innerHTML = de; el.setAttribute('data-de', de); }
        if (en) el.setAttribute('data-en', en);
      }

      setDataEn('.hero .tc span[data-en]', h.eyebrow_de, h.eyebrow_en);
      setBi('.hero h1', h.headline_de, h.headline_en);
      setBi('.hero .lead', h.lead_de, h.lead_en);
      setDataEn('.hero .status span[data-en]', h.status_de, h.status_en);

      /* If current language is English, re-apply after update */
      if (window.__applyLangAgain) window.__applyLangAgain();
    })
    .catch(function () { /* ignore */ });
})();
