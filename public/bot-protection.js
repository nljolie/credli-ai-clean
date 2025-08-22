// Credli.ai Comprehensive Bot Protection System
class CredliBotProtection {
    constructor() {
        this.sessionData = {};
        this.fingerprint = null;
        this.startTime = Date.now();
        this.mouseMovements = [];
        this.keystrokes = [];
        this.init();
    }

    init() {
        this.generateFingerprint();
        this.setupBehaviorTracking();
        this.checkRateLimit();
        this.setupCaptcha();
    }

    // Browser Fingerprinting (works even with VPN)
    generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Credli.ai fingerprint', 2, 2);
        
        const fingerprint = {
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            userAgent: navigator.userAgent.substring(0, 100),
            canvasFingerprint: canvas.toDataURL(),
            webgl: this.getWebGLFingerprint(),
            fonts: this.getFontFingerprint(),
            plugins: Array.from(navigator.plugins).map(p => p.name).slice(0, 5),
            cookieEnabled: navigator.cookieEnabled,
            touchSupport: 'ontouchstart' in window
        };
        
        this.fingerprint = btoa(JSON.stringify(fingerprint)).substring(0, 32);
        return this.fingerprint;
    }

    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return '';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        } catch (e) {
            return '';
        }
    }

    getFontFingerprint() {
        const testFonts = ['Arial', 'Times', 'Courier', 'Helvetica', 'Georgia', 'Verdana'];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const baseline = 'Arial';
        
        ctx.font = `72px ${baseline}`;
        const baselineWidth = ctx.measureText('BESbswy').width;
        
        return testFonts.filter(font => {
            ctx.font = `72px ${font}, ${baseline}`;
            return ctx.measureText('BESbswy').width !== baselineWidth;
        }).join(',');
    }

    // Behavior Analysis
    setupBehaviorTracking() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.mouseMovements.push({
                x: e.clientX,
                y: e.clientY,
                time: Date.now() - this.startTime
            });
            if (this.mouseMovements.length > 100) {
                this.mouseMovements.shift();
            }
        });

        // Keystroke analysis
        document.addEventListener('keydown', (e) => {
            this.keystrokes.push({
                key: e.key,
                time: Date.now() - this.startTime,
                interval: this.keystrokes.length > 0 ? 
                    Date.now() - this.startTime - this.keystrokes[this.keystrokes.length - 1].time : 0
            });
            if (this.keystrokes.length > 50) {
                this.keystrokes.shift();
            }
        });

        // Focus/blur tracking
        let focusEvents = 0;
        window.addEventListener('focus', () => focusEvents++);
        window.addEventListener('blur', () => focusEvents++);
        this.sessionData.focusEvents = focusEvents;
    }

    // Rate Limiting Check
    checkRateLimit() {
        // Developer bypass: add ?dev=reset to URL to clear limits
        if (window.location.search.includes('dev=reset')) {
            localStorage.clear();
            console.log('🔧 Developer mode: Rate limits reset');
        }
        
        const today = new Date().toDateString();
        const storageKey = `credli_usage_${today}`;
        const fingerprintKey = `credli_fp_${this.fingerprint}`;
        
        // Check IP-based limiting (stored in localStorage as proxy)
        let todayUsage = JSON.parse(localStorage.getItem(storageKey) || '{}');
        let fingerprintUsage = JSON.parse(localStorage.getItem(fingerprintKey) || '{}');
        
        // Update usage counters
        todayUsage.count = (todayUsage.count || 0) + 1;
        todayUsage.lastUsed = Date.now();
        
        fingerprintUsage.count = (fingerprintUsage.count || 0) + 1;
        fingerprintUsage.lastUsed = Date.now();
        fingerprintUsage.fingerprint = this.fingerprint;
        
        localStorage.setItem(storageKey, JSON.stringify(todayUsage));
        localStorage.setItem(fingerprintKey, JSON.stringify(fingerprintUsage));
        
        // Check limits (increased for better user experience)
        // Allow 10 attempts per day per IP, 15 per device fingerprint
        if (todayUsage.count > 10 || fingerprintUsage.count > 15) {
            this.showRateLimitMessage();
            return false;
        }
        
        return true;
    }

    showRateLimitMessage() {
        const form = document.getElementById('free-cred-form');
        if (form) {
            form.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: #fee2e2; border-radius: 12px; border: 2px solid #dc2626;">
                    <h3 style="color: #dc2626; margin-bottom: 1rem;">⏰ Usage Limit Reached</h3>
                    <p style="color: #666; margin-bottom: 2rem;">
                        You've reached the daily limit for free Cred Score assessments. 
                        This helps us maintain service quality for everyone.
                    </p>
                    <p style="color: #666; margin-bottom: 2rem;">
                        <strong>Options:</strong><br>
                        • Try again tomorrow<br>
                        • Contact us for enterprise access<br>
                        • Join our Beta Concierge Program for unlimited access
                    </p>
                    <a href="/landing.html#pricing" style="background: #3454D1; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        View Beta Program
                    </a>
                </div>
            `;
        }
    }

    // Custom Credli.ai Captcha System
    setupCaptcha() {
        this.captchaQuestions = [
            {
                question: "What does AEO stand for in AI Trust Consulting?",
                answers: ["ask engine optimization", "ask engine optimisation", "aeo"],
                hint: "It's about optimizing for questions people ask AI engines"
            },
            {
                question: "Name one AI engine that Credli.ai tracks (ChatGPT, Perplexity, Gemini, or Google AI):",
                answers: ["chatgpt", "perplexity", "gemini", "google ai", "google", "openai"],
                hint: "Think of popular AI assistants people use daily"
            },
            {
                question: "What type of industries is Credli.ai designed for?",
                answers: ["high-trust", "high trust", "finance", "healthcare", "legal", "high-trust industries"],
                hint: "Industries where trust and credibility are essential"
            },
            {
                question: "What does GEO stand for in Credli.ai's services?",
                answers: ["generative engine optimization", "generative engine optimisation", "geo"],
                hint: "It's about being listed among top experts in AI responses"
            },
            {
                question: "Who founded Credli.ai?",
                answers: ["nicole jolie", "nicole", "jolie"],
                hint: "The AI Trust Consultant with 16+ years of experience"
            }
        ];
        
        this.currentCaptcha = this.generateCaptcha();
    }

    generateCaptcha() {
        const randomIndex = Math.floor(Math.random() * this.captchaQuestions.length);
        return this.captchaQuestions[randomIndex];
    }

    validateCaptcha(userAnswer) {
        // Simple checkbox validation - just check if they confirmed they're human
        // For checkbox: userAnswer will be the checkbox value from the form
        return userAnswer === 'on' || userAnswer === true || userAnswer === 'true';
    }

    // Human Behavior Validation
    validateHumanBehavior() {
        const timeSpent = Date.now() - this.startTime;
        const mouseMovementCount = this.mouseMovements.length;
        const keystrokeCount = this.keystrokes.length;
        
        const validations = {
            timeSpent: timeSpent > 30000, // At least 30 seconds
            mouseMovements: mouseMovementCount > 10, // Some mouse activity
            keystrokes: keystrokeCount > 10, // Some typing
            variableTyping: this.hasVariableTyping(),
            mousePatterns: this.hasHumanMousePatterns()
        };
        
        const passedValidations = Object.values(validations).filter(Boolean).length;
        return passedValidations >= 3; // Must pass at least 3 out of 5 validations
    }

    hasVariableTyping() {
        if (this.keystrokes.length < 5) return false;
        
        const intervals = this.keystrokes.map(k => k.interval).filter(i => i > 0);
        if (intervals.length < 3) return false;
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        return variance > 1000; // Human typing has natural variance
    }

    hasHumanMousePatterns() {
        if (this.mouseMovements.length < 10) return false;
        
        // Check for curved movements (humans don't move in perfect straight lines)
        let curves = 0;
        for (let i = 2; i < this.mouseMovements.length; i++) {
            const prev = this.mouseMovements[i - 2];
            const curr = this.mouseMovements[i - 1];
            const next = this.mouseMovements[i];
            
            const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
            const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
            const angleDiff = Math.abs(angle1 - angle2);
            
            if (angleDiff > 0.1) curves++;
        }
        
        return curves > 3; // Humans naturally create curves in mouse movement
    }

    // Email Validation
    validateEmail(email) {
        // Check format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return { valid: false, reason: "Invalid email format" };
        
        // Block disposable email domains
        const disposableDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
            'throwaways.email', 'temp-mail.org', 'getairmail.com', 'tempail.com',
            'sharklasers.com', 'guerrillamail.info', 'guerrillamail.net', 'guerrillamail.org'
        ];
        
        const domain = email.split('@')[1].toLowerCase();
        if (disposableDomains.includes(domain)) {
            return { valid: false, reason: "Please use a business email address" };
        }
        
        // Prefer business domains
        const businessDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
        const isPersonalEmail = businessDomains.includes(domain);
        
        return { 
            valid: true, 
            isPersonal: isPersonalEmail,
            score: isPersonalEmail ? 0.7 : 1.0 
        };
    }

    // Honeypot Field Check
    checkHoneypot() {
        const honeypotField = document.querySelector('input[name="website"]');
        return !honeypotField || honeypotField.value === '';
    }

    // Complete Validation
    async validateSubmission(formData) {
        const validations = {
            rateLimit: this.checkRateLimit(),
            captcha: this.validateCaptcha(formData.captcha),
            humanBehavior: this.validateHumanBehavior(),
            email: this.validateEmail(formData.email),
            honeypot: this.checkHoneypot(),
            fingerprint: this.fingerprint
        };
        
        // Calculate overall trust score
        let trustScore = 0;
        if (validations.rateLimit) trustScore += 0.2;
        if (validations.captcha) trustScore += 0.3;
        if (validations.humanBehavior) trustScore += 0.3;
        if (validations.email.valid) trustScore += 0.1 * validations.email.score;
        if (validations.honeypot) trustScore += 0.1;
        
        return {
            valid: trustScore >= 0.7,
            trustScore: trustScore,
            validations: validations,
            fingerprint: this.fingerprint,
            sessionData: {
                timeSpent: Date.now() - this.startTime,
                mouseMovements: this.mouseMovements.length,
                keystrokes: this.keystrokes.length,
                userAgent: navigator.userAgent.substring(0, 100)
            }
        };
    }
}

// Initialize bot protection
window.credliBotProtection = new CredliBotProtection();