import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DinnerService, Dinner } from '../../services/dinner.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-edit-dinner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './edit-dinner.component.html',
  styleUrls: ['./edit-dinner.component.scss']
})
export class EditDinnerComponent implements OnInit {
  dinnerForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  dinnerId: string | null = null;
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
    private route: ActivatedRoute,
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
    this.dinnerId = this.route.snapshot.paramMap.get('id');
    if (this.dinnerId) {
      this.loadDinner(this.dinnerId);
    }
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

  loadDinner(id: string): void {
    this.dinnerService.getDinnerById(id).subscribe({
      next: (dinner) => {
        // Format the date and time for the form
        let date = '';
        let time = '';
        
        if (dinner.dateTime) {
          try {
            const dateTime = new Date(dinner.dateTime);
            if (!isNaN(dateTime.getTime())) {
              date = dateTime.toISOString().split('T')[0];
              time = dateTime.toTimeString().split(' ')[0].substring(0, 5);
            }
          } catch (error) {
            this.logger.error('Error parsing dateTime', { error, dateTime: dinner.dateTime });
          }
        }

        // If dateTime parsing failed, try using date and time separately
        if (!date && dinner.date) {
          try {
            const dateObj = new Date(dinner.date);
            if (!isNaN(dateObj.getTime())) {
              date = dateObj.toISOString().split('T')[0];
            }
          } catch (error) {
            this.logger.error('Error parsing date', { error, date: dinner.date });
          }
        }

        if (!time && dinner.time) {
          time = dinner.time;
        }

        // Format menu data properly
        let menuText = '';
        if (Array.isArray(dinner.menu)) {
          // If menu is an array of objects with name property
          if (dinner.menu.length > 0 && typeof dinner.menu[0] === 'object' && 'name' in dinner.menu[0]) {
            menuText = dinner.menu.map((item: any) => item.name).join('\n');
          } else {
            // If menu is an array of strings
            menuText = dinner.menu.join('\n');
          }
        } else if (typeof dinner.menu === 'string') {
          menuText = dinner.menu;
        } else if (dinner.menu) {
          // If menu is an object but not an array
          menuText = JSON.stringify(dinner.menu);
        }

        this.dinnerForm.patchValue({
          title: dinner.title,
          description: dinner.description,
          cuisine: dinner.cuisine,
          date: date,
          time: time,
          price: dinner.price,
          maxGuests: dinner.maxGuests,
          location: typeof dinner.location === 'object' ? dinner.location.address : dinner.location,
          menu: menuText,
          dietaryRestrictions: dinner.dietaryRestrictions || []
        });

        this.logger.debug('Dinner loaded successfully', { 
          dinnerId: id,
          title: dinner.title,
          date,
          time,
          menu: menuText
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load dinner details';
        this.logger.error('Error loading dinner', { error, dinnerId: id });
      }
    });
  }

  onSubmit(): void {
    if (this.dinnerForm.invalid || !this.dinnerId) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.updateFormDisabledState(true);

    const formData = this.dinnerForm.value;
    const currentUser = this.authService.getCurrentUser();
    
    // Format the menu data
    const menuItems = formData.menu.split('\n').filter((item: string) => item.trim());
    const menu = menuItems.map((item: string) => ({
      name: item.trim(),
      description: ''
    }));

    // Format the location data
    const location = {
      address: formData.location,
      city: '',
      state: '',
      zipCode: ''
    };

    // Create a FormData object instead of a Dinner object
    const dinnerFormData = new FormData();
    
    // Append all form fields to FormData
    dinnerFormData.append('title', formData.title);
    dinnerFormData.append('description', formData.description);
    dinnerFormData.append('date', formData.date);
    dinnerFormData.append('time', formData.time);
    dinnerFormData.append('price', formData.price.toString());
    dinnerFormData.append('maxGuests', formData.maxGuests.toString());
    dinnerFormData.append('location', JSON.stringify(location));
    dinnerFormData.append('hostId', currentUser?.id || '');
    dinnerFormData.append('menu', JSON.stringify(menu));
    dinnerFormData.append('dietaryRestrictions', JSON.stringify(formData.dietaryRestrictions || []));
    dinnerFormData.append('cuisine', formData.cuisine);
    dinnerFormData.append('dateTime', new Date(`${formData.date}T${formData.time}`).toISOString());

    this.logger.debug('Submitting dinner update', {
      dinnerId: this.dinnerId,
      title: formData.title,
      menu: menu
    });

    this.dinnerService.updateDinner(this.dinnerId, dinnerFormData).subscribe({
      next: () => {
        this.logger.info('Dinner updated successfully', { dinnerId: this.dinnerId });
        this.router.navigate(['/my-listings']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.updateFormDisabledState(false);
        this.errorMessage = error.error?.message || 'Failed to update dinner. Please try again.';
        this.logger.error('Error updating dinner', { 
          error,
          dinnerId: this.dinnerId,
          message: error.message
        });
      }
    });
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
} 