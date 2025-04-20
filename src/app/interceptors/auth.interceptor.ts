import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private logger: LoggerService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip auth for login and register endpoints
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      return next.handle(request);
    }

    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    this.logger.debug('Auth state for request', { 
      url: request.url,
      method: request.method,
      isAuthenticated: !!currentUser,
      hasToken: !!token,
      userRole: currentUser?.activeRole,
      tokenLength: token?.length
    });
    
    if (!currentUser || !token) {
      this.logger.warn('No authenticated user or token found for request', { 
        url: request.url,
        method: request.method,
        hasUser: !!currentUser,
        hasToken: !!token
      });
      
      // If no user but trying to access protected route, redirect to login
      if (request.url.includes('/dinners') && request.method === 'POST') {
        this.logger.warn('Attempting to create dinner without authentication, redirecting to login');
        this.router.navigate(['/login']);
        return throwError(() => new Error('Authentication required'));
      }
      
      return next.handle(request);
    }

    // Add token to request headers
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
    
    this.logger.debug('Adding token to request', {
      url: request.url,
      method: request.method,
      tokenLength: token.length,
      headers: Object.fromEntries(authReq.headers.keys().map(key => [key, authReq.headers.get(key)]))
    });
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.logger.warn('Authentication failed', { 
            url: request.url,
            method: request.method,
            error: error.message,
            errorDetails: error.error
          });
          
          // Check if this is a role-specific endpoint that requires a different role
          if (request.url.includes('/my-dinners') && currentUser.activeRole !== 'host') {
            this.logger.warn('Accessing host endpoint with guest role, switching to host role');
            this.authService.switchRole('host').subscribe({
              next: () => {
                // Retry the request with the new role
                const newToken = this.authService.getToken();
                const newAuthReq = request.clone({
                  headers: request.headers.set('Authorization', `Bearer ${newToken}`)
                });
                return next.handle(newAuthReq);
              },
              error: (switchError) => {
                this.logger.error('Failed to switch role', { error: switchError });
                this.authService.clearAuthData();
                this.router.navigate(['/login']);
                return throwError(() => switchError);
              }
            });
          }
          
          if (request.url.includes('/my-bookings') && currentUser.activeRole !== 'user') {
            this.logger.warn('Accessing guest endpoint with host role, switching to guest role');
            this.authService.switchRole('user').subscribe({
              next: () => {
                // Retry the request with the new role
                const newToken = this.authService.getToken();
                const newAuthReq = request.clone({
                  headers: request.headers.set('Authorization', `Bearer ${newToken}`)
                });
                return next.handle(newAuthReq);
              },
              error: (switchError) => {
                this.logger.error('Failed to switch role', { error: switchError });
                this.authService.clearAuthData();
                this.router.navigate(['/login']);
                return throwError(() => switchError);
              }
            });
          }
          
          // Only clear user if it's a protected route
          if (request.url.includes('/dinners') && request.method === 'POST') {
            this.authService.clearAuthData();
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
} 