// Purchase limit checker
async function checkPurchaseLimit() {
    try {
        const response = await fetch('/purchase-counter.json');
        const data = await response.json();
        
        if (data.totalPurchases >= data.maxPurchases) {
            // Redirect to waitlist
            window.location.href = '/waitlist.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking purchase limit:', error);
        return true; // Allow purchase if check fails
    }
}

function initiatePurchase() {
    checkPurchaseLimit().then(canPurchase => {
        if (canPurchase) {
        }
    });
}

// Helper function to increment purchase counter (normally done by webhook)
async function incrementPurchaseCounter() {
    try {
        // In a real implementation, this would be handled by your backend webhook
        // For local testing, you can manually update the purchase-counter.json file
        console.log('Purchase successful. Please manually increment totalPurchases in purchase-counter.json');
        
        // This is just for reference - in production, your webhook would handle this
        const response = await fetch('/purchase-counter.json');
        const data = await response.json();
        
        console.log(`Current purchase count: ${data.totalPurchases}/${data.maxPurchases}`);
        
        return data;
    } catch (error) {
        console.error('Error accessing purchase counter:', error);
        return null;
    }
}