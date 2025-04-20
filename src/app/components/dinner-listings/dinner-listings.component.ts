import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DinnerService, Dinner } from '../../services/dinner.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-dinner-listings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dinner-listings.component.html',
  styleUrls: ['./dinner-listings.component.css']
})
export class DinnerListingsComponent implements OnInit {
  dinners: Dinner[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private dinnerService: DinnerService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.loadDinners();
  }

  loadDinners(): void {
    this.loading = true;
    this.error = null;

    this.dinnerService.getDinners().subscribe({
      next: (dinners) => {
        this.dinners = dinners;
        this.loading = false;
        this.logger.debug('Dinners loaded successfully', { count: dinners.length });
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to load dinner listings. Please try again later.';
        this.logger.error('Error loading dinners', { error });
      }
    });
  }

  getDinnerImage(dinner: Dinner): string {
    if (dinner.images && dinner.images.length > 0) {
      return dinner.images[0];
    }
    return 'assets/default-dinner.jpg';
  }

  getLocationDisplay(location: any): string {
    if (typeof location === 'string') {
      return location;
    }
    return location?.address || 'Location not specified';
  }

  navigateToDinner(dinnerId: string | undefined): void {
    if (dinnerId) {
      this.logger.debug('Navigating to dinner', { dinnerId });
      this.router.navigate(['/dinners', dinnerId]);
    } else {
      this.logger.error('Cannot navigate to dinner: ID is undefined');
    }
  }
} 