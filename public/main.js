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
        
        resultsDiv.innerHTML = `
            <div class="scan-results">
                <div class="results-summary">
                    <h3>📊 Scan Results</h3>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="stat-number">${appearances}/${totalQueries}</span>
                            <span class="stat-label">Appearances</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${appearanceRate}%</span>
                            <span class="stat-label">Visibility Rate</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${gaps}</span>
                            <span class="stat-label">Opportunities</span>
                        </div>
                    </div>
                </div>
                
                <div class="engine-results">
                    ${Object.keys(byEngine).map(engine => {
                        const engineResults = byEngine[engine];
                        const engineAppearances = engineResults.filter(r => r.youAppear).length;
                        const engineRate = Math.round((engineAppearances / engineResults.length) * 100);
                        
                        return `
                            <div class="engine-section">
                                <h4>${engine.toUpperCase()}</h4>
                                <div class="engine-stats">
                                    <span class="engine-rate">${engineRate}% visibility</span>
                                    <span class="engine-count">${engineAppearances}/${engineResults.length} queries</span>
                                </div>
                                <div class="query-results">
                                    ${engineResults.map(result => `
                                        <div class="query-result ${result.youAppear ? 'appears' : 'gap'}">
                                            <div class="query-text">${result.prompt}</div>
                                            <div class="result-status">
                                                ${result.youAppear ? 
                                                    '✅ You appear' : 
                                                    '❌ Opportunity to improve'
                                                }
                                            </div>
                                            ${result.mentioned && result.mentioned.length > 0 ? 
                                                `<div class="mentioned">Mentioned: ${result.mentioned.join(', ')}</div>` : 
                                                ''
                                            }
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${gaps > 0 ? `
                    <div class="opportunities-section">
                        <h3>🎯 Content Opportunities</h3>
                        <p>You have ${gaps} opportunities to improve your visibility. Consider creating content that addresses these queries:</p>
                        <div class="opportunity-list">
                            ${data.gaps.slice(0, 5).map(gap => `
                                <div class="opportunity">
                                    <strong>${gap.engine.toUpperCase()}:</strong> ${gap.prompt}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
});