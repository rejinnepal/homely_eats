import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-safety',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="safety-container">
      <h1>Safety & Trust</h1>
      
      <section class="safety-section">
        <h2>Our Commitment to Safety</h2>
        <p>At Homely Eats, your safety is our top priority. We've implemented various measures to ensure a secure and enjoyable experience for all our users.</p>
      </section>

      <section class="safety-section">
        <h2>For Guests</h2>
        <div class="safety-item">
          <h3>Verified Hosts</h3>
          <p>All our hosts undergo a thorough verification process, including identity verification and background checks.</p>
        </div>
        <div class="safety-item">
          <h3>Secure Payments</h3>
          <p>All payments are processed through our secure platform. Your payment information is never shared with hosts.</p>
        </div>
        <div class="safety-item">
          <h3>24/7 Support</h3>
          <p>Our support team is available around the clock to assist you with any safety concerns.</p>
        </div>
      </section>

      <section class="safety-section">
        <h2>For Hosts</h2>
        <div class="safety-item">
          <h3>Guest Verification</h3>
          <p>All guests must verify their identity before booking a dinner.</p>
        </div>
        <div class="safety-item">
          <h3>Property Protection</h3>
          <p>Our platform includes property protection coverage for eligible incidents.</p>
        </div>
        <div class="safety-item">
          <h3>Community Guidelines</h3>
          <p>Clear guidelines ensure respectful behavior from all community members.</p>
        </div>
      </section>

      <section class="safety-section">
        <h2>Safety Tips</h2>
        <ul>
          <li>Always communicate through our platform</li>
          <li>Read reviews and ratings before booking</li>
          <li>Report any suspicious activity immediately</li>
          <li>Follow food safety guidelines</li>
          <li>Keep emergency contacts handy</li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .safety-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
      text-align: center;
    }

    .safety-section {
      margin-bottom: 3rem;
    }

    h2 {
      color: #444;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #eee;
    }

    .safety-item {
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
      padding-left: 1.5rem;
      position: relative;
    }

    li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #4CAF50;
    }
  `]
})
export class SafetyComponent {} 