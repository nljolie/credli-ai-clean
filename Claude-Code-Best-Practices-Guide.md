# Claude Code Best Practices Guide - Credli.ai
*Main Reference Guide for All Site Changes and Development*

## MANDATORY PROTOCOLS

### 1. **Read-First Protocol** 🔴 CRITICAL
```
RULE: ALWAYS Read file before Edit
SEQUENCE: Read → Edit → Test → Commit → Push
REASON: Edit tool requires file content in memory
ERROR PREVENTION: Eliminates "file not read" errors
```

### 2. **Function-by-Function Planning Protocol**
Before ANY code changes:
```
PLAN: [What function does]
INPUT: [What data it receives]  
OUTPUT: [What it returns]
DEPENDENCIES: [What it needs to work]
TESTING: [How to verify it works]
```

### 3. **Token-Efficient Response Pattern**
Structure all responses as:
```
ANALYSIS: [Brief problem assessment]
SOLUTION: [Specific fix]
CODE: [Minimal working code]
TEST: [Verification step]
```

## CREDLI.AI SYSTEM ARCHITECTURE

### **Tech Stack**
- **Backend**: Node.js/Express server
- **Database**: Google Sheets integration via Apps Script
- **Frontend**: HTML/CSS/JS (no frameworks)
- **APIs**: OpenAI ChatGPT integration, proprietary scoring
- **Deployment**: GitHub → Render.com auto-deploy
- **Email**: Google Apps Script + Gmail API

### **File Structure**
```
credli.ai/
├── index.html          (main landing page - served at /)
├── demo.html           (form for data collection)  
├── results-score.html  (results display page)
├── server.js           (API endpoints and routing)
├── landing-styles.css  (main stylesheet)
└── Google Apps Script  (email automation)
```

### **Critical URLs**
- **Main site**: credli.ai (served by index.html)
- **Demo form**: credli.ai/demo.html
- **Results**: credli.ai/results-score.html
- **Google Apps Script**: External deployment for email

## DEVELOPMENT WORKFLOW

### **Phase 1: Analysis & Planning**
1. **READ** current state of all affected files
2. **IDENTIFY** exact changes needed
3. **PLAN** step-by-step approach
4. **CONFIRM** with user before proceeding

### **Phase 2: Implementation**  
1. **READ** file first (mandatory)
2. **EDIT** with precise changes
3. **TEST** functionality locally if possible
4. **DOCUMENT** changes in task file

### **Phase 3: Deployment**
1. **COMMIT** with clear descriptive message
2. **PUSH** to trigger Render deployment
3. **VERIFY** live site functionality
4. **UPDATE** task documentation

## SPECIFIC BEST PRACTICES

### **File Editing**
```
✅ CORRECT SEQUENCE:
1. Read file completely
2. Identify exact lines to change
3. Use Edit tool with precise old_string/new_string
4. Verify changes were applied

❌ NEVER DO:
- Edit without reading first
- Make assumptions about file content
- Edit multiple files simultaneously without reading each
```

### **Button/Link Updates**
```
✅ PROCESS:
1. Read file to see current HTML structure
2. Use Grep to find all instances of old URL
3. Edit each instance with exact old_string match
4. Verify all instances updated

❌ AVOID:
- Assuming URL locations without verification
- Partial string matches that could break HTML
```

### **API Integration**
```
✅ APPROACH:
1. Understand data flow: Form → Server → Google Sheets → Email
2. Test API calls incrementally
3. Use proper error handling
4. Maintain existing variable names

❌ AVOID:
- Changing working API endpoints
- Breaking existing data structures
- Adding unnecessary complexity
```

## ERROR PREVENTION CHECKLIST

### **Before Making ANY Changes:**
- [ ] Read all affected files completely
- [ ] Understand current functionality
- [ ] Identify exact changes needed
- [ ] Plan step-by-step approach
- [ ] Get user confirmation

### **During Implementation:**
- [ ] Follow Read-First Protocol
- [ ] Make minimal necessary changes only
- [ ] Test each change incrementally
- [ ] Document all changes made

### **After Changes:**
- [ ] Verify changes applied correctly
- [ ] Test functionality if possible
- [ ] Commit with descriptive message
- [ ] Update task documentation

## PAGE-BY-PAGE APPROACH

### **Why Page-by-Page:**
- Prevents token waste
- Reduces breaking changes
- Allows incremental testing
- Maintains system stability

### **Implementation:**
1. **Identify** all affected pages
2. **Prioritize** by importance/dependency
3. **Change one page** at a time
4. **Test** each page before moving to next
5. **Document** changes for each page

## GOOGLE APPS SCRIPT INTEGRATION

### **Email System Flow:**
```
demo.html form → /api/free-cred-score → Google Apps Script → Gmail
```

### **Key Requirements:**
- Traditional JavaScript syntax (var, single quotes)
- Proper error handling with try/catch
- String concatenation (no template literals)
- Return ContentService.createTextOutput()

### **Refer to:** `Google-Apps-Script-Prompting-Guide.md` for syntax

## COMMUNICATION PATTERNS

### **Efficient Prompting:**
```
TASK: [Specific action needed]
FILES: [Exact files to modify]
CHANGES: [Precise modifications required]
CONSTRAINTS: [What NOT to change]
TESTING: [How to verify success]
```

### **Response Structure:**
```
ANALYSIS: [Brief assessment]
PLAN: [Step-by-step approach]
IMPLEMENTATION: [Actual changes]
VERIFICATION: [Testing/confirmation]
```

## TROUBLESHOOTING COMMON ISSUES

### **"File not read" Error:**
- **Cause**: Attempted Edit without Read
- **Solution**: Always use Read tool first
- **Prevention**: Follow Read-First Protocol

### **Broken Links/Buttons:**
- **Cause**: Incorrect URL changes or HTML structure
- **Solution**: Read file to see exact HTML, use precise string matching
- **Prevention**: Grep for all instances before editing

### **API Integration Failures:**
- **Cause**: Changed working endpoints or data structures
- **Solution**: Revert to known working state, make minimal changes
- **Prevention**: Understand complete data flow first

## DEPLOYMENT CONSIDERATIONS

### **Render.com Auto-Deploy:**
- Triggers automatically on git push
- Takes 2-3 minutes for deployment
- Monitor deployment logs for errors
- Test live site after deployment

### **Environment Variables:**
- Set in Render dashboard
- Include: OPENAI_API_KEY, Google Apps Script IDs
- Restart service after environment changes

## TASK DOCUMENTATION STANDARDS

### **Daily Task Files:**
- Create `September [Date], 2025.md` for each session
- Document ALL changes made
- Include commit IDs and deployment status
- Record lessons learned and protocols established

### **Documentation Format:**
```
### [Task Name] [Status]
**Objective**: [What was accomplished]
**Changes**: [Specific modifications made]
**Files**: [Which files were updated]
**Commit**: [Git commit ID]
**Status**: [Success/Issues/Next steps]
```

---

## SUMMARY: CORE PRINCIPLES

1. **READ FIRST** - Always read files before editing
2. **PLAN THOROUGHLY** - Understand complete system before changes  
3. **CHANGE INCREMENTALLY** - One page/function at a time
4. **TEST CONTINUOUSLY** - Verify each change works
5. **DOCUMENT EVERYTHING** - Record all changes and decisions
6. **FOLLOW PATTERNS** - Use established code structures
7. **MINIMIZE TOKENS** - Be precise and efficient
8. **PREVENT ERRORS** - Use checklists and protocols

This guide ensures technically problem-free development for credli.ai SaaS platform.