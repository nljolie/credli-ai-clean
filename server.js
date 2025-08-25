require('dotenv').config();
const express = require('express');
const path = require('path');

// PayPal-only payment processing - Stripe removed

// Initialize PayPal SDK with LIVE credentials
let paypal;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AcGoLNULLeJy3m9aY3jTTDXEDvoUEJU0ztSSeEbl-JxsrqFD0GPw8IigdympXcFREnr0IZkf4TsOEagE';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EAGgKHWzmKKZ9OWCnVILj-g0oWaY__tJfPkP6cev3lgqXFbXQ4X56_E9ONhWIJ40QrHf5IfoOvmi9ZQP';
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || 'live';

if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
  const paypalCheckoutNodeJSSdk = require('@paypal/checkout-server-sdk');
  
  // Configure environment (sandbox for testing, live for production)
  const environment = PAYPAL_ENVIRONMENT === 'live' 
    ? new paypalCheckoutNodeJSSdk.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    : new paypalCheckoutNodeJSSdk.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
  
  paypal = new paypalCheckoutNodeJSSdk.core.PayPalHttpClient(environment);
  console.log(`✅ PayPal SDK initialized (${PAYPAL_ENVIRONMENT} mode)`);
} else {
  console.log('⚠️  PayPal disabled - no API credentials found');
}

// Export PayPal credentials for client-side use
const PAYPAL_CLIENT_ID_PUBLIC = PAYPAL_CLIENT_ID;
console.log(`📋 PayPal Client ID: ${PAYPAL_CLIENT_ID_PUBLIC.substring(0, 20)}...`);

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

// AGGRESSIVE CACHE CONTROL - Force browser refresh
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

// ===== SECURE SESSION MANAGEMENT & USER ACCOUNTS =====
const crypto = require('crypto');

// In-memory user store (in production, use database)
const users = new Map();
const sessions = new Map();

// Simple session middleware (in production, use express-session with secure store)
app.use((req, res, next) => {
  // Get session ID from cookie or create new one
  let sessionId = req.headers.cookie?.split(';')
    .find(c => c.trim().startsWith('sessionId='))
    ?.split('=')[1];
    
  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = crypto.randomUUID();
    req.session = { id: sessionId };
    sessions.set(sessionId, req.session);
  } else {
    req.session = sessions.get(sessionId);
  }
  
  // Set session cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  next();
});

// Helper functions for user management
function createUser(email, password, paypalData = {}) {
  const userId = crypto.randomUUID();
  const passwordHash = crypto.createHash('sha256').update(password + process.env.SALT || 'credli-salt-2025').digest('hex');
  
  const user = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash: passwordHash,
    createdAt: new Date(),
    plan: 'professional',
    paypalData: paypalData,
    lastLogin: null
  };
  
  users.set(email.toLowerCase(), user);
  console.log(`✅ User account created: ${email}`);
  return user;
}

function authenticateUser(email, password) {
  const user = users.get(email.toLowerCase());
  if (!user) return null;
  
  const passwordHash = crypto.createHash('sha256').update(password + process.env.SALT || 'credli-salt-2025').digest('hex');
  if (user.passwordHash !== passwordHash) return null;
  
  user.lastLogin = new Date();
  console.log(`✅ User authenticated: ${email}`);
  return user;
}

function generateRandomPassword() {
  return crypto.randomBytes(8).toString('hex').slice(0, 12);
}

// Google Sheets authentication functions
async function authenticateUserFromSheets(email, password) {
  try {
    // Admin bypass for immediate access
    if (email.toLowerCase() === 'nicole@nicolejolie.com' && password === 'NLJ2025') {
      const user = {
        id: 'admin_user',
        email: 'nicole@nicolejolie.com',
        plan: 'professional',
        lastLogin: new Date()
      };
      console.log(`✅ Admin login successful: ${email}`);
      return user;
    }
    
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzVSAz-hUi_2Dni-rZL45cES2z6ef5-WzdbhWtXtvIZlAFlC1HMCafQPADQCjbUddES/exec';
    
    // Hash password with same salt as client-side
    const passwordHash = crypto.createHash('sha256').update(password + 'credli-salt-2025').digest('hex');
    
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        email: email.toLowerCase(),
        passwordHash: passwordHash
      })
    });
    
    const result = await response.json();
    if (!result.success) {
      return null;
    }
    
    // Since we're using no-cors, we can't read the response directly
    // We'll assume success and create user object
    const user = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      plan: 'professional',
      lastLogin: new Date()
    };
    
    console.log(`✅ User authenticated from Google Sheets: ${email}`);
    return user;
  } catch (error) {
    console.error('Google Sheets authentication error:', error);
    return null;
  }
}

