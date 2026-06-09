import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="features-page animate-fade-in-up">
      <div class="container">
        <!-- Hero Header -->
        <header class="features-header text-center">
          <span class="badge">Platform Highlights</span>
          <h1>Engineered to Convert<br><span class="highlight">Clicks into Customers</span></h1>
          <p class="subtitle">Discover the powerful features that make WhatsStore the ultimate WhatsApp commerce builder.</p>
        </header>

        <!-- Feature Grid -->
        <div class="features-grid">
          <!-- Feature 1 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">💬</div>
            <h3>WhatsApp-First Ordering</h3>
            <p>Skip the cart abandonments. Customers browse products, select quantities, and click checkout to instantly send a fully formatted order description directly to your WhatsApp number.</p>
          </div>

          <!-- Feature 2 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">🎨</div>
            <h3>No-Code Interactive Customizer</h3>
            <p>Customize your hero banner, about bio, and calls-to-action in real-time. Toggle between Salon, Restaurant, Shop, and Freelancer layouts with our live phone mock preview.</p>
          </div>

          <!-- Feature 3 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">⭐</div>
            <h3>Built-in Customer Reviews</h3>
            <p>Build instant trust. Storefront pages allow visitors to read and submit star ratings and detailed feedback for individual products directly on the page.</p>
          </div>

          <!-- Feature 4 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">📈</div>
            <h3>Merchant Analytics</h3>
            <p>Understand your traffic patterns. Track total storefront page views, catalog clicks, WhatsApp checkouts, and compute conversion rates without any tracking scripts.</p>
          </div>

          <!-- Feature 5 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">📱</div>
            <h3>Ultra-fast Mobile Storefronts</h3>
            <p>Fully optimized for mobile checkout. Features lazy loading, high accessibility, optimized assets, and a persistent WhatsApp call-to-action button.</p>
          </div>

          <!-- Feature 6 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">🔒</div>
            <h3>Secure Account & Data</h3>
            <p>Keep your customer relationships private. Rest assured that order histories and business configurations are stored securely in our database.</p>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-banner glass-card accent-glow-hover text-center">
          <h2>Ready to Launch Your Storefront?</h2>
          <p>Get started today with our 10-day free trial on the Mandatory Upgrade Plan.</p>
          <div class="cta-actions">
            <a routerLink="/auth/register" class="btn btn-primary">Create Your Storefront Now</a>
            <a routerLink="/pricing" class="btn btn-ghost">View Pricing Details</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .features-page {
      padding: var(--space-3xl) 0;
    }
    .features-header {
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
    .text-center {
      text-align: center;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--space-xl);
      margin-bottom: var(--space-3xl);
    }
    .feature-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      padding: var(--space-xl);
      .feature-icon-wrapper {
        font-size: 2.3rem;
        width: 58px;
        height: 58px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      h3 {
        font-size: 1.3rem;
        font-weight: 800;
        color: #fff;
      }
      p {
        font-size: 0.9375rem;
        line-height: 1.7;
        color: var(--color-text-secondary);
      }
    }
    .cta-banner {
      padding: var(--space-2xl) var(--space-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      border-color: rgba(37, 211, 102, 0.15);
      h2 {
        font-size: 1.95rem;
        font-weight: 800;
      }
      p {
        max-width: 500px;
        margin: 0 auto var(--space-sm);
        line-height: 1.6;
        color: var(--color-text-secondary);
      }
    }
    .cta-actions {
      display: flex;
      gap: var(--space-md);
      flex-wrap: wrap;
      justify-content: center;
    }
  `]
})
export class FeaturesComponent {}
