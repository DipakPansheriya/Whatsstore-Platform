import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { SubscriptionService } from './services/subscription.service';
import { ThemeToggleComponent } from './components/theme-toggle.component';
import { DirectionToggleComponent } from './components/direction-toggle.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, CommonModule, ThemeToggleComponent, DirectionToggleComponent],
  template: `
    <div class="dash-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-brand">
          <div class="logo-glow">⚡</div>
          <span class="logo-text">WhatsStore</span>
        </div>
        <nav class="sidebar-nav">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.exact}" class="nav-item" (click)="closeSidebar()">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="sidebar-footer">
          <button (click)="logout()" class="btn-logout">
            <span class="nav-icon">🚪</span>
            <span class="nav-label">Log Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Container -->
      <div class="dash-container">
        <!-- Top Navbar -->
        <header class="dash-navbar">
          <button class="mobile-toggle" (click)="toggleSidebar()">☰</button>
          <div class="navbar-left">
            <span class="shop-badge">🏪 Merchant Portal</span>
            <span class="trial-badge ml-md" *ngIf="subscriptionStatus === 'TRIAL_ACTIVE'">
              {{ getTrialDaysRemaining() }} Days Trial Remaining
            </span>
          </div>

          <div class="navbar-center">
            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search...">
              <span class="search-shortcut">⌘K</span>
            </div>
          </div>
          <div class="navbar-right" *ngIf="auth.currentUser$ | async as user">
            <!-- Direction Toggle -->
            <app-direction-toggle></app-direction-toggle>

            <!-- Theme Toggle -->
            <app-theme-toggle></app-theme-toggle>

            <!-- Notification Bell -->
            <div class="notifications-wrapper" (clickOutside)="notificationsOpen = false">
              <button class="icon-btn" (click)="toggleNotifications($event)">
                <span class="bell-icon">🔔</span>
                <span class="badge-dot" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </button>
              
              <!-- Zepto-style Notifications Panel -->
              <div class="notif-panel glass-card" *ngIf="notificationsOpen" (click)="$event.stopPropagation()">
                <div class="notif-header">
                  <h4>Notifications</h4>
                  <button class="btn-read-all" *ngIf="unreadCount > 0" (click)="markAllRead()">Mark all read</button>
                </div>
                
                <div class="notif-body">
                  <div class="notif-empty" *ngIf="notifications.length === 0">
                    <span class="empty-emoji">📭</span>
                    <p>No new notifications</p>
                  </div>
                  
                  <div class="notif-list" *ngIf="notifications.length > 0">
                    @for (notif of notifications; track notif._id) {
                      <div class="notif-item" [class.unread]="!notif.isRead" (click)="markAsRead(notif)">
                        <div class="notif-icon-box">
                          <span *ngIf="notif.type === 'REVIEW_PENDING'">⭐</span>
                          <span *ngIf="notif.type === 'NEW_ORDER'">🛒</span>
                          <span *ngIf="notif.type === 'SYSTEM'">⚙️</span>
                          <span *ngIf="!['REVIEW_PENDING', 'NEW_ORDER', 'SYSTEM'].includes(notif.type)">📬</span>
                        </div>
                        <div class="notif-content">
                          <h5>{{ notif.title }}</h5>
                          <p>{{ notif.message }}</p>
                          <span class="notif-time">{{ notif.createdAt | date:'short' }}</span>
                        </div>
                        <div class="notif-dot" *ngIf="!notif.isRead"></div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <div class="user-profile-widget">
              <div class="user-profile">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">{{ user.role }}</span>
            </div>
            <img class="user-avatar" [src]="'https://ui-avatars.com/api/?name=' + user.name + '&background=25d366&color=fff'" alt="User Avatar">
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="dash-content">
          <ng-container *ngIf="!loadingSubscription; else loadingTpl">
            <ng-container *ngIf="subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL_ACTIVE' || subscriptionStatus === 'TRIAL_EXPIRED' || subscriptionStatus === 'EXPIRED'">
              
              <div class="upgrade-banner" *ngIf="subscriptionStatus === 'TRIAL_EXPIRED' || subscriptionStatus === 'EXPIRED'">
                <div class="banner-content">
                  <span class="banner-icon">⚠️</span>
                  <span class="banner-text">Your {{ subscriptionStatus === 'TRIAL_EXPIRED' ? 'trial' : 'subscription' }} has expired. Store features have been locked.</span>
                </div>
                <a routerLink="/pricing" class="btn-upgrade">Upgrade Now</a>
              </div>

              <div [class.locked-features]="subscriptionStatus === 'TRIAL_EXPIRED' || subscriptionStatus === 'EXPIRED'">
                <router-outlet></router-outlet>
              </div>
            </ng-container>
            <ng-container *ngIf="subscriptionStatus === 'PENDING' || subscriptionStatus === 'PAYMENT_PENDING'">
              <ng-container *ngTemplateOutlet="pendingTpl"></ng-container>
            </ng-container>
            <ng-container *ngIf="subscriptionStatus === 'NONE' || subscriptionStatus === 'CANCELLED' || subscriptionStatus === 'SUSPENDED'">
              <ng-container *ngTemplateOutlet="noneTpl"></ng-container>
            </ng-container>
          </ng-container>

          <ng-template #loadingTpl>
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          </ng-template>

          <ng-template #pendingTpl>
            <div class="pending-state">
              <div class="pending-card text-center">
                <div class="icon-pulse">⏳</div>
                <h2>Waiting for Approval</h2>
                <p>Your subscription is currently pending. Please complete your payment or wait for activation.</p>
                <div class="status-badge mt-4">Status: <span class="text-warning">PENDING</span></div>
              </div>
            </div>
          </ng-template>

          <ng-template #noneTpl>
            <div class="pending-state">
              <div class="pending-card text-center">
                <div class="icon-pulse">🛍️</div>
                <h2>Select a Subscription Plan</h2>
                <p>You need an active subscription to access the dashboard. Please choose a plan to get started.</p>
                <div class="mt-4">
                  <a routerLink="/pricing" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 12px 24px;">View Plans & Pricing</a>
                </div>
              </div>
            </div>
          </ng-template>
        </main>

        <!-- Footer -->
        <footer class="dash-footer">
          <div class="footer-content">
            <p>&copy; {{ currentYear }} WhatsStore. All rights reserved.</p>
            <div class="footer-links">
              <a href="#">Help Center</a>
              <a href="#">API Docs</a>
              <a href="#">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .dash-layout {
      display: flex;
      height: 100vh;
      max-height: 100vh;
      overflow: hidden;
      background: var(--color-bg);
      color: var(--color-text-primary);
      padding: var(--space-md);
      gap: var(--space-md);
      box-sizing: border-box;
    }
    .sidebar {
      width: 270px;
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      transition: all var(--transition-normal);
      z-index: 100;
      box-shadow: var(--shadow-md);
    }
    .sidebar-brand {
      height: 80px;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 0 var(--space-xl);
      border-bottom: 1px solid var(--color-border);
    }
    .logo-glow {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, var(--color-accent) 0%, #00b4d8 100%);
      border-radius: 50%;
      box-shadow: 0 0 18px rgba(37, 211, 102, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
    }
    .logo-text {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--color-text-primary);
    }
    .sidebar-nav {
      flex: 1;
      padding: var(--space-xl) var(--space-md);
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: 13px var(--space-lg);
      color: var(--color-text-secondary);
      font-weight: 600;
      font-size: 0.95rem;
      border-radius: var(--radius-md);
      transition: all var(--transition-normal);
      text-decoration: none;
      position: relative;
      overflow: hidden;
      border: 1px solid transparent;
      &:hover {
        color: var(--color-text-primary);
        background: var(--color-bg-surface);
        transform: translateX(4px);
      }
      &.active {
        color: var(--color-text-primary);
        background: var(--color-accent-dim);
        border: 1px solid var(--color-accent);
        border-left: 4px solid var(--color-accent);
        box-shadow: inset 4px 0 15px var(--color-accent-glow);
      }
    }
    .nav-icon {
      font-size: 1.3rem;
      transition: transform var(--transition-normal);
    }
    .nav-item:hover .nav-icon {
      transform: scale(1.15);
    }
    .sidebar-footer {
      padding: var(--space-lg) var(--space-md);
      border-top: 1px solid var(--color-border);
    }
    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: 13px var(--space-lg);
      background: transparent;
      border: none;
      color: var(--color-danger);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--transition-normal);
      &:hover {
        background: rgba(239, 68, 68, 0.08);
        transform: translateX(4px);
      }
    }
    .dash-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: var(--color-bg-glass);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .dash-navbar {
      height: 80px;
      padding: 0 var(--space-xl);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--color-bg-glass);
    }
    .mobile-toggle {
      display: none;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 1.25rem;
    }
    .shop-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--color-accent-dim);
      border: 1px solid rgba(37, 211, 102, 0.2);
      border-radius: var(--radius-pill);
      color: var(--color-accent);
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }
    .user-profile {
      text-align: right;
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--color-text-primary);
    }
    .user-role {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-transform: capitalize;
    }
    .user-avatar {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-pill);
      border: 2px solid var(--color-accent);
      object-fit: cover;
      box-shadow: 0 0 15px rgba(37, 211, 102, 0.25);
    }
    .dash-content {
      flex: 1;
      padding: var(--space-xl);
      overflow-y: auto;
      position: relative;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--color-text-secondary);
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(37,211,102,0.2);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .pending-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }
    .pending-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      padding: 3rem;
      max-width: 500px;
      box-shadow: var(--shadow-lg);
    }
    .icon-pulse {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    .pending-card h2 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: var(--color-text-primary);
    }
    .pending-card p {
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
    .status-badge {
      display: inline-block;
      background: rgba(234, 179, 8, 0.15);
      border: 1px solid rgba(234, 179, 8, 0.3);
      padding: 8px 16px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .text-warning { color: #facc15; }
    .mt-4 { margin-top: 1.5rem; }
    .text-center { text-align: center; }
    
    .trial-badge {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #c084fc;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .ml-md { margin-left: 1rem; }
    
    .upgrade-banner {
      background: linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-left: 4px solid var(--color-danger);
      border-radius: var(--radius-md);
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.05);
    }
    .banner-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .banner-icon { font-size: 1.25rem; }
    .banner-text { color: var(--color-danger); font-weight: 500; font-size: 0.95rem; }
    .btn-upgrade {
      background: var(--color-danger);
      color: #fff;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-upgrade:hover {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    .locked-features {
      pointer-events: none;
      opacity: 0.5;
      filter: grayscale(100%);
      user-select: none;
    }

    
    .glass-header {
      background: var(--color-bg-card-glass) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .navbar-center { flex: 1; display: flex; justify-content: center; padding: 0 2rem; }
    .search-bar {
      display: flex;
      align-items: center;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: 999px;
      padding: 0.5rem 1rem;
      width: 100%;
      max-width: 400px;
      transition: all var(--transition-normal);
    }
    .search-bar:focus-within {
      background: var(--color-bg-card);
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-glow);
    }
    .search-icon { color: var(--color-text-muted); font-size: 0.9rem; margin-right: 0.5rem; }
    .search-bar input {
      background: transparent; border: none; outline: none; color: var(--color-text-primary); width: 100%; font-size: 0.9rem;
    }
    .search-shortcut {
      color: var(--color-text-muted); font-size: 0.75rem; background: var(--color-bg-surface); padding: 2px 6px; border-radius: 4px; font-weight: 600;
    }
    .icon-btn {
      background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: 50%;
      width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all var(--transition-normal); color: var(--color-text-primary);
    }
    .icon-btn:hover { background: var(--color-bg-card); border-color: var(--color-border-hover); }
    .badge-dot {
      position: absolute; top: -5px; right: -5px; background: var(--color-danger); color: var(--color-bg);
      font-size: 0.65rem; font-weight: 800; min-width: 18px; height: 18px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--color-bg-card);
    }

    /* Zepto-Style Notifications */
    .notifications-wrapper { position: relative; }
    .notif-panel {
      position: absolute; top: 50px; right: 0; width: 340px; max-height: 450px;
      display: flex; flex-direction: column;
      border-radius: var(--radius-xl); border: 1px solid var(--color-border);
      box-shadow: 0 15px 40px rgba(0,0,0,0.5); z-index: 1000;
      animation: slideDown 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
      overflow: hidden;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .notif-header {
      padding: 16px 20px; border-bottom: 1px solid var(--color-border);
      display: flex; justify-content: space-between; align-items: center;
      background: var(--color-bg-surface);
    }
    .notif-header h4 { margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--color-text-primary); }
    .btn-read-all {
      background: transparent; border: none; color: var(--color-accent); font-size: 0.8rem; font-weight: 700; cursor: pointer;
      &:hover { text-decoration: underline; }
    }
    .notif-body { flex: 1; overflow-y: auto; padding: 10px 0; max-height: 380px; }
    .notif-empty { text-align: center; padding: 30px; color: var(--color-text-secondary); .empty-emoji { font-size: 2.5rem; display: block; margin-bottom: 10px; opacity: 0.5; } }
    .notif-item {
      display: flex; gap: 15px; padding: 14px 20px; cursor: pointer; transition: background 0.2s; position: relative;
      &:hover { background: var(--color-bg-surface); }
      &.unread { background: rgba(37,211,102,0.05); }
    }
    .notif-icon-box {
      width: 40px; height: 40px; border-radius: 50%; background: var(--color-bg-surface); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;
    }
    .notif-content { flex: 1; display: flex; flex-direction: column; gap: 4px; padding-right: 15px; }
    .notif-content h5 { margin: 0; font-size: 0.9rem; font-weight: 800; color: var(--color-text-primary); }
    .notif-content p { margin: 0; font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.3; }
    .notif-time { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 4px; }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); position: absolute; right: 20px; top: 50%; transform: translateY(-50%); box-shadow: 0 0 8px var(--color-accent-glow); }

    .user-profile-widget {
      display: flex; align-items: center; gap: 12px; padding: 6px 12px 6px 16px; border-radius: 50px; background: var(--color-bg-surface); border: 1px solid var(--color-border); cursor: pointer; transition: all var(--transition-normal);
    }
    .user-profile-widget:hover { background: var(--color-bg-card); border-color: var(--color-border-hover); }
    
    .dash-footer {
      padding: 1.5rem 2rem;
      border-top: 1px solid var(--color-border);
      margin-top: auto;
    }
    .footer-content {
      display: flex; justify-content: space-between; align-items: center; color: var(--color-text-muted); font-size: 0.85rem;
    }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links a { color: var(--color-text-muted); text-decoration: none; transition: color var(--transition-normal); }
    .footer-links a:hover { color: var(--color-text-primary); }
    
    @media (max-width: 768px) {
      .navbar-center { display: none; }
      .footer-content { flex-direction: column; gap: 1rem; text-align: center; }
    }
  
    @media (max-width: 1024px) {
      .dash-layout {
        padding: 0;
        gap: 0;
      }
      .sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        border-radius: 0;
        margin: 0;
        border-right: 1px solid var(--color-border);
        &.open { transform: translateX(0); }
      }
      .dash-container {
        border-radius: 0;
        border: none;
      }
      .mobile-toggle { display: flex; align-items: center; justify-content: center; }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  sidebarOpen = false;

  navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: '📊', exact: true },
    { label: 'Products', path: '/admin/products', icon: '📦', exact: false },
    { label: 'Orders', path: '/admin/orders', icon: '🛒', exact: false },
    { label: 'Coupons', path: '/admin/coupons', icon: '🎟️', exact: false },
    { label: 'Reviews', path: '/admin/reviews', icon: '⭐', exact: false },
    { label: 'Website Builder', path: '/admin/builder', icon: '🎨', exact: false },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️', exact: false },
  ];

  subscriptionStatus: string | null = null;
  subscription: any = null;
  loadingSubscription = true;

  // Notifications state
  notificationsOpen = false;
  notifications: any[] = [];
  unreadCount = 0;

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private router: Router,
    private subService: SubscriptionService
  ) { }

  ngOnInit() {
    this.subService.status$.subscribe(status => {
      this.subscriptionStatus = status;
    });
    this.subService.subscription$.subscribe(sub => {
      this.subscription = sub;
      this.loadingSubscription = false;
    });

    if (this.auth.isLoggedIn()) {
      this.fetchNotifications();
    }
  }

  // Notification Methods
  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
  }

  fetchNotifications() {
    const headers = { Authorization: `Bearer ${this.auth.getToken()}` };
    this.http.get<any>(`${environment.apiUrl}/notifications`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications = res.notifications;
          this.unreadCount = res.unreadCount;
        }
      }
    });
  }

  markAsRead(notif: any) {
    if (notif.isRead) return;
    const headers = { Authorization: `Bearer ${this.auth.getToken()}` };
    this.http.put<any>(`${environment.apiUrl}/notifications/${notif._id}/read`, {}, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          notif.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      }
    });
  }

  markAllRead() {
    const headers = { Authorization: `Bearer ${this.auth.getToken()}` };
    this.http.put<any>(`${environment.apiUrl}/notifications/read-all`, {}, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
        }
      }
    });
  }

  getTrialDaysRemaining(): number {
    if (!this.subscription || !this.subscription.trialEndDate) return 0;
    const end = new Date(this.subscription.trialEndDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.auth.logout();
  }
}
