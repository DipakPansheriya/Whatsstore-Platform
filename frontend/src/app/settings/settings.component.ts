import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="settings-page">
      <div class="settings-header">
        <h1>Store Settings</h1>
        <p>Manage your public storefront profile, contact info, and visibility.</p>
      </div>

      <div class="settings-grid">
        <!-- Main Form Card -->
        <div class="settings-card card">
          @if (loading) {
            <div class="loading-state">
              <span class="spinner">⏳</span> Loading store profile...
            </div>
          } @else {
            <form (ngSubmit)="onSave()" class="settings-form">
              
              <!-- Business Identity Section -->
              <h2 class="section-title">Shop Identity</h2>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="set-name">Business / Store Name</label>
                  <input id="set-name" type="text" name="name" [(ngModel)]="business.name" placeholder="e.g. Acme Bakers" required>
                </div>
                
                <div class="form-group">
                  <label for="set-slug">Store URL Slug</label>
                  <div class="slug-input-preview">
                    <span class="domain">siteflow.com/store/</span>
                    <input id="set-slug" type="text" name="websiteSlug" [(ngModel)]="business.websiteSlug" placeholder="e.g. acme-bakers" required>
                  </div>
                </div>
              </div>

              <!-- Share Storefront -->
              <div class="form-group" style="margin-top: -10px; margin-bottom: var(--space-sm);">
                <label>Share Storefront URL</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <input type="text" readonly [value]="getStoreUrl()" style="flex: 1; background: rgba(0,0,0,0.1); opacity: 0.8; font-weight: 600; font-family: monospace;">
                  <button type="button" class="btn" (click)="copyStoreUrl()" style="white-space: nowrap; font-weight: 800; padding: 12px 20px; transition: all 0.3s ease;" [style.background]="copiedUrl ? 'var(--color-accent)' : 'var(--color-bg-surface)'" [style.color]="copiedUrl ? '#000' : 'var(--color-text-primary)'" [style.border]="copiedUrl ? '1px solid var(--color-accent)' : '1px solid var(--color-border)'">
                    {{ copiedUrl ? '✓ Copied' : '📋 Copy URL' }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="set-desc">Shop Description</label>
                <textarea id="set-desc" name="description" [(ngModel)]="business.description" rows="3" placeholder="Tell customers about your store, specialty items, and delivery terms..."></textarea>
              </div>

              <!-- Contact & WhatsApp Details -->
              <h2 class="section-title">Contact & Notifications</h2>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="set-phone">Contact Phone</label>
                  <input id="set-phone" type="tel" name="phone" [(ngModel)]="business.phone" placeholder="Contact number" required>
                </div>
                
                <div class="form-group">
                  <label for="set-whatsapp">WhatsApp Number (For Orders)</label>
                  <input id="set-whatsapp" type="tel" name="whatsappNumber" [(ngModel)]="business.whatsappNumber" placeholder="WhatsApp format: +91..." required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="set-email">Business Contact Email</label>
                  <input id="set-email" type="email" name="email" [(ngModel)]="business.email" placeholder="shop@example.com" required>
                </div>

                <div class="form-group">
                  <label for="set-cat">Business Category</label>
                  <select id="set-cat" name="category" [(ngModel)]="business.category">
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Home & Decor">Home & Decor</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Groceries & Essentials">Groceries & Essentials</option>
                    <option value="General Retail">General Retail</option>
                  </select>
                </div>
              </div>

              <!-- Branding & Appearance -->
              <h2 class="section-title">Storefront Details</h2>

              <div class="form-group">
                <label for="set-logo">Logo image URL</label>
                <input id="set-logo" type="url" name="logoUrl" [(ngModel)]="business.logoUrl" placeholder="https://example.com/logo.png">
              </div>

              <div class="form-group">
                <label for="set-address">Physical Store Address</label>
                <input id="set-address" type="text" name="address" [(ngModel)]="business.address" placeholder="Physical shop address (optional)">
              </div>

              <!-- Theme Preview Section -->
              <h2 class="section-title">Theme Preview</h2>
              <p class="preview-hint">See how your storefront appears to customers in both light and dark modes.</p>
              
              <div class="theme-preview-grid">
                <!-- Light Mode Preview -->
                <div class="theme-preview-card light-mode-preview" (click)="setTheme('light')" [class.selected-theme]="currentTheme === 'light'">
                  <div class="preview-header">
                    <div class="mock-logo"></div>
                    <span class="mock-title">{{ business.name || 'Store Name' }}</span>
                  </div>
                  <div class="preview-body">
                    <div class="mock-search"></div>
                    <div class="mock-product">
                      <div class="mock-img"></div>
                      <div class="mock-text short"></div>
                      <div class="mock-btn"></div>
                    </div>
                  </div>
                  <div class="preview-label">☀️ Light Mode</div>
                </div>

                <!-- Dark Mode Preview -->
                <div class="theme-preview-card dark-mode-preview" (click)="setTheme('dark')" [class.selected-theme]="currentTheme === 'dark'">
                  <div class="preview-header">
                    <div class="mock-logo"></div>
                    <span class="mock-title">{{ business.name || 'Store Name' }}</span>
                  </div>
                  <div class="preview-body">
                    <div class="mock-search"></div>
                    <div class="mock-product">
                      <div class="mock-img"></div>
                      <div class="mock-text short"></div>
                      <div class="mock-btn"></div>
                    </div>
                  </div>
                  <div class="preview-label">🌙 Dark Mode</div>
                </div>
              </div>

              <!-- Visibility Control -->
              <h2 class="section-title">Visibility</h2>
              <div class="toggle-group">
                <div class="toggle-text">
                  <span class="toggle-label">Publish Storefront</span>
                  <span class="toggle-description">Make your store live and accessible to the public at your store URL.</span>
                </div>
                <label class="switch">
                  <input type="checkbox" name="isPublished" [(ngModel)]="business.isPublished">
                  <span class="slider round"></span>
                </label>
              </div>

              <!-- Messages & Submit -->
              @if (errorMsg) {
                <p class="message error-message">❌ {{ errorMsg }}</p>
              }
              @if (successMsg) {
                <p class="message success-message">✅ {{ successMsg }}</p>
              }

              <div class="actions">
                <button type="submit" class="btn btn-primary" [disabled]="saving">
                  {{ saving ? 'Saving Changes...' : 'Save Settings' }}
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-md) 0;
    }
    .settings-header {
      margin-bottom: var(--space-xl);
    }
    .settings-header h1 {
      margin-bottom: var(--space-xs);
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--color-text-primary);
    }
    .settings-header p {
      color: var(--color-text-secondary);
    }
    .settings-card {
      padding: var(--space-2xl);
      background: var(--color-bg-card-glass);
      border-color: var(--color-border);
    }
    .loading-state {
      text-align: center;
      padding: var(--space-xl);
      color: var(--color-text-secondary);
      font-size: 1.1rem;
    }
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }
    .section-title {
      font-size: 1.2rem;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-xs);
      margin-top: var(--space-md);
      color: var(--color-accent);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }
    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
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
    .form-group textarea,
    .form-group select {
      padding: 12px 14px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-family: var(--font-base);
      font-size: 0.9375rem;
      outline: none;
      transition: all var(--transition-fast);
      &:focus {
        border-color: var(--color-accent);
        box-shadow: 0 0 12px rgba(37, 211, 102, 0.2);
        background: var(--color-bg-card);
      }
    }
    .slug-input-preview {
      display: flex;
      align-items: center;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      padding: 0 var(--space-md);
      transition: all var(--transition-fast);
      &:focus-within {
        border-color: var(--color-accent);
        box-shadow: 0 0 12px rgba(37, 211, 102, 0.2);
        background: var(--color-bg-card);
      }
      .domain {
        color: var(--color-text-muted);
        font-size: 0.875rem;
        font-weight: 600;
        user-select: none;
      }
      input {
        flex: 1;
        border: none !important;
        background: transparent !important;
        padding: 12px 0 12px var(--space-xs) !important;
        outline: none;
        box-shadow: none !important;
      }
    }
    .toggle-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-md);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .toggle-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .toggle-label {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--color-text-primary);
    }
    .toggle-description {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    
    /* Toggle switch CSS */
    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(255,255,255,0.1);
      transition: .4s;
      border-radius: 34px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: var(--color-accent);
      box-shadow: 0 0 10px rgba(37, 211, 102, 0.4);
    }
    input:checked + .slider:before {
      transform: translateX(24px);
    }

    .message {
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      text-align: center;
      font-weight: 600;
    }
    .error-message {
      background: rgba(239, 68, 68, 0.1);
      color: var(--color-danger);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .success-message {
      background: rgba(37, 211, 102, 0.1);
      color: var(--color-accent);
      border: 1px solid rgba(37, 211, 102, 0.2);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--space-md);
    }

    /* Theme Preview Styles */
    .preview-hint { font-size: 0.85rem; color: var(--color-text-secondary); margin-top: -10px; margin-bottom: 15px; }
    .theme-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    @media (max-width: 600px) { .theme-preview-grid { grid-template-columns: 1fr; } }
    
    .theme-preview-card {
      border: 2px solid transparent; border-radius: var(--radius-lg); padding: 15px; position: relative; overflow: hidden;
      display: flex; flex-direction: column; gap: 15px; font-family: var(--font-base); transition: all 0.2s; cursor: pointer;
      &:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
      &.selected-theme {
        border-color: var(--color-accent);
        box-shadow: 0 0 15px rgba(37, 211, 102, 0.3);
      }
    }
    .preview-label { font-size: 0.8rem; font-weight: 800; text-align: center; margin-top: 10px; }
    
    /* Mock UI Elements */
    .mock-logo { width: 24px; height: 24px; border-radius: 4px; }
    .mock-title { font-size: 0.9rem; font-weight: 800; }
    .preview-header { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid; padding-bottom: 10px; }
    .preview-body { display: flex; flex-direction: column; gap: 10px; }
    .mock-search { height: 24px; border-radius: 12px; width: 100%; border: 1px solid; }
    .mock-product { border: 1px solid; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
    .mock-img { height: 60px; border-radius: 4px; width: 100%; }
    .mock-text { height: 10px; border-radius: 4px; width: 100%; }
    .mock-text.short { width: 60%; }
    .mock-btn { height: 20px; border-radius: 4px; width: 100%; margin-top: 5px; }

    /* Light Mode Specific */
    .light-mode-preview {
      background-color: #f8fafc; color: #0f172a; border-color: #e2e8f0;
      .preview-header { border-color: #e2e8f0; }
      .mock-logo { background-color: #cbd5e1; }
      .mock-search { background-color: #ffffff; border-color: #e2e8f0; }
      .mock-product { background-color: #ffffff; border-color: #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .mock-img { background-color: #e2e8f0; }
      .mock-text { background-color: #cbd5e1; }
      .mock-btn { background-color: #22c55e; }
    }

    /* Dark Mode Specific */
    .dark-mode-preview {
      background-color: #0b0f19; color: #f8fafc; border-color: #1e293b;
      .preview-header { border-color: #1e293b; }
      .mock-logo { background-color: #334155; }
      .mock-search { background-color: #1e293b; border-color: #334155; }
      .mock-product { background-color: #1e293b; border-color: #334155; }
      .mock-img { background-color: #334155; }
      .mock-text { background-color: #475569; }
      .mock-btn { background-color: #22c55e; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';
  copiedUrl = false;
  
  business: any = {
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    websiteSlug: '',
    description: '',
    category: 'Food & Beverage',
    logoUrl: '',
    address: '',
    isPublished: false
  };

  currentTheme: 'light' | 'dark' | 'system' = 'dark';

  constructor(private api: ApiService, private themeService: ThemeService) {
    this.themeService.theme$.subscribe(t => this.currentTheme = t);
  }

  ngOnInit() {
    this.fetchBusiness();
  }

  fetchBusiness() {
    this.api.get<any>('business/me').subscribe({
      next: (res) => {
        if (res.success && res.business) {
          this.business = res.business;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load business profile. Please try again.';
        this.loading = false;
      }
    });
  }

  onSave() {
    this.errorMsg = '';
    this.successMsg = '';
    this.saving = true;
    
    this.api.patch<any>('business/me', this.business).subscribe({
      next: (res) => {
        if (res.success && res.business) {
          this.business = res.business;
          this.successMsg = 'Settings saved successfully!';
        }
        this.saving = false;
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        this.errorMsg = err.message || 'Failed to save settings. Please verify details.';
        this.saving = false;
      }
    });
  }

  setTheme(theme: 'light' | 'dark') {
    this.themeService.setTheme(theme);
  }

  getStoreUrl(): string {
    const origin = window.location.origin;
    return `${origin}/store/${this.business.websiteSlug || this.business._id || ''}`;
  }

  copyStoreUrl() {
    navigator.clipboard.writeText(this.getStoreUrl()).then(() => {
      this.copiedUrl = true;
      setTimeout(() => {
        this.copiedUrl = false;
      }, 2000);
    });
  }
}
