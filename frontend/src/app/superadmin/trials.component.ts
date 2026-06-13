import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-superadmin-trials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sa-subscriptions fade-in">
      <header class="dash-header">
        <div>
          <h1>Trial Users</h1>
          <p class="subtitle">Manage all active and expired trial users. Extend trials as needed.</p>
        </div>
      </header>

      <div class="subs-list glass-card">
        <div class="table-responsive">
          <table class="sa-table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Trial Dates</th>
                <th>Days Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sub of trialSubscriptions">
                <td><strong>{{ sub.store?.name || 'Unknown' }}</strong></td>
                <td>{{ sub.user?.name || 'Unknown' }}<br><small class="text-muted">{{ sub.user?.email }}</small></td>
                <td>
                  <span class="badge" 
                        [class.badge-primary]="sub.status === 'TRIAL_ACTIVE'"
                        [class.badge-danger]="sub.status === 'TRIAL_EXPIRED'">
                    {{ sub.status }}
                  </span>
                </td>
                <td class="date-col">
                  <div><small>Start:</small> {{ sub.trialStartDate | date:'shortDate' }}</div>
                  <div><small>End:</small> {{ sub.trialEndDate | date:'shortDate' }}</div>
                </td>
                <td>
                  <span [class.text-danger]="getDaysRemaining(sub) === 0">
                    {{ getDaysRemaining(sub) }} days
                  </span>
                </td>
                <td>
                  <button class="btn-sm btn-primary" (click)="extendTrial(sub._id, 7)">+7 Days</button>
                  <button class="btn-sm btn-primary" (click)="extendTrial(sub._id, 14)">+14 Days</button>
                </td>
              </tr>
              <tr *ngIf="trialSubscriptions.length === 0">
                <td colspan="6" class="text-center text-muted">No trial subscriptions found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sa-subscriptions { display: flex; flex-direction: column; gap: var(--space-xl); }
    .dash-header h1 { font-size: 2rem; margin-bottom: var(--space-xs); background: linear-gradient(to right, var(--color-text-primary), #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subs-list { padding: var(--space-xl); border-top: 1px solid var(--color-border); }
    .table-responsive { overflow-x: auto; }
    .sa-table { width: 100%; border-collapse: collapse; text-align: left; }
    .sa-table th { padding: 12px; border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
    .sa-table td { padding: 16px 12px; border-bottom: 1px solid var(--color-border); font-size: 0.95rem; }
    .sa-table tbody tr:hover { background: var(--color-bg-surface); }
    .date-col { font-size: 0.85rem; color: var(--color-text-secondary); }
    .date-col small { font-weight: 600; color: var(--color-text-primary); }
    .badge { padding: 4px 10px; background: var(--color-bg-surface); border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; }
    .badge-primary { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
    .badge-danger { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2); }
    .btn-sm { padding: 6px 12px; border: none; border-radius: 4px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: 0.2s; margin-right: 4px; }
    .btn-primary { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
    .btn-sm:hover { opacity: 0.8; }
    .text-center { text-align: center; }
    .text-muted { color: var(--color-text-secondary); }
    .text-danger { color: var(--color-danger); font-weight: 600; }
  `]
})
export class TrialsComponent implements OnInit {
  subscriptions: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchSubscriptions();
  }

  fetchSubscriptions() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get(`${environment.apiUrl}/subscriptions`, { headers }).subscribe((res: any) => {
      this.subscriptions = res.subscriptions || [];
    });
  }

  get trialSubscriptions() {
    return this.subscriptions.filter(s => s.status === 'TRIAL_ACTIVE' || s.status === 'TRIAL_EXPIRED');
  }

  getDaysRemaining(sub: any): number {
    if (!sub.trialEndDate) return 0;
    const end = new Date(sub.trialEndDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  extendTrial(id: string, days: number) {
    if (!confirm(`Are you sure you want to add ${days} days to this trial?`)) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.put(`${environment.apiUrl}/subscriptions/${id}/extend-trial`, { days }, { headers })
      .subscribe(() => {
        this.fetchSubscriptions();
      });
  }
}
