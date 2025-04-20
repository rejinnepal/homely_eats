import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DinnerService, Dinner } from '../../services/dinner.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { DinnerListing } from '../../models/dinner.model';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-listings.component.html',
  styleUrls: ['./my-listings.component.css']
})
export class MyListingsComponent implements OnInit {
  dinners: Dinner[] = [];
  isLoading = false;
  error: string | null = null;
  currentUser: any = null;
  activeTab: 'upcoming' | 'past' = 'upcoming';

  constructor(
    private dinnerService: DinnerService,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {
    this.logger.debug('MyListingsComponent initialized');
  }

  ngOnInit(): void {
    this.logger.debug('MyListingsComponent ngOnInit');
    
    this.currentUser = this.authService.getCurrentUser();
    this.logger.debug('Current user in MyListingsComponent', { 
      user: this.currentUser,
      isAuthenticated: this.authService.isAuthenticated(),
      isHost: this.authService.isHost(),
      token: this.authService.getToken() ? 'Token exists' : 'No token'
    });
    
    // Check if user is authenticated and has host role
    if (!this.authService.isAuthenticated()) {
      this.logger.warn('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.isHost()) {
      this.logger.warn('User is not a host, switching to host role', {
        currentRole: this.currentUser?.activeRole,
        availableRoles: this.currentUser?.roles
      });
      
      // Try to switch to host role
      this.authService.switchRole('host').subscribe({
        next: (response) => {
          this.logger.debug('Successfully switched to host role', {
            newRole: response.user.activeRole,
            userId: response.user.id
          });
          this.currentUser = response.user;
          this.loadMyDinners();
        },
        error: (error) => {
          this.logger.error('Failed to switch to host role', { error });
          this.error = 'You need to be a host to view your listings';
        }
      });
    } else {
      this.loadMyDinners();
    }
  }

  loadMyDinners(): void {
    this.isLoading = true;
    this.error = null;
    
    this.logger.debug('Loading host dinners', {
      userId: this.currentUser?.id,
      isHost: this.authService.isHost(),
      token: this.authService.getToken() ? 'Token exists' : 'No token'
    });

    this.dinnerService.getMyDinners().subscribe({
      next: (dinners) => {
        this.logger.debug('Host dinners loaded successfully', { 
          count: dinners.length,
          dinners: dinners.map(d => ({
            id: d._id,
            title: d.title,
            hostId: d.hostId,
            host: d.host,
            dateTime: d.dateTime,
            status: d.status
          }))
        });
        this.dinners = dinners;
        this.isLoading = false;

        // Log filtered dinners
        const filteredDinners = this.getFilteredDinners();
        this.logger.debug('Filtered dinners', {
          activeTab: this.activeTab,
          totalDinners: this.dinners.length,
          filteredCount: filteredDinners.length,
          filteredDinners: filteredDinners.map(d => ({
            id: d._id,
            title: d.title,
            dateTime: d.dateTime,
            status: d.status
          }))
        });
      },
      error: (error) => {
        this.error = 'Error loading your dinner listings';
        this.isLoading = false;
        this.logger.error('Error loading host dinners', { 
          error,
          status: error.status,
          message: error.message,
          errorDetails: error.error
        });
      }
    });
  }

  getFilteredDinners(): Dinner[] {
    const now = new Date();
    return this.dinners.filter(dinner => {
      const dinnerDate = new Date(dinner.date);
      if (this.activeTab === 'upcoming') {
        return dinnerDate >= now && dinner.status !== 'cancelled';
      } else {
        return dinnerDate < now || dinner.status === 'cancelled';
      }
    });
  }

  setActiveTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
  }

  deleteDinner(id: string): void {
    if (confirm('Are you sure you want to delete this dinner listing?')) {
      this.isLoading = true;
      this.error = null;
      
      this.dinnerService.deleteDinner(id).subscribe({
        next: () => {
          this.logger.info('Dinner deleted successfully', { dinnerId: id });
          this.loadMyDinners(); // Reload the list after successful deletion
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Failed to delete the dinner listing';
          this.logger.error('Failed to delete dinner', { 
            error,
            dinnerId: id,
            message: error.error?.message || error.message
          });
        }
      });
    }
  }

  editDinner(id: string): void {
    this.router.navigate(['/edit-dinner', id]);
  }

  getLocationDisplay(location: string | { address: string } | undefined): string {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    return location.address || 'N/A';
  }
}
