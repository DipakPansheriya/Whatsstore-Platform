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
  status: 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  createdAt: string;
  couponCode?: string;
  discountAmount?: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="orders-scaffold animate-fade-in-up">
      <!-- Header -->
      <header class="page-header" *ngIf="!selectedOrder">
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
      <div class="content-wrapper" *ngIf="!loading && !selectedOrder">
        
        <!-- Status Tabs Filtering -->
        <div class="filters-header">
          <div class="filter-tabs">
            <button (click)="setFilter('all')" [class.active]="currentFilter === 'all'" class="tab-btn">All Orders</button>
            <button (click)="setFilter('NEW')" [class.active]="currentFilter === 'NEW'" class="tab-btn pending">New</button>
            <button (click)="setFilter('CONFIRMED')" [class.active]="currentFilter === 'CONFIRMED'" class="tab-btn confirmed">Confirmed</button>
            <button (click)="setFilter('PROCESSING')" [class.active]="currentFilter === 'PROCESSING'" class="tab-btn processing">Processing</button>
            <button (click)="setFilter('COMPLETED')" [class.active]="currentFilter === 'COMPLETED'" class="tab-btn delivered">Completed</button>
            <button (click)="setFilter('CANCELLED')" [class.active]="currentFilter === 'CANCELLED'" class="tab-btn cancelled">Cancelled</button>
          </div>
          <div class="view-toggle">
            <button (click)="viewMode = 'grid'" [class.active]="viewMode === 'grid'" class="toggle-btn" title="Grid View">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button (click)="viewMode = 'list'" [class.active]="viewMode === 'list'" class="toggle-btn" title="List View">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
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
          <div [class]="viewMode === 'grid' ? 'orders-grid' : 'orders-list-view'">
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
                  <button (click)="sendWhatsAppNotification(order)" class="btn btn-whatsapp btn-sm">🟢 Update Status</button>
                </div>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- Loading State -->
      <div *ngIf="loading && !selectedOrder" class="loading-state">
        <span class="spinner">⏳</span> Fetching customer orders...
      </div>

      <!-- Order Detail Page View -->
      <div class="order-detail-page animate-fade-in-up" *ngIf="selectedOrder">
        <header class="detail-page-header">
          <button (click)="closeDetailModal()" class="btn btn-ghost btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Orders
          </button>
          <div class="title-row">
            <h2>Order #{{ selectedOrder._id.slice(-6).toUpperCase() }}</h2>
            <span [className]="'status-badge ' + selectedOrder.status">{{ selectedOrder.status }}</span>
          </div>
        </header>

        <div class="detail-page-content">
          <div class="detail-card glass-card">
            <!-- Customer Segment -->
            <div class="detail-section">
              <h4>Customer Information</h4>
              <div class="details-grid">
                <div><span class="info-label">Name:</span> <span class="info-val">{{ selectedOrder.customerName }}</span></div>
                <div><span class="info-label">Phone:</span> <span class="info-val">{{ selectedOrder.customerPhone }}</span></div>
                <div><span class="info-label">WhatsApp:</span> <span class="info-val">{{ selectedOrder.customerWhatsapp }}</span></div>
                <div *ngIf="selectedOrder.notes"><span class="info-label">Notes:</span> <span class="info-val">{{ selectedOrder.notes }}</span></div>
              </div>
            </div>

            <!-- Items Purchased -->
            <div class="detail-section">
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

              <!-- Coupon & Discount breakdown -->
              <div class="discount-breakdown" *ngIf="selectedOrder.couponCode">
                <div class="breakdown-row">
                  <span>Coupon Applied:</span>
                  <span class="coupon-val">{{ selectedOrder.couponCode }}</span>
                </div>
                <div class="breakdown-row">
                  <span>Discount Applied:</span>
                  <span class="discount-val">-₹{{ selectedOrder.discountAmount }}</span>
                </div>
              </div>

              <div class="detail-total">
                <span>Total Amount:</span>
                <span class="total-price">₹{{ selectedOrder.totalAmount }}</span>
              </div>
            </div>

            <!-- Manage status & WhatsApp -->
            <div class="detail-section">
              <h4>Update Order Status</h4>
              <div class="status-updater">
                <select name="status" [(ngModel)]="selectedOrder.status" (change)="onStatusChange(selectedOrder)">
                  <option value="NEW">New (Reviewing)</option>
                  <option value="CONFIRMED">Confirmed (Approved)</option>
                  <option value="PROCESSING">Processing (Preparing)</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button (click)="sendWhatsAppNotification(selectedOrder)" class="btn btn-whatsapp">
                  🟢 Notify Customer
                </button>
              </div>
            </div>

            <!-- WhatsApp Message Preview -->
            <div class="detail-section">
              <h4>WhatsApp Summary Message</h4>
              <textarea readonly class="wa-preview" [value]="getWhatsAppSummaryText(selectedOrder)"></textarea>
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
      color: var(--color-text-primary);
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
      h3 { font-weight: 800; color: var(--color-text-primary); margin-bottom: var(--space-xs); }
      p { color: var(--color-text-secondary); }
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--space-md);
    }
    
    
    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xl);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-sm);
    }
    .filter-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      &::-webkit-scrollbar { height: 4px; }
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .view-toggle {
      display: flex;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 4px;
      margin-left: var(--space-md);
    }
    .toggle-btn {
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { color: var(--color-text-primary); }
      &.active {
        background: var(--color-bg-card);
        color: var(--color-accent);
      }
    }

    /* List View Specific Styles */
    .orders-list-view {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .orders-list-view .order-card {
      flex-direction: row;
      align-items: center;
      padding: var(--space-md) var(--space-lg);
      gap: var(--space-xl);
    }
    .orders-list-view .order-card-header {
      border-bottom: none;
      padding-bottom: 0;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      width: 150px;
      flex-shrink: 0;
    }
    .orders-list-view .order-card-body {
      flex-direction: row;
      flex: 1;
      justify-content: space-between;
      align-items: center;
    }
    .orders-list-view .info-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    .orders-list-view .order-card-actions {
      border-top: none;
      padding-top: 0;
      margin-top: 0;
      width: 300px;
      flex-shrink: 0;
    }

    @media (max-width: 1024px) {
      .filters-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-md);
      }
      .orders-list-view .order-card {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-md);
      }
      .orders-list-view .order-card-header {
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--color-border);
        padding-bottom: var(--space-sm);
      }
      .orders-list-view .order-card-body {
        flex-direction: column;
        gap: 8px;
      }
      .orders-list-view .info-row {
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
      }
      .orders-list-view .order-card-actions {
        width: 100%;
        margin-top: var(--space-md);
        border-top: 1px solid var(--color-border);
        padding-top: var(--space-md);
      }
    }



    /* Cards Grid */
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
        background: var(--color-bg-surface);
      }
      &.active {
        color: var(--color-text-primary);
        background: var(--color-bg-card);
        border-color: var(--color-border);
        &.pending { border-color: var(--color-warning); color: var(--color-warning); background: rgba(245, 158, 11, 0.05); }
        &.confirmed { border-color: var(--color-info); color: var(--color-info); background: rgba(6, 182, 212, 0.05); }
        &.processing { border-color: var(--color-accent); color: var(--color-accent); background: rgba(37, 211, 102, 0.05); }
        &.shipped { border-color: var(--color-info); color: var(--color-info); background: rgba(6, 182, 212, 0.05); }
        &.delivered { border-color: var(--color-accent); color: var(--color-accent); background: rgba(37, 211, 102, 0.05); }
        &.cancelled { border-color: var(--color-danger); color: var(--color-danger); background: rgba(239, 68, 68, 0.05); }
      }
    }
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
      border: 1px solid var(--color-border);
      background: var(--color-bg-card-glass);
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
      color: var(--color-text-primary);
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
      color: var(--color-text-primary);
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

    /* Order Detail Page View */
    .order-detail-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .detail-page-header {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: var(--color-text-secondary);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      padding: 8px 16px;
      border-radius: var(--radius-md);
      width: fit-content;
      transition: all var(--transition-fast);
      &:hover {
        color: var(--color-text-primary);
        border-color: var(--color-text-primary);
      }
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      h2 {
        font-size: 2rem;
        font-weight: 900;
        color: var(--color-text-primary);
        margin: 0;
      }
    }
    .detail-page-content {
      max-width: 800px;
    }
    .detail-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .detail-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      border-bottom: 1px dashed var(--color-border);
      padding-bottom: var(--space-xl);
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      h4 {
        font-size: 1rem;
        color: var(--color-accent);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 800;
      }
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-md);
      div {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .info-label {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        font-weight: 600;
      }
      .info-val {
        font-size: 1rem;
        color: var(--color-text-primary);
        font-weight: 500;
      }
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child {
        border-bottom: none;
      }
    }
    .item-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .item-title {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--color-text-primary);
    }
    .item-qty {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    .item-total {
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--color-text-primary);
    }
    .discount-breakdown {
      margin-top: var(--space-sm);
      padding: var(--space-md);
      background: var(--color-bg-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .breakdown-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .coupon-val { font-weight: 700; color: var(--color-accent); }
      .discount-val { font-weight: 700; color: var(--color-danger); }
    }
    .detail-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-md);
      font-weight: 800;
      font-size: 1.25rem;
      color: var(--color-text-primary);
      border-top: 2px dashed var(--color-border);
    }
    .total-price {
      color: var(--color-accent);
      font-size: 1.75rem;
      font-family: var(--font-heading);
    }
    .status-updater {
      display: flex;
      gap: var(--space-md);
      select {
        flex: 1;
        padding: 12px 16px;
        background: var(--color-bg-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        font-size: 1rem;
        font-weight: 600;
        outline: none;
        cursor: pointer;
        &:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.2);
        }
      }
      .btn-whatsapp {
        padding: 12px 24px;
        font-size: 1rem;
      }
      @media (max-width: 600px) {
        flex-direction: column;
      }
    }
    .wa-preview {
      width: 100%;
      min-height: 120px;
      padding: var(--space-md);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-size: 0.85rem;
      font-family: monospace;
      border-radius: var(--radius-md);
      resize: vertical;
      line-height: 1.5;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: OrderRecord[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  loading = true;
  currentFilter = 'all';
  selectedOrder: OrderRecord | null = null;
  
  successMsg = '';
  errorMsg = '';
  shopName = 'Our Shop';
  slug = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchOrders();
    this.fetchBusinessName();
  }

  fetchOrders() {
    this.api.get<{ success: boolean; orders: any[] }>('orders').subscribe({
      next: (res) => {
        if (res.success) {
          // Map database records from old lowercase to new uppercase
          this.orders = (res.orders || []).map((o: any) => {
            let status = o.status;
            if (status === 'pending') status = 'NEW';
            if (status === 'confirmed') status = 'CONFIRMED';
            if (status === 'processing') status = 'PROCESSING';
            if (status === 'shipped' || status === 'delivered') status = 'COMPLETED';
            if (status === 'cancelled') status = 'CANCELLED';
            return { ...o, status };
          });
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
          this.slug = res.business.websiteSlug;
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

  getWhatsAppSummaryText(order: OrderRecord | null): string {
    if (!order) return '';
    let productsText = '';
    order.items.forEach((item, idx) => {
      productsText += `${idx + 1}. ${item.name}\n   Qty: ${item.quantity}\n   Price: ₹${item.price}\n\n`;
    });
    
    let breakdownText = `Subtotal: ₹${order.totalAmount + (order.discountAmount || 0)}\n`;
    if (order.couponCode) {
      breakdownText += `Discount (Code: ${order.couponCode}): -₹${order.discountAmount}\n`;
    }
    breakdownText += `Total Amount: ₹${order.totalAmount}`;
    
    const trackingUrl = `https://whatsstore.web.app/store/${this.slug || 'store'}/track/${order._id}`;
    
    return `Products:\n\n${productsText}${breakdownText}\n\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\n\nTrack order: ${trackingUrl}`;
  }

  sendWhatsAppNotification(order: OrderRecord) {
    const trackingUrl = `https://whatsstore.web.app/store/${this.slug || 'store'}/track/${order._id}`;
    const text = `Hello *${order.customerName}*,\n\nYour order from *${this.shopName}* has been updated!\n\nOrder Status: *${order.status}*\n\nTrack your order in real-time here:\n${trackingUrl}\n\nThank you for shopping with us!`;
    const encoded = encodeURIComponent(text);
    
    const whatsappUrl = `https://wa.me/${order.customerPhone}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  }
}
