import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DinnerService } from '../../services/dinner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dinner',
  templateUrl: './dinner.component.html',
  styleUrls: ['./dinner.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DinnerComponent implements OnInit {
  dinnerForm: FormGroup;
  selectedImages: File[] = [];
  previewUrls: string[] = [];
  isSubmitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private dinnerService: DinnerService,
    private router: Router
  ) {
    this.dinnerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      maxGuests: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      cuisine: ['', Validators.required],
      dietaryRestrictions: [''],
      specialRequirements: ['']
    });
  }

  ngOnInit(): void {}

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedImages = Array.from(input.files);
      this.previewUrls = [];
      
      this.selectedImages.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onSubmit(): void {
    if (this.dinnerForm.valid) {
      this.isSubmitting = true;
      this.error = '';

      const formData = new FormData();
      
      // Append form fields
      Object.keys(this.dinnerForm.value).forEach(key => {
        formData.append(key, this.dinnerForm.value[key]);
      });

      // Append images
      this.selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      this.dinnerService.createDinner(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.router.navigate(['/dinners', response._id]);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.error = error.error?.message || 'Failed to create dinner. Please try again.';
        }
      });
    }
  }

  getImageUrl(dinnerId: string, imageIndex: number): string {
    return this.dinnerService.getDinnerImage(dinnerId, imageIndex);
  }
} 