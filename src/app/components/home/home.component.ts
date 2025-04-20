import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DinnerService, Dinner } from '../../services/dinner.service';
import { LoggerService } from '../../services/logger.service';
import { AuthService, User } from '../../services/auth.service';
import { BookingService, Booking } from '../../services/booking.service';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDividerModule,
    MatProgressSpinnerModule
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  upcomingDinners: Dinner[] = [];
  userBookings: Booking[] = [];
  hostDinners: Dinner[] = [];
  pendingBookings: Booking[] = [];
  
  testimonials = [
    {
      name: 'Sarah Johnson',
      image: 'assets/images/testimonial1.jpg',
      text: 'HomelyEats has completely changed how I dine out. I\'ve met amazing people and tasted incredible food!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      image: 'assets/images/testimonial2.jpg',
      text: 'As a host, I love sharing my culinary passion with others. The platform is easy to use and the guests are wonderful!',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      image: 'assets/images/testimonial3.jpg',
      text: 'I\'ve discovered so many new cuisines and made friends from around the world. HomelyEats is a game-changer!',
      rating: 4
    }
  ];

  isLoading = true;
  error: string | null = null;
  isHost = false;
  isAuthenticated = false;
  currentUser: User | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private dinnerService: DinnerService,
    private logger: LoggerService,
    private authService: AuthService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.logger.info('HomeComponent initialized');
    
    // Subscribe to auth state changes
    this.subscriptions.push(
      this.authService.authState$.subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.currentUser = this.authService.getCurrentUser();
        this.isHost = this.authService.isHost();
        
        if (isAuthenticated) {
          this.loadPersonalizedContent();
        } else {
          this.loadUpcomingDinners();
        }
      })
    );
    
    // Subscribe to booking status changes
    this.subscriptions.push(
      this.bookingService.bookingStatusChanged$.subscribe(() => {
        if (this.isAuthenticated) {
          this.loadUserBookings();
          if (this.isHost) {
            this.loadHostDinners();
            this.loadPendingBookings();
          }
        }
      })
    );
    
    // Initial load
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.isHost = this.authService.isHost();
    
    if (this.isAuthenticated) {
      this.loadPersonalizedContent();
    } else {
      this.loadUpcomingDinners();
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load personalized content based on user role
  loadPersonalizedContent(): void {
    this.isLoading = true;
    this.error = null;
    
    if (this.isHost) {
      // Load host-specific content
      this.loadHostDinners();
      this.loadPendingBookings();
    } else {
      // Load guest-specific content
      this.loadUserBookings();
      this.loadUpcomingDinners();
    }
  }
  
  // Load upcoming dinners
  loadUpcomingDinners(): void {
    this.isLoading = true;
    this.error = null;
    
    // Add a flag to track if we've already tried to load dinners
    if (this.upcomingDinners.length > 0) {
      this.isLoading = false;
      return; // Skip if we already have dinners loaded
    }
    
    this.dinnerService.getUpcomingDinners().subscribe({
      next: (dinners) => {
        this.upcomingDinners = dinners;
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading upcoming dinners', error);
        this.error = 'Failed to load upcoming dinners. Please try again later.';
        this.isLoading = false;
        
        // Set empty array as fallback to prevent UI errors
        this.upcomingDinners = [];
      }
    });
  }
  
  // Load user bookings
  loadUserBookings(): void {
    this.bookingService.getUserBookings().subscribe({
      next: (bookings) => {
        this.userBookings = bookings;
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading user bookings', error);
        this.userBookings = [];
        this.isLoading = false;
      }
    });
  }
  
  // Load host dinners
  loadHostDinners(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.logger.error('Cannot load host dinners: User not authenticated or missing ID');
      this.hostDinners = [];
      this.isLoading = false;
      return;
    }
    
    this.dinnerService.getHostDinners(currentUser.id).subscribe({
      next: (dinners) => {
        this.hostDinners = dinners;
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading host dinners', error);
        this.hostDinners = [];
        this.isLoading = false;
      }
    });
  }
  
  // Load pending bookings for hosts
  loadPendingBookings(): void {
    this.bookingService.getHostBookings().subscribe({
      next: (bookings) => {
        this.pendingBookings = bookings.filter(booking => booking.status === 'pending');
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading pending bookings', error);
        this.error = 'Failed to load pending bookings. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // Check if description is long enough to need truncation
  isDescriptionLong(description: string): boolean {
    return description.length > 100;
  }
  
  // Handle image loading errors
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.jpg';
  }
  
  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  // Get upcoming bookings
  getUpcomingBookings(): Booking[] {
    const now = new Date();
    return this.userBookings
      .filter(booking => {
        if (!booking.dinner?.date) return false;
        const bookingDate = new Date(booking.dinner.date);
        return bookingDate >= now && booking.status !== 'cancelled' && booking.status !== 'rejected';
      })
      .sort((a, b) => {
        if (!a.dinner?.date || !b.dinner?.date) return 0;
        return new Date(a.dinner.date).getTime() - new Date(b.dinner.date).getTime();
      });
  }
  
  // Get past bookings
  getPastBookings(): Booking[] {
    const now = new Date();
    return this.userBookings
      .filter(booking => {
        if (!booking.dinner?.date) return false;
        const bookingDate = new Date(booking.dinner.date);
        return bookingDate < now || booking.status === 'cancelled' || booking.status === 'rejected';
      })
      .sort((a, b) => {
        if (!a.dinner?.date || !b.dinner?.date) return 0;
        return new Date(b.dinner.date).getTime() - new Date(a.dinner.date).getTime();
      });
  }
} 