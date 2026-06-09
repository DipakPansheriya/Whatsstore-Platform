import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="about-page animate-fade-in-up">
      <div class="container">
        
        <!-- Hero section -->
        <header class="about-header text-center">
          <span class="badge">Our Vision</span>
          <h1>Empowering Local Commerce</h1>
          <p class="subtitle">We build WhatsApp-first tools to help merchants grow, engage, and check out seamlessly.</p>
        </header>

        <!-- Glass Grid Section -->
        <div class="about-grid">
          <div class="glass-card value-card">
            <div class="icon">🏪</div>
            <h3>WhatsApp-First Strategy</h3>
            <p>Traditional e-commerce carts feel cold and mechanical. By routing orders directly into WhatsApp, we preserve the personal chat touchpoint, enabling merchants to handle customizations, build relationships, and seal deals instantly.</p>
          </div>

          <div class="glass-card value-card">
            <div class="icon">⚡</div>
            <h3>Instant Deployment</h3>
            <p>Create your shop layout, set up pricing themes, upload products, and go live under a customized web link in under 5 minutes. No complex database management or configuration overhead required.</p>
          </div>

          <div class="glass-card value-card">
            <div class="icon">✨</div>
            <h3>Premium Aesthetics</h3>
            <p>Every store built with WhatsStore inherits curated typography, modern grid collections, and harmonious responsive templates tailored for Salons, Restaurants, Freelancers, and Retail Shops.</p>
          </div>
        </div>

        <!-- Details / Stats -->
        <div class="stats-section glass-card">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">10k+</span>
              <span class="stat-label">Active Merchants</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">2M+</span>
              <span class="stat-label">Orders Routed</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">99.9%</span>
              <span class="stat-label">System Uptime</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">4.9 ★</span>
              <span class="stat-label">Merchant Rating</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .about-page {
      padding: var(--space-3xl) 0;
    }
    .about-header {
      max-width: 700px;
      margin: 0 auto var(--space-2xl);
      h1 {
        margin: var(--space-sm) 0 var(--space-xs);
        font-size: 3rem;
        font-weight: 800;
        color: #fff;
        line-height: 1.15;
      }
      .subtitle {
        font-size: 1.15rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
      }
    }
    .text-center {
      text-align: center;
    }
    
    .about-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }
    
    .value-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      padding: var(--space-xl);
      text-align: left;
      transition: all var(--transition-normal);
      
      .icon {
        font-size: 2.5rem;
        line-height: 1;
      }
      h3 {
        font-size: 1.35rem;
        color: #fff;
        font-weight: 700;
      }
      p {
        font-size: 0.95rem;
        line-height: 1.7;
        color: var(--color-text-secondary);
      }
      &:hover {
        border-color: var(--color-accent);
        box-shadow: 0 0 20px var(--color-accent-glow);
        transform: translateY(-4px);
      }
    }

    .stats-section {
      padding: var(--space-xl) var(--space-2xl);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(17, 19, 25, 0.35);
      border-radius: var(--radius-lg);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      text-align: center;
      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-lg) var(--space-md);
      }
      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      .stat-number {
        font-size: 2.5rem;
        font-weight: 900;
        color: var(--color-accent);
        font-family: var(--font-heading);
        text-shadow: 0 0 15px var(--color-accent-glow);
      }
      .stat-label {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
  `]
})
export class AboutComponent {}
