/* ============================================================
   Saleem Rishah — Work data (offline fallback only)
   ------------------------------------------------------------
   The live site reads content/ directly (see work.js). This file
   is only a minimal fallback used when content/ cannot be fetched
   (for example opening the HTML file locally without a server).
   The real, up-to-date content lives in content/ and is edited
   through the CMS at /admin/.
   ============================================================ */
window.WORK_DATA = {
  sections: [
    {
      id: "ai",
      eyebrow: { de: "01 · KI &amp; Generative", en: "01 · AI &amp; Generative" },
      title:   { de: "KI &amp; Generative Produktion", en: "AI &amp; Generative Production" },
      intro:   {
        de: "Markenfiguren und visuelle Konzepte der nächsten Generation, gebaut mit KI-Pipelines und Prompt Engineering.",
        en: "Next-generation brand characters and visual concepts, built with AI pipelines and prompt engineering."
      },
      items: [
        {
          id: "julia-kallas",
          title:   { de: "Julia Kallas — KI-Persona", en: "Julia Kallas — AI Persona" },
          summary: {
            de: "Eine vollständig KI-produzierte Persona mit eigenem Podcast-Format auf Instagram.",
            en: "A fully AI-produced persona with her own podcast format on Instagram."
          },
          cover: "julia.jpg",
          chips: ["ComfyUI", "Nano Banana", "Kling AI", "ElevenLabs"]
        }
      ]
    }
  ]
};
