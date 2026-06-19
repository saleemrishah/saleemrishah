/* ============================================================
   Saleem Rishah — Work renderer + project modal
   Builds sections and cards, opens the project detail modal.
   No need to edit this file when adding a project; the CMS handles content.
   ============================================================ */
(function () {
  var mount = document.getElementById('work-sections');
  if (!mount) return;

  /* ============================================================
     Read content directly from content/ files (written by the CMS).
     Any CMS edit shows immediately, with no build step and no cache.
     Order: content/sections.json (sections + item list) then each item file.
     On failure (e.g. local open without a server) fall back to
     data/work.json then window.WORK_DATA.
     ============================================================ */
  var SECTION_ORDER = ['brand', 'ai', 'football'];

  /* Converts a CMS item (flat fields) into the shape init expects */
  function shapeItem(raw, slug) {
    var it = { id: slug };
    it.title = { de: raw.title_de || '', en: raw.title_en || raw.title_de || '' };
    it.summary = { de: raw.summary_de || '', en: raw.summary_en || raw.summary_de || '' };
    it.cover = raw.cover || '';
    it.chips = Array.isArray(raw.chips) ? raw.chips : [];
    if (raw.body_de || raw.body_en) it.body = { de: raw.body_de || '', en: raw.body_en || raw.body_de || '' };
    if (raw.video) it.video = raw.video;
    if (Array.isArray(raw.gallery) && raw.gallery.length) {
      it.gallery = raw.gallery.map(function (g) {
        if (typeof g === 'string') return { src: g, ar: 'auto', size: '1' };
        var src = (g && g.image) || '';
        if (!src) return null;
        return { src: src, ar: g.aspect_ratio || 'auto', size: g.size || '1' };
      }).filter(function (x) { return x && x.src; });
    }
    if (raw.link_url) it.link = { url: raw.link_url, label_de: raw.link_label || raw.link_url, label_en: raw.link_label || raw.link_url };
    if (Array.isArray(raw.tracks) && raw.tracks.length) {
      it.tracks = raw.tracks.map(function (t) {
        return {
          id: t.id || '',
          title: { de: t.title_de || '', en: t.title_en || t.title_de || '' },
          text: { de: t.text_de || '', en: t.text_en || t.text_de || '' },
          chips: Array.isArray(t.chips) ? t.chips : []
        };
      });
    }
    if (raw.aspect_ratio) it.aspect_ratio = raw.aspect_ratio;
    if (raw.media_width) it.media_width = raw.media_width;
    it._order = typeof raw.order === 'number' ? raw.order : 999;
    return it;
  }

  function getJSON(path) {
    return fetch(path, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('fetch failed: ' + path);
      return r.json();
    });
  }

  /* Builds data directly from content/ */
  function buildFromContent() {
    var visualFetches = SECTION_ORDER.map(function (id) {
      return getJSON('content/site/section-visual-' + id + '.json').catch(function () { return {}; });
    });
    return Promise.all([getJSON('content/sections.json'), Promise.all(visualFetches)])
      .then(function (results) {
        var manifest = results[0];
        var visuals = results[1];
        SECTION_ORDER.forEach(function (id, i) {
          if (manifest[id]) manifest[id].feature_image = (visuals[i] && visuals[i].feature_image) || '';
        });
        return manifest;
      })
      .then(function (manifest) {
      var sectionPromises = SECTION_ORDER.filter(function (id) { return manifest[id]; }).map(function (id) {
        var sec = manifest[id];
        var itemIds = Array.isArray(sec.items) ? sec.items : [];
        var itemPromises = itemIds.map(function (slug) {
          return getJSON('content/' + id + '/' + slug + '.json')
            .then(function (raw) { return shapeItem(raw, slug); })
            .catch(function () { return null; });
        });
        return Promise.all(itemPromises).then(function (items) {
          items = items.filter(function (x) { return x; });
          items.sort(function (a, b) { return a._order - b._order; });
          items.forEach(function (i) { delete i._order; });
          return {
            id: id,
            feature_image: sec.feature_image || '',
            eyebrow: { de: sec.eyebrow_de || '', en: sec.eyebrow_en || '' },
            title: { de: sec.title_de || '', en: sec.title_en || '' },
            intro: { de: sec.intro_de || '', en: sec.intro_en || '' },
            items: items
          };
        });
      });
      return Promise.all(sectionPromises).then(function (sections) {
        return { sections: sections.filter(function (s) { return s.items.length; }) };
      });
    });
  }

  function boot() {
    if (!window.fetch) { init(window.WORK_DATA); return; }
    buildFromContent()
      .then(function (d) { init(d && d.sections && d.sections.length ? d : window.WORK_DATA); })
      .catch(function () {
        /* fallback: data/work.json then window.WORK_DATA */
        getJSON('data/work.json')
          .then(function (d) { init(d && d.sections ? d : window.WORK_DATA); })
          .catch(function () { init(window.WORK_DATA); });
      });
  }

  function init(DATA) {
    if (!DATA || !DATA.sections) return;

  /* Bilingual text: print both, CSS hides one based on html.de/.en */
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

  /* Image path: if it has a slash or http use as-is, else prefix assets/ */
  function img(src) {
    if (!src) return 'assets/og-cover.jpg';
    if (src.indexOf('http') === 0 || src.indexOf('/') !== -1) return src;
    return 'assets/' + src;
  }

  /* Index of all items by id for quick modal open */
  var byId = {};

  /* ---------- Build sections and cards ---------- */
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
  if (window.__observeReveal) window.__observeReveal(mount);
  if (window.__applyLangAgain) window.__applyLangAgain();

  /* ---------- Aspect-ratio / width helpers ---------- */
  function arClass(ar) {
    if (!ar || ar === '16:9') return '';
    return ' wm-ar-' + ar.replace(':', '-');
  }
  function wClass(w) {
    if (!w || w === 'full') return '';
    return ' wm-w-' + w;
  }

  /* ---------- Modal content for one item ---------- */
  function videoHTML(it) {
    if (!it.video) return '';
    var src = it.video;
    var cls = 'wm-video' + arClass(it.aspect_ratio) + wClass(it.media_width);
    if (/\.mp4($|\?)/i.test(src) || src.indexOf('http') !== 0 || src.indexOf('/') === 0) {
      return '<div class="' + cls + '"><video controls preload="metadata"' +
        (it.cover ? ' poster="' + img(it.cover) + '"' : '') + ' src="' + src + '"></video></div>';
    }
    var isIg = src.indexOf('instagram.com/reel') !== -1;
    if (isIg) {
      return '<div class="ig-clip"><iframe class="ig-frame" src="' + src +
        '" title="Video" scrolling="no" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
    }
    return '<div class="' + cls + '"><iframe src="' + src +
      '" title="Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
  }

  function galleryHTML(it) {
    if (!it.gallery || !it.gallery.length) return '';
    return '<div class="wm-gallery">' +
      it.gallery.map(function (g) {
        var src = typeof g === 'string' ? g : g.src;
        var ar  = typeof g === 'object' ? (g.ar || 'auto') : 'auto';
        var sz  = typeof g === 'object' ? (g.size || '1') : '1';
        return '<div class="wm-gi" data-ar="' + ar + '" data-size="' + sz + '">' +
          '<img src="' + img(src) + '" alt="" loading="lazy">' +
          '</div>';
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
      var coverCls = 'wm-cover' + arClass(it.aspect_ratio) + wClass(it.media_width);
      h += '<div class="' + coverCls + '"><img src="' + img(it.cover) + '" alt=""></div>';
    }
    if (it.summary) h += '<p class="lead">' + bi(it.summary) + '</p>';
    if (it.body) h += '<div class="wm-text">' + bi(it.body) + '</div>';
    h += chipsHTML(it.chips);
    h += galleryHTML(it);
    h += linkHTML(it);
    h += tracksHTML(it);
    return h;
  }

  /* ---------- open/close modal ---------- */
  var modal = document.getElementById('work-modal');
  var modalBody = document.getElementById('wm-body');
  var lastFocus = null;

  function syncLang() {
    /* After filling modal, re-apply language to new data-en elements */
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

  /* If user switches language while modal open, re-sync */
  document.querySelectorAll('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!modal.hidden) setTimeout(syncLang, 0);
    });
  });
  } /* end init */

  boot();
})();
