import { Routes } from '@angular/router';

export const marketplaceRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./marketplace-home/marketplace-home.component').then(m => m.MarketplaceHomeComponent)
  },
  {
    path: 'product/:productId',
    loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./wishlist/wishlist.component').then(m => m.WishlistComponent)
  }
];
