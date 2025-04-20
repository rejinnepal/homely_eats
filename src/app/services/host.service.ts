import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, Subject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FileLoggerService } from './file-logger.service';
import { AuthService } from './auth.service';

export interface Host {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  specialties: string[];
  languages: string[];
  dietaryRestrictions: string[];
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  guest: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  dinner: {
    _id: string;
    title: string;
    date: Date;
  };
  createdAt: Date;
  type: 'guest' | 'host';
  reviewed: {
    _id: string;
    name: string;
    profileImage?: string;
  };
}

export interface Dinner {
  _id: string;
  title: string;
  date: Date;
  price: number;
  maxGuests: number;
  currentGuests: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class HostService {
  private apiUrl = environment.apiUrl;
  private hostProfileSubject = new Subject<Host>();
  private hostErrorSubject = new Subject<any>();

  constructor(
    private http: HttpClient,
    private logger: FileLoggerService,
    private authService: AuthService
  ) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  getHostProfile(hostId: string): Observable<{ host: Host, dinners: any[] }> {
    this.logger.debug('Fetching host profile', { hostId });
    
    if (!hostId) {
      this.logger.error('Host ID is missing when fetching host profile');
      return throwError(() => new Error('Host ID is required'));
    }

    // First get the host profile from the hosts endpoint
    return this.http.get<any>(`${this.apiUrl}/api/hosts/${hostId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          const hostData = response.host;
          const dinners = response.dinners || [];

          const host: Host = {
            _id: hostId,
            name: hostData.name,
            email: hostData.email,
            phone: hostData.phone || '',
            bio: hostData.bio || '',
            location: hostData.location || 'Location not specified',
            specialties: hostData.specialties || [],
            languages: hostData.languages || [],
            dietaryRestrictions: hostData.dietaryRestrictions || [],
            isVerified: hostData.isVerified || false,
            rating: hostData.rating || 0,
            reviewCount: hostData.totalReviews || 0,
            imageUrl: hostData.profileImage || '',
            role: 'host',
            createdAt: new Date(hostData.createdAt || Date.now()),
            updatedAt: new Date(hostData.updatedAt || Date.now())
          };
          
          return { host, dinners };
        }),
        tap(response => {
          this.logger.debug('Host profile fetched successfully', { 
            hostId,
            hostName: response.host.name,
            dinnerCount: response.dinners.length
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error retrieving host profile', { 
            error,
            hostId,
            status: error.status
          });
          return throwError(() => error);
        })
      );
  }

  getAllHosts(): Observable<Host[]> {
    this.logger.debug('Fetching all hosts');
    
    return this.http.get<Host[]>(`${this.apiUrl}/api/hosts`)
      .pipe(
        tap(response => {
          this.logger.debug('All hosts retrieved', { 
            count: response.length
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.logger.error('Error retrieving all hosts', { 
            error,
            status: error.status
          });
          return throwError(() => error);
        })
      );
  }

  getHostReviews(hostId: string): Observable<Review[]> {
    this.logger.debug('Fetching host reviews', { hostId });
    
    // Get all dinners for this host and extract reviews
    return this.http.get<any[]>(`${this.apiUrl}/api/dinners`, { headers: this.getHeaders() })
      .pipe(
        map(dinners => {
          const hostDinners = dinners.filter(dinner => dinner.host?._id === hostId);
          const reviews: Review[] = [];
          
          hostDinners.forEach(dinner => {
            if (dinner.reviews) {
              dinner.reviews.forEach((review: any) => {
                reviews.push({
                  _id: review._id || '',
                  rating: review.rating || 0,
                  comment: review.comment || '',
                  guest: {
                    _id: review.guest?._id || '',
                    name: review.guest?.name || 'Anonymous',
                    profileImage: review.guest?.profileImage
                  },
                  dinner: {
                    _id: dinner._id,
                    title: dinner.title,
                    date: new Date(dinner.date)
                  },
                  createdAt: new Date(review.createdAt || Date.now()),
                  type: 'guest',
                  reviewed: {
                    _id: hostId,
                    name: dinner.host?.name || 'Unknown Host',
                    profileImage: dinner.host?.profileImage
                  }
                });
              });
            }
          });
          
          return reviews;
        }),
        catchError(error => {
          this.logger.error('Error fetching host reviews', { error, hostId });
          return of([] as Review[]); // Return empty array if reviews endpoint fails
        })
      );
  }

  updateHostProfile(hostId: string, profile: Partial<Host>): Observable<Host> {
    const url = `${this.apiUrl}/hosts/${hostId}`;
    
    // Log the update attempt
    console.log('Updating host profile:', { hostId, profile });
    
    return this.http.put<Host>(url, profile).pipe(
      tap(updatedHost => {
        console.log('Host profile updated successfully:', updatedHost);
        // Emit the updated host to any subscribers
        this.hostProfileSubject.next(updatedHost);
      }),
      catchError(error => {
        console.error('Error updating host profile:', error);
        // Emit error to subscribers
        this.hostErrorSubject.next(error);
        return throwError(() => new Error(error.error?.message || 'Failed to update host profile'));
      })
    );
  }

  // Helper method to format host data
  private formatHostData(hostData: any): Host {
    return {
      name: hostData.name,
      email: hostData.email,
      phone: hostData.phone || '',
      bio: hostData.bio || '',
      location: hostData.location || '',
      specialties: hostData.specialties || [],
      languages: hostData.languages || [],
      dietaryRestrictions: hostData.dietaryRestrictions || [],
      isVerified: hostData.isVerified || false,
      rating: hostData.rating || 0,
      reviewCount: hostData.reviewCount || 0,
      imageUrl: hostData.imageUrl || '',
      role: 'host',
      createdAt: new Date(hostData.createdAt || Date.now()),
      updatedAt: new Date(hostData.updatedAt || Date.now())
    };
  }

  getHostStats(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/hosts/${id}/stats`);
  }
} 