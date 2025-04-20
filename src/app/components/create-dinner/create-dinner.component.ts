import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DinnerService, Dinner } from '../../services/dinner.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { DinnerListing } from '../../models/dinner.model';

@Component({
  selector: 'app-create-dinner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-dinner.component.html',
  styleUrls: ['./create-dinner.component.css']
})
export class CreateDinnerComponent implements OnInit {
  dinnerForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  selectedImages: File[] = [];
  previewUrls: string[] = [];
  cuisines = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai',
    'Mediterranean', 'American', 'French', 'Spanish', 'Greek', 'Vietnamese'
  ];
  dietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
    'Halal', 'Kosher', 'None'
  ];

  constructor(
    private fb: FormBuilder,
    private dinnerService: DinnerService,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {
    this.dinnerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      cuisine: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      maxGuests: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      menu: ['', Validators.required],
      dietaryRestrictions: [[]]
    });
  }

  ngOnInit(): void {
    this.verifyAuthentication();
  }

  // Method to update form control disabled state
  updateFormDisabledState(disabled: boolean): void {
    if (disabled) {
      this.dinnerForm.get('title')?.disable();
      this.dinnerForm.get('description')?.disable();
      this.dinnerForm.get('cuisine')?.disable();
      this.dinnerForm.get('date')?.disable();
      this.dinnerForm.get('time')?.disable();
      this.dinnerForm.get('price')?.disable();
      this.dinnerForm.get('maxGuests')?.disable();
      this.dinnerForm.get('location')?.disable();
      this.dinnerForm.get('menu')?.disable();
      this.dinnerForm.get('dietaryRestrictions')?.disable();
    } else {
      this.dinnerForm.get('title')?.enable();
      this.dinnerForm.get('description')?.enable();
      this.dinnerForm.get('cuisine')?.enable();
      this.dinnerForm.get('date')?.enable();
      this.dinnerForm.get('time')?.enable();
      this.dinnerForm.get('price')?.enable();
      this.dinnerForm.get('maxGuests')?.enable();
      this.dinnerForm.get('location')?.enable();
      this.dinnerForm.get('menu')?.enable();
      this.dinnerForm.get('dietaryRestrictions')?.enable();
    }
  }

  verifyAuthentication(): void {
    const token = localStorage.getItem('token');
    const currentUser = this.authService.getCurrentUser();
    
    this.logger.debug('Verifying authentication for create dinner', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      isAuthenticated: this.authService.isAuthenticated(),
      isHost: this.authService.isHost(),
      currentUser: currentUser ? {
        id: currentUser.id,
        activeRole: currentUser.activeRole,
        name: currentUser.name
      } : null
    });
    
    if (!this.authService.isAuthenticated()) {
      this.logger.warn('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isHost()) {
      this.logger.warn('User is not a host, redirecting to home');
      this.router.navigate(['/']);
      return;
    }

    this.logger.debug('Create dinner component initialized', {
      isAuthenticated: this.authService.isAuthenticated(),
      isHost: this.authService.isHost(),
      currentUser: this.authService.getCurrentUser()
    });
  }

  onSubmit(): void {
    if (this.dinnerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    // Check authentication before submitting
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'You must be logged in to create a dinner.';
      this.router.navigate(['/login']);
      return;
    }

    // Check host role
    if (!this.authService.isHost()) {
      this.errorMessage = 'You must be logged in as a host to create a dinner.';
      this.router.navigate(['/']);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.updateFormDisabledState(true);

    // Create a FormData object
    const formData = new FormData();
    
    // Get the form values
    const formValues = this.dinnerForm.value;

    // Format the menu data - split by newlines and create objects
    const menuItems = formValues.menu.split('\n')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .map((item: string) => ({
        name: item,
        description: '' // Empty description as it's not part of the form
      }));

    // Create a copy of form values without the menu
    const { menu, ...otherFormValues } = formValues;
    
    // Append all other form fields to FormData
    Object.keys(otherFormValues).forEach(key => {
      formData.append(key, otherFormValues[key]);
    });

    // Append the formatted menu as a JSON string
    formData.append('menu', JSON.stringify(menuItems));

    // Append images if any
    if (this.selectedImages.length > 0) {
      this.selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    this.logger.debug('Submitting dinner creation', { 
      formData,
      isAuthenticated: this.authService.isAuthenticated(),
      currentUser: this.authService.getCurrentUser(),
      hasToken: !!this.authService.getToken()
    });

    this.dinnerService.createDinner(formData).subscribe({
      next: (response) => {
        this.logger.debug('Dinner created successfully', { 
          dinnerId: response._id,
          hostId: response.hostId
        });
        this.router.navigate(['/my-listings']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.updateFormDisabledState(false);
        
        // Handle specific error cases
        if (error.status === 401) {
          this.errorMessage = 'Your authentication has expired. Please log in again.';
          this.logger.warn('Authentication error during dinner creation', {
            error,
            status: error.status,
            message: error.message
          });
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = error.error?.message || 'Failed to create dinner. Please try again.';
          this.logger.error('Error creating dinner', { 
            error,
            status: error.status,
            message: error.message,
            errorDetails: error.error
          });
        }
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      // Handle file upload logic here
      this.logger.info('Files selected', { count: files.length });
    }
  }

  toggleDietaryRestriction(event: any, restriction: string): void {
    const currentRestrictions = this.dinnerForm.get('dietaryRestrictions')?.value || [];
    if (event.target.checked) {
      this.dinnerForm.patchValue({
        dietaryRestrictions: [...currentRestrictions, restriction]
      });
    } else {
      this.dinnerForm.patchValue({
        dietaryRestrictions: currentRestrictions.filter((r: string) => r !== restriction)
      });
    }
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedImages = Array.from(input.files);
      this.previewUrls = [];
      
      this.selectedImages.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }
}
