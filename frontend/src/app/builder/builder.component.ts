import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface LayoutConfig {
  template: string;
  theme: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutText: string;
  ctaTitle: string;
}

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="builder-scaffold animate-fade-in-up">
      <!-- Header -->
      <header class="page-header">
        <div>
          <span class="badge">No-Code Website Builder</span>
          <h1>Store Builder</h1>
          <p>Customize your storefront's template, theme, and sections. Updates appear instantly in the live mockup.</p>
        </div>
        <button (click)="onSave()" class="btn btn-primary" [disabled]="saving || loading" id="save-builder-btn">
          {{ saving ? 'Saving Layout...' : '💾 Save Layout' }}
        </button>
      </header>

      <!-- Message notifications -->
      <div *ngIf="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
      <div *ngIf="errorMsg" class="alert alert-danger">❌ {{ errorMsg }}</div>

      <!-- Main Workspace -->
      <div class="workspace" *ngIf="!loading">
        
        <!-- Left Side: Controls -->
        <div class="controls-panel card">
          <!-- Templates & Themes -->
          <div class="section-card">
            <h3>Template & Appearance</h3>
            
            <div class="form-group">
              <label for="b-template">Base Template Layout</label>
              <select id="b-template" name="template" [(ngModel)]="layout.template">
                <option value="Shop">Shop (E-commerce Retail)</option>
                <option value="Restaurant">Restaurant (Food & Dine)</option>
                <option value="Salon">Salon (Beauty & Health)</option>
                <option value="Freelancer">Freelancer (Portfolio & Services)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="b-theme">Color Theme Accent</label>
              <select id="b-theme" name="theme" [(ngModel)]="layout.theme">
                <option value="Classic Green">Classic Green (WhatsApp style)</option>
                <option value="Ocean Blue">Ocean Blue (Tech/Modern)</option>
                <option value="Obsidian Dark">Obsidian Dark (Luxury/Sleek)</option>
                <option value="Warm Amber">Warm Amber (Cozy/Retro)</option>
              </select>
            </div>
          </div>

          <!-- Hero Customization -->
          <div class="section-card">
            <h3>Hero Banner Section</h3>
            
            <div class="form-group">
              <label for="b-hero-t">Hero Title</label>
              <input id="b-hero-t" type="text" name="heroTitle" [(ngModel)]="layout.heroTitle" placeholder="Welcome header title">
            </div>

            <div class="form-group">
              <label for="b-hero-s">Hero Subtitle</label>
              <input id="b-hero-s" type="text" name="heroSubtitle" [(ngModel)]="layout.heroSubtitle" placeholder="Brief supporting description">
            </div>

            <div class="form-group">
              <label for="b-hero-img">Hero Image URL</label>
              <input id="b-hero-img" type="url" name="heroImageUrl" [(ngModel)]="layout.heroImageUrl" placeholder="https://example.com/banner.jpg">
              <p class="field-hint">Leave blank to use a template-default background.</p>
            </div>
          </div>

          <!-- About Customization -->
          <div class="section-card">
            <h3>About Us Section</h3>
            
            <div class="form-group">
              <label for="b-about-t">About Section Title</label>
              <input id="b-about-t" type="text" name="aboutTitle" [(ngModel)]="layout.aboutTitle" placeholder="e.g. About Our Shop">
            </div>

            <div class="form-group">
              <label for="b-about-txt">About Content</label>
              <textarea id="b-about-txt" name="aboutText" [(ngModel)]="layout.aboutText" rows="4" placeholder="Detail your shop values, mission, or specialties..."></textarea>
            </div>
          </div>

          <!-- CTA Customization -->
          <div class="section-card">
            <h3>Call To Action Footer</h3>
            
            <div class="form-group">
              <label for="b-cta-t">Footer CTA Title</label>
              <input id="b-cta-t" type="text" name="ctaTitle" [(ngModel)]="layout.ctaTitle" placeholder="e.g. Have questions? Chat with us!">
            </div>
          </div>
        </div>

        <!-- Right Side: Live Mockup Preview Device -->
        <div class="preview-panel">
          <div class="preview-sticky">
            <div class="preview-header">
              <span class="preview-tag">📱 Interactive Live Preview</span>
              <span class="preview-url">siteflow.com/store/{{ slug }}</span>
            </div>
            
            <!-- Simulated Mobile Device Frame -->
            <div class="device-frame shadow-md">
              <div class="device-notch"></div>
              
              <div class="device-screen" [className]="'device-screen theme-' + getThemeClass() + ' template-' + getTemplateClass()">
                
                <!-- Mock Navbar -->
                <header class="mock-nav">
                  <div class="mock-logo">🏪 {{ storeName }}</div>
                  <span class="mock-badge">Active</span>
                </header>
                
                <!-- Mock Content Scrollable Area -->
                <div class="mock-scrollable">
                  
                  <!-- Hero Section -->
                  <section class="mock-hero" [style.background-image]="layout.heroImageUrl ? 'url(' + layout.heroImageUrl + ')' : ''">
                    <div class="mock-hero-overlay"></div>
                    <div class="mock-hero-content">
                      <h2>{{ layout.heroTitle || 'Welcome to our store' }}</h2>
                      <p>{{ layout.heroSubtitle || 'Browse our items and order via WhatsApp' }}</p>
                      <button class="mock-btn-accent">{{ getTemplateCTA() }}</button>
                    </div>
                  </section>
                  
                  <!-- Products Catalog Section Preview -->
                  <section class="mock-section mock-products">
                    <h4 class="mock-sect-title">Featured Collections</h4>
                    <div class="mock-product-grid">
                      <div class="mock-prod-card">
                        <div class="mock-prod-img">🧁</div>
                        <div class="mock-prod-body">
                          <h5>Delicious Cupcake</h5>
                          <span class="mock-price">₹120</span>
                        </div>
                      </div>
                      <div class="mock-prod-card">
                        <div class="mock-prod-img">🍩</div>
                        <div class="mock-prod-body">
                          <h5>Glazed Donut</h5>
                          <span class="mock-price">₹80</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <!-- About Section -->
                  <section class="mock-section mock-about">
                    <h4 class="mock-sect-title">{{ layout.aboutTitle || 'About Us' }}</h4>
                    <p class="mock-text">{{ layout.aboutText || 'Your company bio and shop values will appear here.' }}</p>
                  </section>

                  <!-- CTA Section -->
                  <section class="mock-section mock-cta">
                    <h4 class="mock-cta-title">{{ layout.ctaTitle || 'Have questions? Chat with us!' }}</h4>
                    <button class="mock-btn-whatsapp">🟢 Message via WhatsApp</button>
                  </section>
                  
                  <!-- Footer -->
                  <footer class="mock-footer">
                    <p>&copy; 2025 {{ storeName }}. Powered by SiteFlow</p>
                  </footer>
                  
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .builder-scaffold {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-md) 0;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
      flex-wrap: wrap;
    }
    .page-header h1 {
      margin: var(--space-xs) 0;
      font-size: 2.2rem;
      font-weight: 900;
      color: #fff;
    }
    .page-header p {
      color: var(--color-text-secondary);
    }
    .alert {
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-md);
      font-size: 0.875rem;
    }
    .alert-success {
      background: rgba(37, 211, 102, 0.1);
      color: var(--color-accent);
      border: 1px solid rgba(37, 211, 102, 0.2);
    }
    .alert-danger {
      background: rgba(255, 77, 109, 0.1);
      color: var(--color-danger);
      border: 1px solid rgba(255, 77, 109, 0.2);
    }
    .workspace {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: var(--space-xl);
      align-items: start;
    }
    @media (max-width: 900px) {
      .workspace {
        grid-template-columns: 1fr;
      }
    }
    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      padding: var(--space-2xl);
      background: rgba(17, 19, 25, 0.65);
      border-color: rgba(255, 255, 255, 0.08);
    }
    .section-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-xl);
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      h3 {
        font-size: 1.15rem;
        color: var(--color-accent);
        margin-bottom: var(--space-xs);
        font-weight: 800;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 12px;
      background: rgba(8, 9, 13, 0.4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-family: var(--font-base);
      font-size: 0.9375rem;
      outline: none;
      transition: all var(--transition-fast);
      &:focus {
        border-color: var(--color-accent);
        box-shadow: 0 0 12px rgba(37, 211, 102, 0.25);
        background: rgba(8, 9, 13, 0.6);
      }
    }
    .field-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 2px;
    }
    .preview-panel {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .preview-sticky {
      position: sticky;
      top: var(--space-md);
      width: 100%;
      max-width: 385px;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .preview-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0 var(--space-sm);
    }
    .preview-tag {
      font-size: 0.75rem;
      color: var(--color-accent);
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .preview-url {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-family: monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Device phone mockup */
    .device-frame {
      width: 100%;
      height: 610px;
      border: 12px solid #1c1d22;
      border-radius: 44px;
      background: #000;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), inset 0 0 10px rgba(255, 255, 255, 0.1);
    }
    .device-notch {
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 140px;
      height: 22px;
      background: #1c1d22;
      border-bottom-left-radius: 18px;
      border-bottom-right-radius: 18px;
      z-index: 10;
    }
    .device-screen {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #08090d;
      color: #e2e8f0;
      font-size: 0.8rem;
    }
    .mock-nav {
      height: 54px;
      padding: 18px 16px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(10px);
      z-index: 5;
    }
    .mock-logo {
      font-weight: 800;
      font-size: 0.85rem;
      color: #fff;
    }
    .mock-badge {
      background: rgba(37, 211, 102, 0.15);
      color: #25d366;
      border: 1px solid rgba(37, 211, 102, 0.2);
      font-size: 0.65rem;
      padding: 2px 7px;
      border-radius: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .mock-scrollable {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      &::-webkit-scrollbar { width: 4px; }
    }
    
    /* Mock Hero Banner */
    .mock-hero {
      height: 190px;
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-md);
    }
    .mock-hero-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.68);
      z-index: 1;
    }
    .mock-hero-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      h2 {
        font-size: 1.35rem;
        font-weight: 900;
        color: #fff;
        line-height: 1.25;
      }
      p {
        font-size: 0.75rem;
        color: #94a3b8;
        max-width: 250px;
      }
    }
    .mock-btn-accent {
      margin-top: 8px;
      padding: 7px 16px;
      border-radius: 8px;
      border: none;
      font-weight: 800;
      font-size: 0.75rem;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }
    .mock-section {
      padding: var(--space-md);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .mock-sect-title {
      font-size: 0.85rem;
      font-weight: 800;
      margin-bottom: var(--space-sm);
      border-left: 2px solid;
      padding-left: 6px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .mock-product-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm);
    }
    .mock-prod-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .mock-prod-img {
      height: 85px;
      background: rgba(255, 255, 255, 0.03);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.85rem;
    }
    .mock-prod-body {
      padding: 8px;
      h5 {
        font-size: 0.75rem;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .mock-price {
      font-size: 0.8rem;
      font-weight: 800;
      display: block;
      margin-top: 2px;
    }
    .mock-about {
      p {
        font-size: 0.75rem;
        line-height: 1.5;
        color: #94a3b8;
      }
    }
    .mock-cta {
      text-align: center;
      background: rgba(255,255,255,0.01);
    }
    .mock-cta-title {
      font-size: 0.85rem;
      font-weight: 800;
      margin-bottom: var(--space-sm);
      color: #fff;
    }
    .mock-btn-whatsapp {
      width: 100%;
      background: #25d366;
      color: #000;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.78rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
    }
    .mock-footer {
      padding: var(--space-md);
      text-align: center;
      font-size: 0.65rem;
      color: #475569;
      background: #040507;
      margin-top: auto;
      border-top: 1px solid rgba(255, 255, 255, 0.02);
    }

    /* Theme customizations */
    .theme-classic-green {
      .mock-btn-accent { background: #25d366; color: #000; }
      .mock-logo, .mock-price, .mock-sect-title { color: #25d366; }
    }
    .theme-ocean-blue {
      .mock-btn-accent { background: #00b4d8; color: #000; }
      .mock-logo, .mock-price, .mock-sect-title { color: #00b4d8; }
    }
    .theme-obsidian-dark {
      .mock-btn-accent { background: #e5e5e5; color: #000; }
      .mock-logo, .mock-price, .mock-sect-title { color: #e5e5e5; }
    }
    .theme-warm-amber {
      .mock-btn-accent { background: #ff9f1c; color: #000; }
      .mock-logo, .mock-price, .mock-sect-title { color: #ff9f1c; }
    }
    
    /* Templates */
    .template-Salon {
      font-family: Georgia, serif;
      .mock-hero {
        background-color: #3b2c35;
      }
    }
    .template-Restaurant {
      font-family: 'Outfit', sans-serif;
      .mock-hero {
        background-color: #4a1c1c;
      }
    }
    .template-Shop {
      font-family: 'Outfit', sans-serif;
      .mock-hero {
        background-color: #1a2530;
      }
    }
    .template-Freelancer {
      font-family: monospace;
      .mock-hero {
        background-color: #222;
      }
    }
  `]
})
export class BuilderComponent implements OnInit {
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';
  
  slug = 'your-shop';
  storeName = 'Your Shop';
  
  layout: LayoutConfig = {
    template: 'Shop',
    theme: 'Classic Green',
    heroTitle: 'Welcome to our store',
    heroSubtitle: 'Browse our products and order easily via WhatsApp.',
    heroImageUrl: '',
    aboutTitle: 'About Us',
    aboutText: 'We are a small business dedicated to providing premium quality products.',
    ctaTitle: 'Have questions? Chat with us!'
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchBusiness();
  }

  fetchBusiness() {
    this.api.get<any>('business/me').subscribe({
      next: (res) => {
        if (res.success && res.business) {
          this.slug = res.business.websiteSlug || 'your-shop';
          this.storeName = res.business.name || 'Your Shop';
          if (res.business.layoutConfig) {
            this.layout = { ...this.layout, ...res.business.layoutConfig };
          }
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load builder details.';
        this.loading = false;
      }
    });
  }

  onSave() {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    
    this.api.patch<any>('business/me', { layoutConfig: this.layout }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Layout customized and saved successfully!';
          setTimeout(() => this.successMsg = '', 4000);
        }
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = err.message || 'Failed to save layout configuration.';
        this.saving = false;
      }
    });
  }

  // Preview helper functions
  getThemeClass(): string {
    return this.layout.theme.toLowerCase().replace(/\s+/g, '-');
  }

  getTemplateClass(): string {
    return this.layout.template;
  }

  getTemplateCTA(): string {
    switch (this.layout.template) {
      case 'Salon': return '💅 Book Appointment';
      case 'Restaurant': return '🍔 Order Food';
      case 'Freelancer': return '💼 Hire Me';
      default: return '🛍️ Shop Now';
    }
  }
}
