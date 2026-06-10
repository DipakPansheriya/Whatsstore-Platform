import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pricing-page animate-fade-in-up">
      <div class="container">
        <!-- Header -->
        <header class="pricing-header text-center">
          <span class="badge">Simple Pricing</span>
          <h1>One Simple Plan.<br><span class="highlight">Everything Included.</span></h1>
          <p class="subtitle">Start free for 10 days. Build your WhatsStore, add products, and start receiving WhatsApp orders instantly. No credit card required.</p>
        </header>

        <!-- Pricing Card -->
        <div class="pricing-container">
          <div class="pricing-card glass-card premium-glow">
            <div class="badge-trial">✨ 10-Day Free Trial Included</div>
            
            <div class="card-header text-center">
              <h3>WhatsStore Pro Plan</h3>
              <p class="plan-desc">Designed for small businesses, shops, salons, restaurants, and freelancers ready to sell via WhatsApp.</p>
              
              <div class="price-wrapper">
                <span class="currency">₹</span>
                <span class="amount">499</span>
                <span class="period">/ month</span>
              </div>
              <p class="alt-currency">or $9.99 USD / month</p>
            </div>

            <hr class="divider">

            <div class="card-body">
              <h4 class="features-title">Everything Included:</h4>
              <ul class="features-list">
                <li>
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>Unlimited Product Listings</strong>
                    <p>Add unlimited products with images, pricing, and descriptions — no restrictions.</p>
                  </div>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>WhatsApp Order Direct Forwarding</strong>
                    <p>Customer orders are automatically formatted and sent directly to your WhatsApp inbox.</p>
                  </div>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>4 Theme Layout Presets</strong>
                    <p>Choose from professional templates for Shop, Restaurant, Salon, and Freelancer businesses.</p>
                  </div>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>Interactive Store Customizer</strong>
                    <p>Customize colors, layout, banners, and content in real-time with live preview.</p>
                  </div>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>Customer Review System</strong>
                    <p>Collect and display customer ratings and reviews to build trust and increase sales.</p>
                  </div>
                </li>
                <li>
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>SEO & Social Sharing Optimization</strong>
                    <p>Optimize your store for search engines and social media sharing with meta tags and clean URLs.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div class="card-footer text-center">
              <a routerLink="/auth/register" class="btn btn-primary btn-block">🚀 Launch My Store Now</a>
              <p class="footer-note">No credit card required. Cancel anytime during the trial period.</p>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <section class="faq-section">
          <h2 class="text-center">Frequently Asked Questions</h2>
          <div class="faq-grid">
            <div class="faq-item glass-card">
              <h4>How does the 10-day free trial work?</h4>
              <p>You get full access to all WhatsStore features for 10 days. After the trial ends, you can choose to subscribe to continue using your store.</p>
            </div>
            <div class="faq-item glass-card">
              <h4>Are there any setup fees or hidden transaction costs?</h4>
              <p>No setup fees or hidden charges. WhatsStore charges only a simple monthly subscription. All customer communication happens directly via WhatsApp.</p>
            </div>
            <div class="faq-item glass-card">
              <h4>Can I cancel my subscription?</h4>
              <p>Yes, you can cancel anytime from your account settings. Your store will remain active until the end of the billing cycle.</p>
            </div>
            <div class="faq-item glass-card">
              <h4>Do I need a separate WhatsApp Business account?</h4>
              <p>No WhatsApp Business account is required. Orders are sent directly to your normal WhatsApp number.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .pricing-page {
      padding: var(--space-3xl) 0;
    }
    .pricing-header {
      margin-bottom: var(--space-3xl);
      h1 {
        margin: var(--space-md) 0;
        font-size: clamp(2.2rem, 5.5vw, 3.8rem);
        font-weight: 950;
        line-height: 1.15;
      }
      .subtitle {
        font-size: 1.15rem;
        max-width: 600px;
        margin: 0 auto;
        color: var(--color-text-secondary);
        line-height: 1.7;
      }
    }
    .highlight {
      color: var(--color-accent);
      background: linear-gradient(120deg, var(--color-accent) 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30px rgba(37, 211, 102, 0.25);
    }
    .text-center { text-align: center; }
    
    .pricing-container {
      display: flex;
      justify-content: center;
      margin-bottom: var(--space-3xl);
    }
    
    .pricing-card {
      width: 100%;
      max-width: 580px;
      padding: var(--space-2xl);
      position: relative;
      &.premium-glow {
        border-color: rgba(37, 211, 102, 0.45);
        box-shadow: 0 0 40px rgba(37, 211, 102, 0.15);
        animation: pulse-glow 3s infinite ease-in-out;
      }
    }
    
    .badge-trial {
      position: absolute;
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-accent);
      color: #000;
      padding: 6px 16px;
      font-size: 0.8rem;
      font-weight: 800;
      border-radius: var(--radius-pill);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.35);
    }
    
    .plan-desc {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      margin: var(--space-sm) 0 var(--space-lg);
      line-height: 1.6;
    }
    
    .price-wrapper {
      display: flex;
      align-items: baseline;
      justify-content: center;
      margin-bottom: 4px;
      .currency {
        font-size: 2rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }
      .amount {
        font-size: 4.5rem;
        font-weight: 900;
        color: #fff;
        line-height: 1;
        letter-spacing: -0.04em;
        font-family: var(--font-heading);
      }
      .period {
        font-size: 1.1rem;
        color: var(--color-text-secondary);
        margin-left: var(--space-xs);
        font-weight: 600;
      }
    }
    .alt-currency {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: var(--space-lg);
    }
    
    .divider {
      border: 0;
      height: 1px;
      background: var(--color-border);
      margin: var(--space-lg) 0;
    }
    
    .features-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: var(--space-md);
      color: #fff;
    }
    
    .features-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      li {
        display: flex;
        align-items: flex-start;
        gap: var(--space-md);
      }
      .check-icon {
        color: var(--color-accent);
        font-weight: 900;
        font-size: 1.3rem;
        line-height: 1.2;
      }
      strong {
        font-size: 1rem;
        color: var(--color-text-primary);
      }
      p {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-top: 2px;
        line-height: 1.5;
      }
    }
    
    .btn-block {
      display: flex;
      justify-content: center;
      width: 100%;
      margin: var(--space-xl) 0 var(--space-sm);
    }
    
    .footer-note {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    
    .faq-section {
      padding-top: var(--space-3xl);
      h2 { margin-bottom: var(--space-2xl); font-size: 2.2rem; font-weight: 800; }
    }
    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: var(--space-lg);
    }
    .faq-item {
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      h4 {
        font-size: 1.1rem;
        color: #fff;
        font-weight: 700;
      }
      p {
        font-size: 0.9rem;
        line-height: 1.6;
        color: var(--color-text-secondary);
      }
    }
  `]
})
export class PricingComponent {}
