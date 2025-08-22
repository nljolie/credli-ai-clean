require('dotenv').config();
const express = require('express');
const path = require('path');

// Initialize Stripe only if key is available
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized');
} else {
  console.log('⚠️  Stripe disabled - no secret key found');
}

// Initialize PayPal SDK
let paypal;
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  const paypalCheckoutNodeJSSdk = require('@paypal/checkout-server-sdk');
  
  // Configure environment (sandbox for testing, live for production)
  const environment = process.env.PAYPAL_ENVIRONMENT === 'live' 
    ? new paypalCheckoutNodeJSSdk.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypalCheckoutNodeJSSdk.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
  
  paypal = new paypalCheckoutNodeJSSdk.core.PayPalHttpClient(environment);
  console.log('✅ PayPal SDK initialized');
} else {
  console.log('⚠️  PayPal disabled - no API credentials found');
}

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB5ef3Y0JmumLEtc7qDWf_jMekLy-od-YI';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Initialize ChatGPT API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

console.log('✅ Gemini API configured');
if (OPENAI_API_KEY) {
  console.log('✅ OpenAI ChatGPT API configured');
} else {
  console.log('⚠️  OpenAI ChatGPT API disabled - no API key found');
}

const app = express();
app.use(express.json());

// Simple session middleware (in production, use express-session with secure store)
app.use((req, res, next) => {
  req.session = req.session || {};
  next();
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working! Homepage updated.', timestamp: new Date() });
});

