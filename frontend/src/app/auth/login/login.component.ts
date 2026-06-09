import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">

      <!-- Animated background orbs -->
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>

      <div class="auth-container">

        <!-- Left Panel: Visual / Brand Side -->
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
              <h2>Sell more via<br><span class="accent-text">WhatsApp</span></h2>
              <p>Manage your storefront, track orders, and chat with customers — all in one place.</p>
            </div>

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
          <div class="form-wrapper">
            <div class="form-header">
              <h1>Welcome back</h1>
              <p>Sign in to manage your WhatsApp shops</p>
            </div>
            <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
              <div class="form-group">
                <label for="email">Email address</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <input id="email" type="email" name="email" [(ngModel)]="email"
                    placeholder="you@example.com" required autocomplete="email">
                </div>
              </div>

              <div class="form-group">
                <div class="label-row">
                  <label for="password">Password</label>
                  <a href="#" class="forgot-link">Forgot password?</a>
                </div>
                <div class="input-wrapper">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input id="password" type="password" name="password" [(ngModel)]="password"
                    placeholder="••••••••••" required autocomplete="current-password">
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

              <button type="submit" class="btn-submit" [disabled]="loading" id="login-submit-btn">
                @if (loading) {
                  <span class="spinner"></span> Signing in...
                } @else {
                  Sign in →
                }
              </button>
            </form>

            <p class="footer-link">
              Don't have an account? <a routerLink="/auth/register">Create one free</a>
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
      margin-top: calc(-1 * var(--navbar-height, 72px));
      display: flex;
      align-items: center;
      justify-content: center;
      background: #08090d;
      padding: 20px;
      font-family: var(--font-base);
      position: relative;
      overflow: hidden;
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
      max-width: 1000px;
      max-height: calc(100vh - 48px);
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.07);
      box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,211,102,0.05);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    /* ---- LEFT: Brand panel ---- */
    .left-panel {
      background: linear-gradient(145deg, #0d1a12 0%, #0a1a0f 50%, #071209 100%);
      padding: 36px 38px;
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

      @media (max-width: 768px) { display: none; }
    }

    .left-inner {
      display: flex;
      flex-direction: column;
      gap: 24px;
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
      animation: pulse-glow 2s ease-in-out infinite;
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
      50% { box-shadow: 0 0 0 5px rgba(37,211,102,0); }
    }

    .hero-copy {
      display: flex;
      flex-direction: column;
      gap: 12px;

      h2 {
        font-family: var(--font-heading);
        font-size: 2.2rem;
        font-weight: 800;
        color: #f1f5f9;
        line-height: 1.15;
        letter-spacing: -0.03em;
        margin: 0;
      }
      p {
        font-size: 0.9rem;
        color: #64748b;
        line-height: 1.6;
        max-width: 280px;
      }
    }
    .accent-text { color: #25d366; }

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
    .stat-orders { align-self: flex-start; }
    .stat-revenue {
      align-self: flex-end;
      margin-left: auto;
    }
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
      background: #0f1117;
      padding: 36px 44px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;

      @media (max-width: 480px) {
        padding: 32px 24px;
      }
    }

    .btn-close {
      position: absolute;
      top: 20px; right: 20px;
      width: 34px; height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 150ms ease;
      &:hover {
        background: rgba(255,255,255,0.1);
        color: #f1f5f9;
        opacity: 1;
      }
    }

    .form-wrapper {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-header {
      h1 {
        font-family: var(--font-heading);
        font-size: 1.9rem;
        font-weight: 800;
        color: #f1f5f9;
        letter-spacing: -0.03em;
        margin-bottom: 4px;
      }
      p {
        font-size: 0.88rem;
        color: #64748b;
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
        background: rgba(255,255,255,0.07);
      }
      span {
        font-size: 0.75rem;
        color: #4b5563;
        white-space: nowrap;
      }
    }

    /* Form fields */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.78rem;
        font-weight: 600;
        color: #94a3b8;
        letter-spacing: 0.01em;
      }
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .forgot-link {
      font-size: 0.75rem;
      color: #25d366;
      text-decoration: none;
      font-weight: 500;
      &:hover { opacity: 0.8; }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 14px;
      color: #4b5563;
      pointer-events: none;
      flex-shrink: 0;
    }
    .input-wrapper input {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 11px 16px 11px 42px;
      font-size: 0.9rem;
      color: #f1f5f9;
      outline: none;
      font-family: var(--font-base);
      transition: all 200ms ease;

      &::placeholder { color: #374151; }

      &:focus {
        border-color: rgba(37,211,102,0.4);
        background: rgba(37,211,102,0.04);
        box-shadow: 0 0 0 3px rgba(37,211,102,0.08);
      }
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
      background: #25d366;
      color: #000;
      border: none;
      border-radius: 10px;
      padding: 13px;
      font-size: 0.95rem;
      font-weight: 700;
      font-family: var(--font-base);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 24px rgba(37,211,102,0.3);
      transition: all 200ms ease;
      margin-top: 4px;

      &:hover:not([disabled]) {
        transform: translateY(-1px);
        box-shadow: 0 8px 32px rgba(37,211,102,0.45);
      }
      &:active:not([disabled]) { transform: translateY(0); }
      &:disabled {
        background: rgba(255,255,255,0.06);
        color: #4b5563;
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

    .footer-link {
      text-align: center;
      font-size: 0.82rem;
      color: #4b5563;
      a {
        color: #25d366;
        font-weight: 600;
        text-decoration: none;
        &:hover { opacity: 0.85; }
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => { this.error = err.message; this.loading = false; },
    });
  }
}
