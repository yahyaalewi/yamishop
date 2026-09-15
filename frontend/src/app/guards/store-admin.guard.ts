import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

export const storeAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if a direct auto-login token is provided in the URL query parameters (e.g. from email notification link)
  const token = route.queryParams['token'];
  if (token) {
    return authService.autoLoginWithToken(token).pipe(
      map(success => {
        if (success) {
          return true;
        }
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      })
    );
  }

  if (authService.currentUser() && authService.isStoreAdmin()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
