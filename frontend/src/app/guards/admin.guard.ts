import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = route.queryParams['token'];
  if (token) {
    return authService.autoLoginWithToken(token).pipe(
      map(success => {
        if (success && authService.isAdmin()) {
          return true;
        }
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      })
    );
  }

  if (authService.currentUser() && authService.isAdmin()) {
    return true;
  }
  
  // Keep original URL for redirect after successful login
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
