import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCardModule
  ]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;
  error: string | null = null;
  user: User | null = null;
  profileImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;

    console.log('Loading user profile...');
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        console.log('Profile loaded:', profile);
        this.user = profile;
        if (profile.profileImage) {
          const imagePath = profile.profileImage.startsWith('/') ? profile.profileImage : `/${profile.profileImage}`;
          const fullImageUrl = `${environment.apiUrl}${imagePath}`;
          console.log('Setting profile image URL:', fullImageUrl);
          this.profileImage = fullImageUrl;
        } else {
          console.log('No profile image found in response');
          this.profileImage = null;
        }
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          location: profile.location || '',
          bio: profile.bio || ''
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Error loading profile';
        this.isLoading = false;
      }
    });
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const profileData = this.profileForm.value;
    this.userService.updateUserProfile(profileData).subscribe({
      next: (updatedProfile) => {
        this.user = updatedProfile;
        this.isEditing = false;
        this.isLoading = false;
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.error = 'Error updating profile';
        this.isLoading = false;
        console.error('Error updating profile:', err);
      }
    });
  }

  onImageUpload(event: any): void {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    if (file) {
      console.log('Starting image upload...');
      this.userService.uploadProfileImage(file).subscribe({
        next: (response) => {
          console.log('Image upload successful:', response);
          console.log('Image URL from response:', response.imageUrl);
          // The imageUrl is now a base64 data URL
          this.profileImage = response.imageUrl;
          this.snackBar.open('Profile image updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error uploading profile image:', error);
          this.snackBar.open('Failed to update profile image', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  uploadImage(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => this.onImageUpload(event);
    fileInput.click();
  }
  
  startEdit(): void {
    this.isEditing = true;
  }
  
  cancelEdit(): void {
    this.isEditing = false;
    this.loadUserProfile();
  }
  
  saveProfile(): void {
    this.onSave();
  }
} 