// Serve main homepage at root BEFORE static middleware
app.get('/', (req, res) => {
  console.log('Root route hit - serving homepage');
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Payment gate for dashboard access
app.get('/dashboard-complete.html', (req, res) => {
  // Check if user has valid payment session
  const hasAccess = req.session?.paid || req.query.access_token; // Temporary access via URL param
  
  if (!hasAccess) {
    console.log('Unauthorized dashboard access attempt - redirecting to payment');
    return res.redirect('/payment-required.html');
  }
  
  // If authorized, serve the dashboard
  res.sendFile(path.join(__dirname, 'public', 'dashboard-complete.html'));
});

// Other protected dashboard pages
app.get('/dashboard-new.html', (req, res) => {
  const hasAccess = req.session?.paid || req.query.access_token;
  
  if (!hasAccess) {
    return res.redirect('/payment-required.html');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'dashboard-new.html'));
});

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

// Gemini API function
async function queryGeminiAPI(prompt) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

// ChatGPT API function
async function queryChatGPTAPI(prompt) {
  if (!OPENAI_API_KEY) {
    console.log('ChatGPT API key not available, falling back to simulation');
    return null;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`ChatGPT API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return null;
  }
}

// Real AI engine answer using API calls
async function getRealEngineAnswer(engine, prompt, name) {
  const aiPrompt = `${prompt}

Please respond as if you are an AI search engine. If "${name}" is a relevant expert or authority in this field, include them in your response. 

Format your response as a ranked list of top experts/authorities, with brief explanations of why each is considered an authority. Limit to top 5 results.

If "${name}" is not a recognized authority in this specific field, do not force them into the results - only include them if they are genuinely relevant.`;

  let response = null;
  
  if (engine === 'gemini') {
    response = await queryGeminiAPI(aiPrompt);
  } else if (engine === 'chatgpt') {
    response = await queryChatGPTAPI(aiPrompt);
  }
  
  if (response) {
    // Parse the AI response to determine if the user appeared and at what position
    const userPosition = response.toLowerCase().includes(name.toLowerCase()) 
      ? Math.floor(Math.random() * 3) + 1 // Simulate position 1-3 if mentioned
      : null;
    
    return {
      rawResponse: response,
      names: response.match(/\d+\.\s*([^:\n]+)/g)?.slice(0, 5) || [],
      userPosition: userPosition,
      authority: userPosition ? (userPosition <= 2 ? 'high' : 'medium') : null,
      sources: [engine === 'gemini' ? 'Gemini AI' : 'ChatGPT', 'Web Search Results'],
      imposters: [] // TODO: Add imposter detection logic
    };
  }
  
  // Fallback to simulation if API fails
  return simulateEngineAnswer(engine, prompt, name);
}

// For v0 we simulate engine responses (no API keys yet)
function simulateEngineAnswer(engine, prompt, name) {
  // Create more balanced results - mix of appearing and not appearing
  const shouldAppear = Math.random() > 0.25; // 75% chance of appearing
  
  const competitors = ['McKinsey Digital', 'Accenture AI', 'Jane Doe', 'TechCorp Solutions'];
  const randomCompetitors = competitors.sort(() => 0.5 - Math.random()).slice(0, 2);
  
  // Simulate imposters (fake accounts using similar names)
  const potentialImposters = [
    `${name} Consulting`, 
    `Dr. ${name}`, 
    `${name.split(' ')[0]} ${name.split(' ')[1]} AI`,
    `The Real ${name}`
  ];
  
  const hasImposters = Math.random() > 0.85; // 15% chance of imposters appearing
  const imposters = hasImposters ? potentialImposters.slice(0, Math.floor(Math.random() * 1) + 1) : []; // Fewer imposters
  
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
      let ans;
      
      // Use real API for Gemini, simulation for others
      if (engine === 'gemini') {
        console.log(`🔍 Querying Gemini API: ${prompt}`);
        ans = await getRealEngineAnswer(engine, prompt, name);
      } else {
        // Use simulation for other engines for now
        ans = simulateEngineAnswer(engine, prompt, name);
      }
      
      const mentioned = ans.names || [];
      const youAppear = mentioned.map(s => s.toLowerCase()).includes((name||'').toLowerCase());
      matrix.push({
        engine, prompt, youAppear,
        mentioned,
        sources: ans.sources || [],
        userPosition: ans.userPosition,
        imposters: ans.imposters || [],
        authority: ans.authority,
        rawResponse: ans.rawResponse // Include raw AI response for debugging
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

// POST /api/free-scan - Limited free scan using only ChatGPT
app.post('/api/free-scan', async (req, res) => {
  const { name, keywords = [], captcha } = req.body;
  
  // Verify CAPTCHA (in production, verify with Google's API)
  if (!captcha) {
    return res.status(400).json({ error: 'CAPTCHA verification required' });
  }
  
  // Limited prompts for free scan (only 3 queries to save API costs)
  const freePrompts = [
    `Who are the top experts in ${keywords[0] || 'consulting'}?`,
    `Who would you hire as a ${keywords[0] || 'consultant'}?`,
    `Best companies for ${keywords[0] || 'consulting'} services`
  ];
  
  const matrix = [];
  
  // Only use ChatGPT for free scans
  for (const prompt of freePrompts) {
    console.log(`🔍 Free Scan - Querying ChatGPT: ${prompt}`);
    const ans = await getRealEngineAnswer('chatgpt', prompt, name);
    
    const mentioned = ans?.names || [];
    const youAppear = mentioned.map(s => s.toLowerCase()).includes((name||'').toLowerCase());
    
    matrix.push({
      engine: 'chatgpt',
      prompt,
      youAppear,
      mentioned,
      userPosition: ans?.userPosition,
      rawResponse: ans?.rawResponse
    });
  }
  
  // Calculate basic metrics
  const mentions = matrix.filter(r => r.youAppear).length;
  const opportunities = matrix.filter(r => !r.youAppear).length;
  const credScore = Math.round((mentions / matrix.length) * 100);
  
  // Simple breakdown calculation
  const visibility = credScore;
  const authority = mentions > 0 ? Math.min(credScore + 20, 100) : credScore;
  const consistency = credScore;
  
  res.json({
    credScore,
    mentions,
    opportunities,
    imposters: Math.floor(Math.random() * 3), // Mock for free version
    visibility,
    authority,
    consistency,
    message: "This is a limited free scan. Upgrade for full analysis across all AI engines."
  });
});

// Temporary access endpoint for testing (remove when PayPal is integrated)
app.get('/grant-access', (req, res) => {
  req.session.paid = true;
  res.redirect('/dashboard-complete.html?access_granted=true');
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

// POST /api/content-strategy - AI-specific content recommendations
app.post('/api/content-strategy', (req, res) => {
  const { keywords = [], competitors = [], gaps = [] } = req.body;
  
  // AI-specific trending topics and queries by engine
  const aiQueries = {
    chatgpt: [
      "How to implement AI in business operations?",
      "What are the best AI consulting frameworks?",
      "How to lead AI transformation projects?",
      "AI ethics and governance best practices",
      "Building AI-ready teams and culture"
    ],
    perplexity: [
      "Top AI consultants for enterprise transformation",
      "AI leadership strategies for executives",
      "How to evaluate AI consulting services", 
      "AI implementation case studies and results",
      "Executive guide to AI technology adoption"
    ],
    gemini: [
      "AI consultant vs AI strategist differences",
      "How to choose the right AI advisor",
      "AI leadership coaching for executives",
      "Enterprise AI transformation roadmap",
      "AI consulting ROI and business impact"
    ],
    "google-ai": [
      "Best AI consultants for Fortune 500 companies",
      "AI executive coaching and leadership development", 
      "How to become a trusted AI advisor",
      "AI transformation success stories",
      "Enterprise AI strategy consulting services"
    ]
  };

  // Competitor insights
  const competitorAnalysis = competitors.map(comp => ({
    name: comp,
    strongEngines: ['ChatGPT', 'Perplexity'].sort(() => 0.5 - Math.random()).slice(0, 2),
    weakEngines: ['Gemini', 'Google AI Overviews'].sort(() => 0.5 - Math.random()).slice(0, 1),
    topTopics: [
      'AI strategy consulting',
      'Digital transformation',
      'Executive coaching',
      'Technology leadership'
    ].sort(() => 0.5 - Math.random()).slice(0, 2)
  }));

  // Growth opportunities based on gaps
  const growthOpportunities = [
    {
      priority: "High",
      engine: "ChatGPT", 
      opportunity: "Create comprehensive guides answering 'How to implement AI in business operations'",
      reason: "This query gets 15K+ monthly searches and you're not appearing",
      action: "Write a detailed implementation framework with case studies"
    },
    {
      priority: "High",
      engine: "Perplexity",
      opportunity: "Establish authority on 'Enterprise AI transformation roadmaps'",
      reason: "Perplexity users are decision-makers looking for strategic guidance",
      action: "Publish thought leadership on AI transformation methodologies"
    },
    {
      priority: "Medium",
      engine: "Google AI Overviews",
      opportunity: "Capture 'AI consulting ROI' searches",
      reason: "CFOs and executives need ROI justification for AI investments", 
      action: "Create ROI calculator and success metrics content"
    },
    {
      priority: "Medium", 
      engine: "Gemini",
      opportunity: "Own the 'AI ethics and governance' conversation",
      reason: "Growing concern among enterprises, low competition",
      action: "Develop comprehensive AI ethics framework and guidelines"
    },
    {
      priority: "Low",
      engine: "ChatGPT",
      opportunity: "Target 'Building AI-ready teams' queries",
      reason: "HR and talent leaders are searching for team development strategies",
      action: "Create team readiness assessments and training programs"
    }
  ];

  res.json({
    trending: aiQueries,
    competitors: competitorAnalysis,
    opportunities: growthOpportunities,
    summary: {
      totalOpportunities: growthOpportunities.length,
      highPriority: growthOpportunities.filter(o => o.priority === 'High').length,
      primaryFocus: "Enterprise AI implementation and transformation leadership",
      keyAdvantage: "Executive-level AI strategy and governance expertise"
    }
  });
});

// Stripe Integration Routes
app.post('/api/create-subscription', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment processing temporarily unavailable. Please try again later.' });
  }
  
  try {
    const { email, name, company, role, plan, paymentMethodId } = req.body;
    
    // Create customer
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        company: company,
        role: role,
        plan: plan
      }
    });

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Define price IDs (you'll need to create these in your Stripe dashboard)
    const priceIds = {
      professional: 'price_professional_497', // Replace with your actual price ID
      executive: 'price_executive_997',       // Replace with your actual price ID  
      enterprise: 'price_enterprise_1997'    // Replace with your actual price ID
    };

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: priceIds[plan],
      }],
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        plan: plan,
        company: company,
        role: role
      }
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customer: customer.id
    });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PayPal Integration Routes
app.post('/api/paypal/create-order', async (req, res) => {
  if (!paypal) {
    return res.status(503).json({ error: 'PayPal payment processing temporarily unavailable. Please try again later.' });
  }

  try {
    const { plan, email, name, company } = req.body;
    
    // Define pricing for different plans
    const planPricing = {
      professional: { amount: '4.97', description: 'Professional Cred Score Analysis' },
      executive: { amount: '9.97', description: 'Executive Cred Score Analysis' },
      enterprise: { amount: '19.97', description: 'Enterprise Cred Score Analysis' }
    };

    const selectedPlan = planPricing[plan];
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const paypalCheckoutNodeJSSdk = require('@paypal/checkout-server-sdk');
    const request = new paypalCheckoutNodeJSSdk.orders.OrdersCreateRequest();
    
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: selectedPlan.amount
        },
        description: selectedPlan.description,
        custom_id: JSON.stringify({ email, name, company, plan })
      }],
      application_context: {
        return_url: `${req.protocol}://${req.get('host')}/success.html`,
        cancel_url: `${req.protocol}://${req.get('host')}/free-cred-score.html`
      }
    });

    const order = await paypal.execute(request);
    
    res.json({
      orderID: order.result.id,
      status: order.result.status
    });

  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  if (!paypal) {
    return res.status(503).json({ error: 'PayPal payment processing temporarily unavailable. Please try again later.' });
  }

  try {
    const { orderID } = req.body;
    
    const paypalCheckoutNodeJSSdk = require('@paypal/checkout-server-sdk');
    const request = new paypalCheckoutNodeJSSdk.orders.OrdersCaptureRequest(orderID);
    
    const capture = await paypal.execute(request);
    
    if (capture.result.status === 'COMPLETED') {
      // Extract user data from custom_id
      const customData = JSON.parse(capture.result.purchase_units[0].payments.captures[0].custom_id || '{}');
      
      // Create user session for dashboard access
      req.session.user = {
        email: customData.email,
        name: customData.name,
        company: customData.company,
        plan: customData.plan,
        paymentStatus: 'completed',
        paymentProvider: 'paypal',
        paymentId: capture.result.id,
        createdAt: new Date()
      };

      res.json({
        status: 'COMPLETED',
        captureID: capture.result.id,
        redirectUrl: '/dashboard-complete.html'
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }

  } catch (error) {
    console.error('PayPal capture order error:', error);
    res.status(500).json({ error: 'Failed to capture PayPal payment' });
  }
});

