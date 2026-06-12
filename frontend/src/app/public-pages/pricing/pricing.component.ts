import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe, FormsModule],
  template: `
    <div class="pricing-page fade-in">
      <section class="pricing-hero">
        <div class="container text-center">
          <div class="badge-pill mb-4">Pricing Plans</div>
          <h1 class="display-title">One Simple Platform. <br><span class="gradient-text">Everything Included.</span></h1>
          <p class="subtitle mb-5">Start free for 10 days. Build your WhatsStore, add products, and start receiving WhatsApp orders instantly. No credit card required.</p>
          
          <div class="billing-toggle">
            <span [class.active]="billingCycle === 'monthly'">Monthly</span>
            <label class="switch">
              <input type="checkbox" (change)="toggleBilling()">
              <span class="slider round"></span>
            </label>
            <span [class.active]="billingCycle === 'yearly'">Yearly <span class="discount-badge">Save 20%</span></span>
          </div>
        </div>
      </section>

      <section class="pricing-cards-section pb-8">
        <div class="container">
          <div class="pricing-grid">
            
            <div class="pricing-card" *ngFor="let plan of filteredPlans">
              <div class="popular-tag" *ngIf="plan.name === 'Growth' || plan.name === 'WhatsStore Pro'">Most Popular</div>
              <div class="card-header">
                <h3>{{ plan.name }}</h3>
                <p>{{ plan.description }}</p>
              </div>
              <div class="card-price">
                <span class="currency">₹</span>
                <span class="amount">{{ plan.price }}</span>
                <span class="period">/{{ plan.billingCycle === 'monthly' ? 'mo' : 'yr' }}</span>
              </div>
              
              <ng-container *ngIf="!(auth.currentUser$ | async)">
                <a routerLink="/auth/register" class="btn btn-primary w-100 mb-4 text-center">Start 10-Day Free Trial</a>
              </ng-container>
              <ng-container *ngIf="(auth.currentUser$ | async)">
                <button (click)="openPaymentModal(plan)" class="btn btn-primary w-100 mb-4 text-center">Select Plan</button>
              </ng-container>
              
              <div class="card-features">
                <h4 class="features-title">What's included:</h4>
                <ul class="features-list">
                  <li *ngFor="let feature of plan.features">
                    <span class="check-icon">✓</span>
                    <div>
                      <span>{{ feature }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div *ngIf="filteredPlans.length === 0 && !loading" class="text-center w-100 text-muted">
              <p>No plans available at the moment.</p>
            </div>
            <div *ngIf="loading" class="text-center w-100">
              <p>Loading pricing plans...</p>
            </div>

          </div>
        </div>
      </section>
      
      <!-- FAQ Section -->
      <section class="faq-section container">
        <h2 class="text-center">Frequently Asked Questions</h2>
        <div class="faq-grid">
          <div class="faq-item glass-card">
            <h4>How does the 10-day free trial work?</h4>
            <p>You get full access to all WhatsStore features for 10 days. After the trial ends, you can choose to subscribe to continue using your store.</p>
          </div>
          <div class="faq-item glass-card">
            <h4>Are there any setup fees or hidden transaction costs?</h4>
            <p>No setup fees or hidden charges. WhatsStore charges only a simple monthly subscription. All customer communication happens directly via WhatsApp.</p>
          </div>
          <div class="faq-item glass-card">
            <h4>Can I cancel my subscription?</h4>
            <p>Yes, you can cancel anytime from your account settings. Your store will remain active until the end of the billing cycle.</p>
          </div>
          <div class="faq-item glass-card">
            <h4>Do I need a separate WhatsApp Business account?</h4>
            <p>No WhatsApp Business account is required. Orders are sent directly to your normal WhatsApp number.</p>
          </div>
        </div>
      </section>

      <!-- Mock Payment Modal -->
      <div class="modal-overlay" *ngIf="selectedPlan">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Complete Your Subscription</h3>
            <button class="btn-close" (click)="closePaymentModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="plan-summary mb-4">
              <p><strong>Selected Plan:</strong> {{ selectedPlan.name }}</p>
              <p><strong>Price:</strong> ₹{{ selectedPlan.price }} / {{ selectedPlan.billingCycle === 'monthly' ? 'month' : 'year' }}</p>
            </div>
            
            <div class="payment-mock-form">
              <h4>Payment Details (Mock)</h4>
              <p class="text-muted" style="font-size: 0.8rem; margin-bottom: 1rem;">This is a dummy payment step. No real card needed.</p>
              
              <div class="form-group mb-3">
                <label>Card Number</label>
                <input type="text" class="form-control" value="**** **** **** 4242" disabled>
              </div>
              <div class="form-grid mb-4">
                <div class="form-group">
                  <label>Expiry Date</label>
                  <input type="text" class="form-control" value="12/28" disabled>
                </div>
                <div class="form-group">
                  <label>CVC</label>
                  <input type="text" class="form-control" value="***" disabled>
                </div>
              </div>
              
              <div *ngIf="paymentError" class="alert alert-danger mb-3">{{ paymentError }}</div>
              
              <button (click)="processPayment()" class="btn btn-primary w-100" [disabled]="processingPayment">
                {{ processingPayment ? 'Processing...' : 'Pay ₹' + selectedPlan.price + ' & Subscribe' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pricing-page { padding: var(--space-3xl) 0; }
    .pricing-hero { padding: 40px 0 40px; }
    .badge-pill { display: inline-block; padding: 6px 16px; background: rgba(139, 92, 246, 0.1); color: var(--color-accent); border-radius: 50px; font-weight: 600; font-size: 0.9rem; margin-bottom: 1.5rem; border: 1px solid rgba(139, 92, 246, 0.2); }
    .display-title { font-size: clamp(2.2rem, 5.5vw, 3.8rem); line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.03em; font-weight: 950; }
    .gradient-text { color: var(--color-accent); background: linear-gradient(120deg, var(--color-accent) 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 30px rgba(37, 211, 102, 0.25); }
    .subtitle { font-size: 1.15rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; line-height: 1.7; }
    
    .billing-toggle { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 2rem; font-weight: 600; }
    .billing-toggle span { color: var(--color-text-secondary); transition: 0.3s; }
    .billing-toggle span.active { color: var(--color-text-primary); }
    .discount-badge { background: rgba(37, 211, 102, 0.15); color: var(--color-accent); font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; margin-left: 8px; vertical-align: middle; }
    
    .switch { position: relative; display: inline-block; width: 60px; height: 34px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-bg-surface); transition: .4s; border: 1px solid var(--color-border); }
    .slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 3px; bottom: 3px; background-color: var(--color-accent); transition: .4s; }
    input:checked + .slider:before { transform: translateX(26px); }
    .slider.round { border-radius: 34px; }
    .slider.round:before { border-radius: 50%; }

    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto; justify-content: center; }
    .pricing-card { position: relative; background: var(--color-bg-card-glass); backdrop-filter: blur(24px); border: 1px solid var(--color-border); border-radius: 24px; padding: 3rem 2rem; transition: transform 0.3s, box-shadow 0.3s; display: flex; flex-direction: column; }
    .pricing-card:hover { transform: translateY(-10px); box-shadow: var(--shadow-lg); border-color: rgba(139, 92, 246, 0.3); }
    .popular-tag { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); }
    
    .card-header h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .card-header p { color: var(--color-text-secondary); font-size: 0.95rem; margin-bottom: 2rem; line-height: 1.5; }
    
    .card-price { display: flex; align-items: flex-end; gap: 4px; margin-bottom: 2rem; justify-content: center; }
    .currency { font-size: 1.5rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 8px; }
    .amount { font-size: 4rem; font-weight: 800; font-family: var(--font-heading); line-height: 1; letter-spacing: -0.05em; color: var(--color-text-primary); }
    .period { font-size: 1rem; color: var(--color-text-secondary); margin-bottom: 8px; font-weight: 500; }
    
    .w-100 { width: 100%; display: block; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .pb-8 { padding-bottom: 6rem; }
    .text-center { text-align: center; }
    .text-accent { color: var(--color-accent); }
    .text-muted { color: var(--color-text-secondary); }
    .btn-primary { background: var(--color-accent); color: var(--color-on-accent); padding: 12px 24px; border-radius: 50px; font-weight: 700; text-decoration: none; transition: var(--transition-normal); border: none; cursor: pointer; }
    .btn-primary:hover { box-shadow: 0 4px 15px var(--color-accent-glow); transform: translateY(-2px); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    
    .card-features { margin-top: 1rem; flex: 1; }
    .features-title { font-size: 1.1rem; font-weight: 700; margin-bottom: var(--space-md); color: var(--color-text-primary); }
    .features-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-md); }
    .features-list li { display: flex; align-items: flex-start; gap: 12px; font-size: 0.95rem; line-height: 1.4; color: var(--color-text-primary); }
    .check-icon { color: var(--color-accent); font-weight: 900; font-size: 1.3rem; line-height: 1.2; flex-shrink: 0; }
    
    .faq-section { padding-top: var(--space-xl); margin-bottom: var(--space-3xl); }
    .faq-section h2 { margin-bottom: var(--space-2xl); font-size: 2.2rem; font-weight: 800; }
    .faq-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: var(--space-lg); }
    .faq-item { padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-sm); border-top: 1px solid var(--color-border); }
    .faq-item h4 { font-size: 1.1rem; color: var(--color-text-primary); font-weight: 700; }
    .faq-item p { font-size: 0.9rem; line-height: 1.6; color: var(--color-text-secondary); }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 16px; width: 100%; max-width: 450px; overflow: hidden; }
    .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-size: 1.25rem; font-weight: 800; margin: 0; }
    .btn-close { background: none; border: none; color: var(--color-text-primary); font-size: 1.5rem; cursor: pointer; opacity: 0.7; }
    .btn-close:hover { opacity: 1; }
    .modal-body { padding: 1.5rem; }
    .plan-summary { background: var(--color-bg-surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--color-border); }
    .plan-summary p { margin-bottom: 0.5rem; font-size: 0.95rem; }
    .plan-summary p:last-child { margin-bottom: 0; }
    
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary); }
    .form-control { width: 100%; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 0.75rem 1rem; color: var(--color-text-primary); font-family: inherit; }
    .form-control:disabled { opacity: 0.6; cursor: not-allowed; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .alert-danger { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2); padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; }

    @media (max-width: 768px) {
      .display-title { font-size: 2.5rem; }
      .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
    }
  `]
})
export class PricingComponent implements OnInit {
  billingCycle: 'monthly' | 'yearly' = 'monthly';
  allPlans: any[] = [];
  loading = true;

