import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EditDinnerComponent } from './components/edit-dinner/edit-dinner.component';
import { CreateDinnerComponent } from './components/create-dinner/create-dinner.component';
import { AppRoutingModule } from './app-routing.module';
import { DinnerService } from './services/dinner.service';
import { AuthService } from './services/auth.service';
import { LoggerService } from './services/logger.service';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { DinnerListingsComponent } from './components/dinner-listings/dinner-listings.component';
import { DinnerDetailsComponent } from './components/dinner-details/dinner-details.component';
import { MyListingsComponent } from './components/my-listings/my-listings.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { NotificationComponent } from './components/notification/notification.component';
import { BookingNotificationsComponent } from './components/booking-notifications/booking-notifications.component';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    // Import standalone components
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    DinnerListingsComponent,
    DinnerDetailsComponent,
    CreateDinnerComponent,
    EditDinnerComponent,
    MyListingsComponent,
    MyBookingsComponent,
    NotificationComponent,
    BookingNotificationsComponent
  ],
  providers: [
    DinnerService,
    AuthService,
    LoggerService
  ]
})
export class AppModule { } 