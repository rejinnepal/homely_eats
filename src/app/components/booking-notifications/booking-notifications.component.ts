import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService, Booking } from '../../services/booking.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationCountService } from '../../services/notification-count.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-booking-notifications',
  templateUrl: './booking-notifications.component.html',
  styleUrls: ['./booking-notifications.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class BookingNotificationsComponent implements OnInit, OnDestroy {
  pendingBookings: Booking[] = [];
  loading = false;
  error: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private bookingService: BookingService,
    private notificationService: NotificationService,
    private notificationCountService: NotificationCountService
  ) {}

  ngOnInit(): void {
    this.loadPendingBookings();
    
    // Subscribe to booking status changes
    this.subscriptions.push(
      this.bookingService.bookingStatusChanged$.subscribe(() => {
        this.loadPendingBookings();
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadPendingBookings(): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getHostBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.pendingBookings = bookings.filter(booking => booking.status === 'pending');
        this.notificationCountService.updatePendingBookingsCount(this.pendingBookings.length);
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'Failed to load pending bookings';
        this.loading = false;
        console.error('Error loading pending bookings:', err);
      }
    });
  }

  approveBooking(bookingId: string): void {
    this.loading = true;
    this.bookingService.approveBooking(bookingId).subscribe({
      next: () => {
        this.pendingBookings = this.pendingBookings.filter(b => b._id !== bookingId);
        this.notificationCountService.updatePendingBookingsCount(this.pendingBookings.length);
        this.notificationService.showSuccess('Booking Approved', 'Booking request has been approved');
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'Failed to approve booking';
        this.loading = false;
        console.error('Error approving booking:', err);
      }
    });
  }

  rejectBooking(bookingId: string): void {
    this.loading = true;
    this.bookingService.rejectBooking(bookingId).subscribe({
      next: () => {
        this.pendingBookings = this.pendingBookings.filter(b => b._id !== bookingId);
        this.notificationCountService.updatePendingBookingsCount(this.pendingBookings.length);
        this.notificationService.showError('Booking Rejected', 'Booking request has been rejected');
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'Failed to reject booking';
        this.loading = false;
        console.error('Error rejecting booking:', err);
      }
    });
  }
} 