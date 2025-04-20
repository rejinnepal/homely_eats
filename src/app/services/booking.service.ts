import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FileLoggerService } from './file-logger.service';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';

export interface Booking {
  _id?: string;
  dinnerId: string;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  specialRequests?: string;
  totalPrice?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  notification?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  dinner?: {
    _id: string;
    title: string;
    date: string;
    time: string;
    price: number;
    location?: string | { address: string };
    host: {
      _id: string;
      name: string;
      email: string;
    };
  };
  host?: {
    _id: string;
    name: string;
    email: string;
  };
  guest?: {
    _id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl;
  private bookingStatusChanged = new Subject<void>();
  public bookingStatusChanged$ = this.bookingStatusChanged.asObservable();

  constructor(
    private http: HttpClient,
    private logger: FileLoggerService,
    private authService: AuthService,
    private loggerService: LoggerService,
    private notificationService: NotificationService
  ) {
    this.logger.debug('BookingService initialized');
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createBooking(booking: Booking): Observable<Booking> {
    this.logger.debug('Creating booking', { 
      booking,
      isAuthenticated: this.authService.isAuthenticated(),
      userId: this.authService.getCurrentUser()?.id,
      userRole: this.authService.getCurrentUser()?.activeRole
    });

    if (!this.authService.isAuthenticated()) {
      this.logger.error('User not authenticated when creating booking');
      return throwError(() => new Error('Authentication required'));
    }

    // Transform the booking data to match backend expectations
    const bookingData = {
      dinnerId: booking.dinnerId,
      numberOfGuests: booking.numberOfGuests,
      specialRequests: booking.specialRequests || '',
      notification: true // Ensure notification is set to true for new bookings
    };

    this.logger.debug('Sending booking request', { bookingData });

    return this.http.post<Booking>(`${this.apiUrl}/api/bookings`, bookingData, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Booking created successfully', { 
            bookingId: response._id,
            dinnerId: response.dinnerId,
            status: response.status,
            notification: response.notification
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error creating booking', { 
            error,
            status: error.status,
            message: error.message,
            errorDetails: error.error
          });
          return throwError(() => error);
        })
      );
  }

  getUserBookings(): Observable<Booking[]> {
    this.logger.debug('Getting user bookings - auth state', {
      isAuthenticated: this.authService.isAuthenticated(),
      currentUser: this.authService.getCurrentUser(),
      token: this.authService.getToken() ? 'present' : 'missing',
      tokenLength: this.authService.getToken()?.length
    });

    if (!this.authService.isAuthenticated()) {
      this.logger.error('User not authenticated when fetching bookings');
      return throwError(() => new Error('Authentication required'));
    }

    this.logger.info('Fetching user bookings');
    
    return this.http.get<Booking[]>(`${this.apiUrl}/api/bookings/my-bookings`, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.info(`Retrieved ${response.length} bookings`);
          this.logger.debug('User bookings details', {
            bookings: response.map(b => ({
              id: b._id,
              dinnerId: b.dinnerId,
              status: b.status,
              numberOfGuests: b.numberOfGuests,
              notification: b.notification
            }))
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error retrieving user bookings', { 
            error,
            status: error.status,
            message: error.message,
            errorDetails: error.error
          });
          return throwError(() => error);
        })
      );
  }

  getHostBookings(): Observable<Booking[]> {
    if (!this.authService.isAuthenticated()) {
      this.logger.error('User not authenticated when fetching host bookings');
      return throwError(() => new Error('Authentication required'));
    }

    if (!this.authService.isHost()) {
      this.logger.error('User is not a host when fetching host bookings');
      return throwError(() => new Error('Host role required'));
    }

    this.logger.info('Fetching host bookings');
    
    return this.http.get<Booking[]>(`${this.apiUrl}/api/bookings/host-bookings`, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.info(`Retrieved ${response.length} host bookings`);
          this.logger.debug('Host bookings details', {
            bookings: response.map(b => ({
              id: b._id,
              dinnerId: b.dinnerId,
              status: b.status,
              numberOfGuests: b.numberOfGuests,
              notification: b.notification
            }))
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error retrieving host bookings', { 
            error,
            status: error.status,
            message: error.message,
            errorDetails: error.error
          });
          return throwError(() => error);
        })
      );
  }

  approveBooking(bookingId: string): Observable<Booking> {
    this.logger.debug('Approving booking', { bookingId });
    
    return this.http.patch<Booking>(`${this.apiUrl}/api/bookings/${bookingId}/approve`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Booking approved successfully', { 
            bookingId: response._id,
            status: response.status
          });
          
          const guestId = response.guest?._id;
          const dinnerTitle = response.dinner?.title;
          
          if (guestId && dinnerTitle) {
            this.notificationService.createBookingNotification(
              guestId,
              'booking_confirmed',
              `Your booking for "${dinnerTitle}" has been approved! You're all set to attend.`
            ).subscribe({
              next: () => {
                this.logger.debug('Approval notification created successfully', {
                  guestId,
                  dinnerTitle
                });
              },
              error: (error) => {
                this.logger.error('Error creating approval notification', {
                  error,
                  guestId,
                  dinnerTitle
                });
              }
            });
          } else {
            this.logger.warn('Missing guest or dinner information for approval notification', {
              guest: response.guest,
              dinner: response.dinner
            });
          }
          
          // Emit booking status changed event
          this.bookingStatusChanged.next();
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error approving booking', { 
            error,
            bookingId,
            status: error.status
          });
          return throwError(() => error);
        })
      );
  }

  rejectBooking(bookingId: string): Observable<Booking> {
    this.logger.debug('Rejecting booking', { bookingId });
    
    return this.http.patch<Booking>(`${this.apiUrl}/api/bookings/${bookingId}/reject`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Booking rejected successfully', { 
            bookingId: response._id,
            status: response.status
          });
          
          const guestId = response.guest?._id;
          const dinnerTitle = response.dinner?.title;
          
          if (guestId && dinnerTitle) {
            // Create notification before emitting the booking status changed event
            this.notificationService.createRejectionNotification(
              guestId,
              dinnerTitle
            ).subscribe({
              next: (result) => {
                if (result) {
                  this.logger.debug('Rejection notification created successfully', {
                    guestId,
                    dinnerTitle
                  });
                } else {
                  this.logger.warn('Notification creation skipped: User not authenticated', {
                    guestId,
                    dinnerTitle
                  });
                }
                // Emit booking status changed event after notification is created or skipped
                this.bookingStatusChanged.next();
              },
              error: (error) => {
                this.logger.error('Error creating rejection notification', {
                  error,
                  guestId,
                  dinnerTitle
                });
                // Still emit the booking status changed event even if notification creation fails
                this.bookingStatusChanged.next();
              }
            });
          } else {
            this.logger.warn('Missing guest or dinner information for rejection notification', {
              guest: response.guest,
              dinner: response.dinner
            });
            // Emit booking status changed event if no notification was created
            this.bookingStatusChanged.next();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error rejecting booking', { 
            error,
            bookingId,
            status: error.status
          });
          return throwError(() => error);
        })
      );
  }

  cancelBooking(bookingId: string): Observable<Booking> {
    this.logger.debug('Cancelling booking', { bookingId });
    
    return this.http.delete<Booking>(`${this.apiUrl}/api/bookings/${bookingId}`, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Booking cancelled successfully', { 
            bookingId: response._id,
            status: response.status
          });
          
          // Create notification for the host
          if (response.dinner?.host?._id && response.dinner?.title) {
            this.notificationService.createBookingNotification(
              response.dinner.host._id,
              'booking_cancelled',
              `Guest ${response.guest?.name || 'Unknown'} has cancelled their booking for "${response.dinner.title}"`,
              'Booking Cancelled'
            ).subscribe({
              next: () => {
                this.logger.debug('Host notification created for booking cancellation', {
                  hostId: response.dinner?.host?._id,
                  dinnerTitle: response.dinner?.title
                });
              },
              error: (error: Error) => {
                this.logger.error('Error creating host notification for booking cancellation', {
                  error,
                  hostId: response.dinner?.host?._id,
                  dinnerTitle: response.dinner?.title
                });
              }
            });
          } else {
            this.logger.warn('Missing host or dinner information for cancellation notification', {
              dinner: response.dinner,
              host: response.dinner?.host
            });
          }
          
          // Emit booking status changed event
          this.bookingStatusChanged.next();
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error cancelling booking', { 
            error,
            bookingId,
            status: error.status
          });
          return throwError(() => error);
        })
      );
  }

  // Helper method to get booking details
  private getBookingDetails(bookingId: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/api/bookings/${bookingId}`, { headers: this.getHeaders() });
  }

  updateBooking(bookingId: string, numberOfGuests: number, specialRequests?: string): Observable<Booking> {
    if (!this.authService.isAuthenticated()) {
      this.logger.error('User not authenticated when updating booking');
      return throwError(() => new Error('Authentication required'));
    }

    const updateData: any = { numberOfGuests };
    if (specialRequests !== undefined) {
      updateData.specialRequests = specialRequests;
    }

    this.logger.debug('Updating booking', { 
      bookingId,
      numberOfGuests,
      specialRequests
    });

    return this.http.patch<Booking>(`${this.apiUrl}/api/bookings/${bookingId}`, updateData, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          this.logger.debug('Booking updated successfully', { 
            bookingId: response._id,
            numberOfGuests: response.numberOfGuests,
            totalPrice: response.totalPrice
          });
          
          // Emit booking status changed event
          this.bookingStatusChanged.next();
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error updating booking', { 
            error,
            bookingId,
            status: error.status,
            message: error.message
          });
          return throwError(() => error);
        })
      );
  }
} 