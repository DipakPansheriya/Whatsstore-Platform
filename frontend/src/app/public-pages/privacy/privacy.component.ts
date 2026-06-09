import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <div class="legal-page animate-fade-in-up">
      <div class="container">
        <div class="legal-container glass-card">
          <header class="legal-header text-center">
            <span class="badge">Legal Agreements</span>
            <h1>Privacy Policy</h1>
            <p class="last-updated">Last updated: June 9, 2026</p>
          </header>

          <main class="legal-content">
            <section class="legal-section">
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us when creating a merchant account, including your name, business name, phone number, email address, and billing information. When customers visit your storefront, we track basic session metrics (page views, clicks) to populate your analytics dashboard.</p>
            </section>

            <section class="legal-section">
              <h2>2. WhatsApp Integration & Customer Data</h2>
              <p>SiteFlow acts as a facilitator for checkout chats. When a buyer places an order, their name, contact details, and product choices are compiled into a WhatsApp link. Customer data entered during checkout is stored securely in our database to help merchants track orders, and is not shared with third-party tracking networks.</p>
            </section>

            <section class="legal-section">
              <h2>3. How We Use Information</h2>
              <p>We use the collected information to operate, maintain, and personalize the SiteFlow platform. This includes processing billing subscriptions, resolving bugs, and providing analytics charts for merchants.</p>
            </section>

            <section class="legal-section">
              <h2>4. Security</h2>
              <p>We implement industry-standard encryption practices to secure your password and business catalog data. However, please note that information sent via WhatsApp chats is subject to WhatsApp's own privacy rules and encryption standards.</p>
            </section>

            <section class="legal-section">
              <h2>5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please reach out to our team at support&#64;siteflow.com.</p>
            </section>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      padding: var(--space-3xl) 0;
    }
    .legal-container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-2xl);
    }
    .legal-header {
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-xl);
      h1 {
        margin: var(--space-sm) 0 var(--space-xs);
        font-size: 2.5rem;
        font-weight: 800;
        color: #fff;
      }
      .last-updated {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
      }
    }
    .text-center {
      text-align: center;
    }
    .legal-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .legal-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      h2 {
        font-size: 1.35rem;
        color: #fff;
        border-left: 3px solid var(--color-accent);
        padding-left: var(--space-sm);
        margin-bottom: var(--space-xs);
        font-weight: 700;
      }
      p {
        font-size: 0.95rem;
        line-height: 1.7;
        color: var(--color-text-secondary);
      }
    }
  `]
})
export class PrivacyComponent {}
