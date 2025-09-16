# Google Apps Script Prompting Guide for Claude
*Based on Google Developer Documentation and Common Error Analysis*

## Critical Syntax Requirements (Copy/Paste Ready Code)

### 1. **JavaScript Compatibility Rules**
```javascript
✅ CORRECT:
var emailBody = 'Hello ' + name + ',\n';
var data = JSON.parse(e.postData.contents);

❌ INCORRECT (ES6+):
let emailBody = `Hello ${name},`;
const data = JSON.parse(e.postData.contents);
```

### 2. **Function Declaration Standards**
```javascript
✅ CORRECT:
function doPost(e) {
  try {
    // code here
    return ContentService.createTextOutput('success');
  } catch (error) {
    return ContentService.createTextOutput('error: ' + error.toString());
  }
}

❌ INCORRECT:
const doPost = (e) => {
  // arrow functions not reliable
}
```

### 3. **String Handling Rules**
```javascript
✅ CORRECT:
var subject = 'Your Score: ' + score + '/100';
var multiline = 'Line 1\nLine 2\nLine 3';

❌ INCORRECT:
var subject = `Your Score: ${score}/100`;
var multiline = `Line 1
Line 2
Line 3`;
```

### 4. **Google Services API Patterns**
```javascript
✅ CORRECT:
var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
GmailApp.sendEmail(email, subject, body);
ContentService.createTextOutput('response');

❌ INCORRECT:
var sheet = Sheets.get(spreadsheetId);
Gmail.send(email, subject, body);
return 'response';
```

## Prompting Framework for Google Apps Script

### **Complete Prompt Template:**
```
Create Google Apps Script code that [SPECIFIC TASK].

REQUIREMENTS:
- Use doPost(e) function structure
- Handle e.postData.contents with JSON.parse()
- Use traditional JavaScript syntax (var, single quotes, + concatenation)
- Include proper error handling with try/catch
- Return ContentService.createTextOutput()
- Use Google Apps Script APIs: SpreadsheetApp, GmailApp

CONSTRAINTS:
- No ES6+ features (no let/const/template literals/arrow functions)
- Use semicolons after all statements
- Use 'single quotes' for all strings
- Test for syntax errors before responding

DELIVERABLE:
- Complete copy/paste ready function
- No syntax errors when pasted into Google Apps Script editor
```

### **Specific Use Cases:**

#### **Email Automation:**
```
Create Google Apps Script doPost function that:
1. Receives form data from web request
2. Saves to Google Sheet with ID: [SHEET_ID]
3. Sends email with calculated scores
4. Returns success/error response

Include: Proper error handling, string concatenation for email body, GmailApp.sendEmail usage
```

#### **Data Processing:**
```
Create Google Apps Script doPost function that:
1. Parses JSON from e.postData.contents
2. Performs calculations on received data
3. Appends results to spreadsheet
4. Returns formatted response

Include: JSON.parse error handling, spreadsheet appendRow usage, proper variable declarations
```

#### **API Integration:**
```
Create Google Apps Script doPost function that:
1. Receives webhook data
2. Processes and validates input
3. Stores in Google Sheet
4. Triggers follow-up actions

Include: Input validation, proper Google Services usage, error response handling
```

## Common Error Prevention Checklist

### **Before Providing Code:**
- [ ] Check balanced parentheses and brackets
- [ ] Verify all variables declared with 'var'
- [ ] Confirm single quotes used consistently
- [ ] Ensure semicolons after statements
- [ ] Test string concatenation syntax
- [ ] Verify Google Apps Script API method names
- [ ] Confirm proper doPost(e) structure
- [ ] Include try/catch error handling
- [ ] Return ContentService.createTextOutput()

### **Testing Instructions:**
```
After receiving Google Apps Script code:
1. Copy entire function
2. Paste into Google Apps Script editor
3. Save and check for syntax errors
4. Deploy as web app if no errors
5. Test with sample data
```

## Real-World Examples

### **Working Email Function:**
```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var spreadsheetId = '1nyXU4zKNfhIGPKxX1crxKGCU8tm1_apsJRcHdeDWJJM';
    var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    
    var score = 75;
    var subject = 'Your Results: ' + score + '/100';
    var emailBody = 'Hello ' + data.name + ',\n\n' +
                    'Your score is: ' + score + '/100\n' +
                    'Thank you for using our service.\n\n' +
                    'Best regards,\nTeam';
    
    sheet.appendRow([new Date(), data.name, data.email, score]);
    GmailApp.sendEmail(data.email, subject, emailBody);
    
    return ContentService.createTextOutput('success');
  } catch (error) {
    return ContentService.createTextOutput('error: ' + error.toString());
  }
}
```

### **Data Validation Pattern:**
```javascript
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput('error: No data received');
    }
    
    var data = JSON.parse(e.postData.contents);
    
    if (!data.name || !data.email) {
      return ContentService.createTextOutput('error: Missing required fields');
    }
    
    // Process data here
    
    return ContentService.createTextOutput('success');
  } catch (error) {
    return ContentService.createTextOutput('error: ' + error.toString());
  }
}
```

## Advanced Prompting Techniques

### **For Complex Email Templates:**
```
Create Google Apps Script doPost function that generates comprehensive email with:
- Dynamic score calculations using variables
- Multi-section email body with scores, analysis, and CTA
- Proper string concatenation for readability
- Professional email formatting with \n line breaks

Use this structure for emailBody:
var emailBody = 'Section 1\n' +
                'Section 2: ' + variable + '\n' +
                'Section 3\n';
```

### **For Robust Error Handling:**
```
Create Google Apps Script doPost function with comprehensive error handling for:
- JSON parsing errors
- Google Sheets access errors
- Email sending failures
- Data validation errors

Return specific error messages for debugging while maintaining security.
```

---

## Summary: Perfect Prompt Structure

**For Copy/Paste Ready Google Apps Script Code:**

1. **State specific task clearly**
2. **Specify doPost(e) function requirement**
3. **List exact Google Services needed**
4. **Require traditional JavaScript syntax only**
5. **Request complete error handling**
6. **Ask for syntax validation before response**
7. **Specify return format (ContentService.createTextOutput)**

This framework ensures zero syntax errors and immediate functionality when pasted into Google Apps Script editor.