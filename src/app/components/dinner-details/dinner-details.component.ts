import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DinnerService, Dinner } from '../../services/dinner.service';
import { BookingDialogComponent } from '../booking-dialog/booking-dialog.component';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { HostService } from '../../services/host.service';

@Component({
  selector: 'app-dinner-details',
  standalone: true,
  imports: [CommonModule, RouterModule, BookingDialogComponent],
  templateUrl: './dinner-details.component.html',
  styleUrls: ['./dinner-details.component.css']
})
export class DinnerDetailsComponent implements OnInit {
  dinner: Dinner | null = null;
  loading = true;
  error: string | null = null;
  showBookingDialog = false;
  host: any;
  hostDinners: any[] = [];

  // Default dinner image as a data URL
  private defaultDinnerImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dinnerService: DinnerService,
    private authService: AuthService,
    private logger: LoggerService,
    private hostService: HostService
  ) {
    console.log('DinnerDetailsComponent constructed');
  }

  ngOnInit(): void {
    console.log('DinnerDetailsComponent initializing');
    console.log('Current route:', this.router.url);
    console.log('Route parameters:', this.route.snapshot.paramMap);
    
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Dinner ID from route:', id);
    
    if (id) {
      this.loadDinnerDetails(id);
    } else {
      this.error = 'No dinner ID provided';
      this.loading = false;
      console.error('No dinner ID provided in the route');
      this.router.navigate(['/dinners']).then(
        () => console.log('Redirected to dinners list'),
        error => console.error('Error redirecting:', error)
      );
    }
  }

  private loadDinnerDetails(id: string): void {
    console.log('Attempting to load dinner details for ID:', id);
    this.loading = true;
    this.error = null;

    this.dinnerService.getDinnerById(id).subscribe({
      next: (dinner) => {
        this.dinner = dinner;
        if (this.dinner && typeof this.dinner.currentGuests === 'number' && typeof this.dinner.maxGuests === 'number') {
          this.dinner.status = this.dinner.currentGuests >= this.dinner.maxGuests ? 'booked' : 'available';
        }
        console.log('Raw dinner data:', dinner);
        console.log('Dinner object after assignment:', this.dinner);

        // Only try to load host profile if we have a host ID
        if (this.dinner?.host?._id) {
          this.hostService.getHostProfile(this.dinner.host._id).subscribe({
            next: (hostData) => {
              if (hostData) {
                this.host = hostData.host;
                this.hostDinners = hostData.dinners || [];
              }
            },
            error: (error) => {
              console.error('Error loading host profile:', error);
              // If the error is 400, it means the user exists but is not a host
              // We'll still show the dinner details but without host information
              if (error.status === 400) {
                console.log('User exists but is not a host, continuing without host details');
              } else {
                // For other errors, log them but don't affect the dinner display
                console.error('Error loading host profile:', error);
              }
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading dinner:', error);
        this.error = 'Failed to load dinner details. Please try again later.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getDinnerImage(dinner: Dinner): string {
    if (dinner.images && dinner.images.length > 0 && dinner.images[0]) {
      return dinner.images[0];
    }
    return this.defaultDinnerImage;
  }

  getLocationDisplay(location: string | { address: string; city: string; state: string; zipCode: string; }): string {
    if (typeof location === 'object') {
      return `${location.city}, ${location.state}`;
    }
    return location;
  }

  isDinnerAvailable(): boolean {
    if (!this.dinner) return false;
    return this.dinner.status === 'available' && 
           (!this.dinner.currentGuests || this.dinner.currentGuests < this.dinner.maxGuests);
  }

  openBookingDialog(): void {
    if (!this.authService.isAuthenticated()) {
      this.logger.warn('User not authenticated when trying to book dinner');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    if (!this.isDinnerAvailable()) {
      this.logger.warn('Attempted to book unavailable dinner');
      return;
    }
    
    this.showBookingDialog = true;
    this.logger.debug('Opening booking dialog', { 
      dinnerId: this.dinner?._id,
      title: this.dinner?.title
    });
  }

  closeBookingDialog(): void {
    this.showBookingDialog = false;
  }

  onBookingComplete(): void {
    this.showBookingDialog = false;
    this.loadDinnerDetails(this.dinner?._id || '');
    this.logger.debug('Booking completed, refreshing dinner details', { 
      dinnerId: this.dinner?._id
    });
  }
} 