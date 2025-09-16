# September 2, 2025 - Claude Terminal Instructions

## Current Working State

**Location:** `/Users/besociallysmashinghome/claude-sandbox/lesson-01/trustsource/`

**Working Google Apps Script Code:**
```javascript
function doPost(e) {
  try {
  var data = JSON.parse(e.postData.contents);
  var spreadsheetId = '1nyXU4zKNfhIGPKxX1crxKGCU8tm1_apsJRcHdeDWJJM';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  if (sheet.getLastRow() === 0) {
  sheet.appendRow(["Timestamp", "Name", "Email", "Company", "Ask Phrase 1", "Ask Phrase 2", "Ask Phrase 3", "CredScore"]);
  }
  var overallScore = 65;
  var visibilityScore = 60;
  var authorityScore = 70;
  var consistencyScore = 55;
  var chatgptScore = 65;
  sheet.appendRow([new Date(), data.name, data.email, data.company, data.askphrase1, data.askphrase2,
   data.askphrase3, overallScore]);
  var subject = 'Your Cred Score Results: ' + overallScore + '/100 - ' + data.name;
  var emailBody = 'Hello ' + data.name + ', Your AI Authority Analysis is complete.';
  GmailApp.sendEmail(data.email, subject, emailBody);
  return ContentService.createTextOutput("complete");
  } catch (error) {
  return ContentService.createTextOutput("error: " + error.toString());
  }
  }
```

**Working Infrastructure:**
- Google Spreadsheet ID: `1nyXU4zKNfhIGPKxX1crxKGCU8tm1_apsJRcHdeDWJJM`
- Deployment ID: `AKfycby4BEPfKB8VFhPo81waXsm8EkciM6KHJqreOK8o638e6YGDW97IJWG8kiUixit9Ec3K`
- Live URL: `https://script.google.com/macros/s/AKfycby4BEPfKB8VFhPo81waXsm8EkciM6KHJqreOK8o638e6YGDW97IJWG8kiUixit9Ec3K/exec`
- Connected to demo.html form at line 583
- Emails are being delivered (check spam folder)

**Current Problem:**
Email content is minimal. Only sends: "Hello [name], Your AI Authority Analysis is complete."

## What Claude Terminal Needs To Complete

**Task:** Expand the `emailBody` variable to include comprehensive results data.

**Required Email Content:**
- Overall Score: 65/100
- Status: Building Authority
- AI Visibility: 60%
- Authority Score: 70% 
- Consistency: 55%
- ChatGPT Recognition: 65%
- All 3 user ask phrases (askphrase1, askphrase2, askphrase3)
- Imposter Alert: 2 potential fake profiles detected
- PayPal CTA: https://www.paypal.com/ncp/payment/W7LPR9DCY8464
- Closing: "Elevate Your Presence. Own Your Reputation. Credli.ai"

**Critical Requirements:**
1. Do NOT change the working doPost function structure
2. Only modify the `emailBody` variable content
3. Test each line addition before proceeding
4. Use proper string concatenation (no template literals)
5. Use \n for line breaks
6. Keep all existing variable names and structure

**Next Steps:**
1. Take the working code above
2. Replace the simple emailBody line with expanded content
3. Test incrementally by adding content sections one at a time
4. Deploy and verify email delivery with full content

The current code works for basic functionality. Only the email content needs expansion.