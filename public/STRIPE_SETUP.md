# Stripe Setup Instructions for Credli.ai
## Monthly/Annual Pricing with Automatic Discounts

### Overview
This setup creates a pricing toggle between Annual, 6-Month, and Monthly plans for Professional ($497) and Executive ($1,997) tiers, with automatic discounts:
- **Annual commitment**: 30% discount
- **6-month commitment**: 15% discount
- **Month-to-month**: Full price, cancel anytime
- **Enterprise**: "Schedule a Call" (no Stripe product needed)

---

## Step 1: Stripe Dashboard Setup

### 1.1 Create Products in Stripe Dashboard

**Navigate to**: Stripe Dashboard > Products > Create Product

#### Product 1: Professional Plan
- **Product Name**: Credli.ai Professional Plan
- **Description**: Monthly Cred Score analysis, imposter monitoring, GEO content strategy guidance, AI authority audit, email support
- **Statement Descriptor**: CREDLI-PRO

#### Product 2: Executive Plan  
- **Product Name**: Credli.ai Executive Plan
- **Description**: Everything in Professional plus advanced monitoring, direct consultant access, competitive intelligence reports, priority support
- **Statement Descriptor**: CREDLI-EXEC

### 1.2 Create Price Points for Each Product

#### Professional Plan Prices:
1. **Monthly**: $497/month
   - Price ID: `price_professional_monthly`
   - Billing Period: Monthly
   - Currency: USD

2. **6-Month Commitment**: $422.45/month (15% discount = $497 × 0.85)
   - Price ID: `price_professional_6month`
   - Billing Period: Monthly
   - Currency: USD
   - **Note**: Set up as recurring monthly but require 6-month commitment in checkout

3. **Annual Commitment**: $347.90/month (30% discount = $497 × 0.70)
   - Price ID: `price_professional_annual`
   - Billing Period: Monthly  
   - Currency: USD
   - **Note**: Set up as recurring monthly but require 12-month commitment in checkout

#### Executive Plan Prices:
1. **Monthly**: $1,997/month
   - Price ID: `price_executive_monthly`
   - Billing Period: Monthly
   - Currency: USD

2. **6-Month Commitment**: $1,697.45/month (15% discount = $1,997 × 0.85)
   - Price ID: `price_executive_6month`
   - Billing Period: Monthly
   - Currency: USD

3. **Annual Commitment**: $1,397.90/month (30% discount = $1,997 × 0.70)
   - Price ID: `price_executive_annual`
   - Billing Period: Monthly
   - Currency: USD

---

## Step 2: Webhook Configuration

### 2.1 Set Up Webhooks
**Navigate to**: Stripe Dashboard > Developers > Webhooks

**Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`

**Events to Listen For**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Purpose**: Track subscription lifecycle and enforce commitment periods

---

## Step 3: Frontend Implementation

### 3.1 Update Pricing Section HTML

Replace the current pricing grid with this structure:

```html
<div class="pricing-toggle">
  <div class="toggle-container">
    <span class="toggle-label">Monthly</span>
    <div class="toggle-switch">
      <input type="checkbox" id="pricing-toggle" />
      <label for="pricing-toggle" class="toggle-slider"></label>
    </div>
    <span class="toggle-label">Annual <span class="save-badge">Save 30%</span></span>
  </div>
</div>