async function addUserToGoogleSheets(userData) {
  try {
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzVSAz-hUi_2Dni-rZL45cES2z6ef5-WzdbhWtXtvIZlAFlC1HMCafQPADQCjbUddES/exec';
    
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    console.log('✅ User added to Google Sheets:', userData.email);
    return true;
  } catch (error) {
    console.error('❌ Error adding user to Google Sheets:', error);
    return false;
  }
}

// ===== EMAIL INTEGRATION SYSTEM =====
const nodemailer = require('nodemailer');

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'credlitrust@credli.ai',
    pass: 'ptqx wbzv vmrl kpfk'
  }
});

async function sendWelcomeEmail(email, password) {
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3454D1, #5B73E8); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3454D1; }
    .button { display: inline-block; background: #3454D1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Credli.ai Professional Beta!</h1>
      <p>Your spot is reserved - Beta launches September 1st, 2025</p>
    </div>
    <div class="content">
      <h2>Your Beta Access is Ready!</h2>
      <p>Thank you for joining the Credli.ai Professional Beta program. You're one of only 100 professionals with early access to our AI Trust Consulting platform.</p>
      
      <div class="credentials">
        <h3>🔐 Your Login Credentials:</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Login URL:</strong> <a href="https://credli.ai/login.html">https://credli.ai/login.html</a></p>
      </div>
      
      <p><strong>Beta Launch Date:</strong> September 1st, 2025</p>
      <p>Your login will be active starting September 1st. Save this email with your credentials!</p>
      
      <a href="https://credli.ai/login.html" class="button">Access Dashboard (Available Sept 1st)</a>
      
      <h3>What's Next?</h3>
      <ul>
        <li>✅ Your spot is secured at the special beta price of $497</li>
        <li>📅 Beta access begins September 1st, 2025</li>
        <li>🔐 Use the credentials above to log in starting Sept 1st</li>
        <li>📧 You can change your password after first login</li>
      </ul>
      
      <p><strong>Need Help?</strong> Contact us at credlitrust@credli.ai</p>
    </div>
    <div class="footer">
      <p>© 2025 Credli.ai - AI Trust Consultant Platform<br>
      This email was sent to ${email} because you purchased Credli.ai Professional Beta access.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  const mailOptions = {
    from: 'Credli.ai <credlitrust@credli.ai>',
    to: email,
    subject: '🎉 Your Credli.ai Beta Access is Ready - Login Credentials Inside',
    html: emailContent
  };
  
  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email} - Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    return false;
  }
}

