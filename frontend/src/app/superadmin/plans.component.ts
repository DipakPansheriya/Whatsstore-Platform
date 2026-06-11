import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-superadmin-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sa-plans fade-in">
      <header class="dash-header">
        <div>
          <h1>Plans & Pricing</h1>
          <p class="subtitle">Manage subscription tiers and pricing options.</p>
        </div>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm ? 'Cancel' : '+ Create New Plan' }}
        </button>
      </header>

      <!-- Create/Edit Plan Form -->
      <div class="form-card glass-card" *ngIf="showForm">
        <h3>{{ isEditing ? 'Edit Plan' : 'Create New Plan' }}</h3>
        <form (ngSubmit)="savePlan()">
          <div class="form-grid">
            <div class="form-group">
              <label>Plan Name</label>
              <input type="text" [(ngModel)]="formData.name" name="name" required placeholder="Growth">
            </div>
            <div class="form-group">
              <label>Price (₹)</label>
              <input type="number" [(ngModel)]="formData.price" name="price" required>
            </div>
            <div class="form-group">
              <label>Billing Cycle</label>
              <select [(ngModel)]="formData.billingCycle" name="billingCycle" required>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="yearly">One-Time Trial</option>
              </select>
            </div>
            <div class="form-group">
              <label>Trial Days</label>
              <input type="number" [(ngModel)]="formData.trialDays" name="trialDays" required>
            </div>
          </div>
          
          <div class="form-group mb-lg">
            <label>Description</label>
            <input type="text" [(ngModel)]="formData.description" name="description" required placeholder="Short description for landing page">
          </div>
          
          <div class="form-group mb-lg">
            <label>Features (Comma separated)</label>
            <textarea [(ngModel)]="featuresText" name="featuresText" rows="3" required placeholder="Unlimited Products, Analytics, Custom Domain..."></textarea>
          </div>

          <div class="form-actions">
            <span class="error-msg" *ngIf="error">{{ error }}</span>
            <span class="success-msg" *ngIf="success">{{ success }}</span>
            <button type="submit" class="btn-primary" [disabled]="loading">
              {{ loading ? 'Saving...' : 'Save Plan' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Plans List -->
      <div class="plans-list glass-card">
        <h3>Available Plans</h3>
        <div class="table-responsive">
          <table class="sa-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Cycle</th>
                <th>Price</th>
                <th>Trial</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let plan of plans">
                <td><strong>{{ plan.name }}</strong></td>
                <td><span class="badge">{{ plan.billingCycle }}</span></td>
                <td>₹{{ plan.price }}</td>
                <td>{{ plan.trialDays }} days</td>
                <td>
                  <span class="badge" [class.badge-success]="plan.isActive" [class.badge-danger]="!plan.isActive">
                    {{ plan.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon" title="Edit" (click)="editPlan(plan)">✏️</button>
                  <button class="btn-icon delete" title="Delete" (click)="deletePlan(plan._id)">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="plans.length === 0">
                <td colspan="6" class="text-center text-muted">No plans created yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sa-plans { display: flex; flex-direction: column; gap: var(--space-xl); }
    .dash-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .dash-header h1 { font-size: 2rem; margin-bottom: var(--space-xs); background: linear-gradient(to right, #fff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .btn-primary { background: var(--color-accent); color: #000; border: none; padding: 10px 20px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3); }
    .btn-primary[disabled] { opacity: 0.7; cursor: not-allowed; }
    .form-card, .plans-list { padding: var(--space-xl); border-top: 1px solid rgba(139, 92, 246, 0.2); }
    .form-card h3, .plans-list h3 { margin-bottom: var(--space-lg); font-size: 1.25rem; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-md); }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.mb-lg { margin-bottom: var(--space-md); }
    .form-group label { font-size: 0.85rem; color: var(--color-text-secondary); }
    .form-group input, .form-group select, .form-group textarea { padding: 10px 14px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-sm); color: #fff; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--color-accent); }
    .form-group select { appearance: none; }
    .form-actions { display: flex; align-items: center; gap: var(--space-md); justify-content: flex-end; margin-top: var(--space-lg); }
    .error-msg { color: var(--color-danger); font-size: 0.9rem; }
    .success-msg { color: var(--color-accent); font-size: 0.9rem; }
    
    .table-responsive { overflow-x: auto; }
    .sa-table { width: 100%; border-collapse: collapse; text-align: left; }
    .sa-table th { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--color-text-secondary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
    .sa-table td { padding: 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.95rem; }
    .sa-table tbody tr:hover { background: rgba(255,255,255,0.02); }
    .badge { padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
    .badge-success { background: rgba(37, 211, 102, 0.15); color: var(--color-accent); border: 1px solid rgba(37, 211, 102, 0.3); }
    .badge-danger { background: rgba(239, 68, 68, 0.15); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.3); }
    .btn-icon { background: transparent; border: none; font-size: 1.1rem; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; }
    .btn-icon:hover { background: rgba(255,255,255,0.1); }
    .btn-icon.delete:hover { background: rgba(239, 68, 68, 0.2); }
    .text-center { text-align: center; }
    .text-muted { color: var(--color-text-secondary); }
  `]
})
export class PlansComponent implements OnInit {
  showForm = false;
  isEditing = false;
  loading = false;
  error = '';
  success = '';
  plans: any[] = [];

  featuresText = '';

  formData: any = {
    name: '',
    description: '',
    price: 499,
    billingCycle: 'monthly',
    trialDays: 10,
    isActive: true
  };
  editingPlanId: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchPlans();
  }

  fetchPlans() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get(`${environment.apiUrl}/plans/all`, { headers }).subscribe((res: any) => {
      this.plans = res.plans;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.isEditing = false;
    this.editingPlanId = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = { name: '', description: '', price: 499, billingCycle: 'monthly', trialDays: 10, isActive: true };
    this.featuresText = '';
    this.error = '';
    this.success = '';
  }

  editPlan(plan: any) {
    this.isEditing = true;
    this.showForm = true;
    this.editingPlanId = plan._id;
    this.formData = { ...plan };
    this.featuresText = (plan.features || []).join(', ');
  }

  savePlan() {
    this.loading = true;
    this.error = '';
    this.success = '';

    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    const payload = {
      ...this.formData,
      features: this.featuresText.split(',').map(f => f.trim()).filter(f => f)
    };

    if (this.isEditing && this.editingPlanId) {
      this.http.put(`${environment.apiUrl}/plans/${this.editingPlanId}`, payload, { headers })
        .subscribe({
          next: () => {
            this.success = 'Plan updated successfully!';
            this.loading = false;
            this.fetchPlans();
            setTimeout(() => this.toggleForm(), 2000);
          },
          error: (err) => {
            this.error = err.error?.message || 'Failed to update plan';
            this.loading = false;
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/plans`, payload, { headers })
        .subscribe({
          next: () => {
            this.success = 'Plan created successfully!';
            this.loading = false;
            this.fetchPlans();
            setTimeout(() => this.toggleForm(), 2000);
          },
          error: (err) => {
            this.error = err.error?.message || 'Failed to create plan';
            this.loading = false;
          }
        });
    }
  }

  deletePlan(id: string) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.delete(`${environment.apiUrl}/plans/${id}`, { headers })
      .subscribe({
        next: () => this.fetchPlans(),
        error: (err) => alert(err.error?.message || 'Failed to delete plan')
      });
  }
}
