import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CommonModule],
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

        <div class="stats-grid">
          <div class="stat-card glass-card">
            <div class="stat-icon-wrapper">👁️</div>
            <div class="stat-value">{{ dashboardStats?.pageViews || 0 }}</div>
            <div class="stat-label">Store Views</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon-wrapper">💬</div>
            <div class="stat-value">{{ dashboardStats?.whatsappClicks || 0 }}</div>
            <div class="stat-label">WhatsApp Clicks</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon-wrapper">🛒</div>
            <div class="stat-value">{{ dashboardStats?.totalOrders || 0 }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon-wrapper">📈</div>
            <div class="stat-value">₹{{ dashboardStats?.totalSales || 0 }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>

        <div class="subscription-card glass-card" *ngIf="subscription">
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

        <div class="quick-actions">
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
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-value { font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: #fff; line-height: 1; }
    .stat-label { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

    .subscription-card {
      padding: var(--space-xl);
      margin-bottom: var(--space-3xl);
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
    .sub-value { font-size: 1.1rem; font-weight: 700; color: #fff; }
    .badge { padding: 4px 12px; background: rgba(255,255,255,0.1); border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .badge-success { background: rgba(37, 211, 102, 0.15); color: var(--color-accent); border: 1px solid rgba(37, 211, 102, 0.3); }

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

  actions = [
    { icon: '➕', label: 'Add Product', path: '/admin/products' },
    { icon: '🎨', label: 'Edit Website', path: '/admin/customize' },
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
        }
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
      }
    });
  }
}
