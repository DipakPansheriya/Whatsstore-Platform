import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
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
          @for (stat of stats; track stat.label) {
            <div class="stat-card glass-card">
              <div class="stat-icon-wrapper">{{ stat.icon }}</div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          }
        </div>

        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            @for (action of actions; track action.label) {
              <a [routerLink]="action.path" class="action-card glass-card accent-glow-hover">
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
      gap: var(--space-lg); margin-bottom: var(--space-3xl);
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

    .quick-actions h2 { margin-bottom: var(--space-lg); font-size: 1.5rem; font-weight: 800; }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-lg); }
    .action-card {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
      padding: var(--space-xl) var(--space-lg); text-decoration: none; text-align: center;
      cursor: pointer;
      &:hover { border-color: var(--color-accent); background: var(--color-accent-dim); opacity: 1; }
    }
    .action-icon { font-size: 2rem; }
    .action-label { font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); }
  `]
})
export class DashboardComponent {
  stats = [
    { icon: '📦', label: 'Products', value: '0' },
    { icon: '🛒', label: 'Orders', value: '0' },
    { icon: '👁️', label: 'Store Views', value: '0' },
    { icon: '💬', label: 'WhatsApp Chats', value: '0' },
  ];

  actions = [
    { icon: '➕', label: 'Add Product', path: '/products' },
    { icon: '🎨', label: 'Edit Website', path: '/builder' },
    { icon: '📋', label: 'View Orders', path: '/orders' },
    { icon: '🏪', label: 'My Store', path: '/public-store' },
  ];

  constructor(public auth: AuthService) {}
}
