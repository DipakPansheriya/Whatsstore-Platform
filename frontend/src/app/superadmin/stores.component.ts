import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-superadmin-stores',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sa-stores fade-in">
      <header class="dash-header">
        <div>
          <h1>Stores Management</h1>
          <p class="subtitle">View and manage all merchant stores on the platform.</p>
        </div>
      </header>

      <div class="stores-list glass-card">
        <h3>Active Stores</h3>
        <div class="table-responsive">
          <table class="sa-table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>URL Slug</th>
                <th>Owner Name</th>
                <th>Owner Email</th>
                <th>WhatsApp No.</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let store of stores">
                <td><strong>{{ store.name }}</strong></td>
                <td><span class="url-slug">/{{ store.websiteSlug }}</span></td>
                <td>{{ store.owner?.name || 'N/A' }}</td>
                <td>{{ store.owner?.email || 'N/A' }}</td>
                <td>{{ store.whatsappNumber }}</td>
                <td>{{ store.createdAt | date:'mediumDate' }}</td>
                <td>
                  <button class="btn-icon" title="View Store">👁️</button>
                  <button class="btn-icon delete" title="Suspend Store">⛔</button>
                </td>
              </tr>
              <tr *ngIf="stores.length === 0">
                <td colspan="7" class="text-center text-muted">No stores found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sa-stores { display: flex; flex-direction: column; gap: var(--space-xl); }
    .dash-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .dash-header h1 { font-size: 2rem; margin-bottom: var(--space-xs); background: linear-gradient(to right, var(--color-text-primary), #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .stores-list { padding: var(--space-xl); border-top: 1px solid var(--color-border); }
    .stores-list h3 { margin-bottom: var(--space-lg); font-size: 1.25rem; }
    .table-responsive { overflow-x: auto; }
    .sa-table { width: 100%; border-collapse: collapse; text-align: left; }
    .sa-table th { padding: 12px; border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
    .sa-table td { padding: 16px 12px; border-bottom: 1px solid var(--color-border); font-size: 0.95rem; }
    .sa-table tbody tr:hover { background: var(--color-bg-surface); }
    .url-slug { padding: 4px 8px; background: var(--color-bg-surface); border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: var(--color-accent); }
    .btn-icon { background: transparent; border: none; font-size: 1.1rem; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; }
    .btn-icon:hover { background: var(--color-bg-surface); }
    .btn-icon.delete:hover { background: rgba(239, 68, 68, 0.2); }
    .text-center { text-align: center; }
    .text-muted { color: var(--color-text-secondary); }
  `]
})
export class StoresComponent implements OnInit {
  stores: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchStores();
  }

  fetchStores() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get(`${environment.apiUrl}/superadmin/stores`, { headers }).subscribe((res: any) => {
      this.stores = res.stores;
    });
  }
}
