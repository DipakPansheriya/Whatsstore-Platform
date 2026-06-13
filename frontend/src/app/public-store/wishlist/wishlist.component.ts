import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { WishlistService } from '../../shared/services/wishlist.service';
import { CartService } from '../../shared/services/cart.service';
import { CommonModule } from '@angular/common';

interface ProductItem {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isAvailable: boolean;
}

@Component({
  selector: 'app-storefront-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="wishlist-wrapper">
      <div class="container">
        
        <!-- Header -->
        <header class="wishlist-header">
          <a [routerLink]="['/store', slug]" class="btn-back">⬅ Return to Storefront</a>
          <h1>❤️ My Store Wishlist</h1>
          <p>Your favorite items saved in this browser session.</p>
        </header>

        <div *ngIf="loading" class="loading-state">
          <span class="spinner">⏳</span> Fetching wishlist items...
        </div>

        <div *ngIf="!loading && wishlistItems.length === 0" class="empty-state card">
          <div class="empty-icon">💔</div>
          <h3>Your wishlist is empty</h3>
          <p>Browse products and tap the ❤️ icon to add them here.</p>
          <a [routerLink]="['/store', slug]" class="btn btn-primary">Browse Catalog</a>
        </div>

        <!-- Wishlist Grid -->
        <div *ngIf="!loading && wishlistItems.length > 0" class="wishlist-grid">
          @for (prod of wishlistItems; track prod._id) {
            <div class="product-card card">
              <div class="image-box">
                <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'" [alt]="prod.title">
                <button (click)="removeFromWishlist(prod._id)" class="btn-remove-wishlist" title="Remove from Wishlist">✕</button>
              </div>
              <div class="card-body">
                <span class="card-category">{{ prod.category }}</span>
                <h3 class="card-title">{{ prod.title }}</h3>
                <div class="card-footer">
                  <span class="price">₹{{ prod.price }}</span>
                  <div class="action-buttons">
                    <button (click)="addToCart(prod)" class="btn btn-sm btn-whatsapp" [disabled]="prod.stock === 0">
                      {{ prod.stock > 0 ? '🛒 Add to Cart' : 'Sold Out' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .wishlist-wrapper {
      min-height: 100vh;
      background: var(--color-bg);
      color: var(--color-text-primary);
      padding: var(--space-2xl) 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-lg);
    }
    .wishlist-header {
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
      h1 { font-size: 2.2rem; font-weight: 800; color: var(--color-text-primary); }
      p { color: var(--color-text-secondary); }
    }
    .loading-state, .empty-state {
      text-align: center;
      padding: var(--space-3xl);
      h3 { font-size: 1.5rem; color: var(--color-text-primary); margin-bottom: 8px; }
      p { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
      .empty-icon { font-size: 4rem; margin-bottom: var(--space-md); }
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-xl);
    }

    .product-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--color-border);
      background: var(--color-bg-card-glass);
      border-radius: var(--radius-lg);
      transition: all var(--transition-normal);
      &:hover {
        border-color: var(--color-accent);
        transform: translateY(-4px);
        box-shadow: 0 15px 35px var(--color-accent-glow);
      }
    }

    .image-box {
      height: 200px;
      position: relative;
      background: var(--color-bg-surface);
      img { width: 100%; height: 100%; object-fit: cover; }
      .btn-remove-wishlist {
        position: absolute;
        top: 10px; right: 10px;
        width: 32px; height: 32px;
        background: var(--color-bg-card-glass);
        border: 1px solid var(--color-border);
        color: #ef4444;
        border-radius: 50%;
        font-size: 0.95rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        &:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
        }
      }
    }

    .card-body {
      padding: var(--space-lg);
      display: flex; flex-direction: column; gap: 6px;
    }
    .card-category { font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700; }
    .card-title { font-size: 1.15rem; font-weight: 800; color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md); }
    .price { font-size: 1.3rem; font-weight: 900; color: #25d366; }
    .btn-whatsapp {
      background: var(--color-accent); color: #000; border: none; padding: 8px 16px; border-radius: var(--radius-md); font-weight: 700; font-size: 0.85rem; cursor: pointer;
      &:hover { opacity: 0.9; }
      &:disabled { background: var(--color-bg-surface); color: var(--color-text-muted); cursor: not-allowed; }
    }
  `]
})
export class WishlistComponent implements OnInit {
  slug = '';
  loading = true;
  products: ProductItem[] = [];
  wishlistItems: ProductItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      if (this.slug) {
        this.wishlistService.loadWishlist(this.slug);
        this.fetchProducts();
      }
    });
  }

  fetchProducts() {
    this.api.get<{ success: boolean; business: any }>(`business/store/${this.slug}`).subscribe({
      next: (res) => {
        if (res.success && res.business) {
          const businessId = res.business._id;
          this.api.get<{ success: boolean; products: ProductItem[] }>(`products/public/${businessId}`).subscribe({
            next: (pRes) => {
              if (pRes.success) {
                this.products = pRes.products;
                this.filterWishlist();
              }
              this.loading = false;
            },
            error: () => this.loading = false
          });
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  filterWishlist() {
    const ids = this.wishlistService.currentWishlist;
    this.wishlistItems = this.products.filter(p => ids.includes(p._id));
  }

  removeFromWishlist(id: string) {
    this.wishlistService.removeFromWishlist(this.slug, id);
    this.filterWishlist();
  }

  addToCart(prod: ProductItem) {
    this.cartService.addToCart(this.slug, prod._id, 1).subscribe({
      next: (res) => {
        if (res.success) {
          alert(`Added "${prod.title}" to cart successfully!`);
        }
      },
      error: (err) => alert(err.message || 'Failed to add item to cart')
    });
  }
}
