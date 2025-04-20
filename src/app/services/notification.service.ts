import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadNotifications();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private loadNotifications(): void {
    if (this.authService.isAuthenticated()) {
      this.getNotifications().subscribe(
        notifications => this.notificationsSubject.next(notifications),
        error => console.error('Error loading notifications:', error)
      );
    }
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/api/notifications`, { headers: this.getHeaders() });
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/api/notifications/unread/count`, { headers: this.getHeaders() });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() });
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/notifications/read/all`, {}, { headers: this.getHeaders() }).pipe(
      tap(() => this.loadNotifications())
    );
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/notifications/${notificationId}`, { headers: this.getHeaders() });
  }

  createBookingNotification(recipientId: string, type: string, message?: string, title?: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      console.warn('Cannot create notification: User is not authenticated');
      return new Observable(subscriber => {
        subscriber.next(null);
        subscriber.complete();
      });
    }
    
    return this.http.post(`${this.apiUrl}/api/notifications`, {
      recipient: recipientId,
      type: type,
      title: title,
      message: message
    }, { headers: this.getHeaders() }).pipe(
      tap(() => this.loadNotifications())
    );
  }

  createRejectionNotification(recipientId: string, dinnerTitle: string): Observable<any> {
    return this.createBookingNotification(
      recipientId,
      'booking_rejected',
      `Your booking request for "${dinnerTitle}" has been declined by the host.`,
      'Booking Rejected'
    );
  }

  createCancellationNotification(recipientId: string, dinnerTitle: string, guestName: string): Observable<any> {
    return this.createBookingNotification(
      recipientId,
      'booking_cancelled',
      `Booking for "${dinnerTitle}" by ${guestName} has been cancelled.`,
      'Booking Cancelled'
    );
  }

  showError(title: string, message: string): void {
    console.error(`${title}: ${message}`);
    // You could implement a toast or other UI notification here
  }

  showSuccess(title: string, message: string): void {
    console.log(`Success: ${title} - ${message}`);
    // You could implement a toast or other UI notification here
  }

  showInfo(title: string, message: string): void {
    console.log(`Info: ${title} - ${message}`);
    // You could implement a toast or other UI notification here
  }
} 