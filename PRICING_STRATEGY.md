<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trust Factor™ Pricing - Credli.ai</title>
  <link rel="stylesheet" href="styles.css?v=99">
  <!-- PayPal-only payment processing -->
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">Credli.ai</div>
      <nav class="nav">
        <button class="nav-link" onclick="window.location='index.html'">← Back to Scan</button>
      </nav>
    </aside>

    <main class="main">
      <section class="panel active">
        <div class="section-header">
          <h1>PRICING</h1>
          <p class="header-description">Choose your Trust Factor™ monitoring plan</p>
        </div>

        <div class="pricing-grid">
          <!-- Starter Plan -->
          <div class="pricing-card">
            <div class="plan-header">
              <h3>Starter</h3>
              <div class="price">$497<span>/month</span></div>
            </div>
            <div class="plan-features">
              <ul>
                <li>✅ Monthly Trust Factor scans</li>
                <li>✅ Basic competitor analysis (2 competitors)</li>
                <li>✅ Quarterly content strategy</li>
                <li>✅ Email support</li>
                <li>✅ Imposter alerts</li>
              </ul>
            </div>
            <button class="btn primary" onclick="selectPlan('starter', 497)">Choose Starter</button>
            <p class="plan-note">Best for individual consultants</p>
          </div>

          <!-- Professional Plan (Recommended) -->
          <div class="pricing-card recommended">
            <div class="recommended-badge">MOST POPULAR</div>
            <div class="plan-header">
              <h3>Professional</h3>
              <div class="price">$997<span>/month</span></div>
            </div>
            <div class="plan-features">
              <ul>
                <li>✅ Bi-weekly Trust Factor scans</li>
                <li>✅ Advanced competitor analysis (5 competitors)</li>
                <li>✅ Monthly content strategy sessions</li>
                <li>✅ Priority support + strategy calls</li>
                <li>✅ Real-time imposter monitoring</li>
                <li>✅ Custom content recommendations</li>
              </ul>
            </div>
            <button class="btn primary" onclick="selectPlan('professional', 997)">Choose Professional</button>
            <p class="plan-note">Best for established experts</p>
          </div>

          <!-- Enterprise Plan -->
          <div class="pricing-card">
            <div class="plan-header">
              <h3>Enterprise</h3>
              <div class="price">$1,997<span>/month</span></div>
            </div>
            <div class="plan-features">
              <ul>
                <li>✅ Weekly Trust Factor monitoring</li>
                <li>✅ Unlimited competitor tracking</li>
                <li>✅ Custom strategy development</li>
                <li>✅ White-label reports</li>
                <li>✅ Dedicated account management</li>
                <li>✅ Multi-expert tracking</li>
              </ul>
            </div>
            <button class="btn primary" onclick="selectPlan('enterprise', 1997)">Choose Enterprise</button>
            <p class="plan-note">Best for larger firms</p>
          </div>
        </div>

        <!-- Commitment Message -->
        <div class="commitment-section">
          <h3>🎯 Why 12-Month Commitment?</h3>
          <div class="commitment-grid">
            <div class="commitment-point">
              <h4>Months 1-3: Foundation</h4>
              <p>Baseline establishment, gap identification, content strategy development</p>
            </div>
            <div class="commitment-point">
              <h4>Months 4-8: Building</h4>
              <p>Authority signals strengthen, AI engines begin recognizing expertise patterns</p>
            </div>
            <div class="commitment-point">
              <h4>Months 9-12: Results</h4>
              <p>Measurable Trust Factor improvement, competitive advantage established</p>
            </div>
          </div>
          <p class="commitment-note">
            <strong>Trust Factor improvement isn't like advertising - it's like building academic reputation.</strong> 
            Clients who commit to 12+ months see transformational results. Shorter commitments rarely produce meaningful change.
          </p>
        </div>

        <!-- Payment Modal (Hidden initially) -->
        <div id="payment-modal" class="payment-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Complete Your Subscription</h3>
              <button class="close-modal" onclick="closePaymentModal()">&times;</button>
            </div>
            <div class="modal-body">
              <div class="selected-plan">
                <h4 id="selected-plan-name">Professional Plan</h4>
                <div class="selected-price">$<span id="selected-price">997</span>/month</div>
              </div>
              
              <form id="payment-form">
                <div class="form-group">
                  <label>Business Email</label>
                  <input type="email" id="email" required>
                </div>
                
                <div class="form-group">
                  <label>Company Name</label>
                  <input type="text" id="company" required>
                </div>
                
                <div class="form-group">
                  <label>Card Information</label>
                  <div id="card-element">
                    <!-- Stripe Elements will create form elements here -->
                  </div>
                  <div id="card-errors" role="alert"></div>
                </div>
                
                <div class="form-group">
                  <label>
                    <input type="checkbox" id="terms" required>
                    I agree to the 12-month commitment and understand that Trust Factor improvement requires consistent, long-term authority building.
                  </label>
                </div>
                
                <button type="submit" class="btn primary" id="submit-payment">
                  Start 12-Month Subscription
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <script>
    let selectedPlan = '';
    let selectedPrice = 0;
    
    function selectPlan(plan, price) {
      selectedPlan = plan;
      selectedPrice = price;
      document.getElementById('selected-plan-name').textContent = plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
      document.getElementById('selected-price').textContent = price;
      document.getElementById('payment-modal').style.display = 'flex';
    }
    
    function closePaymentModal() {
      document.getElementById('payment-modal').style.display = 'none';
    }
    
    // Stripe integration (requires Stripe publishable key)
    // const stripe = Stripe('pk_test_your_publishable_key');
    // const elements = stripe.elements();
    // const cardElement = elements.create('card');
    // cardElement.mount('#card-element');
    
    // Placeholder for actual payment processing
    document.getElementById('payment-form').addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Payment integration ready for Stripe setup. This would process the subscription and redirect to onboarding.');
    });
  </script>
</body>
</html>