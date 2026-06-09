import { Component } from '@angular/core';

@Component({
  selector: 'app-terms',
  standalone: true,
  template: `
    <div class="legal-page animate-fade-in-up">
      <div class="container">
        <div class="legal-container glass-card">
          <header class="legal-header text-center">
            <span class="badge">Legal Agreements</span>
            <h1>Terms & Conditions</h1>
            <p class="last-updated">Last updated: June 9, 2026</p>
          </header>

          <main class="legal-content">
            <section class="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>By creating a merchant account on SiteFlow, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use the application.</p>
            </section>

            <section class="legal-section">
              <h2>2. 10-Day Free Trial & Subscriptions</h2>
              <p>Every new user starts with a <strong>10-day free trial</strong> of the Mandatory Upgrade Plan. At the conclusion of this trial, you must subscribe to our monthly billing plan (₹499/mo or $9.99/mo) to keep your storefront website active and live for customer visits. Failure to subscribe will result in a temporary suspension of public access to your store slug.</p>
            </section>

            <section class="legal-section">
              <h2>3. Account Responsibility</h2>
              <p>You are solely responsible for maintaining the confidentiality of your login credentials and for all operations under your business profile. You represent that the catalog items you list do not violate any local regulations or copy protected materials.</p>
            </section>

            <section class="legal-section">
              <h2>4. Transaction Disclaimer</h2>
              <p>SiteFlow does not act as a payment gateway or processing intermediary. All client orders are forwarded to WhatsApp. Merchants are solely responsible for coordinating deliveries, managing inventory availability, and collecting payments directly from customers.</p>
            </section>

            <section class="legal-section">
              <h2>5. Service Availability & Changes</h2>
              <p>We reserves the right to modify, suspend, or upgrade the application or features at any time. We will provide email notices to merchants regarding major updates or price revisions.</p>
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
export class TermsComponent {}
