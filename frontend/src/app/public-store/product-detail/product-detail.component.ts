import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../shared/services/cart.service';
import { WishlistService } from '../../shared/services/wishlist.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle.component';

import { ToastService } from '../../shared/services/toast.service';

interface ProductItem {
  _id: string;
  business: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isAvailable: boolean;
  featured: boolean;
}

interface ReviewRecord {
  _id?: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ThemeToggleComponent],
  template: `
    <div *ngIf="loading" class="loading-state">
      <span class="spinner">📦</span> Loading product details...
    </div>

    <div *ngIf="!loading && notFound" class="not-found-state">
      <div class="empty-icon">❌</div>
      <h2>Product Not Found</h2>
      <p>This product may have been deleted or is currently unavailable.</p>
      <a [routerLink]="['/store', slug]" class="btn btn-primary">Return to Shop</a>
    </div>

    <!-- Active Product Detail -->
    <div *ngIf="!loading && !notFound && product && business" [className]="'detail-wrapper theme-' + getThemeClass() + ' template-' + getTemplateClass()">
      
      <!-- Sticky Premium Glass Header -->
      <header class="store-header glass-header">
        <div class="header-container">
          <a [routerLink]="['/store', slug]" class="store-brand">
            <img class="store-mini-logo" *ngIf="business.logoUrl" [src]="business.logoUrl" alt="Logo">
            <span class="store-title-text">{{ business.name }}</span>
          </a>
          
          <nav class="store-nav">
            <a [routerLink]="['/store', slug]" class="nav-link-btn">
              <span class="label-text">Products</span>
            </a>
            <a [routerLink]="['/store', slug, 'wishlist']" class="nav-link-btn wishlist-link">
              ❤️ <span class="label-text">Wishlist</span> <span class="nav-badge" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
            </a>
            <a [routerLink]="['/store', slug, 'track']" class="nav-link-btn">
              <span class="label-text">Track Order</span>
            </a>
          </nav>

          <div class="header-actions">

            <app-theme-toggle></app-theme-toggle>
            <!-- Cart Button with Hover Dropdown -->
            <div class="cart-dropdown-wrapper" (mouseenter)="showCartDropdown = true" (mouseleave)="showCartDropdown = false">
              <button class="cart-btn" (click)="toggleCartDrawer()">
                🛒 Cart <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
              </button>
              
              <!-- Cart Dropdown Dropdown (Desktop Only) -->
              <div class="cart-dropdown-menu glass-card" *ngIf="showCartDropdown && cartCount > 0">
                <div class="cart-dropdown-items">
                  @for (item of cart.items; track item.product?._id || item.product) {
                    <div class="dropdown-item">
                      <img [src]="item.product?.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop'" class="dropdown-img" alt="Product">
                      <div class="dropdown-info">
                        <span class="dropdown-name">{{ item.name }}</span>
                        <span class="dropdown-qty">{{ item.quantity }} × ₹{{ item.price }}</span>
                      </div>
                      <button class="btn-remove-dropdown" (click)="removeFromCart(item.product?._id || item.product)">✕</button>
                    </div>
                  }
                </div>
                <div class="cart-dropdown-footer">
                  <span class="dropdown-total">Subtotal: <strong>₹{{ cart.totalAmount }}</strong></span>
                  <div class="dropdown-actions">
                    <button class="btn btn-primary btn-sm w-full" (click)="toggleCartDrawer()">View Cart & Checkout</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="container page-content">
        
        <!-- Breadcrumb link -->
        <div class="breadcrumb">
          <a [routerLink]="['/store', slug]">⬅ Return to Storefront</a>
        </div>

        <div class="detail-grid">
          <!-- Left Column: Gallery -->
          <div class="gallery-card card">
            <!-- Main Image Zoom on hover & click to zoom Lightbox -->
            <div class="active-image" 
                 (mousemove)="onZoom($event)" 
                 (mouseleave)="onZoomLeave()" 
                 (click)="openLightbox()" 
                 #zoomContainer>
              <img [src]="activeImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'" 
                   [alt]="product.title"
                   [style.transform]="zoomActive ? 'scale(1.8)' : 'scale(1)'"
                   [style.transform-origin]="zoomOrigin"
                   class="gallery-main-img">
              <span class="zoom-hint-icon">🔍 Hover to Zoom, Click to Expand</span>
            </div>
            
            <div class="thumbnails-grid" *ngIf="product.images.length > 1">
              @for (img of product.images; track img) {
                <button (click)="setActiveImage(img)" class="thumb-btn" [class.selected]="activeImage === img">
                  <img [src]="img" alt="Thumbnail">
                </button>
              }
            </div>
          </div>

          <!-- Right Column: Info & Action -->
          <div class="info-card card">
            <div class="info-top-row">
              <span class="category-tag">{{ product.category }}</span>
              <button class="wishlist-detail-btn" [class.in-wishlist]="isInWishlist(product._id)" (click)="toggleWishlist(product._id)" title="Add to Wishlist">
                ❤️ {{ isInWishlist(product._id) ? 'Saved' : 'Save' }}
              </button>
            </div>
            <span *ngIf="product.featured" class="featured-tag">⭐ Featured Item</span>
            
            <h1 class="product-title">{{ product.title }}</h1>
            
            <div class="price-row">
              <span class="price">₹{{ product.price }}</span>
              <span class="stock-badge" [class.out]="product.stock === 0" [class.low]="product.stock > 0 && product.stock <= 3">
                {{ product.stock > 0 ? (product.stock <= 3 ? 'Low Stock (' + product.stock + ' left)' : 'In Stock') : 'Sold Out' }}
              </span>
            </div>

            <!-- Available Offers Widget -->
            <div class="available-offers-widget" *ngIf="publicCoupons.length > 0">
              <h4 class="widget-title">🎁 Available Offers</h4>
              <div class="mini-tickets-list">
                @for (cp of publicCoupons; track cp._id) {
                  <div class="mini-ticket glass-card">
                    <!-- Left Tab -->
                    <div class="mini-tab">
                      <span class="disc-val">{{ cp.discountType === 'percentage' ? cp.discountValue + '%' : '₹' + cp.discountValue }}</span>
                      <span class="disc-lbl">OFF</span>
                    </div>
                    <!-- Divider line with notches -->
                    <div class="mini-divider">
                      <div class="notch top-notch"></div>
                      <div class="notch bottom-notch"></div>
                    </div>
                    <!-- Content -->
                    <div class="mini-content">
                      <div class="code-and-icon">
                        <span class="coupon-code">{{ cp.code }}</span>
                        <button (click)="copyCoupon(cp.code)" class="btn btn-sm copy-btn" [style.background]="copiedCouponCode === cp.code ? '#25d366' : 'rgba(255,255,255,0.05)'" [style.color]="copiedCouponCode === cp.code ? '#000' : '#fff'">
                          {{ copiedCouponCode === cp.code ? '✓ Copied' : '📋 Copy' }}
                        </button>
                      </div>
                      <p class="expiry-text">📅 Valid: {{ cp.expiryDate ? (cp.expiryDate | date:'mediumDate') : 'Limited Time' }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Rich Description with line breaks and Read More/Less toggle -->
            <div class="description-section">
              <p class="description-text">{{ getDescriptionText() }}</p>
              <button class="btn-toggle-desc" *ngIf="product.description.length > 250" (click)="descExpanded = !descExpanded">
                {{ descExpanded ? 'Read Less 🔼' : 'Read More 🔽' }}
              </button>
            </div>

            <div class="purchase-actions" *ngIf="product.stock > 0">
              <div class="qty-control">
                <span class="qty-label">Quantity:</span>
                <div class="qty-selector">
                  <button class="qty-btn" (click)="decrementQty()" [disabled]="buyQuantity <= 1">-</button>
                  <span class="qty-val">{{ buyQuantity }}</span>
                  <button class="qty-btn" (click)="incrementQty()" [disabled]="buyQuantity >= product.stock">+</button>
                </div>
              </div>

              <button (click)="addToCart(product._id)" class="btn btn-whatsapp-large w-full">
                🛒 Add to Cart & Checkout
              </button>
            </div>

            <div class="sold-out-alert" *ngIf="product.stock === 0">
              🛑 This item is currently out of stock. Please check back later.
            </div>
          </div>
        </div>

        <!-- Reviews Section Grid -->
        <div class="reviews-container">
          <div class="reviews-title-block">
            <h2>Buyer Reviews & Ratings</h2>
            <p>Read real satisfaction feedback from other buyers or submit your own review.</p>
          </div>

          <!-- Dynamic Rating Summary Bar -->
          <div class="rating-summary-card card" *ngIf="reviews.length > 0">
            <div class="summary-left-score">
              <span class="big-score-num">{{ getAverageStars() }}</span>
              <div class="stars-gold-row">{{ getStarDisplay(getAverageStarsRound()) }}</div>
              <span class="based-count">Based on {{ reviews.length }} reviews</span>
            </div>
            <div class="summary-right-distribution">
              @for (starNum of [5, 4, 3, 2, 1]; track starNum) {
                <div class="dist-row">
                  <span class="dist-label">{{ starNum }} ★</span>
                  <div class="dist-track">
                    <div class="dist-fill" [style.width]="getRatingPercentage(starNum) + '%'"></div>
                  </div>
                  <span class="dist-count-label">{{ getRatingCount(starNum) }}</span>
                </div>
              }
            </div>
          </div>

          <div class="reviews-grid">
            <!-- Review submission form -->
            <div class="review-form-wrapper card">
              <h3>Share Your Feedback</h3>
              <p class="form-hint">Your email is kept confidential. Fields marked with * are required.</p>
              
              <form (ngSubmit)="onSubmitReview()" class="sub-form">
                <div class="form-group">
                  <label for="rev-name">Your Full Name *</label>
                  <input id="rev-name" type="text" name="name" [(ngModel)]="newReview.name" placeholder="e.g. John Doe" required>
                </div>
                
                <div class="form-group">
                  <label>Select Rating Score *</label>
                  <div class="star-rating-selector">
                    @for (starVal of [1, 2, 3, 4, 5]; track starVal) {
                      <button type="button" class="star-selector-btn" (click)="setRating(starVal)" [class.active]="newReview.rating >= starVal" [title]="starVal + ' Stars'">
                        ★
                      </button>
                    }
                  </div>
                  <p class="rating-label-desc">
                    {{ newReview.rating === 5 ? '⭐⭐⭐⭐⭐ Excellent' : 
                       newReview.rating === 4 ? '⭐⭐⭐⭐ Good' : 
                       newReview.rating === 3 ? '⭐⭐⭐ Average' : 
                       newReview.rating === 2 ? '⭐⭐ Fair' : '⭐ Poor' }}
                  </p>
                </div>

                <div class="form-group">
                  <label for="rev-comment">Review Details *</label>
                  <textarea id="rev-comment" name="comment" [(ngModel)]="newReview.comment" rows="4" placeholder="Detail your experience with this item's quality, texture, delivery, etc..." required></textarea>
                </div>

                <div *ngIf="reviewError" class="alert alert-danger">❌ {{ reviewError }}</div>
                <div *ngIf="reviewSuccess" class="alert alert-success">✅ Review submitted successfully! It will be visible once approved by the store owner.</div>

                <button type="submit" class="btn btn-primary btn-submit-rev" [disabled]="submittingReview">
                  {{ submittingReview ? 'Submitting Review...' : '🚀 Submit Review' }}
                </button>
              </form>
            </div>

            <!-- Reviews list -->
            <div class="reviews-list-wrapper">
              <div *ngIf="reviews.length === 0" class="empty-reviews card">
                <div class="empty-stars">⭐⭐⭐⭐⭐</div>
                <h3>Be the first to review</h3>
                <p>No customer reviews have been written yet. Share your experience with other buyers!</p>
              </div>

              <div class="reviews-feed" *ngIf="reviews.length > 0">
                @for (rev of reviews; track rev._id) {
                  <div class="review-item-card card">
                    <div class="review-card-top">
                      <div class="buyer-avatar">
                        {{ getInitials(rev.name) }}
                      </div>
                      <div class="buyer-info">
                        <strong>{{ rev.name }}</strong>
                        <span class="verified-badge">✓ Verified Buyer</span>
                      </div>
                      <div class="buyer-stars">
                        {{ getStarDisplay(rev.rating) }}
                      </div>
                    </div>
                    <p class="review-text-comment">"{{ rev.comment }}"</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Full-Screen Image Gallery Lightbox Overlay -->
      <div class="lightbox-overlay" *ngIf="showLightbox" (click)="closeLightbox()">
        <button class="lightbox-close" (click)="closeLightbox()">✕</button>
        
        <button class="lightbox-arrow prev" (click)="prevLightboxImg($event)">◀</button>
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <img [src]="activeImage" alt="Expanded image" class="lightbox-img">
        </div>
        <button class="lightbox-arrow next" (click)="nextLightboxImg($event)">▶</button>
      </div>

      <!-- Shopping Cart Drawer (Slides from Right) -->
      <div class="cart-drawer-overlay" *ngIf="showCartDrawer" (click)="toggleCartDrawer()">
        <div class="cart-drawer glass-card animate-slide-left" (click)="$event.stopPropagation()">
          <header class="drawer-header">
            <h3>🛒 Shopping Cart</h3>
            <button class="btn-close" (click)="toggleCartDrawer()">×</button>
          </header>
          
          <div class="drawer-body">
            <div *ngIf="cart.items.length === 0" class="empty-drawer">
              <span class="empty-icon">🛒</span>
              <p>Your shopping cart is empty</p>
              <button class="btn btn-primary btn-sm" (click)="toggleCartDrawer()">Start Shopping</button>
            </div>
            
            <div *ngIf="cart.items.length > 0" class="drawer-content">
              <div class="drawer-items-list">
                @for (item of cart.items; track item.product?._id || item.product) {
                  <div class="drawer-item">
                    <img [src]="item.product?.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&auto=format&fit=crop'" class="drawer-img" alt="Item Image">
                    <div class="drawer-info">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-price">₹{{ item.price }}</span>
                      
                      <!-- Quantity Selector -->
                      <div class="qty-selector">
                        <button class="qty-btn" (click)="updateCartQuantity(item.product?._id || item.product, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
                        <span class="qty-val">{{ item.quantity }}</span>
                        <button class="qty-btn" (click)="updateCartQuantity(item.product?._id || item.product, item.quantity + 1)" [disabled]="item.quantity >= (item.product?.stock || 999)">+</button>
                      </div>
                    </div>
                    <div class="item-actions">
                      <span class="item-subtotal">₹{{ item.subtotal }}</span>
                      <button class="btn-remove" (click)="removeFromCart(item.product?._id || item.product)">🗑️ Remove</button>
                    </div>
                  </div>
                }
              </div>

              <!-- Coupon Code Entry -->
              <div class="coupon-section">
                <div class="coupon-input">
                  <input type="text" [(ngModel)]="couponCode" placeholder="Promo Code (e.g. WELCOME10)" [disabled]="appliedCoupon">
                  <button class="btn btn-ghost" (click)="applyCouponCode()" [disabled]="!couponCode || appliedCoupon">Apply</button>
                </div>
                
                <!-- Quick Apply Available Coupons -->
                <div *ngIf="publicCoupons.length > 0 && !appliedCoupon" style="margin-top: var(--space-sm);">
                  <div style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.05em;">Available Offers (Click to Apply):</div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    @for (cp of publicCoupons; track cp._id) {
                      <button (click)="applyQuickCoupon(cp.code)" class="btn btn-sm" style="background: rgba(37, 211, 102, 0.08); border: 1px dashed rgba(37, 211, 102, 0.3); color: #25d366; font-size: 0.75rem; padding: 6px 12px; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        🏷️ {{ cp.code }} (-{{ cp.discountType === 'percentage' ? cp.discountValue + '%' : '₹' + cp.discountValue }})
                      </button>
                    }
                  </div>
                </div>

                <div class="coupon-feedback alert alert-success" *ngIf="appliedCoupon">
                  🎉 Code <strong>{{ appliedCoupon.code }}</strong> applied! Discount: 
                  {{ appliedCoupon.discountType === 'percentage' ? appliedCoupon.discountValue + '%' : '₹' + appliedCoupon.discountValue }}
                  <button class="btn-remove-coupon" (click)="removeCoupon()">✕</button>
                </div>
                <div class="coupon-feedback alert alert-danger" *ngIf="couponError">
                  ❌ {{ couponError }}
                </div>
              </div>

              <!-- Cart Totals Breakdown -->
              <div class="cart-summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{{ cart.totalAmount }}</span>
                </div>
                <div class="summary-row discount" *ngIf="appliedCoupon">
                  <span>Discount:</span>
                  <span>-₹{{ getDiscountAmount() }}</span>
                </div>
                <div class="summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{{ getTotalAmount() }}</span>
                </div>
              </div>

              <!-- Customer Checkout Details Form -->
              <div class="drawer-checkout">
                <h4>Customer Details</h4>
                <form (ngSubmit)="checkoutCart()" class="checkout-form">
                  <div class="form-group">
                    <label for="chk-name">Your Full Name *</label>
                    <input id="chk-name" type="text" name="checkoutName" [(ngModel)]="checkoutName" placeholder="e.g. John Doe" required>
                  </div>
                  <div class="form-group">
                    <label for="chk-phone">Contact Phone / WhatsApp *</label>
                    <input id="chk-phone" type="tel" name="checkoutPhone" [(ngModel)]="checkoutPhone" placeholder="e.g. +91 99999 99999" required>
                  </div>
                  <div class="form-group">
                    <label for="chk-notes">Special Instructions (Optional)</label>
                    <textarea id="chk-notes" name="checkoutNotes" [(ngModel)]="checkoutNotes" placeholder="Delivery address, size constraints, etc."></textarea>
                  </div>
                  
                  <div *ngIf="checkoutError" class="alert alert-danger">❌ {{ checkoutError }}</div>
                  
                  <button type="submit" class="btn btn-whatsapp w-full" [disabled]="submittingCheckout">
                    {{ submittingCheckout ? 'Registering Order...' : '🟢 Checkout via WhatsApp' }}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .loading-state, .not-found-state {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-xl);
    }
    .empty-icon { font-size: 4rem; margin-bottom: var(--space-md); }
    
    .detail-wrapper {
      min-height: 100vh;
      background: var(--color-bg);
      color: var(--color-text-primary);
      padding: var(--space-xl) 0;
      padding-top: 90px;
    }
    .page-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    /* Sticky Store Header */
    .store-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 70px;
      z-index: 100;
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--color-border);
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
    .store-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--color-text-primary);
      font-weight: 800;
      font-size: 1.25rem;
    }
    .store-mini-logo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--color-accent);
    }
    .store-nav {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .nav-link-btn {
      color: var(--color-text-secondary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: color 0.2s;
      &:hover { color: var(--color-text-primary); }
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    @media (max-width: 600px) {
      .header-container { padding: 0 var(--space-md); }
      .store-nav { gap: 10px; }
      .header-actions { gap: 10px; }
      .store-brand { font-size: 1.1rem; }
      .nav-link-btn span.label-text { display: none; }
      .cart-btn { padding: 6px 12px; }
    }
    .wishlist-link {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-badge {
      background: #ef4444;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 10px;
    }
    .cart-btn {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      font-weight: 700;
      padding: 8px 18px;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      &:hover { background: var(--color-accent); color: var(--color-on-accent); border-color: var(--color-accent); }
    }
    .cart-badge {
      background: #25d366;
      color: #000;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 10px;
    }

    /* Cart Dropdown wrapper */
    .cart-dropdown-wrapper {
      position: relative;
    }
    .cart-dropdown-menu {
      position: absolute;
      top: 100%; right: 0;
      width: 320px;
      margin-top: 10px;
      padding: var(--space-md);
      background: var(--color-bg-card-glass);
      border: 1px solid var(--color-border);
      z-index: 200;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .cart-dropdown-items {
      max-height: 240px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: var(--space-md);
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
    }
    .dropdown-img {
      width: 44px; height: 44px;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }
    .dropdown-info {
      flex: 1;
      display: flex; flex-direction: column;
    }
    .dropdown-name {
      font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .dropdown-qty { font-size: 0.75rem; color: var(--color-text-secondary); }
    .btn-remove-dropdown {
      background: transparent; border: none; color: var(--color-text-secondary); cursor: pointer;
      &:hover { color: #ef4444; }
    }
    .cart-dropdown-footer {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-sm);
      display: flex; flex-direction: column; gap: 8px;
    }
    .dropdown-total { font-size: 0.9rem; color: var(--color-text-secondary); }

    .breadcrumb a {
      color: var(--color-text-secondary);
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all var(--transition-fast);
      &:hover {
        color: var(--color-accent);
        transform: translateX(-4px);
      }
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: var(--space-2xl);
      align-items: start;
    }
    @media (max-width: 800px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }
    }
    .gallery-card {
      position: sticky;
      top: 100px;
      height: fit-content;
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
    }
    .active-image {
      aspect-ratio: 1 / 1;
      width: 100%;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      position: relative;
      cursor: zoom-in;
    }
    .gallery-main-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.1s ease-out;
    }
    .zoom-hint-icon {
      position: absolute;
      bottom: 10px; right: 10px;
      background: rgba(0,0,0,0.6);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #ccc;
    }
    @media (max-width: 500px) {
      .active-image { height: 280px; }
    }
    .thumbnails-grid {
      display: flex;
      gap: var(--space-sm);
      margin-top: var(--space-sm);
      overflow-x: auto;
      padding-bottom: 8px;
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
      &::-webkit-scrollbar { height: 6px; }
      &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    }
    .thumb-btn {
      flex: 0 0 70px;
      height: 70px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      background: var(--color-bg-surface);
      cursor: pointer;
      transition: all var(--transition-normal);
      img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }
      &:hover { transform: translateY(-2px); img { opacity: 0.9; } }
      &.selected {
        border-color: var(--color-accent);
        box-shadow: 0 0 10px var(--color-accent-glow);
        img { opacity: 1; }
      }
    }

    .info-card {
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .info-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .wishlist-detail-btn {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      padding: 6px 12px;
      border-radius: var(--radius-pill);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
      &:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }
      &.in-wishlist { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: var(--color-text-primary); }
    }
    .category-tag {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--color-accent);
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .featured-tag {
      font-size: 0.75rem;
      background: linear-gradient(135deg, #ffc857, #ff9f1c);
      color: #000;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      width: fit-content;
    }
    .product-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--color-text-primary);
      line-height: 1.2;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-md);
    }
    .price { font-size: 2rem; font-weight: 800; color: var(--color-text-primary); }
    .stock-badge {
      font-size: 0.8rem; font-weight: 600; color: var(--color-accent);
      background: var(--color-accent-dim); border: 1px solid var(--color-accent-glow);
      padding: 6px 14px; border-radius: var(--radius-pill);
      &.low { color: var(--color-warning); background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); }
      &.out { color: var(--color-danger); background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }
    }
    
    /* Description Pre line Formatting & Read More */
    .description-section {
      display: flex; flex-direction: column; gap: 8px;
    }
    .description-text {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--color-text-secondary);
      white-space: pre-line;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .btn-toggle-desc {
      background: transparent; border: none; color: var(--color-accent);
      font-size: 0.85rem; font-weight: 700; cursor: pointer; text-align: left;
      width: fit-content; outline: none;
    }
    
    .purchase-actions {
      display: flex; flex-direction: column; gap: var(--space-md);
      margin-top: var(--space-sm);
    }
    .qty-control {
      display: flex; align-items: center; gap: 12px;
      .qty-label { font-size: 0.9rem; font-weight: 700; color: var(--color-text-secondary); }
    }
    
    /* Qty Selector */
    .qty-selector {
      display: flex; align-items: center; gap: 4px;
      background: var(--color-bg-surface); border: 1px solid var(--color-border);
      border-radius: 4px; overflow: hidden;
    }
    .qty-btn {
      background: transparent; border: none; color: var(--color-text-primary); width: 32px; height: 32px;
      cursor: pointer; font-weight: 800; font-size: 1.1rem;
      &:hover:not([disabled]) { background: var(--color-border); }
      &:disabled { color: var(--color-text-muted); cursor: not-allowed; }
    }
    .qty-val { font-size: 1rem; font-weight: 700; width: 32px; text-align: center; color: var(--color-text-primary); }

    .btn-whatsapp-large {
      background: var(--color-accent); color: #000; border: none; padding: 16px;
      border-radius: var(--radius-md); font-weight: 700; font-size: 1.1rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 8px 25px var(--color-accent-glow);
      transition: all var(--transition-normal);
      &:hover { transform: translateY(-2px); box-shadow: 0 12px 30px var(--color-accent-glow); opacity: 0.95; }
    }
    .sold-out-alert {
      padding: var(--space-md); border-radius: var(--radius-md);
      background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444; font-weight: 700; font-size: 0.95rem; text-align: center;
    }

    /* Lightbox overlay */
    .lightbox-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.95);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
    }
    .lightbox-close {
      position: absolute; top: 20px; right: 20px;
      background: transparent; border: none; color: #fff; font-size: 2.2rem; cursor: pointer;
    }
    .lightbox-arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; width: 50px; height: 50px; border-radius: 50%;
      cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
      &:hover { background: rgba(255,255,255,0.15); }
      &.prev { left: 20px; }
      &.next { right: 20px; }
    }
    .lightbox-content {
      max-width: 85%; max-height: 85%;
      img { max-width: 100%; max-height: 100vh; object-fit: contain; }
    }

    /* Reviews section styles */
    .reviews-container {
      margin-top: var(--space-3xl);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: var(--space-2xl);
      display: flex; flex-direction: column; gap: var(--space-xl);
    }
    .reviews-title-block {
      h2 { font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: var(--space-xs); }
      p { font-size: 0.95rem; color: var(--color-text-secondary); }
    }
    
    /* Dynamic Summary Card */
    .rating-summary-card {
      display: grid; grid-template-columns: 1fr 1.5fr; gap: var(--space-2xl);
      padding: var(--space-xl); background: var(--color-bg-card-glass);
      border: 1px solid var(--color-border); border-radius: var(--radius-lg);
      align-items: center;
      @media (max-width: 600px) { grid-template-columns: 1fr; text-align: center; }
    }
    .summary-left-score {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      border-right: 1px solid var(--color-border); padding-right: var(--space-xl);
      @media (max-width: 600px) { border-right: none; padding-right: 0; border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-lg); }
      .big-score-num { font-size: 4.5rem; font-weight: 900; color: var(--color-text-primary); line-height: 1; }
      .stars-gold-row { color: #ffc857; font-size: 1.4rem; letter-spacing: 2px; }
      .based-count { font-size: 0.85rem; color: var(--color-text-secondary); }
    }
    .summary-right-distribution { display: flex; flex-direction: column; gap: 10px; }
    .dist-row { display: flex; align-items: center; gap: var(--space-md); font-size: 0.9rem; color: var(--color-text-secondary); }
    .dist-label { width: 35px; font-weight: 600; text-align: right; }
    .dist-track { flex: 1; height: 8px; background: var(--color-border); border-radius: var(--radius-pill); overflow: hidden; }
    .dist-fill { height: 100%; background: linear-gradient(90deg, #ffc857, var(--color-accent)); border-radius: var(--radius-pill); }
    .dist-count-label { width: 25px; text-align: left; font-weight: 600; color: var(--color-text-primary); }

    /* Grid layout */
    .reviews-grid {
      display: grid; grid-template-columns: 1fr 1.3fr; gap: var(--space-xl); align-items: start;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    
    .review-form-wrapper {
      background: var(--color-bg-card-glass); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
      padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-md);
      h3 { font-size: 1.25rem; color: var(--color-text-primary); }
      .form-hint { font-size: 0.8rem; color: var(--color-text-secondary); }
    }
    .sub-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-group {
      display: flex; flex-direction: column; gap: 6px;
      label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary); }
      input, select, textarea {
        padding: 14px; background: var(--color-bg-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-md); color: var(--color-text-primary); font-size: 0.95rem; outline: none;
        &:focus { border-color: var(--color-accent); background: var(--color-bg-card); }
      }
    }
    .star-rating-selector { display: flex; gap: var(--space-xs); }
    .star-selector-btn {
      background: transparent; border: none; font-size: 2rem; color: rgba(255,255,255,0.1); cursor: pointer; padding: 0;
      &.active { color: #ffc857; text-shadow: 0 0 12px rgba(255, 200, 87, 0.5); }
    }
    .rating-label-desc { font-size: 0.8rem; font-weight: 600; color: var(--color-text-secondary); }
    .btn-submit-rev { width: 100%; justify-content: center; padding: 14px; font-weight: 700; }
    
    .reviews-list-wrapper { display: flex; flex-direction: column; gap: var(--space-md); }
    .empty-reviews {
      padding: var(--space-2xl); text-align: center; border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-lg); background: rgba(17, 19, 25, 0.2);
      display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
      .empty-stars { color: rgba(255,255,255,0.06); font-size: 1.8rem; }
      h3 { font-size: 1.15rem; color: #fff; }
      p { font-size: 0.9rem; color: var(--color-text-secondary); max-width: 340px; }
    }
    
    .reviews-feed { display: flex; flex-direction: column; gap: var(--space-md); }
    .review-item-card {
      background: rgba(17, 19, 25, 0.45); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: var(--radius-lg);
      padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md);
      transition: all var(--transition-normal);
      &:hover { border-color: var(--color-accent); box-shadow: 0 8px 25px var(--color-accent-glow); }
    }
    .review-card-top { display: flex; align-items: center; gap: var(--space-md); }
    .buyer-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
      color: #000; display: flex; align-items: center; justify-content: center; font-weight: 800;
    }
    .buyer-info {
      flex: 1; display: flex; flex-direction: column; gap: 2px;
      strong { font-size: 0.95rem; color: var(--color-text-primary); }
      .verified-badge { font-size: 0.75rem; color: #25d366; font-weight: 600; }
    }
    .buyer-stars { color: #ffc857; font-size: 0.95rem; }
    .review-text-comment { font-size: 0.95rem; color: var(--color-text-secondary); line-height: 1.6; font-style: italic; border-left: 2px solid var(--color-accent); padding-left: var(--space-sm); }

    /* Cart Drawer (Sidebar/Drawer) */
    .cart-drawer-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex; justify-content: flex-end;
    }
    .cart-drawer {
      width: 100%; max-width: 480px;
      height: 100%;
      background: var(--color-bg-card);
      border-left: 1px solid var(--color-border);
      display: flex; flex-direction: column;
      padding: 0;
    }
    .drawer-header {
      padding: var(--space-lg);
      border-bottom: 1px solid var(--color-border);
      display: flex; align-items: center; justify-content: space-between;
      h3 { font-size: 1.25rem; font-weight: 800; color: var(--color-text-primary); margin: 0; }
      .btn-close {
        background: transparent; border: none; color: var(--color-text-secondary);
        font-size: 2rem; cursor: pointer; &:hover { color: var(--color-text-primary); }
      }
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-lg);
    }
    .empty-drawer {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 300px; gap: var(--space-sm);
      .empty-icon { font-size: 3.5rem; }
      p { color: var(--color-text-secondary); }
    }
    .drawer-items-list {
      display: flex; flex-direction: column; gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .drawer-item {
      display: flex; gap: var(--space-md);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--color-border);
    }
    .drawer-img {
      width: 64px; height: 64px; object-fit: cover;
      border-radius: var(--radius-md); border: 1px solid var(--color-border);
    }
    .drawer-info {
      flex: 1; display: flex; flex-direction: column; gap: 4px;
      .item-name { font-weight: 800; color: var(--color-text-primary); font-size: 0.95rem; }
      .item-price { color: var(--color-text-secondary); font-size: 0.9rem; }
    }
    
    .purchase-actions {
      display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-xl);
      padding-top: var(--space-xl); border-top: 1px dashed var(--color-border);
    }
    
    .qty-control {
      display: flex; align-items: center; justify-content: space-between;
      .qty-label { font-size: 0.95rem; font-weight: 700; color: var(--color-text-secondary); }
    }

    .qty-selector {
      display: flex; align-items: center; gap: 4px; margin-top: 4px;
      background: var(--color-bg-surface); border: 1px solid var(--color-border);
      border-radius: var(--radius-pill); width: fit-content; overflow: hidden; padding: 2px 6px;
    }
    
    .qty-btn {
      background: transparent; border: none; color: var(--color-text-primary); width: 28px; height: 28px;
      cursor: pointer; font-weight: 800; font-size: 1.1rem;
      &:hover:not([disabled]) { background: var(--color-border); color: var(--color-accent); }
      &:disabled { color: var(--color-text-muted); cursor: not-allowed; }
    }
    
    .qty-val { font-size: 1.05rem; font-weight: 800; width: 30px; text-align: center; color: var(--color-text-primary); }

    .btn-whatsapp-large {
      background: linear-gradient(135deg, var(--color-accent) 0%, #16a34a 100%);
      color: #000; border: none; padding: 16px 24px; font-size: 1.1rem; font-weight: 900; border-radius: var(--radius-lg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);
      &:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(37, 211, 102, 0.45); }
    }

    /* Mobile Sticky Bottom Bar for Purchase Actions */
    @media (max-width: 900px) {
      .detail-wrapper {
        padding-bottom: 120px; /* spacing for fixed bar */
      }
      .purchase-actions {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0;
        padding: 15px 20px;
        background: var(--color-bg-card-glass);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid var(--color-border);
        box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
        z-index: 100;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        flex-direction: row;
        align-items: center;
        padding-bottom: env(safe-area-inset-bottom, 15px);
      }
      .qty-control {
        flex: 0 0 auto;
        .qty-label { display: none; }
      }
      .btn-whatsapp-large {
        flex: 1;
        padding: 14px 16px;
        font-size: 1rem;
      }
    }

    .item-actions {
      display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;
      .item-subtotal { font-weight: 800; color: var(--color-text-primary); font-size: 1rem; }
      .btn-remove {
        background: transparent; border: none; color: var(--color-text-secondary); cursor: pointer;
        font-size: 0.8rem; &:hover { color: #ef4444; }
      }
    }

    /* Coupon section */
    .coupon-section {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .coupon-input {
      display: flex; gap: 8px;
      input {
        flex: 1; padding: 10px; background: var(--color-bg-card); border: 1px solid var(--color-border);
        color: var(--color-text-primary); border-radius: var(--radius-sm); outline: none; font-size: 0.9rem;
        &:focus { border-color: var(--color-accent); }
      }
      .btn-ghost { padding: 10px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; }
    }
    .coupon-feedback {
      margin-top: 8px; font-size: 0.8rem; padding: 8px 12px; border-radius: var(--radius-sm);
      display: flex; justify-content: space-between; align-items: center;
      .btn-remove-coupon { background: transparent; border: none; color: inherit; cursor: pointer; font-size: 1rem; }
    }

    .cart-summary {
      display: flex; flex-direction: column; gap: var(--space-sm);
      background: var(--color-bg-surface); border-radius: var(--radius-md);
      padding: var(--space-md); margin-bottom: var(--space-xl);
      border: 1px solid var(--color-border);
    }
    .summary-row {
      display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--color-text-secondary);
      &.discount { color: #25d366; }
      &.total {
        border-top: 1px solid var(--color-border); padding-top: 8px;
        font-weight: 800; color: var(--color-text-primary); font-size: 1.15rem;
      }
    }

    /* Checkout Details */
    .drawer-checkout {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-xl);
      h4 { font-size: 1.1rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: var(--space-md); }
    }
    .checkout-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-group {
      display: flex; flex-direction: column; gap: 4px;
      label { font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; }
      input, textarea {
        padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-sm); color: var(--color-text-primary); outline: none; font-size: 0.95rem;
        transition: border 0.2s;
        &:focus { border-color: var(--color-accent); }
      }
      textarea { resize: vertical; min-height: 80px; }
    }
    .btn-whatsapp {
      background: #25d366; color: #000; border: none; padding: 14px; border-radius: var(--radius-md);
      font-weight: 800; font-size: 1rem; cursor: pointer; text-align: center;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
      &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 211, 102, 0.3); }
    }
    .w-full { width: 100%; }
    .alert { padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; }
    .alert-success { background: rgba(37,211,102,0.1); color: #25d366; border: 1px solid rgba(37,211,102,0.2); }
    .alert-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }

    /* Available Offers widget */
    .available-offers-widget {
      margin: var(--space-md) 0;
      padding: var(--space-md);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      box-sizing: border-box;
      
      .widget-title {
        font-size: 0.85rem;
        font-weight: 800;
        color: #25d366;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
    .mini-tickets-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .mini-ticket {
      display: flex;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg-card);
      position: relative;
      overflow: visible;
      box-sizing: border-box;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: rgba(37, 211, 102, 0.4);
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(37, 211, 102, 0.1);
      }
    }
    .mini-tab {
      width: 70px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(37, 211, 102, 0.06);
      border-top-left-radius: var(--radius-md);
      border-bottom-left-radius: var(--radius-md);
      padding: var(--space-xs);
      box-sizing: border-box;
      
      .disc-val {
        font-size: 1.1rem;
        font-weight: 950;
        color: #25d366;
        line-height: 1;
        text-align: center;
      }
      .disc-lbl {
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--color-text-secondary);
        opacity: 0.7;
        margin-top: 2px;
      }
    }
    .mini-divider {
      position: relative;
      width: 2px;
      border-left: 2px dashed rgba(37, 211, 102, 0.2);
      margin: 8px 0;
      
      .notch {
        position: absolute;
        width: 12px;
        height: 12px;
        background: var(--color-bg-surface);
        border-radius: 50%;
        left: -7px;
        border: 1px solid rgba(37, 211, 102, 0.15);
        box-sizing: border-box;
        
        &.top-notch {
          top: -15px;
        }
        &.bottom-notch {
          bottom: -15px;
        }
      }
    }
    .mini-content {
      flex: 1;
      padding: var(--space-sm) var(--space-md);
      display: flex;
      flex-direction: column;
      gap: 4px;
      justify-content: center;
      box-sizing: border-box;
    }
    .code-and-icon {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      
      .coupon-code {
        font-size: 0.9rem;
        font-weight: 900;
        color: var(--color-text-primary);
        background: var(--color-bg-surface);
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        border: 1px dashed var(--color-border);
      }
      .copy-btn {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        border: 1px solid var(--color-border);
        background: var(--color-bg-surface);
        color: var(--color-text-primary);
        transition: all 0.2s ease;
        &:hover { background: var(--color-border); }
      }
    }
    .mini-ticket .expiry-text {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      margin: 0;
    }
    
    /* Theme customizations */
    .theme-classic-green {
      --color-accent: #25d366;
      --color-accent-glow: rgba(37, 211, 102, 0.3);
      .price, .btn-view, .btn-toggle-desc { color: #25d366; }
    }
    .theme-ocean-blue {
      --color-accent: #00b4d8;
      --color-accent-glow: rgba(0, 180, 216, 0.3);
      .price, .btn-view, .btn-toggle-desc { color: #00b4d8; }
      .btn-whatsapp-large, .whatsapp-float-btn { background: #00b4d8; box-shadow: 0 10px 25px rgba(0, 180, 216, 0.25); }
    }
    .theme-obsidian-dark {
      --color-accent: #e5e5e5;
      --color-accent-glow: rgba(229, 229, 229, 0.3);
      .price, .btn-view, .btn-toggle-desc { color: #e5e5e5; }
      .btn-whatsapp-large, .whatsapp-float-btn { background: #e5e5e5; box-shadow: 0 10px 25px rgba(229, 229, 229, 0.25); }
    }
    .theme-warm-amber {
      --color-accent: #ff9f1c;
      --color-accent-glow: rgba(255, 159, 28, 0.3);
      .price, .btn-view, .btn-toggle-desc { color: #ff9f1c; }
      .btn-whatsapp-large, .whatsapp-float-btn { background: #ff9f1c; box-shadow: 0 10px 25px rgba(255, 159, 28, 0.25); }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  slug = '';
  productId = '';
  loading = true;
  notFound = false;

  business: any = null;
  product: ProductItem | null = null;
  activeImage = '';

  reviews: ReviewRecord[] = [];
  newReview: ReviewRecord = { name: '', rating: 5, comment: '' };
  submittingReview = false;
  reviewSuccess = false;
  reviewError = '';

  // Shopping Cart & Wishlist state
  cart: any = { items: [], totalAmount: 0 };
  cartCount = 0;
  wishlistCount = 0;
  showCartDropdown = false;
  showCartDrawer = false;

  // Selected quantity to buy
  buyQuantity = 1;

  // Description truncation
  descExpanded = false;

  // Hover zoom properties
  zoomActive = false;
  zoomOrigin = 'center center';
  @ViewChild('zoomContainer') zoomContainer!: ElementRef;

  // Lightbox overlay variables
  showLightbox = false;
  lightboxIndex = 0;

  // Coupon variables
  couponCode = '';
  appliedCoupon: any = null;
  couponError = '';
  publicCoupons: any[] = [];
  copiedCouponCode: string | null = null;

  // Checkout details
  checkoutName = '';
  checkoutPhone = '';
  checkoutNotes = '';
  submittingCheckout = false;
  checkoutError = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private http: HttpClient,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      this.productId = params.get('productId') || '';
      if (this.slug && this.productId) {
        this.fetchStorefrontAndProduct();
        this.cartService.loadCart(this.slug);
        this.wishlistService.loadWishlist(this.slug);

        // Subscribe to cart changes
        this.cartService.cart$.subscribe(c => {
          this.cart = c;
          this.cartCount = c.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        });

        // Subscribe to wishlist changes
        this.wishlistService.wishlist$.subscribe(w => {
          this.wishlistCount = w.length;
        });
      } else {
        this.loading = false;
        this.notFound = true;
      }
    });
  }

  fetchStorefrontAndProduct() {
    this.api.get<{ success: boolean; business: any }>(`business/store/${this.slug}`).subscribe({
      next: (res) => {
        if (res.success && res.business) {
          this.business = res.business;
          this.fetchProductDetails(res.business._id);
        } else {
          this.loading = false;
          this.notFound = true;
        }
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      }
    });
  }

  fetchProductDetails(businessId: string) {
    this.api.get<{ success: boolean; product: ProductItem }>(`products/public/product/${this.productId}`).subscribe({
      next: (res) => {
        if (res.success && res.product) {
          this.product = res.product;
          this.activeImage = res.product.images[0] || '';
          this.fetchReviews();
          this.fetchPublicCoupons();
        } else {
          this.loading = false;
          this.notFound = true;
        }
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      }
    });
  }

  fetchReviews() {
    this.api.get<{ success: boolean; reviews: ReviewRecord[] }>(`reviews/product/${this.productId}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.reviews;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setActiveImage(img: string) {
    this.activeImage = img;
  }

  getStarDisplay(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getAverageStars(): string {
    if (this.reviews.length === 0) return '0.0';
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  getAverageStarsRound(): number {
    return Math.round(parseFloat(this.getAverageStars()));
  }

  getRatingCount(rating: number): number {
    return this.reviews.filter(r => r.rating === rating).length;
  }

  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    const count = this.getRatingCount(rating);
    return Math.round((count / this.reviews.length) * 100);
  }

  setRating(rating: number) {
    this.newReview.rating = rating;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  }

  onSubmitReview() {
    if (!this.newReview.name || !this.newReview.comment) {
      this.reviewError = 'Please fill in your name and comment details.';
      return;
    }
    this.reviewError = '';
    this.reviewSuccess = false;
    this.submittingReview = true;

    this.api.post<{ success: boolean; review: ReviewRecord }>(`reviews/product/${this.productId}`, this.newReview).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviewSuccess = true;
          this.newReview = { name: '', rating: 5, comment: '' };
          this.fetchReviews();
        }
        this.submittingReview = false;
      },
      error: () => {
        this.reviewError = 'Failed to submit review. Try again.';
        this.submittingReview = false;
      }
    });
  }

  getThemeClass(): string {
    if (!this.business?.layoutConfig?.theme) return 'classic-green';
    return this.business.layoutConfig.theme.toLowerCase().replace(/\s+/g, '-');
  }

  getTemplateClass(): string {
    return this.business?.layoutConfig?.template || 'Shop';
  }

  getTemplateCTA(): string {
    const temp = this.business?.layoutConfig?.template || 'Shop';
    switch (temp) {
      case 'Salon': return '💅 Book Appointment';
      case 'Restaurant': return '🍔 Order Food';
      case 'Freelancer': return '💼 Hire Me';
      default: return '🛍️ Shop Now';
    }
  }

  // Description formatted text getter
  getDescriptionText(): string {
    if (!this.product) return '';
    const desc = this.product.description || 'No description available for this product.';
    if (desc.length <= 250 || this.descExpanded) return desc;
    return desc.substring(0, 250) + '...';
  }

  // Hover zoom magnifier details
  onZoom(event: MouseEvent) {
    if (!this.zoomContainer) return;
    this.zoomActive = true;
    const { left, top, width, height } = this.zoomContainer.nativeElement.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;
    this.zoomOrigin = `${x}% ${y}%`;
  }

  onZoomLeave() {
    this.zoomActive = false;
    this.zoomOrigin = 'center center';
  }

  // Lightbox overlay functions
  openLightbox() {
    if (this.product) {
      this.lightboxIndex = this.product.images.indexOf(this.activeImage);
      this.showLightbox = true;
    }
  }

  closeLightbox() {
    this.showLightbox = false;
  }

  prevLightboxImg(event: Event) {
    event.stopPropagation();
    if (!this.product) return;
    const len = this.product.images.length;
    this.lightboxIndex = (this.lightboxIndex - 1 + len) % len;
    this.activeImage = this.product.images[this.lightboxIndex];
  }

  nextLightboxImg(event: Event) {
    event.stopPropagation();
    if (!this.product) return;
    const len = this.product.images.length;
    this.lightboxIndex = (this.lightboxIndex + 1) % len;
    this.activeImage = this.product.images[this.lightboxIndex];
  }

  // Wishlist functions
  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  toggleWishlist(productId: string) {
    if (this.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(this.slug, productId);
    } else {
      this.wishlistService.addToWishlist(this.slug, productId);
    }
  }

  // Buy Quantity Controls
  incrementQty() {
    if (this.product && this.buyQuantity < this.product.stock) {
      this.buyQuantity++;
    }
  }

  decrementQty() {
    if (this.buyQuantity > 1) {
      this.buyQuantity--;
    }
  }

  // Cart Operations
  toggleCartDrawer() {
    this.showCartDrawer = !this.showCartDrawer;
  }

  addToCart(productId: string) {
    if (!this.product || this.product.stock <= 0) {
      this.toastService.error('Product is out of stock', 'Unavailable');
      return;
    }

    this.cartService.addToCart(this.slug, productId, this.buyQuantity).subscribe({
      next: () => {
        this.showCartDrawer = true; // Open drawer immediately
        this.buyQuantity = 1; // Reset selection quantity
        this.toastService.success(`Added to cart`, 'Cart Updated');
      },
      error: (err) => {
        this.toastService.error(err.message || 'Failed to add item to cart', 'Error');
      }
    });
  }

  updateCartQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(this.slug, productId, quantity).subscribe({
      error: (err) => alert(err.message || 'Failed to update item quantity')
    });
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(this.slug, productId);
    this.toastService.info('Item removed from cart', 'Cart Updated');
  }

  // Coupon calculations
  applyCouponCode() {
    this.couponError = '';
    const phoneParam = this.checkoutPhone ? `?phone=${encodeURIComponent(this.checkoutPhone)}` : '';
    this.http.get<any>(`${environment.apiUrl}/coupons/public/${this.slug}/validate/${this.couponCode}${phoneParam}`).subscribe({
      next: (res) => {
        if (res.success && res.coupon) {
          this.appliedCoupon = res.coupon;
          // Track coupon application event
          if (this.business) {
            this.api.post('analytics/track', { businessId: this.business._id, event: 'coupon_apply', couponCode: res.coupon.code }).subscribe();
          }
        } else {
          this.couponError = res.message || 'Invalid coupon code';
        }
      },
      error: (err) => {
        this.couponError = err.error?.message || 'Failed to apply coupon';
      }
    });
  }

  fetchPublicCoupons() {
    this.http.get<any>(`${environment.apiUrl}/coupons/public-store/product/${this.productId}`).subscribe({
      next: (res) => {
        if (res.success && res.coupons) {
          this.publicCoupons = res.coupons;
          // Track coupon views in analytics
          this.publicCoupons.forEach(c => {
            if (this.business) {
              this.api.post('analytics/track', { businessId: this.business._id, event: 'coupon_view', couponCode: c.code }).subscribe();
            }
          });
        }
      }
    });
  }

  copyCoupon(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCouponCode = code;
      this.toastService.success(`Coupon code "${code}" copied to clipboard!`, 'Copied!');
      if (this.business) {
        this.api.post('analytics/track', { businessId: this.business._id, event: 'coupon_copy', couponCode: code }).subscribe();
      }
      setTimeout(() => this.copiedCouponCode = null, 3000);
    });
  }

  applyQuickCoupon(code: string) {
    this.couponCode = code;
    this.applyCouponCode();
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponError = '';
  }

  getDiscountAmount(): number {
    if (!this.appliedCoupon || !this.cart) return 0;
    if (this.appliedCoupon.discountType === 'percentage') {
      return Math.round((this.cart.totalAmount * this.appliedCoupon.discountValue) / 100);
    } else {
      return Math.min(this.appliedCoupon.discountValue, this.cart.totalAmount);
    }
  }

  getTotalAmount(): number {
    if (!this.cart) return 0;
    return Math.max(0, this.cart.totalAmount - this.getDiscountAmount());
  }

  // Checkout WhatsApp placement
  checkoutCart() {
    if (!this.checkoutName || !this.checkoutPhone) {
      this.checkoutError = 'Please fill in required name and phone fields.';
      return;
    }

    if (!this.cart || this.cart.items.length === 0 || !this.business) return;

    this.checkoutError = '';
    this.submittingCheckout = true;

    // Prepare order payload
    const orderPayload = {
      business: this.business._id,
      customerName: this.checkoutName,
      customerPhone: this.checkoutPhone,
      customerWhatsapp: this.checkoutPhone,
      items: this.cart.items.map((item: any) => ({
        product: item.product?._id || item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: this.getTotalAmount(),
      couponCode: this.appliedCoupon ? this.appliedCoupon.code : '',
      discountAmount: this.getDiscountAmount(),
      cartId: this.cartService.getSessionId(),
      notes: this.checkoutNotes,
      status: 'NEW'
    };

    // Save order in database
    this.http.post<any>(`${environment.apiUrl}/orders`, orderPayload).subscribe({
      next: (res) => {
        if (res.success && res.order) {
          // Track WhatsApp checkout click event in analytics
          this.api.post('analytics/track', { businessId: this.business?._id, event: 'whatsapp_click' }).subscribe();

          // Construct order details text format
          let productsText = '';
          this.cart.items.forEach((item: any, idx: number) => {
            productsText += `${idx + 1}. ${item.name}\n   Qty: ${item.quantity}\n   Price: ₹${item.price}\n\n`;
          });

          let breakdownText = `Subtotal: ₹${this.cart.totalAmount}\n`;
          if (this.appliedCoupon) {
            breakdownText += `Discount (Code: ${this.appliedCoupon.code}): -₹${this.getDiscountAmount()}\n`;
          }
          breakdownText += `Total Amount: ₹${this.getTotalAmount()}`;

          // Tracking URL
          const trackingUrl = `https://whatsstore.web.app/store/${this.slug}/track/${res.order._id}`;

          const text = `Hello,\n\nI would like to place an order.\n\nProducts:\n${productsText}${breakdownText}\n\nCustomer Name: ${this.checkoutName}\nPhone: ${this.checkoutPhone}\nNotes: ${this.checkoutNotes || 'None'}\n\nTrack Order status here: ${trackingUrl}\n\nPlease confirm availability.`;

          const whatsappUrl = `https://wa.me/${this.business?.whatsappNumber}?text=${encodeURIComponent(text)}`;

          // Open WhatsApp link
          window.open(whatsappUrl, '_blank');

          // Reset cart & checkout state
          this.cartService.clearCart(this.slug).subscribe();
          this.showCartDrawer = false;
          this.submittingCheckout = false;
          this.checkoutName = '';
          this.checkoutPhone = '';
          this.checkoutNotes = '';
          this.removeCoupon();

          alert('Order placed successfully! Connecting to WhatsApp...');
        }
      },
      error: (err) => {
        this.checkoutError = err.error?.message || 'Failed to place order. Try again.';
        this.submittingCheckout = false;
      }
    });
  }
}
