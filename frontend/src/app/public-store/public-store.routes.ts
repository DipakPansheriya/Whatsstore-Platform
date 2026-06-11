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
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./wishlist/wishlist.component').then(m => m.WishlistComponent),
      },
      {
        path: 'track/:orderId',
        loadComponent: () => import('./track-order/track-order.component').then(m => m.TrackOrderComponent),
      }
    ]
  },
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  }
];
