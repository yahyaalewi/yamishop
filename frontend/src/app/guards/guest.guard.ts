import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    // Redirect each role to their respective area
    if (authService.isAdmin()) {
      return router.createUrlTree(['/admin']);
    } else if (authService.isStoreAdmin()) {
      return router.createUrlTree(['/store-admin/dashboard']);
    } else {
      return router.createUrlTree(['/home']);
    }
  }

  return true;
};
