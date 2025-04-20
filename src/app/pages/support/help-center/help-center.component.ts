import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="help-center-container">
      <h1>Help Center</h1>
      
      <section class="help-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-item">
          <h3>How do I book a dinner?</h3>
          <p>To book a dinner, simply browse through available dinners, select one you like, and click the "Book Now" button. Follow the prompts to complete your booking.</p>
        </div>
        <div class="faq-item">
          <h3>How do I become a host?</h3>
          <p>To become a host, sign up for an account and select the "Host" role during registration. Complete your profile and submit your first dinner listing.</p>
        </div>
        <div class="faq-item">
          <h3>What happens if I need to cancel?</h3>
          <p>Cancellation policies vary by host. Check the specific dinner listing for cancellation details. Generally, cancellations made 24 hours before the dinner are fully refundable.</p>
        </div>
      </section>

      <section class="help-section">
        <h2>Contact Support</h2>
        <p>Need more help? Our support team is here for you:</p>
        <ul>
          <li>Email: support&#64;homelyeats.com</li>
          <li>Phone: (555) 123-4567</li>
          <li>Hours: Monday-Friday, 9am-5pm EST</li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .help-center-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
      text-align: center;
    }

    .help-section {
      margin-bottom: 3rem;
    }

    h2 {
      color: #444;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #eee;
    }

    .faq-item {
      margin-bottom: 1.5rem;
    }

    h3 {
      color: #555;
      margin-bottom: 0.5rem;
    }

    p {
      color: #666;
      line-height: 1.6;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      color: #666;
      margin-bottom: 0.5rem;
    }
  `]
})
export class HelpCenterComponent {} 