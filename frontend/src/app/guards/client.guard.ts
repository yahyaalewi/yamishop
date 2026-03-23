import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user is an admin, redirect them to the admin dashboard
  // when they try to access a client route.
  if (authService.currentUser() && authService.isAdmin()) {
    return router.createUrlTree(['/admin']);
  }
  
  return true;
};
