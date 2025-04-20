import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-become-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './become-host.component.html',
  styleUrls: ['./become-host.component.css']
})
export class BecomeHostComponent implements OnInit {
  isSubmitting = false;
  error: string | null = null;
  success = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    // Check if user is already a host
    if (this.authService.isHost()) {
      this.router.navigate(['/my-listings']);
    }
  }

  becomeHost(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.authService.becomeHost().subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.success = true;
        this.logger.info('User successfully became a host', { 
          userId: response.user.id,
          newRole: response.user.activeRole
        });
        
        // Redirect to my-listings after a short delay
        setTimeout(() => {
          this.router.navigate(['/my-listings']);
        }, 2000);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.error = error.error?.message || 'Failed to become a host. Please try again.';
        this.logger.error('Error becoming a host', { error });
      }
    });
  }
} 