import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardLayoutComponent } from './shared/dashboard-layout.component';
import { SuperAdminLayoutComponent } from './shared/superadmin-layout.component';
import { authGuard, guestGuard, adminGuard, superAdminGuard } from './shared/guards/auth.guard';
import { themeGuard } from './shared/guards/theme.guard';

export const routes: Routes = [
  // Public pages
  {
    path: '',
    component: HomeComponent,
    canActivate: [themeGuard]
  },
  {
    path: 'features',
    loadComponent: () => import('./public-pages/features/features.component').then(m => m.FeaturesComponent),
  },
  {
    path: 'pricing',
    loadComponent: () => import('./public-pages/pricing/pricing.component').then(m => m.PricingComponent),
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./public-pages/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent),
  },
  {
    path: 'docs',
    loadComponent: () => import('./public-pages/docs/docs.component').then(m => m.DocsComponent),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./public-pages/privacy/privacy.component').then(m => m.PrivacyComponent),
  },
  {
    path: 'terms',
    loadComponent: () => import('./public-pages/terms/terms.component').then(m => m.TermsComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./public-pages/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: 'blog',
    loadComponent: () => import('./public-pages/blog/blog.component').then(m => m.BlogComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./public-pages/contact/contact.component').then(m => m.ContactComponent),
  },

  // Auth (login / register) — guarded by guestGuard
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes),
  },

  // SuperAdmin modules
  {
    path: 'superadmin',
    component: SuperAdminLayoutComponent,
    canActivate: [authGuard, superAdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./superadmin/dashboard.component').then(m => m.SuperAdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./superadmin/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'stores',
        loadComponent: () => import('./superadmin/stores.component').then(m => m.StoresComponent),
      },
      {
        path: 'plans',
        loadComponent: () => import('./superadmin/plans.component').then(m => m.PlansComponent),
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./superadmin/subscriptions.component').then(m => m.SubscriptionsComponent),
      },
      {
        path: 'trials',
        loadComponent: () => import('./superadmin/trials.component').then(m => m.TrialsComponent),
      },
      {
        path: 'logs',
        loadComponent: () => import('./superadmin/logs.component').then(m => m.LogsComponent),
      },
      {
        path: 'marketplace',
        loadComponent: () => import('./superadmin/marketplace-settings/marketplace-settings.component').then(m => m.MarketplaceSettingsComponent),
      },
    ],
  },

  // Protected feature modules sharing DashboardLayout
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.dashboardRoutes),
      },
      {
        path: 'products',
        loadChildren: () => import('./products/products.routes').then(m => m.productsRoutes),
      },
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.routes').then(m => m.ordersRoutes),
      },
      {
        path: 'builder',
        loadChildren: () => import('./builder/builder.routes').then(m => m.builderRoutes),
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.routes').then(m => m.settingsRoutes),
      },
      {
        path: 'coupons',
        loadComponent: () => import('./coupons/coupons.component').then(m => m.CouponsComponent),
      },
    ],
  },

  // Public Marketplace Panel
  {
    path: 'marketplace',
    loadChildren: () => import('./marketplace/marketplace.routes').then(m => m.marketplaceRoutes),
  },

  // Public store (no auth)
  {
    path: 'store',
    loadChildren: () => import('./public-store/public-store.routes').then(m => m.publicStoreRoutes),
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: '',
  },
];
