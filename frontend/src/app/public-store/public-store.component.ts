import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../shared/services/cart.service';
import { WishlistService } from '../shared/services/wishlist.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { ThemeToggleComponent } from '../shared/components/theme-toggle.component';

interface BusinessProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  logoUrl?: string;
  address?: string;
  category: string;
  websiteSlug: string;
  isPublished: boolean;
  layoutConfig?: {
    template: string;
    theme: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl: string;
    aboutTitle: string;
    aboutText: string;
    ctaTitle: string;
  };
}

interface ProductItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isAvailable: boolean;
  featured: boolean;
}

@Component({
  selector: 'app-public-store',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ThemeToggleComponent],
  template: `
    <div *ngIf="loading" class="loading-state">
      <span class="spinner">🏪</span> Loading storefront...
    </div>

    <div *ngIf="!loading && notFound" class="not-found-state">
      <div class="empty-icon">🏪</div>
      <h2>Storefront Not Found</h2>
      <p>The storefront slug you requested does not exist or has not been published yet.</p>
      <a routerLink="/" class="btn btn-primary">Return to WhatsStore</a>
    </div>

    <!-- Active Storefront -->
    <div *ngIf="!loading && !notFound && business" [className]="'storefront-wrapper theme-' + getThemeClass() + ' template-' + getTemplateClass()">
      
      <!-- Sticky Premium Glass Header -->
      <header class="store-header glass-header">
        <div class="header-container">
          <a [routerLink]="['/store', slug]" class="store-brand">
            <img class="store-mini-logo" *ngIf="business.logoUrl" [src]="business.logoUrl" alt="Logo">
            <span class="store-title-text">{{ business.name }}</span>
          </a>
          
          <nav class="store-nav">
            <a href="#products-section" class="nav-link-btn">Products</a>
            <a [routerLink]="['/store', slug, 'wishlist']" class="nav-link-btn wishlist-link">
              ❤️ Wishlist <span class="nav-badge" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
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

      <!-- Sticky Float WhatsApp Button -->
      <a [href]="getWhatsAppLink()" target="_blank" class="whatsapp-float-btn" title="Chat with us!">
        💬
      </a>

      <!-- Hero Section -->
      <section class="store-hero" [style.background-image]="business.layoutConfig?.heroImageUrl ? 'url(' + business.layoutConfig?.heroImageUrl + ')' : ''">
        <div class="hero-overlay"></div>
        <div class="hero-container">
          <div class="hero-logo" *ngIf="business.logoUrl">
            <img [src]="business.logoUrl" [alt]="business.name">
          </div>
          <div class="hero-content">
            <span class="category-badge">{{ business.category }}</span>
            <h1>{{ business.layoutConfig?.heroTitle || 'Welcome to ' + business.name }}</h1>
            <p>{{ business.layoutConfig?.heroSubtitle || 'Order our high quality products directly via WhatsApp!' }}</p>
            <a href="#products-section" class="btn btn-primary hero-cta-btn">{{ getTemplateCTA() }}</a>
          </div>
        </div>
      </section>

      <!-- Special Offers & Coupons Section -->
      <section class="coupons-section" *ngIf="publicCoupons.length > 0">
        <div class="section-container">
          <h2 class="section-title">🎉 Special Offers & Coupons</h2>
          <p class="section-subtitle">Select or copy any of our active offers to get discounts on your order.</p>
          
          <div class="offers-container">
            @for (cp of publicCoupons; track cp._id) {
              <div class="offer-ticket glass-card animate-fade-in-up">
                <!-- Left Ticket Tab -->
                <div class="offer-tab">
                  <span class="discount-value">
                    {{ cp.discountType === 'percentage' ? cp.discountValue + '%' : '₹' + cp.discountValue }}
                  </span>
                  <span class="discount-label">OFF</span>
                </div>
                
                <!-- Ticket Divider line with Top and Bottom Circular indents -->
                <div class="offer-divider">
                  <div class="notch top-notch"></div>
                  <div class="notch bottom-notch"></div>
                </div>
                
                <!-- Right Ticket Content -->
                <div class="offer-content">
                  <div class="offer-header">
                    <span class="coupon-code">{{ cp.code }}</span>
                    <span class="ticket-icon">🎟️</span>
                  </div>
                  <p class="offer-description">Claim this offer by entering or selecting the code before checking out.</p>
                  <div class="offer-footer">
                    <span class="expiry-text">📅 Valid: {{ cp.expiryDate ? (cp.expiryDate | date:'mediumDate') : 'Limited Time' }}</span>
                    <button (click)="copyCoupon(cp.code)" class="btn btn-sm copy-btn" [style.background]="copiedCouponCode === cp.code ? '#25d366' : 'rgba(255,255,255,0.05)'" [style.color]="copiedCouponCode === cp.code ? '#000' : '#fff'">
                      {{ copiedCouponCode === cp.code ? '✓ Copied' : '📋 Copy' }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Products Listing Section -->
      <section class="products-section" id="products-section">
        <div class="section-container">
          <h2 class="section-title">Our Collections</h2>
          
          <!-- Category Filter slider -->
          <div class="category-filters" *ngIf="categories.length > 1">
            <button (click)="filterCategory('all')" [class.active]="selectedCategory === 'all'" class="filter-pill">
              All Items
            </button>
            @for (cat of categories; track cat) {
              <button (click)="filterCategory(cat)" [class.active]="selectedCategory === cat" class="filter-pill">
                {{ cat }}
              </button>
            }
          </div>

          <!-- Empty Catalog -->
          <div *ngIf="filteredProducts.length === 0" class="empty-catalog card">
            <div class="empty-icon">📦</div>
            <h3>No products available</h3>
            <p>Check back later! We are updating our product list.</p>
          </div>

          <!-- Products Card Grid -->
          <div *ngIf="filteredProducts.length > 0" class="products-grid">
            @for (prod of filteredProducts; track prod._id) {
              <div class="product-card card">
                <a [routerLink]="['/store', slug, 'product', prod._id]" (click)="trackProductClick(prod._id)" class="card-clickable-area">
                  <div class="image-box">
                    <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'" 
                         [alt]="prod.title" loading="lazy">
                    <span *ngIf="prod.featured" class="card-badge featured-badge">⭐ Featured</span>
                    <span *ngIf="prod.stock === 0" class="card-badge sold-out-badge">Sold Out</span>
                    
                    <!-- Wishlist Heart Overlay -->
                    <button class="card-wishlist-btn" [class.in-wishlist]="isInWishlist(prod._id)" (click)="toggleWishlist($event, prod._id)">
                      ❤️
                    </button>
                  </div>
                  <div class="card-body">
                    <span class="card-category">{{ prod.category }}</span>
                    <h3 class="card-title">{{ prod.title }}</h3>
                  </div>
                </a>
                
                <div class="card-footer">
                  <span class="price">₹{{ prod.price }}</span>
                  <div class="card-actions">
                    <button class="btn btn-sm btn-whatsapp-add" (click)="addToCart($event, prod)" [disabled]="prod.stock === 0">
                      {{ prod.stock > 0 ? '🛒 Add to Cart' : 'Sold Out' }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

        </div>
      </section>

      <!-- About Section -->
      <section class="about-section">
        <div class="section-container">
          <div class="about-grid">
            <div class="about-logo" *ngIf="business.logoUrl">
              <img [src]="business.logoUrl" [alt]="business.name">
            </div>
            <div class="about-content">
              <h2>{{ business.layoutConfig?.aboutTitle || 'About Us' }}</h2>
              <p>{{ business.layoutConfig?.aboutText || 'We are a small business dedicated to offering the best products directly through personal chats.' }}</p>
              <div class="about-meta" *ngIf="business.address">
                <strong>📍 Store Address:</strong> {{ business.address }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Footer Section -->
      <section class="cta-section">
        <div class="section-container text-center">
          <h2>{{ business.layoutConfig?.ctaTitle || 'Have questions? Chat with us!' }}</h2>
          <p>We'll help answer size queries, delivery durations, or customizations instantly.</p>
          <a [href]="getWhatsAppLink()" target="_blank" class="btn btn-whatsapp-large">
            🟢 Message via WhatsApp
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="public-footer">
        <div class="section-container text-center">
          <p>&copy; 2026 {{ business.name }}. All rights reserved.</p>
          <p class="branding">Powered by <a routerLink="/">WhatsStore</a></p>
        </div>
      </footer>

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
                        <button class="qty-btn" (click)="updateQuantity(item.product?._id || item.product, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
                        <span class="qty-val">{{ item.quantity }}</span>
                        <button class="qty-btn" (click)="updateQuantity(item.product?._id || item.product, item.quantity + 1)" [disabled]="item.quantity >= (item.product?.stock || 999)">+</button>
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
                      <button (click)="applyQuickCoupon(cp.code)" class="btn btn-sm coupon-quick-btn">
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
    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--space-md);
    }
    .not-found-state h2 {
      margin-bottom: var(--space-sm);
      font-weight: 800;
      color: var(--color-text-primary);
    }
    .not-found-state p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-xl);
      max-width: 400px;
    }
    
    /* Device / Theme base wrapper */
    .storefront-wrapper {
      min-height: 100vh;
      background: var(--color-bg);
      color: var(--color-text-primary);
      position: relative;
    }
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-lg);
    }
    .text-center { text-align: center; }

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
      transition: all 0.3s;
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
      &:hover { background: var(--color-accent); color: #000; border-color: var(--color-accent); }
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
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      z-index: 200;
      box-shadow: var(--shadow-md);
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

    /* Floating WhatsApp Button */
    .whatsapp-float-btn {
      position: fixed;
      bottom: var(--space-lg);
      right: var(--space-lg);
      width: 60px;
      height: 60px;
      background: #25d366;
      border-radius: 50%;
      box-shadow: 0 8px 30px rgba(37, 211, 102, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      text-decoration: none;
      z-index: 99;
      transition: all var(--transition-normal);
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:hover {
        transform: scale(1.1) translateY(-4px);
        box-shadow: 0 12px 40px rgba(37, 211, 102, 0.6);
      }
    }

    /* Hero Banner styles */
    .store-hero {
      height: 500px;
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background-color: var(--color-bg-card);
      padding-top: 70px;
    }
    .hero-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6);
      z-index: 1;
    }
    .hero-container {
      position: relative;
      z-index: 2;
      max-width: 800px;
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
    }
    .hero-logo img {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      border: 3px solid var(--color-accent);
      object-fit: cover;
      box-shadow: 0 0 25px rgba(37, 211, 102, 0.35);
    }
    .hero-content {
      h1 {
        font-size: clamp(2.2rem, 6vw, 4rem);
        font-weight: 950;
        color: #fff;
        line-height: 1.15;
        letter-spacing: -0.03em;
        margin-top: var(--space-sm);
      }
      p {
        font-size: clamp(1.05rem, 2.5vw, 1.25rem);
        color: rgba(255,255,255,0.85);
        max-width: 600px;
        margin: var(--space-md) auto var(--space-xl);
        line-height: 1.6;
      }
    }
    
    /* Coupons Section & Ticket Card styling */
    .coupons-section {
      padding: var(--space-2xl) 0;
      background: linear-gradient(180deg, var(--color-accent-dim) 0%, transparent 100%);
      border-bottom: 1px solid var(--color-border);
    }
    .section-subtitle {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-xl);
      margin-top: -10px;
      font-size: 0.95rem;
    }
    .offers-container {
      display: flex;
      gap: var(--space-lg);
      overflow-x: auto;
      padding-bottom: var(--space-md);
      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-track {
        background: var(--color-bg-surface);
        border-radius: var(--radius-pill);
      }
      &::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: var(--radius-pill);
      }
    }
    .offer-ticket {
      min-width: 320px;
      max-width: 360px;
      display: flex;
      border: 1px solid rgba(37, 211, 102, 0.20);
      border-radius: var(--radius-lg);
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: visible;
      box-sizing: border-box;
      transition: all var(--transition-normal);
      
      &:hover {
        border-color: var(--color-accent);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px var(--color-accent-glow);
      }
    }
    .offer-tab {
      width: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(37, 211, 102, 0.03) 100%);
      border-top-left-radius: var(--radius-lg);
      border-bottom-left-radius: var(--radius-lg);
      padding: var(--space-md);
      box-sizing: border-box;
      
      .discount-value {
        font-size: 1.8rem;
        font-weight: 950;
        color: var(--color-accent);
        text-shadow: 0 0 10px var(--color-accent-glow);
        line-height: 1;
        text-align: center;
      }
      .discount-label {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: 0.1em;
        margin-top: 4px;
        opacity: 0.8;
      }
    }
    .offer-divider {
      position: relative;
      width: 2px;
      border-left: 2px dashed rgba(37, 211, 102, 0.3);
      margin: 10px 0;
      
      .notch {
        position: absolute;
        width: 16px;
        height: 16px;
        background: var(--color-bg);
        border-radius: 50%;
        left: -9px;
        border: 1px solid rgba(37, 211, 102, 0.2);
        box-sizing: border-box;
        
        &.top-notch {
          top: -19px;
        }
        &.bottom-notch {
          bottom: -19px;
        }
      }
    }
    .offer-content {
      flex: 1;
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      box-sizing: border-box;
      justify-content: space-between;
    }
    .offer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .coupon-code {
        font-size: 1.05rem;
        font-weight: 900;
        color: var(--color-text-primary);
        letter-spacing: 0.05em;
        background: var(--color-bg-surface);
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        border: 1px dashed var(--color-border-hover);
      }
      .ticket-icon {
        font-size: 1.15rem;
        opacity: 0.8;
      }
    }
    .offer-description {
      font-size: 0.82rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.4;
      min-height: 36px;
      display: flex;
      align-items: center;
    }
    .offer-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
      margin-top: 4px;
      
      .expiry-text {
        font-size: 0.72rem;
        color: var(--color-text-muted);
      }
      .copy-btn {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        border: 1px solid var(--color-border);
        background: var(--color-bg-surface);
        color: var(--color-text-secondary);
        transition: all var(--transition-normal);
        &:hover { opacity: 0.9; transform: translateY(-1px); }
      }
    }
    
    /* Product Section */
    .products-section {
      padding: var(--space-3xl) 0;
    }
    .section-title {
      font-size: 2rem;
      font-weight: 900;
      margin-bottom: var(--space-xl);
      letter-spacing: -0.02em;
      color: var(--color-text-primary);
    }
    .category-filters {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: var(--space-md);
      margin-bottom: var(--space-2xl);
      &::-webkit-scrollbar { height: 4px; }
    }
    .filter-pill {
      padding: 10px 22px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      border-radius: var(--radius-pill);
      cursor: pointer;
      font-weight: 700;
      font-size: 0.9rem;
      transition: all var(--transition-normal);
      white-space: nowrap;
      &:hover {
        background: var(--color-bg-card);
        color: var(--color-text-primary);
      }
      &.active {
        background: var(--color-accent);
        color: var(--color-on-accent);
        border-color: var(--color-accent);
        box-shadow: 0 4px 15px var(--color-accent-glow);
      }
    }
    
    /* Grid system */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-xl);
    }
    .product-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
      border: 1px solid var(--color-border);
      background: var(--color-bg-card);
      transition: all var(--transition-normal);
      border-radius: var(--radius-lg);
      &:hover {
        border-color: var(--color-accent);
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        .image-box img {
          transform: scale(1.04);
        }
      }
    }
    .card-clickable-area {
      text-decoration: none;
      color: inherit;
    }
    .image-box {
      height: 220px;
      position: relative;
      overflow: hidden;
      background: var(--color-bg-surface);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-normal);
      }
    }
    .card-wishlist-btn {
      position: absolute;
      top: 10px; left: 10px;
      width: 36px; height: 36px;
      background: rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
      filter: grayscale(100%);
      &:hover { filter: grayscale(0%); transform: scale(1.1); }
      &.in-wishlist { filter: grayscale(0%); background: rgba(0,0,0,0.8); }
    }
    .sold-out-badge {
      background: var(--color-danger);
      color: #fff;
      position: absolute;
      top: 10px; right: 10px;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
    }
    .card-body {
      padding: var(--space-lg) var(--space-lg) 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card-category {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .card-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--space-lg) var(--space-lg);
      margin-top: var(--space-md);
    }
    .price {
      font-size: 1.35rem;
      font-weight: 900;
      color: var(--color-accent);
      font-family: var(--font-heading);
    }
    .btn-whatsapp-add {
      background: var(--color-accent);
      color: var(--color-on-accent);
      border: none;
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all var(--transition-normal);
      &:hover { opacity: 0.9; transform: translateY(-1px); }
      &:disabled { background: var(--color-bg-surface); color: var(--color-text-muted); cursor: not-allowed; }
    }
    .empty-catalog {
      text-align: center;
      padding: var(--space-3xl);
      h3 { font-weight: 800; color: var(--color-text-primary); }
      p { color: var(--color-text-secondary); }
    }
 
    /* About Section */
    .about-section {
      padding: var(--space-3xl) 0;
      background: var(--color-bg-glass);
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      backdrop-filter: blur(8px);
    }
    .about-grid {
      display: flex;
      align-items: center;
      gap: var(--space-2xl);
      flex-wrap: wrap;
    }
    .about-logo img {
      width: 150px;
      height: 150px;
      border-radius: var(--radius-lg);
      object-fit: cover;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-md);
    }
    .about-content {
      flex: 1;
      min-width: 300px;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      h2 {
        font-size: 2rem;
        font-weight: 900;
        color: var(--color-text-primary);
      }
      p {
        font-size: 1rem;
        color: var(--color-text-secondary);
        line-height: 1.7;
      }
    }
    .about-meta {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      background: var(--color-bg-surface);
      padding: 12px 18px;
      border-radius: var(--radius-md);
      display: inline-block;
      border: 1px solid var(--color-border);
      strong { color: var(--color-text-primary); }
    }
 
    /* CTA Banner Section */
    .cta-section {
      padding: var(--space-3xl) 0;
      background: linear-gradient(180deg, transparent, var(--color-accent-dim));
      h2 {
        font-size: clamp(1.8rem, 4vw, 2.5rem);
        margin-bottom: var(--space-sm);
        font-weight: 900;
        color: var(--color-text-primary);
      }
      p {
        color: var(--color-text-secondary);
        margin-bottom: var(--space-xl);
      }
    }
    .btn-whatsapp-large {
      background: var(--color-accent);
      color: var(--color-on-accent);
      border: none;
      padding: 16px 40px;
      border-radius: var(--radius-md);
      font-size: 1.1rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
      box-shadow: 0 10px 25px var(--color-accent-glow);
      transition: all var(--transition-normal);
      &:hover {
        background: var(--color-accent-hover);
        transform: translateY(-3px);
        box-shadow: 0 15px 35px var(--color-accent-glow);
        opacity: 1;
      }
    }
 
    /* Public Footer styles */
    .public-footer {
      padding: var(--space-2xl) 0;
      background: var(--color-bg-card);
      border-top: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 0.85rem;
      p {
        color: var(--color-text-muted);
      }
      .branding {
        margin-top: 6px;
        font-size: 0.75rem;
        a {
          color: var(--color-text-secondary);
          font-weight: 700;
          text-decoration: none;
          &:hover { color: var(--color-text-primary); }
        }
      }
    }
 
    /* Theme customizations */
    .theme-classic-green {
      --color-accent: #25d366;
      --color-accent-glow: rgba(37, 211, 102, 0.3);
      .filter-pill.active { background: #25d366; color: #000; border-color: #25d366; }
      .price, .btn-view { color: #25d366; }
    }
    .theme-ocean-blue {
      --color-accent: #00b4d8;
      --color-accent-glow: rgba(0, 180, 216, 0.3);
      .filter-pill.active { background: #00b4d8; color: #000; border-color: #00b4d8; }
      .price, .btn-view { color: #00b4d8; }
      .btn-whatsapp-large, .whatsapp-float-btn { background: #00b4d8; box-shadow: 0 10px 25px rgba(0, 180, 216, 0.25); }
    }
    .theme-obsidian-dark {
      --color-accent: #e5e5e5;
      --color-accent-glow: rgba(229, 229, 229, 0.3);
      .filter-pill.active { background: #e5e5e5; color: #000; border-color: #e5e5e5; }
      .price, .btn-view { color: #e5e5e5; }
      .btn-whatsapp-large, .whatsapp-float-btn { background: #e5e5e5; box-shadow: 0 10px 25px rgba(229, 229, 229, 0.25); }
    }
    .theme-warm-amber {
      --color-accent: #ff9f1c;
      --color-accent-glow: rgba(255, 159, 28, 0.3);
      .filter-pill.active { background: #ff9f1c; color: #000; border-color: #ff9f1c; }
      .price, .btn-view { color: #ff9f1c; }
      .btn-whatsapp-large, .whatsapp-float-btn { background: #ff9f1c; box-shadow: 0 10px 25px rgba(255, 159, 28, 0.25); }
    }
 
    /* Template customizations */
    .template-Salon {
      font-family: Georgia, serif;
      h1, h2, h3, .section-title { font-family: Georgia, serif; }
      .store-hero { background-color: #2b1f26; }
    }
    .template-Restaurant {
      font-family: 'Outfit', sans-serif;
      h1, h2, h3, .section-title { font-family: 'Outfit', sans-serif; font-weight: 800; }
      .store-hero { background-color: #3d1414; }
    }
    .template-Freelancer {
      font-family: monospace;
      h1, h2, h3, .section-title { font-family: monospace; }
      .store-hero { background-color: #1a1a1a; }
    }

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
    
    /* Qty Selector */
    .qty-selector {
      display: flex; align-items: center; gap: 4px; margin-top: 4px;
      background: var(--color-bg-surface); border: 1px solid var(--color-border);
      border-radius: 4px; width: fit-content; overflow: hidden;
    }
    .qty-btn {
      background: transparent; border: none; color: var(--color-text-primary); width: 26px; height: 26px;
      cursor: pointer; font-weight: 800; font-size: 0.95rem;
      &:hover:not([disabled]) { background: var(--color-bg-card); }
      &:disabled { color: var(--color-text-muted); cursor: not-allowed; }
    }
    .qty-val { font-size: 0.9rem; font-weight: 700; width: 24px; text-align: center; color: var(--color-text-primary); }

    .item-actions {
      display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;
      .item-subtotal { font-weight: 800; color: var(--color-text-primary); font-size: 1rem; }
      .btn-remove {
        background: transparent; border: none; color: var(--color-text-secondary); cursor: pointer;
        font-size: 0.8rem; &:hover { color: var(--color-danger); }
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
        flex: 1; padding: 10px; background: var(--color-bg); border: 1px solid var(--color-border);
        color: var(--color-text-primary); border-radius: var(--radius-sm); outline: none; font-size: 0.9rem;
        &:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-glow); }
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
      &.discount { color: var(--color-accent); }
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
    .checkout-form {
      display: flex; flex-direction: column; gap: var(--space-md);
    }
    .form-group {
      display: flex; flex-direction: column; gap: 4px;
      label { font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; }
      input, textarea {
        padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-sm); color: var(--color-text-primary); outline: none; font-size: 0.95rem;
        transition: border var(--transition-normal);
        &:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-glow); }
      }
      textarea { resize: vertical; min-height: 80px; }
    }
    .btn-whatsapp {
      background: var(--color-accent); color: var(--color-on-accent); border: none; padding: 14px; border-radius: var(--radius-md);
      font-weight: 800; font-size: 1rem; cursor: pointer; text-align: center;
      box-shadow: 0 4px 15px var(--color-accent-glow);
      &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px var(--color-accent-glow); }
    }
    .coupon-quick-btn {
      background: var(--color-accent-dim) !important;
      border: 1px dashed var(--color-accent) !important;
      color: var(--color-accent) !important;
      font-size: 0.75rem !important;
      padding: 6px 12px !important;
      border-radius: var(--radius-sm) !important;
      font-weight: 700 !important;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      &:hover { opacity: 0.85; transform: translateY(-1px); }
    }
    .w-full { width: 100%; }
    .alert { padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; }
    .alert-success { background: rgba(37,211,102,0.1); color: #25d366; border: 1px solid rgba(37,211,102,0.2); }
    .alert-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
  `]
})
export class PublicStoreComponent implements OnInit {
  slug = '';
  loading = true;
  notFound = false;
  
