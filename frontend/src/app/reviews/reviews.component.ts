import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ToastService } from '../shared/services/toast.service';

interface ReviewItem {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  product: { _id: string; title: string; images: string[] };
  createdAt: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reviews-dashboard animate-fade-in-up">
      <header class="page-header">
        <div class="header-content">
          <span class="badge">Customer Feedback</span>
          <h1>Reviews Management</h1>
          <p>Review, approve, and manage customer product feedback before it becomes public.</p>
        </div>
      </header>

      <!-- Top Summary Statistics -->
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon gray">⭐</div>
          <div class="stat-info">
            <span class="stat-label">Total Reviews</span>
            <span class="stat-value">{{ reviews.length }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon yellow">🟡</div>
          <div class="stat-info">
            <span class="stat-label">Pending</span>
            <span class="stat-value">{{ getPendingCount() }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon green">🟢</div>
          <div class="stat-info">
            <span class="stat-label">Approved</span>
            <span class="stat-value">{{ getApprovedCount() }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon red">🔴</div>
          <div class="stat-info">
            <span class="stat-label">Rejected</span>
            <span class="stat-value">{{ getRejectedCount() }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon gold">⭐</div>
          <div class="stat-info">
            <span class="stat-label">Avg Rating</span>
            <span class="stat-value">{{ getAverageRating() }}</span>
          </div>
        </div>
      </div>

       <!-- Bulk Actions Bar -->
      <div class="bulk-actions-bar" *ngIf="!selectedReviewForDrawer && selectedReviewIds.length > 0">
        <span class="selected-count">{{ selectedReviewIds.length }} review(s) selected</span>
        <div class="actions">
          <button class="btn btn-success" (click)="bulkUpdateStatus('APPROVED')">Approve Selected</button>
          <button class="btn btn-danger" (click)="bulkUpdateStatus('REJECTED')">Reject Selected</button>
        </div>
      </div>

      <!-- Main Grid View -->
      <ng-container *ngIf="!selectedReviewForDrawer">
        <!-- Filters Toolbar -->
        <div class="filters-toolbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Search by customer or product..." class="filter-input">
          </div>
          <div class="filter-group">
            <select [(ngModel)]="statusFilter" class="filter-select">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select [(ngModel)]="ratingFilter" class="filter-select">
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars & Up</option>
              <option value="3">3 Stars & Up</option>
            </select>
            <select [(ngModel)]="sortBy" class="filter-select">
              <option value="newest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_rating">Highest Rating</option>
              <option value="lowest_rating">Lowest Rating</option>
            </select>
          </div>
        </div>

        <!-- Reviews Grid -->
        <div *ngIf="!loading && getFilteredReviews().length > 0" class="reviews-grid">
          <div class="review-card glass-card" *ngFor="let review of getFilteredReviews()">
            
            <!-- Large Image Top Area -->
            <div class="card-img-wrapper" (click)="openDrawer(review)">
              <div class="img-overlay">
                <input type="checkbox" class="card-checkbox"
                       [checked]="selectedReviewIds.includes(review._id)"
                       (change)="toggleSelection(review._id); $event.stopPropagation()"
                       (click)="$event.stopPropagation()">
                <div class="status-badge" [ngClass]="review.status.toLowerCase()">
                  {{ review.status }}
                </div>
              </div>
              <img [src]="review.product.images[0] || 'https://placehold.co/400x250?text=No+Image'" alt="Product" class="main-prod-img">
            </div>

            <!-- Content Area -->
            <div class="card-content" (click)="openDrawer(review)">
              <h4 class="prod-title" title="{{ review.product.title }}">{{ review.product.title }}</h4>
              
              <div class="reviewer-meta mt-2">
                <div class="avatar">{{ getInitials(review.name) }}</div>
                <strong>{{ review.name }}</strong>
                <div class="rating-stars ml-auto">
                  <span class="star" *ngFor="let s of [1,2,3,4,5]" [class.filled]="s <= review.rating">★</span>
                </div>
              </div>

              <p class="comment-text">"{{ review.comment | slice:0:90 }}{{ review.comment.length > 90 ? '...' : '' }}"</p>
            </div>

            <!-- Action Buttons Footer -->
            <div class="card-footer">
              <span class="date-text">{{ review.createdAt | date:'mediumDate' }}</span>
              <div class="quick-actions">
                <button *ngIf="review.status !== 'APPROVED'" (click)="updateStatus(review._id, 'APPROVED'); $event.stopPropagation()" class="btn btn-sm btn-success">Approve</button>
                <button *ngIf="review.status !== 'REJECTED'" (click)="updateStatus(review._id, 'REJECTED'); $event.stopPropagation()" class="btn btn-sm btn-danger">Reject</button>
              </div>
            </div>

          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="!loading && getFilteredReviews().length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No Reviews Found</h3>
          <p>You don't have any reviews matching your current filters.</p>
          <button class="btn btn-outline mt-3" (click)="statusFilter='ALL'; ratingFilter='ALL'; searchTerm=''">Clear Filters</button>
        </div>
      </ng-container>

      <!-- Inline Detail View (Replaces Grid) -->
      <div class="inline-review-view" *ngIf="selectedReviewForDrawer">
        
        <div class="inline-view-header">
          <button class="btn btn-outline" (click)="closeDrawer()">
            <span style="margin-right: 8px;">←</span> Back to Reviews
          </button>
          <div class="inline-actions">
            <button *ngIf="selectedReviewForDrawer.status !== 'APPROVED'" class="btn btn-success" (click)="updateStatus(selectedReviewForDrawer._id, 'APPROVED'); closeDrawer()">✅ Approve Review</button>
            <button *ngIf="selectedReviewForDrawer.status !== 'REJECTED'" class="btn btn-danger" (click)="updateStatus(selectedReviewForDrawer._id, 'REJECTED'); closeDrawer()">❌ Reject Review</button>
          </div>
        </div>

        <div class="inline-view-content glass-card">
          <div class="inline-view-grid">
            
            <!-- Left Side: Product Info -->
            <div class="inline-prod-column">
              <div class="compact-prod-card inline-prod">
                <img [src]="selectedReviewForDrawer.product.images[0] || 'https://placehold.co/400x400?text=No+Image'" alt="Product" class="inline-prod-img">
                <h3 class="inline-prod-title">{{ selectedReviewForDrawer.product.title }}</h3>
                <div class="drawer-badge" [ngClass]="selectedReviewForDrawer.status.toLowerCase()">Current Status: {{ selectedReviewForDrawer.status }}</div>
              </div>
            </div>

            <!-- Right Side: Review Detail -->
            <div class="inline-review-column">
              <!-- Customer & Rating Hero -->
              <div class="drawer-hero">
                <div class="customer-profile-large">
                  <div class="drawer-avatar-large">{{ getInitials(selectedReviewForDrawer.name) }}</div>
                  <div class="customer-meta">
                    <h3 class="customer-name">{{ selectedReviewForDrawer.name }}</h3>
                    <span class="drawer-date">Submitted: {{ selectedReviewForDrawer.createdAt | date:'mediumDate' }}</span>
                  </div>
                </div>
                <div class="drawer-rating-large">
                  <span class="star" *ngFor="let s of [1,2,3,4,5]" [class.filled]="s <= selectedReviewForDrawer.rating">★</span>
                  <span class="rating-number">{{ selectedReviewForDrawer.rating }}/5</span>
                </div>
              </div>

              <!-- Review Comment Box -->
              <div class="review-quote-box mt-4">
                <span class="quote-icon">❝</span>
                <p class="drawer-comment-large">{{ selectedReviewForDrawer.comment }}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .reviews-dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-md) 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }
    .page-header h1 {
      font-size: 2.2rem; font-weight: 900; margin: var(--space-xs) 0; color: var(--color-text-primary);
    }
    .page-header p { color: var(--color-text-secondary); }
    .badge { padding: 4px 12px; background: rgba(255,255,255,0.05); border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: var(--color-accent); border: 1px solid var(--color-border); }

    /* Top Summary Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-md);
    }
    .stat-card {
      padding: var(--space-lg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: var(--space-md);
      transition: all var(--transition-normal);
      &:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-color: var(--color-border-hover); }
    }
    .stat-icon { font-size: 2rem; }
    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 1.8rem; font-weight: 800; color: var(--color-text-primary); line-height: 1; }

    /* Filters Section */
    .filters-toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 250px;
    }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); }
    .filter-input {
      width: 100%;
      padding: 12px 14px 12px 40px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-family: var(--font-base);
      font-size: 0.95rem;
      outline: none;
      transition: all var(--transition-fast);
      &:focus { border-color: var(--color-accent); box-shadow: 0 0 0 2px var(--color-accent-dim); }
    }
    .filter-select {
      padding: 12px 14px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-family: var(--font-base);
      font-size: 0.95rem;
      outline: none;
      transition: all var(--transition-fast);
      min-width: 160px;
      &:focus { border-color: var(--color-accent); box-shadow: 0 0 0 2px var(--color-accent-dim); }
    }
    .filter-group { display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center; }

    /* Bulk Actions Bar */
    .bulk-actions-bar {
      position: sticky; top: 80px; z-index: 50;
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(10px);
      border: 1px solid var(--color-accent);
      padding: var(--space-md) var(--space-xl);
      border-radius: var(--radius-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 10px 30px var(--color-accent-dim);
    }
    .selected-count { font-weight: 800; color: var(--color-text-primary); font-size: 1.1rem; }
    .bulk-buttons { display: flex; gap: var(--space-sm); }

    /* Reviews Grid */
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--space-lg);
    }
    .review-card {
      display: flex; flex-direction: column;
      padding: var(--space-sm);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer; background: var(--color-bg-card);
      &:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--color-border-hover); }
    }

    .card-img-wrapper {
      position: relative; width: 100%; height: 110px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 8px;
      background: var(--color-bg-surface);
    }
    .main-prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .review-card:hover .main-prod-img { transform: scale(1.05); }
    
    .img-overlay { position: absolute; top: 0; left: 0; right: 0; padding: 10px; display: flex; justify-content: space-between; align-items: flex-start; z-index: 10; }
    .card-checkbox { width: 20px; height: 20px; cursor: pointer; accent-color: var(--color-accent); background: #fff; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
    
    .status-badge {
      font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 12px; text-transform: uppercase;
      backdrop-filter: blur(4px); box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      &.pending { background: rgba(234, 179, 8, 0.9); color: #fff; }
      &.approved { background: rgba(37, 211, 102, 0.9); color: #fff; }
      &.rejected { background: rgba(239, 68, 68, 0.9); color: #fff; }
    }

    .card-content { flex: 1; display: flex; flex-direction: column; }
    .prod-title { font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; margin: 0; }
    
    .reviewer-meta { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--color-text-primary); margin-bottom: 6px; }
    .avatar { width: 18px; height: 18px; border-radius: 50%; background: var(--color-accent-dim); color: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 800; }
    .ml-auto { margin-left: auto; }
    
    .rating-stars { color: var(--color-text-muted); font-size: 0.8rem; display: flex; gap: 1px; }
    .star.filled { color: #eab308; }
    
    .comment-text { font-size: 0.8rem; color: var(--color-text-secondary); font-style: italic; line-height: 1.4; margin: 6px 0; }
    .date-text { font-size: 0.7rem; color: var(--color-text-muted); font-weight: 600; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--color-border); padding-top: 8px; margin-top: auto; }
    .quick-actions { display: flex; gap: 6px; }
    
    /* Buttons */
    .btn { padding: 8px 16px; border-radius: var(--radius-md); font-weight: 700; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .btn-outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-primary); &:hover { background: var(--color-bg-surface); } }
    .btn-success { background: rgba(37, 211, 102, 0.1); color: #25d366; border: 1px solid rgba(37, 211, 102, 0.2); &:hover:not([disabled]) { background: rgba(37, 211, 102, 0.2); } }
    .btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); &:hover:not([disabled]) { background: rgba(239, 68, 68, 0.2); } }
    .btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .w-full { width: 100%; }
    .mt-2 { margin-top: 8px; }

    /* Inline Review View Styles */
    .inline-review-view { animation: fadeIn 0.3s ease forwards; display: flex; flex-direction: column; gap: var(--space-lg); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .inline-view-header { display: flex; justify-content: space-between; align-items: center; padding: 0 0 var(--space-md) 0; border-bottom: 1px solid var(--color-border); }
    .inline-actions { display: flex; gap: var(--space-sm); }
    
    .inline-view-content { padding: var(--space-xl); background: var(--color-bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
    .inline-view-grid { display: grid; grid-template-columns: 1fr 2fr; gap: var(--space-xl); align-items: start; }
    
    .inline-prod-column { display: flex; flex-direction: column; gap: var(--space-md); }
    .inline-prod { flex-direction: column; align-items: flex-start; border: none; padding: 0; background: transparent; }
    .inline-prod-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-lg); box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-bottom: 12px; }
    .inline-prod-title { font-size: 1.25rem; font-weight: 800; color: var(--color-text-primary); margin: 0 0 8px 0; line-height: 1.4; }
    
    .inline-review-column { display: flex; flex-direction: column; }
    .mt-4 { margin-top: var(--space-xl); }
    
    /* Hero elements from previous drawer logic, reused for inline view */
    .drawer-hero { display: flex; flex-direction: column; gap: 12px; }
    .customer-profile-large { display: flex; align-items: center; gap: 12px; }
    .drawer-avatar-large { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover)); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.6rem; box-shadow: 0 4px 10px var(--color-accent-dim); }
    .customer-name { font-size: 1.3rem; font-weight: 800; color: var(--color-text-primary); margin: 0 0 4px 0; }
    .drawer-date { font-size: 0.85rem; color: var(--color-text-secondary); }
    
    .drawer-rating-large { display: flex; align-items: center; gap: 6px; font-size: 1.4rem; color: var(--color-text-muted); margin-top: 8px; }
    .drawer-rating-large .star.filled { color: #eab308; }
    .rating-number { font-size: 1rem; font-weight: 800; color: var(--color-text-primary); background: var(--color-bg-surface); padding: 4px 10px; border-radius: 20px; margin-left: 8px; }

    .review-quote-box { position: relative; background: var(--color-bg-card); padding: var(--space-xl) var(--space-xl) var(--space-xl) 3rem; border-radius: var(--radius-lg); border-left: 4px solid var(--color-accent); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .quote-icon { position: absolute; top: 12px; left: -10px; font-size: 3.5rem; color: var(--color-accent); line-height: 1; font-family: serif; opacity: 0.2; }
    .drawer-comment-large { position: relative; z-index: 1; font-size: 1.1rem; color: var(--color-text-primary); line-height: 1.7; font-style: italic; margin: 0; font-weight: 500; }
    
    .drawer-badge { display: inline-block; width: fit-content; font-size: 0.75rem; font-weight: 800; padding: 6px 12px; border-radius: 6px; text-transform: uppercase; }
    .drawer-badge.pending { background: #eab308; color: #000; }
    .drawer-badge.approved { background: #25d366; color: #000; }
    .drawer-badge.rejected { background: #ef4444; color: #fff; }
    
    @media (max-width: 900px) {
      .inline-view-grid { grid-template-columns: 1fr; }
      .inline-prod-img { width: 250px; }
    }

    /* Loading State */
    .loading-state { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--space-lg); }
    .skeleton-card { background: var(--color-bg-card-glass); border: 1px solid var(--color-border); padding: var(--space-lg); border-radius: var(--radius-lg); }
    .skeleton-header { display: flex; gap: var(--space-md); margin-bottom: var(--space-lg); }
    .skeleton-img { width: 48px; height: 48px; border-radius: 8px; background: var(--color-bg-surface); animation: pulse 1.5s infinite; }
    .skeleton-text-group { flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: center; }
    .skeleton-line { height: 12px; background: var(--color-bg-surface); border-radius: 4px; animation: pulse 1.5s infinite; }
    .w-100 { width: 100%; } .w-60 { width: 60%; } .w-80 { width: 80%; } .mt-2 { margin-top: 8px; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

    /* Empty State */
    .empty-state { text-align: center; padding: var(--space-3xl); }
    .empty-icon { font-size: 4rem; margin-bottom: var(--space-md); }
    .empty-state h3 { font-size: 1.5rem; color: var(--color-text-primary); margin-bottom: 8px; }
    .empty-state p { color: var(--color-text-secondary); }
  `]
})
export class ReviewsComponent implements OnInit {
  loading = true;
  reviews: ReviewItem[] = [];
  
  // Filters & Search
  searchTerm = '';
  statusFilter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';
  ratingFilter: 'ALL' | '5' | '4' | '3' | '2' | '1' = 'ALL';
  sortBy: 'LATEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST' = 'LATEST';

  // Bulk Actions & Drawer
  selectedReviewIds: string[] = [];
  updatingBulk = false;
  selectedReviewForDrawer: ReviewItem | null = null;

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.fetchReviews();
  }

  fetchReviews() {
    this.loading = true;
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get<any>(`${environment.apiUrl}/reviews/admin`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.reviews;
        }
        this.loading = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to fetch reviews');
        this.loading = false;
      }
    });
  }

  // --- Statistics Getters ---
  getPendingCount() { return this.reviews.filter(r => r.status === 'PENDING').length; }
  getApprovedCount() { return this.reviews.filter(r => r.status === 'APPROVED').length; }
  getRejectedCount() { return this.reviews.filter(r => r.status === 'REJECTED').length; }
  getAverageRating() {
    if (this.reviews.length === 0) return '0.0';
    const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  getInitials(name: string): string {
    return name ? name.substring(0, 1).toUpperCase() : '?';
  }

  // --- Filter Logic ---
  getFilteredReviews(): ReviewItem[] {
    let result = [...this.reviews];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(term) || 
        r.product.title.toLowerCase().includes(term) ||
        r.comment.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.statusFilter !== 'ALL') {
      result = result.filter(r => r.status === this.statusFilter);
    }

    // Rating filter
    if (this.ratingFilter !== 'ALL') {
      const targetRating = parseInt(this.ratingFilter, 10);
      result = result.filter(r => r.rating === targetRating);
    }

    // Sorting
    result.sort((a, b) => {
      if (this.sortBy === 'LATEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (this.sortBy === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (this.sortBy === 'HIGHEST') return b.rating - a.rating;
      if (this.sortBy === 'LOWEST') return a.rating - b.rating;
      return 0;
    });

    return result;
  }

  // --- Single Update ---
  updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.put<any>(`${environment.apiUrl}/reviews/admin/${id}/status`, { status }, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(`Review ${status.toLowerCase()} successfully`);
          const rev = this.reviews.find(r => r._id === id);
          if (rev) rev.status = status;
        }
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to update review status');
      }
    });
  }

  // --- Bulk Actions ---
  toggleSelection(id: string) {
    const index = this.selectedReviewIds.indexOf(id);
    if (index === -1) {
      this.selectedReviewIds.push(id);
    } else {
      this.selectedReviewIds.splice(index, 1);
    }
  }

  bulkUpdateStatus(status: 'APPROVED' | 'REJECTED') {
    if (this.selectedReviewIds.length === 0) return;
    
    const confirmAction = confirm(`Are you sure you want to mark ${this.selectedReviewIds.length} reviews as ${status}?`);
    if (!confirmAction) return;

    this.updatingBulk = true;
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    
    // Create an array of HTTP observables
    const requests = this.selectedReviewIds.map(id => 
      this.http.put<any>(`${environment.apiUrl}/reviews/admin/${id}/status`, { status }, { headers })
    );

    // Execute them in parallel
    forkJoin(requests).subscribe({
      next: (responses) => {
        let successCount = 0;
        responses.forEach((res, index) => {
          if (res.success) {
            successCount++;
            // Update local state
            const id = this.selectedReviewIds[index];
            const rev = this.reviews.find(r => r._id === id);
            if (rev) rev.status = status;
          }
        });
        this.toast.success(`Successfully updated ${successCount} reviews to ${status}`);
        this.selectedReviewIds = []; // Clear selection
        this.updatingBulk = false;
      },
      error: (err) => {
        this.toast.error('Bulk update failed for some reviews');
        this.updatingBulk = false;
      }
    });
  }

  // --- Drawer Management ---
  openDrawer(review: ReviewItem) {
    this.selectedReviewForDrawer = review;
  }

  closeDrawer() {
    this.selectedReviewForDrawer = null;
  }
}
