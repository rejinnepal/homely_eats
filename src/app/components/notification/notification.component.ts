import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container" *ngIf="currentNotification" [ngClass]="currentNotification.type">
      <div class="notification-content">
        <span class="notification-message">{{ currentNotification.message }}</span>
        <button class="notification-close" (click)="dismiss()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      min-width: 300px;
      max-width: 400px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }
    
    .notification-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
    }
    
    .notification-message {
      flex: 1;
      margin-right: 10px;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    
    .notification-close:hover {
      opacity: 1;
    }
    
    .success {
      background-color: #f0f9f0;
      color: #2e7d32;
      border-left: 4px solid #2e7d32;
    }
    
    .error {
      background-color: #fef2f2;
      color: #d32f2f;
      border-left: 4px solid #d32f2f;
    }
    
    .info {
      background-color: #f0f7ff;
      color: #1976d2;
      border-left: 4px solid #1976d2;
    }
    
    .warning {
      background-color: #fff8e1;
      color: #f57c00;
      border-left: 4px solid #f57c00;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  currentNotification: Notification | null = null;
  private subscription: Subscription;

  constructor(private notificationService: NotificationService) {
    this.subscription = this.notificationService.notifications$.subscribe(
      (notifications: Notification[]) => {
        // Show the most recent notification if available
        if (notifications && notifications.length > 0) {
          this.currentNotification = notifications[notifications.length - 1];
        } else {
          this.currentNotification = null;
        }
      }
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismiss(): void {
    this.currentNotification = null;
  }
} 