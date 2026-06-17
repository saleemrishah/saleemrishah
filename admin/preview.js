// Decap CMS preview templates — full project modal preview
// Loaded after decap-cms.js, before CMS.init()
(function () {
  var h = window.h;

  var S = {
    wrap:    { background:'#0B0E12', color:'#E8EAF0', padding:'32px 28px', fontFamily:'system-ui,sans-serif', minHeight:'100vh', boxSizing:'border-box' },
    h2:      { color:'#fff', margin:'0 0 4px', fontSize:'1.35rem', lineHeight:1.25 },
    sub:     { color:'#6b7585', margin:'0 0 18px', fontSize:'0.85em' },
    lead:    { color:'#b8c0cc', lineHeight:1.7, margin:'0 0 18px' },
    body:    { color:'#a0a8b4', lineHeight:1.75, whiteSpace:'pre-wrap', margin:'0 0 18px', fontSize:'0.93rem' },
    chips:   { display:'flex', flexWrap:'wrap', gap:'7px', margin:'0 0 20px' },
    chip:    { background:'rgba(70,213,194,0.1)', color:'#46D5C2', border:'1px solid rgba(70,213,194,0.22)', borderRadius:'20px', padding:'3px 11px', fontSize:'0.78em' },
    divider: { border:'none', borderTop:'1px solid #1e2128', margin:'20px 0' },
    gallery: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'10px', margin:'0 0 20px' },
    gimg:    { width:'100%', borderRadius:'8px', border:'1px solid #1e2128', objectFit:'cover', aspectRatio:'4/3', display:'block' },
    trackId: { color:'#46D5C2', fontSize:'0.72em', letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 4px' },
    trackH:  { color:'#fff', fontSize:'1rem', margin:'0 0 6px' },
    trackP:  { color:'#9098a4', fontSize:'0.88rem', lineHeight:1.6, margin:'0 0 8px' },
    track:   { background:'#12151a', border:'1px solid #1e2128', borderRadius:'10px', padding:'16px', marginBottom:'10px' },
    btn:     { display:'inline-block', background:'transparent', color:'#46D5C2', border:'1px solid #46D5C2', borderRadius:'8px', padding:'9px 20px', textDecoration:'none', fontSize:'0.9rem', marginTop:'4px' },
    label:   { color:'#46D5C2', fontSize:'0.7em', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', display:'block', marginBottom:'14px' }
  };

  function assetSrc(getAsset, path) {
    if (!path) return '';
    if (path.indexOf('http') === 0) return path;
    try { var a = getAsset(path); return a ? a.toString() : path; } catch (e) { return path; }
  }

  function mediaBoxStyle(ar, mw) {
    var base = { position:'relative', borderRadius:'12px', overflow:'hidden', border:'1px solid #1e2128', marginBottom:'22px', background:'#000' };
    if (ar === '9:16') { base.aspectRatio = '9/16'; base.maxWidth = '340px'; }
    else if (ar === '4:3') { base.aspectRatio = '4/3'; }
    else if (ar === '1:1') { base.aspectRatio = '1/1'; }
    else if (ar !== 'auto') { base.aspectRatio = '16/9'; }
    if (mw === 'small')  base.maxWidth = '380px';
    if (mw === 'medium') base.maxWidth = '560px';
    if (mw === 'large')  base.maxWidth = '760px';
    return base;
  }

  var ProjectPreview = createClass({
    render: function () {
      var entry    = this.props.entry;
      var getAsset = this.props.getAsset;
      var d        = entry.get('data');

      var title_de   = d.get('title_de')   || '';
      var title_en   = d.get('title_en')   || '';
      var summary_de = d.get('summary_de') || '';
      var body_de    = d.get('body_de')    || '';
      var cover      = d.get('cover')      || '';
      var video      = d.get('video')      || '';
      var chips      = d.get('chips');
      var gallery    = d.get('gallery');
      var tracks     = d.get('tracks');
      var link_url   = d.get('link_url')   || '';
      var link_label = d.get('link_label') || link_url;
      var ar         = d.get('aspect_ratio') || '16:9';
      var mw         = d.get('media_width')  || 'full';

      var coverSrc  = assetSrc(getAsset, cover);
      var boxStyle  = mediaBoxStyle(ar, mw);
      var fillStyle = { position:'absolute', inset:0, width:'100%', height:'100%', border:0, objectFit:'cover' };
      var autoStyle = { width:'100%', display:'block' };

      // --- Media (video or cover) ---
      var mediaEl = null;
      if (video) {
        mediaEl = h('div', { style: boxStyle },
          h('iframe', { src: video, frameBorder:'0', allowFullScreen:true, style: fillStyle })
        );
      } else if (coverSrc) {
        var wrapS = ar === 'auto'
          ? { borderRadius:'12px', overflow:'hidden', marginBottom:'22px', maxWidth: mw === 'full' ? '100%' : boxStyle.maxWidth }
          : boxStyle;
        mediaEl = h('div', { style: wrapS },
          h('img', { src: coverSrc, style: ar === 'auto' ? autoStyle : fillStyle })
        );
      }

      // --- Chips ---
      var chipsEl = (chips && chips.size)
        ? h('div', { style: S.chips }, chips.map(function(c,i){ return h('span',{key:i,style:S.chip},c); }).toArray())
        : null;

      // --- Body text ---
      var bodyEl = body_de ? h('div', { style: S.body }, body_de) : null;

      // --- Gallery ---
      var galleryEl = null;
      if (gallery && gallery.size) {
        var imgs = gallery.map(function(g, i) {
          var src = assetSrc(getAsset, typeof g === 'string' ? g : (g && g.get ? g.get('image') : ''));
          return src ? h('img', { key:i, src:src, style:S.gimg }) : null;
        }).toArray().filter(Boolean);
        if (imgs.length) galleryEl = h('div', { style: S.gallery }, imgs);
      }

      // --- Tracks ---
      var tracksEl = null;
      if (tracks && tracks.size) {
        var tEls = tracks.map(function(t, i) {
          var tChips = t.get ? t.get('chips') : null;
          return h('div', { key:i, style: S.track },
            h('p', { style: S.trackId }, t.get ? t.get('id') : ''),
            h('h3', { style: S.trackH }, t.get ? (t.get('title_de') || '') : ''),
            (t.get && t.get('text_de')) ? h('p', { style: S.trackP }, t.get('text_de')) : null,
            (tChips && tChips.size) ? h('div', { style: S.chips },
              tChips.map(function(c,j){ return h('span',{key:j,style:S.chip},c); }).toArray()
            ) : null
          );
        }).toArray();
        tracksEl = h('div', null, h('hr', {style:S.divider}), h('span', {style:S.label}, 'Pipeline'), h('div',null,tEls));
      }

      // --- Link ---
      var linkEl = link_url
        ? h('div', { style:{marginTop:'18px'} }, h('a', { href:link_url, style:S.btn }, link_label || link_url))
        : null;

      return h('div', { style: S.wrap },
        mediaEl,
        h('h2', { style: S.h2 }, title_de),
        title_en ? h('p', { style: S.sub }, title_en) : null,
        h('p', { style: S.lead }, summary_de),
        chipsEl,
        bodyEl,
        galleryEl,
        tracksEl,
        linkEl
      );
    }
  });

  ['ai', 'motion', 'brand', 'football'].forEach(function (col) {
    CMS.registerPreviewTemplate(col, ProjectPreview);
  });
})();
