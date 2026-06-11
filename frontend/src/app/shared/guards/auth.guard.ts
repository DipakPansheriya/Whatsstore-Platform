import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protect routes — redirect to login if not authenticated */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/auth/login']);
  return false;
};

/** Redirect authenticated users away from auth pages */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  if (auth.isSuperAdmin()) {
    router.navigate(['/superadmin/dashboard']);
  } else {
    router.navigate(['/admin/dashboard']);
  }
  return false;
};

/** Protect admin routes */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  router.navigate(['/auth/login']);
  return false;
};

/** Protect superadmin routes */
export const superAdminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isSuperAdmin()) return true;

  router.navigate(['/admin/dashboard']);
  return false;
};
