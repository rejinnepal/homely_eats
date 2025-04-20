import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="role-switcher" *ngIf="isAuthenticated && availableRoles.length > 1">
      <div class="role-label">View as:</div>
      <div class="role-options">
        <button 
          *ngFor="let role of availableRoles" 
          [class.active]="currentRole === role"
          (click)="switchRole(role)"
          class="role-button"
        >
          {{ role === 'host' ? 'Host' : 'User' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .role-switcher {
      display: flex;
      align-items: center;
      margin: 0 15px;
      padding: 5px 10px;
      background-color: #f5f5f5;
      border-radius: 20px;
      font-size: 14px;
    }
    
    .role-label {
      margin-right: 10px;
      color: #666;
    }
    
    .role-options {
      display: flex;
    }
    
    .role-button {
      padding: 5px 10px;
      margin: 0 5px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 15px;
      transition: all 0.2s;
    }
    
    .role-button.active {
      background-color: #4CAF50;
      color: white;
    }
    
    .role-button:hover:not(.active) {
      background-color: #e0e0e0;
    }
  `]
})
export class RoleSwitcherComponent implements OnInit {
  isAuthenticated = false;
  availableRoles: string[] = [];
  currentRole = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      const currentUser = this.authService.getCurrentUser();
      this.currentRole = currentUser?.activeRole || '';
      this.availableRoles = currentUser?.roles || [];
      
      this.logger.debug('Role switcher initialized', {
        isAuthenticated: this.isAuthenticated,
        currentRole: this.currentRole,
        availableRoles: this.availableRoles,
        user: currentUser
      });
    }
  }

  switchRole(role: string): void {
    if (role === this.currentRole) return;
    
    // Ensure role is in lowercase and trimmed
    const normalizedRole = role.toLowerCase().trim();
    
    this.logger.debug('Attempting to switch role', {
      currentRole: this.currentRole,
      newRole: normalizedRole,
      originalRole: role,
      availableRoles: this.availableRoles,
      hasRole: this.availableRoles.includes(normalizedRole),
      user: this.authService.getCurrentUser()
    });
    
    // Only proceed if the role is available
    if (!this.availableRoles.includes(normalizedRole)) {
      this.logger.error('Cannot switch to role - role not available', {
        role: normalizedRole,
        originalRole: role,
        availableRoles: this.availableRoles
      });
      return;
    }
    
    // Log the exact request payload
    this.logger.debug('Sending role switch request', {
      role: normalizedRole,
      originalRole: role,
      requestBody: { role: normalizedRole },
      token: this.authService.getToken() ? 'present' : 'missing'
    });
    
    this.authService.switchRole(normalizedRole).subscribe({
      next: (response) => {
        this.currentRole = normalizedRole;
        this.logger.debug('Role switched successfully', {
          newRole: normalizedRole,
          originalRole: role,
          user: response.user,
          token: response.token ? 'present' : 'missing'
        });
        
        // Redirect to home page after role switch
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.logger.error('Error switching role', { 
          error, 
          role: normalizedRole,
          originalRole: role,
          currentRole: this.currentRole,
          availableRoles: this.availableRoles,
          hasRole: this.availableRoles.includes(normalizedRole),
          user: this.authService.getCurrentUser(),
          errorDetails: error.error
        });
      }
    });
  }
} 