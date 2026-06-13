import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sa-dashboard fade-in">
      <header class="dash-header">
        <div>
          <h1>Platform Overview</h1>
          <p class="subtitle">Welcome to the WhatsStore System Owner portal.</p>
        </div>
      </header>

      <div class="kpi-grid" *ngIf="stats">
        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <h3>Total Stores</h3>
            <span class="icon">🏪</span>
          </div>
          <div class="kpi-value">{{ stats.totalStores | number }}</div>
          <div class="kpi-trend positive">↑ Live DB</div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <h3>Active Subscriptions</h3>
            <span class="icon">💳</span>
          </div>
          <div class="kpi-value">{{ stats.activeSubscriptions | number }}</div>
          <div class="kpi-trend positive">↑ Live DB</div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <h3>Monthly Revenue (MRR)</h3>
            <span class="icon">💰</span>
          </div>
          <div class="kpi-value">{{ stats.monthlyRevenue | currency:'INR' }}</div>
          <div class="kpi-trend positive">↑ Live DB</div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <h3>New Signups (7d)</h3>
            <span class="icon">🔥</span>
          </div>
          <div class="kpi-value">{{ stats.newSignups | number }}</div>
          <div class="kpi-trend neutral">→ Live DB</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sa-dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .dash-header h1 {
      font-size: 2rem;
      margin-bottom: var(--space-xs);
      background: linear-gradient(to right, var(--color-text-primary), #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-lg);
    }
    .kpi-card {
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      border-top: 1px solid rgba(139, 92, 246, 0.2);
    }
    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--color-text-secondary);
    }
    .kpi-header h3 {
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .icon {
      font-size: 1.5rem;
    }
    .kpi-value {
      font-size: 2.5rem;
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .kpi-trend {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .kpi-trend.positive { color: var(--color-accent); }
    .kpi-trend.negative { color: var(--color-danger); }
    .kpi-trend.neutral { color: var(--color-text-secondary); }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {
  stats: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get(`${environment.apiUrl}/superadmin/dashboard-stats`, { headers })
      .subscribe((res: any) => {
        this.stats = res.data;
      });
  }
}
