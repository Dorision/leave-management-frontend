import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get the auth token from the service
  const authToken = authService.getToken();
  
  // Clone the request and add the authorization header if token exists
  if (authToken) {
    const authRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
    
    return next(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          // Try to refresh the token
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the original request with the new token
              const newToken = authService.getToken();
              const retryRequest = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${newToken}`)
              });
              return next(retryRequest);
            }),
            catchError((refreshError) => {
              // If refresh fails, logout the user
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }
  
  // If no token, proceed with the original request
  return next(req);
};
