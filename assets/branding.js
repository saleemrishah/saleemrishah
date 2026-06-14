/* ============================================================
   branding.js — يطبّق اللوغو والأيقونة من content/site/branding.json
   اللي بتعدّلهن من لوحة التحكم. لو الملف فاضي، يبقى النص/الأيقونة الحالية.
   ============================================================ */
(function () {
  if (!window.fetch) return;
  window.fetch('content/site/branding.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (b) {
      if (!b) return;

      /* ----- اللوغو (الوردمارك فوق يسار) ----- */
      var brand = document.querySelector('.brand');
      if (brand) {
        if (b.logo_image) {
          /* صورة لوغو: نستبدل النص بصورة، ونخفي النقطة */
          brand.innerHTML = '<img src="' + b.logo_image + '" alt="Saleem Rishah" class="brand-img">';
        } else if (b.logo_text) {
          /* نص: نحدّث الاسم مع إبقاء النقطة */
          var dot = brand.querySelector('.dot');
          brand.innerHTML = '';
          if (dot) brand.appendChild(dot);
          brand.appendChild(document.createTextNode(b.logo_text));
        }
      }

      /* ----- الأيقونة (favicon) ----- */
      if (b.favicon) {
        var link = document.querySelector('link[rel="icon"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        /* نحدّد النوع حسب الامتداد */
        link.type = /\.svg($|\?)/i.test(b.favicon) ? 'image/svg+xml' : 'image/png';
        link.href = b.favicon;
      }
    })
    .catch(function () { /* تجاهل: يبقى الافتراضي */ });
})();