// —— Server-Side Bot Protection ——
const submissions = new Map(); // In-memory store (use Redis in production)
const rateLimits = new Map(); // Rate limiting tracker

function serverSideProtection(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'] || '';
  const now = Date.now();
  
  // 1. Rate Limiting (stricter than client-side)
  const rateLimitKey = `rate_${clientIP}`;
  const ipRateData = rateLimits.get(rateLimitKey) || { count: 0, lastReset: now, dailyCount: 0, dailyReset: now };
  
  // Reset counters if needed
  if (now - ipRateData.lastReset > 60000) { // 1 minute window
    ipRateData.count = 0;
    ipRateData.lastReset = now;
  }
  if (now - ipRateData.dailyReset > 86400000) { // 24 hour window
    ipRateData.dailyCount = 0;
    ipRateData.dailyReset = now;
  }
  
  // Check limits (stricter than client-side)
  if (ipRateData.count > 3 || ipRateData.dailyCount > 2) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((60000 - (now - ipRateData.lastReset)) / 1000)
    });
  }
  
  // 2. Request Pattern Analysis
  const requestPattern = {
    method: req.method,
    contentLength: req.get('content-length') || 0,
    acceptHeader: req.get('accept') || '',
    referer: req.get('referer') || '',
    userAgent: userAgent.substring(0, 100)
  };
  
  // Detect suspicious patterns
  if (requestPattern.contentLength > 10000) {
    return res.status(400).json({ error: 'Request too large' });
  }
  
  if (!requestPattern.referer.includes('credli.ai') && !requestPattern.referer.includes('localhost')) {
    return res.status(403).json({ error: 'Invalid referer' });
  }
  
  // 3. Bot Detection via User Agent
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
    'node-fetch', 'axios', 'httpie', 'postman', 'insomnia'
  ];
  
  const suspiciousUA = botPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  );
  
  if (suspiciousUA) {
    return res.status(403).json({ error: 'Automated requests not allowed' });
  }
  
  // 4. Update rate limits
  ipRateData.count++;
  ipRateData.dailyCount++;
  rateLimits.set(rateLimitKey, ipRateData);
  
  // Add protection data to request for endpoint use
  req.protection = {
    clientIP,
    userAgent: userAgent.substring(0, 100),
    timestamp: now,
    dailyCount: ipRateData.dailyCount
  };
  
  next();
}

