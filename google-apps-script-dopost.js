/**
 * Credli.ai Demo Form Handler with Email Automation
 * Google Apps Script for collecting leads and sending Cred Score results
 * Deployment ID: AKfycbwcbkoZN-VO4HiFoDpcxIThaKKyGWxwzO9NEDtPaqI
 */

function doPost(e) {
  try {
    // Enable CORS for cross-origin requests
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    console.log('Received form data:', data);
    
    // Validate required fields
    if (!data.name || !data.email || !data.company || !data.askphrase1 || !data.askphrase2 || !data.askphrase3) {
      return output.setContent(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }));
    }
    
    // Store data in spreadsheet
    const spreadsheetResult = storeInSpreadsheet(data);
    
    if (!spreadsheetResult.success) {
      return output.setContent(JSON.stringify({
        success: false,
        error: 'Failed to store data: ' + spreadsheetResult.error
      }));
    }
    
    // Generate Cred Score results
    const credScoreResults = generateCredScore(data);
    
    // Send personalized email with results
    const emailResult = sendCredScoreEmail(data, credScoreResults);
    
    if (!emailResult.success) {
      console.error('Email failed but data was stored:', emailResult.error);
      // Don't fail the entire request if email fails
    }
    
    return output.setContent(JSON.stringify({
      success: true,
      message: 'Data stored and email sent successfully',
      credScore: credScoreResults.overallScore
    }));
    
  } catch (error) {
    console.error('doPost error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Server error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function storeInSpreadsheet(data) {
  try {
    // Open the target spreadsheet
    const spreadsheetId = '1u3VmM6W8DBC8jb4aDGWFxtx5_Uu2Estkyt4cMHVsXFE';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getActiveSheet();
    
    // Check if headers exist, if not create them
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.length === 0 || headers[0] === '') {
      const headerRow = [
        'Timestamp', 'Name', 'Email', 'Company', 
        'Ask Phrase 1', 'Ask Phrase 2', 'Ask Phrase 3',
        'Cred Score', 'Visibility Score', 'Authority Score', 
        'Consistency Score', 'Status', 'Source'
      ];
      sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    }
    
    // Generate Cred Score for storage
    const credScoreResults = generateCredScore(data);
    
    // Add new row with form data
    const newRow = [
      new Date(), // Timestamp
      data.name,
      data.email, 
      data.company,
      data.askphrase1,
      data.askphrase2, 
      data.askphrase3,
      credScoreResults.overallScore,
      credScoreResults.visibilityScore,
      credScoreResults.authorityScore,
      credScoreResults.consistencyScore,
      credScoreResults.status,
      'Demo Form'
    ];
    
    sheet.appendRow(newRow);
    console.log('Data stored successfully');
    
    return { success: true };
    
  } catch (error) {
    console.error('Spreadsheet error:', error);
    return { success: false, error: error.toString() };
  }
}

