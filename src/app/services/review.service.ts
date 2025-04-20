import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Review {
  _id?: string;
  reviewer: string;
  reviewed: string;
  rating: number;
  comment: string;
  dinner: string;
  type: 'host_review' | 'guest_review';
  createdAt?: Date;
  guest?: {
    _id: string;
    name: string;
    profileImage?: string;
  };
}

export interface ReviewStats {
  average: number;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  createReview(review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/api/reviews`, review);
  }

  getHostReviews(hostId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/api/reviews/host/${hostId}`);
  }

  getGuestReviews(guestId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/api/reviews/guest/${guestId}`);
  }

  getHostStats(hostId: string): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.apiUrl}/api/reviews/host/${hostId}/stats`);
  }

  getGuestStats(guestId: string): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.apiUrl}/api/reviews/guest/${guestId}/stats`);
  }

  canReviewHost(hostId: string, dinnerId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/api/reviews/can-review-host/${hostId}/${dinnerId}`);
  }

  canReviewGuest(guestId: string, dinnerId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/api/reviews/can-review-guest/${guestId}/${dinnerId}`);
  }
} 