# CREDLI.AI FILE STRUCTURE - IMPORTANT NOTES

## Express.js Static File Serving

**CRITICAL:** This project uses Express.js server with static file serving from `/public/` folder.

### File Mapping:
- `public/landing.html` → `https://credli.ai/landing.html`
- `public/dashboard.html` → `https://credli.ai/dashboard.html`
- `public/temporary/landing-temporary.html` → `https://credli.ai/temporary/landing-temporary.html`
- `public/demo.html` → `https://credli.ai/demo.html`
- `public/cred-score.html` → `https://credli.ai/cred-score.html`

### Server Configuration:
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

### Root Level Files:
- `login.html` → `https://credli.ai/login.html` (login system)
- `signup.html` → `https://credli.ai/signup.html` (account creation)
- `forgot-password.html` → `https://credli.ai/forgot-password.html` (password reset)

## DEPLOYMENT WORKFLOW:
1. Edit files in `/public/` folder for main website pages
2. Edit files at root level for authentication system
3. Commit to GitHub
4. Render.com automatically deploys from GitHub
5. Changes appear live on credli.ai

## DO NOT GET CONFUSED:
- `/public/` folder is correct for main website files
- Root level is correct for auth system files
- Express serves `/public/` as web root automatically