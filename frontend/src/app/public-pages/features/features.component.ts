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
          <h1>Built to Turn Website Visitors into<br><span class="highlight">WhatsApp Customers</span></h1>
          <p class="subtitle">WhatsStore helps small businesses convert traffic into real orders using a WhatsApp-first selling system. No checkout forms. No complexity. Just instant customer chats.</p>
        </header>

        <!-- Feature Grid -->
        <div class="features-grid">
          <!-- Feature 1 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">💬</div>
            <h3>WhatsApp-First Ordering</h3>
            <p>Let customers browse products and place orders instantly on WhatsApp with pre-filled order details, reducing drop-offs and increasing conversions.</p>
          </div>

          <!-- Feature 2 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">🎨</div>
            <h3>No-Code Store Builder</h3>
            <p>Create a professional business website using ready-made templates. Customize layout, branding, products, and content without coding.</p>
          </div>

          <!-- Feature 3 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">⭐</div>
            <h3>Built-in Customer Reviews</h3>
            <p>Build trust with product reviews and ratings that help increase customer confidence and boost sales.</p>
          </div>

          <!-- Feature 4 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">📈</div>
            <h3>Merchant Analytics</h3>
            <p>Track store performance including product views, clicks, and WhatsApp order conversions to understand your business growth.</p>
          </div>

          <!-- Feature 5 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">📱</div>
            <h3>Ultra-Fast Mobile Storefronts</h3>
            <p>Fully optimized mobile experience designed for fast browsing and instant WhatsApp ordering on any device.</p>
          </div>

          <!-- Feature 6 -->
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">🔒</div>
            <h3>Secure Business Data</h3>
            <p>Your store data, orders, and customer information are securely stored and accessible only to you.</p>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-banner glass-card accent-glow-hover text-center">
          <h2>Ready to Launch Your WhatsStore?</h2>
          <p>Start building your store today and begin receiving customer orders directly on WhatsApp within minutes.</p>
          <div class="cta-actions">
            <a routerLink="/auth/register" class="btn btn-primary">Create My Store Now</a>
            <a routerLink="/pricing" class="btn btn-ghost">View Pricing</a>
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
