import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cookies-container">
      <h2>Cookie Policy</h2>
      <p class="last-updated">Last updated: March 15, 2024</p>

      <section class="cookies-section">
        <h3>1. What Are Cookies</h3>
        <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience and enable certain features to work properly.</p>
      </section>

      <section class="cookies-section">
        <h3>2. Types of Cookies We Use</h3>
        
        <h4>2.1 Essential Cookies</h4>
        <p>These cookies are necessary for the website to function properly. They enable core functionality such as:</p>
        <ul>
          <li>User authentication</li>
          <li>Session management</li>
          <li>Security features</li>
          <li>Basic site functionality</li>
        </ul>

        <h4>2.2 Performance Cookies</h4>
        <p>These cookies help us understand how visitors interact with our website by:</p>
        <ul>
          <li>Collecting anonymous usage statistics</li>
          <li>Measuring page load times</li>
          <li>Identifying error pages</li>
          <li>Tracking user navigation patterns</li>
        </ul>

        <h4>2.3 Functionality Cookies</h4>
        <p>These cookies remember your preferences and settings:</p>
        <ul>
          <li>Language preferences</li>
          <li>Location settings</li>
          <li>Customized search results</li>
          <li>User interface preferences</li>
        </ul>

        <h4>2.4 Marketing Cookies</h4>
        <p>These cookies are used to deliver relevant advertisements:</p>
        <ul>
          <li>Personalized ads</li>
          <li>Social media integration</li>
          <li>Campaign tracking</li>
          <li>Conversion measurement</li>
        </ul>
      </section>

      <section class="cookies-section">
        <h3>3. How to Control Cookies</h3>
        <p>You can control and/or delete cookies as you wish. You can:</p>
        <ul>
          <li>Delete all cookies from your browser</li>
          <li>Set your browser to block cookies</li>
          <li>Use private/incognito browsing</li>
          <li>Use browser extensions to manage cookies</li>
        </ul>
      </section>

      <section class="cookies-section">
        <h3>4. Third-Party Cookies</h3>
        <p>We use services from third parties that may set cookies on your device:</p>
        <ul>
          <li>Analytics providers (e.g., Google Analytics)</li>
          <li>Payment processors</li>
          <li>Social media platforms</li>
          <li>Advertising networks</li>
        </ul>
      </section>

      <section class="cookies-section">
        <h3>5. Cookie Duration</h3>
        <p>Cookies on our site may be:</p>
        <ul>
          <li>Session cookies (temporary, deleted when you close your browser)</li>
          <li>Persistent cookies (remain until they expire or are deleted)</li>
        </ul>
      </section>

      <section class="cookies-section">
        <h3>6. Updates to This Policy</h3>
        <p>We may update this Cookie Policy periodically. Any changes will be posted on this page with an updated revision date.</p>
      </section>

      <section class="cookies-section">
        <h3>7. Contact Us</h3>
        <p>If you have questions about our use of cookies, please contact us at:</p>
        <p>Email: privacy&#64;homelyeats.com</p>
        <p>Address: 123 Privacy Street, Suite 200, San Francisco, CA 94105</p>
      </section>
    </div>
  `,
  styles: [`
    .cookies-container {
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

    .cookies-section {
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
      .cookies-container {
        padding: 0 1rem;
      }
    }
  `]
})
export class CookiesComponent {} 