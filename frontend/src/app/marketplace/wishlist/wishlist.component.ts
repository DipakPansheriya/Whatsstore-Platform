import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarketplaceService } from '../../shared/services/marketplace.service';

@Component({
  selector: 'app-marketplace-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="marketplace-wrapper animate-fade-in-up">
      <!-- Premium Glass Header -->
      <header class="marketplace-header glass-header">
        <div class="header-container">
          <a routerLink="/marketplace" class="brand-title">
            <span class="logo-emoji">⚡</span> WhatsStore <span class="badge">Marketplace</span>
          </a>
          
          <div class="header-nav">
            <a routerLink="/marketplace/cart" class="nav-link-btn cart-btn">
              🛒 Cart <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </a>
            <a routerLink="/marketplace" class="nav-link-btn">Marketplace Home</a>
          </div>
        </div>
      </header>

      <div class="container page-content">
        <div class="breadcrumb">
          <a routerLink="/marketplace">⬅ Return to Marketplace</a>
        </div>

        <h2 class="section-title">❤️ Your Marketplace Wishlist</h2>

        <div *ngIf="wishlistItems.length === 0" class="empty-state card">
          <div class="empty-icon">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Explore the marketplace catalog and save products you love.</p>
          <a routerLink="/marketplace" class="btn btn-primary btn-sm" style="margin-top: 10px;">Browse Marketplace</a>
        </div>

        <div *ngIf="wishlistItems.length > 0" class="products-grid">
          @for (prod of wishlistItems; track prod._id) {
            <div class="product-card card">
              <div class="image-box" [routerLink]="['/marketplace/product', prod._id]">
                <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'" [alt]="prod.title">
                <span class="store-badge-tag">{{ prod.business?.name }}</span>
                <button class="wishlist-btn active" (click)="removeFromWishlist($event, prod._id)">❤️</button>
              </div>
              <div class="card-body">
                <span class="prod-cat">{{ prod.category }}</span>
                <h4 class="prod-title" [routerLink]="['/marketplace/product', prod._id]">{{ prod.title }}</h4>
                <div class="card-footer">
                  <span class="price">₹{{ prod.price }}</span>
                  <button (click)="addToCart(prod)" class="btn btn-sm btn-accent-cart">
                    🛒 Add
                  </button>
                </div>
              </div>
            </div>
          }
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
      background: rgba(10, 11, 16, 0.85);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      border-bottom: 1px solid var(--color-border);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
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
      color: #fff;
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
      
      &:hover { color: #fff; background: rgba(255,255,255,0.05); }
    }
    .cart-badge {
      font-size: 0.75rem;
      font-weight: 850;
      padding: 2px 7px;
      border-radius: var(--radius-pill);
      background: var(--color-accent); color: #000;
      box-shadow: 0 0 10px rgba(37, 211, 102, 0.25);
    }
    .cart-btn {
      border: 1px solid var(--color-border);
      background: rgba(255,255,255,0.04);
      color: #fff;
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
 
    .section-title { font-size: 1.6rem; font-weight: 950; color: #fff; margin-bottom: var(--space-xl); letter-spacing: -0.02em; }
    .empty-state {
      text-align: center; padding: var(--space-3xl) 0;
      background: rgba(255, 255, 255, 0.01);
      border: 1px dashed rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-lg);
      .empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; color: var(--color-danger); text-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
      h3 { font-weight: 850; color: #fff; margin-bottom: var(--space-sm); }
      p { color: var(--color-text-secondary); }
    }
 
    /* Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--space-xl);
    }
    .product-card {
      display: flex; flex-direction: column; overflow: hidden; padding: 0; 
      background: rgba(10, 11, 16, 0.45); 
      border: 1px solid var(--color-border); 
      border-radius: var(--radius-xl); 
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      
      &:hover { 
        border-color: rgba(37, 211, 102, 0.3); 
        transform: translateY(-5px); 
        box-shadow: 0 15px 35px -10px rgba(37, 211, 102, 0.25);
        .image-box img { transform: scale(1.06); }
      }
    }
    .image-box {
      height: 190px; position: relative; overflow: hidden; background: #0b0c10; cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    }
    .store-badge-tag {
      position: absolute; bottom: 10px; left: 10px; font-size: 0.72rem; font-weight: 850; color: #fff; 
      background: rgba(10, 11, 16, 0.85); 
      border: 1px solid rgba(255, 255, 255, 0.1); 
      padding: 4px 10px; border-radius: 6px;
      backdrop-filter: blur(5px);
    }
    .wishlist-btn {
      position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 50%; 
      background: rgba(10, 11, 16, 0.85); 
      border: 1px solid rgba(255, 255, 255, 0.15); 
      display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; 
      transition: all 0.2s ease;
      backdrop-filter: blur(5px);
      filter: grayscale(0%);
      &:hover { transform: scale(1.1); background: rgba(10, 11, 16, 0.95); }
      &.active { background: rgba(10, 11, 16, 0.95); border-color: rgba(239, 68, 68, 0.3); }
    }
    .card-body {
      padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-xs); flex: 1;
      .prod-cat { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: #8b5cf6; letter-spacing: 0.08em; }
      .prod-title { font-size: 1.1rem; font-weight: 850; color: #fff; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; &:hover { color: var(--color-accent); } }
    }
    .card-footer {
      display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: var(--space-md);
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      .price { font-size: 1.35rem; font-weight: 900; color: #fff; font-family: var(--font-heading); }
      .btn-accent-cart { 
        background: rgba(37, 211, 102, 0.08); 
        color: var(--color-accent); 
        border: 1px solid rgba(37, 211, 102, 0.2); 
        padding: 8px 18px; font-weight: 850; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.25s ease; 
        &:hover { 
          background: var(--color-accent); 
          color: #000; 
          border-color: var(--color-accent);
          box-shadow: 0 0 15px rgba(37, 211, 102, 0.3);
        } 
      }
    }
  `]
})
export class WishlistComponent implements OnInit {
  wishlistItems: any[] = [];
  cartCount = 0;

  constructor(private marketplaceService: MarketplaceService) {}

  ngOnInit() {
    this.marketplaceService.wishlist$.subscribe(items => {
      this.wishlistItems = items;
    });

    this.marketplaceService.cart$.subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });
  }

  removeFromWishlist(event: Event, prodId: string) {
    event.stopPropagation();
    event.preventDefault();
    this.marketplaceService.removeFromWishlist(prodId);
  }

  addToCart(prod: any) {
    this.marketplaceService.addToCart(prod, 1);
    alert(`Added "${prod.title}" to marketplace cart!`);
  }
}
