document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const panels = document.querySelectorAll('.panel');

    // Initialize navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            showPanel(targetId);
            setActiveNav(this);
        });
    });

    function showPanel(targetId) {
        panels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    function setActiveNav(activeLink) {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Form submission handlers (placeholder - no API calls yet)
    const scanForm = document.getElementById('scan-form');
    const fakesForm = document.getElementById('fakes-form');
    const phishingForm = document.getElementById('phishing-form');

    if (scanForm) {
        scanForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(scanForm);
            const name = formData.get('name');
            const brand = formData.get('brand');
            const keywords = formData.get('keywords').split(',').map(k => k.trim()).filter(k => k);
            const competitors = formData.get('competitors').split(',').map(c => c.trim()).filter(c => c);
            const engines = Array.from(formData.getAll('engines'));
            
            try {
                // Show loading state
                showLoadingResults();
                
                // Submit to API
                const response = await fetch('/api/scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        brand: brand,
                        keywords: keywords,
                        competitors: competitors,
                        engines: engines
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                displayScanResults(data);
                
                // Switch to Results panel
                showPanel('section-results');
                setActiveNav(document.querySelector('[data-target="section-results"]'));
                
            } catch (err) {
                showErrorResults(`Scan failed: ${err.message}`);
            }
        });
    }

    if (fakesForm) {
        fakesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Stop Fakes form submitted - API not connected yet');
            // TODO: Connect to /api/stop-fakes endpoint
        });
    }

    if (phishingForm) {
        phishingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Phishing Check form submitted - API not connected yet');
            // TODO: Connect to /api/phishing-check endpoint
        });
    }

    // Optional: Auto-grow textarea functionality
    function autoGrowTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 180) + 'px';
    }

    // Apply auto-grow to all textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        // Auto-grow on input
        textarea.addEventListener('input', function() {
            autoGrowTextarea(this);
        });

        // Initialize proper height
        autoGrowTextarea(textarea);
    });

    // Results display functions
    function showLoadingResults() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
            <div class="loading-state">
                <h3>🔍 Scanning AI Engines...</h3>
                <p>Checking your presence across ChatGPT, Perplexity, Gemini, and Google AI Overviews...</p>
                <div class="loading-spinner"></div>
            </div>
        `;
    }

    function showErrorResults(message) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
            <div class="error-state">
                <h3>❌ Scan Failed</h3>
                <p>${message}</p>
                <button class="btn" onclick="showPanel('section-scan')">Try Again</button>
            </div>
        `;
    }

    function displayScanResults(data) {
        const resultsDiv = document.getElementById('results');
        
        // Calculate summary stats
        const totalQueries = data.matrix.length;
        const appearances = data.matrix.filter(r => r.youAppear).length;
        const appearanceRate = Math.round((appearances / totalQueries) * 100);
        const gaps = data.gaps.length;
        
        // Group results by engine
        const byEngine = {};
        data.matrix.forEach(result => {
            if (!byEngine[result.engine]) {
                byEngine[result.engine] = [];
            }
            byEngine[result.engine].push(result);
        });
        
        // Get status message and color
        let statusMessage, statusClass, nextSteps;
        if (appearanceRate >= 80) {
            statusMessage = "Excellent AI Search Visibility!";
            statusClass = "status-excellent";
            nextSteps = "You're dominating AI search results. Focus on maintaining and expanding your presence.";
        } else if (appearanceRate >= 60) {
            statusMessage = "Strong AI Search Presence";
            statusClass = "status-good";
            nextSteps = "You're well-positioned in AI search. A few strategic improvements will boost you to excellent.";
        } else if (appearanceRate >= 40) {
            statusMessage = "Moderate AI Search Visibility";
            statusClass = "status-moderate";
            nextSteps = "Good foundation with room for improvement. Focus on the content opportunities below.";
        } else {
            statusMessage = "Growing Your AI Search Presence";
            statusClass = "status-building";
            nextSteps = "Great starting point! The opportunities below will significantly boost your visibility.";
        }
        
        resultsDiv.innerHTML = `
            <div class="scan-results">
                <div class="results-hero ${statusClass}">
                    <div class="score-circle">
                        <div class="score-number">${appearanceRate}</div>
                        <div class="score-label">AI Visibility Score</div>
                    </div>
                    <div class="status-content">
                        <h2>${statusMessage}</h2>
                        <p>${nextSteps}</p>
                        <div class="quick-stats">
                            <span><strong>${appearances}</strong> mentions found</span>
                            <span><strong>${gaps}</strong> growth opportunities</span>
                            <span><strong>${Object.keys(byEngine).length}</strong> engines scanned</span>
                        </div>
                    </div>
                </div>
                
                <div class="engine-overview">
                    <h3>🚀 Engine Performance</h3>
                    <div class="engine-grid">
                        ${Object.keys(byEngine).map(engine => {
                            const engineResults = byEngine[engine];
                            const engineAppearances = engineResults.filter(r => r.youAppear).length;
                            const engineRate = Math.round((engineAppearances / engineResults.length) * 100);
                            
                            return `
                                <div class="engine-card">
                                    <div class="engine-header">
                                        <h4>${engine.toUpperCase()}</h4>
                                        <div class="engine-score ${engineRate >= 70 ? 'good' : engineRate >= 40 ? 'moderate' : 'needs-work'}">${engineRate}%</div>
                                    </div>
                                    <div class="engine-details">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${engineRate}%"></div>
                                        </div>
                                        <p>${engineAppearances} of ${engineResults.length} queries</p>
                                        ${engineRate < 70 ? `<span class="improvement-note">💡 Room for growth</span>` : `<span class="success-note">✅ Strong presence</span>`}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                ${gaps > 0 ? `
                    <div class="opportunities-section">
                        <h3>🎯 Top Content Opportunities</h3>
                        <p class="opportunities-intro">Focus on these high-impact content areas to boost your AI search visibility:</p>
                        <div class="opportunity-grid">
                            ${data.gaps.slice(0, 6).map((gap, index) => `
                                <div class="opportunity-card">
                                    <div class="opportunity-header">
                                        <span class="opportunity-number">${index + 1}</span>
                                        <span class="opportunity-engine">${gap.engine.toUpperCase()}</span>
                                    </div>
                                    <div class="opportunity-content">
                                        <p>${gap.prompt}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="cta-section">
                            <p><strong>Ready to improve your AI search presence?</strong></p>
                            <button class="btn secondary">Get Content Strategy</button>
                        </div>
                    </div>
                ` : `
                    <div class="celebration-section">
                        <h3>🎉 Outstanding Results!</h3>
                        <p>You're appearing in nearly all relevant AI search results. Keep up the excellent work!</p>
                    </div>
                `}
            </div>
        `;
    }
});