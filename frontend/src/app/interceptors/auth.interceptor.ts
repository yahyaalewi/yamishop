import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject auth service to get token
  const authService = inject(AuthService);
  const user = authService.currentUser();
  
  if (user && user.token) {
    // Clone request and attach Bearer token
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${user.token}`)
    });
    return next(authReq);
  }
  
  return next(req);
};
