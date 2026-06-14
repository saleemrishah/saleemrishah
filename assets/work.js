/* ============================================================
   Saleem Rishah — Work renderer + project modal
   يبني الأقسام والكروت من window.WORK_DATA ويفتح نافذة التفاصيل.
   لا حاجة لتعديل هذا الملف عند إضافة عمل، عدّل work-data.js فقط.
   ============================================================ */
(function () {
  var mount = document.getElementById('work-sections');
  if (!mount) return;

  /* نجلب البيانات من data/work.json (يبنيه Netlify من لوحة التحكم).
     لو فشل الجلب (مثلاً فتح الملف محلياً بدون سيرفر)، نرجع لـ window.WORK_DATA. */
  function boot() {
    if (window.fetch) {
      fetch('data/work.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('no json'); return r.json(); })
        .then(function (d) { init(d && d.sections ? d : window.WORK_DATA); })
        .catch(function () { init(window.WORK_DATA); });
    } else {
      init(window.WORK_DATA);
    }
  }

  function init(DATA) {
    if (!DATA || !DATA.sections) return;

  /* نص ثنائي اللغة: نطبع النسختين والـ CSS يخفي وحدة حسب html.de/.en */
  function bi(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    var de = obj.de != null ? obj.de : '';
    var en = obj.en != null ? obj.en : de;
    return '<span class="only-de">' + de + '</span><span class="only-en">' + en + '</span>';
  }

  function chipsHTML(arr) {
    if (!arr || !arr.length) return '';
    return '<div class="chips">' +
      arr.map(function (c) { return '<span class="chip">' + c + '</span>'; }).join('') +
      '</div>';
  }

  /* رابط الصورة: لو فيه "/" أو "http" نستخدمه كما هو، وإلا نضيف assets/ */
  function img(src) {
    if (!src) return 'assets/og-cover.jpg';
    if (src.indexOf('http') === 0 || src.indexOf('/') !== -1) return src;
    return 'assets/' + src;
  }

  /* فهرس لكل الأعمال حسب id حتى نفتح النافذة بسرعة */
  var byId = {};

  /* ---------- بناء الأقسام والكروت ---------- */
  var html = '';
  DATA.sections.forEach(function (sec, si) {
    if (!sec.items || !sec.items.length) return;
    html += '<section class="work-section"' + (sec.id ? ' id="' + sec.id + '"' : '') +
            (si > 0 ? ' style="padding-top:0"' : '') + '>';
    html += '<div class="wrap">';
    html += '<p class="tc">' + bi(sec.eyebrow) + '</p>';
    html += '<h2>' + bi(sec.title) + '</h2>';
    if (sec.intro) html += '<p class="lead" style="margin-bottom:8px">' + bi(sec.intro) + '</p>';

    html += '<div class="work-grid">';
    sec.items.forEach(function (it) {
      byId[it.id] = it;
      var hasVideo = !!it.video;
      html += '<button class="work-card reveal" type="button" data-work="' + it.id + '">';
      html += '<span class="wc-media">';
      html += '<img src="' + img(it.cover) + '" alt="" loading="lazy">';
      if (hasVideo) html += '<span class="wc-play" aria-hidden="true">▶</span>';
      html += '</span>';
      html += '<span class="pad">';
      html += '<span class="wc-title">' + bi(it.title) + '</span>';
      html += '<span class="wc-sum">' + bi(it.summary) + '</span>';
      html += chipsHTML(it.chips);
      html += '<span class="wc-more"><span data-en="View project">Projekt ansehen</span> →</span>';
      html += '</span>';
      html += '</button>';
    });
    html += '</div></div></section>';
  });
  mount.innerHTML = html;

  /* ---------- محتوى النافذة لعمل واحد ---------- */
  function videoHTML(it) {
    if (!it.video) return '';
    var src = it.video;
    var vertical = it.vertical ? ' wm-video--vertical' : '';
    if (/\.mp4($|\?)/i.test(src) || src.indexOf('http') !== 0 || src.indexOf('/') === 0) {
      /* ملف محلي */
      return '<div class="wm-video' + vertical + '"><video controls preload="metadata"' +
        (it.cover ? ' poster="' + img(it.cover) + '"' : '') + ' src="' + src + '"></video></div>';
    }
    /* iframe (يوتيوب/فيميو embed) */
    return '<div class="wm-video' + vertical + '"><iframe src="' + src +
      '" title="Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
  }

  function galleryHTML(it) {
    if (!it.gallery || !it.gallery.length) return '';
    return '<div class="wm-gallery">' +
      it.gallery.map(function (g) {
        return '<img src="' + img(g) + '" alt="" loading="lazy">';
      }).join('') + '</div>';
  }

  function tracksHTML(it) {
    if (!it.tracks || !it.tracks.length) return '';
    var t = '<div class="pipeline wm-pipeline">';
    it.tracks.forEach(function (tr) {
      t += '<div class="track">';
      t += '<p class="t-id">' + (tr.id || '') + '</p>';
      t += '<h3>' + bi(tr.title) + '</h3>';
      if (tr.text) t += '<p>' + bi(tr.text) + '</p>';
      t += chipsHTML(tr.chips);
      t += '</div>';
    });
    t += '</div>';
    return t;
  }

  function linkHTML(it) {
    if (!it.link || !it.link.url) return '';
    var label = '<span class="only-de">' + (it.link.label_de || it.link.url) + '</span>' +
                '<span class="only-en">' + (it.link.label_en || it.link.label_de || it.link.url) + '</span>';
    return '<div class="btn-row"><a class="btn btn-primary" href="' + it.link.url +
           '" target="_blank" rel="noopener">' + label + '</a></div>';
  }

  function buildModal(it) {
    var h = '';
    h += '<p class="tc">' + bi(it.title) + '</p>';
    h += '<h2 id="wm-title-inner">' + bi(it.title) + '</h2>';
    h += videoHTML(it);
    if (!it.video && it.cover) {
      h += '<div class="wm-cover"><img src="' + img(it.cover) + '" alt=""></div>';
    }
    if (it.summary) h += '<p class="lead">' + bi(it.summary) + '</p>';
    if (it.body) h += '<div class="wm-text">' + bi(it.body) + '</div>';
    h += chipsHTML(it.chips);
    h += galleryHTML(it);
    h += linkHTML(it);
    h += tracksHTML(it);
    return h;
  }

  /* ---------- فتح/إغلاق النافذة ---------- */
  var modal = document.getElementById('work-modal');
  var modalBody = document.getElementById('wm-body');
  var lastFocus = null;

  function syncLang() {
    /* بعد ملء النافذة، خبّر main.js (لو موجود) ليطبّق اللغة على data-en الجديدة */
    var lang = document.documentElement.classList.contains('en') ? 'en' : 'de';
    modalBody.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.hasAttribute('data-de')) el.setAttribute('data-de', el.innerHTML);
      el.innerHTML = el.getAttribute(lang === 'en' ? 'data-en' : 'data-de');
    });
  }

  function openWork(id) {
    var it = byId[id];
    if (!it) return;
    modalBody.innerHTML = buildModal(it);
    syncLang();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    lastFocus = document.activeElement;
    var closeBtn = modal.querySelector('.wm-close');
    if (closeBtn) closeBtn.focus();
    modalBody.scrollTop = 0;
  }

  function closeWork() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalBody.innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  mount.addEventListener('click', function (e) {
    var card = e.target.closest('[data-work]');
    if (card) openWork(card.getAttribute('data-work'));
  });

  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeWork();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeWork();
  });

  /* لو بدّل المستخدم اللغة والنافذة مفتوحة، نعيد المزامنة */
  document.querySelectorAll('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!modal.hidden) setTimeout(syncLang, 0);
    });
  });
  } /* end init */

  boot();
})();