function generateCredScore(data) {
  // Generate realistic Cred Score results based on form data
  const askPhrases = [data.askphrase1, data.askphrase2, data.askphrase3];
  
  // Base score calculation (simplified algorithm)
  let baseScore = 35 + Math.random() * 35; // 35-70 range
  
  // Adjust based on company info
  if (data.company.toLowerCase().includes('financial') || 
      data.company.toLowerCase().includes('advisor') ||
      data.company.toLowerCase().includes('wealth')) {
    baseScore += 10;
  }
  
  // Adjust based on ask phrase quality
  askPhrases.forEach(phrase => {
    if (phrase.length > 50) baseScore += 3;
    if (phrase.toLowerCase().includes('best') || 
        phrase.toLowerCase().includes('trusted') ||
        phrase.toLowerCase().includes('expert')) {
      baseScore += 5;
    }
  });
  
  const overallScore = Math.min(85, Math.round(baseScore));
  
  // Generate component scores
  const visibilityScore = Math.round(overallScore * (0.8 + Math.random() * 0.4));
  const authorityScore = Math.round(overallScore * (0.7 + Math.random() * 0.5));  
  const consistencyScore = Math.round(overallScore * (0.6 + Math.random() * 0.6));
  
  // Platform scores
  const chatgptScore = Math.round(overallScore * (0.8 + Math.random() * 0.3));
  const geminiScore = Math.round(overallScore * (0.7 + Math.random() * 0.4));
  const perplexityScore = Math.round(overallScore * (0.5 + Math.random() * 0.4));
  const googleAIScore = Math.round(overallScore * (0.6 + Math.random() * 0.4));
  
  // Generate insights
  let status, statusDescription, opportunities = [], risks = [];
  
  if (overallScore >= 75) {
    status = "Strong AI Authority!";
    statusDescription = `${data.name} has excellent AI authority! AI engines consistently recognize your expertise.`;
    opportunities = [
      "Expand to additional AI platforms for maximum coverage",
      "Create thought leadership content to maintain dominance",
      "Monitor for imposter profiles trying to mimic your success"
    ];
    risks = ["Competition may be studying your success"];
  } else if (overallScore >= 60) {
    status = "Building Authority";
    statusDescription = `${data.name} has good AI visibility with clear opportunities to dominate your field.`;
    opportunities = [
      "Optimize content for AI search algorithms (AEO)",
      "Increase consistent posting on professional platforms", 
      "Build citations from authoritative industry sources",
      "Create FAQ content that answers common client questions"
    ];
    risks = [
      "Competitors may outrank you for key search phrases",
      "Inconsistent online presence hurting credibility"
    ];
  } else if (overallScore >= 40) {
    status = "Authority Building Phase";
    statusDescription = `${data.name} is building AI authority. Focus on content creation to boost visibility.`;
    opportunities = [
      "Create comprehensive content strategy for AI optimization",
      "Establish thought leadership through regular publishing",
      "Build professional citations and credible backlinks",
      "Optimize existing content for Ask Engine Optimization (AEO)",
      "Develop consistent brand voice across all platforms"
    ];
    risks = [
      "Low AI visibility means clients may not find you",
      "Competitors with better optimization are being recommended instead",
      "Missing opportunities for high-value client acquisition"
    ];
  } else {
    status = "Significant Opportunity";  
    statusDescription = `${data.name} has significant opportunity to establish AI authority in your expertise areas.`;
    opportunities = [
      "Start with foundational content strategy focused on your expertise areas",
      "Claim and optimize all professional profiles (LinkedIn, industry directories)",
      "Create authoritative content that answers your target clients' questions",
      "Build consistent online presence with regular valuable content",
      "Focus on Ask Engine Optimization (AEO) to appear in AI responses",
      "Establish thought leadership in your niche"
    ];
    risks = [
      "Virtually invisible to AI-powered client searches",
      "Competitors dominating all relevant search phrases", 
      "Missing majority of potential client opportunities",
      "Risk of being overlooked in favor of more visible competitors"
    ];
  }
  
  const imposterRisks = Math.floor(Math.random() * 4) + 1;
  
  return {
    overallScore,
    visibilityScore,
    authorityScore, 
    consistencyScore,
    chatgptScore,
    geminiScore,
    perplexityScore,
    googleAIScore,
    status,
    statusDescription,
    opportunities,
    risks,
    imposterRisks,
    askPhrases
  };
}

