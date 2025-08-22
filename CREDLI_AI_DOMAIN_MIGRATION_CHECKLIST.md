# 🚀 CREDLI.AI DOMAIN MIGRATION CHECKLIST
**Complete Pre-Launch Verification for credli.ai Domain**

---

## 🌐 **DOMAIN & DNS CONFIGURATION**

### **Domain Setup**
- [ ] **Purchase credli.ai domain** (if not already owned)
- [ ] **Configure DNS settings** to point to hosting provider
- [ ] **Set up www.credli.ai redirect** to https://credli.ai/
- [ ] **Configure SSL certificate** for HTTPS
- [ ] **Verify domain propagation** globally (24-48 hours)

### **Hosting Configuration**
- [ ] **Connect credli.ai domain** to current hosting (Render.com or new host)
- [ ] **Test all pages load** on credli.ai domain
- [ ] **Verify HTTPS redirect** works (http → https)
- [ ] **Test mobile responsiveness** on new domain

---

## 🔍 **SEO & META TAG VERIFICATION**

### **Meta Tags - Already Configured**
✅ **Title Tag**: "Credli.ai - AI Trust Consulting | AI Strategy, AI Literacy, GEO, AEO by Nicole Jolie"
✅ **Meta Description**: AI Strategy, AI Literacy, GEO, AEO, entrepreneur, saas keywords
✅ **Keywords**: All specified keywords including Nicole Jolie
✅ **Author Tag**: Nicole Jolie
✅ **Canonical URL**: Set to https://credli.ai/

### **Structured Data - Already Configured**
✅ **JSON-LD Schema**: Organization with Nicole Jolie as Founder & CEO
✅ **Service Definitions**: AI Trust Consulting, GEO, AEO
✅ **Keyword Integration**: Comprehensive keyword coverage

### **Open Graph & Social - Already Configured**
✅ **OG Tags**: Updated for credli.ai domain
✅ **Twitter Cards**: Configured with Nicole Jolie attribution
✅ **Social Images**: Set to credli.ai/og-image.svg

### **Post-Migration Verification**
- [ ] **Google Search Console**: Add credli.ai property
- [ ] **Submit XML sitemap** to Google Search Console
- [ ] **Bing Webmaster Tools**: Add credli.ai property
- [ ] **Test structured data** with Google's Rich Results Test
- [ ] **Verify social sharing** displays correctly (Facebook, Twitter, LinkedIn)

---

## 🔗 **LINK & FUNCTIONALITY TESTING**

### **Navigation Links - Already Configured**
✅ **External links open in new windows** (`target="_blank"`)
✅ **Internal anchor links** work properly
✅ **Footer links** all have target="_blank"

### **Post-Migration Testing**
- [ ] **Test all navigation links** work on credli.ai
- [ ] **Verify "Get Your Cred Score" buttons** link correctly
- [ ] **Test Tally form integration** (Executive Application)
- [ ] **Check all footer legal links** function
- [ ] **Verify external citation links** still work

---

## 📱 **TECHNICAL FUNCTIONALITY**

### **Core Features**
- [ ] **Free Cred Score form** submits correctly
- [ ] **Math CAPTCHA replacement** (checkbox) works
- [ ] **ROI Comparison section** displays properly
- [ ] **Dual pricing containers** render correctly
- [ ] **Executive Application section** functions
- [ ] **Mobile responsive design** works across devices

### **API Integrations**
- [ ] **Gemini API** connection working
- [ ] **ChatGPT API** integration functional
- [ ] **Trust Factor calculation** running
- [ ] **Dashboard access** working post-payment
- [ ] **Session management** functioning

---

## 🔐 **SECURITY & PERFORMANCE**

### **Security**
- [ ] **SSL certificate** active and valid
- [ ] **HTTPS enforcement** working
- [ ] **Environment variables** properly configured
- [ ] **API keys** securely stored
- [ ] **Bot protection** functioning

### **Performance**
- [ ] **Page load speed** under 3 seconds
- [ ] **Mobile performance** optimized
- [ ] **CDN configuration** if applicable
- [ ] **Image optimization** complete
- [ ] **CSS/JS minification** if needed

---

## 📊 **ANALYTICS & TRACKING**

