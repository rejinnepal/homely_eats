import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationCountService {
  private pendingBookingsCountSubject = new BehaviorSubject<number>(0);
  pendingBookingsCount$ = this.pendingBookingsCountSubject.asObservable();

  constructor(private logger: LoggerService) {
    this.logger.debug('NotificationCountService initialized');
  }

  updatePendingBookingsCount(count: number): void {
    this.logger.debug('Updating pending bookings count', { count });
    this.pendingBookingsCountSubject.next(count);
  }

  incrementPendingBookingsCount(): void {
    const currentCount = this.pendingBookingsCountSubject.value;
    this.logger.debug('Incrementing pending bookings count', { 
      currentCount, 
      newCount: currentCount + 1 
    });
    this.pendingBookingsCountSubject.next(currentCount + 1);
  }

  decrementPendingBookingsCount(): void {
    const currentCount = this.pendingBookingsCountSubject.value;
    if (currentCount > 0) {
      this.logger.debug('Decrementing pending bookings count', { 
        currentCount, 
        newCount: currentCount - 1 
      });
      this.pendingBookingsCountSubject.next(currentCount - 1);
    }
  }

  resetPendingBookingsCount(): void {
    this.logger.debug('Resetting pending bookings count to 0');
    this.pendingBookingsCountSubject.next(0);
  }
} 