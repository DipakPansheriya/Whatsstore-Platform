import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="docs-page animate-fade-in-up">
      <div class="container">
        <div class="docs-container glass-card">
          <!-- Docs Header -->
          <header class="docs-header text-center">
            <span class="badge">User Guide</span>
            <h1>SiteFlow Documentation</h1>
            <p class="lead">Learn how to create no-code storefront websites and accept customer orders via WhatsApp.</p>
          </header>

          <!-- Introduction Section -->
          <section id="intro" class="docs-section">
            <h2>✨ Introduction</h2>
            <p>SiteFlow is a WhatsApp-First Website Builder designed to help merchants, small retail shops, salons, restaurants, and freelancers set up a digital catalog in minutes. Instead of complex, multi-page cart checkout procedures, customer selections are pre-formatted and forwarded directly to your personal WhatsApp chat.</p>
          </section>

          <!-- Quickstart Section -->
          <section id="quickstart" class="docs-section">
            <h2>🚀 Quick Start Guide</h2>
            <p>Getting your storefront running takes under five minutes:</p>
            <div class="steps-grid">
              <div class="step-card glass-card">
                <span class="step-badge">01</span>
                <strong>Create Account</strong>
                <p>Sign up with your business details at <a routerLink="/auth/register" class="docs-link">SiteFlow Registration</a>.</p>
              </div>
              <div class="step-card glass-card">
                <span class="step-badge">02</span>
                <strong>Add Inventory</strong>
                <p>Add products in catalog manager. Specify titles, descriptions, and pricing.</p>
              </div>
              <div class="step-card glass-card">
                <span class="step-badge">03</span>
                <strong>Choose Template</strong>
                <p>Pick a preset theme layout (Shop, Restaurant, Salon, or Freelancer) and save configuration.</p>
              </div>
              <div class="step-card glass-card">
                <span class="step-badge">04</span>
                <strong>Share URL</strong>
                <p>Access your storefront at <code>/store/your-slug</code>, copy the link, and share it on socials.</p>
              </div>
            </div>
          </section>

          <!-- Storefront Config Section -->
          <section id="storefront-setup" class="docs-section">
            <h2>🏪 Storefront Customization</h2>
            <p>Your storefront slug acts as your public domain name. You can customize details anytime in the Store Settings tab:</p>
            <ul class="docs-bullet-list">
              <li><strong>WhatsApp Number:</strong> Ensure it contains country codes without '+' or spaces (e.g. <code>919999999999</code>). This is where checkouts are sent.</li>
              <li><strong>Business Bio:</strong> This text displays in the Hero description and About sections of your storefront.</li>
              <li><strong>Logo Upload:</strong> Provide a direct URL to your store logo to display it on the storefront landing banner.</li>
            </ul>
          </section>

          <!-- Product Management Section -->
          <section id="product-upload" class="docs-section">
            <h2>📦 Product Inventory</h2>
            <p>Inside the Products page, you can manage your listings. Each product requires:</p>
            <ul class="docs-bullet-list">
              <li><strong>Title:</strong> The name of the item (e.g. <code>Glazed Chocolate Donut</code>).</li>
              <li><strong>Price:</strong> Numeric catalog value in ₹ INR or equivalent.</li>
              <li><strong>Images:</strong> Up to 3 image URLs. If left blank, a default product icon placeholder is shown.</li>
              <li><strong>Featured Tag:</strong> Displays a featured badge on the product grid to attract customer attention.</li>
            </ul>
          </section>

          <!-- Checkout Flow Section -->
          <section id="checkout-flow" class="docs-section">
            <h2>💬 How Orders Work</h2>
            <p>When a client visits your storefront and clicks "Order on WhatsApp", SiteFlow prompts them for name and contact info. It then creates a database order and builds a WhatsApp URL. Clicking it redirects the buyer to WhatsApp, pre-populating your chat with details like:</p>
            <pre class="code-block">
Hello! I want to place an order:

• Product: Chocolate Cake
• Price: ₹500
• Quantity: 2

Name: Jane Doe
Phone: +919999999999
Order Ref: #12345</pre>
          </section>

          <!-- WhatsApp Tracking Section -->
          <section id="whatsapp-tracking" class="docs-section">
            <h2>🟢 WhatsApp Tracking Updates</h2>
            <p>When you modify an order status (e.g., from New to Completed or Shipped) inside the merchant orders panel, you can click "Send Status to Customer". This opens WhatsApp with a pre-filled status update message that you can send to their number immediately.</p>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .docs-page {
      padding: var(--space-3xl) 0;
    }
    .docs-container {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--space-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-2xl);
    }
    
    .docs-header {
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-xl);
      h1 {
        margin: var(--space-sm) 0;
        font-size: 2.5rem;
        font-weight: 800;
        color: #fff;
      }
      .lead {
        font-size: 1.15rem;
        color: var(--color-text-secondary);
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
      }
    }
    .text-center {
      text-align: center;
    }
    
    .docs-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      h2 {
        font-size: 1.45rem;
        color: #fff;
        border-left: 3px solid var(--color-accent);
        padding-left: var(--space-sm);
        margin-bottom: var(--space-xs);
        font-weight: 800;
      }
      p {
        font-size: 0.95rem;
        line-height: 1.7;
        color: var(--color-text-secondary);
      }
    }
    
    /* Steps Grid */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-sm);
    }
    .step-card {
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      background: rgba(255, 255, 255, 0.01);
      &:hover {
        transform: translateY(-2px);
      }
      .step-badge {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--color-accent);
        background: var(--color-accent-dim);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        align-self: flex-start;
      }
      strong {
        font-size: 0.95rem;
        color: var(--color-text-primary);
        font-weight: 700;
      }
      p {
        font-size: 0.8rem;
        line-height: 1.45;
        color: var(--color-text-secondary);
      }
    }
    
    .docs-link {
      color: var(--color-accent);
      font-weight: 600;
      transition: color var(--transition-fast);
      &:hover {
        color: #fff;
        text-decoration: underline;
      }
    }
    
    /* Bullet lists */
    .docs-bullet-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding-left: 4px;
      li {
        font-size: 0.9375rem;
        line-height: 1.6;
        color: var(--color-text-secondary);
        position: relative;
        padding-left: 20px;
        &::before {
          content: '•';
          color: var(--color-accent);
          font-weight: 900;
          font-size: 1.25rem;
          position: absolute;
          left: 4px;
          top: -1px;
        }
      }
      code {
        background: rgba(255,255,255,0.04);
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        font-family: monospace;
        color: var(--color-accent);
      }
    }
    
    .code-block {
      background: #111318;
      border: 1px solid var(--color-border);
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-md);
      font-family: 'Fira Code', monospace;
      font-size: 0.85rem;
      color: #cbd5e1;
      white-space: pre-wrap;
      line-height: 1.6;
    }
  `]
})
export class DocsComponent { }
