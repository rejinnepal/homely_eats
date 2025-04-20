import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Dinner } from '../../services/dinner.service';
import { BookingService, Booking } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.css']
})
export class BookingDialogComponent implements OnInit {
  @Input() dinner: Dinner | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() bookingComplete = new EventEmitter<void>();

  bookingForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  success = false;
  bookingDetails: { totalPrice: number; guestCount: number; date: string; time: string; } | null = null;
  existingBooking: Booking | null = null;
  checkingExistingBooking = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private authService: AuthService,
    private logger: LoggerService
  ) {
    this.bookingForm = this.fb.group({
      guestCount: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (this.dinner) {
      this.bookingForm.get('guestCount')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.dinner.maxGuests)
      ]);
    }
  }

  ngOnChanges(): void {
    if (this.isOpen && this.dinner && this.authService.isAuthenticated()) {
      this.checkExistingBooking();
    }
  }

  checkExistingBooking(): void {
    this.checkingExistingBooking = true;
    this.bookingService.getUserBookings().subscribe({
      next: (bookings) => {
        this.existingBooking = bookings.find(b => 
          b.dinnerId === this.dinner?._id && 
          (b.status === 'pending' || b.status === 'confirmed')
        ) || null;
        
        if (this.existingBooking) {
          this.logger.debug('Found existing booking', {
            bookingId: this.existingBooking._id,
            status: this.existingBooking.status,
            numberOfGuests: this.existingBooking.numberOfGuests
          });
        }
        
        this.checkingExistingBooking = false;
      },
      error: (error) => {
        this.logger.error('Error checking existing bookings', error);
        this.checkingExistingBooking = false;
      }
    });
  }

  closeDialog(): void {
    this.close.emit();
  }

  updateFormDisabledState(disabled: boolean): void {
    if (disabled) {
      this.bookingForm.disable();
    } else {
      this.bookingForm.enable();
    }
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.dinner || !this.authService.isAuthenticated()) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    // If there's an existing booking, update it instead of creating a new one
    if (this.existingBooking && this.existingBooking._id) {
      this.updateExistingBooking();
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.updateFormDisabledState(true);

    const booking = {
      dinnerId: this.dinner._id!,
      numberOfGuests: this.bookingForm.value.guestCount,
      status: 'pending' as const
    };

    this.logger.debug('Submitting booking', { 
      booking,
      dinner: {
        id: this.dinner._id,
        title: this.dinner.title,
        maxGuests: this.dinner.maxGuests,
        currentGuests: this.dinner.currentGuests
      }
    });

    this.bookingService.createBooking(booking).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.updateFormDisabledState(false);
        this.success = true;
        this.bookingDetails = {
          totalPrice: response.totalPrice || (this.dinner?.price || 0) * booking.numberOfGuests,
          guestCount: booking.numberOfGuests,
          date: this.dinner?.date || '',
          time: this.dinner?.time || ''
        };
        this.logger.debug('Booking created successfully', { 
          bookingId: response._id,
          totalPrice: this.bookingDetails.totalPrice
        });
        setTimeout(() => {
          this.bookingComplete.emit();
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.updateFormDisabledState(false);
        this.error = error.error?.message || 'Failed to create booking. Please try again.';
        this.logger.error('Error creating booking', { 
          error,
          dinnerId: this.dinner?._id,
          numberOfGuests: booking.numberOfGuests
        });
      }
    });
  }

  updateExistingBooking(): void {
    if (!this.existingBooking || !this.existingBooking._id) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.updateFormDisabledState(true);

    const newGuestCount = this.bookingForm.value.guestCount;

    this.logger.debug('Updating existing booking', {
      bookingId: this.existingBooking._id,
      currentGuests: this.existingBooking.numberOfGuests,
      newGuests: newGuestCount
    });

    this.bookingService.updateBooking(this.existingBooking._id, newGuestCount).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.updateFormDisabledState(false);
        this.success = true;
        this.bookingDetails = {
          totalPrice: response.totalPrice || (this.dinner?.price || 0) * newGuestCount,
          guestCount: newGuestCount,
          date: this.dinner?.date || '',
          time: this.dinner?.time || ''
        };
        this.logger.debug('Booking updated successfully', {
          bookingId: response._id,
          totalPrice: this.bookingDetails.totalPrice
        });
        setTimeout(() => {
          this.bookingComplete.emit();
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.updateFormDisabledState(false);
        this.error = error.error?.message || 'Failed to update booking. Please try again.';
        this.logger.error('Error updating booking', {
          error,
          bookingId: this.existingBooking?._id,
          newGuestCount
        });
      }
    });
  }
} 