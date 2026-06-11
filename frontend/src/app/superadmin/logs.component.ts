import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-superadmin-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sa-logs fade-in">
      <header class="dash-header">
        <div>
          <h1>System Logs</h1>
          <p class="subtitle">Platform audit trail and activity logging.</p>
        </div>
      </header>

      <div class="logs-list glass-card">
        <div class="table-responsive">
          <table class="sa-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Module</th>
                <th>Action</th>
                <th>User</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs">
                <td class="text-muted">{{ log.createdAt | date:'short' }}</td>
                <td><span class="badge">{{ log.module }}</span></td>
                <td><strong>{{ log.action }}</strong></td>
                <td>
                  {{ log.user?.name || 'System' }}
                  <small class="text-muted d-block">{{ log.user?.role || '' }}</small>
                </td>
                <td class="text-muted">{{ log.ipAddress }}</td>
              </tr>
              <tr *ngIf="logs.length === 0">
                <td colspan="5" class="text-center text-muted">No system logs found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sa-logs { display: flex; flex-direction: column; gap: var(--space-xl); }
    .dash-header h1 { font-size: 2rem; margin-bottom: var(--space-xs); background: linear-gradient(to right, #fff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .logs-list { padding: var(--space-xl); border-top: 1px solid rgba(139, 92, 246, 0.2); }
    .table-responsive { overflow-x: auto; }
    .sa-table { width: 100%; border-collapse: collapse; text-align: left; }
    .sa-table th { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--color-text-secondary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
    .sa-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem; }
    .sa-table tbody tr:hover { background: rgba(255,255,255,0.02); }
    .badge { padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 0.75rem; font-family: monospace; }
    .d-block { display: block; }
    .text-center { text-align: center; }
    .text-muted { color: var(--color-text-secondary); }
  `]
})
export class LogsComponent implements OnInit {
  logs: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchLogs();
  }

  fetchLogs() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get(`${environment.apiUrl}/logs`, { headers }).subscribe((res: any) => {
      this.logs = res.logs || [];
    });
  }
}
