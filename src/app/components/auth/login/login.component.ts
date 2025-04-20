import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../../services/logger.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  isLoading = false;
  showRoleSelection = false;
  selectedRole: string = 'user';
  authenticatedUser: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // Method to update form control disabled state
  updateFormDisabledState(disabled: boolean): void {
    if (disabled) {
      this.loginForm.get('email')?.disable();
      this.loginForm.get('password')?.disable();
    } else {
      this.loginForm.get('email')?.enable();
      this.loginForm.get('password')?.enable();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.updateFormDisabledState(true);
      
      const { email, password } = this.loginForm.value;
      this.logger.debug('Attempting login', { email });
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.updateFormDisabledState(false);
          this.logger.info('Login successful', { 
            email,
            userId: response.user.id,
            roles: response.user.roles,
            activeRole: response.user.activeRole
          });
          
          // Store the authenticated user
          this.authenticatedUser = response.user;
          
          // Check if user has multiple roles
          if (this.authService.hasMultipleRoles()) {
            this.showRoleSelection = true;
            // Set the selected role to the user's preferred role if available
            // Otherwise default to 'user' role
            this.selectedRole = response.user.roles.includes('user') ? 'user' : response.user.roles[0];
            this.logger.debug('User has multiple roles, showing role selection', {
              selectedRole: this.selectedRole,
              availableRoles: response.user.roles
            });
          } else {
            // If user only has one role, navigate based on that role
            this.logger.debug('User has single role, navigating to appropriate page', {
              role: response.user.activeRole
            });
            this.navigateBasedOnRole(response.user.activeRole);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.updateFormDisabledState(false);
          this.error = error.error?.message || 'An error occurred during login';
          this.logger.error('Login failed', { error, email });
        }
      });
    }
  }
  
  setRole(role: string): void {
    this.selectedRole = role;
    this.logger.debug('Role selected for login', { role });
  }
  
  confirmRoleSelection(): void {
    this.isLoading = true;
    this.authService.switchRole(this.selectedRole).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.logger.info('Role switched successfully', {
          userId: response.user.id,
          newRole: response.user.activeRole
        });
        
        this.notificationService.showSuccess('Role Switched', `Welcome as a ${response.user.activeRole}!`);
        this.navigateBasedOnRole(response.user.activeRole);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Failed to switch role';
        this.logger.error('Role switch failed', { error });
      }
    });
  }

  private navigateBasedOnRole(role: string): void {
    if (role === 'host') {
      this.router.navigate(['/my-listings']);
    } else {
      this.router.navigate(['/']);
    }
  }
} 