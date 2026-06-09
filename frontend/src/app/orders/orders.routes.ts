import { Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';

export const ordersRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./orders.component').then(m => m.OrdersComponent),
  },
];
