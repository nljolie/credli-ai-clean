# CREDLI.AI QUALITY CONTROL CHECKLIST

## 🔒 MANDATORY VERIFICATION CODES
**Every change MUST be verified using these codes before marking any task complete**

### 🔥 QC-001: CORE VERIFICATION PROTOCOL
**USE THIS CODE FOR EVERY CHANGE**
- [ ] ✅ **READ-VERIFY**: Read the exact file that was modified to confirm changes applied
- [ ] ✅ **COMMIT-VERIFY**: Confirm git commit completed with descriptive message
- [ ] ✅ **PUSH-VERIFY**: Confirm changes pushed to GitHub repository
- [ ] ✅ **DEPLOY-VERIFY**: Wait for Render deployment completion (check dashboard)
- [ ] ✅ **LIVE-VERIFY**: Test live site functionality at https://credli.ai
- [ ] ✅ **VISUAL-VERIFY**: Confirm visual formatting matches requirements exactly

### 🔥 QC-002: HTML/CSS CHANGES
**Use this code when modifying any HTML or CSS files**
- [ ] ✅ **STRUCTURE-VERIFY**: Confirm HTML structure matches main landing page
- [ ] ✅ **RESPONSIVE-VERIFY**: Test mobile responsiveness on multiple screen sizes  
- [ ] ✅ **CROSS-BROWSER-VERIFY**: Check Chrome, Firefox, Safari compatibility
- [ ] ✅ **PERFORMANCE-VERIFY**: Ensure no broken CSS links or missing assets
- [ ] ✅ **SCHEMA-VERIFY**: Validate schema markup using Google Rich Results Test

### 🔥 QC-003: DEPLOYMENT VERIFICATION
**Use this code for all deployment operations**
- [ ] ✅ **PRE-DEPLOY**: Confirm all files staged and committed properly
- [ ] ✅ **GITHUB-VERIFY**: Check GitHub repository shows latest commit
- [ ] ✅ **RENDER-VERIFY**: Monitor Render dashboard for deployment status
- [ ] ✅ **CACHE-VERIFY**: Clear browser cache and test live site
- [ ] ✅ **URL-VERIFY**: Test all modified URLs return 200 status (not 404)
- [ ] ✅ **FUNCTIONALITY-VERIFY**: Test all interactive elements work properly

### 🔥 QC-004: CONTENT STRATEGY PAGES
**Use this code for industry-specific landing pages**
- [ ] ✅ **HERO-VERIFY**: Headline + subheader match industry focus
- [ ] ✅ **LAYOUT-VERIFY**: Left content + right score demo structure maintained
- [ ] ✅ **PROBLEM-VERIFY**: Two-column problem sections with visual delineation
- [ ] ✅ **CTA-VERIFY**: All buttons link to #pricing section correctly
- [ ] ✅ **SCHEMA-VERIFY**: Industry-specific schema markup implemented
- [ ] ✅ **SEO-VERIFY**: Meta tags, titles optimized for target keywords
- [ ] ✅ **ROUTING-VERIFY**: MANDATORY - Run QC-005 to ensure server.js route exists

### 🔥 QC-005: SERVER.JS ROUTING VERIFICATION
**MANDATORY for ANY new HTML page creation - prevents 404 errors**
- [ ] ✅ **ROUTE-EXISTS-VERIFY**: Check if explicit route exists in server.js for new page
- [ ] ✅ **ROUTE-PATH-VERIFY**: Confirm route path matches URL structure (e.g., `/financial-advisors`)
- [ ] ✅ **FILE-PATH-VERIFY**: Confirm route points to correct HTML file in public folder
- [ ] ✅ **STATIC-SERVING-VERIFY**: Confirm express.static is configured properly
- [ ] ✅ **ROUTE-ORDER-VERIFY**: Explicit routes placed BEFORE express.static middleware
- [ ] ✅ **URL-TEST-VERIFY**: Test URL returns 200 status (not 404) after deployment

### 🔥 QC-006: API/BACKEND CHANGES
**Use this code for server-side modifications**
- [ ] ✅ **ENV-VERIFY**: Environment variables properly configured
- [ ] ✅ **ENDPOINT-VERIFY**: API endpoints return expected responses
- [ ] ✅ **RATE-LIMIT-VERIFY**: Rate limiting functions as intended
- [ ] ✅ **ERROR-HANDLING-VERIFY**: Error responses handled gracefully
- [ ] ✅ **SECURITY-VERIFY**: No API keys or secrets exposed in source code

## 🚨 SERVER.JS ROUTING PREVENTION PROTOCOL

### 🔥 CRITICAL: EVERY NEW HTML PAGE REQUIRES SERVER.JS VERIFICATION
**This prevents 404 errors that waste deployment time and user resources**

1. **BEFORE creating any new HTML page, ALWAYS check server.js first**
2. **MANDATORY: Add explicit route BEFORE marking page creation complete**
3. **NEVER assume express.static will handle new pages automatically**

### COMMON SERVER.JS ROUTING ERRORS:
- ❌ Creating `/financial-advisors.html` but no `/financial-advisors` route
- ❌ Assuming express.static serves all pages (it doesn't for clean URLs)
- ❌ Forgetting to add route when creating industry-specific pages
- ❌ Not testing URLs return 200 status after deployment

### MANDATORY SERVER.JS CHECK FOR NEW PAGES:
```javascript
// ALWAYS ADD EXPLICIT ROUTES LIKE THIS:
app.get('/financial-advisors', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'financial-advisors.html'));
});
app.get('/wealth-managers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wealth-managers.html'));
});
```

## 🚨 ACCOUNTABILITY RULES

### NEVER MARK COMPLETE WITHOUT:
1. **Running the appropriate QC code verification**
2. **Physically testing the live site at https://credli.ai**  
3. **Confirming deployment completed successfully**
4. **Reading the actual modified files to confirm changes applied**

### IMMEDIATE ROLLBACK IF:
1. **404 errors appear on any page**
2. **Visual formatting breaks from main page structure**
3. **API endpoints return errors**
4. **Mobile responsiveness fails**

### ESCALATION TRIGGERS:
1. **Deployment takes longer than 10 minutes**
2. **Live site doesn't reflect committed changes**
3. **Any QC verification step fails**
4. **User reports formatting or functionality issues**

## 📋 TASK COMPLETION PROTOCOL

**BEFORE marking any todo as completed:**
1. Run appropriate QC verification code
2. Document which QC code was used
3. Confirm ALL checklist items passed
4. Test live site functionality
5. Only then mark task as ✅ completed

**EXAMPLE COMPLETION:**
```
✅ LANDING PAGE: Create /financial-advisors page - COMPLETE
   QC-004 VERIFIED: All hero/layout/problem/CTA/schema/SEO checks passed
   LIVE SITE TESTED: https://credli.ai/financial-advisors loads correctly
```

## 🎯 QUALITY STANDARDS

### Visual Formatting Requirements:
- Exact match to main landing page structure
- Proper headline hierarchy (H1, H2, H3)
- Two-column problem sections with visual delineation
- Right-side score demo integration
- Mobile-responsive design maintained

### Technical Requirements:
- 200 status codes (no 404 errors)
- Fast page load times (<3 seconds)
- Schema markup validation passes
- Cross-browser compatibility
- No console errors or broken links

### Deployment Requirements:
- Git commits with descriptive messages
- Successful push to GitHub repository  
- Render deployment completion confirmed
- Live site functionality verified
- Cache-cleared testing performed

---

**🔥 THIS CHECKLIST IS MANDATORY - NO EXCEPTIONS**
**Every change requires QC code verification before task completion**