### **Analytics Setup**
- [ ] **Google Analytics 4** configured for credli.ai
- [ ] **Google Tag Manager** set up if needed
- [ ] **Conversion tracking** for form submissions
- [ ] **Event tracking** for button clicks
- [ ] **Goal setup** for lead generation

### **Marketing Integrations**
- [ ] **Facebook Pixel** (if applicable)
- [ ] **LinkedIn Insight Tag** (if applicable)
- [ ] **Email marketing integration** (if applicable)

---

## 🎯 **BUSINESS FUNCTIONALITY**

### **Pricing & Payments** 
- [ ] **Professional Beta Plan** ($197/month) displays correctly
- [ ] **Executive Growth Cohort** ($9,000/3 months) shows properly
- [ ] **Executive Application form** (Tally) working
- [ ] **Payment processing** functional when implemented
- [ ] **Success pages** configured

### **Lead Generation**
- [ ] **Free Cred Score form** capturing leads
- [ ] **Email notifications** working
- [ ] **Lead routing** to appropriate systems
- [ ] **Follow-up sequences** configured

---

## 🚨 **CRITICAL PRE-LAUNCH CHECKS**

### **Final Verification (Do These Last)**
- [ ] **All pages load on credli.ai** without errors
- [ ] **No broken links** anywhere on site
- [ ] **Contact forms work** and send emails
- [ ] **Mobile experience** is flawless
- [ ] **Page speed** is optimized
- [ ] **SEO meta tags** display correctly in search results
- [ ] **Social sharing** works perfectly
- [ ] **SSL certificate** shows secure lock icon

### **Rollback Plan**
- [ ] **Backup of current working version** available
- [ ] **DNS rollback procedure** documented
- [ ] **Emergency contact information** for hosting provider
- [ ] **Testing environment** available for fixes

---

## 📈 **POST-LAUNCH MONITORING**

### **Week 1 After Launch**
- [ ] **Monitor error logs** for any issues
- [ ] **Check form submissions** are working
- [ ] **Monitor page performance** metrics
- [ ] **Test from different devices/browsers**
- [ ] **Verify SEO indexing** begins

### **Month 1 After Launch**
- [ ] **Review Google Search Console** for crawl errors
- [ ] **Monitor search rankings** for target keywords
- [ ] **Check conversion rates** vs previous version
- [ ] **Review user feedback** and issues
- [ ] **Plan iterative improvements**

---

## 🔗 **COMPREHENSIVE LINK VERIFICATION CHECKLIST**

### **File Path Verification - CRITICAL**
- [ ] **Verify ALL internal links match actual file structure in GitHub**
- [ ] **Check for /public/ path errors** (should be root level for most files)
- [ ] **Confirm all free-cred-score.html links work**
- [ ] **Test all navigation menu links**
- [ ] **Validate all CTA button links**

### **Internal Link Audit by File**

#### **index.html Links**
- [ ] Navigation: `/free-cred-score.html` (NOT `/public/free-cred-score.html`)
- [ ] CTA buttons: `/free-cred-score.html` with `target="_blank"`
- [ ] Footer links: All paths verified against GitHub structure
- [ ] No broken `/public/` prefix errors

#### **landing.html Links** 
- [ ] Navigation: `free-cred-score.html` (relative path)
- [ ] Get Cred Score buttons: `/free-cred-score.html` with `target="_blank"`
- [ ] Footer links: All legal pages exist in /public/ folder
- [ ] Executive Application: Tally form URL working

#### **free-cred-score.html Links**
- [ ] Navigation back to: `/landing.html` 
- [ ] Footer legal links: All point to correct `/public/` files
- [ ] Form action: Points to correct API endpoint `/api/free-cred-score`
- [ ] CSS/JS assets: Correct version numbers for cache busting

#### **All Dashboard Files**
- [ ] **dashboard-complete.html**: All internal links verified
- [ ] **dashboard-new.html**: All internal links verified  
- [ ] **demo-results.html**: Fixed `/public/` prefix errors
- [ ] Return to landing page links working

