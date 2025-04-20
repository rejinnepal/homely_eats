import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  error: string | null = null;
  isEditing = false;
  editedUser: Partial<User> = {};

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user profile. Please try again later.';
        this.isLoading = false;
        console.error('Error loading user profile:', err);
      }
    });
  }

  startEditing(): void {
    if (this.user) {
      this.editedUser = { ...this.user };
      this.isEditing = true;
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editedUser = {};
  }

  saveProfile(): void {
    if (!this.user?._id) return;

    this.isLoading = true;
    this.userService.updateUserProfile(this.editedUser).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;
        this.isLoading = false;
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.error = 'Failed to update profile. Please try again later.';
        this.isLoading = false;
        console.error('Error updating profile:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isLoading = true;
    this.userService.uploadProfileImage(file).subscribe({
      next: (response) => {
        if (this.user) {
          this.user.profileImage = response.imageUrl;
          this.isLoading = false;
          this.snackBar.open('Profile image updated successfully', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.error = 'Failed to upload profile image. Please try again later.';
        this.isLoading = false;
        console.error('Error uploading profile image:', err);
      }
    });
  }
} 