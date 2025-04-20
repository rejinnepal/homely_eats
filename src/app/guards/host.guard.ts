import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class HostGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(): boolean {
    if (this.authService.isHost()) {
      return true;
    }

    this.notificationService.showError('Access Denied', 'This feature is only available for hosts');
    this.router.navigate(['/']);
    return false;
  }
} 