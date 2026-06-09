import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface OrderItem {
  product: {
    _id: string;
    title: string;
    price: number;
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
  customerWhatsapp: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes: string;
  createdAt: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="orders-scaffold animate-fade-in-up">
      <!-- Header -->
      <header class="page-header">
        <div>
          <span class="badge">Sales Tracking</span>
          <h1>Customer Orders</h1>
          <p>Manage store orders placed by customers and update them instantly on WhatsApp.</p>
        </div>
      </header>

      <!-- Message notifications -->
      <div *ngIf="errorMsg" class="alert alert-danger">❌ {{ errorMsg }}</div>
      <div *ngIf="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>

      <!-- Main Layout -->
      <div class="content-wrapper" *ngIf="!loading">
        
        <!-- Status Tabs Filtering -->
        <div class="filter-tabs">
          <button (click)="setFilter('all')" [class.active]="currentFilter === 'all'" class="tab-btn">All Orders</button>
          <button (click)="setFilter('pending')" [class.active]="currentFilter === 'pending'" class="tab-btn pending">Pending</button>
          <button (click)="setFilter('confirmed')" [class.active]="currentFilter === 'confirmed'" class="tab-btn confirmed">Confirmed</button>
          <button (click)="setFilter('processing')" [class.active]="currentFilter === 'processing'" class="tab-btn processing">Processing</button>
          <button (click)="setFilter('shipped')" [class.active]="currentFilter === 'shipped'" class="tab-btn shipped">Shipped</button>
          <button (click)="setFilter('delivered')" [class.active]="currentFilter === 'delivered'" class="tab-btn delivered">Delivered</button>
          <button (click)="setFilter('cancelled')" [class.active]="currentFilter === 'cancelled'" class="tab-btn cancelled">Cancelled</button>
        </div>

        <!-- Orders View -->
        <!-- Empty State -->
        <div *ngIf="getFilteredOrders().length === 0" class="empty-state card">
          <div class="empty-icon">🛒</div>
          <h3>No orders found</h3>
          <p>No orders found matching the status: <strong>{{ currentFilter }}</strong>.</p>
        </div>

        <!-- Orders Table Grid -->
        <div *ngIf="getFilteredOrders().length > 0" class="orders-list">
          <div class="orders-grid">
            @for (order of getFilteredOrders(); track order._id) {
              <div class="order-card card">
                <div class="order-card-header">
                  <div>
                    <span class="order-id">#{{ order._id.slice(-6).toUpperCase() }}</span>
                    <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <span [className]="'status-badge ' + order.status">{{ order.status }}</span>
                </div>
                
                <div class="order-card-body">
                  <div class="info-row">
                    <span class="info-label">Customer:</span>
                    <span class="info-val">{{ order.customerName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Contact:</span>
                    <span class="info-val">{{ order.customerPhone }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Items Count:</span>
                    <span class="info-val">{{ getItemsCount(order) }} items</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Total Amount:</span>
                    <span class="info-val total">₹{{ order.totalAmount }}</span>
                  </div>
                </div>

                <div class="order-card-actions">
                  <button (click)="openDetailModal(order)" class="btn btn-ghost btn-sm">👁️ View Details</button>
                  <button (click)="sendWhatsAppNotification(order)" class="btn btn-whatsapp btn-sm">🟢 Update WhatsApp</button>
                </div>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <span class="spinner">⏳</span> Fetching customer orders...
      </div>

      <!-- Order Detail Dialog Modal Overlay -->
      <div class="modal-overlay" *ngIf="selectedOrder">
        <div class="modal-card card">
          <header class="modal-header">
            <h3>Order Details #{{ selectedOrder._id.slice(-6).toUpperCase() }}</h3>
            <button (click)="closeDetailModal()" class="btn-close">×</button>
          </header>

          <div class="modal-scrollable">
            <!-- Customer Segment -->
            <div class="modal-section">
              <h4>Customer Information</h4>
              <div class="details-grid">
                <div><strong>Name:</strong> {{ selectedOrder.customerName }}</div>
                <div><strong>Phone:</strong> {{ selectedOrder.customerPhone }}</div>
                <div><strong>WhatsApp:</strong> {{ selectedOrder.customerWhatsapp }}</div>
                <div *ngIf="selectedOrder.notes"><strong>Notes:</strong> {{ selectedOrder.notes }}</div>
              </div>
            </div>

            <!-- Items Purchased -->
            <div class="modal-section">
              <h4>Purchased Products</h4>
              <div class="items-list">
                @for (item of selectedOrder.items; track item.product?._id) {
                  <div class="item-row">
                    <div class="item-info">
                      <span class="item-title">{{ item.name }}</span>
                      <span class="item-qty">Qty: {{ item.quantity }} × ₹{{ item.price }}</span>
                    </div>
                    <span class="item-total">₹{{ item.quantity * item.price }}</span>
                  </div>
                }
              </div>
              <div class="modal-total">
                <span>Total Amount:</span>
                <span class="total-price">₹{{ selectedOrder.totalAmount }}</span>
              </div>
            </div>

            <!-- Manage status -->
            <div class="modal-section">
              <h4>Update Order Status</h4>
              <div class="status-updater">
                <select name="status" [(ngModel)]="selectedOrder.status" (change)="onStatusChange(selectedOrder)">
                  <option value="pending">Pending (Reviewing)</option>
                  <option value="confirmed">Confirmed (Approved)</option>
                  <option value="processing">Processing (Preparing)</option>
                  <option value="shipped">Shipped (En route)</option>
                  <option value="delivered">Delivered (Completed)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button (click)="sendWhatsAppNotification(selectedOrder)" class="btn btn-whatsapp">
                  🟢 Notify via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .orders-scaffold {
      max-width: 1100px;
      margin: 0 auto;
      padding: var(--space-md) 0;
    }
    .page-header {
      margin-bottom: var(--space-xl);
    }
    .page-header h1 {
      margin: var(--space-xs) 0;
      font-size: 2.2rem;
      font-weight: 900;
      color: #fff;
    }
    .page-header p {
      color: var(--color-text-secondary);
    }
    .alert {
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-md);
      font-size: 0.875rem;
    }
    .alert-success {
      background: rgba(37, 211, 102, 0.1);
      color: var(--color-accent);
      border: 1px solid rgba(37, 211, 102, 0.2);
    }
    .alert-danger {
      background: rgba(255, 77, 109, 0.1);
      color: var(--color-danger);
      border: 1px solid rgba(255, 77, 109, 0.2);
    }
    .loading-state {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--color-text-secondary);
    }
    .empty-state {
      text-align: center;
      padding: var(--space-3xl);
      h3 { font-weight: 800; color: #fff; margin-bottom: var(--space-xs); }
      p { color: var(--color-text-secondary); }
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--space-md);
    }
    
    /* Filtering navigation */
    .filter-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: var(--space-sm);
      margin-bottom: var(--space-xl);
      border-bottom: 1px solid var(--color-border);
      &::-webkit-scrollbar { height: 4px; }
    }
    .tab-btn {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--color-text-secondary);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 700;
      font-size: 0.875rem;
      transition: all var(--transition-fast);
      white-space: nowrap;
      &:hover {
        color: var(--color-text-primary);
        background: rgba(255,255,255,0.03);
      }
      &.active {
        color: #fff;
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.08);
        &.pending { border-color: var(--color-warning); color: var(--color-warning); background: rgba(245, 158, 11, 0.05); }
        &.confirmed { border-color: var(--color-info); color: var(--color-info); background: rgba(6, 182, 212, 0.05); }
        &.processing { border-color: var(--color-accent); color: var(--color-accent); background: rgba(37, 211, 102, 0.05); }
        &.shipped { border-color: var(--color-info); color: var(--color-info); background: rgba(6, 182, 212, 0.05); }
        &.delivered { border-color: var(--color-accent); color: var(--color-accent); background: rgba(37, 211, 102, 0.05); }
        &.cancelled { border-color: var(--color-danger); color: var(--color-danger); background: rgba(239, 68, 68, 0.05); }
      }
    }

    /* Cards Grid */
    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-lg);
    }
    .order-card {
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      border: 1px solid rgba(255,255,255,0.05);
      background: rgba(17, 19, 25, 0.45);
      &:hover {
        border-color: var(--color-border-hover);
      }
    }
    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-sm);
    }
    .order-id {
      font-weight: 800;
      font-family: var(--font-heading);
      font-size: 1.1rem;
      display: block;
      color: #fff;
    }
    .order-date {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    
    /* Status Labels */
    .status-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      letter-spacing: 0.05em;
      border: 1px solid transparent;
      &.pending { background: rgba(245, 158, 11, 0.1); color: var(--color-warning); border-color: rgba(245, 158, 11, 0.15); }
      &.confirmed { background: rgba(6, 182, 212, 0.1); color: var(--color-info); border-color: rgba(6, 182, 212, 0.15); }
      &.processing { background: rgba(37, 211, 102, 0.1); color: var(--color-accent); border-color: rgba(37, 211, 102, 0.15); }
      &.shipped { background: rgba(6, 182, 212, 0.1); color: var(--color-info); border-color: rgba(6, 182, 212, 0.15); }
      &.delivered { background: rgba(37, 211, 102, 0.15); color: var(--color-accent); border-color: rgba(37, 211, 102, 0.2); }
      &.cancelled { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border-color: rgba(239, 68, 68, 0.15); }
    }
    
    .order-card-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }
    .info-label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .info-val {
      font-weight: 600;
      color: #fff;
      &.total {
        color: var(--color-accent);
        font-weight: 800;
        font-size: 1.1rem;
        font-family: var(--font-heading);
      }
    }
    
    .order-card-actions {
      display: flex;
      gap: var(--space-sm);
      margin-top: auto;
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-md);
      .btn {
        flex: 1;
        justify-content: center;
      }
    }
    
    .btn-sm {
      padding: 8px 12px;
      font-size: 0.8rem;
    }
    .btn-whatsapp {
      background: #25d366;
      color: #000;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all var(--transition-normal);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.15);
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(37, 211, 102, 0.25);
        opacity: 1;
      }
    }

    /* Modal dialog popups */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-md);
    }
    .modal-card {
      width: 100%;
      max-width: 550px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      background: rgba(17, 19, 25, 0.9);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }
    .modal-header {
      height: 60px;
      padding: 0 var(--space-lg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      h3 {
        font-size: 1.25rem;
        font-weight: 800;
        color: #fff;
      }
    }
    .btn-close {
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      font-size: 1.75rem;
      cursor: pointer;
      line-height: 1;
      transition: color var(--transition-fast);
      &:hover {
        color: #fff;
      }
    }
    .modal-scrollable {
      padding: var(--space-lg);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }
    .modal-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-md);
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      h4 {
        font-size: 0.85rem;
        color: var(--color-accent);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 800;
      }
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      strong { color: #fff; }
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-xs) 0;
      border-bottom: 1px solid rgba(255,255,255,0.02);
    }
    .item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .item-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #fff;
    }
    .item-qty {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .item-total {
      font-weight: 700;
      font-size: 0.95rem;
      color: #fff;
    }
    .modal-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-md);
      font-weight: 800;
      font-size: 1.1rem;
      color: #fff;
    }
    .total-price {
      color: var(--color-accent);
      font-size: 1.35rem;
      font-family: var(--font-heading);
    }
    .status-updater {
      display: flex;
      gap: var(--space-sm);
      select {
        flex: 1;
        padding: 11px;
        background: rgba(8, 9, 13, 0.4);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        font-size: 0.9rem;
        font-weight: 600;
        outline: none;
        &:focus {
          border-color: var(--color-accent);
        }
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: OrderRecord[] = [];
  loading = true;
  currentFilter = 'all';
  selectedOrder: OrderRecord | null = null;
  
  successMsg = '';
  errorMsg = '';
  shopName = 'Our Shop';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchOrders();
    this.fetchBusinessName();
  }

  fetchOrders() {
    this.api.get<{ success: boolean; orders: OrderRecord[] }>('orders').subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = res.orders;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load order history.';
        this.loading = false;
      }
    });
  }

  fetchBusinessName() {
    this.api.get<any>('business/me').subscribe({
      next: (res) => {
        if (res.success && res.business) {
          this.shopName = res.business.name;
        }
      }
    });
  }

  setFilter(status: string) {
    this.currentFilter = status;
  }

  getFilteredOrders(): OrderRecord[] {
    if (this.currentFilter === 'all') return this.orders;
    return this.orders.filter(o => o.status === this.currentFilter);
  }

  getItemsCount(order: OrderRecord): number {
    return order.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }

  openDetailModal(order: OrderRecord) {
    // Deep clone to avoid mutating local list before save
    this.selectedOrder = JSON.parse(JSON.stringify(order));
  }

  closeDetailModal() {
    this.selectedOrder = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  onStatusChange(order: OrderRecord) {
    this.api.patch<{ success: boolean }>(`orders/${order._id}/status`, { status: order.status }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = `Order status updated to ${order.status}!`;
          this.fetchOrders();
          setTimeout(() => this.successMsg = '', 3000);
        }
      },
      error: () => {
        this.errorMsg = 'Failed to update order status.';
      }
    });
  }

  sendWhatsAppNotification(order: OrderRecord) {
    // Generate text message template
    const itemsText = order.items.map(i => `- ${i.name} (Qty: ${i.quantity})`).join('\n');
    const text = `Hello *${order.customerName}*,\n\nYour order from *${this.shopName}* has been updated!\n\nOrder Status: *${order.status.toUpperCase()}*\n\nItems:\n${itemsText}\n\nTotal amount: ₹${order.totalAmount}\n\nThank you for shopping with us!`;
    const encoded = encodeURIComponent(text);
    
    // Construct WhatsApp link
    const whatsappUrl = `https://wa.me/${order.customerWhatsapp}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  }
}
