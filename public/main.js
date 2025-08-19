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
        scanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Scan form submitted - API not connected yet');
            // TODO: Connect to /api/scan endpoint
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
});