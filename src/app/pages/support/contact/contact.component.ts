import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="contact-container">
      <h1>Contact Us</h1>
      
      <div class="contact-info">
        <div class="info-section">
          <h2>Get in Touch</h2>
          <p>Have questions or need assistance? We're here to help!</p>
          <ul>
            <li>
              <strong>Email:</strong>
              <a href="mailto:support&#64;homelyeats.com">support&#64;homelyeats.com</a>
            </li>
            <li>
              <strong>Phone:</strong>
              <span>(555) 123-4567</span>
            </li>
            <li>
              <strong>Hours:</strong>
              <span>Monday-Friday, 9am-5pm EST</span>
            </li>
          </ul>
        </div>

        <div class="contact-form">
          <h2>Send us a Message</h2>
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name">Name</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="form-control"
                placeholder="Your name"
              >
              <div class="error" *ngIf="contactForm.get('name')?.invalid && contactForm.get('name')?.touched">
                Name is required
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="form-control"
                placeholder="Your email"
              >
              <div class="error" *ngIf="contactForm.get('email')?.invalid && contactForm.get('email')?.touched">
                Please enter a valid email
              </div>
            </div>

            <div class="form-group">
              <label for="subject">Subject</label>
              <input
                type="text"
                id="subject"
                formControlName="subject"
                class="form-control"
                placeholder="Subject"
              >
              <div class="error" *ngIf="contactForm.get('subject')?.invalid && contactForm.get('subject')?.touched">
                Subject is required
              </div>
            </div>

            <div class="form-group">
              <label for="message">Message</label>
              <textarea
                id="message"
                formControlName="message"
                class="form-control"
                rows="5"
                placeholder="Your message"
              ></textarea>
              <div class="error" *ngIf="contactForm.get('message')?.invalid && contactForm.get('message')?.touched">
                Message is required
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="contactForm.invalid">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
      text-align: center;
    }

    .contact-info {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }

    .info-section {
      background: #f8f9fa;
      padding: 2rem;
      border-radius: 8px;
    }

    h2 {
      color: #444;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #eee;
    }

    p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      color: #666;
      margin-bottom: 1rem;
    }

    strong {
      color: #444;
      margin-right: 0.5rem;
    }

    a {
      color: #4CAF50;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #444;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .btn-submit {
      background: #4CAF50;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-submit:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .contact-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      // TODO: Implement form submission
      console.log('Form submitted:', this.contactForm.value);
    }
  }
} 