### **External Link Verification**
- [ ] **Tally Executive Application form**: URL active and functional
- [ ] **Legal page links**: All target="_blank" for external navigation
- [ ] **Social media links**: All URLs current and working
- [ ] **Google Analytics**: Tracking codes updated for credli.ai

### **API Endpoint Verification**
- [ ] **Free Cred Score API**: `/api/free-cred-score` (NOT `/api/free-scan`)
- [ ] **PayPal API endpoints**: All paths correct when implemented
- [ ] **Webhook endpoints**: All paths match server.js definitions
- [ ] **Test API endpoints**: All development URLs removed

### **Asset Path Verification**
- [ ] **CSS files**: `landing-styles.css` with current version number
- [ ] **JavaScript files**: All `.js` files with current version numbers  
- [ ] **Images**: `og-image.svg` and other assets accessible
- [ ] **Fonts**: Google Fonts and local font files loading

### **SEO Meta Tag Link Verification**
- [ ] **Canonical URLs**: All point to `https://credli.ai/[page]`
- [ ] **Open Graph URLs**: All point to `https://credli.ai/[page]`
- [ ] **Twitter Card images**: All point to `https://credli.ai/og-image.svg`
- [ ] **No Railway references**: All old hosting URLs removed

### **Form Action Verification**
- [ ] **Free Cred Score form**: Posts to `/api/free-cred-score`
- [ ] **Contact forms**: All form actions point to correct endpoints
- [ ] **Newsletter signup**: Form actions verified
- [ ] **Payment forms**: All PayPal/Stripe endpoints correct

### **Cross-Browser Link Testing**
- [ ] **Chrome**: All links work on desktop and mobile
- [ ] **Safari**: All links work on desktop and mobile  
- [ ] **Firefox**: All links work on desktop and mobile
- [ ] **Edge**: All links work on desktop and mobile
- [ ] **Mobile Safari**: Touch navigation working correctly

### **Link Performance Testing**
- [ ] **Page load speed**: All linked pages load under 3 seconds
- [ ] **Mobile responsiveness**: All linked pages work on mobile
- [ ] **Target="_blank" behavior**: New tabs open correctly for external links
- [ ] **Internal navigation**: Smooth scrolling and navigation working

### **Broken Link Detection**
- [ ] **Run comprehensive broken link check** across all files
- [ ] **Test 404 error handling** for missing pages
- [ ] **Verify all legal page links** point to existing files
- [ ] **Check all footer navigation** links work correctly

### **GitHub File Structure Verification**
```
/public/
├── free-cred-score.html ✅
├── landing.html ✅  
├── privacy-policy.html ✅
├── terms-of-service.html ✅
├── [all legal pages] ✅
├── landing-styles.css ✅
├── free-cred-score.js ✅
├── bot-protection.js ✅
└── [all asset files] ✅

/root/
├── index.html ✅
├── server.js ✅
└── package.json ✅
```

### **EMERGENCY LINK FIX PROTOCOL**
If ANY link is broken during migration:
1. **Immediately identify** the broken link source file
2. **Check GitHub file structure** to find correct path
3. **Fix path reference** and remove any `/public/` prefix errors  
4. **Test link functionality** before and after fix
5. **Update cache busting** version numbers
6. **Deploy and verify** fix is live within 5 minutes

---

## ✅ **NICOLE JOLIE ATTRIBUTION VERIFICATION**

### **SEO Attribution - Invisible to Users**
✅ **Meta author tag**: Nicole Jolie
✅ **JSON-LD founder**: Nicole Jolie as Founder & CEO  
✅ **Open Graph author**: Nicole Jolie
✅ **Twitter creator**: Nicole Jolie
✅ **Title integration**: "by Nicole Jolie"

### **No Visible Attribution Required**
- Nicole Jolie's name appears ONLY in SEO tags for bots/crawlers
- No visible mention on website for users
- Search engines will recognize Nicole Jolie as the authority

---

**🎯 MIGRATION SUCCESS CRITERIA:**
- All functionality works on credli.ai domain
- SEO optimization is active and crawlable  
- Nicole Jolie attribution is present for search engines
- No broken links or errors
- Mobile experience is perfect
- Lead generation forms are capturing data

**⚠️ DO NOT GO LIVE UNTIL ALL ITEMS ARE CHECKED**