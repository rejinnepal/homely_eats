import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-container">
      <h2>Privacy Policy</h2>
      <p class="last-updated">Last updated: March 15, 2024</p>

      <section class="privacy-section">
        <h3>1. Introduction</h3>
        <p>At HomelyEats, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>
      </section>

      <section class="privacy-section">
        <h3>2. Information We Collect</h3>
        <h4>2.1 Personal Information</h4>
        <ul>
          <li>Name and contact details</li>
          <li>Profile information</li>
          <li>Payment information</li>
          <li>Communication preferences</li>
        </ul>

        <h4>2.2 Usage Information</h4>
        <ul>
          <li>Booking history</li>
          <li>Search preferences</li>
          <li>Device information</li>
          <li>Location data</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h3>3. How We Use Your Information</h3>
        <p>We use your information to:</p>
        <ul>
          <li>Process bookings and payments</li>
          <li>Communicate with you about your bookings</li>
          <li>Improve our services</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Ensure platform safety</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h3>4. Information Sharing</h3>
        <p>We share your information with:</p>
        <ul>
          <li>Hosts (for bookings)</li>
          <li>Payment processors</li>
          <li>Service providers</li>
          <li>Legal authorities when required</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h3>5. Data Security</h3>
        <p>We implement security measures to protect your information:</p>
        <ul>
          <li>Encryption of sensitive data</li>
          <li>Regular security audits</li>
          <li>Access controls</li>
          <li>Secure data storage</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h3>6. Your Rights</h3>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request data deletion</li>
          <li>Opt-out of marketing communications</li>
          <li>Export your data</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h3>7. Cookies and Tracking</h3>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Remember your preferences</li>
          <li>Analyze site usage</li>
          <li>Improve user experience</li>
          <li>Provide personalized content</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h3>8. Children's Privacy</h3>
        <p>Our services are not intended for children under 13. We do not knowingly collect information from children.</p>
      </section>

      <section class="privacy-section">
        <h3>9. International Data Transfers</h3>
        <p>Your information may be transferred and processed in countries other than your own. We ensure appropriate safeguards are in place.</p>
      </section>

      <section class="privacy-section">
        <h3>10. Changes to Privacy Policy</h3>
        <p>We may update this policy periodically. We will notify you of significant changes via email or platform notification.</p>
      </section>

      <section class="privacy-section">
        <h3>11. Contact Us</h3>
        <p>For privacy-related questions or concerns, please contact us at:</p>
        <p>Email: privacy&#64;homelyeats.com</p>
        <p>Address: 123 Privacy Street, Suite 200, San Francisco, CA 94105</p>
      </section>
    </div>
  `,
  styles: [`
    .privacy-container {
      max-width: 800px;
      margin: 0 auto;
    }

    h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .last-updated {
      color: #666;
      font-style: italic;
      margin-bottom: 2rem;
    }

    .privacy-section {
      margin-bottom: 2rem;
    }

    h3 {
      color: #444;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    h4 {
      color: #555;
      margin: 1rem 0 0.5rem;
    }

    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    ul {
      list-style-type: disc;
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }

    li {
      color: #666;
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .privacy-container {
        padding: 0 1rem;
      }
    }
  `]
})
export class PrivacyComponent {} 