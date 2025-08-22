document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('free-cred-form');
    const loadingState = document.getElementById('loading-state');
    const resultsContainer = document.getElementById('results-container');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const company = formData.get('company').trim();
        const askphrase1 = formData.get('askphrase1').trim();
        const askphrase2 = formData.get('askphrase2').trim();
        const askphrase3 = formData.get('askphrase3').trim();
        const captcha = formData.get('captcha').trim();
        
        // Validate inputs
        if (!name || !email || !company || !askphrase1 || !askphrase2 || !askphrase3 || !captcha) {
            alert('Please fill in all fields including the security question');
            return;
        }
        
        // Validate human verification checkbox
        if (!document.getElementById('human-verify').checked) {
            alert('Please confirm you are not a robot by checking the verification box.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Bot Protection Validation
        if (!window.credliBotProtection) {
            alert('Security system not loaded. Please refresh the page and try again.');
            return;
        }
        
        try {
            const botValidation = await window.credliBotProtection.validateSubmission({
                name: name,
                email: email,
                company: company,
                captcha: captcha
            });
            
            if (!botValidation.valid) {
                let errorMessage = 'Security validation failed. ';
                
                if (!botValidation.validations.rateLimit) {
                    // Rate limit message is handled by the bot protection system
                    return;
                } else if (!botValidation.validations.captcha) {
                    errorMessage += 'Please answer the security question correctly.';
                } else if (!botValidation.validations.humanBehavior) {
                    errorMessage += 'Please spend more time reviewing the form and try again.';
                } else if (!botValidation.validations.email.valid) {
                    errorMessage += botValidation.validations.email.reason || 'Please use a valid business email.';
                } else if (!botValidation.validations.honeypot) {
                    errorMessage += 'Security check failed. Please try again.';
                } else {
                    errorMessage += 'Please try again in a few minutes.';
                }
                
                alert(errorMessage);
                
                // Generate new captcha question for retry
                window.credliBotProtection.currentCaptcha = window.credliBotProtection.generateCaptcha();
                window.updateCaptchaDisplay();
                document.getElementById('captcha-answer').value = '';
                
                return;
            }
            
            console.log(`✅ Bot protection passed with trust score: ${botValidation.trustScore}`);
            
            // Track form submission start in Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission_start', {
                    'event_category': 'Free Cred Score',
                    'event_label': company,
                    'custom_parameters': {
                        'trust_score': botValidation.trustScore,
                        'fingerprint': botValidation.fingerprint.substring(0, 8)
                    }
                });
            }
            
        } catch (error) {
            console.error('Bot protection error:', error);
            alert('Security validation failed. Please refresh the page and try again.');
            return;
        }
        
        try {
            // Show loading state
            showLoading();
            
            // First, submit to Google Sheets
            await submitToGoogleSheets({
                name: name,
                email: email,
                company: company,
                askphrase1: askphrase1,
                askphrase2: askphrase2,
                askphrase3: askphrase3,
                timestamp: new Date().toISOString()
            });
            
            // Prepare API call data with bot protection data
            const apiData = {
                name: name,
                email: email,
                company: company,
                askphrases: [askphrase1, askphrase2, askphrase3],
                engine: 'ai', // AI engine analysis for free version
                fingerprint: botValidation.fingerprint,
                trustScore: botValidation.trustScore,
                sessionData: botValidation.sessionData
            };
            
            // Make API call
            const response = await fetch('/api/free-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Track successful form submission in Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'free_cred_score_leads', {
                    'event_category': 'Free Cred Score',
                    'event_label': company,
                    'value': data.credScore || 0,
                    'custom_parameters': {
                        'cred_score': data.credScore || 0,
                        'mentions_found': data.mentions || 0,
                        'user_company': company.substring(0, 20)
                    }
                });
                
                // Track as conversion
                gtag('event', 'general_conversion', {
                    'send_to': 'G-BZTV4645ZT',
                    'event_category': 'Lead Generation',
                    'event_label': 'Free Cred Score Completed'
                });
            }
            
            displayResults(data);
            
        } catch (err) {
            console.error('Free Cred Score error:', err);
            showError(`Analysis failed: ${err.message}. Please try again.`);
        }
    });
    
    function showLoading() {
        form.style.display = 'none';
        loadingState.style.display = 'block';
        submitBtn.disabled = true;
        
        // Scroll to loading state
        loadingState.scrollIntoView({ behavior: 'smooth' });
    }
    
    function hideLoading() {
        loadingState.style.display = 'none';
    }
    
    function showError(message) {
        hideLoading();
        form.style.display = 'flex';
        submitBtn.disabled = false;
        
        // Show error in results container
        resultsContainer.innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <h3 style="color: #dc2626; margin-bottom: 1rem;">❌ Analysis Failed</h3>
                <p style="margin-bottom: 2rem;">${message}</p>
                <button onclick="location.reload()" style="background: #3454D1; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    function displayResults(data) {
        hideLoading();
        
        // Calculate basic metrics
        const totalQueries = data.queries ? data.queries.length : 3;
        const mentions = data.mentions || 0;
        const credScore = data.credScore || Math.round((mentions / totalQueries) * 100);
        
        // Determine status
        let statusMessage, statusClass, statusIcon;
        if (credScore >= 80) {
            statusMessage = "Strong AI Authority!";
            statusClass = "status-excellent";
            statusIcon = "🌟";
        } else if (credScore >= 60) {
            statusMessage = "Good AI Presence";
            statusClass = "status-good"; 
            statusIcon = "👍";
        } else if (credScore >= 40) {
            statusMessage = "Building Authority";
            statusClass = "status-moderate";
            statusIcon = "📈";
        } else {
            statusMessage = "Growth Opportunity";
            statusClass = "status-building";
            statusIcon = "🚀";
        }
        
        resultsContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, #3454D1, #2d4db3); color: white; padding: 3rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${statusIcon}</div>
                <h2 style="color: white; font-size: 2rem; margin-bottom: 1rem;">${statusMessage}</h2>
                <div style="background: rgba(255,255,255,0.15); border-radius: 50%; width: 120px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 2rem auto; border: 3px solid rgba(255,255,255,0.3);">
                    <div style="font-size: 2.5rem; font-weight: 700; color: white; line-height: 1;">${credScore}</div>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Cred Score</div>
                </div>
                <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; max-width: 500px; margin: 0 auto;">
                    ${getStatusDescription(credScore, data.name || 'You')}
                </p>
            </div>
            
            <div style="padding: 3rem;">
                <h3 style="color: #3454D1; text-align: center; margin-bottom: 2rem;">📊 Your AI Authority Performance</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
                    ${generateAskPhraseCards(data.askphraseResults || [])}
                </div>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                    <h4 style="color: #3454D1; margin-bottom: 1rem;">💡 Quick Wins</h4>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${generateQuickWins(credScore, data.askphraseResults || [])}
                    </div>
                </div>
                
                <div style="text-align: center; background: linear-gradient(135deg, #BBE1C3, #A9D6B9); border-radius: 12px; padding: 2rem;">
                    <h4 style="color: #070707; margin-bottom: 1rem;">🔥 Ready for the Full Analysis?</h4>
                    <p style="color: #070707; margin-bottom: 1.5rem;">This free check covers one AI engine. Get your complete Cred Score across all major AI engines + competitor analysis + imposter detection.</p>
                    <a href="/landing.html#pricing" onclick="trackFullAnalysisClick('${data.credScore || 0}', '${data.name || 'Unknown'}')" style="background: #3454D1; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; transition: all 0.3s ease;">
                        Get Full Analysis
                    </a>
                </div>
            </div>
        `;
        
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    function getStatusDescription(score, name) {
        if (score >= 80) {
            return `${name} has excellent AI authority! ChatGPT consistently recognizes your expertise.`;
        } else if (score >= 60) {
            return `${name} has good AI visibility with clear opportunities to dominate your field.`;
        } else if (score >= 40) {
            return `${name} is building AI authority. Focus on the recommendations below to boost visibility.`;
        } else {
            return `${name} has significant opportunity to establish AI authority in your expertise areas.`;
        }
    }
    
    function generateAskPhraseCards(askphraseResults) {
        const askphrases = ['askphrase1', 'askphrase2', 'askphrase3'];
        return askphrases.map((key, index) => {
            const result = askphraseResults[index] || { askphrase: `Ask Phrase ${index + 1}`, mentions: 0, performance: 'needs-work' };
            const performance = result.mentions > 2 ? 'good' : result.mentions > 0 ? 'moderate' : 'needs-work';
            
            return `
                <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; text-align: center; transition: all 0.3s ease;">
                    <h4 style="color: #3454D1; margin-bottom: 1rem; font-size: 1.1rem;">${result.askphrase || `Ask Phrase ${index + 1}`}</h4>
                    <div style="font-size: 2rem; font-weight: 700; color: ${getPerformanceColor(performance)}; margin-bottom: 0.5rem;">
                        ${result.mentions || 0}
                    </div>
                    <p style="color: rgba(7,7,7,0.6); font-size: 0.9rem; margin: 0;">
                        ${result.mentions === 1 ? 'mention' : 'mentions'} found
                    </p>
                    <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; margin-top: 1rem; background: ${getPerformanceBg(performance)}; color: ${getPerformanceColor(performance)};">
                        ${getPerformanceLabel(performance)}
                    </span>
                </div>
            `;
        }).join('');
    }
    
    function getPerformanceColor(performance) {
        switch(performance) {
            case 'good': return '#16a34a';
            case 'moderate': return '#f59e0b';
            case 'needs-work': return '#dc2626';
            default: return '#6b7280';
        }
    }
    
    function getPerformanceBg(performance) {
        switch(performance) {
            case 'good': return '#dcfce7';
            case 'moderate': return '#fef3c7';
            case 'needs-work': return '#fee2e2';
            default: return '#f3f4f6';
        }
    }
    
    function getPerformanceLabel(performance) {
        switch(performance) {
            case 'good': return 'Strong';
            case 'moderate': return 'Moderate';
            case 'needs-work': return 'Needs Work';
            default: return 'Unknown';
        }
    }
    
    function generateQuickWins(score, askphraseResults) {
        const wins = [];
        
        if (score < 60) {
            wins.push("• Create content that directly answers common questions in your field");
            wins.push("• Use your exact name and expertise Ask Phrases together in content");
            wins.push("• Publish case studies showcasing your specific methodology");
        } else {
            wins.push("• Expand content around your strongest performing Ask Phrases");
            wins.push("• Create thought leadership content on emerging trends");
            wins.push("• Build strategic partnerships to increase authority mentions");
        }
        
        return wins.map(win => `<p style="margin: 0; color: rgba(7,7,7,0.8);">${win}</p>`).join('');
    }
    
    // Initialize captcha display when bot protection is ready
    window.initializeCaptcha = function() {
        if (window.credliBotProtection && window.credliBotProtection.currentCaptcha) {
            window.updateCaptchaDisplay();
        } else {
            // Retry initialization after a short delay
            setTimeout(window.initializeCaptcha, 100);
        }
    }
    
    // Update captcha question display
    window.updateCaptchaDisplay = function() {
        const captchaQuestion = document.getElementById('captcha-question');
        if (captchaQuestion && window.credliBotProtection && window.credliBotProtection.currentCaptcha) {
            captchaQuestion.textContent = window.credliBotProtection.currentCaptcha.question;
        }
    }
    
    // Show captcha hint if user struggles
    window.showCaptchaHint = function() {
        const captchaQuestion = document.getElementById('captcha-question');
        if (captchaQuestion && window.credliBotProtection && window.credliBotProtection.currentCaptcha) {
            const hint = window.credliBotProtection.currentCaptcha.hint;
            if (hint) {
                captchaQuestion.innerHTML = `
                    ${window.credliBotProtection.currentCaptcha.question}
                    <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem; font-style: italic;">💡 Hint: ${hint}</div>
                `;
            }
        }
    }
    
    // Add captcha hint button functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize captcha
        window.initializeCaptcha();
        
        // Add hint functionality
        const captchaInput = document.getElementById('captcha-answer');
        if (captchaInput) {
            let hintShown = false;
            captchaInput.addEventListener('focus', function() {
                if (!hintShown) {
                    setTimeout(() => {
                        if (captchaInput.value.length === 0) {
                            window.showCaptchaHint();
                            hintShown = true;
                        }
                    }, 3000);
                }
            });
        }
    });
    
    // Track "Get Full Analysis" button clicks
    window.trackFullAnalysisClick = function(credScore, userName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'upgrade_intent', {
                'event_category': 'Conversion Funnel',
                'event_label': 'Full Analysis Button Click',
                'value': parseInt(credScore) || 0,
                'custom_parameters': {
                    'user_cred_score': credScore,
                    'user_name': userName.substring(0, 20)
                }
            });
        }
    };
    
    // Auto-focus on first input for better UX
    document.getElementById('name').focus();
    
    // Google Sheets integration function
    async function submitToGoogleSheets(data) {
        // Google Apps Script Web App URL for form submissions
        const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz5Y0UzpCBdNzePqsnhlpq4tDV9NPKUJeKCc7Piqv3T44I4qtaNoNuy8aR8H6S2B6jTyQ/exec';
        
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    company: data.company,
                    askphrase1: data.askphrase1,
                    askphrase2: data.askphrase2,
                    askphrase3: data.askphrase3,
                    timestamp: data.timestamp
                })
            });
            
            console.log('Data submitted to Google Sheets');
            return true;
        } catch (error) {
            console.error('Google Sheets submission error:', error);
            // Continue with form processing even if Google Sheets fails
            return false;
        }
    }
    
    // Add enter key support for better UX
    const inputs = form.querySelectorAll('input');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && index < inputs.length - 1) {
                e.preventDefault();
                inputs[index + 1].focus();
            }
        });
    });
});

// Mock API response for development/testing
// This would be replaced with actual ChatGPT API integration
async function mockApiResponse(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock results based on input
    const mockResults = {
        name: data.name,
        credScore: Math.floor(Math.random() * 60) + 30, // Random score between 30-90
        mentions: Math.floor(Math.random() * 8) + 1,
        queries: data.askphrases.map(askphrase => askphrase),
        askphraseResults: data.askphrases.map((askphrase, index) => ({
            askphrase: askphrase,
            mentions: Math.floor(Math.random() * 4),
            performance: ['needs-work', 'moderate', 'good'][Math.floor(Math.random() * 3)]
        }))
    };
    
    return mockResults;
}