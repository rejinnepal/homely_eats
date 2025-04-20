import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BookingService, Booking } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'upcoming' | 'past' = 'upcoming';
  private subscriptions: Subscription[] = [];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.logger.warn('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    // Ensure user is in guest role for bookings
    if (this.authService.isHost()) {
      this.logger.warn('User is a host, switching to guest role for bookings');
      this.authService.switchRole('user').subscribe({
        next: (response) => {
          this.logger.debug('Successfully switched to guest role', {
            newRole: response.user.activeRole,
            userId: response.user.id
          });
          this.loadBookings();
        },
        error: (error) => {
          this.logger.error('Failed to switch to guest role', { error });
          this.error = 'Failed to load bookings. Please try again later.';
        }
      });
    } else {
      this.loadBookings();
    }
    
    // Subscribe to booking status changes
    this.subscriptions.push(
      this.bookingService.bookingStatusChanged$.subscribe(() => {
        this.logger.debug('Booking status changed, refreshing bookings');
        this.loadBookings();
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getUserBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.logger.debug('Bookings loaded', {
          totalBookings: bookings.length,
          bookings: bookings.map(b => ({
            id: b._id,
            dinnerId: b.dinnerId,
            status: b.status,
            date: b.dinner?.date,
            numberOfGuests: b.numberOfGuests
          }))
        });
        this.bookings = bookings;
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.logger.error('Error loading bookings', error);

        if (error.status === 401) {
          this.error = 'Your session has expired. Please log in again.';
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.error = 'You do not have permission to view these bookings.';
        } else if (error.status === 404) {
          this.error = 'No bookings found.';
          this.bookings = [];
        } else if (error.status === 0) {
          this.error = 'Unable to connect to the server. Please check your internet connection.';
        } else {
          this.error = 'Unable to load your bookings at this time. Please try again later.';
        }

        // Show error notification
        this.notificationService.showError(
          'Error Loading Bookings',
          this.error
        );
      }
    });
  }

  getFilteredBookings(): Booking[] {
    const now = new Date();
    const filtered = this.bookings.filter(booking => {
      const bookingDate = new Date(booking.dinner?.date || '');
      const isUpcoming = bookingDate >= now;
      const isConfirmed = booking.status === 'confirmed';
      const isPending = booking.status === 'pending';
      const isCancelled = booking.status === 'cancelled';
      const isRejected = booking.status === 'rejected';
      
      this.logger.debug('Filtering booking', {
        bookingId: booking._id,
        dinnerId: booking.dinnerId,
        date: booking.dinner?.date,
        status: booking.status,
        isUpcoming,
        isConfirmed,
        isPending,
        isCancelled,
        isRejected,
        activeTab: this.activeTab,
        willShow: this.activeTab === 'upcoming' 
          ? (isUpcoming && (isConfirmed || isPending))
          : ((!isUpcoming && isConfirmed) || isCancelled || isRejected)
      });

      if (this.activeTab === 'upcoming') {
        return isUpcoming && (isConfirmed || isPending);
      } else {
        return (!isUpcoming && isConfirmed) || isCancelled || isRejected;
      }
    });

    this.logger.debug('Filtered bookings result', {
      activeTab: this.activeTab,
      totalBookings: this.bookings.length,
      filteredCount: filtered.length,
      filteredBookings: filtered.map(b => ({
        id: b._id,
        dinnerId: b.dinnerId,
        status: b.status,
        date: b.dinner?.date
      }))
    });

    return filtered;
  }

  setActiveTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
  }

  cancelBooking(bookingId: string): void {
    if (!bookingId) {
      console.error('No booking ID provided');
      return;
    }

    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          this.loadBookings();
          // Only show success notification if user is still logged in
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.notificationService.showSuccess(
              'Booking Cancelled',
              'Your booking has been successfully cancelled.'
            );
          }
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          // Only show error notification if user is still logged in
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.notificationService.showError(
              'Error',
              'Failed to cancel booking. Please try again.'
            );
          }
        }
      });
    }
  }

  updateBookingGuests(booking: Booking): void {
    if (!booking._id) {
      this.logger.error('Cannot update booking: ID is undefined');
      return;
    }

    if (booking.status !== 'pending') {
      this.error = 'Can only update pending bookings';
      return;
    }

    const newGuestCount = prompt(`Enter new number of guests (current: ${booking.numberOfGuests}):`, booking.numberOfGuests.toString());
    
    if (newGuestCount === null) {
      return; // User cancelled
    }
    
    const guestCount = parseInt(newGuestCount, 10);
    
    if (isNaN(guestCount) || guestCount < 1) {
      this.error = 'Please enter a valid number of guests (minimum 1)';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    this.bookingService.updateBooking(booking._id, guestCount).subscribe({
      next: (updatedBooking) => {
        this.loadBookings();
        this.logger.debug('Booking updated successfully', {
          bookingId: updatedBooking._id,
          newGuestCount: updatedBooking.numberOfGuests,
          totalPrice: updatedBooking.totalPrice
        });
      },
      error: (error: any) => {
        this.error = error.error?.message || 'Failed to update booking. Please try again later.';
        this.loading = false;
        this.logger.error('Error updating booking', error);
      }
    });
  }

  formatDate(date: string | undefined, time: string | undefined): string {
    if (!date) return 'Date not specified';
    const formattedDate = new Date(date).toLocaleDateString();
    return time ? `${formattedDate} at ${time}` : formattedDate;
  }

  getLocationDisplay(location: string | { address: string } | undefined): string {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    return location.address || 'Location not specified';
  }
} 