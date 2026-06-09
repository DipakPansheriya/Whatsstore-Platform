import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule, RouterLink, FormsModule],
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
      <div class="container page-content">
        
        <!-- Breadcrumb link -->
        <div class="breadcrumb">
          <a [routerLink]="['/store', slug]">⬅ Return to Storefront</a>
        </div>

        <div class="detail-grid">
          <!-- Left Column: Gallery -->
          <div class="gallery-card card">
            <div class="active-image">
              <img [src]="activeImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'" [alt]="product.title">
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
            <span class="category-tag">{{ product.category }}</span>
            <span *ngIf="product.featured" class="featured-tag">⭐ Featured Item</span>
            
            <h1 class="product-title">{{ product.title }}</h1>
            
            <div class="price-row">
              <span class="price">₹{{ product.price }}</span>
              <span class="stock-badge" [class.out]="product.stock === 0" [class.low]="product.stock > 0 && product.stock <= 3">
                {{ product.stock > 0 ? (product.stock <= 3 ? 'Low Stock' : 'In Stock') : 'Sold Out' }}
              </span>
            </div>

            <p class="description">{{ product.description || 'No description available for this product.' }}</p>

            <button (click)="openCheckoutDialog()" class="btn btn-whatsapp-large w-full" [disabled]="product.stock === 0">
              🟢 Order on WhatsApp
            </button>
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
                <div *ngIf="reviewSuccess" class="alert alert-success">✅ Review submitted successfully!</div>

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

      <!-- WhatsApp checkout customer dialog form popup overlay -->
      <div class="modal-overlay" *ngIf="showCheckout">
        <div class="modal-card card">
          <header class="modal-header">
            <h3>Complete Your WhatsApp Order</h3>
            <button (click)="closeCheckoutDialog()" class="btn-close">×</button>
          </header>
          
          <div class="modal-body">
            <p>Please enter your contact details. This registers your order on our system and lets us verify delivery info in chat.</p>
            
            <form (ngSubmit)="onConfirmCheckout()" class="checkout-form">
              <div class="form-group">
                <label for="chk-name">Your Full Name</label>
                <input id="chk-name" type="text" name="customerName" [(ngModel)]="customerName" placeholder="e.g. John Doe" required>
              </div>
              <div class="form-group">
                <label for="chk-phone">Contact Phone / WhatsApp</label>
                <input id="chk-phone" type="tel" name="customerPhone" [(ngModel)]="customerPhone" placeholder="e.g. +91 99999 99999" required>
              </div>
              
              <div *ngIf="checkoutError" class="alert alert-danger">❌ {{ checkoutError }}</div>

              <div class="modal-actions">
                <button type="button" (click)="closeCheckoutDialog()" class="btn btn-ghost">Cancel</button>
                <button type="submit" class="btn btn-whatsapp" [disabled]="submittingOrder">
                  {{ submittingOrder ? 'Registering Order...' : '🟢 Open WhatsApp' }}
                </button>
              </div>
            </form>
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
      background: #08090c;
      color: #e2e8f0;
      padding: var(--space-xl) 0;
    }
    .page-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
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
      background: rgba(17, 19, 25, 0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      transition: all var(--transition-normal);
      &:hover {
        border-color: rgba(255, 255, 255, 0.12);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      }
    }
    .active-image {
      height: 420px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: #0f1115;
      border: 1px solid rgba(255,255,255,0.04);
      box-shadow: inset 0 0 20px rgba(0,0,0,0.6);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-slow);
        &:hover {
          transform: scale(1.03);
        }
      }
    }
    @media (max-width: 500px) {
      .active-image {
        height: 280px;
      }
    }
    .thumbnails-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      gap: var(--space-sm);
      margin-top: var(--space-sm);
    }
    .thumb-btn {
      height: 70px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      background: #0f1115;
      cursor: pointer;
      transition: all var(--transition-normal);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.6;
        transition: opacity var(--transition-fast);
      }
      &:hover {
        transform: translateY(-2px);
        img { opacity: 0.9; }
      }
      &.selected {
        border-color: var(--color-accent);
        box-shadow: 0 0 10px var(--color-accent-glow);
        img { opacity: 1; }
      }
    }

    .info-card {
      background: rgba(17, 19, 25, 0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      padding: var(--space-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      transition: all var(--transition-normal);
      &:hover {
        border-color: rgba(255, 255, 255, 0.12);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      }
    }
    @media (max-width: 500px) {
      .info-card {
        padding: var(--space-lg);
      }
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
      box-shadow: 0 4px 12px rgba(255, 200, 87, 0.2);
    }
    .product-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #fff;
      line-height: 1.2;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: var(--space-xs) 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: var(--space-md);
    }
    .price {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
    }
    .stock-badge {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-accent);
      background: var(--color-accent-dim);
      border: 1px solid var(--color-accent-glow);
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      &::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 8px currentColor;
      }
      &.low {
        color: var(--color-warning);
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.2);
      }
      &.out {
        color: var(--color-danger);
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.2);
      }
    }
    .description {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--color-text-secondary);
    }
    
    .btn-whatsapp-large {
      background: var(--color-accent);
      color: #000;
      border: none;
      padding: 16px;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 8px 25px var(--color-accent-glow);
      transition: all var(--transition-normal);
      &:hover:not([disabled]) {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px var(--color-accent-glow);
        opacity: 0.95;
      }
      &:disabled {
        background: rgba(255,255,255,0.05);
        color: var(--color-text-muted);
        box-shadow: none;
        cursor: not-allowed;
      }
    }
    .w-full { width: 100%; }

    /* Reviews section styles */
    .reviews-container {
      margin-top: var(--space-3xl);
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: var(--space-2xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .reviews-title-block {
      h2 {
        font-size: 1.8rem;
        font-weight: 800;
        color: #fff;
        margin-bottom: var(--space-xs);
      }
      p {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
      }
    }
    
    /* Dynamic Summary Card */
    .rating-summary-card {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: var(--space-2xl);
      padding: var(--space-xl);
      background: rgba(17, 19, 25, 0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      align-items: center;
      &:hover {
        border-color: rgba(255, 255, 255, 0.1);
      }
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
        text-align: center;
      }
    }
    .summary-left-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      padding-right: var(--space-xl);
      @media (max-width: 600px) {
        border-right: none;
        padding-right: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: var(--space-lg);
      }
      .big-score-num {
        font-size: 4.5rem;
        font-weight: 900;
        color: #fff;
        line-height: 1;
        font-family: var(--font-heading);
      }
      .stars-gold-row {
        color: #ffc857;
        font-size: 1.4rem;
        letter-spacing: 2px;
      }
      .based-count {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
      }
    }
    .summary-right-distribution {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .dist-row {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }
    .dist-label {
      width: 35px;
      font-weight: 600;
      text-align: right;
    }
    .dist-track {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.05);
      border-radius: var(--radius-pill);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.02);
    }
    .dist-fill {
      height: 100%;
      background: linear-gradient(90deg, #ffc857, var(--color-accent));
      border-radius: var(--radius-pill);
      transition: width var(--transition-slow);
      box-shadow: 0 0 8px rgba(255, 200, 87, 0.3);
    }
    .dist-count-label {
      width: 25px;
      text-align: left;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    /* Grid layout */
    .reviews-grid {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: var(--space-xl);
      align-items: start;
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    
    .review-form-wrapper {
      background: rgba(17, 19, 25, 0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      h3 { font-size: 1.25rem; color: #fff; }
      .form-hint { font-size: 0.8rem; color: var(--color-text-secondary); }
    }
    .sub-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }
      input, select, textarea {
        padding: 14px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        font-size: 0.95rem;
        outline: none;
        font-family: var(--font-base);
        transition: all var(--transition-fast);
        &:focus {
          border-color: var(--color-accent);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 0 12px var(--color-accent-glow);
        }
      }
    }
    
    /* Interactive Stars Selector */
    .star-rating-selector {
      display: flex;
      gap: var(--space-xs);
    }
    .star-selector-btn {
      background: transparent;
      border: none;
      font-size: 2rem;
      color: rgba(255,255,255,0.1);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: all var(--transition-fast);
      &:hover {
        transform: scale(1.2);
        color: #ffc857;
      }
      &.active {
        color: #ffc857;
        text-shadow: 0 0 12px rgba(255, 200, 87, 0.5);
      }
    }
    .rating-label-desc {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .btn-submit-rev {
      width: 100%;
      justify-content: center;
      padding: 14px;
      font-weight: 700;
    }
    .alert {
      padding: 12px 16px;
      font-size: 0.85rem;
      border-radius: var(--radius-md);
    }
    .alert-success { background: rgba(37,211,102,0.1); color: #25d366; border: 1px solid rgba(37,211,102,0.2); }
    .alert-danger { background: rgba(255,77,109,0.1); color: var(--color-danger); border: 1px solid rgba(255,77,109,0.2); }

    .reviews-list-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .empty-reviews {
      padding: var(--space-2xl);
      text-align: center;
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-lg);
      background: rgba(17, 19, 25, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      .empty-stars {
        color: rgba(255,255,255,0.06);
        font-size: 1.8rem;
      }
      h3 { font-size: 1.15rem; color: #fff; }
      p { font-size: 0.9rem; color: var(--color-text-secondary); max-width: 340px; }
    }
    
    .reviews-feed {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .review-item-card {
      background: rgba(17, 19, 25, 0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      transition: all var(--transition-normal);
      &:hover {
        border-color: var(--color-accent);
        box-shadow: 0 8px 25px var(--color-accent-glow);
        transform: translateY(-2px);
      }
    }
    .review-card-top {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }
    .buyer-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1rem;
      font-family: var(--font-heading);
      box-shadow: 0 4px 10px var(--color-accent-glow);
    }
    .buyer-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      strong { font-size: 0.95rem; color: #fff; }
      .verified-badge {
        font-size: 0.75rem;
        color: #25d366;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
    }
    .buyer-stars {
      color: #ffc857;
      font-size: 0.95rem;
      letter-spacing: 1px;
    }
    .review-text-comment {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.6;
      font-style: italic;
      border-left: 2px solid var(--color-accent);
      padding-left: var(--space-sm);
    }

    /* Overlay checkout dialog */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(12px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-md);
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal-card {
      width: 100%;
      max-width: 460px;
      padding: 0;
      overflow: hidden;
      background: rgba(23, 26, 35, 0.85);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-lg);
      box-shadow: 0 25px 50px rgba(0,0,0,0.6);
      transform: translateY(0);
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .modal-header {
      height: 60px;
      padding: 0 var(--space-lg);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      h3 { font-size: 1.15rem; font-weight: 700; color: #fff; }
    }
    .btn-close {
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      font-size: 1.8rem;
      cursor: pointer;
      line-height: 1;
      padding: var(--space-xs);
      transition: color var(--transition-fast);
      &:hover { color: #fff; }
    }
    .modal-body {
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      p { font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.6; }
    }
    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .btn-whatsapp {
      background: #25d366;
      color: #000;
      border: none;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
      transition: all var(--transition-normal);
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(37, 211, 102, 0.3);
      }
    }

    /* Themes override accent styles */
    .theme-classic-green {
      --color-accent: #25d366;
      --color-accent-glow: rgba(37, 211, 102, 0.25);
    }
    .theme-ocean-blue {
      --color-accent: #00b4d8;
      --color-accent-glow: rgba(0, 180, 216, 0.25);
    }
    .theme-obsidian-dark {
      --color-accent: #f1f5f9;
      --color-accent-glow: rgba(241, 245, 249, 0.15);
      .buyer-avatar { color: #000; background: #fff; }
    }
    .theme-warm-amber {
      --color-accent: #ff9f1c;
      --color-accent-glow: rgba(255, 159, 28, 0.25);
    }

    /* Templates */
    .template-Salon {
      font-family: Georgia, serif;
      h1, h2, h3, .product-title { font-family: Georgia, serif; }
    }
    .template-Restaurant {
      font-family: 'Outfit', sans-serif;
      h1, h2, h3, .product-title { font-family: 'Outfit', sans-serif; font-weight: 800; }
    }
    .template-Freelancer {
      font-family: monospace;
      h1, h2, h3, .product-title { font-family: monospace; }
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

  showCheckout = false;
  customerName = '';
  customerPhone = '';
  submittingOrder = false;
  checkoutError = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      this.productId = params.get('productId') || '';
      if (this.slug && this.productId) {
        this.fetchStorefrontAndProduct();
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

  openCheckoutDialog() {
    this.showCheckout = true;
    this.checkoutError = '';
    this.customerName = '';
    this.customerPhone = '';
  }

  closeCheckoutDialog() {
    this.showCheckout = false;
  }

  onConfirmCheckout() {
    if (!this.customerName || !this.customerPhone) {
      this.checkoutError = 'Please provide your name and phone details.';
      return;
    }
    
    if (!this.product || !this.business) return;

    this.checkoutError = '';
    this.submittingOrder = true;

    const orderData = {
      business: this.business._id,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerWhatsapp: this.customerPhone, // Map both
      items: [
        {
          product: this.product._id,
          name: this.product.title,
          price: this.product.price,
          quantity: 1
        }
      ],
      totalAmount: this.product.price,
      status: 'pending'
    };

    // Save order in database
    this.api.post<{ success: boolean }>('orders', orderData).subscribe({
      next: (res) => {
        if (res.success) {
          this.trackCheckoutClick();
          
          // Generate WhatsApp text format (Step 12)
          const text = `Hello, I want to order:\n\nProduct: *${this.product?.title}*\nPrice: ₹${this.product?.price}\nQuantity: 1\n\nName: ${this.customerName}\nPhone: ${this.customerPhone}`;
          const whatsappUrl = `https://wa.me/${this.business.whatsappNumber}?text=${encodeURIComponent(text)}`;
          
          // Open WhatsApp link (Step 13)
          window.open(whatsappUrl, '_blank');
          
          this.showCheckout = false;
          this.submittingOrder = false;
        }
      },
      error: () => {
        this.checkoutError = 'Failed to record order. Please try again.';
        this.submittingOrder = false;
      }
    });
  }

  trackCheckoutClick() {
    if (this.business) {
      this.api.post('analytics/track', { businessId: this.business._id, event: 'whatsapp_click', productId: this.productId }).subscribe();
    }
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
