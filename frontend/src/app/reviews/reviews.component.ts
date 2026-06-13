import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="reviews-scaffold animate-fade-in-up">
      <header class="page-header">
        <div>
          <span class="badge">Customer Feedback</span>
          <h1>Reviews Management</h1>
          <p>Approve or reject customer reviews for your products before they appear publicly.</p>
        </div>
      </header>

      <!-- Messages -->
      <div *ngIf="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
      <div *ngIf="errorMsg" class="alert alert-danger">❌ {{ errorMsg }}</div>

      <div class="content-wrapper">
        <div *ngIf="loading" class="loading-state">
          <span class="spinner">⏳</span> Fetching reviews...
        </div>

        <div *ngIf="!loading && reviews.length === 0" class="empty-state glass-card">
          <div class="empty-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Once customers leave reviews on your products, they will appear here for approval.</p>
        </div>

        <div *ngIf="!loading && reviews.length > 0" class="reviews-list">
          @for (review of reviews; track review._id) {
            <div class="review-card glass-card" [ngClass]="review.status.toLowerCase()">
              <div class="review-header">
                <div class="product-info">
                  <img [src]="review.product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100'" alt="Product">
                  <div class="prod-details">
                    <span class="reviewer-name">{{ review.name }}</span>
                    <span class="prod-title">on {{ review.product.title }}</span>
                  </div>
                </div>
                <div class="status-badge" [ngClass]="review.status.toLowerCase()">
                  {{ review.status }}
                </div>
              </div>
              <div class="review-body">
                <div class="rating-stars">
                  <span class="star" *ngFor="let s of [1,2,3,4,5]" [class.filled]="s <= review.rating">★</span>
                </div>
                <p class="comment-text">"{{ review.comment }}"</p>
                <span class="date-text">{{ review.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="review-actions" *ngIf="review.status === 'PENDING'">
                <button (click)="updateStatus(review._id, 'APPROVED')" class="btn btn-success">✅ Approve</button>
                <button (click)="updateStatus(review._id, 'REJECTED')" class="btn btn-danger">❌ Reject</button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-scaffold { max-width: 900px; margin: 0 auto; padding: var(--space-md) 0; }
    .page-header { margin-bottom: var(--space-xl); }
    .page-header h1 { font-size: 2.2rem; font-weight: 900; margin: var(--space-xs) 0; color: var(--color-text-primary); }
    .page-header p { color: var(--color-text-secondary); }
    .badge { padding: 4px 12px; background: rgba(255,255,255,0.05); border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: var(--color-accent); }
    
    .loading-state, .empty-state { text-align: center; padding: var(--space-3xl); }
    .empty-state h3 { font-size: 1.5rem; color: var(--color-text-primary); margin-bottom: 8px; }
    .empty-state p { color: var(--color-text-secondary); }
    .empty-icon { font-size: 4rem; margin-bottom: var(--space-md); }

    .reviews-list { display: flex; flex-direction: column; gap: var(--space-lg); }
    
    .review-card {
      padding: var(--space-xl); border-radius: var(--radius-lg);
      border: 1px solid var(--color-border); background: var(--color-bg-card-glass);
      transition: all 0.3s ease;
      &.approved { border-left: 4px solid var(--color-accent); }
      &.rejected { border-left: 4px solid #ef4444; opacity: 0.6; }
      &.pending { border-left: 4px solid #eab308; }
    }

    .review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-md); }
    .product-info { display: flex; gap: var(--space-md); align-items: center; }
    .product-info img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
    .prod-details { display: flex; flex-direction: column; }
    .reviewer-name { font-weight: 800; color: var(--color-text-primary); font-size: 1.1rem; }
    .prod-title { font-size: 0.85rem; color: var(--color-text-secondary); }

    .status-badge {
      font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 20px;
      &.pending { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); }
      &.approved { background: rgba(37, 211, 102, 0.1); color: #25d366; border: 1px solid rgba(37, 211, 102, 0.2); }
      &.rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
    }

    .review-body { margin-bottom: var(--space-lg); }
    .rating-stars { color: var(--color-text-muted); font-size: 1.2rem; margin-bottom: 8px; }
    .star.filled { color: #eab308; }
    .comment-text { font-size: 1rem; color: var(--color-text-secondary); font-style: italic; margin-bottom: 8px; line-height: 1.5; }
    .date-text { font-size: 0.75rem; color: var(--color-text-muted); }

    .review-actions { display: flex; gap: var(--space-md); border-top: 1px solid rgba(255,255,255,0.05); padding-top: var(--space-md); }
    .btn { padding: 8px 16px; border-radius: var(--radius-md); font-weight: 700; font-size: 0.9rem; cursor: pointer; border: none; }
    .btn-success { background: rgba(37, 211, 102, 0.1); color: #25d366; border: 1px solid rgba(37, 211, 102, 0.2); &:hover { background: rgba(37, 211, 102, 0.2); } }
    .btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); &:hover { background: rgba(239, 68, 68, 0.2); } }

    .alert { padding: 12px; border-radius: var(--radius-md); font-size: 0.9rem; margin-bottom: var(--space-md); }
    .alert-success { background: rgba(37,211,102,0.1); color: #25d366; border: 1px solid rgba(37,211,102,0.2); }
    .alert-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
  `]
})
export class ReviewsComponent implements OnInit {
  loading = true;
  reviews: ReviewItem[] = [];
  successMsg = '';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchReviews();
  }

  fetchReviews() {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.http.get<any>(`${environment.apiUrl}/reviews/admin`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.reviews;
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to fetch reviews';
        this.loading = false;
      }
    });
  }

  updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    this.successMsg = '';
    this.errorMsg = '';
    
    this.http.put<any>(`${environment.apiUrl}/reviews/admin/${id}/status`, { status }, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = `Review ${status.toLowerCase()} successfully`;
          // Update locally
          const rev = this.reviews.find(r => r._id === id);
          if (rev) rev.status = status;
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to update review status';
      }
    });
  }
}