<div class="pricing-grid">
  <!-- Professional Plan -->
  <div class="pricing-card">
    <div class="plan-header">
      <h3>Professional</h3>
      <div class="price-container">
        <div class="price monthly-price active">
          $497<span>/month</span>
        </div>
        <div class="price annual-price">
          $347.90<span>/month</span>
          <small>Billed annually • Save $1,788/year</small>
        </div>
      </div>
    </div>
    <div class="plan-features">
      <ul>
        <li>Monthly Cred Score analysis</li>
        <li>Basic imposter monitoring</li>
        <li>GEO content strategy guidance</li>
        <li>AI authority audit</li>
        <li>Email support</li>
      </ul>
    </div>
    <div class="commitment-options">
      <div class="commitment-choice">
        <input type="radio" id="pro-monthly" name="pro-commitment" value="monthly" checked>
        <label for="pro-monthly">Month-to-month</label>
      </div>
      <div class="commitment-choice">
        <input type="radio" id="pro-6month" name="pro-commitment" value="6month">
        <label for="pro-6month">6 months (Save 15%)</label>
      </div>
      <div class="commitment-choice annual-only" style="display: none;">
        <input type="radio" id="pro-annual" name="pro-commitment" value="annual">
        <label for="pro-annual">Annual (Save 30%)</label>
      </div>
    </div>
    <button class="btn-secondary" onclick="initCheckout('professional')">Start Professional Plan</button>
  </div>

  <!-- Executive Plan -->
  <div class="pricing-card featured">
    <div class="plan-badge">Most Popular</div>
    <div class="plan-header">
      <h3>Executive</h3>
      <div class="price-container">
        <div class="price monthly-price active">
          $1,997<span>/month</span>
        </div>
        <div class="price annual-price">
          $1,397.90<span>/month</span>
          <small>Billed annually • Save $7,188/year</small>
        </div>
      </div>
    </div>
    <div class="plan-features">
      <ul>
        <li>Everything in Professional</li>
        <li>Advanced AI authority monitoring</li>
        <li>Direct consultant access</li>
        <li>Competitive intelligence reports</li>
        <li>Priority support</li>
      </ul>
    </div>
    <div class="commitment-options">
      <div class="commitment-choice">
        <input type="radio" id="exec-monthly" name="exec-commitment" value="monthly" checked>
        <label for="exec-monthly">Month-to-month</label>
      </div>
      <div class="commitment-choice">
        <input type="radio" id="exec-6month" name="exec-commitment" value="6month">
        <label for="exec-6month">6 months (Save 15%)</label>
      </div>
      <div class="commitment-choice annual-only" style="display: none;">
        <input type="radio" id="exec-annual" name="exec-commitment" value="annual">
        <label for="exec-annual">Annual (Save 30%)</label>
      </div>
    </div>
    <button class="btn-primary" onclick="initCheckout('executive')">Start Executive Plan</button>
  </div>

  <!-- Enterprise Plan -->
  <div class="pricing-card">
    <div class="plan-header">
      <h3>Enterprise</h3>
      <div class="price">Custom<span>/month</span></div>
    </div>
    <div class="plan-features">
      <ul>
        <li>Everything in Executive</li>
        <li>Custom team training</li>
        <li>Dedicated AI trust consultant</li>
        <li>Real-time authority monitoring</li>
        <li>Custom integration support</li>
      </ul>
    </div>
    <div class="plan-commitment">Custom solution • Let's discuss your needs</div>
    <button class="btn-secondary" onclick="scheduleEnterpriseCall()">Schedule a Call</button>
  </div>
</div>
```

### 3.2 JavaScript for Pricing Toggle & Checkout

```javascript
// Pricing Toggle Functionality
document.getElementById('pricing-toggle').addEventListener('change', function() {
  const isAnnual = this.checked;
  const monthlyPrices = document.querySelectorAll('.monthly-price');
  const annualPrices = document.querySelectorAll('.annual-price');
  const annualOptions = document.querySelectorAll('.annual-only');
  
  if (isAnnual) {
    monthlyPrices.forEach(price => price.classList.remove('active'));
    annualPrices.forEach(price => price.classList.add('active'));
    annualOptions.forEach(option => option.style.display = 'block');
    
    // Auto-select annual commitment when in annual mode
    document.getElementById('pro-annual').checked = true;
    document.getElementById('exec-annual').checked = true;
  } else {
    annualPrices.forEach(price => price.classList.remove('active'));
    monthlyPrices.forEach(price => price.classList.add('active'));
    annualOptions.forEach(option => option.style.display = 'none');
    
    // Reset to monthly when switching back
    document.getElementById('pro-monthly').checked = true;
    document.getElementById('exec-monthly').checked = true;
  }
});

// Stripe Checkout Configuration
const priceMapping = {
  professional: {
    monthly: 'price_professional_monthly',
    '6month': 'price_professional_6month', 
    annual: 'price_professional_annual'
  },
  executive: {
    monthly: 'price_executive_monthly',
    '6month': 'price_executive_6month',
    annual: 'price_executive_annual'
  }
};

