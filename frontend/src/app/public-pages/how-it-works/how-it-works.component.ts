import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="how-page animate-fade-in-up">
      <div class="container">
        <!-- Header -->
        <header class="how-header text-center">
          <span class="badge">Workflow Overview</span>
          <h1>Launch Your WhatsStore in 4 Simple Steps<br><span class="highlight">No Coding Required</span></h1>
          <p class="subtitle">Set up your store, add products, customize your design, and start receiving orders directly on WhatsApp.</p>
        </header>

        <!-- Timeline Steps -->
        <div class="timeline">
          <!-- Step 1 -->
          <div class="timeline-step">
            <div class="step-visual">
              <span class="step-num">1</span>
            </div>
            <div class="step-content glass-card">
              <span class="step-label">Step 1 — Setup Account</span>
              <h3>Create Your Store Account</h3>
              <p>Sign up using your email and phone number. WhatsStore automatically generates your store profile and unique URL.</p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="timeline-step">
            <div class="step-visual">
              <span class="step-num">2</span>
            </div>
            <div class="step-content glass-card">
              <span class="step-label">Step 2 — Catalog Upload</span>
              <h3>Add Your Products</h3>
              <p>Upload product images, titles, pricing, and descriptions. Organize items into categories to make browsing easy for customers.</p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="timeline-step">
            <div class="step-visual">
              <span class="step-num">3</span>
            </div>
            <div class="step-content glass-card">
              <span class="step-label">Step 3 — Personalize Layout</span>
              <h3>Customize Your Store Design</h3>
              <p>Choose a template based on your business type (shop, salon, restaurant, freelancer). Customize colors, layout, and branding instantly with live preview.</p>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="timeline-step">
            <div class="step-visual">
              <span class="step-num">4</span>
            </div>
            <div class="step-content glass-card">
              <span class="step-label">Step 4 — Go Live</span>
              <h3>Receive Orders on WhatsApp</h3>
              <p>Share your store link on social media. Customers browse products and place orders that are automatically sent to your WhatsApp inbox.</p>
            </div>
          </div>
        </div>

        <!-- Call to Action Banner -->
        <div class="cta-banner glass-card accent-glow-hover text-center">
          <h2>Ready to Launch Your WhatsStore?</h2>
          <p>Start your store today and begin receiving real customer orders instantly via WhatsApp.</p>
          <div class="cta-actions">
            <a routerLink="/auth/register" class="btn btn-primary">Launch My Store Free</a>
            <a routerLink="/features" class="btn btn-ghost">Learn More Features</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .how-page {
      padding: var(--space-3xl) 0;
    }
    .how-header {
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

    /* Timeline Styles */
    .timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      margin-bottom: var(--space-3xl);
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 31px;
        width: 2px;
        background: linear-gradient(to bottom, var(--color-accent) 0%, var(--color-border) 100%);
        z-index: 1;
      }
    }
    
    .timeline-step {
      display: flex;
      gap: var(--space-xl);
      align-items: flex-start;
      position: relative;
      z-index: 2;
    }
    
    .step-visual {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--color-bg-card);
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-normal);
    }
    .timeline-step:hover .step-visual {
      border-color: var(--color-accent);
      box-shadow: 0 0 20px var(--color-accent-glow);
      transform: scale(1.05);
    }
    .step-num {
      font-size: 1.5rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--color-accent);
    }
    
    .step-content {
      flex: 1;
      padding: var(--space-xl);
      h3 {
        font-size: 1.45rem;
        font-weight: 800;
        margin: var(--space-xs) 0 var(--space-sm);
        color: #fff;
      }
      p {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--color-text-secondary);
      }
      code {
        background: rgba(255,255,255,0.04);
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        font-family: monospace;
        color: var(--color-accent);
      }
    }
    .step-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
    
    @media (max-width: 600px) {
      .timeline::before {
        display: none;
      }
      .timeline-step {
        flex-direction: column;
        gap: var(--space-md);
      }
      .step-visual {
        width: 50px;
        height: 50px;
      }
    }
  `]
})
export class HowItWorksComponent { }
