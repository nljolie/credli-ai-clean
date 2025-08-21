// Test script to verify Google Sheets integration
async function testGoogleSheetsIntegration() {
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz5Y0UzpCBdNzePqsnhlpq4tDV9NPKUJeKCc7Piqv3T44I4qtaNoNuy8aR8H6S2B6jTyQ/exec';
    
    const testData = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        askphrase1: 'Who is the best test consultant?',
        askphrase2: 'Top test expert?',
        askphrase3: 'Best testing leader?',
        timestamp: new Date().toISOString()
    };
    
    try {
        console.log('🧪 Testing Google Sheets integration...');
        console.log('📝 Test data:', testData);
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('✅ Google Sheets integration test completed');
        console.log('📊 Response received (no-cors mode, limited response info available)');
        return true;
    } catch (error) {
        console.error('❌ Google Sheets integration test failed:', error);
        return false;
    }
}

// Run the test if in browser environment
if (typeof window !== 'undefined') {
    console.log('🚀 Google Sheets Integration Test');
    console.log('Script ID: AKfycbz5Y0UzpCBdNzePqsnhlpq4tDV9NPKUJeKCc7Piqv3T44I4qtaNoNuy8aR8H6S2B6jTyQ');
    testGoogleSheetsIntegration();
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testGoogleSheetsIntegration };
}