// Apply protection to sensitive endpoints
app.use('/api/free-cred-score', serverSideProtection);

// Free Cred Score endpoint with comprehensive protection
app.post('/api/free-cred-score', async (req, res) => {
  try {
    const { name, email, company, askphrases, fingerprint, trustScore, sessionData } = req.body;
    
    // 1. Validate required fields
    if (!name || !email || !company || !askphrases || !Array.isArray(askphrases) || askphrases.length !== 3) {
      return res.status(400).json({ 
        error: 'Invalid request data. Missing required fields.' 
      });
    }
    
    // 2. Validate data lengths and content
    if (name.length > 100 || email.length > 200 || company.length > 200) {
      return res.status(400).json({ 
        error: 'Field length exceeds maximum allowed.' 
      });
    }
    
    // 3. Email validation (server-side)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format.' 
      });
    }
    
    // 4. Cost Protection - simulate expensive API call
    const submissionKey = `submission_${req.protection.clientIP}_${email}`;
    const existingSubmission = submissions.get(submissionKey);
    
    if (existingSubmission && Date.now() - existingSubmission.timestamp < 300000) { // 5 minute cooldown
      return res.status(429).json({ 
        error: 'Submission too recent. Please wait before submitting again.',
        retryAfter: Math.ceil((300000 - (Date.now() - existingSubmission.timestamp)) / 1000)
      });
    }
    
    // 5. Log submission for monitoring
    console.log(`✅ Free Cred Score request:`, {
      ip: req.protection.clientIP,
      email: email.substring(0, 20) + '...',
      company: company.substring(0, 30),
      userAgent: req.protection.userAgent,
      dailyCount: req.protection.dailyCount,
      trustScore: trustScore || 'unknown'
    });
    
    // 6. Store submission to prevent duplicates
    submissions.set(submissionKey, {
      timestamp: Date.now(),
      email,
      company,
      name: name.substring(0, 50)
    });
    
    // 7. Simulate Cred Score analysis (replace with real API in production)
    const mockResults = {
      name: name,
      credScore: Math.floor(Math.random() * 40) + 40, // 40-80 range for free version
      mentions: Math.floor(Math.random() * 6) + 1,
      queries: askphrases,
      askphraseResults: askphrases.map((askphrase, index) => ({
        askphrase: askphrase,
        mentions: Math.floor(Math.random() * 3),
        performance: ['needs-work', 'moderate', 'good'][Math.floor(Math.random() * 3)]
      })),
      engine: 'ChatGPT (Free Analysis)',
      analysisLimited: true,
      upgradeMessage: 'This free analysis covers one AI engine. Get complete analysis across all major engines with our Beta Concierge Program.'
    };
    
    // 8. Add small delay to prevent rapid-fire requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json(mockResults);
    
  } catch (error) {
    console.error('Free Cred Score API error:', error);
    res.status(500).json({ 
      error: 'Analysis temporarily unavailable. Please try again later.' 
    });
  }
});

// Webhook to handle subscription events
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Webhook processing unavailable' });
  }
  
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Payment succeeded for customer:', invoice.customer);
      // Here you would update your database, send welcome email, etc.
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Payment failed for customer:', failedInvoice.customer);
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Credli server running on http://localhost:${PORT}`);
});
