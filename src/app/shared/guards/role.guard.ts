import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const userRole = authService.getCurrentUser()?.role;
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    } else {
      // Redirect to appropriate dashboard based on user role
      const redirectUrl = authService.getRedirectUrl();
      router.navigate([redirectUrl]);
      return false;
    }
  };
};

// Convenience guards for specific roles
export const employeeGuard: CanActivateFn = roleGuard([UserRole.EMPLOYEE]);
export const managerGuard: CanActivateFn = roleGuard([UserRole.MANAGER, UserRole.HR, UserRole.ADMIN]);
export const hrGuard: CanActivateFn = roleGuard([UserRole.HR, UserRole.ADMIN]);
export const adminGuard: CanActivateFn = roleGuard([UserRole.ADMIN]);