import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardLayoutComponent } from './shared/dashboard-layout.component';
import { authGuard, guestGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  // Public pages
  {
    path: '',
    component: HomeComponent,
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

  // Protected feature modules sharing DashboardLayout
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
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
    ],
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
