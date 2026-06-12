import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-page animate-fade-in-up">
      <div class="container">
        
        <!-- Header -->
        <header class="contact-header text-center">
          <span class="badge">Support Desk</span>
          <h1>Get In Touch</h1>
          <p class="subtitle">Have questions about setting up your WhatsApp shop? Contact our customer support team.</p>
        </header>

        <div class="contact-grid">
          
          <!-- Contact Form -->
          <div class="glass-card contact-form-wrapper">
            <h3>Send Us a Message</h3>
            <p class="desc-hint">Fill in the fields below and our team will get back to you within 24 hours.</p>
            
            <form (ngSubmit)="onSubmit()" class="contact-form">
              <div class="form-group">
                <label for="c-name">Your Full Name</label>
                <input id="c-name" type="text" name="name" [(ngModel)]="name" placeholder="e.g. Jane Doe" required>
              </div>

              <div class="form-group">
                <label for="c-email">Email Address</label>
                <input id="c-email" type="email" name="email" [(ngModel)]="email" placeholder="e.g. jane&#64;example.com" required>
              </div>

              <div class="form-group">
                <label for="c-subject">Subject</label>
                <input id="c-subject" type="text" name="subject" [(ngModel)]="subject" placeholder="e.g. Subscription Question" required>
              </div>

              <div class="form-group">
                <label for="c-msg">Message Details</label>
                <textarea id="c-msg" name="message" [(ngModel)]="message" rows="5" placeholder="Detail your query or issue..." required></textarea>
              </div>

              <div *ngIf="successMsg" class="alert alert-success">
                ✅ {{ successMsg }}
              </div>

              <button type="submit" class="btn btn-primary w-full justify-center" [disabled]="submitting">
                {{ submitting ? 'Sending Message...' : '🚀 Send Message' }}
              </button>
            </form>
          </div>

          <!-- Contact Sidebar Info -->
          <div class="info-sidebar">
            <div class="glass-card info-item accent-glow">
              <div class="icon-circle">📧</div>
              <div class="item-text">
                <h4>Email Support</h4>
                <p>support&#64;siteflow.com</p>
                <span>For general inquiries & billing issues</span>
              </div>
            </div>

            <div class="glass-card info-item accent-glow">
              <div class="icon-circle">💬</div>
              <div class="item-text">
                <h4>WhatsApp Helpline</h4>
                <p>+91 98765 43210</p>
                <span>Chat directly with customer service helpers</span>
              </div>
            </div>

            <div class="glass-card info-item accent-glow">
              <div class="icon-circle">📍</div>
              <div class="item-text">
                <h4>Global Headquarters</h4>
                <p>Bengaluru Tech Park, Block B, Suite 402, India</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .contact-page {
      padding: var(--space-3xl) 0;
    }
    .contact-header {
      max-width: 700px;
      margin: 0 auto var(--space-2xl);
      h1 {
        margin: var(--space-sm) 0 var(--space-xs);
        font-size: 3rem;
        font-weight: 800;
        color: var(--color-text-primary);
        line-height: 1.15;
      }
      .subtitle {
        font-size: 1.15rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
      }
    }
    .text-center {
      text-align: center;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: var(--space-2xl);
      align-items: start;
      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
      }
    }

    .contact-form-wrapper {
      padding: var(--space-2xl);
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      
      h3 { font-size: 1.5rem; color: var(--color-text-primary); }
      .desc-hint { font-size: 0.9rem; color: var(--color-text-secondary); }
    }
    
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      margin-top: var(--space-xs);
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
      input, textarea {
        padding: 14px;
        background: var(--color-bg-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        font-size: 0.95rem;
        outline: none;
        font-family: var(--font-base);
        transition: all var(--transition-fast);
        &:focus {
          border-color: var(--color-accent);
          background: var(--color-bg-card);
          box-shadow: 0 0 12px var(--color-accent-glow);
        }
      }
    }
    
    .w-full { width: 100%; }
    .justify-center { justify-content: center; }

    .alert {
      padding: 14px;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
    }
    .alert-success {
      background: var(--color-accent-dim);
      color: var(--color-accent);
      border: 1px solid rgba(37, 211, 102, 0.25);
    }

    .info-sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .info-item {
      padding: var(--space-lg);
      display: flex;
      gap: var(--space-md);
      align-items: flex-start;
      border: 1px solid var(--color-border);
      transition: all var(--transition-normal);
      
      &:hover {
        border-color: var(--color-accent);
        box-shadow: 0 0 20px var(--color-accent-glow);
        transform: translateY(-2px);
      }
    }

    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--color-accent-dim);
      border: 1px solid var(--color-accent-glow);
      color: var(--color-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
      text-shadow: 0 0 8px var(--color-accent-glow);
    }

    .item-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      h4 { font-size: 1.05rem; color: var(--color-text-primary); font-weight: 700; }
      p { font-size: 1rem; color: var(--color-text-primary); font-weight: 600; }
      span { font-size: 0.8rem; color: var(--color-text-secondary); }
    }
  `]
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';
  
  submitting = false;
  successMsg = '';

  onSubmit() {
    this.submitting = true;
    this.successMsg = '';
    
    // Simulate API request delay
    setTimeout(() => {
      this.successMsg = 'Message sent successfully! Our customer support team will contact you shortly.';
      this.submitting = false;
      
      // Clear fields
      this.name = '';
      this.email = '';
      this.subject = '';
      this.message = '';
    }, 1200);
  }
}