  selectedPlan: any = null;
  processingPayment = false;
  paymentError = '';

  constructor(private http: HttpClient, public auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/plans`).subscribe({
      next: (res: any) => {
        this.allPlans = res.plans || [];
        this.loading = false;

        // If DB has no plans, inject fallback plan for demo purposes
        if (this.allPlans.length === 0) {
          this.injectFallbackPlan();
        }
      },
      error: () => {
        this.loading = false;
        this.injectFallbackPlan();
      }
    });
  }

  injectFallbackPlan() {
    this.allPlans = [
      {
        _id: 'dummy1',
        name: 'Growth',
        description: 'Designed for small businesses, shops, salons, restaurants, and freelancers.',
        price: 499,
        billingCycle: 'monthly',
        features: [
          'Add unlimited products with images, pricing, and descriptions — no restrictions.',
          'Customer orders are automatically formatted and sent directly to your WhatsApp inbox.',
          'Mobile-first website optimized for speed and easy browsing.',
          'Built-in shopping cart and simple checkout process.'
        ]
      },
      {
        _id: 'dummy2',
        name: 'Growth',
        description: 'Designed for small businesses, shops, salons, restaurants, and freelancers.',
        price: 4999,
        billingCycle: 'yearly',
        features: [
          'Add unlimited products with images, pricing, and descriptions — no restrictions.',
          'Customer orders are automatically formatted and sent directly to your WhatsApp inbox.',
          'Mobile-first website optimized for speed and easy browsing.',
          'Built-in shopping cart and simple checkout process.'
        ]
      }
    ];
  }

  toggleBilling() {
    this.billingCycle = this.billingCycle === 'monthly' ? 'yearly' : 'monthly';
  }

  get filteredPlans() {
    return this.allPlans.filter(p => p.billingCycle === this.billingCycle);
  }

  openPaymentModal(plan: any) {
    this.selectedPlan = plan;
    this.paymentError = '';
  }

  closePaymentModal() {
    this.selectedPlan = null;
    this.paymentError = '';
  }

  processPayment() {
    this.processingPayment = true;
    this.paymentError = '';

    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };

    // Simulate payment delay
    setTimeout(() => {
      this.http.post(`${environment.apiUrl}/subscriptions/subscribe`, { planId: this.selectedPlan._id }, { headers })
        .subscribe({
          next: (res: any) => {
            this.processingPayment = false;
            this.closePaymentModal();
            this.router.navigate(['/admin/dashboard']);
          },
          error: (err) => {
            this.processingPayment = false;
            this.paymentError = err.error?.message || 'Failed to process subscription. Please try again.';
          }
        });
    }, 1500);
  }
}