  business: BusinessProfile | null = null;
  products: ProductItem[] = [];
  categories: string[] = [];
  filteredProducts: ProductItem[] = [];
  selectedCategory = 'all';

  // Shopping Cart & Wishlist state variables
  cart: any = { items: [], totalAmount: 0 };
  cartCount = 0;
  wishlistCount = 0;
  showCartDropdown = false;
  showCartDrawer = false;

  // Coupon promo code variables
  couponCode = '';
  appliedCoupon: any = null;
  couponError = '';
  publicCoupons: any[] = [];
  copiedCouponCode: string | null = null;

  // Customer Checkout Details
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
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      if (this.slug) {
        this.fetchStorefront();
        this.cartService.loadCart(this.slug);
        this.wishlistService.loadWishlist(this.slug);
        
        // Subscribe to client-side cart updates
        this.cartService.cart$.subscribe(c => {
          this.cart = c;
          this.cartCount = c.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        });

        // Subscribe to wishlist updates
        this.wishlistService.wishlist$.subscribe(w => {
          this.wishlistCount = w.length;
        });
      } else {
        this.loading = false;
        this.notFound = true;
      }
    });
  }

  fetchStorefront() {
    this.api.get<{ success: boolean; business: BusinessProfile }>(`business/store/${this.slug}`).subscribe({
      next: (res) => {
        if (res.success && res.business) {
          this.business = res.business;
          this.fetchProducts(res.business._id);
          this.trackPageView(res.business._id);
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

  fetchProducts(businessId: string) {
    this.api.get<{ success: boolean; products: ProductItem[] }>(`products/public/${businessId}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.products;
          this.filteredProducts = res.products;
          
          // Compute category options
          const cats = res.products.map(p => p.category);
          this.categories = Array.from(new Set(cats));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  trackPageView(businessId: string) {
    this.api.post('analytics/track', { businessId, event: 'page_view' }).subscribe();
  }

  trackProductClick(productId: string) {
    if (this.business) {
      this.api.post('analytics/track', { businessId: this.business._id, event: 'product_click', productId }).subscribe();
    }
  }

  filterCategory(cat: string) {
    this.selectedCategory = cat;
    if (cat === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category === cat);
    }
  }

  getWhatsAppLink(): string {
    if (!this.business) return '';
    const text = `Hello! I'm visiting your storefront *${this.business.name}* and would like to ask a question.`;
    return `https://wa.me/${this.business.whatsappNumber}?text=${encodeURIComponent(text)}`;
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

  // Cart Management Functions
  toggleCartDrawer() {
    this.showCartDrawer = !this.showCartDrawer;
  }

  addToCart(event: Event, prod: ProductItem) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(this.slug, prod._id, 1).subscribe({
      next: () => {
        // Automatically open cart drawer to verify addition
        this.showCartDrawer = true;
      },
      error: (err) => alert(err.message || 'Failed to add item to cart')
    });
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(this.slug, productId, quantity).subscribe({
      error: (err) => alert(err.message || 'Failed to update item quantity')
    });
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(this.slug, productId).subscribe({
      error: (err) => alert(err.message || 'Failed to remove item')
    });
  }

  // Wishlist Functions
  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  toggleWishlist(event: Event, productId: string) {
    event.stopPropagation();
    event.preventDefault();
    if (this.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(this.slug, productId);
    } else {
      this.wishlistService.addToWishlist(this.slug, productId);
    }
  }

  // Coupon Promo Codes
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
    this.http.get<any>(`${environment.apiUrl}/coupons/public-store/${this.slug}`).subscribe({
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

  // WhatsApp Multi-Product Checkout
  checkoutCart() {
    if (!this.checkoutName || !this.checkoutPhone) {
      this.checkoutError = 'Please fill in required name and phone fields.';
      return;
    }

    if (!this.cart || this.cart.items.length === 0 || !this.business) return;

    this.checkoutError = '';
    this.submittingCheckout = true;

    // Prepare order details for DB tracking
    const orderData = {
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
    this.http.post<any>(`${environment.apiUrl}/orders`, orderData).subscribe({
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

          // Optional alert
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
