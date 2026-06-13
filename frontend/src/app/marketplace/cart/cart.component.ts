import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MarketplaceService, MarketplaceCartItem } from '../../shared/services/marketplace.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

interface GroupedCart {
  businessId: string;
  businessName: string;
  businessSlug: string;
  whatsappNumber: string;
  items: MarketplaceCartItem[];
  total: number;
}

@Component({
  selector: 'app-marketplace-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="marketplace-wrapper animate-fade-in-up">
      <!-- Premium Glass Header -->
      <header class="marketplace-header glass-header">
        <div class="header-container">
          <a routerLink="/marketplace" class="brand-title">
            <span class="logo-emoji">⚡</span> WhatsStore <span class="badge">Marketplace</span>
          </a>
          
          <div class="header-nav">
            <a routerLink="/marketplace/wishlist" class="nav-link-btn">
              ❤️ Wishlist <span class="nav-badge" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
            </a>
            <a routerLink="/marketplace" class="nav-link-btn">Marketplace Home</a>
          </div>
        </div>
      </header>

      <div class="container page-content">
        <div class="breadcrumb">
          <a routerLink="/marketplace">⬅ Return to Marketplace</a>
        </div>

        <h2 class="section-title">🛒 Your Marketplace Shopping Cart</h2>

        <div *ngIf="cartItems.length === 0" class="empty-state card">
          <div class="empty-icon">🛒</div>
          <h3>Your shopping cart is empty</h3>
          <p>Add products from local merchants and complete your checkout via WhatsApp.</p>
          <a routerLink="/marketplace" class="btn btn-primary btn-sm" style="margin-top: 10px;">Shop Marketplace</a>
        </div>

        <div class="cart-layout" *ngIf="cartItems.length > 0">
          <!-- Left Column: Stores Split Grids -->
          <div class="cart-left">
            <div *ngFor="let group of groupedGroups; trackBy: trackGroup" class="store-group-card card">
              <div class="group-header">
                <div class="store-meta">
                  <span class="store-badge">🏪 Merchant</span>
                  <h3>{{ group.businessName }}</h3>
                </div>
                <a [routerLink]="['/store', group.businessSlug]" class="visit-link">Visit Store ➔</a>
              </div>

              <!-- Group Items List -->
              <div class="group-items-list">
                <div *ngFor="let item of group.items" class="cart-item">
                  <img class="item-img" [src]="item.product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop'" alt="Product">
                  <div class="item-details">
                    <span class="item-cat">{{ item.product.category }}</span>
                    <h4 class="item-title">{{ item.product.title }}</h4>
                    <span class="item-unit-price">₹{{ item.product.price }} each</span>
                  </div>
                  
                  <div class="item-right">
                    <span class="item-subtotal">₹{{ item.product.price * item.quantity }}</span>
                    <div class="qty-control">
                      <button class="qty-btn" (click)="updateQty(item.product._id, item.quantity - 1)">-</button>
                      <span class="qty-val">{{ item.quantity }}</span>
                      <button class="qty-btn" (click)="updateQty(item.product._id, item.quantity + 1)">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Coupon section for this store -->
              <div class="store-coupon-section">
                <div class="coupon-input-row">
                  <input type="text" [(ngModel)]="couponCodes[group.businessId]" placeholder="Enter Store Coupon..." class="coupon-input" [disabled]="appliedCoupons[group.businessId]">
                  <button *ngIf="!appliedCoupons[group.businessId]" (click)="applyCoupon(group)" class="btn btn-sm btn-apply-coupon">Apply</button>
                  <button *ngIf="appliedCoupons[group.businessId]" (click)="removeCoupon(group)" class="btn btn-sm btn-remove-coupon">Remove</button>
                </div>
                <div *ngIf="couponErrors[group.businessId]" class="coupon-error">
                  {{ couponErrors[group.businessId] }}
                </div>
                <div *ngIf="appliedCoupons[group.businessId]" class="coupon-success">
                  🎉 Coupon applied: <strong>{{ appliedCoupons[group.businessId].code }}</strong>
                </div>
              </div>

              <!-- Split Group Checkout Footer (Removed individual button for combined checkout) -->
              <div class="group-footer">
                <div class="group-total-details">
                  <span>Subtotal: <strong>₹{{ group.total }}</strong></span>
                  <span *ngIf="discountAmounts[group.businessId] > 0" class="coupon-discount">Discount: <strong>-₹{{ discountAmounts[group.businessId] }}</strong></span>
                  <span class="final-total">Store Total: <strong>₹{{ group.total - (discountAmounts[group.businessId] || 0) }}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Checkout Info Fields -->
          <div class="cart-right">
            <div class="checkout-form-card glass-card">
              <h3>Customer Details</h3>
              <p class="form-desc">Provide your contact details. These are shared with store owners upon checkout.</p>
              
              <div class="form-group">
                <label for="chk-name">Your Full Name *</label>
                <input id="chk-name" type="text" [(ngModel)]="checkoutName" placeholder="e.g. Jane Doe" required>
              </div>
              
              <div class="form-group">
                <label for="chk-phone">Contact Phone / WhatsApp *</label>
                <input id="chk-phone" type="tel" [(ngModel)]="checkoutPhone" placeholder="e.g. +91 99999 99999" required>
              </div>
              
              <div class="form-group">
                <label for="chk-notes">Delivery / Special Instructions</label>
                <textarea id="chk-notes" [(ngModel)]="checkoutNotes" placeholder="Delivery addresses, custom dimensions, etc."></textarea>
              </div>

              <div class="cart-grand-summary">
                <div class="summary-row">
                  <span>Total Items:</span>
                  <span>{{ totalCount }} items</span>
                </div>
                <div class="summary-row total">
                  <span>Grand Total:</span>
                  <span>₹{{ grandTotal }}</span>
                </div>
              </div>

              <div *ngIf="checkoutError" class="alert alert-danger">
                ❌ {{ checkoutError }}
              </div>

              <button (click)="checkoutAll()" class="btn btn-primary w-full" style="margin-top: 15px; font-size: 1.1rem; padding: 14px;" [disabled]="isSubmittingAll || cartItems.length === 0">
                {{ isSubmittingAll ? 'Placing Orders...' : '🛒 Place Combined Order' }}
              </button>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .marketplace-wrapper {
      min-height: 100vh;
      background: radial-gradient(circle at top right, rgba(37, 211, 102, 0.06) 0%, rgba(139, 92, 246, 0.02) 40%, var(--color-bg) 100%);
      color: var(--color-text-primary);
      padding-top: 85px;
    }
    .glass-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 70px;
      z-index: 100;
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      border-bottom: 1px solid var(--color-border);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-lg);
    }
    .brand-title {
      font-size: 1.4rem;
      font-weight: 950;
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: -0.02em;
      
      .badge {
        font-size: 0.72rem;
        background: linear-gradient(135deg, var(--color-accent) 0%, #1ebd5d 100%);
        color: #000;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 800;
        text-transform: uppercase;
      }
    }
    .header-nav {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .nav-link-btn {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      padding: 8px 16px;
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.25s ease;
      
      &:hover { color: var(--color-text-primary); background: var(--color-bg-surface); }
    }
    .nav-badge, .cart-badge {
      font-size: 0.75rem;
      font-weight: 850;
      padding: 2px 7px;
      border-radius: var(--radius-pill);
    }
    .nav-badge { background: var(--color-danger); color: #fff; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
    .cart-badge { background: var(--color-accent); color: #000; box-shadow: 0 0 10px rgba(37, 211, 102, 0.25); }
 
    .page-content {
      padding-bottom: var(--space-3xl);
    }
    .breadcrumb {
      margin: var(--space-md) 0 var(--space-lg);
      a { color: var(--color-text-secondary); font-weight: 600; text-decoration: none; transition: color 0.2s; &:hover { color: var(--color-accent); } }
    }
    .section-title { font-size: 1.6rem; font-weight: 950; color: var(--color-text-primary); margin-bottom: var(--space-xl); letter-spacing: -0.02em; }
 
    .empty-state {
      text-align: center; padding: var(--space-3xl) 0;
      background: rgba(255, 255, 255, 0.01);
      border: 1px dashed rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-lg);
      .empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
      h3 { font-weight: 850; color: var(--color-text-primary); margin-bottom: var(--space-sm); }
      p { color: var(--color-text-secondary); }
    }
 
    /* Layout split */
    .cart-layout {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: var(--space-xl);
      align-items: start;
      @media (max-width: 900px) { grid-template-columns: 1fr; gap: var(--space-lg); }
    }
    .cart-left { display: flex; flex-direction: column; gap: var(--space-lg); }
    
    .store-group-card {
      padding: var(--space-xl); 
      background: var(--color-bg-card-glass); 
      border: 1px solid var(--color-border); 
      border-radius: var(--radius-xl);
      display: flex; flex-direction: column; gap: var(--space-md);
      box-shadow: var(--shadow-md);
    }
    .group-header {
      display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 10px;
      .store-meta { display: flex; align-items: center; gap: 8px; h3 { font-size: 1.2rem; color: var(--color-text-primary); font-weight: 850; } }
      .store-badge { font-size: 0.68rem; font-weight: 800; color: var(--color-accent); background: var(--color-accent-dim); border: 1px solid var(--color-accent-glow); padding: 3px 10px; border-radius: 10px; text-transform: uppercase; }
      .visit-link { font-size: 0.82rem; color: var(--color-text-secondary); font-weight: 700; text-decoration: none; &:hover { color: var(--color-text-primary); } }
    }
    .group-items-list { display: flex; flex-direction: column; gap: var(--space-md); }
    
    .cart-item {
      display: flex; gap: var(--space-md); align-items: center; padding-bottom: var(--space-md); border-bottom: 1px dashed var(--color-border);
      &:last-child { border-bottom: none; padding-bottom: 0; }
      .item-img { width: 60px; height: 60px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--color-border); }
      .item-details {
        flex: 1; display: flex; flex-direction: column;
        .item-cat { font-size: 0.68rem; color: #8b5cf6; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; }
        .item-title { font-size: 1rem; font-weight: 850; color: var(--color-text-primary); }
        .item-unit-price { font-size: 0.78rem; color: var(--color-text-muted); }
      }
      .item-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
      .item-subtotal { font-weight: 900; color: var(--color-text-primary); font-size: 1.05rem; }
    }
 
    .qty-control { display: flex; align-items: center; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; }
    .qty-btn { background: transparent; border: none; color: var(--color-text-primary); width: 26px; height: 26px; cursor: pointer; font-weight: 850; &:hover { background: var(--color-border-hover); } }
    .qty-val { font-size: 0.88rem; font-weight: 800; width: 26px; text-align: center; color: var(--color-text-primary); }
 
    .store-coupon-section {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      margin-top: var(--space-md);
    }
    .coupon-input-row {
      display: flex;
      gap: 10px;
    }
    .coupon-input {
      flex: 1;
      padding: 10px 14px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-primary);
      outline: none;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      &:focus { border-color: var(--color-accent); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-apply-coupon {
      background: rgba(37, 211, 102, 0.08);
      color: var(--color-accent);
      border: 1px solid rgba(37, 211, 102, 0.2);
      font-weight: 800;
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
      &:hover { background: var(--color-accent); color: #000; }
    }
    .btn-remove-coupon {
      background: rgba(239, 68, 68, 0.08);
      color: var(--color-danger);
      border: 1px solid rgba(239, 68, 68, 0.2);
      font-weight: 800;
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
      &:hover { background: var(--color-danger); color: #fff; }
    }
    .coupon-error {
      color: var(--color-danger);
      font-size: 0.82rem;
      margin-top: 8px;
      text-align: left;
      font-weight: 600;
    }
    .coupon-success {
      color: var(--color-accent);
      font-size: 0.82rem;
      margin-top: 8px;
      text-align: left;
      font-weight: 600;
    }
    .group-total-details {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 0.92rem;
      color: var(--color-text-secondary);
      text-align: left;
      min-width: 160px;
      .coupon-discount {
        color: var(--color-accent);
        font-weight: 700;
      }
      .final-total {
        font-size: 1.15rem;
        color: var(--color-text-primary);
        border-top: 1px dashed var(--color-border);
        padding-top: 6px;
        margin-top: 4px;
        font-weight: 900;
      }
    }
    .group-footer {
      display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--color-border); padding-top: var(--space-lg); margin-top: var(--space-sm);
      .btn-whatsapp { 
        background: linear-gradient(135deg, var(--color-accent) 0%, #1ebd5d 100%); 
        color: #000; font-weight: 900; border: none; padding: 12px 24px; border-radius: var(--radius-md); box-shadow: 0 4px 15px rgba(37, 211, 102, 0.25); 
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        &:hover:not([disabled]) { transform: translateY(-1.5px); box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45); } 
        &:disabled { opacity: 0.5; cursor: not-allowed; } 
      }
    }
 
    /* Checkout Card */
    .checkout-form-card {
      padding: var(--space-xl); 
      background: var(--color-bg-card-glass); 
      border: 1px solid var(--color-border); 
      border-radius: var(--radius-xl);
      display: flex; flex-direction: column; gap: var(--space-md);
      box-shadow: var(--shadow-md);
      h3 { font-size: 1.35rem; font-weight: 850; color: var(--color-text-primary); }
      .form-desc { font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.45; margin-top: -6px; }
    }
    .form-group {
      display: flex; flex-direction: column; gap: 6px;
      label { font-size: 0.75rem; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
      input, textarea { 
        padding: 12px 14px; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); outline: none; font-size: 0.95rem; 
        transition: border-color 0.2s;
        &:focus { border-color: var(--color-accent); } 
      }
      textarea { resize: vertical; min-height: 90px; }
    }
    
    .cart-grand-summary {
      margin-top: var(--space-md); border-top: 1px solid var(--color-border); padding-top: var(--space-lg); display: flex; flex-direction: column; gap: 10px;
      .summary-row {
        display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--color-text-secondary);
        &.total { font-size: 1.25rem; font-weight: 950; color: var(--color-text-primary); border-top: 1px dashed var(--color-border); padding-top: 10px; }
      }
    }
    .alert { padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.9rem; margin-top: 12px; }
    .alert-danger { background: rgba(239,68,68,0.06); color: var(--color-danger); border: 1px solid rgba(239,68,68,0.15); }
  `]
})
export class CartComponent implements OnInit {
  cartItems: MarketplaceCartItem[] = [];
  wishlistCount = 0;
  totalCount = 0;
  grandTotal = 0;

  // Grouped stores list
  groupedGroups: GroupedCart[] = [];

  // Customer checkout info
  checkoutName = '';
  checkoutPhone = '';
  checkoutNotes = '';
  checkoutError = '';

  // Coupon bindings per business ID
  appliedCoupons: Record<string, any> = {};
  couponCodes: Record<string, string> = {};
  couponErrors: Record<string, string> = {};
  discountAmounts: Record<string, number> = {};

  // Track button loadings
  submittingCheckouts: Record<string, boolean> = {};
  isSubmittingAll = false;

  constructor(
    private marketplaceService: MarketplaceService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.marketplaceService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      this.groupCartItems();
    });

    this.marketplaceService.wishlist$.subscribe(items => {
      this.wishlistCount = items.length;
    });
  }

  groupCartItems() {
    const groups: Record<string, GroupedCart> = {};
    
    this.cartItems.forEach(item => {
      const biz = item.product.business;
      if (!biz) return;
      
      const bizId = biz._id;
      if (!groups[bizId]) {
        groups[bizId] = {
          businessId: bizId,
          businessName: biz.name,
          businessSlug: biz.websiteSlug,
          whatsappNumber: biz.whatsappNumber || '',
          items: [],
          total: 0
        };
      }
      groups[bizId].items.push(item);
      groups[bizId].total += item.product.price * item.quantity;
    });

    this.groupedGroups = Object.values(groups);

    // Refresh discount calculations for active coupons
    this.groupedGroups.forEach(group => {
      if (this.appliedCoupons[group.businessId]) {
        this.discountAmounts[group.businessId] = this.getDiscountAmount(group);
      } else {
        this.discountAmounts[group.businessId] = 0;
      }
    });

    this.recalculateGrandTotal();
  }

  getDiscountAmount(group: GroupedCart): number {
    const coupon = this.appliedCoupons[group.businessId];
    if (!coupon) return 0;
    if (coupon.discountType === 'percentage') {
      return Math.round((group.total * coupon.discountValue) / 100);
    } else {
      return Math.min(coupon.discountValue, group.total);
    }
  }

  recalculateGrandTotal() {
    let grand = 0;
    this.groupedGroups.forEach(group => {
      const discount = this.discountAmounts[group.businessId] || 0;
      grand += (group.total - discount);
    });
    this.grandTotal = grand;
  }

  applyCoupon(group: GroupedCart) {
    const code = this.couponCodes[group.businessId];
    if (!code || code.trim().length === 0) {
      this.couponErrors[group.businessId] = 'Please enter a coupon code.';
      return;
    }
    this.couponErrors[group.businessId] = '';

    const phoneParam = this.checkoutPhone ? `?phone=${encodeURIComponent(this.checkoutPhone)}` : '';

    this.http.get<any>(`${environment.apiUrl}/coupons/public/${group.businessSlug}/validate/${code.trim().toUpperCase()}${phoneParam}`).subscribe({
      next: (res) => {
        if (res.success && res.coupon) {
          this.appliedCoupons[group.businessId] = res.coupon;
          this.discountAmounts[group.businessId] = this.getDiscountAmount(group);
          this.couponErrors[group.businessId] = '';
          this.recalculateGrandTotal();
        } else {
          this.couponErrors[group.businessId] = 'Invalid coupon code.';
        }
      },
      error: (err) => {
        this.couponErrors[group.businessId] = err.error?.message || 'Invalid or expired coupon.';
      }
    });
  }

  removeCoupon(group: GroupedCart) {
    delete this.appliedCoupons[group.businessId];
    this.discountAmounts[group.businessId] = 0;
    this.couponCodes[group.businessId] = '';
    this.couponErrors[group.businessId] = '';
    this.recalculateGrandTotal();
  }

  updateQty(productId: string, quantity: number) {
    this.marketplaceService.updateQuantity(productId, quantity);
  }

  trackGroup(index: number, group: GroupedCart) {
    return group.businessId;
  }

  // Splits checkout per store
  checkoutStore(group: GroupedCart) {
    // This is now handled by checkoutAll
  }

  async checkoutAll() {
    if (!this.checkoutName || !this.checkoutPhone) {
      this.checkoutError = 'Please fill in your Name and Contact Phone details before checkout.';
      return;
    }
    
    this.checkoutError = '';
    this.isSubmittingAll = true;
    
    let hasError = false;

    for (const group of this.groupedGroups) {
      const discount = this.discountAmounts[group.businessId] || 0;
      const finalTotal = group.total - discount;
      const couponCode = this.appliedCoupons[group.businessId]?.code || '';

      const orderPayload = {
        business: group.businessId,
        customerName: this.checkoutName,
        customerPhone: this.checkoutPhone,
        customerWhatsapp: this.checkoutPhone,
        items: group.items.map(item => ({
          product: item.product._id,
          name: item.product.title,
          price: item.product.price,
          quantity: item.quantity
        })),
        totalAmount: finalTotal,
        couponCode: couponCode,
        discountAmount: discount,
        notes: this.checkoutNotes,
        status: 'NEW'
      };

      try {
        const res = await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/orders`, orderPayload));
        if (res && res.success && res.order) {
           // Remove completed store items from marketplace cart state
           group.items.forEach(item => {
             this.marketplaceService.removeFromCart(item.product._id);
           });
           this.removeCoupon(group);
        } else {
           hasError = true;
           this.checkoutError = `Failed to place order for ${group.businessName}. Please try again.`;
           break;
        }
      } catch (err: any) {
         hasError = true;
         this.checkoutError = err.error?.message || `Failed to place order for ${group.businessName}. Please try again.`;
         break;
      }
    }

    this.isSubmittingAll = false;

    if (!hasError) {
       alert('🎉 All orders placed successfully! Store owners have been notified via their dashboard.');
       this.checkoutName = '';
       this.checkoutPhone = '';
       this.checkoutNotes = '';
    }
  }
}
