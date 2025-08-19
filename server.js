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
function simulateEngineAnswer(engine, prompt, name) {
  // Create more balanced results - mix of appearing and not appearing
  const shouldAppear = Math.random() > 0.35; // 65% chance of appearing
  
  const competitors = ['McKinsey Digital', 'Accenture AI', 'Jane Doe', 'TechCorp Solutions'];
  const randomCompetitors = competitors.sort(() => 0.5 - Math.random()).slice(0, 2);
  
  // Simulate imposters (fake accounts using similar names)
  const potentialImposters = [
    `${name} Consulting`, 
    `Dr. ${name}`, 
    `${name.split(' ')[0]} ${name.split(' ')[1]} AI`,
    `The Real ${name}`
  ];
  
  const hasImposters = Math.random() > 0.7; // 30% chance of imposters appearing
  const imposters = hasImposters ? potentialImposters.slice(0, Math.floor(Math.random() * 2) + 1) : [];
  
  if (shouldAppear) {
    // User appears - determine position (authority)
    const position = Math.random() > 0.6 ? 1 : Math.random() > 0.3 ? 2 : 3;
    
    // Create full result list with user, competitors, and imposters
    let allMentions = [name, ...randomCompetitors, ...imposters];
    
    // Shuffle but ensure user is at determined position
    allMentions = allMentions.filter(mention => mention !== name);
    allMentions.splice(position - 1, 0, name);
    
    return { 
      names: allMentions.slice(0, 4), 
      sources: [`${engine}.com`, 'industry-report.pdf'],
      userPosition: position,
      imposters: imposters,
      authority: position <= 2 ? 'high' : position === 3 ? 'medium' : 'low'
    };
  } else {
    // User doesn't appear, but competitors and imposters might
    const mentions = [...randomCompetitors, ...imposters].slice(0, 3);
    
    return { 
      names: mentions, 
      sources: [`${engine}.com`],
      userPosition: null,
      imposters: imposters,
      authority: null
    };
  }
}

// Calculate sophisticated Trust Factor
function calculateTrustFactor(matrix, name) {
  const totalQueries = matrix.length;
  const appearances = matrix.filter(r => r.youAppear);
  const appearanceCount = appearances.length;
  
  // 1. Visibility Score (40%)
  const visibilityScore = (appearanceCount / totalQueries) * 100;
  
  // 2. Authority Score (25%) - based on position when appearing
  let authorityScore = 0;
  if (appearanceCount > 0) {
    const avgPosition = appearances.reduce((sum, r) => {
      return sum + (r.userPosition || 4);
    }, 0) / appearanceCount;
    
    // Convert position to score (position 1 = 100, position 2 = 80, position 3 = 60, position 4+ = 40)
    authorityScore = Math.max(0, (5 - avgPosition) / 4 * 100);
  }
  
  // 3. Consistency Score (20%) - performance across engines
  const engines = [...new Set(matrix.map(r => r.engine))];
  let consistencyScore = 0;
  if (engines.length > 0) {
    const enginePerformance = engines.map(engine => {
      const engineResults = matrix.filter(r => r.engine === engine);
      const engineAppearances = engineResults.filter(r => r.youAppear).length;
      return (engineAppearances / engineResults.length) * 100;
    });
    
    // Consistency is measured by how close all engines perform to each other
    const avgPerformance = enginePerformance.reduce((a, b) => a + b, 0) / enginePerformance.length;
    const variance = enginePerformance.reduce((sum, perf) => sum + Math.pow(perf - avgPerformance, 2), 0) / enginePerformance.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    consistencyScore = Math.max(0, 100 - (standardDeviation * 2));
  }
  
  // 4. Competitive Context (15%) - how you perform vs competitors
  let competitiveScore = 70; // Default moderate score
  if (appearanceCount > 0) {
    const userMentions = appearanceCount;
    const competitorMentions = matrix.reduce((sum, result) => {
      const competitors = (result.mentioned || []).filter(mention => 
        mention.toLowerCase() !== name.toLowerCase() && 
        !result.imposters.some(imp => imp.toLowerCase() === mention.toLowerCase())
      );
      return sum + competitors.length;
    }, 0);
    
    if (competitorMentions > 0) {
      const marketShare = userMentions / (userMentions + competitorMentions) * 100;
      competitiveScore = Math.min(100, marketShare * 1.5); // Boost market share for competitive score
    }
  }
  
  // 5. Imposter Impact (Penalty)
  const totalImposters = matrix.reduce((sum, result) => sum + (result.imposters?.length || 0), 0);
  const imposterPenalty = Math.min(15, totalImposters * 2); // Max 15 point penalty
  
  // Calculate weighted Trust Factor
  const trustFactor = Math.round(
    (visibilityScore * 0.40) + 
    (authorityScore * 0.25) + 
    (consistencyScore * 0.20) + 
    (competitiveScore * 0.15) - 
    imposterPenalty
  );
  
  return {
    trustFactor: Math.max(0, Math.min(100, trustFactor)),
    breakdown: {
      visibility: Math.round(visibilityScore),
      authority: Math.round(authorityScore), 
      consistency: Math.round(consistencyScore),
      competitive: Math.round(competitiveScore),
      imposterPenalty: Math.round(imposterPenalty),
      totalImposters: totalImposters
    },
    rawScores: {
      visibilityWeight: Math.round(visibilityScore * 0.40),
      authorityWeight: Math.round(authorityScore * 0.25),
      consistencyWeight: Math.round(consistencyScore * 0.20),
      competitiveWeight: Math.round(competitiveScore * 0.15)
    }
  };
}

// ——— Routes ———

// POST /api/scan  { name, keywords[], competitors[], engines[] }
app.post('/api/scan', async (req, res) => {
  const { name, keywords = [], competitors = [], engines = ['perplexity','chatgpt','gemini','google-ai'] } = req.body;
  const prompts = DEFAULT_PROMPTS(keywords);

  const matrix = [];
  for (const engine of engines) {
    for (const prompt of prompts) {
      // Replace with engine-specific modules (perplexity/openai/gemini)
      const ans = simulateEngineAnswer(engine, prompt, name);
      const mentioned = ans.names || [];
      const youAppear = mentioned.map(s => s.toLowerCase()).includes((name||'').toLowerCase());
      matrix.push({
        engine, prompt, youAppear,
        mentioned,
        sources: ans.sources || [],
        userPosition: ans.userPosition,
        imposters: ans.imposters || [],
        authority: ans.authority
      });
    }
  }

  const gaps = matrix.filter(r => !r.youAppear).map(r => ({ engine: r.engine, prompt: r.prompt }));
  const trustFactorData = calculateTrustFactor(matrix, name);

  res.json({ 
    matrix, 
    gaps, 
    trustFactor: trustFactorData.trustFactor,
    trustBreakdown: trustFactorData.breakdown,
    trustWeights: trustFactorData.rawScores
  });
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
