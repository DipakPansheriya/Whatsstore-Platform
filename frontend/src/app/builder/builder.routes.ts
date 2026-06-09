import { Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';

export const builderRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./builder.component').then(m => m.BuilderComponent),
  },
];
