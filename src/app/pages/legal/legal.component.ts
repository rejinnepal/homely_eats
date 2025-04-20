import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <h1>Legal Information</h1>
      
      <div class="legal-nav">
        <a routerLink="/legal/terms" routerLinkActive="active">Terms of Service</a>
        <a routerLink="/legal/privacy" routerLinkActive="active">Privacy Policy</a>
        <a routerLink="/legal/cookies" routerLinkActive="active">Cookie Policy</a>
      </div>

      <div class="legal-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .legal-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
      text-align: center;
    }

    .legal-nav {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 3rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
    }

    .legal-nav a {
      color: #666;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .legal-nav a:hover {
      color: #4CAF50;
      background: #f8f9fa;
    }

    .legal-nav a.active {
      color: #4CAF50;
      font-weight: 500;
      background: #f8f9fa;
    }

    .legal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
      .legal-nav {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
    }
  `]
})
export class LegalComponent {} 