function initCheckout(plan) {
  const commitmentType = document.querySelector(`input[name="${plan}-commitment"]:checked`).value;
  const priceId = priceMapping[plan][commitmentType];
  
  // Initialize Stripe
  const stripe = Stripe('your_stripe_publishable_key_here');
  
  // Redirect to Checkout
  stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    successUrl: `${window.location.origin}/success?plan=${plan}&commitment=${commitmentType}`,
    cancelUrl: `${window.location.origin}/pricing`,
    customerEmail: null, // Let customer enter email
    billingAddressCollection: 'required',
    metadata: {
      plan: plan,
      commitment: commitmentType
    }
  }).then(function(result) {
    if (result.error) {
      alert(result.error.message);
    }
  });
}

function scheduleEnterpriseCall() {
  // Redirect to Calendly or your booking system
  window.open('https://calendly.com/your-username/enterprise-consultation', '_blank');
}
```

---

## Step 4: Backend Implementation (Node.js Example)

### 4.1 Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4.2 Webhook Handler
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      handleSubscriptionCreated(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      handlePaymentSucceeded(event.data.object);
      break;
    case 'customer.subscription.deleted':
      handleSubscriptionCanceled(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

function handleSubscriptionCreated(subscription) {
  const commitment = subscription.metadata.commitment;
  const plan = subscription.metadata.plan;
  
  // Store commitment period in your database
  // This will be used to enforce minimum commitment periods
  console.log(`New ${plan} subscription created with ${commitment} commitment`);
}
```

---

## Step 5: CSS Styling for Toggle

```css
/* Pricing Toggle */
.pricing-toggle {
  text-align: center;
  margin-bottom: 3rem;
}

.toggle-container {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: white;
  border-radius: 50px;
  box-shadow: var(--shadow-light);
}

.toggle-label {
  font-weight: 600;
  color: var(--header);
}

.save-badge {
  background: #10B981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.toggle-switch {
  position: relative;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  background-color: #ccc;
  border-radius: 30px;
  cursor: pointer;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .toggle-slider {
  background-color: var(--brand);
}

input:checked + .toggle-slider:before {
  transform: translateX(30px);
}

/* Price Container */
.price-container {
  position: relative;
  height: 80px;
}

.price {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: all 0.3s ease;
}

.price.active {
  opacity: 1;
}

.price small {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

/* Commitment Options */
.commitment-options {
  margin: 1.5rem 0;
}

.commitment-choice {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.commitment-choice input[type="radio"] {
  margin-right: 0.5rem;
  accent-color: var(--brand);
}

.commitment-choice label {
  font-size: 0.9rem;
  color: var(--header);
  cursor: pointer;
}
```

---

## Step 6: Testing Checklist

### 6.1 Pre-Launch Testing
- [ ] Test monthly/annual toggle functionality
- [ ] Verify all price calculations are correct
- [ ] Test each pricing option checkout flow
- [ ] Confirm webhooks are receiving events
- [ ] Test enterprise call scheduling
- [ ] Verify success/cancel page redirects
- [ ] Test with Stripe test cards

### 6.2 Price Verification
- **Professional Monthly**: $497
- **Professional 6-Month**: $422.45 (15% discount)
- **Professional Annual**: $347.90 (30% discount)
- **Executive Monthly**: $1,997
- **Executive 6-Month**: $1,697.45 (15% discount) 
- **Executive Annual**: $1,397.90 (30% discount)

---

## Step 7: Go-Live Steps

1. **Replace test keys** with live Stripe keys
2. **Update webhook endpoint** to production URL
3. **Test with real payment method** (small amount)
4. **Monitor Stripe Dashboard** for successful transactions
5. **Verify webhook events** are processing correctly

---

## Support & Maintenance

### Monthly Tasks:
- Review successful subscriptions
- Monitor failed payments
- Check webhook delivery status
- Analyze pricing conversion rates

### Key Metrics to Track:
- Conversion rate by pricing option
- Customer preference (monthly vs annual)
- Average customer lifetime value
- Commitment period completion rates

---

**Ready to implement!** This setup gives you complete control over pricing with automatic discount application and clear commitment tracking. 🚀