document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('analyzeForm');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    const scoreValue = document.getElementById('scoreValue');
    const mentionsTable = document.getElementById('mentionsTable');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const keyword = document.getElementById('keyword').value.trim();
        
        if (!name || !keyword) {
            showError('Please enter both name and keyword');
            return;
        }
        
        hideAll();
        loading.classList.remove('hidden');
        
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, keyword })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            displayResults(data);
            
        } catch (err) {
            showError(`Analysis failed: ${err.message}`);
        } finally {
            loading.classList.add('hidden');
        }
    });

    function hideAll() {
        results.classList.add('hidden');
        error.classList.add('hidden');
        loading.classList.add('hidden');
    }

    function showError(message) {
        hideAll();
        error.textContent = message;
        error.classList.remove('hidden');
    }

    function displayResults(data) {
        hideAll();
        
        scoreValue.textContent = data.trustScore;
        
        if (data.mentions && data.mentions.length > 0) {
            mentionsTable.innerHTML = data.mentions.map(mention => `
                <div class="mention-item">
                    <div class="mention-header">
                        <a href="${mention.url}" class="mention-title" target="_blank" rel="noopener noreferrer">
                            ${escapeHtml(mention.title)}
                        </a>
                        <div class="mention-badges">
                            <span class="badge source">${mention.source}</span>
                            <span class="badge authority-${mention.authority}">${mention.authority}</span>
                            ${mention.matchesKeyword ? '<span class="badge keyword-match">keyword match</span>' : ''}
                        </div>
                    </div>
                    <div class="mention-type">${mention.type}</div>
                </div>
            `).join('');
        } else {
            mentionsTable.innerHTML = '<p>No mentions found</p>';
        }
        
        results.classList.remove('hidden');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});