# 🚨 MANDATORY DEPLOYMENT PROTOCOL - NON-NEGOTIABLE

## AUTOMATIC ENFORCEMENT ACTIVE
- Pre-push git hook installed: `.git/hooks/pre-push`
- This file displays checklist reminder every git push
- **NO EXCEPTIONS** - Must complete all 9 steps

## REQUIRED STEPS - CANNOT BE SKIPPED

### STEP 1: LOCAL CODE CHANGES ✅
- Make requested code changes
- Save all files  
- Use Read tool to verify changes are present

### STEP 2: LOCAL TESTING ✅
- Test changes locally when possible
- Verify functionality works as expected

### STEP 3: GIT STATUS CHECK ✅
```bash
git status
```
- Verify all intended files are listed as modified
- Check if branch is ahead of origin (unpushed commits)

### STEP 4: COMMIT TO LOCAL GIT ✅
```bash
git add .
git commit -m "descriptive message"
```
- Always commit before pushing
- Use descriptive commit messages

### STEP 5: PUSH TO GITHUB ✅
```bash
git push origin main
```
- Pre-push hook will display this checklist
- Verify push completed without errors

### STEP 6: VERIFY GITHUB UPDATED ❌
```bash
# Use WebFetch to check GitHub repository
```
- Check if GitHub shows latest code
- Look for specific changes made
- Verify changes are visible in remote repository

### STEP 7: HOSTING PLATFORM DEPLOYMENT ❌
- **RENDER.COM**: Wait full 3 minutes for deployment
- Check deployment logs for completion status
- Verify new commit hash in deployment

### STEP 8: PRODUCTION VERIFICATION ❌
```bash
# Use WebFetch to check live URL
```
- Verify specific changes are visible on production site
- Check for old cached elements (timestamps, text, styling)
- Confirm user-requested changes are live and functional

### STEP 9: USER VERIFICATION ❌
- Inform user changes are deployed
- Provide exact URL to test
- Wait for user confirmation before proceeding
- Troubleshoot if user reports issues

## FAILURE CONSEQUENCES
- Each skipped step costs user time and resources
- Multiple deployment iterations reduce trust
- Breaks professional development workflow

## SUCCESS CRITERIA
**ONLY mark deployment complete when ALL 9 steps verified ✅**

## ENFORCEMENT MECHANISMS
1. **Pre-push git hook**: Displays checklist every push
2. **This protocol file**: Reference document for every deployment  
3. **TodoWrite tracking**: Must track deployment progress
4. **User accountability**: No exceptions, no shortcuts

---

**⚠️ REMEMBER: Following this checklist is NON-NEGOTIABLE**
**Every deployment MUST complete all 9 steps in sequence**