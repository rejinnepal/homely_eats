import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUserProfile(): Observable<User> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<User>(`${this.apiUrl}/api/users/profile`, { headers: this.getHeaders() });
  }

  updateUserProfile(profileData: Partial<User>): Observable<User> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.patch<User>(`${this.apiUrl}/api/users/profile`, profileData, { headers: this.getHeaders() });
  }

  uploadProfileImage(file: File): Observable<{ imageUrl: string }> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const formData = new FormData();
    formData.append('image', file);

    // For file upload, we need to remove the Content-Type header and let the browser set it
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<{ imageUrl: string }>(
      `${this.apiUrl}/api/users/profile-image`,
      formData,
      { headers }
    );
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/users/${userId}`, { headers: this.getHeaders() });
  }

  updateUserRole(userId: string, role: string): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/api/users/${userId}/role`,
      { role },
      { headers: this.getHeaders() }
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/users/${userId}`,
      { headers: this.getHeaders() }
    );
  }
} 