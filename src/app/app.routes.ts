import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { EditDinnerComponent } from './components/edit-dinner/edit-dinner.component';
import { DinnerListingsComponent } from './components/dinner-listings/dinner-listings.component';
import { MyListingsComponent } from './components/my-listings/my-listings.component';
import { AboutComponent } from './components/about/about.component';
import { DinnerDetailsComponent } from './components/dinner-details/dinner-details.component';
import { HelpCenterComponent } from './pages/support/help-center/help-center.component';
import { SafetyComponent } from './pages/support/safety/safety.component';
import { ContactComponent } from './pages/support/contact/contact.component';
import { FAQComponent } from './pages/support/faq/faq.component';
import { LegalComponent } from './pages/legal/legal.component';
import { TermsComponent } from './pages/legal/terms/terms.component';
import { PrivacyComponent } from './pages/legal/privacy/privacy.component';
import { CookiesComponent } from './pages/legal/cookies/cookies.component';
import { AuthGuard } from './guards/auth.guard';
import { BecomeHostComponent } from './components/become-host/become-host.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { CreateDinnerComponent } from './components/create-dinner/create-dinner.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BookingNotificationsComponent } from './components/booking-notifications/booking-notifications.component';
import { HostGuard } from './guards/host.guard';
import { HostProfileComponent } from './components/host-profile/host-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dinners', component: DinnerListingsComponent },
  { path: 'dinners/:id', component: DinnerDetailsComponent },
  { path: 'my-listings', component: MyListingsComponent, canActivate: [AuthGuard, HostGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'edit-dinner/:id', component: EditDinnerComponent, canActivate: [AuthGuard, HostGuard] },
  { path: 'host', component: BecomeHostComponent, canActivate: [AuthGuard] },
  { path: 'my-bookings', component: MyBookingsComponent, canActivate: [AuthGuard] },
  { path: 'create-dinner', component: CreateDinnerComponent, canActivate: [AuthGuard, HostGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'booking-notifications', component: BookingNotificationsComponent, canActivate: [AuthGuard, HostGuard] },
  { path: 'hosts/:id', component: HostProfileComponent },
  
  // Support routes
  { path: 'support/help-center', component: HelpCenterComponent },
  { path: 'support/safety', component: SafetyComponent },
  { path: 'support/contact', component: ContactComponent },
  { path: 'support/faq', component: FAQComponent },
  
  // Legal routes
  { 
    path: 'legal',
    component: LegalComponent,
    children: [
      { path: 'terms', component: TermsComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'cookies', component: CookiesComponent },
      { path: '', redirectTo: 'terms', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
