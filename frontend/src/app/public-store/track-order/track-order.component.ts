import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { CommonModule } from '@angular/common';

interface OrderItem {
  product: {
    _id: string;
    title: string;
    images?: string[];
  };
  name: string;
  price: number;
  quantity: number;
}

interface OrderRecord {
  _id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'NEW' | 'PROCESSING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  createdAt: string;
}

@Component({
  selector: 'app-storefront-track-order',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="tracking-wrapper">
      <div class="container">
        
        <header class="tracking-header">
          <a [routerLink]="['/store', slug]" class="btn-back">⬅ Return to Storefront</a>
          <h1>📦 Track Your WhatsApp Order</h1>
          <p>Real-time updates directly from the merchant.</p>
        </header>

        <div *ngIf="loading" class="loading-state">
          <span class="spinner">⏳</span> Fetching order tracking data...
        </div>

        <div *ngIf="!loading && notFound" class="empty-state card">
          <div class="empty-icon">⚠️</div>
          <h3>Order Not Found</h3>
          <p>We could not find an order with the ID: <strong>{{ orderId }}</strong>. Please check your tracking link.</p>
          <a [routerLink]="['/store', slug]" class="btn btn-primary">Go to Storefront</a>
        </div>

        <div *ngIf="!loading && order" class="tracking-content animate-fade-in">
          
          <!-- Tracking Timeline Card -->
          <div class="status-card card text-center">
            <span class="order-ref">Order Reference: #{{ order._id.slice(-6).toUpperCase() }}</span>
            <h2 class="status-title">Current Status: <span [className]="'status-val ' + order.status">{{ order.status }}</span></h2>
            <p class="order-date">Placed on: {{ order.createdAt | date:'medium' }}</p>

            <!-- Progress bar timeline steps -->
            <div class="timeline-stepper" *ngIf="order.status !== 'CANCELLED'">
              <div class="step" [class.active]="isStepActive('NEW')">
                <div class="step-dot">🛍️</div>
                <div class="step-label">Order Placed</div>
              </div>
              <div class="step-connector" [class.filled]="isStepActive('CONFIRMED')"></div>
              <div class="step" [class.active]="isStepActive('CONFIRMED')">
                <div class="step-dot">✓</div>
                <div class="step-label">Confirmed</div>
              </div>
              <div class="step-connector" [class.filled]="isStepActive('PROCESSING')"></div>
              <div class="step" [class.active]="isStepActive('PROCESSING')">
                <div class="step-dot">⚙️</div>
                <div class="step-label">Processing</div>
              </div>
              <div class="step-connector" [class.filled]="isStepActive('COMPLETED')"></div>
              <div class="step" [class.active]="isStepActive('COMPLETED')">
                <div class="step-dot">🎉</div>
                <div class="step-label">Completed</div>
              </div>
            </div>

            <!-- Cancelled notification -->
            <div class="cancelled-banner" *ngIf="order.status === 'CANCELLED'">
              🛑 This order has been cancelled by the merchant. Please contact the store owner for details.
            </div>
          </div>

          <!-- Order details grid -->
          <div class="details-grid">
            
            <!-- Items summary card -->
            <div class="items-card card">
              <h3>Order Summary</h3>
              <div class="items-list">
                @for (item of order.items; track item.product._id) {
                  <div class="item-row">
                    <div class="item-details">
                      <img [src]="item.product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&auto=format&fit=crop'" alt="Item image" class="item-img">
                      <div>
                        <span class="item-name">{{ item.name }}</span>
                        <span class="item-qty-price">Qty: {{ item.quantity }} × ₹{{ item.price }}</span>
                      </div>
                    </div>
                    <span class="item-subtotal">₹{{ item.quantity * item.price }}</span>
                  </div>
                }
              </div>
              <div class="total-row">
                <span>Total Amount paid/due:</span>
                <span class="price-val">₹{{ order.totalAmount }}</span>
              </div>
            </div>

            <!-- Info card -->
            <div class="customer-card card">
              <h3>Customer & Shipping Details</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="lbl">Customer Name:</span>
                  <span class="val">{{ order.customerName }}</span>
                </div>
                <div class="info-item">
                  <span class="lbl">WhatsApp Phone:</span>
                  <span class="val">{{ order.customerPhone }}</span>
                </div>
                <div class="info-item" *ngIf="order.notes">
                  <span class="lbl">Special Instructions:</span>
                  <span class="val notes">"{{ order.notes }}"</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .tracking-wrapper {
      min-height: 100vh;
      background: #08090c;
      color: #e2e8f0;
      padding: var(--space-2xl) 0;
    }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 var(--space-lg); }
    
    .tracking-header {
      margin-bottom: var(--space-2xl);
      .btn-back {
        color: var(--color-text-secondary);
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 600;
        display: inline-block;
        margin-bottom: var(--space-md);
        &:hover { color: #25d366; }
      }
      h1 { font-size: 2.2rem; font-weight: 800; color: #fff; }
      p { color: var(--color-text-secondary); }
    }

    .loading-state, .empty-state {
      text-align: center; padding: var(--space-3xl);
      h3 { font-size: 1.5rem; color: #fff; }
      p { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
      .empty-icon { font-size: 4rem; margin-bottom: var(--space-md); }
    }

    .status-card {
      padding: var(--space-2xl);
      background: rgba(17, 19, 25, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-xl);
      display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
    }
    
    .order-ref { font-size: 0.85rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
    .status-title { font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0; }
    
    .status-val {
      padding: 4px 14px; border-radius: var(--radius-pill); font-size: 1.2rem; font-weight: 900;
      &.NEW { color: #3b82f6; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); }
      &.CONFIRMED { color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); }
      &.PROCESSING { color: #f59e0b; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); }
      &.COMPLETED { color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); }
      &.CANCELLED { color: #ef4444; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); }
    }
    
    .order-date { color: var(--color-text-secondary); font-size: 0.95rem; }

    /* Timeline Stepper */
    .timeline-stepper {
      display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 600px; margin-top: var(--space-lg);
    }
    .step {
      display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; z-index: 2;
      .step-dot {
        width: 48px; height: 48px; border-radius: 50%; background: #111317; border: 2px solid rgba(255,255,255,0.1);
        display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--color-text-muted);
        transition: all 0.3s;
      }
      .step-label { font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary); }
      &.active {
        .step-dot { border-color: #25d366; background: #25d366; color: #000; box-shadow: 0 0 15px rgba(37, 211, 102, 0.45); }
        .step-label { color: #fff; }
      }
    }
    .step-connector {
      flex: 1; height: 3px; background: rgba(255,255,255,0.08); margin: 0 -15px; position: relative; top: -14px; z-index: 1;
      &.filled { background: #25d366; box-shadow: 0 0 8px rgba(37, 211, 102, 0.3); }
    }

    .cancelled-banner {
      width: 100%; max-width: 600px; padding: var(--space-md); border-radius: var(--radius-md); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-weight: 700;
    }

    .details-grid {
      display: grid; grid-template-columns: 1.2fr 1fr; gap: var(--space-xl);
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .items-card, .customer-card {
      background: rgba(17, 19, 25, 0.45); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: var(--radius-lg); padding: var(--space-xl);
      h3 { font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: var(--space-md); border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; }
    }
    
    .items-list { display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-lg); }
    .item-row { display: flex; justify-content: space-between; align-items: center; }
    .item-details {
      display: flex; align-items: center; gap: 12px;
      .item-img { width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid rgba(255,255,255,0.05); }
      .item-name { display: block; font-weight: 700; color: #fff; font-size: 0.95rem; }
      .item-qty-price { font-size: 0.8rem; color: var(--color-text-secondary); }
    }
    .item-subtotal { font-weight: 800; color: #fff; }
    .total-row {
      display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: var(--space-md); font-weight: 800;
      .price-val { font-size: 1.4rem; color: #25d366; font-family: var(--font-heading); }
    }

    .info-list { display: flex; flex-direction: column; gap: var(--space-md); }
    .info-item {
      display: flex; flex-direction: column; gap: 4px;
      .lbl { font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; }
      .val { font-weight: 700; color: #fff; font-size: 1rem; }
      .notes { font-style: italic; color: #cbd5e1; }
    }
  `]
})
export class TrackOrderComponent implements OnInit {
  slug = '';
  orderId = '';
  loading = true;
  notFound = false;
  order: OrderRecord | null = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      this.orderId = params.get('orderId') || '';
      if (this.orderId) {
        this.fetchOrderTracking();
      } else {
        this.loading = false;
        this.notFound = true;
      }
    });
  }

  fetchOrderTracking() {
    this.api.get<{ success: boolean; order: OrderRecord }>(`orders/public/${this.orderId}`).subscribe({
      next: (res) => {
        if (res.success && res.order) {
          this.order = res.order;
        } else {
          this.notFound = true;
        }
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  isStepActive(step: string): boolean {
    if (!this.order) return false;
    const statusMap = {
      'NEW': 1,
      'CONFIRMED': 2,
      'PROCESSING': 3,
      'COMPLETED': 4,
      'CANCELLED': 0
    };
    
    const currentWeight = statusMap[this.order.status] || 0;
    const stepWeight = statusMap[step as keyof typeof statusMap] || 0;
    
    return currentWeight >= stepWeight;
  }
}
