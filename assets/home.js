/* ============================================================
   home.js — يطبّق محتوى الـ Hero من content/site/home.json
   (الصورة الشخصية، العناوين، النص، الستيتس) لو معبّاة من اللوحة.
   كل حقل فاضي = يبقى المحتوى الأصلي بالصفحة.
   ============================================================ */
(function () {
  if (!window.fetch) return;
  var hero = document.querySelector('.hero');
  if (!hero) return;

  window.fetch('content/site/home.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (h) {
      if (!h) return;

      /* الصورة الشخصية */
      if (h.portrait) {
        var img = hero.querySelector('.portrait-frame img');
        if (img) img.src = h.portrait;
      }

      /* حقل ثنائي اللغة: يحدّث عنصر فيه only-de / only-en */
      function setBi(sel, de, en) {
        if (!de && !en) return;
        var box = hero.querySelector(sel);
        if (!box) return;
        var d = box.querySelector('.only-de');
        var e = box.querySelector('.only-en');
        if (d && de) d.innerHTML = de;
        if (e && en) e.innerHTML = en;
      }

      /* حقل data-en (سطر واحد): يحدّث النص الألماني + سمة data-en/data-de */
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

      /* لو اللغة الحالية إنكليزي، نعيد تطبيقها بعد التحديث */
      if (window.__applyLangAgain) window.__applyLangAgain();
    })
    .catch(function () { /* تجاهل */ });
})();
