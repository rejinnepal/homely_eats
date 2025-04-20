import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DinnerService } from '../../services/dinner.service';
import { DinnerListing } from '../../models/dinner.model';
import { AuthService } from '../../services/auth.service';
import { Dinner } from '../../services/dinner.service';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { HostService, Host, Review } from '../../services/host.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

interface ExtendedReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

@Component({
  selector: 'app-host-profile',
  templateUrl: './host-profile.component.html',
  styleUrls: ['./host-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatButtonModule
  ]
})
export class HostProfileComponent implements OnInit {
  hostId: string;
  host: Host | null = null;
  reviews: Review[] = [];
  stats: ExtendedReviewStats = {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  };
  upcomingDinners: Dinner[] = [];
  loading = true;
  error: string | null = null;
  hostDinners: DinnerListing[] = [];

  constructor(
    private route: ActivatedRoute,
    private dinnerService: DinnerService,
    private authService: AuthService,
    private hostService: HostService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.hostId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    this.loadHostProfile();
    this.loadReviews();
    this.loadUpcomingDinners();
  }

  private loadHostProfile(): void {
    this.loading = true;
    this.error = null;

    if (!this.hostId) {
      this.error = 'Host ID is missing. Please try again later.';
      this.loading = false;
      return;
    }

    this.hostService.getHostProfile(this.hostId).subscribe({
      next: (response) => {
        if (!response || !response.host) {
          this.error = 'Host profile not found.';
          this.loading = false;
          return;
        }
        
        this.host = response.host;
        this.hostDinners = response.dinners || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading host profile:', error);
        
        if (error.status === 400) {
          this.error = 'This user is not a host. They may need to become a host first.';
        } else if (error.status === 404) {
          this.error = 'Host profile not found.';
        } else {
          this.error = 'Failed to load host profile. Please try again later.';
        }
        
        this.loading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 5000
        });
      }
    });
  }

  private loadReviews(): void {
    this.hostService.getHostReviews(this.hostId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews;
        this.calculateStats();
      },
      error: (error: Error) => {
        console.error('Error loading reviews:', error);
        this.snackBar.open('Failed to load reviews', 'Close', { duration: 3000 });
      }
    });
  }

  private loadUpcomingDinners(): void {
    this.dinnerService.getUpcomingDinners().subscribe({
      next: (dinners: Dinner[]) => {
        this.upcomingDinners = dinners.filter(dinner => 
          dinner.host && dinner.host._id === this.hostId
        );
      },
      error: (error: Error) => {
        console.error('Error loading upcoming dinners:', error);
        this.snackBar.open('Failed to load upcoming dinners', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private calculateStats(): void {
    if (this.reviews.length === 0) {
      return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    this.reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
    });

    const averageRating = totalRating / this.reviews.length;
    this.stats = {
      totalReviews: this.reviews.length,
      averageRating: averageRating,
      ratingDistribution: distribution
    };
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 4) return 'text-primary';
    if (rating >= 3) return 'text-warning';
    return 'text-danger';
  }

  getRatingPercentage(rating: number): number {
    if (!this.stats.totalReviews) return 0;
    return (this.stats.ratingDistribution[rating as keyof typeof this.stats.ratingDistribution] / this.stats.totalReviews) * 100;
  }

  getRatingCount(rating: number): number {
    return this.stats.ratingDistribution[rating as keyof typeof this.stats.ratingDistribution];
  }
} 