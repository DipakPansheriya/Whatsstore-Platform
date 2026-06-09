import { Routes } from '@angular/router';

export const publicStoreRoutes: Routes = [
  {
    path: ':slug',
    children: [
      {
        path: '',
        loadComponent: () => import('./public-store.component').then(m => m.PublicStoreComponent),
      },
      {
        path: 'product/:productId',
        loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent),
      }
    ]
  },
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  }
];
