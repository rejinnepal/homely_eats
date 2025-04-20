import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-container">
      <h2>Terms of Service</h2>
      <p class="last-updated">Last updated: March 15, 2024</p>

      <section class="terms-section">
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using HomelyEats, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
      </section>

      <section class="terms-section">
        <h3>2. Platform Description</h3>
        <p>HomelyEats is a platform that connects food enthusiasts with home chefs. We facilitate the booking of home dining experiences and handle payments between hosts and guests.</p>
      </section>

      <section class="terms-section">
        <h3>3. User Accounts</h3>
        <p>To use certain features of the platform, you must register for an account. You agree to:</p>
        <ul>
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account</li>
          <li>Promptly update your account information</li>
          <li>Accept responsibility for all activities under your account</li>
        </ul>
      </section>

      <section class="terms-section">
        <h3>4. Host Responsibilities</h3>
        <p>As a host, you agree to:</p>
        <ul>
          <li>Provide accurate descriptions of your dining experiences</li>
          <li>Maintain food safety standards</li>
          <li>Honor confirmed bookings</li>
          <li>Comply with local food service regulations</li>
          <li>Maintain appropriate insurance coverage</li>
        </ul>
      </section>

      <section class="terms-section">
        <h3>5. Guest Responsibilities</h3>
        <p>As a guest, you agree to:</p>
        <ul>
          <li>Provide accurate booking information</li>
          <li>Arrive on time for your dining experience</li>
          <li>Respect the host's home and rules</li>
          <li>Communicate any dietary restrictions in advance</li>
        </ul>
      </section>

      <section class="terms-section">
        <h3>6. Payments and Refunds</h3>
        <p>All payments are processed through our secure platform. Refund policies are as follows:</p>
        <ul>
          <li>Cancellations made 24+ hours before the event: Full refund</li>
          <li>Cancellations made within 24 hours: No refund</li>
          <li>Host cancellations: Full refund plus compensation</li>
        </ul>
      </section>

      <section class="terms-section">
        <h3>7. Content Guidelines</h3>
        <p>Users are responsible for all content they post on the platform. Content must not:</p>
        <ul>
          <li>Violate any laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Contain false or misleading information</li>
          <li>Be harmful, threatening, or harassing</li>
        </ul>
      </section>

      <section class="terms-section">
        <h3>8. Termination</h3>
        <p>We reserve the right to terminate or suspend accounts that violate these terms or engage in fraudulent activity.</p>
      </section>

      <section class="terms-section">
        <h3>9. Limitation of Liability</h3>
        <p>HomelyEats is not liable for:</p>
        <ul>
          <li>Food safety issues</li>
          <li>Personal injuries</li>
          <li>Property damage</li>
          <li>Service interruptions</li>
        </ul>
      </section>

      <section class="terms-section">
        <h3>10. Changes to Terms</h3>
        <p>We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
      </section>

      <section class="terms-section">
        <h3>11. Contact Information</h3>
        <p>For questions about these terms, please contact us at:</p>
        <p>Email: legal&#64;homelyeats.com</p>
        <p>Address: 123 Legal Street, Suite 100, San Francisco, CA 94105</p>
      </section>
    </div>
  `,
  styles: [`
    .terms-container {
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

    .terms-section {
      margin-bottom: 2rem;
    }

    h3 {
      color: #444;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
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
      .terms-container {
        padding: 0 1rem;
      }
    }
  `]
})
export class TermsComponent {} 