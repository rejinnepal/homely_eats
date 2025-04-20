import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoggerService } from '../../../services/logger.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  error: string | null = null;
  isLoading = false;
  roles = [
    { value: 'user', label: 'Guest' },
    { value: 'host', label: 'Host' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService,
    private notificationService: NotificationService
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', [Validators.required]]
    });
  }

  // Method to update form control disabled state
  updateFormDisabledState(disabled: boolean): void {
    if (disabled) {
      this.signupForm.get('name')?.disable();
      this.signupForm.get('email')?.disable();
      this.signupForm.get('password')?.disable();
      this.signupForm.get('role')?.disable();
    } else {
      this.signupForm.get('name')?.enable();
      this.signupForm.get('email')?.enable();
      this.signupForm.get('password')?.enable();
      this.signupForm.get('role')?.enable();
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.error = null;
      
      const { name, email, password, role } = this.signupForm.value;
      
      this.authService.register({ name, email, password, role }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.logger.info('Signup successful', { email, role });
          this.notificationService.showSuccess('Account Created', 'Welcome to HomelyEats! Your account has been created successfully');
          this.router.navigate(['/']);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.error = error.error?.message || 'An error occurred during signup';
          this.logger.error('Signup failed', { error, email });
        }
      });
    }
  }
} 