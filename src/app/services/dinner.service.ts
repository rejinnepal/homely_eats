import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FileLoggerService } from './file-logger.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

export interface Dinner {
  _id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  maxGuests: number;
  location: string | { address: string; city: string; state: string; zipCode: string; };
  hostId?: string;
  host?: {
    _id: string;
    name: string;
    email: string;
  };
  currentGuests?: number;
  status?: 'available' | 'booked' | 'cancelled';
  menu?: { name: string; description: string; }[];
  dietaryRestrictions?: string[];
  images?: string[];
  cuisine?: string;
  dateTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DinnerService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private logger: FileLoggerService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createDinner(dinnerData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.post(`${this.apiUrl}/api/dinners`, dinnerData, { headers });
  }

  getAllDinners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/dinners`);
  }

  getDinnerById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/dinners/${id}`);
  }

  updateDinner(id: string, dinnerData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.put(`${this.apiUrl}/api/dinners/${id}`, dinnerData, { headers });
  }

  deleteDinner(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/dinners/${id}`);
  }

  getDinnerImage(dinnerId: string, imageIndex: number): string {
    return `${this.apiUrl}/api/dinners/${dinnerId}/image/${imageIndex}`;
  }

  getDinners(): Observable<Dinner[]> {
    return this.http.get<Dinner[]>(`${this.apiUrl}/api/dinners`, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Dinners retrieved', { 
            count: response.length
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error retrieving dinners', { 
            error,
            status: error.status
          });
          return throwError(() => error);
        })
      );
  }

  getMyDinners(): Observable<Dinner[]> {
    this.logger.debug('Fetching host dinners', {
      isAuthenticated: this.authService.isAuthenticated(),
      isHost: this.authService.isHost(),
      userId: this.authService.getCurrentUser()?.id,
      userRole: this.authService.getCurrentUser()?.activeRole,
      token: this.authService.getToken() ? 'Token exists' : 'No token'
    });

    if (!this.authService.isAuthenticated()) {
      this.logger.error('User not authenticated when fetching host dinners');
      return throwError(() => new Error('Authentication required'));
    }

    if (!this.authService.isHost()) {
      this.logger.error('User is not a host when fetching host dinners');
      return throwError(() => new Error('Host role required'));
    }

    return this.http.get<Dinner[]>(`${this.apiUrl}/api/dinners/my-dinners`, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Host dinners retrieved', { 
            count: response.length,
            dinners: response.map(d => ({
              id: d._id,
              title: d.title,
              hostId: d.hostId,
              host: d.host
            }))
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error retrieving host dinners', { 
            error,
            status: error.status,
            message: error.message,
            errorDetails: error.error
          });
          return throwError(() => error);
        })
      );
  }

  getHostDinners(hostId: string): Observable<Dinner[]> {
    return this.http.get<Dinner[]>(`${this.apiUrl}/api/dinners/host/${hostId}`, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Host dinners retrieved', { 
            hostId,
            count: response.length
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error retrieving host dinners', { 
            error,
            hostId,
            status: error.status
          });
          return throwError(() => error);
        })
      );
  }

  getUpcomingDinners(): Observable<Dinner[]> {
    this.logger.debug('Fetching upcoming dinners');
    
    // First try to get upcoming dinners from the dedicated endpoint
    return this.http.get<Dinner[]>(`${this.apiUrl}/api/dinners/upcoming`, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Upcoming dinners retrieved', { 
            count: response.length
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.warn('Upcoming dinners endpoint not available, falling back to all dinners', { 
            error,
            status: error.status
          });
          
          // Fallback: If the upcoming endpoint fails, get all dinners and filter for upcoming ones
          return this.getDinners().pipe(
            tap(dinners => {
              // Filter for upcoming dinners (within the next 30 days)
              const upcomingDinners = dinners.filter(dinner => {
                const dinnerDate = new Date(dinner.date);
                const today = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(today.getDate() + 30);
                
                return dinnerDate >= today && dinnerDate <= thirtyDaysFromNow;
              });
              
              // Sort by date (closest first)
              upcomingDinners.sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              });
              
              this.logger.debug('Fallback upcoming dinners created', { 
                count: upcomingDinners.length
              });
              
              return upcomingDinners;
            })
          );
        })
      );
  }
} 