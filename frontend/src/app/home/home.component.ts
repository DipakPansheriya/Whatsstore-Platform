import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="hero animate-fade-in-up">
      <div class="container">
        <div class="hero-badge">
          <span class="badge">⚡ No credit card required — launch in minutes</span>
        </div>
        <h1 class="hero-title">Build Your Website and Start<br>Selling Instantly <span class="highlight">on WhatsApp</span></h1>
        <p class="hero-desc">
          WhatsStore helps small businesses create beautiful websites, showcase products, and receive customer orders directly on WhatsApp — no coding, no checkout setup, no complexity.
        </p>
        <div class="hero-actions">
          <a routerLink="/auth/register" class="btn btn-primary" id="hero-cta-primary">
            Start Free Trial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a routerLink="/how-it-works" class="btn btn-ghost" id="hero-cta-secondary">See How It Works</a>
        </div>
      </div>
    </section>

    <!-- Key Features Overview Section -->
    <section class="home-features">
      <div class="container">
        <div class="section-header text-center">
          <span class="badge">Highlights</span>
          <h2>Everything You Need to Sell Online with WhatsStore</h2>
          <p>Everything you need to turn visitors into buyers via direct chat messaging.</p>
        </div>
        <div class="feature-grid">
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">💬</div>
            <h3>WhatsApp Checkout</h3>
            <p>Turn visitors into customers instantly. Every order is sent directly to WhatsApp with pre-filled product details, quantity, and pricing.</p>
          </div>
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">🎨</div>
            <h3>No-Code Builder</h3>
            <p>Build your website using ready-made templates. Customize layout, images, colors, and content without writing a single line of code.</p>
          </div>
          <div class="feature-card glass-card">
            <div class="feature-icon-wrapper">⭐</div>
            <h3>Customer Reviews</h3>
            <p>Build trust with real customer reviews and ratings that help increase conversions and sales.</p>
          </div>
        </div>
        <div class="text-center view-all-link">
          <a routerLink="/features" class="learn-more">Explore All Features ➡️</a>
        </div>
      </div>
    </section>

    <!-- Short Workflow Steps -->
    <section class="home-workflow">
      <div class="container">
        <div class="section-header text-center">
          <span class="badge">Workflow</span>
          <h2>Start Selling in 4 Simple Steps</h2>
          <p>Four quick actions to bring your catalog directly onto the web.</p>
        </div>
        <div class="workflow-steps">
          <div class="workflow-card glass-card">
            <span class="workflow-num">01</span>
            <h4>Create Account</h4>
            <p>Sign up and set up your business profile in seconds.</p>
          </div>
          <div class="workflow-card glass-card">
            <span class="workflow-num">02</span>
            <h4>Add Your Products</h4>
            <p>Upload product images, descriptions, and pricing.</p>
          </div>
          <div class="workflow-card glass-card">
            <span class="workflow-num">03</span>
            <h4>Customize Your Store</h4>
            <p>Choose a template and personalize your website design.</p>
          </div>
          <div class="workflow-card glass-card">
            <span class="workflow-num">04</span>
            <h4>Start Receiving Orders on WhatsApp</h4>
            <p>Share your store link and receive customer orders instantly.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Upgrade Subscription Banner -->
    <section class="home-upgrade">
      <div class="container">
        <div class="upgrade-banner glass-card accent-glow-hover text-center">
          <span class="badge">Plan Access</span>
          <h2>Start Free. Upgrade Anytime.</h2>
          <p>Try WhatsStore free for 10 days. Upgrade anytime to unlock advanced features like custom domain, analytics, and premium templates.</p>
          <a routerLink="/auth/register" class="btn btn-primary">Start Free Trial</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(85vh - var(--navbar-height));
      text-align: center;
      padding: var(--space-3xl) 0 var(--space-xl);
      background: radial-gradient(circle at 50% 50%, rgba(37, 211, 102, 0.04), transparent 60%);
    }
    .hero-badge {
      margin-bottom: var(--space-lg);
    }
    .hero-title {
      margin-bottom: var(--space-lg);
      font-size: clamp(2.5rem, 6vw, 4.2rem);
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .highlight {
      color: var(--color-accent);
      background: linear-gradient(120deg, var(--color-accent) 0%, #00b4d8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30px rgba(37, 211, 102, 0.25);
    }
    .hero-desc {
      font-size: 1.15rem;
      max-width: 620px;
      margin: 0 auto var(--space-xl);
      color: var(--color-text-secondary);
      line-height: 1.8;
    }
    .hero-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      flex-wrap: wrap;
    }

    .text-center { text-align: center; }

    /* Features Section */
    .home-features {
      padding: var(--space-3xl) 0;
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      background: rgba(17, 19, 25, 0.2);
    }
    .section-header {
      margin-bottom: var(--space-2xl);
      h2 { margin: var(--space-sm) 0 var(--space-xs); font-size: 2.2rem; font-weight: 800; }
      p { color: var(--color-text-secondary); font-size: 1.1rem; }
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }
    .feature-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-xl);
      .feature-icon-wrapper {
        font-size: 2.2rem;
        width: 54px;
        height: 54px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--space-xs);
      }
      h3 { font-size: 1.25rem; color: #fff; }
      p { font-size: 0.9375rem; line-height: 1.6; color: var(--color-text-secondary); }
    }
    .view-all-link {
      margin-top: var(--space-md);
    }
    .learn-more {
      font-weight: 600;
      color: var(--color-accent);
      transition: color var(--transition-fast);
      &:hover { color: #fff; }
    }

    /* Workflow Section */
    .home-workflow {
      padding: var(--space-3xl) 0;
    }
    .workflow-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-lg);
    }
    .workflow-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      position: relative;
      padding: var(--space-xl) var(--space-lg);
      .workflow-num {
        font-family: var(--font-heading);
        font-size: 2.8rem;
        font-weight: 900;
        background: linear-gradient(135deg, var(--color-accent) 0%, rgba(37, 211, 102, 0.1) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1;
        margin-bottom: var(--space-xs);
      }
      h4 { font-size: 1.15rem; color: #fff; margin-bottom: 4px; }
      p { font-size: 0.875rem; line-height: 1.5; color: var(--color-text-secondary); }
    }

    /* Upgrade Banner Section */
    .home-upgrade {
      padding: var(--space-xl) 0 var(--space-3xl);
    }
    .upgrade-banner {
      padding: var(--space-2xl) var(--space-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      border-color: rgba(37, 211, 102, 0.15);
      h2 { font-size: 1.95rem; font-weight: 800; }
      p { max-width: 620px; color: var(--color-text-secondary); margin-bottom: var(--space-sm); line-height: 1.7; }
    }
  `]
})
export class HomeComponent { }
