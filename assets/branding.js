/* ============================================================
   branding.js — Applies logo and favicon from content/site/branding.json
   edited from the CMS. If empty, keeps current text/icon.
   ============================================================ */
(function () {
  if (!window.fetch) return;
  window.fetch('content/site/branding.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (b) {
      if (!b) return;

      /* ----- Logo (wordmark top-left) ----- */
      var brand = document.querySelector('.brand');
      if (brand) {
        if (b.logo_image) {
          /* Image logo: replace text with image */
          brand.innerHTML = '<img src="' + b.logo_image + '" alt="Saleem Rishah" class="brand-img">';
          /* Logo height from CMS (logo_height) */
          if (b.logo_height) {
            document.documentElement.style.setProperty('--logo-h', b.logo_height + 'px');
          }
        } else if (b.logo_text) {
          /* Text: update name keeping the dot */
          var dot = brand.querySelector('.dot');
          brand.innerHTML = '';
          if (dot) brand.appendChild(dot);
          brand.appendChild(document.createTextNode(b.logo_text));
        }
      }

      /* ----- Favicon ----- */
      if (b.favicon) {
        var link = document.querySelector('link[rel="icon"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        /* Set type by extension */
        link.type = /\.svg($|\?)/i.test(b.favicon) ? 'image/svg+xml' : 'image/png';
        link.href = b.favicon;
      }
    })
    .catch(function () { /* ignore: keep default */ });
})();
