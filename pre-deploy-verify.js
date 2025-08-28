#!/usr/bin/env node

/**
 * CREDLI.AI PRE-DEPLOYMENT VERIFICATION SYSTEM
 * This script MUST be run BEFORE any git push or deployment
 * Catches all errors locally to prevent wasted deployments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PreDeployVerify {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.checks = [];
        this.modifiedFiles = [];
    }

    log(check, status, message, isBlocking = false) {
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '🔍';
        const logEntry = `${statusIcon} ${check}: ${message}`;
        console.log(logEntry);
        
        this.checks.push({ check, status, message, isBlocking });

        if (status === 'FAIL' && isBlocking) {
            this.errors.push(`${check}: ${message}`);
        } else if (status === 'WARN' || (status === 'FAIL' && !isBlocking)) {
            this.warnings.push(`${check}: ${message}`);
        }
    }

    getModifiedFiles() {
        try {
            const gitStatus = execSync('git status --porcelain').toString();
            const lines = gitStatus.split('\n').filter(line => line.trim());
            
            this.modifiedFiles = lines.map(line => {
                const status = line.substring(0, 2);
                const file = line.substring(3);
                return { status: status.trim(), file };
            });
            
            this.log('GIT-STATUS', 'CHECK', `Found ${this.modifiedFiles.length} modified files`);
            return this.modifiedFiles;
        } catch (error) {
            this.log('GIT-STATUS', 'FAIL', `Could not get git status: ${error.message}`, true);
            return [];
        }
    }

    verifyFileContents() {
        this.log('FILE-VERIFY', 'CHECK', 'Verifying file contents match requirements...');
        
        const htmlFiles = this.modifiedFiles.filter(f => f.file.endsWith('.html'));
        let allFilesValid = true;

        htmlFiles.forEach(({ file }) => {
            const filePath = path.join(process.cwd(), file);
            
            if (!fs.existsSync(filePath)) {
                this.log('FILE-VERIFY', 'FAIL', `File does not exist: ${file}`, true);
                allFilesValid = false;
                return;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for financial-executives specific requirements
            if (file.includes('financial-executives')) {
                this.verifyFinancialExecutivesPage(content, file);
            }
            
            // Universal checks for all HTML files
            this.verifyUniversalHtmlRequirements(content, file);
        });

        return allFilesValid;
    }

    verifyFinancialExecutivesPage(content, filename) {
        // Check footer requirements
        const footerChecks = [
            { pattern: 'Privacy Policy', name: 'Privacy Policy link' },
            { pattern: 'Terms of Service', name: 'Terms of Service link' },
            { pattern: 'Refund Policy', name: 'Refund Policy link' },
            { pattern: 'Financial Executives', name: 'Financial Executives navigation' },
            { pattern: 'Business Coaches', name: 'Business Coaches navigation' },
            { pattern: 'credli.ai', name: 'Credli.ai branding' }
        ];

        footerChecks.forEach(check => {
            if (content.includes(check.pattern)) {
                this.log('FOOTER-VERIFY', 'PASS', `${check.name} found in ${filename}`);
            } else {
                this.log('FOOTER-VERIFY', 'FAIL', `Missing ${check.name} in ${filename}`, true);
            }
        });

        // Check pricing structure
        if (content.includes('$9,000 Investment over 3 months')) {
            this.log('PRICING-VERIFY', 'PASS', 'Correct $9,000 pricing structure found');
        } else {
            this.log('PRICING-VERIFY', 'FAIL', 'Missing $9,000 pricing structure', true);
        }

        // Check for removed beta references
        const betaPatterns = ['$497', 'beta', 'Beta', 'BETA', 'paypal', 'PayPal'];
        betaPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
                this.log('BETA-REMOVAL', 'FAIL', `Found prohibited "${pattern}" reference in ${filename}`, true);
            } else {
                this.log('BETA-REMOVAL', 'PASS', `No "${pattern}" references found`);
            }
        });
    }

    verifyUniversalHtmlRequirements(content, filename) {
        // Check for basic HTML structure
        const requiredElements = ['<html', '<head>', '<body>', '</html>'];
        requiredElements.forEach(element => {
            if (content.includes(element)) {
                this.log('HTML-STRUCTURE', 'PASS', `${element} found in ${filename}`);
            } else {
                this.log('HTML-STRUCTURE', 'FAIL', `Missing ${element} in ${filename}`, true);
            }
        });

        // Check for meta tags
        if (content.includes('<meta') && content.includes('viewport')) {
            this.log('META-TAGS', 'PASS', 'Meta viewport tag found');
        } else {
            this.log('META-TAGS', 'WARN', 'Missing or incomplete meta tags');
        }
    }

    verifyServerRouting() {
        this.log('SERVER-ROUTING', 'CHECK', 'Verifying server.js routing...');
        
        const serverPath = path.join(process.cwd(), 'server.js');
        if (!fs.existsSync(serverPath)) {
            this.log('SERVER-ROUTING', 'FAIL', 'server.js not found', true);
            return false;
        }

        const serverContent = fs.readFileSync(serverPath, 'utf8');
        
        // Check for financial-executives route
        if (serverContent.includes("app.get('/financial-executives'")) {
            this.log('SERVER-ROUTING', 'PASS', '/financial-executives route exists');
        } else {
            this.log('SERVER-ROUTING', 'FAIL', 'Missing /financial-executives route in server.js', true);
        }

        // Check for express.static configuration
        if (serverContent.includes('express.static')) {
            this.log('SERVER-ROUTING', 'PASS', 'Static file serving configured');
        } else {
            this.log('SERVER-ROUTING', 'FAIL', 'Missing express.static configuration', true);
        }

        return true;
    }

    verifyCommitReadiness() {
        this.log('COMMIT-READY', 'CHECK', 'Verifying commit readiness...');
        
        try {
            // Check if we have commits to push
            const unpushedCommits = execSync('git log origin/main..HEAD --oneline').toString().trim();
            if (!unpushedCommits) {
                this.log('COMMIT-READY', 'FAIL', 'No commits to push', true);
                return false;
            }

            // Check if there are any uncommitted changes
            const uncommittedChanges = execSync('git status --porcelain').toString().trim();
            if (uncommittedChanges) {
                this.log('COMMIT-READY', 'FAIL', 'Uncommitted changes detected - commit them first', true);
                return false;
            }
            
            const commitCount = unpushedCommits.split('\n').length;
            this.log('COMMIT-READY', 'PASS', `${commitCount} commit(s) ready to push`);
            
            return true;
        } catch (error) {
            this.log('COMMIT-READY', 'FAIL', `Git commit verification failed: ${error.message}`, true);
            return false;
        }
    }

    async runFullVerification() {
        console.log('\n🔥 PRE-DEPLOYMENT VERIFICATION SYSTEM 🔥');
        console.log('==========================================');
        console.log('⚠️  NO DEPLOYMENT UNTIL ALL CHECKS PASS ⚠️\n');
        
        const startTime = Date.now();
        
        // Step 1: Get modified files
        this.getModifiedFiles();
        
        // Step 2: Verify file contents
        const filesValid = this.verifyFileContents();
        
        // Step 3: Verify server routing
        const routingValid = this.verifyServerRouting();
        
        // Step 4: Verify commit readiness
        const commitReady = this.verifyCommitReadiness();
        
        // Generate report
        const totalTime = Date.now() - startTime;
        console.log('\n==========================================');
        console.log('🔥 PRE-DEPLOYMENT VERIFICATION REPORT 🔥');
        console.log('==========================================');
        
        this.checks.forEach(check => {
            const statusIcon = check.status === 'PASS' ? '✅' : 
                             check.status === 'FAIL' ? '❌' : 
                             check.status === 'WARN' ? '⚠️' : '🔍';
            console.log(`${statusIcon} ${check.check}: ${check.message}`);
        });
        
        console.log(`\n⏱️  Verification completed in ${Math.round(totalTime / 1000)}s`);
        
        if (this.errors.length === 0) {
            console.log('\n🎉 ALL CRITICAL CHECKS PASSED! 🎉');
            console.log('✅ SAFE TO DEPLOY - All requirements verified');
            
            if (this.warnings.length > 0) {
                console.log('\n⚠️  NON-CRITICAL WARNINGS:');
                this.warnings.forEach(warning => console.log(`⚠️  ${warning}`));
            }
            
            return true;
        } else {
            console.log('\n🚨 DEPLOYMENT BLOCKED - CRITICAL ERRORS FOUND 🚨');
            console.log('❌ DO NOT DEPLOY UNTIL ALL ERRORS ARE FIXED:');
            this.errors.forEach(error => console.log(`❌ ${error}`));
            
            console.log('\n🔧 FIX THESE ERRORS THEN RUN VERIFICATION AGAIN');
            return false;
        }
    }

    static async enforceVerification() {
        const verifier = new PreDeployVerify();
        const passed = await verifier.runFullVerification();
        
        if (!passed) {
            console.log('\n🛑 DEPLOYMENT PREVENTED - Fix errors above first');
            process.exit(1);
        }
        
        console.log('\n✅ VERIFICATION COMPLETE - Safe to proceed with deployment');
        return true;
    }
}

// Auto-run if called directly
if (require.main === module) {
    PreDeployVerify.enforceVerification();
}

module.exports = PreDeployVerify;