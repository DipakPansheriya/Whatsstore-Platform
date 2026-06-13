import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CouponItem {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate?: string;
  expiryDate?: string;
  isActive: boolean;
  visibility?: 'PUBLIC' | 'PRIVATE';
  displayOnStore?: boolean;
}

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="coupons-scaffold animate-fade-in-up">
      <!-- Header -->
      <header class="page-header">
        <div>
          <span class="badge">Marketing & Discounts</span>
          <h1>Discount Coupons</h1>
          <p>Create and manage discount codes for your customers to apply in their cart before checkouts.</p>
        </div>
        
        <div class="header-actions">
          <button *ngIf="!showForm" (click)="openAddForm()" class="btn btn-primary">
            ✨ Create Coupon
          </button>
          <button *ngIf="showForm" (click)="closeForm()" class="btn btn-ghost">
            ⬅ Back to Coupons
          </button>
        </div>
      </header>

      <!-- Messages -->
      <div *ngIf="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
      <div *ngIf="errorMsg" class="alert alert-danger">❌ {{ errorMsg }}</div>

      <!-- Content -->
      <div class="content-wrapper">
        <div *ngIf="loading && !showForm" class="loading-state">
          <span class="spinner">⏳</span> Loading discount coupons...
        </div>

        <!-- Coupons List Grid -->
        <div *ngIf="!loading && !showForm" class="coupons-view">
          <div *ngIf="coupons.length === 0" class="empty-state glass-card">
            <div class="empty-icon">🎟️</div>
            <h3>No coupons found</h3>
            <p>Offer special discounts (percentage or fixed amount) to boost storefront conversions!</p>
            <button (click)="openAddForm()" class="btn btn-primary">Create Your First Coupon</button>
          </div>

          <div *ngIf="coupons.length > 0" class="coupons-grid">
            @for (coupon of coupons; track coupon._id) {
              <div class="coupon-card ticket-card" [class.inactive]="!coupon.isActive">
                <div class="ticket-tab">
                  <span class="discount-value">
                    {{ coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue }}
                  </span>
                  <span class="discount-label">OFF</span>
                </div>
                <div class="ticket-divider">
                  <div class="notch top-notch"></div>
                  <div class="notch bottom-notch"></div>
                </div>
                <div class="ticket-content">
                  <div class="ticket-header">
                    <span class="coupon-code">{{ coupon.code }}</span>
                    <div class="coupon-meta-badges">
                      <span class="status-badge" [class.active]="coupon.isActive">
                        {{ coupon.isActive ? 'Active' : 'Paused' }}
                      </span>
                      <span class="visibility-badge" [class.public]="coupon.visibility === 'PUBLIC'">
                        {{ coupon.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private' }}
                      </span>
                    </div>
                  </div>
                  <div class="ticket-body">
                    <p class="expiry-text" *ngIf="coupon.startDate">
                      🟢 Starts: {{ coupon.startDate | date:'dd/MM/yyyy' }}
                    </p>
                    <p class="expiry-text">
                      📅 Expiry: {{ coupon.expiryDate ? (coupon.expiryDate | date:'dd/MM/yyyy') : 'Never Expires' }}
                    </p>
                  </div>
                  <div class="ticket-footer">
                    <button (click)="openEditForm(coupon)" class="btn-action btn-edit">✏️ Edit</button>
                    <button (click)="onDelete(coupon._id)" class="btn-action btn-delete">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Add/Edit Form Panel -->
        <div *ngIf="showForm" class="form-container glass-card">
          <h2 class="form-title">{{ editingCoupon ? 'Edit Coupon' : 'Create Coupon' }}</h2>
          
          <form (ngSubmit)="onSubmit()" #couponForm="ngForm" class="coupon-form">
            <div class="form-row">
              <div class="form-group">
                <label for="c-code">Coupon Code *</label>
                <input id="c-code" type="text" name="code" [(ngModel)]="formCoupon.code" placeholder="e.g. WELCOME10" required>
              </div>

              <div class="form-group">
                <label for="c-type">Discount Type *</label>
                <select id="c-type" name="discountType" [(ngModel)]="formCoupon.discountType" required>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="c-val">Discount Value *</label>
                <input id="c-val" type="number" name="discountValue" [(ngModel)]="formCoupon.discountValue" placeholder="e.g. 10" min="0" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="c-start">Start Date (Optional)</label>
                <input id="c-start" type="date" name="startDate" [(ngModel)]="formCoupon.startDate">
              </div>

              <div class="form-group">
                <label for="c-exp">Expiry Date (Optional)</label>
                <input id="c-exp" type="date" name="expiryDate" [(ngModel)]="formCoupon.expiryDate">
              </div>
            </div>

            <!-- Settings Toggles -->
            <div class="toggles-row" style="display: flex; flex-direction: column; gap: var(--space-md);">
              <div class="toggle-control">
                <label class="switch">
                  <input type="checkbox" name="isActive" [(ngModel)]="formCoupon.isActive">
                  <span class="slider round"></span>
                </label>
                <div class="toggle-labels">
                  <span class="lbl-main">Status Active</span>
                  <span class="lbl-sub">Let customers apply this coupon immediately.</span>
                </div>
              </div>
              <div class="toggle-control">
                <label class="switch">
                  <input type="checkbox" name="displayOnStore" [(ngModel)]="formCoupon.displayOnStore">
                  <span class="slider round"></span>
                </label>
                <div class="toggle-labels">
                  <span class="lbl-main">Public Coupon (Visible on Store)</span>
                  <span class="lbl-sub">Show coupon code and discount details on your public storefront pages.</span>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" (click)="closeForm()" class="btn btn-ghost">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Saving Coupon...' : '💾 Save Coupon' }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .coupons-scaffold { max-width: 1000px; margin: 0 auto; padding: var(--space-md) 0; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
    .page-header h1 { font-size: 2.2rem; font-weight: 900; margin: var(--space-xs) 0; color: var(--color-text-primary); }
    .page-header p { color: var(--color-text-secondary); }
    .badge { padding: 4px 12px; background: rgba(255,255,255,0.05); border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: var(--color-accent); }
    
    .loading-state, .empty-state {
      text-align: center; padding: var(--space-3xl);
      h3 { font-size: 1.5rem; color: var(--color-text-primary); margin-bottom: 8px; }
      p { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
      .empty-icon { font-size: 4rem; }
    }

    .coupons-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-lg);
    }
    
    .coupon-card {
      display: flex;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: visible;
      
      &.inactive {
        opacity: 0.6;
        filter: grayscale(40%);
      }
      
      &:hover {
        border-color: var(--color-accent);
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(37, 211, 102, 0.15);
      }
    }
    
    .ticket-tab {
      width: 110px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(37, 211, 102, 0.02) 100%);
      border-top-left-radius: var(--radius-lg);
      border-bottom-left-radius: var(--radius-lg);
      padding: var(--space-md);
      box-sizing: border-box;
      
      .discount-value {
        font-size: 1.8rem;
        font-weight: 950;
        color: var(--color-accent);
        font-family: var(--font-heading);
        text-shadow: 0 0 10px rgba(37, 211, 102, 0.2);
        line-height: 1;
        text-align: center;
      }
      .discount-label {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--color-text-secondary);
        letter-spacing: 0.1em;
        margin-top: 4px;
        opacity: 0.8;
      }
    }
    
    .ticket-divider {
      position: relative;
      width: 2px;
      border-left: 2px dashed rgba(255,255,255,0.12);
      margin: 12px 0;
      
      .notch {
        position: absolute;
        width: 16px;
        height: 16px;
        background: var(--color-bg);
        border-radius: 50%;
        left: -9px;
        border: 1px solid var(--color-border);
        box-sizing: border-box;
        
        &.top-notch {
          top: -21px;
        }
        &.bottom-notch {
          bottom: -21px;
        }
      }
    }
    
    .ticket-content {
      flex: 1;
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-sizing: border-box;
    }
    
    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      
      .coupon-code {
        font-size: 1.15rem;
        font-weight: 900;
        color: var(--color-text-primary);
        letter-spacing: 0.05em;
        background: var(--color-bg-surface);
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
      }
    }
    
    .coupon-meta-badges {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    
    .status-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.15);
      white-space: nowrap;
      
      &.active {
        background: rgba(37, 211, 102, 0.1);
        color: #25d366;
        border: 1px solid rgba(37, 211, 102, 0.15);
      }
    }
    
    .visibility-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.08);
      white-space: nowrap;
      
      &.public {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.18);
      }
    }
    
    .ticket-body {
      .expiry-text {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        margin: 0;
      }
    }
    
    .ticket-footer {
      display: flex;
      gap: 8px;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: var(--space-md);
      margin-top: auto;
    }
    
    .btn-action {
      flex: 1; padding: 8px; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 700; cursor: pointer; text-align: center; border: 1px solid transparent; background: transparent;
      &.btn-edit { border-color: var(--color-border); color: var(--color-text-primary); &:hover { background: var(--color-bg-surface); } }
      &.btn-delete { color: #ef4444; &:hover { background: rgba(239, 68, 68, 0.1); } }
    }

    /* Form Panels */
    .form-container { padding: var(--space-2xl); background: var(--color-bg-card-glass); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
    .form-title { font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: var(--space-xl); }
    .coupon-form { display: flex; flex-direction: column; gap: var(--space-lg); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    .form-group {
      display: flex; flex-direction: column; gap: 6px;
      label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary); }
      input, select {
        padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); outline: none; font-size: 0.95rem;
        &:focus { border-color: var(--color-accent); }
      }
    }
    .toggles-row { margin: var(--space-md) 0; }
    .toggle-control { display: flex; align-items: center; gap: 12px; }
    
    /* Switch Slider */
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-border); transition: .3s; }
    .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .3s; }
    input:checked + .slider { background-color: #25d366; }
    input:checked + .slider:before { transform: translateX(20px); }
    .slider.round { border-radius: 34px; }
    .slider.round:before { border-radius: 50%; }

    .toggle-labels { display: flex; flex-direction: column; }
    .lbl-main { font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary); }
    .lbl-sub { font-size: 0.75rem; color: var(--color-text-secondary); }

    .form-actions { display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-xl); border-top: 1px solid var(--color-border); padding-top: var(--space-lg); }
    .btn { padding: 12px 24px; border-radius: var(--radius-md); font-weight: 700; font-size: 0.95rem; cursor: pointer; }
    .btn-primary { background: var(--color-accent); color: #000; border: none; &:hover { opacity: 0.9; } }
    .btn-ghost { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-primary); &:hover { background: var(--color-bg-surface); } }
    .alert { padding: 12px; border-radius: var(--radius-md); font-size: 0.9rem; margin-bottom: var(--space-md); }
    .alert-success { background: rgba(37,211,102,0.1); color: #25d366; border: 1px solid rgba(37,211,102,0.2); }
    .alert-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
  `]
})
export class CouponsComponent implements OnInit {
  loading = true;
  saving = false;
  showForm = false;
  editingCoupon: CouponItem | null = null;
  coupons: CouponItem[] = [];

  formCoupon: CouponItem = {
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    startDate: '',
    expiryDate: '',
    isActive: true,
    visibility: 'PRIVATE',
    displayOnStore: false
  };

  successMsg = '';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchCoupons();
  }

  fetchCoupons() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get<any>(`${environment.apiUrl}/coupons`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.coupons = res.coupons;
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to fetch coupons';
        this.loading = false;
      }
    });
  }

  openAddForm() {
    this.showForm = true;
    this.editingCoupon = null;
    this.formCoupon = {
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      startDate: '',
      expiryDate: '',
      isActive: true,
      visibility: 'PRIVATE',
      displayOnStore: false
    };
    this.errorMsg = '';
    this.successMsg = '';
  }

  openEditForm(coupon: CouponItem) {
    this.showForm = true;
    this.editingCoupon = coupon;
    let expDate = '';
    let stDate = '';
    if (coupon.expiryDate) {
      expDate = coupon.expiryDate.split('T')[0];
    }
    if (coupon.startDate) {
      stDate = coupon.startDate.split('T')[0];
    }
    this.formCoupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      startDate: stDate,
      expiryDate: expDate,
      isActive: coupon.isActive,
      visibility: coupon.visibility || 'PRIVATE',
      displayOnStore: coupon.displayOnStore || false
    };
    this.errorMsg = '';
    this.successMsg = '';
  }

  closeForm() {
    this.showForm = false;
    this.editingCoupon = null;
  }

  onSubmit() {
    if (!this.formCoupon.code || !this.formCoupon.discountType || this.formCoupon.discountValue === undefined) {
      this.errorMsg = 'Please complete all required fields.';
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    const payload = {
      code: this.formCoupon.code,
      discountType: this.formCoupon.discountType,
      discountValue: this.formCoupon.discountValue,
      startDate: this.formCoupon.startDate || undefined,
      expiryDate: this.formCoupon.expiryDate || undefined,
      isActive: this.formCoupon.isActive,
      visibility: this.formCoupon.displayOnStore ? 'PUBLIC' : 'PRIVATE',
      displayOnStore: this.formCoupon.displayOnStore
    };

    if (this.editingCoupon) {
      this.http.patch<any>(`${environment.apiUrl}/coupons/${this.editingCoupon._id}`, payload, { headers }).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMsg = 'Coupon updated successfully!';
            this.fetchCoupons();
            this.showForm = false;
          }
          this.saving = false;
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Failed to update coupon';
          this.saving = false;
        }
      });
    } else {
      this.http.post<any>(`${environment.apiUrl}/coupons`, payload, { headers }).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMsg = 'Coupon created successfully!';
            this.fetchCoupons();
            this.showForm = false;
          }
          this.saving = false;
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Failed to create coupon';
          this.saving = false;
        }
      });
    }
  }

  onDelete(id: string | undefined) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) return;

    this.errorMsg = '';
    this.successMsg = '';

    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.delete<any>(`${environment.apiUrl}/coupons/${id}`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Coupon deleted successfully!';
          this.fetchCoupons();
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to delete coupon';
      }
    });
  }
}
