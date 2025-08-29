# DEPLOYMENT CHECKLIST PROMPT

## BEFORE ANY GIT COMMIT OR DEPLOYMENT - ALWAYS RUN THIS CHECKLIST:

### ✅ 1. VERIFY CURRENT WORKING DIRECTORY
- [ ] Confirm I'm in `/Users/besociallysmashinghome/claude-sandbox/lesson-01/trustsource`
- [ ] NOT in `/public` or `/lesson-01` 

### ✅ 2. FILE STRUCTURE CHECK
- [ ] All HTML files in trustsource root (no public/ folder)
- [ ] Only ONE CSS file: landing-styles.css
- [ ] server.js serves from __dirname (not public/)

### ✅ 3. CONTENT VERIFICATION
- [ ] Text formatting correct (no overlaps)
- [ ] Button padding proper (space between text and button edges)
- [ ] Mobile responsive layout working
- [ ] All links functional

### ✅ 4. CSS VALIDATION
- [ ] No syntax errors in landing-styles.css
- [ ] All braces balanced
- [ ] No duplicate styling

### ✅ 5. GIT WORKFLOW
- [ ] Run `git add .`
- [ ] Run `git status` to verify changes
- [ ] Commit with descriptive message
- [ ] Push to origin main

### ✅ 6. DEPLOYMENT
- [ ] Deploy to render.com
- [ ] Test on http://localhost:5050/ (PORT 5050 - NOT 3000)
- [ ] Verify live site functionality

## CRITICAL REMINDER: 
- Server runs on PORT 5050
- Use absolute paths from trustsource root
- ONE CSS file only
- NO public/ directory