import { Component, OnInit, OnDestroy, PLATFORM_ID, inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../services/logger.service';
import { RoleSwitcherComponent } from '../role-switcher/role-switcher.component';
import { NotificationService } from '../../services/notification.service';
import { BookingService, Booking } from '../../services/booking.service';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationCountService } from '../../services/notification-count.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RoleSwitcherComponent, NotificationComponent, NotificationBellComponent, MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  currentUser: User | null = null;
  private userSubscription: Subscription;
  private platformId = inject(PLATFORM_ID);
  pendingBookingsCount = 0;
  private subscriptions: Subscription[] = [];
  private lastScrollTop = 0;
  isNavbarVisible = true;
  private scrollThreshold = 50; // Minimum scroll amount before hiding/showing
  private scrollTimeout: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService,
    private notificationService: NotificationService,
    private bookingService: BookingService,
    private notificationCountService: NotificationCountService
  ) {
    this.logger.info('Header component initialized');
    
    // Check localStorage directly
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          this.currentUser = parsedUser;
          this.logger.info('Found user in localStorage', { 
            user: parsedUser,
            roles: parsedUser.roles,
            activeRole: parsedUser.activeRole,
            hasMultipleRoles: Array.isArray(parsedUser.roles) && parsedUser.roles.length > 1
          });
          
          // If user is a host, load pending bookings immediately
          if (parsedUser.activeRole === 'host') {
            this.loadPendingBookings();
          }
        } catch (error) {
          this.logger.error('Error parsing stored user', error);
          localStorage.removeItem('currentUser');
        }
      }
    }
    
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.logger.info('Current user updated in header', { 
          user,
          roles: user?.roles,
          activeRole: user?.activeRole,
          hasMultipleRoles: user?.roles && user.roles.length > 1
        });
        this.currentUser = user;
        if (user) {
          this.logger.info('User is logged in', { 
            name: user.name, 
            email: user.email,
            roles: user.roles,
            activeRole: user.activeRole,
            hasMultipleRoles: user.roles && user.roles.length > 1
          });
          // Check if user is a host and load pending bookings
          if (user.activeRole === 'host') {
            this.loadPendingBookings();
          } else {
            this.pendingBookingsCount = 0;
            this.notificationCountService.resetPendingBookingsCount();
          }
        } else {
          this.logger.info('User is logged out');
          this.pendingBookingsCount = 0;
          this.notificationCountService.resetPendingBookingsCount();
        }
      },
      error: (error) => {
        this.logger.error('Error in user subscription', error);
      }
    });
  }

  ngOnInit(): void {
    this.logger.info('Header component ngOnInit');
    
    // Subscribe to auth state changes to update pending bookings
    this.subscriptions.push(
      this.authService.authState$.subscribe((isAuthenticated: boolean) => {
        this.logger.debug('Auth state changed', { isAuthenticated });
        if (isAuthenticated && this.authService.isHost()) {
          this.loadPendingBookings();
        } else {
          this.pendingBookingsCount = 0;
          this.notificationCountService.resetPendingBookingsCount();
        }
      })
    );

    // Subscribe to role changes
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.logger.debug('User role changed', { 
          activeRole: user?.activeRole,
          roles: user?.roles
        });
        if (user?.activeRole === 'host') {
          this.loadPendingBookings();
        } else {
          this.pendingBookingsCount = 0;
        }
      })
    );
    
    // Subscribe to booking status changes
    this.subscriptions.push(
      this.bookingService.bookingStatusChanged$.subscribe(() => {
        this.logger.debug('Booking status changed, refreshing pending bookings');
        if (this.authService.isHost()) {
          this.loadPendingBookings();
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private loadPendingBookings(): void {
    if (!this.authService.isHost()) {
      this.pendingBookingsCount = 0;
      this.logger.debug('User is not a host, setting pending bookings count to 0');
      return;
    }

    this.logger.debug('Loading pending bookings for host');
    this.bookingService.getHostBookings().subscribe({
      next: (bookings) => {
        this.logger.debug('Host bookings retrieved', { 
          totalBookings: bookings.length,
          bookings: bookings.map(b => ({ 
            id: b._id, 
            status: b.status,
            notification: b.notification,
            dinnerId: b.dinnerId
          }))
        });
        
        const pendingBookings = bookings.filter(booking => booking.status === 'pending');
        this.pendingBookingsCount = pendingBookings.length;
        
        this.logger.debug('Updated pending bookings count', { 
          count: this.pendingBookingsCount,
          pendingBookings: pendingBookings.map(b => ({ 
            id: b._id, 
            dinnerId: b.dinnerId,
            notification: b.notification
          }))
        });

        // Show notification if there are pending bookings
        if (this.pendingBookingsCount > 0) {
          this.notificationService.showInfo('Pending Bookings', `You have ${this.pendingBookingsCount} pending booking${this.pendingBookingsCount > 1 ? 's' : ''}`);
        }
      },
      error: (error) => {
        this.logger.error('Error loading pending bookings', { 
          error,
          status: error.status,
          message: error.message,
          errorDetails: error.error
        });
        this.pendingBookingsCount = 0;
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    // Clear the existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Add a small delay to debounce the scroll events
    this.scrollTimeout = setTimeout(() => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Check if we've scrolled past the threshold
      if (Math.abs(currentScrollTop - this.lastScrollTop) > this.scrollThreshold) {
        // Scrolling down
        if (currentScrollTop > this.lastScrollTop && currentScrollTop > 50) {
          this.isNavbarVisible = false;
        }
        // Scrolling up
        else {
          this.isNavbarVisible = true;
        }
        this.lastScrollTop = currentScrollTop;
      }
    }, 10);
  }
}
