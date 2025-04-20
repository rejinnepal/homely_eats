import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { CommonModule } from '@angular/common';
import { FileLoggerService } from './services/file-logger.service';

// Import components from their correct locations
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    HeaderComponent, 
    FooterComponent,
    NotificationComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'HomelyEats';
  isProduction = environment.production;

  constructor(private logger: FileLoggerService) {}

  ngOnInit(): void {
    // Disable debug logs to reduce console spam
    this.logger.setDebugEnabled(false);
  }
}