async function sendPaymentConfirmationEmail(email) {
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3454D1, #5B73E8); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .confirmation-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
    .button { display: inline-block; background: #3454D1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .highlight { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 3px solid #3454D1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Payment Confirmed - Your Beta Spot is Reserved!</h1>
      <p>Welcome to Credli.ai Professional Beta</p>
    </div>
    <div class="content">
      <div class="confirmation-box">
        <h2>✅ Payment Successfully Processed</h2>
        <p>Thank you for joining the Credli.ai Professional Beta program! Your payment has been confirmed and your spot is officially reserved.</p>
      </div>
      
      <div class="highlight">
        <h3>📅 Important Launch Information:</h3>
        <p><strong>Beta Launch Date:</strong> September 1st, 2025</p>
        <p><strong>Your Investment:</strong> $497 (Special Beta Pricing)</p>
        <p><strong>Program Duration:</strong> Exclusive Beta Access</p>
      </div>
      
      <h3>What Happens Next?</h3>
      <ul>
        <li>🔐 <strong>Login credentials will be emailed to you on September 1st</strong></li>
        <li>📧 You'll receive a separate email with your dashboard access details</li>
        <li>🎯 Beta program officially begins September 1st, 2025</li>
        <li>💼 You're now one of only 100 beta professionals</li>
      </ul>
      
      <a href="https://credli.ai/success.html" class="button">View Beta Information</a>
      
      <h3>🚀 Get Ready for Launch!</h3>
      <p>Over the next few days, you'll receive additional emails with:</p>
      <ul>
        <li>Beta program orientation materials</li>
        <li>Pre-launch preparation guide</li>
        <li>Your login credentials (arriving September 1st)</li>
      </ul>
      
      <p><strong>Questions?</strong> Reply to this email or contact us at credlitrust@credli.ai</p>
    </div>
    <div class="footer">
      <p>© 2025 Credli.ai - AI Trust Consultant Platform<br>
      This confirmation was sent to ${email} for your Credli.ai Professional Beta purchase.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  const mailOptions = {
    from: 'Credli.ai <credlitrust@credli.ai>',
    to: email,
    subject: '✅ Payment Confirmed - Your Credli.ai Beta Spot is Reserved!',
    html: emailContent
  };
  
  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Payment confirmation email sent to ${email} - Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send confirmation email to ${email}:`, error);
    return false;
  }
}

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working! Homepage updated.', timestamp: new Date() });
});

// PayPal configuration endpoint for client-side
app.get('/api/paypal-config', (req, res) => {
  res.json({
    clientId: PAYPAL_CLIENT_ID_PUBLIC,
    environment: PAYPAL_ENVIRONMENT
  });
});

// PayPal return URL handler (success) - CREATE USER ACCOUNT
app.get('/paypal-return', async (req, res) => {
  // PayPal redirects here after successful payment
  const { token, PayerID, email } = req.query;
  
  if (token && PayerID) {
    try {
      // TODO: In production, verify payment with PayPal API
      // For now, we'll create the user account directly
      
      // Generate temporary password for user
      const tempPassword = generateRandomPassword();
      
      // Use email from PayPal or fallback to generated email
      const userEmail = email || `customer_${PayerID}@paypal.generated`;
      
      console.log(`🔄 Creating account for PayPal customer: ${userEmail}`);
      
      // Hash password for Google Sheets storage
      const passwordHash = crypto.createHash('sha256').update(tempPassword + 'credli-salt-2025').digest('hex');
      
      // Add user to Google Sheets
      const userData = {
        email: userEmail.toLowerCase(),
        passwordHash: passwordHash,
        userId: crypto.randomUUID(),
        plan: 'professional',
        paypalToken: token,
        payerId: PayerID,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const sheetsSuccess = await addUserToGoogleSheets(userData);
      if (!sheetsSuccess) {
        console.error('❌ Failed to add user to Google Sheets');
        return res.redirect('/payment-required.html?error=account_creation_failed');
      }
      
      // Create session for immediate access
      req.session.paid = true;
      req.session.userId = userData.userId;
      req.session.userEmail = userData.email;
      req.session.paymentProvider = 'paypal';
      req.session.paymentToken = token;
      req.session.payerId = PayerID;
      req.session.plan = 'professional';
      
      console.log(`✅ PayPal payment successful - User created: ${userEmail}`);
      console.log(`📧 Sending payment confirmation email (no credentials until Sept 1st)`);
      
      // Send payment confirmation email (no login credentials)
      const emailSent = await sendPaymentConfirmationEmail(userData.email);
      if (!emailSent) {
        console.error('❌ Failed to send payment confirmation email');
      }
      
      // TODO: Store user for September 1st credentials email batch
      console.log(`🗓️ User stored for Sept 1st launch: ${userEmail}, password: ${tempPassword}`);
      
      // Redirect to success page
      return res.redirect('/success.html?created=true&email=' + encodeURIComponent(userEmail));
      
    } catch (error) {
      console.error('❌ Error creating user account:', error);
      return res.redirect('/payment-required.html?error=account_creation_failed');
    }
  } else {
    console.log('❌ PayPal return without proper parameters');
    return res.redirect('/payment-required.html?error=payment_failed');
  }
});

// PayPal cancel URL handler
app.get('/paypal-cancel', (req, res) => {
  console.log('❌ PayPal payment cancelled by user');
  res.redirect('/payment-required.html?cancelled=true');
});

// ===== LOGIN API ENDPOINT =====
app.post('/api/login', async (req, res) => {
  const { email, password, remember } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  try {
    // Check Google Sheets for user authentication
    const user = await authenticateUserFromSheets(email, password);
    if (!user) {
      console.log(`❌ Failed login attempt: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Create session
    req.session.loggedIn = true;
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.plan = user.plan;
    req.session.paid = true; // Professional beta customers
    
    // Extend session if remember me is checked
    if (remember) {
      req.session.rememberMe = true;
      // In production, extend cookie expiration to 30 days
    }
    
    console.log(`✅ Successful login: ${email}`);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login system temporarily unavailable'
    });
  }
});

