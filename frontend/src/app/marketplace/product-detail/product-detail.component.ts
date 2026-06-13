import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarketplaceService } from '../../shared/services/marketplace.service';
import { ToastService } from '../../shared/services/toast.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-marketplace-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ScrollRevealDirective, SkeletonComponent],
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
            <a routerLink="/marketplace/cart" class="nav-link-btn cart-btn">
              🛒 Cart <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </a>
            <a routerLink="/marketplace" class="nav-link-btn">Marketplace Home</a>
          </div>
        </div>
      </header>

      <div class="container page-content">
        <!-- Breadcrumbs -->
        <div class="breadcrumb">
          <a routerLink="/marketplace">⬅ Return to Marketplace</a>
        </div>

        <div *ngIf="loading" class="detail-grid">
          <div class="gallery-card card p-0">
            <app-skeleton height="400px" borderRadius="var(--radius-xl)"></app-skeleton>
          </div>
          <div class="info-card card">
            <app-skeleton width="30%" height="24px" className="mb-4"></app-skeleton>
            <app-skeleton width="80%" height="40px" className="mb-4"></app-skeleton>
            <app-skeleton width="20%" height="30px" className="mb-6"></app-skeleton>
            <app-skeleton width="100%" height="100px" className="mb-6"></app-skeleton>
            <div class="meta-cards-row">
               <app-skeleton width="100%" height="150px" borderRadius="var(--radius-lg)"></app-skeleton>
               <app-skeleton width="100%" height="150px" borderRadius="var(--radius-lg)"></app-skeleton>
            </div>
            <app-skeleton width="100%" height="54px" className="mt-4"></app-skeleton>
          </div>
        </div>

        <div *ngIf="!loading && notFound" class="empty-state card">
          <div class="empty-icon">❌</div>
          <h3>Product not found</h3>
          <p>This item might have been removed by the merchant or is currently out of stock.</p>
        </div>

        <!-- Product Details Grid -->
        <div class="detail-grid" *ngIf="!loading && !notFound && product">
          <!-- Left Column: Gallery -->
          <div class="gallery-card card">
            <div class="active-image">
              <img [src]="activeImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'" [alt]="product.title" class="animate-fade-in-up">
            </div>
            
            <div class="thumbnails-grid" *ngIf="product.images?.length > 1">
              @for (img of product.images; track img) {
                <button (click)="setActiveImage(img)" class="thumb-btn" [class.selected]="activeImage === img">
                  <img [src]="img" alt="Thumbnail">
                </button>
              }
            </div>
          </div>

          <!-- Right Column: Info & Actions -->
          <div class="info-card card">
            <div class="info-top-row">
              <span class="category-tag">{{ product.category }}</span>
              <button class="wishlist-toggle-btn" [class.in-wishlist]="isInWishlist(product._id)" (click)="toggleWishlist(product)">
                ❤️ {{ isInWishlist(product._id) ? 'Saved' : 'Save Item' }}
              </button>
            </div>
            
            <h1 class="product-title">{{ product.title }}</h1>
            <div class="price-row">
              <span class="price">₹{{ product.price }}</span>
              <span class="stock-badge" [class.out]="product.stock === 0">
                {{ product.stock > 0 ? 'In Stock' : 'Sold Out' }}
              </span>
            </div>

            <!-- Description -->
            <div class="description-section">
              <h4 class="info-heading">Product Description</h4>
              <p class="description-text">{{ product.description || 'No description provided.' }}</p>
            </div>

            <div class="meta-cards-row" [class.single]="!product.business || coupons.length === 0">
              <!-- Store Information Card -->
              <div class="store-info-card glass-card" *ngIf="product.business">
                <h4 class="widget-title">🏪 Store Information</h4>
                <div class="store-info-header">
                  <img class="mini-logo" [src]="product.business.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=60&auto=format&fit=crop'" alt="Store Logo">
                  <div>
                    <h4 class="store-name">{{ product.business.name }}</h4>
                    <span class="store-cat">{{ product.business.category }}</span>
                  </div>
                </div>
                <p class="store-address" *ngIf="product.business.address">📍 {{ product.business.address }}</p>
                
                <div class="store-actions">
                  <a [routerLink]="['/store', product.business.websiteSlug]" class="btn btn-primary btn-sm w-full" style="text-align: center;">Visit Storefront</a>
                </div>
              </div>

              <!-- Available Coupons -->
              <div class="available-offers-widget" *ngIf="coupons.length > 0">
                <h4 class="widget-title">🎁 Available Offers at {{ product.business?.name }}</h4>
                <div class="mini-tickets-list">
                  @for (cp of coupons; track cp._id) {
                    <div class="mini-ticket glass-card">
                      <div class="mini-tab">
                        <span class="disc-val">{{ cp.discountType === 'percentage' ? cp.discountValue + '%' : '₹' + cp.discountValue }}</span>
                        <span class="disc-lbl">OFF</span>
                      </div>
                      <div class="mini-divider">
                        <div class="notch top-notch"></div>
                        <div class="notch bottom-notch"></div>
                      </div>
                      <div class="mini-content">
                        <div class="code-and-icon">
                          <span class="coupon-code">{{ cp.code }}</span>
                          <button (click)="copyCoupon(cp.code)" class="btn btn-sm copy-btn" [style.background]="copiedCode === cp.code ? '#25d366' : 'var(--color-bg-surface)'" [style.color]="copiedCode === cp.code ? '#000' : 'var(--color-text-primary)'">
                            {{ copiedCode === cp.code ? '✓ Copied' : '📋 Copy' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Purchase Add to Cart Actions -->
            <div class="purchase-actions" *ngIf="product.stock > 0">
              <div class="qty-selector-block">
                <span>Quantity:</span>
                <div class="qty-control">
                  <button class="qty-btn" (click)="decrementQty()" [disabled]="buyQty <= 1">-</button>
                  <span class="qty-val">{{ buyQty }}</span>
                  <button class="qty-btn" (click)="incrementQty()" [disabled]="buyQty >= product.stock">+</button>
                </div>
              </div>

              <button (click)="addToCart(product)" class="btn btn-primary w-full btn-whatsapp-order">
                🛒 Add {{ buyQty }} to Cart
              </button>
            </div>
            <div class="sold-out-alert" *ngIf="product.stock === 0">
              🛑 Out of Stock
            </div>
          </div>
        </div>

        <!-- Buyer Reviews Section -->
        <section class="reviews-section" *ngIf="!loading && !notFound && product">
          <h2 class="section-title">Buyer Reviews ({{ reviews.length }})</h2>
          
          <div *ngIf="reviews.length === 0" class="empty-reviews card">
            <span class="empty-stars">⭐⭐⭐⭐⭐</span>
            <p>No reviews have been written for this product yet. Order now and share your feedback!</p>
          </div>

          <div class="reviews-feed" *ngIf="reviews.length > 0">
            @for (rev of reviews; track rev._id) {
              <div class="review-item-card card">
                <div class="review-card-top">
                  <div class="buyer-avatar">{{ rev.name.charAt(0).toUpperCase() }}</div>
                  <div class="buyer-info">
                    <strong>{{ rev.name }}</strong>
                    <span class="verified-badge">✓ Verified Purchaser</span>
                  </div>
                  <div class="buyer-stars">
                    {{ '★'.repeat(rev.rating) }}{{ '☆'.repeat(5 - rev.rating) }}
                  </div>
                </div>
                <p class="review-text-comment">"{{ rev.comment }}"</p>
              </div>
            }
          </div>
        </section>
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
    .btn-accent-cart { 
      background: var(--color-accent-dim); 
      color: var(--color-accent); 
      border: 1px solid var(--color-accent-glow); 
      padding: 8px 18px; font-weight: 850; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.25s ease; 
      &:hover:not([disabled]) { 
        background: var(--color-accent); 
        color: #000; 
        border-color: var(--color-accent);
        box-shadow: 0 0 15px var(--color-accent-glow);
      } 
      &:disabled { opacity: 0.4; cursor: not-allowed; } 
    }
    .cart-btn {
      border: 1px solid var(--color-border);
      background: var(--color-bg-surface);
      color: var(--color-text-primary);
      &:hover { 
        background: var(--color-accent); 
        color: #000; 
        border-color: var(--color-accent);
        box-shadow: 0 0 15px rgba(37, 211, 102, 0.25);
        .cart-badge { background: #000; color: var(--color-accent); box-shadow: none; }
      }
    }
 
    .page-content {
      padding-bottom: var(--space-3xl);
    }
 
    .breadcrumb {
      margin: var(--space-md) 0 var(--space-lg);
      a { color: var(--color-text-secondary); font-weight: 600; text-decoration: none; transition: color 0.2s; &:hover { color: var(--color-accent); } }
    }
    .loading-state, .empty-state {
      text-align: center; padding: var(--space-3xl) 0;
      background: var(--color-bg-card);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
      .spinner { font-size: 2.2rem; display: block; margin-bottom: 12px; }
      h3 { font-weight: 850; color: var(--color-text-primary); margin-bottom: var(--space-sm); }
      p { color: var(--color-text-secondary); }
    }
 
    /* Details layout */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: var(--space-2xl);
      align-items: start;
      margin-bottom: var(--space-3xl);
      @media (max-width: 800px) { grid-template-columns: 1fr; gap: var(--space-lg); }
    }
    .gallery-card {
      position: sticky;
      top: 100px;
      height: fit-content;
      padding: var(--space-md); 
      background: var(--color-bg-card); 
      border: 1px solid var(--color-border); 
      border-radius: var(--radius-xl);
    }
    .active-image {
      height: 440px; border-radius: var(--radius-lg); overflow: hidden; background: var(--color-bg-surface); border: 1px solid var(--color-border);
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; &:hover { transform: scale(1.03); } }
      @media (max-width: 500px) { height: 280px; }
    }
    .thumbnails-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: var(--space-sm); margin-top: var(--space-sm);
    }
    .thumb-btn {
      height: 75px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid transparent; padding: 0; background: var(--color-bg-surface); cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transition: opacity 0.2s; }
      &:hover { img { opacity: 0.9; } }
      &.selected { border-color: var(--color-accent); img { opacity: 1; } }
    }
 
    .info-card {
      padding: var(--space-2xl); 
      background: var(--color-bg-card); 
      border: 1px solid var(--color-border); 
      border-radius: var(--radius-xl); 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-md);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }
    .info-top-row { display: flex; justify-content: space-between; align-items: center; }
    .category-tag { font-size: 0.8rem; text-transform: uppercase; color: #8b5cf6; font-weight: 800; letter-spacing: 0.08em; }
    .wishlist-toggle-btn {
      background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-primary); padding: 8px 18px; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 750; cursor: pointer; transition: all 0.25s ease;
      &:hover { background: rgba(239,68,68,0.1); border-color: var(--color-danger); color: var(--color-danger); }
      &.in-wishlist { background: rgba(239,68,68,0.15); border-color: var(--color-danger); color: var(--color-danger); }
    }
    .product-title { font-size: 2.3rem; font-weight: 900; color: var(--color-text-primary); line-height: 1.2; letter-spacing: -0.02em; }
    .price-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-md); }
    .price { font-size: 2.2rem; font-weight: 900; color: var(--color-text-primary); font-family: var(--font-heading); }
    .stock-badge {
      font-size: 0.82rem; font-weight: 800; color: var(--color-accent); background: rgba(37,211,102,0.06); border: 1px solid rgba(37,211,102,0.2); padding: 6px 14px; border-radius: var(--radius-pill);
      &.out { color: var(--color-danger); background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.2); }
    }
    
    .info-heading { font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-secondary); font-weight: 800; margin-bottom: var(--space-xs); letter-spacing: 0.05em; }
    
    /* Description Pre line Formatting */
    .description-section {
      display: flex; flex-direction: column; gap: 8px;
    }
    .description-text { 
      font-size: 0.98rem; 
      color: var(--color-text-secondary); 
      line-height: 1.65;
      white-space: pre-line;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
 
    /* Meta Cards Row */
    .meta-cards-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
      margin: var(--space-md) 0;
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
      &.single {
        grid-template-columns: 1fr;
      }
    }
 
    /* Store Info & Offers Shared Cards */
    .store-info-card, .available-offers-widget {
      padding: var(--space-lg); border: 1px dashed var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); display: flex; flex-direction: column; gap: var(--space-md); box-sizing: border-box; height: 100%;
    }
    .widget-title { font-size: 0.85rem; font-weight: 850; color: var(--color-accent); margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .store-info-header {
      display: flex; gap: 12px; align-items: center;
      .mini-logo { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-accent); box-shadow: 0 0 10px rgba(37, 211, 102, 0.2); }
      .store-name { font-size: 1.1rem; font-weight: 850; color: var(--color-text-primary); margin: 0; }
      .store-cat { font-size: 0.72rem; color: var(--color-accent); font-weight: 800; text-transform: uppercase; background: rgba(37,211,102,0.05); padding: 2px 8px; border-radius: 10px; display: inline-block; margin-top: 4px; }
    }
    .store-address { font-size: 0.82rem; color: var(--color-text-secondary); margin: 0; flex: 1; }
    .store-actions { display: flex; gap: var(--space-sm); width: 100%; margin-top: auto; .btn { font-size: 0.85rem; font-weight: 750; padding: 10px 18px; flex: 1; justify-content: center; } }
 
    /* Purchase controls */
    .purchase-actions {
      display: flex; flex-direction: column; gap: var(--space-md);
      margin-top: var(--space-sm);
    }
    .qty-selector-block { display: flex; align-items: center; gap: 16px; font-size: 0.95rem; font-weight: 800; color: var(--color-text-secondary); }
    .qty-control { display: flex; align-items: center; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; }
    .qty-btn { background: transparent; border: none; color: var(--color-text-primary); width: 34px; height: 34px; cursor: pointer; font-weight: 850; &:hover:not([disabled]) { background: var(--color-border); } &:disabled { opacity: 0.3; cursor: not-allowed; } }
    .qty-val { font-size: 1rem; font-weight: 800; width: 34px; text-align: center; color: var(--color-text-primary); }
    .btn-whatsapp-order { 
      background: linear-gradient(135deg, var(--color-accent) 0%, #1ebd5d 100%); 
      color: #000; border: none; padding: 14px; font-weight: 900; font-size: 1.1rem; border-radius: var(--radius-md); box-shadow: 0 4px 15px rgba(37, 211, 102, 0.25); cursor: pointer; transition: all 0.2s;
      display: flex; justify-content: center; align-items: center;
      &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45); }
    }
    .sold-out-alert { font-weight: 800; color: var(--color-danger); text-align: center; padding: 12px; background: rgba(239,68,68,0.06); border-radius: var(--radius-sm); border: 1px solid rgba(239, 68, 68, 0.15); }
 
    /* Available Offers widget */
    .mini-tickets-list { display: flex; flex-direction: column; gap: var(--space-sm); flex: 1; margin-top: auto; }
    .mini-ticket { 
      display: flex; border: 1px solid rgba(37, 211, 102, 0.15); border-radius: var(--radius-xl); background: var(--color-bg-card); position: relative; overflow: visible; box-sizing: border-box; 
      transition: all 0.2s;
      &:hover { border-color: rgba(37, 211, 102, 0.3); }
    }
    .mini-tab {
      width: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(37, 211, 102, 0.04); border-top-left-radius: var(--radius-xl); border-bottom-left-radius: var(--radius-xl); padding: var(--space-sm); box-sizing: border-box;
      .disc-val { font-size: 1.15rem; font-weight: 950; color: var(--color-accent); text-shadow: 0 0 8px rgba(37, 211, 102, 0.25); line-height: 1; text-align: center; }
      .disc-lbl { font-size: 0.65rem; font-weight: 850; color: var(--color-text-secondary); margin-top: 2px; }
    }
    .mini-divider {
      position: relative; width: 2px; border-left: 2px dashed rgba(37, 211, 102, 0.2); margin: 8px 0;
      .notch { position: absolute; width: 12px; height: 12px; background: var(--color-bg); border-radius: 50%; left: -7px; border: 1px solid rgba(37, 211, 102, 0.15); box-sizing: border-box; &.top-notch { top: -15px; } &.bottom-notch { bottom: -15px; } }
    }
    .mini-content { flex: 1; padding: var(--space-sm) var(--space-md); display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; }
    .code-and-icon {
      display: flex; justify-content: space-between; align-items: center; gap: 8px;
      .coupon-code { font-size: 0.85rem; font-weight: 900; color: var(--color-text-primary); background: var(--color-bg-surface); padding: 3px 8px; border-radius: 6px; border: 1px dashed var(--color-border); }
      .copy-btn { 
        font-size: 0.72rem; font-weight: 850; padding: 4px 10px; border-radius: 6px; cursor: pointer; border: 1px solid var(--color-border); 
        background: var(--color-bg-surface); color: var(--color-text-primary); transition: all 0.2s;
        &:hover { background: var(--color-border); } 
      }
    }
 
    /* Reviews */
    .reviews-section { margin-top: var(--space-3xl); }
    .empty-reviews { padding: var(--space-2xl); text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); .empty-stars { color: var(--color-border); font-size: 2rem; display: block; margin-bottom: 8px; } }
    .reviews-feed { display: flex; flex-direction: column; gap: var(--space-md); }
    .review-item-card {
      padding: var(--space-xl); 
      background: var(--color-bg-card); 
      border: 1px solid var(--color-border); 
      border-radius: var(--radius-xl); 
      display: flex; flex-direction: column; gap: 12px;
      transition: border-color 0.2s;
      &:hover { border-color: rgba(37, 211, 102, 0.25); }
    }
    .review-card-top { display: flex; align-items: center; gap: 12px; }
    .buyer-avatar { 
      width: 40px; height: 40px; border-radius: 50%; 
      background: linear-gradient(135deg, var(--color-accent) 0%, #1ebd5d 100%); 
      color: #000; font-weight: 900; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 10px rgba(37, 211, 102, 0.3);
    }
    .buyer-info { flex: 1; display: flex; flex-direction: column; .verified-badge { font-size: 0.72rem; color: var(--color-accent); font-weight: 700; } }
    .buyer-stars { color: #ffc857; text-shadow: 0 0 8px rgba(255, 200, 87, 0.4); font-size: 0.95rem; letter-spacing: 2px; }
    .review-text-comment { font-size: 0.96rem; color: var(--color-text-secondary); font-style: italic; border-left: 3px solid var(--color-accent); padding-left: 10px; line-height: 1.5; }
  `]
})
export class ProductDetailComponent implements OnInit {
  loading = true;
  notFound = false;
  productId = '';
  product: any = null;
  activeImage = '';

  buyQty = 1;
  coupons: any[] = [];
  reviews: any[] = [];

  // Clipboard tracking
  copiedCode: string | null = null;

  // Header badges
  wishlistCount = 0;
  cartCount = 0;

  constructor(
    private route: ActivatedRoute,
    private marketplaceService: MarketplaceService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('productId') || '';
      if (this.productId) {
        this.fetchProductDetails();
      } else {
        this.loading = false;
        this.notFound = true;
      }
    });

    // Subscriptions
    this.marketplaceService.cart$.subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });
    this.marketplaceService.wishlist$.subscribe(items => {
      this.wishlistCount = items.length;
    });
  }

  fetchProductDetails() {
    this.loading = true;
    this.notFound = false;

    this.marketplaceService.search('', 'all', 1, 999).subscribe({
      next: (res) => {
        if (res.success && res.products) {
          const found = res.products.find((p: any) => p._id === this.productId);
          if (found) {
            this.product = found;
            this.activeImage = found.images[0] || '';
            this.coupons = found.coupons || [];
            this.fetchReviews();
          } else {
            this.notFound = true;
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      }
    });
  }

  fetchReviews() {
    this.http.get<any>(`${environment.apiUrl}/reviews/product/${this.productId}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.reviews || [];
        }
      }
    });
  }

  setActiveImage(img: string) {
    this.activeImage = img;
  }

  // Wishlist actions
  isInWishlist(prodId: string): boolean {
    return this.marketplaceService.isInWishlist(prodId);
  }

  toggleWishlist(prod: any) {
    if (this.isInWishlist(prod._id)) {
      this.marketplaceService.removeFromWishlist(prod._id);
    } else {
      this.marketplaceService.addToWishlist(prod);
    }
  }

  // Quantity controllers
  incrementQty() {
    if (this.buyQty < this.product.stock) {
      this.buyQty++;
    }
  }

  decrementQty() {
    if (this.buyQty > 1) {
      this.buyQty--;
    }
  }

  // Add to Cart
  addToCart(prod: any) {
    this.marketplaceService.addToCart(prod, this.buyQty);
    alert(`Added ${this.buyQty} item(s) to marketplace cart!`);
    this.buyQty = 1;
  }

  // Coupon copy
  copyCoupon(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode = code;
      setTimeout(() => this.copiedCode = null, 3000);
    });
  }
}
