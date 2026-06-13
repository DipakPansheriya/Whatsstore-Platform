import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MarketplaceService, MarketplaceCartItem } from '../../shared/services/marketplace.service';
import { ToastService } from '../../shared/services/toast.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-marketplace-home',
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
              🛒 Cart <span class="cart-badge" [class.animate-bounce]="isCartBouncing" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </a>
            <a routerLink="/" class="nav-link-btn home-link">SaaS Home</a>
          </div>
        </div>
      </header>

      <div class="container page-content">
        <!-- Hero Search Section -->
        <section class="search-hero">
          <h1>Everything You Need, Delivered via WhatsApp</h1>
          <p>Search products and discount offers across all local stores instantly.</p>
          
          <div class="search-bar-container glass-card accent-glow-hover">
            <span class="search-icon">🔍</span>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()" placeholder="Search products, brands, or grocery items..." />
            <button (click)="triggerSearch()" class="btn btn-primary">Search</button>
          </div>
        </section>

        <!-- Zepto-style Skeleton Loader -->
        <div *ngIf="loading" class="skeleton-wrapper animate-fade-in-up">
          <div class="skeleton-hero shimmer"></div>
          <div class="skeleton-section">
            <div class="skeleton-title shimmer"></div>
            <div class="skeleton-categories scroll-x">
              <div class="skeleton-pill shimmer" *ngFor="let i of [1,2,3,4,5,6]"></div>
            </div>
          </div>
          <div class="skeleton-section">
            <div class="skeleton-title shimmer"></div>
            <div class="skeleton-grid">
              <div class="skeleton-card" *ngFor="let i of [1,2,3,4]">
                <div class="skeleton-img shimmer"></div>
                <div class="skeleton-text shimmer" style="width: 70%; margin-top: 10px;"></div>
                <div class="skeleton-text shimmer" style="width: 40%; margin-top: 5px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Slider -->
        <section class="categories-section" *ngIf="!loading">
          <h2 class="section-title">Browse Categories</h2>
          <div class="categories-grid scroll-x">
            <button (click)="selectCategory('all')" [class.active]="selectedCategory === 'all'" class="category-pill">
              <span class="cat-icon">🌐</span>
              <span class="cat-name">All Items</span>
            </button>
            @for (cat of categories; track cat.name) {
              <button (click)="selectCategory(cat.name)" [class.active]="selectedCategory === cat.name" class="category-pill">
                <span class="cat-icon">{{ cat.iconUrl || '📦' }}</span>
                <span class="cat-name">{{ cat.name }}</span>
              </button>
            }
          </div>
        </section>

        <!-- Banners Carousel -->
        <section class="banners-section" *ngIf="banners.length > 0 && !isSearching">
          <div class="banner-carousel">
            <div class="banner-slide" [style.background-image]="'url(' + activeBanner.imageUrl + ')'">
              <div class="banner-overlay"></div>
              <div class="banner-content">
                <h2>{{ activeBanner.title || 'Curated Store Deals' }}</h2>
                <p>Support small businesses and order directly on personal WhatsApp chats.</p>
                <a routerLink="/marketplace/cart" class="btn btn-primary btn-sm">Shop Curated Cart</a>
              </div>
            </div>
            <div class="carousel-dots" *ngIf="banners.length > 1">
              @for (b of banners; track b.imageUrl; let idx = $index) {
                <button (click)="setBannerIndex(idx)" [class.active]="activeBannerIndex === idx" class="dot-btn"></button>
              }
            </div>
          </div>
        </section>

        <!-- Search Results View -->
        <div class="search-results-layout" *ngIf="isSearching">

          <!-- Main Results Area -->
          <div class="search-results-main">
            <div class="results-header">
              <div class="results-title-row">
                <h3 *ngIf="searchQuery">🔍 Results for "{{ searchQuery }}" <span *ngIf="selectedCategory !== 'all'">in {{ selectedCategory }}</span> ({{ searchResults.length }})</h3>
                <h3 *ngIf="!searchQuery">🔍 {{ selectedCategory === 'all' ? 'All Products' : 'Products in ' + selectedCategory }} ({{ searchResults.length }})</h3>
              </div>
              <div class="results-actions-row">
                <button (click)="clearSearch()" class="btn btn-ghost btn-sm">✕ Clear Search</button>
              </div>
            </div>

            <div *ngIf="loadingSearch" class="products-grid">
              <div *ngFor="let i of [1,2,3,4]" class="product-card card p-0">
                <app-skeleton height="200px" borderRadius="var(--radius-xl) var(--radius-xl) 0 0"></app-skeleton>
                <div class="card-body">
                  <app-skeleton width="60px" height="12px"></app-skeleton>
                  <app-skeleton width="90%" height="20px" className="mt-2"></app-skeleton>
                  <app-skeleton width="40%" height="16px" className="mt-2"></app-skeleton>
                  <div class="card-footer mt-auto">
                    <app-skeleton width="80px" height="24px"></app-skeleton>
                    <app-skeleton width="70px" height="34px" borderRadius="var(--radius-sm)"></app-skeleton>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!loadingSearch && searchResults.length === 0" class="empty-state card">
              <div class="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>Try refining your search terms or adjusting filters.</p>
            </div>

            <div *ngIf="!loadingSearch && searchResults.length > 0" class="products-grid">
              @for (prod of searchResults; track prod._id) {
                <div class="product-card card" appScrollReveal>
                  <div class="image-box" [routerLink]="['/marketplace/product', prod._id]">
                    <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'" [alt]="prod.title">
                    <span class="store-badge-tag">{{ prod.business?.name }}</span>
                    <button class="wishlist-btn" [class.active]="isInWishlist(prod._id)" (click)="toggleWishlist($event, prod)">❤️</button>
                  </div>
                  <div class="card-body">
                    <span class="prod-cat">{{ prod.category }}</span>
                    <h4 class="prod-title" [routerLink]="['/marketplace/product', prod._id]">{{ prod.title }}</h4>
                    <div class="offer-badges-row" *ngIf="prod.coupons?.length > 0">
                      <span class="coupon-badge-pill">🏷️ Code: {{ prod.coupons[0].code }}</span>
                    </div>
                    <div class="card-footer">
                      <span class="price">₹{{ prod.price }}</span>
                      <button (click)="addToCart(prod)" class="btn btn-sm btn-accent-cart" [disabled]="prod.stock === 0">
                        {{ prod.stock > 0 ? '🛒 Add' : 'Sold Out' }}
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Default Homepage View (Only shown when q/search is empty) -->
        <div class="default-home-sections animate-fade-in-up" *ngIf="!isSearching">
          <!-- Featured Stores (RTL Auto Scroll Carousel) -->
          <section class="home-section" *ngIf="featuredStores.length > 0" appScrollReveal>
            <h2 class="section-title">🔥 Featured Stores</h2>
            <div class="stores-container">
              @for (store of featuredStores; track store._id) {
                <div class="store-card">
                  <img [src]="store.logoUrl || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=150&auto=format&fit=crop'" alt="Store Logo" class="store-logo">
                  <div class="store-info">
                    <h4>{{ store.name }}</h4>
                    <span class="store-tag">{{ store.category }}</span>
                    <p class="store-desc">{{ store.description || 'Verified WhatsStore Merchant' }}</p>
                  </div>
                  <button class="btn" [routerLink]="['/store', store.websiteSlug]">Visit Storefront</button>
                </div>
              }
              <!-- Duplicate for infinite seamless scroll -->
              @for (store of featuredStores; track store._id + '-copy') {
                <div class="store-card">
                  <img [src]="store.logoUrl || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=150&auto=format&fit=crop'" alt="Store Logo" class="store-logo">
                  <div class="store-info">
                    <h4>{{ store.name }}</h4>
                    <span class="store-tag">{{ store.category }}</span>
                    <p class="store-desc">{{ store.description || 'Verified WhatsStore Merchant' }}</p>
                  </div>
                  <button class="btn" [routerLink]="['/store', store.websiteSlug]">Visit Storefront</button>
                </div>
              }
            </div>
          </section>

          <!-- Featured Products -->
          <section class="home-section" *ngIf="featuredProducts.length > 0" appScrollReveal>
            <h2 class="section-title">✨ Top Rated Products</h2>
            <div class="products-grid">
              @for (prod of featuredProducts; track prod._id) {
                <div class="product-card card" appScrollReveal>
                  <div class="image-box" [routerLink]="['/marketplace/product', prod._id]">
                    <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'" [alt]="prod.title">
                    <span class="store-badge-tag">{{ prod.business?.name }}</span>
                    <button class="wishlist-btn" [class.active]="isInWishlist(prod._id)" (click)="toggleWishlist($event, prod)">❤️</button>
                  </div>
                  <div class="card-body">
                    <span class="prod-cat">{{ prod.category }}</span>
                    <h4 class="prod-title" [routerLink]="['/marketplace/product', prod._id]">{{ prod.title }}</h4>
                    <div class="card-footer">
                      <span class="price">₹{{ prod.price }}</span>
                      <button (click)="addToCart(prod)" class="btn btn-sm btn-accent-cart" [disabled]="prod.stock === 0">
                        {{ prod.stock > 0 ? '🛒 Add' : 'Out' }}
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Public Coupons -->
          <section class="home-section" *ngIf="globalCoupons.length > 0" appScrollReveal>
            <h2 class="section-title">🎉 Hot Merchant Coupons</h2>
            <div class="offers-container scroll-x">
              @for (cp of globalCoupons; track cp._id) {
                <div class="offer-pill" (click)="copyCouponCode(cp.code, cp.business?.websiteSlug)" title="Click to copy code and visit store">
                  <div class="offer-pill-bg"></div>
                  <div class="offer-pill-content">
                    <span class="offer-pill-discount">{{ cp.discountType === 'percentage' ? cp.discountValue + '%' : '₹' + cp.discountValue }} OFF</span>
                    <span class="offer-pill-divider"></span>
                    <span class="offer-pill-code">{{ copiedCode === cp.code ? '✓ Copied' : cp.code }}</span>
                    <span class="offer-pill-store">&#64; {{ cp.business?.name }}</span>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Trending Products -->
          <section class="home-section" *ngIf="trendingProducts.length > 0" appScrollReveal>
            <h2 class="section-title">⚡ Fresh & Trending Additions</h2>
            <div class="products-grid">
              @for (prod of trendingProducts; track prod._id) {
                <div class="product-card card" appScrollReveal>
                  <div class="image-box" [routerLink]="['/marketplace/product', prod._id]">
                    <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'" [alt]="prod.title">
                    <span class="store-badge-tag">{{ prod.business?.name }}</span>
                    <button class="wishlist-btn" [class.active]="isInWishlist(prod._id)" (click)="toggleWishlist($event, prod)">❤️</button>
                  </div>
                  <div class="card-body">
                    <span class="prod-cat">{{ prod.category }}</span>
                    <h4 class="prod-title" [routerLink]="['/marketplace/product', prod._id]">{{ prod.title }}</h4>
                    <div class="card-footer">
                      <span class="price">₹{{ prod.price }}</span>
                      <button (click)="addToCart(prod)" class="btn btn-sm btn-accent-cart" [disabled]="prod.stock === 0">
                        {{ prod.stock > 0 ? '🛒 Add' : 'Out' }}
                      </button>
                    </div>
                </div>
              </div>
            }
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Skeleton Loaders */
    .skeleton-wrapper { display: flex; flex-direction: column; gap: 30px; padding: 20px 0; }
    .shimmer {
      background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-md);
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton-hero { height: 250px; border-radius: var(--radius-xl); margin-bottom: 20px; }
    .skeleton-section { margin-bottom: 30px; }
    .skeleton-title { height: 28px; width: 250px; margin-bottom: 15px; }
    .skeleton-categories { display: flex; gap: 12px; }
    .skeleton-pill { height: 40px; width: 120px; border-radius: var(--radius-md); }
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .skeleton-card { background: var(--color-bg-card); padding: 15px; border-radius: var(--radius-xl); border: 1px solid var(--color-border); }
    .skeleton-img { height: 180px; border-radius: var(--radius-lg); }
    .skeleton-text { height: 16px; border-radius: 4px; }
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
      box-shadow: var(--shadow-sm);
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
    .cart-badge { background: var(--color-accent); color: #000; box-shadow: 0 0 10px var(--color-accent-glow); }
    .cart-btn {
      border: 1px solid var(--color-border);
      background: var(--color-bg-surface);
      color: var(--color-text-primary);
      &:hover { 
        background: var(--color-accent); 
        color: #000; 
        border-color: var(--color-accent);
        box-shadow: 0 0 15px var(--color-accent-glow);
        .cart-badge { background: #000; color: var(--color-accent); box-shadow: none; }
      }
    }
    .home-link {
      border: 1px solid var(--color-border);
    }

    .page-content {
      padding-bottom: var(--space-3xl);
    }

    /* Hero search */
    .search-hero {
      text-align: center;
      padding: var(--space-3xl) 0 var(--space-2xl);
      h1 { 
        font-size: clamp(2.2rem, 6vw, 3.4rem); 
        font-weight: 950; 
        color: var(--color-text-primary); 
        line-height: 1.15; 
        letter-spacing: -0.03em;
      }
      p { font-size: 1.15rem; color: var(--color-text-secondary); margin-top: 12px; margin-bottom: var(--space-2xl); }
    }
    .search-bar-container {
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      padding: 6px 6px 6px 20px;
      background: var(--color-bg-card-glass);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      gap: 12px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(10px);
      
      &:focus-within {
        border-color: var(--color-accent);
        box-shadow: 0 0 30px var(--color-accent-glow);
        background: var(--color-bg-card);
      }
      
      .search-icon { font-size: 1.3rem; opacity: 0.8; }
      input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--color-text-primary);
        font-size: 1.1rem;
        &::placeholder { color: var(--color-text-muted); }
      }
      .btn { 
        border-radius: var(--radius-pill); 
        padding: 12px 28px; 
        font-weight: 850;
        background: var(--color-accent);
        color: #000;
        border: none;
        box-shadow: 0 4px 15px var(--color-accent-glow);
        cursor: pointer;
        transition: all 0.2s ease;
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
        }
      }
    }

    /* Categories grid */
    .categories-section { margin-bottom: var(--space-3xl); }
    .categories-grid {
      display: flex;
      gap: 12px;
      padding-bottom: 12px;
    }
    .scroll-x {
      overflow-x: auto;
      &::-webkit-scrollbar { height: 6px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: var(--radius-pill); }
      &::-webkit-scrollbar-thumb:hover { background: var(--color-border-hover); }
    }
    .category-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 22px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover { 
        background: var(--color-bg-surface); 
        color: var(--color-text-primary);
        transform: translateY(-2px);
      }
      &.active { 
        background: linear-gradient(135deg, var(--color-accent) 0%, #8b5cf6 100%);
        color: #000; 
        border-color: transparent; 
        box-shadow: 0 4px 20px var(--color-accent-glow);
        font-weight: 850;
      }
    }

    /* Banners styling */
    .banners-section { margin-bottom: var(--space-3xl); }
    .banner-carousel {
      position: relative;
      height: 300px;
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-md);
    }
    .banner-slide {
      height: 100%;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      position: relative;
      padding: 0 var(--space-3xl);
    }
    .banner-overlay {
      position: absolute; top:0; left:0; right:0; bottom:0;
      background: linear-gradient(90deg, rgba(5, 6, 11, 0.8) 0%, rgba(5, 6, 11, 0.3) 100%);
    }
    .banner-content {
      position: relative;
      z-index: 2;
      max-width: 520px;
      display: flex; flex-direction: column; gap: var(--space-md); align-items: flex-start;
      h2 { font-size: 2.5rem; color: #fff; font-weight: 900; line-height: 1.2; letter-spacing: -0.02em; }
      p { color: #f1f5f9; font-size: 1.05rem; line-height: 1.5; }
    }
    .carousel-dots {
      position: absolute;
      bottom: 20px; left: 50%;
      transform: translateX(-50%);
      display: flex; gap: 8px; z-index: 10;
    }
    .dot-btn {
      width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.25); border: none; cursor: pointer;
      transition: all 0.3s ease;
      &.active { background: var(--color-accent); width: 24px; border-radius: 4px; box-shadow: 0 0 8px var(--color-accent-glow); }
    }

    /* Search Results Layout */
    .search-results-layout {
      display: flex; flex-direction: column; gap: var(--space-xl);
    }
    .search-results-main { width: 100%; }
    
    .results-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: var(--space-xl); border-bottom: 1px solid var(--color-border); padding-bottom: 16px;
      h3 { font-size: 1.45rem; font-weight: 850; color: var(--color-text-primary); letter-spacing: -0.01em; margin: 0; }
    }
    .results-actions-row { display: flex; gap: 10px; }
    .loading-state, .empty-state {
      text-align: center; padding: var(--space-3xl) 0;
      background: var(--color-bg-card);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
      .spinner { font-size: 2.2rem; display: block; margin-bottom: 12px; }
      h3 { font-weight: 850; color: var(--color-text-primary); margin-bottom: var(--space-sm); }
      p { color: var(--color-text-secondary); }
    }

    /* Products Listing Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-xl);
    }
    @media (max-width: 1024px) {
      .products-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
    }
    @media (max-width: 600px) {
      .products-grid { grid-template-columns: repeat(1, 1fr); }
    }
    .product-card {
      display: flex; flex-direction: column; overflow: hidden; padding: 0; 
      background: var(--color-bg-card); 
      border: 1px solid var(--color-border); 
      border-radius: var(--radius-xl); 
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      box-shadow: var(--shadow-sm);
      
      &:hover { 
        border-color: rgba(37, 211, 102, 0.4); 
        transform: translateY(-5px); 
        box-shadow: 0 15px 35px -10px var(--color-accent-glow);
        .image-box img { transform: scale(1.06); }
      }
    }
    .image-box {
      height: 200px; position: relative; overflow: hidden; background: #0b0c10; cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    }
    .store-badge-tag {
      position: absolute; bottom: 10px; left: 10px; font-size: 0.72rem; font-weight: 850; color: var(--color-text-primary); 
      background: var(--color-bg-card-glass); 
      border: 1px solid var(--color-border); 
      padding: 4px 10px; border-radius: 6px;
      backdrop-filter: blur(5px);
    }
    .wishlist-btn {
      position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 50%; 
      background: var(--color-bg-surface); 
      border: 1px solid var(--color-border); 
      display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; 
      transition: all 0.2s ease;
      backdrop-filter: blur(5px);
      filter: grayscale(100%);
      &:hover { transform: scale(1.1); filter: grayscale(0%); background: var(--color-bg-surface); }
      &.active { filter: grayscale(0%); background: var(--color-bg-surface); border-color: rgba(239, 68, 68, 0.3); }
    }
    .card-body {
      padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-xs); flex: 1;
      .prod-cat { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: #8b5cf6; letter-spacing: 0.08em; }
      .prod-title { font-size: 1.1rem; font-weight: 850; color: var(--color-text-primary); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; &:hover { color: var(--color-accent); } }
      .offer-badges-row { margin-top: 6px; display: flex; }
      .coupon-badge-pill { font-size: 0.72rem; font-weight: 700; color: var(--color-accent); background: var(--color-accent-dim); border: 1px dashed rgba(37, 211, 102, 0.2); padding: 3px 8px; border-radius: 6px; }
    }
    .card-footer {
      display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: var(--space-md);
      border-top: 1px solid var(--color-border);
      .price { font-size: 1.35rem; font-weight: 900; color: var(--color-text-primary); font-family: var(--font-heading); }
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
    }

    /* Featured Stores Horizontal Scroll */
    .home-section { margin-bottom: var(--space-3xl); }
    .section-title { font-size: 1.6rem; font-weight: 950; color: var(--color-text-primary); margin-bottom: var(--space-xl); letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
    
    .stores-container {
      display: flex;
      gap: 18px;
      padding-bottom: 16px;
      width: max-content;
      animation: autoScrollX 25s linear infinite;
      
      &:hover {
        animation-play-state: paused;
      }
    }
    
    @keyframes autoScrollX {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(-50% - 9px)); } /* Shift by half minus half gap */
    }

    .store-card {
      min-width: 260px; max-width: 280px; padding: 24px; border-radius: 20px; 
      background: var(--color-bg-card); 
      border: 1px solid var(--color-border); 
      display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      
      &:hover {
        border-color: var(--color-accent);
        transform: translateY(-6px);
        box-shadow: 0 15px 35px rgba(37, 211, 102, 0.15);
      }
      
      .store-logo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--color-bg); box-shadow: 0 0 0 2px var(--color-border); transition: all 0.3s ease; }
      &:hover .store-logo { transform: scale(1.05); box-shadow: 0 0 0 2px var(--color-accent); }
      
      .store-info { 
        display: flex; flex-direction: column; gap: 8px; align-items: center; 
        h4 { font-size: 1.2rem; font-weight: 800; color: var(--color-text-primary); margin: 0; } 
        .store-tag { font-size: 0.7rem; font-weight: 850; color: var(--color-accent); text-transform: uppercase; background: var(--color-accent-dim); border: 1px solid rgba(37, 211, 102, 0.2); padding: 4px 12px; border-radius: 20px; letter-spacing: 0.05em; } 
        .store-desc { font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin: 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 40px; } 
      }
      .btn { 
        border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 750; border: 1px solid var(--color-border); background: var(--color-bg-surface); color: var(--color-text-primary); width: 100%; transition: all 0.2s; padding: 10px;
        &:hover {
          background: var(--color-accent); color: #000; border-color: var(--color-accent);
        }
      }
    }

    /* Coupons Pill section */
    .offers-container { 
      display: flex; 
      gap: 12px; 
      padding-bottom: 12px; 
    }
    .offer-pill {
      position: relative;
      display: flex;
      align-items: center;
      padding: 12px 22px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(37, 211, 102, 0.15) 100%);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: var(--radius-md);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(139, 92, 246, 0.6);
        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        .offer-pill-bg { opacity: 1; }
      }
    }
    .offer-pill-bg {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(37, 211, 102, 0.25) 100%);
      opacity: 0; transition: opacity 0.3s;
    }
    .offer-pill-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .offer-pill-discount {
      font-size: 1rem;
      font-weight: 900;
      color: #8b5cf6;
      text-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
    }
    .offer-pill-divider {
      width: 1px; height: 16px; background: rgba(255,255,255,0.2);
    }
    .offer-pill-code {
      font-size: 0.95rem;
      font-weight: 850;
      color: var(--color-text-primary);
      letter-spacing: 0.05em;
    }
    .offer-pill-store {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-weight: 700;
    }
  `]
})
export class MarketplaceHomeComponent implements OnInit {
  searchQuery = '';
  selectedCategory = 'all';
  isSearching = false;
  loadingSearch = false;
  loading = true; // Initial full-page loader

  categories: any[] = [];
  banners: any[] = [];
  featuredStores: any[] = [];
  featuredProducts: any[] = [];
  trendingProducts: any[] = [];
  globalCoupons: any[] = [];
  // Search Results
  searchResults: any[] = [];
  copiedCode: string | null = null;
  isCartBouncing = false;

  // Carousel slider indices
  activeBannerIndex = 0;
  activeBanner: any = { imageUrl: '', title: '' };
  bannerInterval: any;

  // Header badges counters
  wishlistCount = 0;
  cartCount = 0;

  constructor(
    private marketplaceService: MarketplaceService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loading = true;
    Promise.all([
      this.fetchHomeData(),
      this.fetchConfig()
    ]).then(() => {
      // Simulate slight delay to show loader (optional, remove in prod if desired)
      setTimeout(() => this.loading = false, 600);
    });

    // Subscribe to Cart changes
    this.marketplaceService.cart$.subscribe(items => {
      const newCount = items.reduce((sum, item) => sum + item.quantity, 0);
      if (newCount > this.cartCount) {
        this.isCartBouncing = true;
        setTimeout(() => this.isCartBouncing = false, 300);
      }
      this.cartCount = newCount;
    });

    // Subscribe to Wishlist changes
    this.marketplaceService.wishlist$.subscribe(items => {
      this.wishlistCount = items.length;
    });
  }

  fetchHomeData(): Promise<void> {
    return new Promise((resolve) => {
      this.marketplaceService.getHomeData().subscribe({
        next: (res) => {
          if (res.success) {
            this.banners = res.banners || [];
            this.featuredStores = res.featuredStores || [];
            this.featuredProducts = res.featuredProducts || [];
            this.trendingProducts = res.trendingProducts || [];
            this.globalCoupons = res.globalCoupons || [];

            if (this.banners.length > 0) {
              this.activeBanner = this.banners[0];
              this.startBannerRotation();
            }
          }
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  fetchConfig(): Promise<void> {
    return new Promise((resolve) => {
      this.marketplaceService.getConfig().subscribe({
        next: (res) => {
          if (res.success && res.config) {
            this.categories = res.config.categories || [];
          }
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  // Banner rotation logic
  startBannerRotation() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    this.bannerInterval = setInterval(() => {
      if (this.banners.length > 1) {
        this.activeBannerIndex = (this.activeBannerIndex + 1) % this.banners.length;
        this.activeBanner = this.banners[this.activeBannerIndex];
      }
    }, 6000);
  }

  setBannerIndex(idx: number) {
    this.activeBannerIndex = idx;
    this.activeBanner = this.banners[idx];
    this.startBannerRotation();
  }

  // Global search methods
  onSearchChange() {
    if (!this.searchQuery || this.searchQuery.trim().length === 0) {
      if (this.selectedCategory === 'all') {
        this.isSearching = false;
        this.searchResults = [];
      } else {
        this.triggerSearch();
      }
    }
  }

  selectCategory(catName: string) {
    this.selectedCategory = catName;
    this.triggerSearch();
  }

  triggerSearch() {
    if (this.searchQuery.trim().length === 0 && this.selectedCategory === 'all') {
      this.isSearching = false;
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.loadingSearch = true;

    this.marketplaceService.search(this.searchQuery, this.selectedCategory).subscribe({
      next: (res) => {
        if (res.success) {
          this.searchResults = res.products || [];
        }
        this.loadingSearch = false;
      },
      error: () => {
        this.loadingSearch = false;
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.isSearching = false;
    this.searchResults = [];
  }

  // Cart actions
  addToCart(prod: any) {
    this.marketplaceService.addToCart(prod, 1);
    alert(`Added "${prod.title}" to marketplace cart!`);
  }

  // Wishlist actions
  isInWishlist(prodId: string): boolean {
    return this.marketplaceService.isInWishlist(prodId);
  }

  toggleWishlist(event: Event, prod: any) {
    event.stopPropagation();
    event.preventDefault();
    if (this.isInWishlist(prod._id)) {
      this.marketplaceService.removeFromWishlist(prod._id);
    } else {
      this.marketplaceService.addToWishlist(prod);
    }
  }

  // Coupon actions
  copyCouponCode(code: string, slug?: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode = code;
      this.toastService.success(`Coupon code "${code}" copied to clipboard!`, 'Copied!');
      setTimeout(() => this.copiedCode = null, 2000); // Fade after 2 seconds
      if (slug) {
        setTimeout(() => this.router.navigate(['/store', slug]), 800);
      }
    });
  }

  ngOnDestroy() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
  }
}
