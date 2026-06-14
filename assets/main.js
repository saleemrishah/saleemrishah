/* Saleem Rishah — portfolio scripts */
(function () {
  var root = document.documentElement;

  /* ---------- language (DE default, persisted) ---------- */
  function storedLang() {
    try { return localStorage.getItem('lang'); } catch (e) { return null; }
  }
  function storeLang(l) {
    try { localStorage.setItem('lang', l); } catch (e) { /* ignore */ }
  }

  /* cache German originals for every [data-en] element */
  document.querySelectorAll('[data-en]').forEach(function (el) {
    if (!el.hasAttribute('data-de')) el.setAttribute('data-de', el.innerHTML);
  });
  document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
    if (!el.hasAttribute('data-de-placeholder')) {
      el.setAttribute('data-de-placeholder', el.getAttribute('placeholder') || '');
    }
  });

  function setLang(lang) {
    root.classList.remove('de', 'en');
    root.classList.add(lang);
    root.setAttribute('lang', lang);

    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.innerHTML = el.getAttribute(lang === 'en' ? 'data-en' : 'data-de');
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder',
        el.getAttribute(lang === 'en' ? 'data-en-placeholder' : 'data-de-placeholder'));
    });

    var b = document.body;
    var t = b.getAttribute(lang === 'en' ? 'data-title-en' : 'data-title-de');
    if (t) document.title = t;

    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    storeLang(lang);
  }

  document.querySelectorAll('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
  });

  setLang(storedLang() === 'en' ? 'en' : 'de');

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- scroll playhead ---------- */
  var ph = document.querySelector('.playhead');
  if (ph) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      ph.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* خطاف للسكربتات الأخرى (home.js) لإعادة تطبيق اللغة بعد تحديث المحتوى */
  window.__applyLangAgain = function () {
    setLang(root.classList.contains('en') ? 'en' : 'de');
  };

})();
