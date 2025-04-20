import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatBadgeModule, MatMenuModule, MatButtonModule],
  template: `
    <div class="notification-bell-container">
      <button mat-icon-button [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" 
              (click)="toggleNotifications()" class="notification-bell">
        <mat-icon>notifications</mat-icon>
      </button>
      
      <div class="notifications-dropdown" *ngIf="isOpen">
        <div class="notifications-header">
          <h3>Notifications</h3>
          <button mat-button color="primary" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
            Mark all as read
          </button>
        </div>
        
        <div class="notifications-list">
          <div *ngIf="notifications.length === 0" class="no-notifications">
            No notifications
          </div>
          
          <div *ngFor="let notification of notifications" 
               class="notification-item" 
               [class.unread]="!notification.read">
            <div class="notification-content">
              <mat-icon [ngClass]="notification.type">{{ getIconForType(notification.type) }}</mat-icon>
              <div class="notification-text">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ notification.createdAt | date:'short' }}</div>
              </div>
            </div>
            <button mat-icon-button (click)="deleteNotification(notification._id)" class="delete-btn">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-bell-container {
      position: relative;
      display: inline-block;
    }
    
    .notifications-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 350px;
      max-height: 400px;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      overflow: hidden;
    }
    
    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }
    
    .notifications-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .notifications-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }
    
    .notification-item:hover {
      background-color: #f5f5f5;
    }
    
    .notification-item.unread {
      background-color: #f0f7ff;
    }
    
    .notification-content {
      display: flex;
      align-items: flex-start;
      flex: 1;
    }
    
    .notification-content mat-icon {
      margin-right: 12px;
      margin-top: 4px;
    }
    
    .notification-text {
      flex: 1;
    }
    
    .notification-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .notification-message {
      color: #666;
      font-size: 14px;
    }
    
    .notification-time {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    
    .no-notifications {
      padding: 20px;
      text-align: center;
      color: #999;
    }
    
    .success {
      color: #4caf50;
    }
    
    .error {
      color: #f44336;
    }
    
    .info {
      color: #2196f3;
    }
    
    .warning {
      color: #ff9800;
    }
    
    .delete-btn {
      opacity: 0.5;
      transition: opacity 0.2s;
    }
    
    .delete-btn:hover {
      opacity: 1;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  @ViewChild('notificationDropdown') dropdown!: ElementRef;
  
  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  private subscription: Subscription = new Subscription();
  
  constructor(private notificationService: NotificationService) {}
  
  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.unreadCount = notifications.filter(n => !n.read).length;
    });
    
    this.loadNotifications();
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.isOpen && !this.isClickInside(event)) {
      this.isOpen = false;
    }
  }
  
  private isClickInside(event: Event): boolean {
    const target = event.target as HTMLElement;
    return target.closest('.notification-bell-container') !== null;
  }
  
  toggleNotifications(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }
  
  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(
      notifications => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.read).length;
      },
      error => {
        console.error('Error loading notifications:', error);
        this.notifications = [];
        this.unreadCount = 0;
      }
    );
  }
  
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(
      () => {
        this.loadNotifications();
      },
      error => {
        console.error('Error marking all notifications as read:', error);
      }
    );
  }
  
  deleteNotification(id: string): void {
    this.notificationService.deleteNotification(id).subscribe(
      () => {
        this.loadNotifications();
      },
      error => {
        console.error('Error deleting notification:', error);
      }
    );
  }
  
  getIconForType(type: string): string {
    switch (type) {
      case 'booking_request':
        return 'event_available';
      case 'booking_confirmed':
        return 'check_circle';
      case 'booking_cancelled':
      case 'booking_rejected':
        return 'cancel';
      case 'review':
        return 'star';
      case 'system':
      default:
        return 'info';
    }
  }
} 