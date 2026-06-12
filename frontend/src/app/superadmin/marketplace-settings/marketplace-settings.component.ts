import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.development';

interface BannerItem {
  imageUrl: string;
  title: string;
  linkUrl: string;
}

interface CategoryItem {
  name: string;
  iconUrl: string;
}

@Component({
  selector: 'app-superadmin-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sa-marketplace fade-in">
      <header class="dash-header">
        <div>
          <h1>Marketplace Settings</h1>
          <p class="subtitle">Curate featured stores, banners, categories, and view search queries analytics.</p>
        </div>
        <button class="btn-primary" (click)="saveSettings()" [disabled]="saving">
          {{ saving ? 'Saving Configurations...' : '💾 Save Settings' }}
        </button>
      </header>

      <!-- Messages -->
      <div *ngIf="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
      <div *ngIf="errorMsg" class="alert alert-danger">❌ {{ errorMsg }}</div>

      <div class="settings-grid">
        <!-- Banners & Categories Settings -->
        <div class="settings-col glass-card">
          <h3 class="card-heading">🎟️ Promotional Banners</h3>
          <div class="banners-list">
            <div *ngFor="let banner of banners; let idx = index" class="banner-item-form">
              <div class="item-header">
                <strong>Banner #{{ idx + 1 }}</strong>
                <button type="button" class="btn-remove" (click)="removeBanner(idx)">✕ Remove</button>
              </div>
              <div class="form-group">
                <label>Image URL</label>
                <input type="text" [(ngModel)]="banner.imageUrl" name="bannerImg-{{idx}}" placeholder="https://unsplash.com/...">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Title</label>
                  <input type="text" [(ngModel)]="banner.title" name="bannerTitle-{{idx}}">
                </div>
                <div class="form-group">
                  <label>Redirect Link</label>
                  <input type="text" [(ngModel)]="banner.linkUrl" name="bannerLink-{{idx}}">
                </div>
              </div>
            </div>
            <button type="button" class="btn-ghost btn-sm btn-add" (click)="addBanner()">+ Add Promo Banner</button>
          </div>

          <h3 class="card-heading mt-xl">🔌 Categories List</h3>
          <div class="categories-list">
            <div *ngFor="let cat of categories; let idx = index" class="cat-item-form">
              <input type="text" [(ngModel)]="cat.name" name="catName-{{idx}}" placeholder="Category Name" readonly style="opacity: 0.7;">
              <input type="text" [(ngModel)]="cat.iconUrl" name="catIcon-{{idx}}" placeholder="Emoji or iconUrl" style="width: 80px; text-align: center;">
            </div>
          </div>
        </div>

        <!-- Curated Stores, Products & Search analytics -->
        <div class="settings-col">
          <!-- Curations -->
          <div class="glass-card mb-lg">
            <h3 class="card-heading">⚡ Curate Storefronts</h3>
            
            <div class="form-group mb-md">
              <label>Featured Stores (Comma separated website slugs)</label>
              <input type="text" [(ngModel)]="featuredStoresSlugs" placeholder="e.g. deep6, salon-star, bakery-hub">
              <p class="input-hint">Slugs of published merchant storefronts to promote on the marketplace home.</p>
            </div>

            <div class="form-group">
              <label>Featured Products (Comma separated Product IDs)</label>
              <input type="text" [(ngModel)]="featuredProductsIds" placeholder="e.g. 6a2a945dd30d0a3908a5ac60, ...">
              <p class="input-hint">Unique MongoDB Object IDs of specific products to feature on the homepage.</p>
            </div>
          </div>

          <!-- Search Analytics Leaderboard -->
          <div class="glass-card search-analytics">
            <h3 class="card-heading">🎯 Marketplace Search Analytics</h3>
            <div class="table-responsive">
              <table class="sa-table">
                <thead>
                  <tr>
                    <th>Search Query</th>
                    <th>Frequency Count</th>
                    <th>Last Queried</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let log of searchLogs">
                    <td><strong class="query-text">"{{ log.query }}"</strong></td>
                    <td><span class="badge badge-success">{{ log.count }} searches</span></td>
                    <td class="text-muted">{{ log.lastSearchedAt | date:'short' }}</td>
                  </tr>
                  <tr *ngIf="searchLogs.length === 0">
                    <td colspan="3" class="text-center text-muted">No searches logged yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sa-marketplace { display: flex; flex-direction: column; gap: var(--space-xl); }
    .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-md); }
    .dash-header h1 { font-size: 2rem; margin-bottom: var(--space-xs); background: linear-gradient(to right, #fff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: var(--color-text-secondary); font-size: 0.95rem; }
    
    .btn-primary { background: var(--color-accent); color: #000; border: none; padding: 12px 24px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3); }
    .btn-primary[disabled] { opacity: 0.6; cursor: not-allowed; }
    .btn-ghost { background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); color: #fff; padding: 10px 16px; cursor: pointer; }
    
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); @media (max-width: 800px) { grid-template-columns: 1fr; } }
    .settings-col { display: flex; flex-direction: column; gap: var(--space-xl); }
    
    .card-heading { margin-bottom: var(--space-lg); font-size: 1.25rem; color: #fff; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; }
    .mt-xl { margin-top: var(--space-xl); }
    .mb-lg { margin-bottom: var(--space-lg); }
    .mb-md { margin-bottom: var(--space-md); }
    
    .banners-list { display: flex; flex-direction: column; gap: var(--space-md); }
    .banner-item-form {
      padding: var(--space-md); background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm);
      display: flex; flex-direction: column; gap: 10px;
    }
    .item-header { display: flex; justify-content: space-between; align-items: center; strong { color: #fff; } }
    .btn-remove { background: transparent; border: none; color: var(--color-danger); cursor: pointer; font-size: 0.85rem; font-weight: 600; }
    .btn-add { width: 100%; border: 1px dashed rgba(37,211,102,0.3); color: #25d366; font-weight: 700; &:hover { background: rgba(37,211,102,0.05); } }

    .form-row { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 10px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group label { font-size: 0.8rem; color: var(--color-text-secondary); }
    .form-group input { padding: 10px 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm); color: #fff; outline: none; &:focus { border-color: var(--color-accent); } }
    .input-hint { font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px; }

    .categories-list { display: flex; flex-direction: column; gap: var(--space-xs); }
    .cat-item-form {
      display: flex; gap: 8px;
      input { padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm); color: #fff; outline: none; &:focus { border-color: var(--color-accent); } }
    }

    .search-analytics { padding: var(--space-xl); }
    .table-responsive { overflow-x: auto; }
    .sa-table { width: 100%; border-collapse: collapse; text-align: left; }
    .sa-table th { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: var(--color-text-secondary); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
    .sa-table td { padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem; }
    .sa-table tbody tr:hover { background: rgba(255,255,255,0.02); }
    
    .query-text { color: #fff; font-style: italic; }
    .badge { padding: 4px 10px; background: rgba(255,255,255,0.08); border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .badge-success { background: rgba(37,211,102,0.1); color: #25d366; border: 1px solid rgba(37,211,102,0.25); }
    
    .alert { padding: 12px; border-radius: var(--radius-md); font-size: 0.9rem; margin-top: 10px; }
    .alert-success { background: rgba(37,211,102,0.1); color: #25d366; border: 1px solid rgba(37,211,102,0.2); }
    .alert-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
    .text-center { text-align: center; }
    .text-muted { color: var(--color-text-secondary); }
  `]
})
export class MarketplaceSettingsComponent implements OnInit {
  saving = false;
  successMsg = '';
  errorMsg = '';

  banners: BannerItem[] = [];
  categories: CategoryItem[] = [];
  searchLogs: any[] = [];

  // Comma separated strings representing Curated features IDs/slugs
  featuredStoresSlugs = '';
  featuredProductsIds = '';

  // All database objects cached
  storesList: any[] = [];
  productsList: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchConfig();
    this.fetchAnalytics();
    this.fetchStoresAndProducts();
  }

  fetchConfig() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get<any>(`${environment.apiUrl}/marketplace/config`, { headers }).subscribe({
      next: (res) => {
        if (res.success && res.config) {
          const config = res.config;
          this.banners = config.banners || [];
          this.categories = config.categories || [];
          
          // Pre-populate featured text fields
          this.featuredStoresSlugs = (config.featuredStores || []).map((s: any) => s.websiteSlug || s).join(', ');
          this.featuredProductsIds = (config.featuredProducts || []).map((p: any) => p._id || p).join(', ');
        }
      }
    });
  }

  fetchAnalytics() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get<any>(`${environment.apiUrl}/marketplace/admin/analytics`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.searchLogs = res.searchLogs || [];
        }
      }
    });
  }

  fetchStoresAndProducts() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    
    // Get all published stores Slugs to help validation
    this.http.get<any>(`${environment.apiUrl}/superadmin/stores`, { headers }).subscribe({
      next: (res) => {
        this.storesList = res.stores || [];
      }
    });
  }

  addBanner() {
    this.banners.push({ imageUrl: '', title: '', linkUrl: '/marketplace' });
  }

  removeBanner(idx: number) {
    this.banners.splice(idx, 1);
  }

  saveSettings() {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };

    // Resolve store slugs to IDs
    const storesSlugs = this.featuredStoresSlugs.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    const featuredStoresIds = storesSlugs.map(slug => {
      const found = this.storesList.find(s => s.websiteSlug?.toLowerCase() === slug);
      return found ? found._id : null;
    }).filter(id => id);

    // Resolve products IDs
    const featuredProducts = this.featuredProductsIds.split(',').map(id => id.trim()).filter(id => id.length === 24);

    const payload = {
      banners: this.banners,
      categories: this.categories,
      featuredStores: featuredStoresIds,
      featuredProducts: featuredProducts
    };

    this.http.put<any>(`${environment.apiUrl}/marketplace/admin/config`, payload, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Marketplace settings saved successfully!';
          // Refresh configuration pre-populated bindings
          this.fetchConfig();
        }
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to update marketplace settings.';
        this.saving = false;
      }
    });
  }
}
