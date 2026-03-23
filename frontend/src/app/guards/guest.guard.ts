import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    // If user is already logged in, redirect to their respective area
    const path = authService.isAdmin() ? '/admin' : '/home';
    return router.createUrlTree([path]);
  }

  
  return true;
};
