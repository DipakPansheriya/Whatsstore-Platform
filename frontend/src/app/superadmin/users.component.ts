import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-superadmin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sa-users fade-in">
      <header class="dash-header">
        <div>
          <h1>Users & Stores Management</h1>
          <p class="subtitle">Create and manage admin accounts and their stores.</p>
        </div>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm ? 'Cancel' : '+ Add New Store Admin' }}
        </button>
      </header>

      <!-- Create Admin Form -->
      <div class="form-card glass-card" *ngIf="showForm">
        <h3>Create New Admin Account</h3>
        <form (ngSubmit)="createAdmin()">
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="formData.name" name="name" required placeholder="John Doe">
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="formData.email" name="email" required placeholder="john@example.com">
            </div>
            <div class="form-group">
              <label>WhatsApp Number</label>
              <input type="text" [(ngModel)]="formData.phone" name="phone" required placeholder="1234567890">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="formData.password" name="password" required placeholder="********">
            </div>
            <div class="form-group">
              <label>Store Name</label>
              <input type="text" [(ngModel)]="formData.businessName" name="businessName" required placeholder="My Awesome Store">
            </div>
            <div class="form-group">
              <label>Store URL Slug</label>
              <input type="text" [(ngModel)]="formData.slug" name="slug" required placeholder="my-awesome-store">
            </div>
          </div>
          <div class="form-actions">
            <span class="error-msg" *ngIf="error">{{ error }}</span>
            <span class="success-msg" *ngIf="success">{{ success }}</span>
            <button type="submit" class="btn-primary" [disabled]="loading">
              {{ loading ? 'Creating...' : 'Create Admin & Store' }}
            </button>
          </div>
        </form>
      </div>

      <!-- User List -->
      <div class="users-list glass-card">
        <h3>Registered Accounts</h3>
        <div class="table-responsive">
          <table class="sa-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td><strong>{{ user.name }}</strong></td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td><span class="badge" [class.badge-primary]="user.role === 'SUPERADMIN'">{{ user.role }}</span></td>
                <td>{{ user.createdAt | date:'mediumDate' }}</td>
                <td>
                  <button class="btn-icon" title="Edit">✏️</button>
                  <button class="btn-icon delete" title="Delete">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="6" class="text-center text-muted">No users found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sa-users { display: flex; flex-direction: column; gap: var(--space-xl); }
    .dash-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .dash-header h1 { font-size: 2rem; margin-bottom: var(--space-xs); background: linear-gradient(to right, var(--color-text-primary), #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .btn-primary { background: var(--color-accent); color: #000; border: none; padding: 10px 20px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3); }
    .btn-primary[disabled] { opacity: 0.7; cursor: not-allowed; }
    .form-card, .users-list { padding: var(--space-xl); border-top: 1px solid var(--color-border); }
    .form-card h3, .users-list h3 { margin-bottom: var(--space-lg); font-size: 1.25rem; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg); }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.85rem; color: var(--color-text-secondary); }
    .form-group input { padding: 10px 14px; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-primary); }
    .form-group input:focus { outline: none; border-color: var(--color-accent); }
    .form-actions { display: flex; align-items: center; gap: var(--space-md); justify-content: flex-end; }
    .error-msg { color: var(--color-danger); font-size: 0.9rem; }
    .success-msg { color: var(--color-accent); font-size: 0.9rem; }
    
    .table-responsive { overflow-x: auto; }
    .sa-table { width: 100%; border-collapse: collapse; text-align: left; }
    .sa-table th { padding: 12px; border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
    .sa-table td { padding: 16px 12px; border-bottom: 1px solid var(--color-border); font-size: 0.95rem; }
    .sa-table tbody tr:hover { background: var(--color-bg-surface); }
    .badge { padding: 4px 10px; background: var(--color-bg-surface); border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; }
    .badge-primary { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
    .btn-icon { background: transparent; border: none; font-size: 1.1rem; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; }
    .btn-icon:hover { background: var(--color-bg-surface); }
    .btn-icon.delete:hover { background: rgba(239, 68, 68, 0.2); }
    .text-center { text-align: center; }
    .text-muted { color: var(--color-text-secondary); }
  `]
})
export class UsersComponent implements OnInit {
  showForm = false;
  loading = false;
  error = '';
  success = '';
  users: any[] = [];

  formData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    slug: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get(`${environment.apiUrl}/superadmin/users`, { headers }).subscribe((res: any) => {
      this.users = res.users;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.error = '';
    this.success = '';
  }

  createAdmin() {
    this.loading = true;
    this.error = '';
    this.success = '';

    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };

    this.http.post(`${environment.apiUrl}/superadmin/admins`, this.formData, { headers })
      .subscribe({
        next: () => {
          this.success = 'Admin and store created successfully!';
          this.loading = false;
          this.formData = { name: '', email: '', phone: '', password: '', businessName: '', slug: '' };
          this.fetchUsers();
          setTimeout(() => this.toggleForm(), 2000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create admin';
          this.loading = false;
        }
      });
  }
}
