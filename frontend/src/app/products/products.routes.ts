import { Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';

export const productsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./products.component').then(m => m.ProductsComponent),
  },
];
