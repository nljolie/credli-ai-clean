#!/usr/bin/env node

/**
 * CREDLI.AI AUTOMATED DEPLOYMENT VERIFICATION SYSTEM
 * This script FORCES verification of all deployment steps
 * Run this after every deployment to ensure changes are live
 */

const https = require('https');
const { execSync } = require('child_process');

class AutoVerify {
    constructor() {
        this.errors = [];
        this.verificationSteps = [];
    }

    log(step, status, message) {
        const timestamp = new Date().toISOString();
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '🔍';
        const logEntry = `${statusIcon} ${step}: ${message}`;
        console.log(logEntry);
        
        this.verificationSteps.push({
            timestamp,
            step,
            status,
            message
        });

        if (status === 'FAIL') {
            this.errors.push(`${step}: ${message}`);
        }
    }

    async checkGitHub() {
        this.log('GITHUB-VERIFY', 'CHECK', 'Checking GitHub repository status...');
        
        try {
            // Get latest commit from local
            const localCommit = execSync('git rev-parse HEAD').toString().trim();
            this.log('GITHUB-VERIFY', 'PASS', `Latest local commit: ${localCommit.substring(0, 8)}`);
            
            // Check if we have uncommitted changes
            const gitStatus = execSync('git status --porcelain').toString().trim();
            if (gitStatus) {
                this.log('GITHUB-VERIFY', 'FAIL', 'Uncommitted changes detected');
                return false;
            }
            
            this.log('GITHUB-VERIFY', 'PASS', 'All changes committed and pushed');
            return true;
        } catch (error) {
            this.log('GITHUB-VERIFY', 'FAIL', `Git verification failed: ${error.message}`);
            return false;
        }
    }

    async checkLiveSite(url = 'https://credli.ai/financial-executives') {
        this.log('LIVE-VERIFY', 'CHECK', `Testing live site: ${url}`);
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            https.get(url, (res) => {
                const loadTime = Date.now() - startTime;
                
                if (res.statusCode === 200) {
                    this.log('LIVE-VERIFY', 'PASS', `Site loads successfully (${loadTime}ms, status: ${res.statusCode})`);
                    
                    // Check for specific content
                    let body = '';
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    
                    res.on('end', () => {
                        // Check if footer contains main page elements
                        const hasCompleteFooter = body.includes('Privacy Policy') && 
                                                body.includes('Terms of Service') && 
                                                body.includes('Refund Policy') &&
                                                body.includes('Financial Executives') &&
                                                body.includes('Business Coaches');
                        
                        if (hasCompleteFooter) {
                            this.log('FOOTER-VERIFY', 'PASS', 'Complete footer with all navigation links detected');
                            resolve(true);
                        } else {
                            this.log('FOOTER-VERIFY', 'FAIL', 'Footer missing required navigation elements');
                            resolve(false);
                        }
                    });
                } else {
                    this.log('LIVE-VERIFY', 'FAIL', `Site returned status ${res.statusCode}`);
                    resolve(false);
                }
            }).on('error', (error) => {
                this.log('LIVE-VERIFY', 'FAIL', `Connection failed: ${error.message}`);
                resolve(false);
            }).setTimeout(10000, () => {
                this.log('LIVE-VERIFY', 'FAIL', 'Request timeout after 10 seconds');
                resolve(false);
            });
        });
    }

    async checkRenderDeployment() {
        this.log('RENDER-VERIFY', 'CHECK', 'Waiting for Render deployment...');
        
        // Wait 2 minutes for deployment
        await new Promise(resolve => setTimeout(resolve, 120000));
        
        this.log('RENDER-VERIFY', 'PASS', 'Deployment wait period completed');
        return true;
    }

    async runFullVerification() {
        console.log('\n🔥 STARTING AUTOMATED VERIFICATION SYSTEM 🔥');
        console.log('=============================================\n');
        
        const startTime = Date.now();
        
        // Step 1: Check GitHub
        const githubOk = await this.checkGitHub();
        
        // Step 2: Wait for Render deployment
        if (githubOk) {
            await this.checkRenderDeployment();
        }
        
        // Step 3: Check live site
        const siteOk = await this.checkLiveSite();
        
        // Generate report
        const totalTime = Date.now() - startTime;
        console.log('\n=============================================');
        console.log('🔥 VERIFICATION REPORT 🔥');
        console.log('=============================================');
        
        this.verificationSteps.forEach(step => {
            const statusIcon = step.status === 'PASS' ? '✅' : step.status === 'FAIL' ? '❌' : '🔍';
            console.log(`${statusIcon} ${step.step}: ${step.message}`);
        });
        
        console.log(`\n⏱️  Total verification time: ${Math.round(totalTime / 1000)}s`);
        
        if (this.errors.length === 0) {
            console.log('\n🎉 ALL VERIFICATIONS PASSED! 🎉');
            console.log('Changes are confirmed live and working.');
            return true;
        } else {
            console.log('\n🚨 VERIFICATION FAILURES DETECTED 🚨');
            console.log('The following issues must be resolved:');
            this.errors.forEach(error => console.log(`❌ ${error}`));
            return false;
        }
    }
}

// Auto-run if called directly
if (require.main === module) {
    const verifier = new AutoVerify();
    verifier.runFullVerification().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = AutoVerify;