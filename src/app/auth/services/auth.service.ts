import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { 
  LoginRequest, 
  LoginResponse, 
  AuthUser, 
  UserRole, 
  ApiResponse 
} from '../../shared/models';
import { decodeJWT } from '../../shared/utils/jwt.util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5254/api/Auth'; // Direct backend URL for development
  private readonly TOKEN_KEY = 'leave_management_token';
  private readonly USER_KEY = 'leave_management_user';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private isBrowser: boolean;
  public loginEmail: string = ''; // Store login email temporarily

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(response => {
          if (!response.success || !response.token) {
            throw new Error(response.message || 'Login failed');
          }
          return response;
        }),
        tap(loginResponse => {
          if (loginResponse.token) {
            this.setToken(loginResponse.token!);
            
            // Decode JWT to extract user information
            const decodedToken = decodeJWT(loginResponse.token);
            
            if (decodedToken) {
              // Extract role from JWT or response
              const role = this.mapRole(
                decodedToken.role || 
                decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                loginResponse.roles || 
                ''
              );
              
              // If JWT doesn't contain user info, we need to make an API call to get user profile
              if (!decodedToken.email && !decodedToken.unique_name && !decodedToken.given_name) {
                this.fetchUserProfile(role);
              } else {
                // Extract user information from JWT
                const user: AuthUser = {
                  id: decodedToken.sub || decodedToken.id || decodedToken.userId || decodedToken.nameid || 'unknown',
                  firstName: decodedToken.given_name || decodedToken.firstName || decodedToken.name?.split(' ')[0] || 'User',
                  lastName: decodedToken.family_name || decodedToken.lastName || decodedToken.name?.split(' ')[1] || '',
                  email: decodedToken.email || decodedToken.unique_name || decodedToken.preferred_username || 'user@example.com',
                  role: role
                };
                
                this.setUser(user);
                this.currentUserSubject.next(user);
                this.isAuthenticatedSubject.next(true);
              }
            }
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(registerData: { email: string; password: string; firstName: string; lastName: string; role?: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, registerData)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isEmployee(): boolean {
    return this.hasRole(UserRole.EMPLOYEE);
  }

  isManager(): boolean {
    return this.hasRole(UserRole.MANAGER);
  }

  isHR(): boolean {
    return this.hasRole(UserRole.HR);
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  canManageLeaves(): boolean {
    return this.hasAnyRole([UserRole.MANAGER, UserRole.HR, UserRole.ADMIN]);
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/refresh`, {})
      .pipe(
        map(response => {
          if (!response.success || !response.token) {
            throw new Error(response.message || 'Token refresh failed');
          }
          return response;
        }),
        tap(loginResponse => {
          if (loginResponse.token && loginResponse.user) {
            this.setToken(loginResponse.token!);
            this.setUser(loginResponse.user as AuthUser);
            this.currentUserSubject.next(loginResponse.user as AuthUser);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setUser(user: AuthUser): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getStoredUser(): AuthUser | null {
    if (!this.isBrowser) return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  getRedirectUrl(): string {
    const user = this.getCurrentUser();
    if (!user) {
      return '/login';
    }
    
    switch (user.role) {
      case UserRole.EMPLOYEE:
        return '/employee';
      case UserRole.MANAGER:
        return '/manager';
      case UserRole.HR:
      case UserRole.ADMIN:
        return '/manager'; // HR and Admin use manager dashboard
      default:
        return '/login';
    }
  }

  private mapRole(roleData: string | string[] | any): UserRole {
    // Handle different role formats from backend
    let roleString: string = '';
    
    if (Array.isArray(roleData)) {
      // If it's an array, take the first role
      roleString = roleData.length > 0 ? String(roleData[0]) : '';
    } else if (typeof roleData === 'string') {
      roleString = roleData;
    } else {
      // Convert to string if it's some other type
      roleString = String(roleData || '');
    }
    
    const normalizedRole = roleString.toUpperCase().trim();
    
    switch (normalizedRole) {
      case 'EMPLOYEE':
        return UserRole.EMPLOYEE;
      case 'MANAGER':
        return UserRole.MANAGER;
      case 'HR':
        return UserRole.HR;
      case 'ADMIN':
      case 'ADMINISTRATOR':
        return UserRole.ADMIN;
      default:
        console.warn('Unknown role received from backend:', roleData);
        return UserRole.EMPLOYEE; // Default to employee
    }
  }

  private fetchUserProfile(role: UserRole): void {
    // Try to fetch user profile from API first
    this.http.get<any>(`${this.API_URL}/profile`).subscribe({
      next: (profileResponse) => {
        const user: AuthUser = {
          id: profileResponse.id || profileResponse.userId || 'unknown',
          firstName: profileResponse.firstName || profileResponse.given_name || 'User',
          lastName: profileResponse.lastName || profileResponse.family_name || '',
          email: profileResponse.email || this.loginEmail || 'user@example.com',
          role: role
        };
        
        this.setUser(user);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      },
      error: (error) => {
        // Create a user with the login email and extract name from it
        const emailName = this.loginEmail ? this.loginEmail.split('@')[0] : 'user';
        const nameParts = emailName.split('.');
        
        const user: AuthUser = {
          id: 'unknown',
          firstName: nameParts[0] ? this.capitalizeFirst(nameParts[0]) : 'User',
          lastName: nameParts[1] ? this.capitalizeFirst(nameParts[1]) : '',
          email: this.loginEmail || 'user@example.com',
          role: role
        };
        
        this.setUser(user);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    });
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
