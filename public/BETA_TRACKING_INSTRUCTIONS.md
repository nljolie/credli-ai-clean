# 📊 Beta Tracking Instructions for Credli.ai

## **How to Track Your 20-Person Beta Limit**

### **When Someone Purchases (via Stripe):**
1. **Immediately update** `/purchase-counter.json`
2. **Change the number:**
   ```json
   {
     "totalPurchases": 1,    // <- Increment this number
     "maxPurchases": 20,
     "waitlistCount": 0
   }
   ```

### **When Someone Joins Waitlist:**
1. **Check your email** (they'll be sent to hello@credli.ai)
2. **Add them to your tracking list** (Excel, Google Sheets, or notebook)
3. **Optional:** Update waitlistCount in the JSON file

### **When You Want to Reset or Open More Spots:**
1. **To reset the beta:** Change `totalPurchases` back to 0
2. **To increase limit:** Change `maxPurchases` to desired number (e.g., 40)

### **Manual Tracking Sheet (Recommended):**
Create a Google Sheet with columns:
- **Date**
- **Name**
- **Email**
- **Payment Method** (Stripe/PayPal)
- **Amount Paid**
- **Status** (Active/Waitlist)

## **File Locations:**
- **Counter:** `/purchase-counter.json`
- **Waitlist Page:** `/waitlist.html`
- **Purchase Check:** `/purchase-check.js`

## **Testing:**
1. **To test waitlist:** Set `totalPurchases` to 20 in the JSON file
2. **Try to purchase** - should redirect to waitlist
3. **To restore:** Set `totalPurchases` back to actual number

## **Email Setup Verification:**
- Send test email to `hello@credli.ai`
- Should arrive in your Gmail inbox
- If not, check domain email forwarding settings

---

**That's it! Simple manual tracking until you need something more automated.**