// ===== LOGOUT API ENDPOINT =====
app.post('/api/logout', (req, res) => {
  const userEmail = req.session?.userEmail;
  
  // Clear session
  req.session.loggedIn = false;
  req.session.userId = null;
  req.session.userEmail = null;
  req.session.paid = false;
  
  console.log(`✅ User logged out: ${userEmail}`);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Serve main homepage at root BEFORE static middleware
app.get('/', (req, res) => {
  console.log('Root route hit - serving homepage');
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// ===== DASHBOARD ACCESS CONTROL =====
app.get('/dashboard.html', (req, res) => {
  // Allow admin direct access via URL parameter
  if (req.query.email === 'nicole@nicolejolie.com') {
    req.session.loggedIn = true;
    req.session.userEmail = 'nicole@nicolejolie.com';
    req.session.paid = true;
  }
  
  console.log('✅ Dashboard access - TESTING MODE (login disabled)');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Authentication pages (served from root level)
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/forgot-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

// Legacy dashboard URL redirect
app.get('/dashboard-complete.html', (req, res) => {
  res.redirect('/dashboard.html');
});

// Other protected dashboard pages
app.get('/dashboard-new.html', (req, res) => {
  const hasAccess = req.session?.paid || 
                   req.query.access_token ||
                   req.query.payment_success === 'true';
  
  if (!hasAccess) {
    return res.redirect('/payment-required.html');
  }
  
  // Create session if payment success
  if (req.query.payment_success === 'true') {
    req.session.paid = true;
  }
  
  res.sendFile(path.join(__dirname, 'public', 'dashboard-new.html'));
});

// Professional welcome page (accessible after payment)
app.get('/professional-welcome.html', (req, res) => {
  // Allow access to welcome page - no restrictions
  res.sendFile(path.join(__dirname, 'public', 'professional-welcome.html'));
});

// ===== STATIC FILE SERVING =====
// IMPORTANT: Files in /public/ folder are served as web root
// public/landing.html → credli.ai/landing.html
// public/dashboard.html → credli.ai/dashboard.html
// public/temporary/landing-temporary.html → credli.ai/temporary/landing-temporary.html
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

// TEST ENDPOINT: Simulate PayPal payment flow (remove in production)
app.get('/test-paypal-flow', async (req, res) => {
  try {
    // Simulate PayPal success with test data
    const testEmail = req.query.email || 'test@example.com';
    const tempPassword = generateRandomPassword();
    
    console.log(`🧪 TESTING PayPal flow for: ${testEmail}`);
    
    // Create user account (same as real PayPal flow)
    const passwordHash = crypto.createHash('sha256').update(tempPassword + 'credli-salt-2025').digest('hex');
    
    const userData = {
      email: testEmail.toLowerCase(),
      passwordHash: passwordHash,
      userId: crypto.randomUUID(),
      plan: 'professional',
      paypalToken: 'TEST_TOKEN_' + Date.now(),
      payerId: 'TEST_PAYER_' + Date.now(),
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Add to Google Sheets
    const sheetsSuccess = await addUserToGoogleSheets(userData);
    if (!sheetsSuccess) {
      return res.json({ error: 'Failed to create account in Google Sheets' });
    }
    
    // Send payment confirmation email (no credentials until Sept 1st)
    const emailSent = await sendPaymentConfirmationEmail(userData.email);
    
    // Create session
    req.session.paid = true;
    req.session.userId = userData.userId;
    req.session.userEmail = userData.email;
    req.session.plan = 'professional';
    
    console.log(`✅ TEST: Account created for ${testEmail}, password stored for Sept 1st: ${tempPassword}`);
    console.log(`📧 TEST: Payment confirmation email sent: ${emailSent ? 'SUCCESS' : 'FAILED'}`);
    
    res.json({
      success: true,
      message: 'Test PayPal flow completed! Payment confirmation sent (credentials will be emailed Sept 1st)',
      email: userData.email,
      passwordStoredForSept1st: tempPassword,
      confirmationEmailSent: emailSent,
      note: 'Login credentials will be emailed on September 1st, 2025'
    });
    
  } catch (error) {
    console.error('❌ Test PayPal flow error:', error);
    res.json({ error: error.message });
  }
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
        cancel_url: `${req.protocol}://${req.get('host')}/cred-score.html`
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
  
  // Check limits (TESTING MODE - Temporarily disabled for demo testing)
  // if (ipRateData.count > 3 || ipRateData.dailyCount > 2) {
  //   return res.status(429).json({ 
  //     error: 'Rate limit exceeded. Please try again later.',
  //     retryAfter: Math.ceil((60000 - (now - ipRateData.lastReset)) / 1000)
  //   });
  // }
  
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
  
  // TESTING MODE - Allow all referers for demo testing
  // if (!requestPattern.referer.includes('credli.ai') && !requestPattern.referer.includes('localhost')) {
  //   return res.status(403).json({ error: 'Invalid referer' });
  // }
  
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
    
    // TESTING MODE - Temporarily disable 5-minute cooldown
    // if (existingSubmission && Date.now() - existingSubmission.timestamp < 300000) { // 5 minute cooldown
    //   return res.status(429).json({ 
    //     error: 'Submission too recent. Please wait before submitting again.',
    //     retryAfter: Math.ceil((300000 - (Date.now() - existingSubmission.timestamp)) / 1000)
    //   });
    // }
    
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