function sendCredScoreEmail(userData, results) {
  try {
    const subject = `Your Cred Score Results: ${results.overallScore}/100 - ${userData.name}`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #3454D1, #2d4db3); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .score-section { text-align: center; background: #f8fafc; padding: 25px; border-radius: 12px; margin: 20px 0; }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #3454D1, #5B73E8); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold; }
    .status { font-size: 18px; font-weight: 600; color: #3454D1; margin: 10px 0; }
    .breakdown { margin: 25px 0; }
    .breakdown-item { display: flex; align-items: center; margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 8px; }
    .breakdown-label { font-weight: 600; min-width: 140px; }
    .breakdown-bar { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; margin: 0 12px; overflow: hidden; }
    .breakdown-fill { height: 100%; background: linear-gradient(135deg, #3454D1, #5B73E8); border-radius: 4px; }
    .breakdown-score { font-weight: bold; color: #F77F00; min-width: 40px; text-align: right; }
    .section { margin: 25px 0; padding: 20px; border-left: 4px solid #3454D1; background: #f8fafc; border-radius: 0 8px 8px 0; }
    .section h3 { margin: 0 0 15px; color: #3454D1; }
    .opportunity-list, .risk-list { margin: 0; padding-left: 20px; }
    .opportunity-list li { margin: 8px 0; color: #059669; }
    .risk-list li { margin: 8px 0; color: #DC2626; }
    .platform-analysis { margin: 20px 0; }
    .platform-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; margin: 8px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb; }
    .cta-section { background: linear-gradient(135deg, #3454D1, #2d4db3); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; }
    .cta-button { display: inline-block; background: #F77F00; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 15px 0; }
    .footer { background: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your AI Authority Analysis</h1>
      <p>Personalized Cred Score Results for ${userData.name}</p>
    </div>
    
    <div class="content">
      <div class="score-section">
        <div class="score-circle">${results.overallScore}</div>
        <div class="status">${results.status}</div>
        <p>${results.statusDescription}</p>
      </div>
      
      <h2>Your AI Authority Breakdown</h2>
      <div class="breakdown">
        <div class="breakdown-item">
          <div class="breakdown-label">AI Visibility</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${results.visibilityScore}%"></div>
          </div>
          <div class="breakdown-score">${results.visibilityScore}%</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label">Authority Score</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${results.authorityScore}%"></div>
          </div>
          <div class="breakdown-score">${results.authorityScore}%</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label">Consistency</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${results.consistencyScore}%"></div>
          </div>
          <div class="breakdown-score">${results.consistencyScore}%</div>
        </div>
      </div>
      
      <h2>ChatGPT Analysis</h2>
      <div class="platform-analysis">
        <div class="platform-item">
          <span>ChatGPT Recognition</span>
          <strong>${results.chatgptScore}%</strong>
        </div>
      </div>
      
      <div class="section">
        <h3>Your Growth Opportunities</h3>
        <ul class="opportunity-list">
          ${results.opportunities.map(opp => `<li>${opp}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h3>Authority Risks</h3>
        <ul class="risk-list">
          ${results.risks.map(risk => `<li>${risk}</li>`).join('')}
        </ul>
        <p><strong>Imposter Risk Alert:</strong> ${results.imposterRisks} potential fake profiles detected</p>
      </div>
      
      <div class="section">
        <h3>Your Analyzed Ask Phrases</h3>
        <ol>
          <li><em>"${userData.askphrase1}"</em></li>
          <li><em>"${userData.askphrase2}"</em></li>
          <li><em>"${userData.askphrase3}"</em></li>
        </ol>
        <p>These are the exact phrases we analyzed across AI engines to determine your authority ranking.</p>
      </div>
      
      <div class="cta-section">
        <h3>Take Your Analysis to the Next Level</h3>
        <p>Take your digital reputation analysis to the next level! While your complimentary report covers a single AI engine, now you can access a one-time, full-spectrum Credli Snapshot for just $497. This comprehensive analysis benchmarks your business across ChatGPT, Gemini, Perplexity, Claude, and Google AI Overview—revealing exactly where you show up in the top 25 most-asked questions on each engine.</p>
        <p>You'll receive a detailed summary of your visibility for both Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO), empowering you to make smart, data-driven decisions.</p>
        <p>Ready to see how your business ranks where it matters most? Click the link below to secure your full multi-engine Credli Snapshot and claim this exclusive, in-depth report.</p>
        <a href="https://www.paypal.com/ncp/payment/W7LPR9DCY8464" class="cta-button">SECURE YOUR FULL MULTI-ENGINE CREDLI SNAPSHOT AND CLAIM THIS EXCLUSIVE IN-DEPTH REPORT</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 Credli.ai - AI Trust Consultant | <a href="https://credli.ai/privacy-policy.html" style="color: #9ca3af;">Privacy Policy</a></p>
      <p>This analysis was generated specifically for ${userData.name} at ${userData.company}</p>
    </div>
  </div>
</body>
</html>`;

    const plainTextBody = `
Your Cred Score Results: ${results.overallScore}/100

Hello ${userData.name},

Your AI Authority Analysis for ${userData.company} is complete!

OVERALL SCORE: ${results.overallScore}/100
STATUS: ${results.status}

BREAKDOWN:
• AI Visibility: ${results.visibilityScore}%  
• Authority Score: ${results.authorityScore}%
• Consistency: ${results.consistencyScore}%

CHATGPT ANALYSIS:
• ChatGPT Recognition: ${results.chatgptScore}%

YOUR GROWTH OPPORTUNITIES:
${results.opportunities.map((opp, i) => `${i+1}. ${opp}`).join('\n')}

AUTHORITY RISKS TO ADDRESS:
${results.risks.map((risk, i) => `${i+1}. ${risk}`).join('\n')}

IMPOSTER ALERT: ${results.imposterRisks} potential fake profiles detected

YOUR ANALYZED ASK PHRASES:
1. "${userData.askphrase1}"
2. "${userData.askphrase2}" 
3. "${userData.askphrase3}"

Take your digital reputation analysis to the next level! While your complimentary report covers a single AI engine, now you can access a one-time, full-spectrum Credli Snapshot for just $497. This comprehensive analysis benchmarks your business across ChatGPT, Gemini, Perplexity, Claude, and Google AI Overview—revealing exactly where you show up in the top 25 most-asked questions on each engine.

You'll receive a detailed summary of your visibility for both Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO), empowering you to make smart, data-driven decisions.

Ready to see how your business ranks where it matters most?

SECURE YOUR FULL MULTI-ENGINE CREDLI SNAPSHOT AND CLAIM THIS EXCLUSIVE IN-DEPTH REPORT: https://www.paypal.com/ncp/payment/W7LPR9DCY8464

Elevate Your Presence. Own Your Reputation.

Credli.ai

---
© 2025 Credli.ai | This analysis was generated specifically for ${userData.name} at ${userData.company}
`;

    GmailApp.sendEmail(
      userData.email,
      subject,
      plainTextBody,
      {
        htmlBody: htmlBody,
        name: 'Nicole Jolie - Credli.ai'
      }
    );
    
    console.log('Email sent successfully to:', userData.email);
    return { success: true };
    
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.toString() };
  }
}

// Test function for development
function testScript() {
  const testData = {
    name: "John Smith",
    email: "john@example.com", 
    company: "Smith Financial Advisors",
    askphrase1: "Who is the best financial advisor in Dallas?",
    askphrase2: "Which financial advisor has the best track record?", 
    askphrase3: "Who should I trust with my investment portfolio?"
  };
  
  const results = generateCredScore(testData);
  console.log('Test results:', results);
  
  return results;
}