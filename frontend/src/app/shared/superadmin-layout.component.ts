import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-superadmin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, CommonModule],
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
        <header class="dash-navbar glass-header">
          <button class="mobile-toggle" (click)="toggleSidebar()">☰</button>
          <div class="navbar-left">
            <span class="shop-badge">👑 System Owner Portal</span>
          </div>

          <div class="navbar-center">
            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search...">
              <span class="search-shortcut">⌘K</span>
            </div>
          </div>
          <div class="navbar-right" *ngIf="auth.currentUser$ | async as user">

            <button class="icon-btn">
              <span class="bell-icon">🔔</span>
              <span class="badge-dot"></span>
            </button>
            <div class="user-profile-widget">
              <div class="user-profile">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">{{ user.role }}</span>
            </div>
              <img class="user-avatar" [src]="'https://ui-avatars.com/api/?name=' + user.name + '&background=8b5cf6&color=fff'" alt="User Avatar">
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="dash-content">
          <router-outlet></router-outlet>
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
      background: #06070a;
      color: var(--color-text-primary);
      padding: var(--space-md);
      gap: var(--space-md);
      box-sizing: border-box;
    }
    .sidebar {
      width: 270px;
      background: rgba(17, 19, 25, 0.6);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.05);
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .logo-glow {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%);
      border-radius: 50%;
      box-shadow: 0 0 18px rgba(139, 92, 246, 0.45);
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
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
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
        background: rgba(255, 255, 255, 0.04);
        transform: translateX(4px);
      }
      &.active {
        color: #fff;
        background: linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.02) 100%);
        border: 1px solid rgba(139, 92, 246, 0.15);
        border-left: 4px solid #8b5cf6;
        box-shadow: inset 4px 0 15px rgba(139, 92, 246, 0.05);
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
      border-top: 1px solid rgba(255, 255, 255, 0.05);
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
      background: rgba(17, 19, 25, 0.3);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .dash-navbar {
      height: 80px;
      padding: 0 var(--space-xl);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(17, 19, 25, 0.15);
    }
    .mobile-toggle {
      display: none;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.05);
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
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: var(--radius-pill);
      color: #a78bfa;
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
      border: 2px solid #8b5cf6;
      object-fit: cover;
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.25);
    }
    .dash-content {
      flex: 1;
      padding: var(--space-xl);
      overflow-y: auto;
    }
    
    .glass-header {
      background: rgba(17, 19, 25, 0.7) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .navbar-center { flex: 1; display: flex; justify-content: center; padding: 0 2rem; }
    .search-bar {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      padding: 0.5rem 1rem;
      width: 100%;
      max-width: 400px;
      transition: all 0.3s ease;
    }
    .search-bar:focus-within {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--color-accent, #25d366);
      box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
    }
    .search-icon { color: #94a3b8; font-size: 0.9rem; margin-right: 0.5rem; }
    .search-bar input {
      background: transparent; border: none; outline: none; color: #fff; width: 100%; font-size: 0.9rem;
    }
    .search-shortcut {
      color: #64748b; font-size: 0.75rem; background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600;
    }
    .icon-btn {
      background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 50%;
      width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s; color: #fff;
    }
    .icon-btn:hover { background: rgba(255, 255, 255, 0.1); }
    .badge-dot {
      position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid #0f1117;
    }
    .user-profile-widget {
      display: flex; align-items: center; gap: 12px; padding: 6px 12px 6px 16px; border-radius: 50px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: all 0.2s;
    }
    .user-profile-widget:hover { background: rgba(255, 255, 255, 0.06); }
    
    .dash-footer {
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      margin-top: auto;
    }
    .footer-content {
      display: flex; justify-content: space-between; align-items: center; color: #64748b; font-size: 0.85rem;
    }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links a { color: #64748b; text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: #fff; }
    
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
        border-right: 1px solid rgba(255, 255, 255, 0.08);
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
export class SuperAdminLayoutComponent {
  currentYear = new Date().getFullYear();

  sidebarOpen = false;
  navItems = [
    { label: 'Platform Overview', path: '/superadmin/dashboard', icon: '🌍', exact: true },
    { label: 'Users', path: '/superadmin/users', icon: '👥', exact: false },
    { label: 'Stores', path: '/superadmin/stores', icon: '🏪', exact: false },
    { label: 'Subscriptions', path: '/superadmin/subscriptions', icon: '💳', exact: false },
    { label: 'Trials', path: '/superadmin/trials', icon: '⏳', exact: false },
    { label: 'Plans & Pricing', path: '/superadmin/plans', icon: '📈', exact: false },
    { label: 'System Logs', path: '/superadmin/logs', icon: '📝', exact: false },
    { label: 'Marketplace', path: '/superadmin/marketplace', icon: '⚡', exact: false },
  ];

  constructor(public auth: AuthService) {}

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
