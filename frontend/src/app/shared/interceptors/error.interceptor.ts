import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Global HTTP error handler */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        // Token expired or invalid — force logout
        auth.logout();
        router.navigate(['/auth/login']);
      }

      const message = err.error?.message || err.message || 'An unexpected error occurred';
      return throwError(() => new Error(message));
    })
  );
};
