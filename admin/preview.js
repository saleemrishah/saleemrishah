// Decap CMS preview templates — project collections
// Loaded after decap-cms.js, before CMS.init()
(function () {
  var h = window.h;

  function assetSrc(getAsset, path) {
    if (!path) return '';
    if (path.indexOf('http') === 0) return path;
    try { var a = getAsset(path); return a ? a.toString() : path; } catch (e) { return path; }
  }

  function arStyle(ar) {
    if (!ar || ar === '16:9') return { aspectRatio: '16/9' };
    if (ar === '9:16') return { aspectRatio: '9/16', maxWidth: '360px' };
    if (ar === '4:3')  return { aspectRatio: '4/3' };
    if (ar === '1:1')  return { aspectRatio: '1/1' };
    return {};
  }

  function wStyle(w) {
    if (!w || w === 'full') return {};
    var m = { small: '380px', medium: '560px', large: '760px' };
    return m[w] ? { maxWidth: m[w] } : {};
  }

  var ProjectPreview = createClass({
    render: function () {
      var entry    = this.props.entry;
      var getAsset = this.props.getAsset;
      var data     = entry.get('data');

      var title_de   = data.get('title_de')   || '';
      var title_en   = data.get('title_en')   || '';
      var summary_de = data.get('summary_de') || '';
      var cover      = data.get('cover')      || '';
      var video      = data.get('video')      || '';
      var chips      = data.get('chips');
      var ar         = data.get('aspect_ratio') || '16:9';
      var mw         = data.get('media_width');

      var coverSrc = assetSrc(getAsset, cover);
      var mediaStyle = Object.assign(
        { borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2d33', marginBottom: '20px', background: '#000' },
        arStyle(ar), wStyle(mw)
      );

      var mediaEl = null;
      if (video) {
        mediaEl = h('div', { style: Object.assign({ position: 'relative' }, mediaStyle) },
          h('iframe', {
            src: video, frameBorder: '0',
            style: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }
          })
        );
      } else if (coverSrc) {
        var imgStyle = ar !== 'auto'
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
          : { width: '100%', display: 'block' };
        var wrapStyle = ar !== 'auto'
          ? Object.assign({ position: 'relative' }, mediaStyle)
          : Object.assign({ borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }, wStyle(mw));
        mediaEl = h('div', { style: wrapStyle }, h('img', { src: coverSrc, style: imgStyle }));
      }

      var chipEls = null;
      if (chips && chips.size) {
        chipEls = h('div', { style: { marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
          chips.map(function (c, i) {
            return h('span', { key: i, style: {
              background: 'rgba(70,213,194,0.12)', color: '#46D5C2',
              border: '1px solid rgba(70,213,194,0.25)', borderRadius: '20px',
              padding: '4px 12px', fontSize: '0.8em'
            }}, c);
          }).toArray()
        );
      }

      return h('div', { style: {
        background: '#0B0E12', color: '#E8EAF0', padding: '32px 28px',
        fontFamily: 'system-ui, sans-serif', minHeight: '100vh', boxSizing: 'border-box'
      }},
        mediaEl,
        h('h2', { style: { color: '#fff', margin: '0 0 6px', fontSize: '1.4rem' } }, title_de),
        title_en && h('p', { style: { color: '#8892a0', margin: '0 0 12px', fontSize: '0.88em' } }, title_en),
        h('p', { style: { color: '#a8b0bc', lineHeight: 1.7, margin: 0 } }, summary_de),
        chipEls
      );
    }
  });

  ['ai', 'motion', 'brand', 'football'].forEach(function (col) {
    CMS.registerPreviewTemplate(col, ProjectPreview);
  });
})();
