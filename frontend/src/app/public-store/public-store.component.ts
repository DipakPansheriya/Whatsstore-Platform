import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="loading" class="loading-state">
      <span class="spinner">🏪</span> Loading storefront...
    </div>

    <div *ngIf="!loading && notFound" class="not-found-state">
      <div class="empty-icon">🏪</div>
      <h2>Storefront Not Found</h2>
      <p>The storefront slug you requested does not exist or has not been published yet.</p>
      <a routerLink="/" class="btn btn-primary">Return to SiteFlow</a>
    </div>

    <!-- Active Storefront -->
    <div *ngIf="!loading && !notFound && business" [className]="'storefront-wrapper theme-' + getThemeClass() + ' template-' + getTemplateClass()">
      
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
              <a [routerLink]="['/store', slug, 'product', prod._id]" (click)="trackProductClick(prod._id)" class="product-card card">
                <div class="image-box">
                  <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'" 
                       [alt]="prod.title" loading="lazy">
                  <span *ngIf="prod.featured" class="card-badge featured-badge">⭐ Featured</span>
                  <span *ngIf="prod.stock === 0" class="card-badge sold-out-badge">Sold Out</span>
                </div>
                <div class="card-body">
                  <span class="card-category">{{ prod.category }}</span>
                  <h3 class="card-title">{{ prod.title }}</h3>
                  <div class="card-footer">
                    <span class="price">₹{{ prod.price }}</span>
                    <span class="btn-view">Details ➡️</span>
                  </div>
                </div>
              </a>
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
          <p>We'll helper answer size queries, delivery durations, or customizations instantly.</p>
          <a [href]="getWhatsAppLink()" target="_blank" class="btn btn-whatsapp-large">
            🟢 Message via WhatsApp
          </a>
        </div>
      </section>

      <footer class="public-footer">
        <div class="section-container text-center">
          <p>&copy; 2025 {{ business.name }}. All rights reserved.</p>
          <p class="branding">Powered by <a routerLink="/">SiteFlow</a></p>
        </div>
      </footer>
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
      color: #fff;
    }
    .not-found-state p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-xl);
      max-width: 400px;
    }
    
    /* Device / Theme base wrapper */
    .storefront-wrapper {
      min-height: 100vh;
      background: #06070a;
      color: #e2e8f0;
      position: relative;
    }
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-lg);
    }
    .text-center { text-align: center; }

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
      z-index: 999;
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
      background-color: #111317;
    }
    .hero-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.68);
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
        color: #cbd5e1;
        max-width: 600px;
        margin: var(--space-md) auto var(--space-xl);
        line-height: 1.6;
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
      color: #fff;
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
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      color: #94a3b8;
      border-radius: var(--radius-pill);
      cursor: pointer;
      font-weight: 700;
      font-size: 0.9rem;
      transition: all var(--transition-normal);
      white-space: nowrap;
      &:hover {
        background: rgba(255,255,255,0.05);
        color: #fff;
      }
      &.active {
        background: #fff;
        color: #000;
        border-color: #fff;
        box-shadow: 0 4px 15px rgba(255, 255, 255, 0.15);
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
      border: 1px solid rgba(255,255,255,0.05);
      background: rgba(17, 19, 25, 0.45);
      transition: all var(--transition-normal);
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-lg);
      &:hover {
        border-color: var(--color-accent-glow);
        transform: translateY(-4px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.55);
        .image-box img {
          transform: scale(1.04);
        }
      }
    }
    .image-box {
      height: 220px;
      position: relative;
      overflow: hidden;
      background: #111317;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-normal);
      }
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
      padding: var(--space-lg);
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
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-md);
    }
    .price {
      font-size: 1.35rem;
      font-weight: 900;
      color: #fff;
      font-family: var(--font-heading);
    }
    .btn-view {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-accent);
    }
    .empty-catalog {
      text-align: center;
      padding: var(--space-3xl);
      h3 { font-weight: 800; color: #fff; }
      p { color: var(--color-text-secondary); }
    }
 
    /* About Section */
    .about-section {
      padding: var(--space-3xl) 0;
      background: rgba(17, 19, 25, 0.3);
      border-top: 1px solid rgba(255,255,255,0.02);
      border-bottom: 1px solid rgba(255,255,255,0.02);
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
      border: 1px solid rgba(255,255,255,0.08);
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
        color: #fff;
      }
      p {
        font-size: 1rem;
        color: var(--color-text-secondary);
        line-height: 1.7;
      }
    }
    .about-meta {
      font-size: 0.9rem;
      color: #cbd5e1;
      background: rgba(255,255,255,0.03);
      padding: 12px 18px;
      border-radius: var(--radius-md);
      display: inline-block;
      border: 1px solid rgba(255, 255, 255, 0.05);
      strong { color: #fff; }
    }
 
    /* CTA Banner Section */
    .cta-section {
      padding: var(--space-3xl) 0;
      background: linear-gradient(180deg, transparent, rgba(37, 211, 102, 0.03));
      h2 {
        font-size: clamp(1.8rem, 4vw, 2.5rem);
        margin-bottom: var(--space-sm);
        font-weight: 900;
        color: #fff;
      }
      p {
        color: var(--color-text-secondary);
        margin-bottom: var(--space-xl);
      }
    }
    .btn-whatsapp-large {
      background: #25d366;
      color: #000;
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
      box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
      transition: all var(--transition-normal);
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(37, 211, 102, 0.45);
        opacity: 1;
      }
    }
 
    /* Public Footer styles */
    .public-footer {
      padding: var(--space-2xl) 0;
      background: #040507;
      border-top: 1px solid rgba(255,255,255,0.02);
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
          &:hover { color: #fff; }
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

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      if (this.slug) {
        this.fetchStorefront();
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
}
