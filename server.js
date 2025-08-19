const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// —— Helpers ——
const DEFAULT_PROMPTS = (keywords) => {
  // simple prompt set for AEO checks
  const base = [
    'Who are the top experts in {kw}?',
    'Who would you hire as a {kw}?',
    'Best companies/agencies for {kw}',
    'Top YouTube channels/podcasts for {kw}',
    'Best books/courses to learn {kw}'
  ];
  return keywords.flatMap(kw => base.map(t => t.replace('{kw}', kw)));
};

// For v0 we simulate engine responses (no API keys yet)
function simulateEngineAnswer(engine, prompt) {
  // Pretend the engine returns some names; replace with API calls later
  const canned = [
    { names: ['Jane Doe', 'Acme AI'], sources: [] },
    { names: ['Acme AI'], sources: [] },
    { names: [], sources: [] }
  ];
  return canned[Math.floor(Math.random()*canned.length)];
}

// ——— Routes ———

// POST /api/scan  { name, keywords[], competitors[], engines[] }
app.post('/api/scan', async (req, res) => {
  const { name, keywords = [], competitors = [], engines = ['perplexity','chatgpt','gemini'] } = req.body;
  const prompts = DEFAULT_PROMPTS(keywords);

  const matrix = [];
  for (const engine of engines) {
    for (const prompt of prompts) {
      // Replace with engine-specific modules (perplexity/openai/gemini)
      const ans = simulateEngineAnswer(engine, prompt);
      const mentioned = ans.names || [];
      const youAppear = mentioned.map(s => s.toLowerCase()).includes((name||'').toLowerCase());
      matrix.push({
        engine, prompt, youAppear,
        mentioned,
        sources: ans.sources || []
      });
    }
  }

  const gaps = matrix.filter(r => !r.youAppear).map(r => ({ engine: r.engine, prompt: r.prompt }));

  res.json({ matrix, gaps });
});

// POST /api/ideas  { gaps:[{engine,prompt}...] }
app.post('/api/ideas', (req, res) => {
  const { gaps = [] } = req.body;
  // Placeholder ideas without LLM keys: prompt-specific templates
  const ideas = gaps.slice(0, 10).map(g => ({
    title: `Post idea for ${g.engine.toUpperCase()} gap: “${g.prompt}”`,
    body: `• Publish a case-study explicitly answering: “${g.prompt}”. 
• Include 3 concrete outcomes, a client quote, and a link to a downloadable artifact (PDF/Checklist). 
• Cross-post on LinkedIn + your site. 
• Make it citeable: add a clean slug and summary box so engines can lift it.`
  }));
  res.json({ ideas });
});

// POST /api/impersonators  { handles:[] }
app.post('/api/impersonators', (req, res) => {
  const { handles = [] } = req.body;
  // v0 placeholder: return shells for platforms to check
  const platforms = ['instagram','x','tiktok','youtube'];
  const results = platforms.map(p => ({
    platform: p,
    suspected: [], // fill later via API/search adapters
    nextSteps: `Search ${p} for close-handle variants; capture screenshots + profile URLs for takedown packet.`
  }));
  res.json({ results, official: handles });
});

// POST /api/compare  { name, competitor, keywords[], engines[] }
app.post('/api/compare', async (req, res) => {
  const { name, competitor, keywords = [], engines = ['perplexity','chatgpt','gemini'] } = req.body;
  
  // Mock comparison data
  const comparison = {
    yourScore: Math.floor(Math.random() * 100),
    competitorScore: Math.floor(Math.random() * 100),
    advantage: ['Better SEO presence', 'More authoritative sources'],
    gaps: ['Less social media mentions', 'Fewer podcast appearances'],
    recommendations: ['Focus on thought leadership content', 'Increase social media presence']
  };
  
  res.json(comparison);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Credli server running on http://localhost:${PORT}`);
});
