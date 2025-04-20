import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { FileLoggerService } from './file-logger.service';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  email: string;
  roles: string[];
  activeRole: string;
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public authState$ = this.currentUser$.pipe(map(user => !!user));
  private apiUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);
  private tokenKey = 'auth_token';

  constructor(
    private http: HttpClient,
    private logger: FileLoggerService
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem(this.tokenKey);
    
    this.logger.debug('Loading stored user', {
      hasStoredUser: !!storedUser,
      hasToken: !!token
    });
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.logger.debug('Loaded stored user', { user });
      } catch (error) {
        this.logger.error('Error parsing stored user', { error });
        this.clearAuthData();
      }
    } else {
      this.logger.debug('No stored user or token found');
      this.clearAuthData();
    }
  }

  login(email: string, password: string): Observable<{ user: User, token: string }> {
    return this.http.post<{ user: User, token: string }>(`${this.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.logger.debug('Login response received', { user: response.user });
          this.setAuthData(response.user, response.token);
        })
      );
  }

  register(userData: any): Observable<{ user: User, token: string }> {
    return this.http.post<{ user: User, token: string }>(`${this.apiUrl}/api/auth/register`, userData)
      .pipe(
        tap(response => {
          this.logger.debug('Register response received', { user: response.user });
          this.setAuthData(response.user, response.token);
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this.logger.debug('User logged out');
  }

  private setAuthData(user: User, token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem(this.tokenKey, token);
      this.logger.debug('Auth data set', {
        user: {
          id: user.id,
          roles: user.roles,
          activeRole: user.activeRole,
          name: user.name
        }
      });
    }
    this.currentUserSubject.next(user);
  }

  clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUserSubject.next(null);
  }

  updateCurrentUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const hasUser = !!this.getCurrentUser();
    const hasToken = !!this.getToken();
    
    // Reduce debug logging to prevent console spam
    this.logger.debug('Checking authentication status', {
      hasUser,
      hasToken
    });
    
    return hasUser && hasToken;
  }

  isHost(): boolean {
    const currentUser = this.getCurrentUser();
    const isHost = currentUser?.activeRole === 'host';
    
    this.logger.debug('Checking if user is host', {
      isHost,
      userRoles: currentUser?.roles,
      activeRole: currentUser?.activeRole
    });
    
    return isHost;
  }

  hasRole(role: string): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.roles.includes(role) || false;
  }

  hasMultipleRoles(): boolean {
    const currentUser = this.getCurrentUser();
    return Array.isArray(currentUser?.roles) && currentUser.roles.length > 1;
  }

  switchRole(role: string): Observable<{ user: User, token: string }> {
    // Ensure role is in lowercase and trimmed
    const normalizedRole = role.toLowerCase().trim();
    
    this.logger.debug('Auth service switching role', {
      role: normalizedRole,
      originalRole: role,
      currentUser: this.getCurrentUser(),
      token: this.getToken() ? 'present' : 'missing',
      requestBody: { role: normalizedRole }
    });
    
    return this.http.post<{ user: User, token: string }>(`${this.apiUrl}/api/auth/switch-role`, { role: normalizedRole }, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap(response => {
        this.logger.debug('Role switch response received', { 
          user: response.user,
          newRole: normalizedRole,
          originalRole: role
        });
        this.setAuthData(response.user, response.token);
      })
    );
  }

  becomeHost(): Observable<{ user: User, token: string }> {
    if (!this.isAuthenticated()) {
      this.logger.error('User not authenticated when trying to become a host');
      return new Observable(subscriber => {
        subscriber.error({ error: { message: 'Authentication required' } });
      });
    }

    this.logger.debug('User requesting to become a host', {
      userId: this.getCurrentUser()?.id,
      currentRoles: this.getCurrentUser()?.roles,
      activeRole: this.getCurrentUser()?.activeRole
    });

    return this.http.post<{ user: User, token: string }>(`${this.apiUrl}/api/auth/become-host`, {}, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap(response => {
        this.logger.debug('Become host response received', { user: response.user });
        this.setAuthData(response.user, response.token);
      })
    );
  }
} 