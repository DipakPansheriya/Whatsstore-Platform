import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="auth-page">

      <!-- Animated background orbs -->
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>

      <div class="auth-container">

        <!-- Left Panel: Brand / Visual Side -->
        <div class="left-panel">
          <div class="left-inner">

            <!-- Brand -->
            <div class="brand-mark">
              <div class="brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.526 5.845L.057 23.43a.75.75 0 0 0 .928.928l5.594-1.474A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.705 9.705 0 0 1-4.95-1.358l-.355-.211-3.676.969.976-3.574-.231-.368A9.715 9.715 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                </svg>
              </div>
              <span class="brand-name">WhatsStore</span>
            </div>

            <!-- Hero copy -->
            <div class="hero-copy">
              <div class="trial-badge">
                <span class="badge-dot"></span>
                10-DAY FREE TRIAL · NO CARD REQUIRED
              </div>
              <h2>Launch your store<br>in <span class="accent-text">minutes</span></h2>
              <p>Design, publish, and manage your e-commerce storefront. Accept orders directly in WhatsApp.</p>
            </div>

            <!-- Feature checklist -->
            <ul class="feature-list">
              <li>
                <span class="check-icon">✓</span>
                No coding required
              </li>
              <li>
                <span class="check-icon">✓</span>
                WhatsApp order notifications
              </li>
              <li>
                <span class="check-icon">✓</span>
                Custom store URL
              </li>
              <li>
                <span class="check-icon">✓</span>
                Free for 10 days, cancel anytime
              </li>
            </ul>

            <!-- Social proof strip -->
            <div class="social-proof">
              <div class="avatars">
                <span class="av">👩‍💻</span>
                <span class="av">👨‍💼</span>
                <span class="av">👩‍🎨</span>
                <span class="av">👦</span>
              </div>
              <span class="proof-text"><strong>4,200+</strong> stores already live</span>
            </div>
          </div>
        </div>

        <!-- Right Panel: Form -->
        <div class="right-panel">

          <!-- Top bar: back link + theme toggle -->
          <div class="auth-top-bar">
            <a routerLink="/" class="back-home-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back to home
            </a>
            <app-theme-toggle></app-theme-toggle>
          </div>

          <div class="form-wrapper">
            <div class="form-header">
              <h1>Create your account</h1>
              <p>Sign up and get your 10-day free trial</p>
            </div>
            <form (ngSubmit)="onSubmit()" class="auth-form">
              <!-- Two-column grid for fields -->
              <div class="form-grid">

                <div class="form-group">
                  <label for="reg-name">Full Name</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    <input id="reg-name" type="text" name="name" [(ngModel)]="name"
                      placeholder="Your full name" required>
                  </div>
                </div>

                <div class="form-group">
                  <label for="reg-email">Email Address</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <input id="reg-email" type="email" name="email" [(ngModel)]="email"
                      placeholder="you@example.com" required>
                  </div>
                </div>

                <div class="form-group">
                  <label for="reg-phone">WhatsApp Number</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.526 5.845L.057 23.43a.75.75 0 0 0 .928.928l5.594-1.474A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.705 9.705 0 0 1-4.95-1.358l-.355-.211-3.676.969.976-3.574-.231-.368A9.715 9.715 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                    </svg>
                    <input id="reg-phone" type="tel" name="phone" [(ngModel)]="phone"
                      placeholder="+91 98765 43210" required>
                  </div>
                </div>

                <div class="form-group">
                  <label for="reg-password">Password</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input id="reg-password" type="password" name="password" [(ngModel)]="password"
                      placeholder="Min. 8 characters" required>
                  </div>
                </div>

                <div class="form-group">
                  <label for="reg-bizname">Business Name</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <input id="reg-bizname" type="text" name="businessName" [(ngModel)]="businessName"
                      (input)="onBusinessNameChange()" placeholder="My Awesome Store" required>
                  </div>
                </div>

                <div class="form-group">
                  <label for="reg-slug">Store URL</label>
                  <div class="input-wrapper slug-wrapper">
                    <span class="slug-prefix">/store/</span>
                    <input id="reg-slug" type="text" name="slug" [(ngModel)]="slug"
                      placeholder="my-store" required>
                  </div>
                </div>

              </div>

              @if (error) {
                <div class="error-banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                  </svg>
                  {{ error }}
                </div>
              }

              <button type="submit" class="btn-submit" [disabled]="loading" id="register-submit-btn">
                @if (loading) {
                  <span class="spinner"></span> Creating your account...
                } @else {
                  Start free trial →
                }
              </button>

              <p class="terms-note">
                By signing up you agree to our <a routerLink="/terms">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
              </p>
            </form>

            <p class="footer-link">
              Already have an account? <a routerLink="/auth/login">Sign in</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ---- Page Shell ---- */
    .auth-page {
      height: 100vh;
      max-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg);
      padding: 16px;
      font-family: var(--font-base);
      position: relative;
      overflow: hidden;
      transition: background var(--transition-normal);
    }

    /* Animated background orbs */
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.35;
      pointer-events: none;
    }
    .orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(37,211,102,0.5), transparent 70%);
      top: -180px; left: -120px;
      animation: orbDrift 12s ease-in-out infinite alternate;
    }
    .orb-2 {
      width: 380px; height: 380px;
      background: radial-gradient(circle, rgba(37,211,102,0.25), transparent 70%);
      bottom: -100px; right: -80px;
      animation: orbDrift 16s ease-in-out infinite alternate-reverse;
    }
    .orb-3 {
      width: 260px; height: 260px;
      background: radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%);
      top: 50%; left: 60%;
      animation: orbDrift 10s ease-in-out infinite alternate;
    }
    @keyframes orbDrift {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(30px, 20px) scale(1.08); }
    }

    /* ---- Container ---- */
    .auth-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1060px;
      max-height: calc(100vh - 40px);
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg), 0 0 0 1px rgba(37,211,102,0.05);
      transition: border-color var(--transition-normal);

      @media (max-width: 800px) {
        grid-template-columns: 1fr;
      }
    }

    /* ---- LEFT: Brand panel ---- */
    .left-panel {
      background: linear-gradient(145deg, #0d1a12 0%, #0a1a0f 50%, #071209 100%);
      padding: 32px 34px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 20% 20%, rgba(37,211,102,0.12) 0%, transparent 60%);
        pointer-events: none;
      }

      @media (max-width: 800px) { display: none; }
    }

    .left-inner {
      display: flex;
      flex-direction: column;
      gap: 20px;
      height: 100%;
      position: relative;
      z-index: 1;
    }

    .brand-mark {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      width: 38px; height: 38px;
      background: #25d366;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      box-shadow: 0 4px 20px rgba(37,211,102,0.4);
    }
    .brand-name {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      color: #f1f5f9;
      letter-spacing: -0.02em;
    }

    .trial-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(37,211,102,0.1);
      border: 1px solid rgba(37,211,102,0.25);
      color: #25d366;
      padding: 5px 14px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      width: fit-content;
    }
    .badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #25d366;
      animation: pulseDot 2s ease-in-out infinite;
    }
    @keyframes pulseDot {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
      50% { box-shadow: 0 0 0 5px rgba(37,211,102,0); }
    }

    .hero-copy {
      display: flex;
      flex-direction: column;
      gap: 8px;

      h2 {
        font-family: var(--font-heading);
        font-size: 1.8rem;
        font-weight: 800;
        color: #f1f5f9;
        line-height: 1.15;
        letter-spacing: -0.03em;
        margin: 0;
      }
      p {
        font-size: 0.84rem;
        color: #64748b;
        line-height: 1.5;
        max-width: 260px;
      }
    }
    .accent-text { color: #25d366; }

    /* Feature list */
    .feature-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 7px;

      li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: #94a3b8;
      }
    }
    .check-icon {
      width: 18px; height: 18px;
      border-radius: 50%;
      background: rgba(37,211,102,0.12);
      border: 1px solid rgba(37,211,102,0.25);
      color: #25d366;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .social-proof {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: auto;
    }
    .avatars {
      display: flex;
      .av {
        width: 30px; height: 30px;
        border-radius: 50%;
        background: rgba(255,255,255,0.06);
        border: 2px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        margin-right: -6px;
      }
    }
    .proof-text {
      font-size: 0.8rem;
      color: #64748b;
      padding-left: 12px;
      strong { color: #f1f5f9; }
    }

    /* Floating stat cards */
    .stat-card {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 240px;
    }
    .stat-setup { align-self: flex-start; }
    .stat-stores { align-self: flex-end; margin-left: auto; }
    .stat-icon { font-size: 1.4rem; }
    .stat-value {
      font-size: 1rem;
      font-weight: 800;
      color: #f1f5f9;
      font-family: var(--font-heading);
    }
    .stat-label {
      font-size: 0.7rem;
      color: #64748b;
      margin-top: 1px;
    }
    .stat-change {
      margin-left: auto;
      font-size: 0.72rem;
      font-weight: 700;
      &.positive { color: #25d366; }
    }
    .animate-float {
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }

    /* ---- RIGHT: Form panel ---- */
    .right-panel {
      background: var(--color-bg-card);
      padding: 20px 40px 28px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: background var(--transition-normal);

      @media (max-width: 480px) {
        padding: 16px 20px 28px;
      }
    }

    /* Top bar row: back link on left, toggle on right */
    .auth-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-shrink: 0;
    }

    /* Back to home pill */
    .back-home-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 8px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      transition: all 150ms ease;
      &:hover {
        color: var(--color-text-primary);
        border-color: var(--color-accent);
        background: var(--color-accent-dim);
        opacity: 1;
      }
      svg { flex-shrink: 0; }
    }

    .form-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-header {
      h1 {
        font-family: var(--font-heading);
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.03em;
        margin-bottom: 2px;
      }
      p {
        font-size: 0.84rem;
        color: var(--color-text-secondary);
      }
    }

    /* Social buttons */
    .social-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .social-btn {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 150ms ease;
      font-family: var(--font-base);
      &:hover {
        background: rgba(255,255,255,0.07);
        border-color: rgba(255,255,255,0.14);
        color: #f1f5f9;
      }
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--color-border);
      }
      span {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        white-space: nowrap;
      }
    }

    /* Form fields */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 12px;

      @media (max-width: 560px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        letter-spacing: 0.01em;
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 13px;
      color: var(--color-text-muted);
      pointer-events: none;
      flex-shrink: 0;
    }
    .input-wrapper input {
      width: 100%;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 9px 14px 9px 36px;
      font-size: 0.84rem;
      color: var(--color-text-primary);
      outline: none;
      font-family: var(--font-base);
      transition: all 200ms ease;

      &::placeholder { color: var(--color-text-muted); }

      &:focus {
        border-color: rgba(37,211,102,0.4);
        background: var(--color-accent-dim);
        box-shadow: 0 0 0 3px var(--color-accent-glow);
      }
    }

    /* Slug field special treatment */
    .slug-wrapper {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 0 14px;
      transition: all 200ms ease;

      &:focus-within {
        border-color: rgba(37,211,102,0.4);
        background: var(--color-accent-dim);
        box-shadow: 0 0 0 3px var(--color-accent-glow);
      }

      input {
        border: none !important;
        background: transparent !important;
        padding: 9px 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding-left: 4px !important;
      }
    }
    .slug-prefix {
      font-size: 0.82rem;
      color: var(--color-text-muted);
      white-space: nowrap;
      user-select: none;
      flex-shrink: 0;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.82rem;
      color: #f87171;
    }

    .btn-submit {
      width: 100%;
      background: var(--color-accent);
      color: var(--color-on-accent);
      border: none;
      border-radius: 10px;
      padding: 11px;
      font-size: 0.9rem;
      font-weight: 700;
      font-family: var(--font-base);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 24px var(--color-accent-glow);
      transition: all 200ms ease;

      &:hover:not([disabled]) {
        transform: translateY(-1px);
        box-shadow: 0 8px 32px var(--color-accent-glow);
      }
      &:active:not([disabled]) { transform: translateY(0); }
      &:disabled {
        background: var(--color-bg-surface);
        color: var(--color-text-muted);
        cursor: not-allowed;
        box-shadow: none;
      }
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(0,0,0,0.2);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .terms-note {
      text-align: center;
      font-size: 0.74rem;
      color: var(--color-text-muted);
      line-height: 1.5;
      a {
        color: var(--color-text-secondary);
        text-decoration: underline;
        text-underline-offset: 2px;
        &:hover { color: var(--color-text-primary); opacity: 1; }
      }
    }

    .footer-link {
      text-align: center;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      a {
        color: var(--color-accent);
        font-weight: 600;
        text-decoration: none;
        &:hover { opacity: 0.85; }
      }
    }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  businessName = '';
  slug = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  onBusinessNameChange() {
    this.slug = this.businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
  }

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth.register({
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      businessName: this.businessName,
      slug: this.slug
    }).subscribe({
      next: (res) => {
        if (res.user.role === 'SUPERADMIN') {
          this.router.navigate(['/superadmin/dashboard']);
        } else {
          // Redirect to admin dashboard where they can see their trial status
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => { this.error = err.message; this.loading = false; },
    });
  }
}
