import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Animations } from '../shared/animations/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CommonModule],
  animations: [Animations.staggerList],
  template: `
    <div class="dashboard-page">
      <div class="container">
        <header class="dash-header animate-fade-in-up">
          <div>
            <span class="badge">Dashboard</span>
            <h1>Welcome back, {{ (auth.currentUser$ | async)?.name || 'Builder' }} 👋</h1>
            <p>Manage your storefront, products, and orders.</p>
          </div>
        </header>

        <div class="stats-grid" [@staggerList]="dashboardStats ? 'loaded' : 'init'">
          <!-- 1. Store Views -->
          <div class="stat-card glass-card animate-item">
            <div class="stat-icon-wrapper">👁️</div>
            <div class="stat-value">{{ dashboardStats?.pageViews || 0 }}</div>
            <div class="stat-label">Store Views</div>
          </div>
          <!-- 2. WhatsApp Clicks -->
          <div class="stat-card glass-card animate-item">
            <div class="stat-icon-wrapper">💬</div>
            <div class="stat-value">{{ dashboardStats?.whatsappClicks || 0 }}</div>
            <div class="stat-label">WhatsApp Clicks</div>
          </div>
          <!-- 3. Total Products -->
          <div class="stat-card glass-card animate-item">
            <div class="stat-icon-wrapper">📦</div>
            <div class="stat-value">{{ dashboardStats?.totalProducts || 0 }}</div>
            <div class="stat-label">Total Products</div>
          </div>
          <!-- 4. Total Orders -->
          <div class="stat-card glass-card animate-item">
            <div class="stat-icon-wrapper">🛒</div>
            <div class="stat-value">{{ dashboardStats?.totalOrders || 0 }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <!-- 5. Total Revenue -->
          <div class="stat-card glass-card animate-item">
            <div class="stat-icon-wrapper">📈</div>
            <div class="stat-value">₹{{ dashboardStats?.totalSales || 0 }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
          <!-- 6. Cart Abandonment Rate -->
          <div class="stat-card glass-card animate-item">
            <div class="stat-icon-wrapper">💔</div>
            <div class="stat-value">{{ dashboardStats?.cartAbandonmentRate || 0 }}%</div>
            <div class="stat-label">Cart Abandonment</div>
          </div>
          <!-- 7. Monthly Growth -->
          <div class="stat-card glass-card animate-item">
            <div class="stat-icon-wrapper">🚀</div>
            <div class="stat-value" [style.color]="(dashboardStats?.monthlyGrowth || 0) < 0 ? '#ef4444' : '#25d366'">
              {{ (dashboardStats?.monthlyGrowth || 0) >= 0 ? '+' : '' }}{{ dashboardStats?.monthlyGrowth || 0 }}%
            </div>
            <div class="stat-label">Monthly Growth</div>
          </div>
          <!-- 8. Conversion Rate -->
          <div class="stat-card glass-card">
            <div class="stat-icon-wrapper">🎯</div>
            <div class="stat-value">{{ dashboardStats?.conversionRate || 0 }}%</div>
            <div class="stat-label">Conversion Rate</div>
          </div>
        </div>

        <!-- Top Selling Products & Low Stock Warnings Widgets -->
        <div class="dashboard-widgets-grid">
          
          <!-- Top Selling Products -->
          <div class="widget-card glass-card">
            <h2 class="widget-title">🔥 Top Selling Products</h2>
            <div class="top-products-list" *ngIf="topSellingProducts.length > 0">
              @for (prod of topSellingProducts; track prod.id) {
                <div class="top-product-item">
                  <div class="product-info-block">
                    <img *ngIf="prod.image" [src]="prod.image" alt="Product Thumbnail" class="mini-prod-img">
                    <div>
                      <strong class="prod-title-text">{{ prod.title }}</strong>
                      <span class="prod-price-text">Price: ₹{{ prod.price }}</span>
                    </div>
                  </div>
                  <div class="sales-info-block">
                    <span class="sales-count-badge">{{ prod.totalQty }} Sold</span>
                    <span class="sales-rev-text">₹{{ prod.revenue }}</span>
                  </div>
                </div>
              }
            </div>
            <div *ngIf="topSellingProducts.length === 0" class="empty-widget-state">
              No product sales registered yet.
            </div>
          </div>

          <!-- Inventory Alerts -->
          <div class="widget-card glass-card">
            <h2 class="widget-title">⚠️ Inventory Alerts</h2>
            
            <div class="stock-alerts-list" *ngIf="lowStockProducts.length > 0">
              @for (prod of lowStockProducts; track prod._id) {
                <div class="alert-item" 
                     [style.background]="prod.stock === 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)'"
                     [style.border]="prod.stock === 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'">
                  <div>
                    <strong class="alert-title-text">{{ prod.title }}</strong>
                    <span class="alert-subtitle-text" [style.color]="prod.stock === 0 ? '#ef4444' : '#f59e0b'">
                      {{ prod.stock === 0 ? 'Out of Stock' : 'Low Stock Warning' }}
                    </span>
                  </div>
                  <span class="alert-stock-val" [style.color]="prod.stock === 0 ? '#ef4444' : '#f59e0b'">
                    {{ prod.stock }} left
                  </span>
                </div>
              }
            </div>
            
            <div *ngIf="lowStockProducts.length === 0" class="empty-widget-success">
              ✅ All products are adequately stocked!
            </div>
          </div>

        </div>

        <!-- Coupon Performance Leaderboard Widget -->
        <div class="widget-card glass-card" style="margin-top: var(--space-xl);" *ngIf="couponSummary.length > 0">
          <h2 class="widget-title" style="margin-top: 0; margin-bottom: var(--space-lg); font-size: 1.35rem; font-weight: 800;">🎟️ Coupon Performance Leaderboard</h2>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary);">
                  <th style="padding: 12px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Coupon Code</th>
                  <th style="padding: 12px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Times Used</th>
                  <th style="padding: 12px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Direct Discounts</th>
                  <th style="padding: 12px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Revenue Impact</th>
                  <th style="padding: 12px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                @for (cp of couponSummary; track cp.code) {
                  <tr style="border-bottom: 1px solid var(--color-border); color: var(--color-text-primary);">
                    <td style="padding: 14px 12px;"><span style="background: var(--color-accent-dim); border: 1px dashed rgba(37,211,102,0.3); color: var(--color-accent); font-weight: 800; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; letter-spacing: 0.05em;">{{ cp.code }}</span></td>
                    <td style="padding: 14px 12px; font-weight: 700;">{{ cp.useCount }} sales</td>
                    <td style="padding: 14px 12px; color: var(--color-danger); font-weight: 700;">-₹{{ cp.discount }}</td>
                    <td style="padding: 14px 12px; color: var(--color-accent); font-weight: 800;">₹{{ cp.revenue }}</td>
                    <td style="padding: 14px 12px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; width: 45px;">{{ cp.conversionRate }}%</span>
                        <div style="width: 70px; height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; background: var(--color-accent);" [style.width]="cp.conversionRate + '%'"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="subscription-card glass-card" *ngIf="subscription" style="margin-top: var(--space-xl);">
          <div class="sub-header">
            <h2>Subscription Details</h2>
            <span class="badge" [class.badge-success]="subscriptionStatus === 'ACTIVE'">{{ subscriptionStatus }}</span>
          </div>
          <div class="sub-grid">
            <div class="sub-item">
              <span class="sub-label">Current Plan</span>
              <span class="sub-value">{{ subscription.plan?.name || 'Free Trial' }}</span>
            </div>
            <div class="sub-item" *ngIf="subscription.startDate">
              <span class="sub-label">Start Date</span>
              <span class="sub-value">{{ subscription.startDate | date:'mediumDate' }}</span>
            </div>
            <div class="sub-item" *ngIf="subscription.expiryDate">
              <span class="sub-label">Expiry Date</span>
              <span class="sub-value">{{ subscription.expiryDate | date:'mediumDate' }}</span>
            </div>
            <div class="sub-item" *ngIf="subscription.trialEndDate && (subscriptionStatus === 'TRIAL_ACTIVE' || subscriptionStatus === 'TRIAL_EXPIRED')">
              <span class="sub-label">Trial Ends</span>
              <span class="sub-value">{{ subscription.trialEndDate | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <div class="quick-actions" style="margin-top: var(--space-xl);">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            @for (action of actions; track action.label) {
              <a [routerLink]="action.path" class="action-card glass-card accent-glow-hover" [class.disabled]="subscriptionStatus === 'TRIAL_EXPIRED' || subscriptionStatus === 'EXPIRED'">
                <span class="action-icon">{{ action.icon }}</span>
                <span class="action-label">{{ action.label }}</span>
              </a>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { padding: var(--space-xl) 0; }
    .dash-header { margin-bottom: var(--space-2xl); }
    .dash-header h1 { margin: var(--space-xs) 0; font-size: 2.2rem; font-weight: 900; }
    .dash-header p { color: var(--color-text-secondary); }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-lg); margin-bottom: var(--space-2xl);
    }
    .stat-card {
      text-align: center;
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
    }
    .stat-icon-wrapper {
      font-size: 1.8rem;
      width: 48px;
      height: 48px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-value { font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--color-text-primary); line-height: 1; }
    .stat-label { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Dashboard widgets layout */
    .dashboard-widgets-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: var(--space-xl);
      margin-bottom: var(--space-2xl);
      @media (max-width: 800px) { grid-template-columns: 1fr; }
    }
    .widget-card {
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
    }
    .widget-title {
      font-size: 1.35rem; font-weight: 800; color: var(--color-text-primary); margin-top: 0; margin-bottom: var(--space-lg);
    }
    .top-products-list {
      display: flex; flex-direction: column; gap: var(--space-md);
    }
    .top-product-item {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: var(--space-sm); border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
    }
    .product-info-block {
      display: flex; align-items: center; gap: 10px;
    }
    .mini-prod-img {
      width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover;
    }
    .prod-title-text { color: var(--color-text-primary); font-size: 0.95rem; display: block; }
    .prod-price-text { font-size: 0.8rem; color: var(--color-text-secondary); }
    .sales-info-block { text-align: right; }
    .sales-count-badge { font-weight: 800; color: var(--color-accent); display: block; font-size: 0.95rem; }
    .sales-rev-text { font-size: 0.8rem; color: var(--color-text-secondary); }
    .empty-widget-state {
      padding: var(--space-xl); text-align: center; color: var(--color-text-secondary); font-size: 0.95rem;
    }

    .stock-alerts-list {
      display: flex; flex-direction: column; gap: 10px;
      max-height: 280px; overflow-y: auto;
    }
    .alert-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px; border-radius: var(--radius-md);
    }
    .alert-title-text { color: var(--color-text-primary); font-size: 0.95rem; display: block; }
    .alert-subtitle-text { font-size: 0.8rem; font-weight: 700; }
    .alert-stock-val { font-weight: 800; font-size: 1rem; }
    .empty-widget-success {
      padding: var(--space-xl); text-align: center; color: var(--color-accent); font-weight: 700; font-size: 0.95rem;
    }

    .subscription-card {
      padding: var(--space-xl);
    }
    .sub-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);
    }
    .sub-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .sub-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-lg);
    }
    .sub-item { display: flex; flex-direction: column; gap: 4px; }
    .sub-label { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 600; text-transform: uppercase; }
    .sub-value { font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary); }
    .badge { padding: 4px 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .badge-success { background: var(--color-accent-dim); color: var(--color-accent); border: 1px solid var(--color-accent-glow); }

    .quick-actions h2 { margin-bottom: var(--space-lg); font-size: 1.5rem; font-weight: 800; }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-lg); }
    .action-card {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
      padding: var(--space-xl) var(--space-lg); text-decoration: none; text-align: center;
      cursor: pointer;
      &:hover { border-color: var(--color-accent); background: var(--color-accent-dim); opacity: 1; }
      &.disabled {
        pointer-events: none;
        opacity: 0.5;
        filter: grayscale(100%);
      }
    }
    .action-icon { font-size: 2rem; }
    .action-label { font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardStats: any = null;
  subscriptionStatus: string = 'ACTIVE';
  subscription: any = null;
  lowStockProducts: any[] = [];
  topSellingProducts: any[] = [];
  couponSummary: any[] = [];

  actions = [
    { icon: '➕', label: 'Add Product', path: '/admin/products' },
    { icon: '🎟️', label: 'Discounts / Coupons', path: '/admin/coupons' },
    { icon: '📋', label: 'View Orders', path: '/admin/orders' },
    { icon: '🏪', label: 'Store Settings', path: '/admin/settings' },
  ];

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchStats();
    this.fetchSubscription();
  }

  fetchSubscription() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get(`${environment.apiUrl}/subscriptions/me`, { headers }).subscribe({
      next: (res: any) => {
        this.subscription = res.subscription;
        this.subscriptionStatus = res.subscription?.status || 'NONE';
      }
    });
  }

  fetchStats() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get(`${environment.apiUrl}/analytics/dashboard`, { headers }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dashboardStats = res.stats;
          this.topSellingProducts = res.topSellingProducts || [];
          this.couponSummary = res.couponSummary || [];
        }
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
      }
    });

    // Fetch catalog products to verify low stock warnings
    this.http.get<any>(`${environment.apiUrl}/products`, { headers }).subscribe({
      next: (res) => {
        if (res.success && res.products) {
          this.lowStockProducts = res.products.filter((p: any) => p.stock <= (p.lowStockThreshold || 3));
        }
      }
    });
  }
}
