import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user is a super admin, redirect to the admin dashboard
  if (authService.currentUser() && authService.isAdmin()) {
    return router.createUrlTree(['/admin']);
  }

  // If the user is a store admin, redirect to the store admin dashboard
  if (authService.currentUser() && authService.isStoreAdmin()) {
    return router.createUrlTree(['/store-admin/dashboard']);
  }

  return true;
};
