// Decap CMS preview — mirrors the live site exactly
// Uses the real site CSS so what you see = what visitors see.

CMS.registerPreviewStyle('/assets/style.css');

// Small overrides for the preview iframe context
CMS.registerPreviewStyle([
  'body { background: #0B0E12; padding: 28px 24px; }',
  '.only-de { display: inline !important }',
  '.only-en { display: none !important }',
  '.wm-text { white-space: pre-wrap }',
  '.wm-body { max-width: 720px }',
  'h2 { margin-top: 0 }'
].join(' '), { raw: true });

(function () {

  function imgPath(src, getAsset) {
    if (!src) return 'assets/og-cover.jpg';
    try { var a = getAsset(src); if (a) return a.toString(); } catch (e) {}
    return src;
  }

  function bi(de, en) {
    return '<span class="only-de">' + (de || '') + '</span><span class="only-en">' + (en || de || '') + '</span>';
  }

  function arClass(ar) {
    if (!ar || ar === '16:9') return '';
    return ' wm-ar-' + ar.replace(':', '-');
  }
  function wClass(w) {
    if (!w || w === 'full') return '';
    return ' wm-w-' + w;
  }

  function buildHTML(d, getAsset) {
    var title_de   = d.get('title_de')   || '';
    var title_en   = d.get('title_en')   || '';
    var summary_de = d.get('summary_de') || '';
    var summary_en = d.get('summary_en') || '';
    var body_de    = d.get('body_de')    || '';
    var body_en    = d.get('body_en')    || '';
    var cover      = d.get('cover')      || '';
    var video      = d.get('video')      || '';
    var chips      = d.get('chips');
    var gallery    = d.get('gallery');
    var tracks     = d.get('tracks');
    var link_url   = d.get('link_url')   || '';
    var link_label = d.get('link_label') || link_url;
    var ar         = d.get('aspect_ratio') || '16:9';
    var mw         = d.get('media_width')  || 'full';
    var coverSrc   = imgPath(cover, getAsset);
    var extra      = arClass(ar) + wClass(mw);

    var html = '';

    // Header
    html += '<p class="tc">' + bi(title_de, title_en) + '</p>';
    html += '<h2>' + bi(title_de, title_en) + '</h2>';

    // Video or cover image
    if (video) {
      var cls = 'wm-video' + extra;
      if (/\.mp4($|\?)/i.test(video) || video.indexOf('http') !== 0 || video.indexOf('/') === 0) {
        html += '<div class="' + cls + '"><video controls preload="metadata"' +
          (coverSrc ? ' poster="' + coverSrc + '"' : '') + ' src="' + video + '"></video></div>';
      } else {
        html += '<div class="' + cls + '"><iframe src="' + video +
          '" title="Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
      }
    } else if (cover) {
      html += '<div class="wm-cover' + extra + '"><img src="' + coverSrc + '" alt=""></div>';
    }

    // Summary
    if (summary_de || summary_en) html += '<p class="lead">' + bi(summary_de, summary_en) + '</p>';

    // Body text
    if (body_de || body_en) html += '<div class="wm-text">' + bi(body_de, body_en) + '</div>';

    // Chips
    if (chips && chips.size) {
      html += '<div class="chips">';
      chips.forEach(function (c) { html += '<span class="chip">' + (c || '') + '</span>'; });
      html += '</div>';
    }

    // Gallery
    if (gallery && gallery.size) {
      html += '<div class="wm-gallery">';
      gallery.forEach(function (g) {
        var gSrc, gAr, gSz;
        if (typeof g === 'string') {
          gSrc = imgPath(g, getAsset); gAr = 'auto'; gSz = '1';
        } else if (g && g.get) {
          gSrc = imgPath(g.get('image') || '', getAsset);
          gAr  = g.get('aspect_ratio') || 'auto';
          gSz  = g.get('size') || '1';
        }
        if (!gSrc) return;
        html += '<div class="wm-gi" data-ar="' + gAr + '" data-size="' + gSz + '">';
        html += '<img src="' + gSrc + '" alt="" loading="lazy">';
        html += '</div>';
      });
      html += '</div>';
    }

    // Link
    if (link_url) {
      html += '<div class="btn-row"><a class="btn btn-primary" href="' + link_url +
        '" target="_blank" rel="noopener">' + (link_label || link_url) + '</a></div>';
    }

    // Tracks / pipeline
    if (tracks && tracks.size) {
      html += '<div class="pipeline wm-pipeline">';
      tracks.forEach(function (tr) {
        if (!tr || !tr.get) return;
        var trChips = tr.get('chips');
        var txtDe = tr.get('text_de') || '';
        var txtEn = tr.get('text_en') || '';
        html += '<div class="track">';
        html += '<p class="t-id">' + (tr.get('id') || '') + '</p>';
        html += '<h3>' + bi(tr.get('title_de') || '', tr.get('title_en') || '') + '</h3>';
        if (txtDe || txtEn) html += '<p>' + bi(txtDe, txtEn) + '</p>';
        if (trChips && trChips.size) {
          html += '<div class="chips">';
          trChips.forEach(function (c) { html += '<span class="chip">' + (c || '') + '</span>'; });
          html += '</div>';
        }
        html += '</div>';
      });
      html += '</div>';
    }

    return html;
  }

  var ProjectPreview = createClass({
    render: function () {
      var d  = this.props.entry.get('data');
      var ga = this.props.getAsset;
      return h('div', { className: 'wm-body', dangerouslySetInnerHTML: { __html: buildHTML(d, ga) } });
    }
  });

  ['ai', 'motion', 'brand', 'football'].forEach(function (col) {
    CMS.registerPreviewTemplate(col, ProjectPreview);
  });
})();
