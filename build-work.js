#!/usr/bin/env node
/* ============================================================
   build-work.js — يجمع ملفات مجلدات content في ملف واحد
   data/work.json يقرأه الموقع. Netlify يشغّله تلقائياً عند كل
   نشر (build command)، فما بتحتاج تشغّله يدوياً.
   ------------------------------------------------------------
   تشغيل يدوي (اختياري، للتجربة محلياً): node build-work.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');
const OUT_DIR = path.join(ROOT, 'data');
const OUT = path.join(OUT_DIR, 'work.json');

/* بيانات الأقسام الثابتة (العناوين والمقدمات).
   لو لقينا content/sections.json منستخدمه، وإلا منستخدم هاد. */
const SECTION_META = {
  ai: {
    eyebrow_de: "01 · KI & Generative", eyebrow_en: "01 · AI & Generative",
    title_de: "KI & Generative Produktion", title_en: "AI & Generative Production",
    intro_de: "Markenfiguren und visuelle Konzepte der nächsten Generation, gebaut mit KI-Pipelines und Prompt Engineering.",
    intro_en: "Next-generation brand characters and visual concepts, built with AI pipelines and prompt engineering."
  },
  motion: {
    eyebrow_de: "02 · Motion & Video", eyebrow_en: "02 · Motion & Video",
    title_de: "Motion & Videoproduktion", title_en: "Motion & Video Production",
    intro_de: "Strategisches Visual Storytelling, vom Schnitt über Motion Graphics bis zum Color Grading, gebaut für Aufmerksamkeit und Reichweite.",
    intro_en: "Strategic visual storytelling, from edit through motion graphics to color grading, built for attention and reach."
  },
  brand: {
    eyebrow_de: "03 · Brand & Social", eyebrow_en: "03 · Brand & Social",
    title_de: "Social Media & Brand Identity", title_en: "Social Media & Brand Identity",
    intro_de: "Markenidentitäten, Logos und maßgeschneiderte visuelle Systeme für Social-Media-Kanäle, von Start-ups bis Content Creators.",
    intro_en: "Brand identities, logos and tailored visual systems for social media channels, from start-ups to content creators."
  },
  football: {
    eyebrow_de: "04 · <span class='amber'>Proof</span> · Reichweite", eyebrow_en: "04 · <span class='amber'>Proof</span> · Reach",
    title_de: "Arabische Fußball-Kanäle", title_en: "Arabic Football Channels",
    intro_de: "Seit Jahren produziere ich arabischsprachigen Fußball-Content in dokumentarischer Qualität: Skript, Schnitt, Thumbnails, Animationen und Publishing, alles aus einer Hand. Mein laufender Praxisbeweis für Full-Stack-Produktion mit Millionenreichweite.",
    intro_en: "For years I have produced Arabic-language football content in documentary quality: script, edit, thumbnails, animations and publishing, all from one pair of hands. My ongoing real-world proof of full-stack production with reach in the millions."
  }
};

const ORDER = ['ai', 'motion', 'brand', 'football'];

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.warn('skip (invalid JSON):', p, e.message); return null; }
}

/* حقول CMS المسطّحة → الشكل اللي بيفهمه work.js */
function shape(raw, slug) {
  const it = { id: slug };
  it.title = { de: raw.title_de || '', en: raw.title_en || raw.title_de || '' };
  it.summary = { de: raw.summary_de || '', en: raw.summary_en || raw.summary_de || '' };
  it.cover = raw.cover || '';
  it.chips = Array.isArray(raw.chips) ? raw.chips : [];
  if (raw.body_de || raw.body_en) it.body = { de: raw.body_de || '', en: raw.body_en || raw.body_de || '' };
  if (raw.video) it.video = raw.video;
  if (Array.isArray(raw.gallery) && raw.gallery.length) {
    /* الـ CMS قد يحفظ الجاليري كقائمة كائنات {image:..} أو نصوص */
    it.gallery = raw.gallery.map(g => (typeof g === 'string' ? g : (g && g.image) || '')).filter(Boolean);
  }
  if (raw.link_url) it.link = { url: raw.link_url, label_de: raw.link_label || raw.link_url, label_en: raw.link_label || raw.link_url };
  if (Array.isArray(raw.tracks) && raw.tracks.length) {
    it.tracks = raw.tracks.map(t => ({
      id: t.id || '',
      title: { de: t.title_de || '', en: t.title_en || t.title_de || '' },
      text: { de: t.text_de || '', en: t.text_en || t.text_de || '' },
      chips: Array.isArray(t.chips) ? t.chips : []
    }));
  }
  it._order = typeof raw.order === 'number' ? raw.order : 999;
  return it;
}

const sections = [];
ORDER.forEach(secId => {
  const dir = path.join(CONTENT, secId);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const items = [];
  files.forEach(f => {
    const raw = readJSON(path.join(dir, f));
    if (!raw) return;
    const slug = f.replace(/\.json$/, '');
    items.push(shape(raw, slug));
  });
  items.sort((a, b) => a._order - b._order);
  items.forEach(i => { delete i._order; });
  if (!items.length) return;
  const meta = SECTION_META[secId] || {};
  sections.push({
    id: secId,
    eyebrow: { de: meta.eyebrow_de || '', en: meta.eyebrow_en || '' },
    title: { de: meta.title_de || '', en: meta.title_en || '' },
    intro: { de: meta.intro_de || '', en: meta.intro_en || '' },
    items: items
  });
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ sections }, null, 2));
var totalItems = sections.reduce(function (n, s) { return n + s.items.length; }, 0);
console.log('build-work: wrote ' + OUT + ' with ' + sections.length + ' sections, ' + totalItems + ' items');
